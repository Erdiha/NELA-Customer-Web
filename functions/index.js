/* eslint-disable no-unused-vars */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { defineSecret } from "firebase-functions/params";
import { getFirestore } from "firebase-admin/firestore";
import twilio from "twilio";
import Stripe from "stripe";

// ---- Init ----
initializeApp();
const db = getFirestore();

// ---- Secrets ----
const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioPhone = defineSecret("TWILIO_PHONE_NUMBER");
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");

const nelaVenmo = defineSecret("NELA_VENMO_USERNAME");

export const getRidePaymentInfo = onCall(
  { secrets: [nelaVenmo] },
  async (req) => {
    requireAuth(req); // ✅ Only authenticated users
    const { rideId } = req.data || {};

    if (!rideId) throw new HttpsError("invalid-argument", "Missing rideId");

    // ✅ Verify user is actually part of this ride
    const rideSnap = await db.collection("rides").doc(rideId).get();
    if (!rideSnap.exists) throw new HttpsError("not-found", "Ride not found");

    const ride = rideSnap.data();
    const uid = req.auth.uid;

    // Only rider or driver can see payment info
    if (ride.customerId !== uid && ride.driverId !== uid) {
      throw new HttpsError("permission-denied", "Not authorized");
    }

    return {
      venmoUsername: nelaVenmo.value(),
      amount: ride.estimatedPrice,
      rideId: rideId,
    };
  }
);

// ---- Helpers ----
const stripeClient = () =>
  new Stripe(stripeSecret.value(), { apiVersion: "2024-06-20" });

const requireAuth = (ctx) => {
  if (!ctx?.auth?.uid)
    throw new HttpsError("unauthenticated", "Sign in required");
  return ctx.auth.uid;
};

const cents = (amount) => {
  const v = Math.round(Number(amount) * 100);
  if (!Number.isInteger(v) || v < 50)
    throw new HttpsError("invalid-argument", "Bad amount");
  return v;
};

// ✅ NEW: Generate payment links for peer-to-peer apps
const generatePaymentLink = (paymentMethod, amount, rideId) => {
  const fare = parseFloat(amount);
  const description = `NELA Ride ${rideId}`;

  switch (paymentMethod.id) {
    case "venmo": {
      // Venmo deep link format
      const venmoNote = encodeURIComponent(
        `${description} - Thanks for riding!`
      );
      return `venmo://paycharge?txn=pay&recipients=nela-driver&amount=${fare}&note=${venmoNote}`;
    }

    case "cashapp": {
      // Cash App deep link format
      const cashNote = encodeURIComponent(description);
      return `https://cash.app/$NELADriver/${fare}/${cashNote}`;
    }

    case "paypal":
      // PayPal.me link format
      return `https://paypal.me/NELADriver/${fare}`;

    default:
      return null;
  }
};

// ======================= SMS =======================
export const sendSMSv2 = onCall(
  { secrets: [twilioAccountSid, twilioAuthToken, twilioPhone] },
  async (req) => {
    requireAuth(req);
    const { to, message } = req.data || {};
    if (!to || !message)
      throw new HttpsError("invalid-argument", "Phone and message required");
    const client = twilio(twilioAccountSid.value(), twilioAuthToken.value());
    const result = await client.messages.create({
      body: message,
      to,
      from: twilioPhone.value(),
    });
    return { success: true, messageId: result.sid };
  }
);

export const onRideStatusChangev2 = onDocumentUpdated(
  {
    document: "rides/{rideId}",
    secrets: [twilioAccountSid, twilioAuthToken, twilioPhone, stripeSecret],
  },

  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    console.log("🔍 Function triggered for ride:", event.params.rideId);
    console.log(
      "🔍 Status changed from:",
      before?.status,
      "to:",
      after?.status
    );

    if (!before || !after || before.status === after.status) {
      console.log("🔍 Exiting - no status change");
      return;
    }

    const phone = after.customerPhone;
    const rideId = event.params.rideId;

    // ✅ PAYMENT PROCESSING WHEN RIDE COMPLETES
    if (after.status === "completed") {
      console.log("🔍 Ride completed, checking payment method");

      // Handle card payments
      if (after.cardToken && after.paymentStatus === "card_on_file") {
        console.log("💳 Processing card payment for completed ride:", rideId);

        try {
          const stripe = stripeClient();
          const charge = await stripe.charges.create({
            amount: Math.round(
              parseFloat(after.estimatedPrice || after.fare || 0) * 100
            ),
            currency: "usd",
            source: after.cardToken,
            description: `NELA Ride ${rideId} - Trip completed`,
            metadata: {
              rideId: rideId,
              customerPhone: phone,
              pickupAddress: after.pickupAddress || "",
              destinationAddress: after.destinationAddress || "",
            },
          });

          await event.data.after.ref.update({
            paymentStatus: "charged",
            stripeChargeId: charge.id,
            finalAmount: charge.amount / 100,
            paymentCompletedAt: new Date(),
          });

          console.log("✅ Card payment successful:", charge.id);
        } catch (paymentError) {
          console.error("❌ Card payment failed:", paymentError);
          await event.data.after.ref.update({
            paymentStatus: "failed",
            paymentError: paymentError.message,
            paymentFailedAt: new Date(),
          });
        }
      }

      // ✅ Handle peer-to-peer payments (Venmo, PayPal, Cash App)
      else if (
        after.paymentMethod &&
        ["venmo", "cashapp", "paypal"].includes(after.paymentMethod.id)
      ) {
        console.log(
          "📱 Generating payment link for:",
          after.paymentMethod.name
        );

        const paymentLink = generatePaymentLink(
          after.paymentMethod,
          after.estimatedPrice || after.fare,
          rideId
        );

        if (paymentLink) {
          // Update ride with payment link
          await event.data.after.ref.update({
            paymentStatus: "link_sent",
            paymentLink: paymentLink,
            paymentLinkSentAt: new Date(),
          });

          console.log("✅ Payment link generated:", paymentLink);
        }
      }
    }

    // ✅ SMS NOTIFICATIONS
    if (!phone) return;

    const client = twilio(twilioAccountSid.value(), twilioAuthToken.value());
    let msg = "",
      send = false;

    switch (after.status) {
      case "accepted": {
        send = true;
        const v = after.driverVehicle || {};
        const vehicleInfo = `${v.year || ""} ${v.color || ""} ${v.make || ""} ${
          v.model || ""
        } (${v.licensePlate || "N/A"})`.trim();
        msg = after.isScheduled
          ? `Your NELA ride is confirmed! ${
              after.driverName || "Your driver"
            } at ${new Date(
              after.scheduledDateTime
            ).toLocaleString()}. Vehicle: ${vehicleInfo}`
          : `Your NELA driver ${
              after.driverName || ""
            } is on the way! Vehicle: ${vehicleInfo}.`;
        break;
      }
      case "arrived":
        send = true;
        msg = `${after.driverName || "Your driver"} has arrived! Look for the ${
          after?.driverVehicle?.color || ""
        } ${after?.driverVehicle?.make || ""} ${
          after?.driverVehicle?.model || ""
        }`.trim();
        break;
      case "in_progress":
        send = false;
        break;
      case "completed": {
        send = true;
        const venmoUsername = nelaVenmo.value();
        const amount = after.estimatedPrice || after.fare || "0.00";
        const rideId = event.params.rideId;

        const venmoLink = `https://venmo.com/${venmoUsername}?txn=pay&amount=${amount}&note=NELA%20Ride%20${rideId}`;

        // ✅ CUSTOM MESSAGE BASED ON PAYMENT METHOD
        if (after.paymentMethod?.id === "card") {
          msg = `Trip completed! Thanks for riding with NELA. Total: $${
            after.estimatedPrice || after.fare || "0.00"
          }. Your card has been charged.`;
        } else if (after.paymentMethod?.id === "cash") {
          msg = `Trip completed! Thanks for riding with NELA. Total: $${
            after.estimatedPrice || after.fare || "0.00"
          }. Cash payment - all set!`;
        } else if (
          ["venmo", "cashapp", "paypal"].includes(after.paymentMethod?.id)
        ) {
          const paymentLink = after.paymentLink;
          msg = `Trip completed! Thanks for riding with NELA. Total: $${
            after.estimatedPrice || after.fare || "0.00"
          }. Pay with ${after.paymentMethod.name}: ${paymentLink}`;
        } else {
          msg = `Trip completed! Thanks for riding with NELA. Total: $${
            after.estimatedPrice || after.fare || "0.00"
          }.`;
        }
        break;
      }
      case "cancelled":
        send = true;
        msg = `Your NELA ride has been cancelled. ${
          after.cancelReason || ""
        }`.trim();
        break;
      case "no_driver_available":
        send = true;
        msg = `No drivers available right now. Please try again soon.`;
        break;
      default:
        return;
    }

    if (send && msg) {
      await client.messages.create({
        body: msg,
        to: phone,
        from: twilioPhone.value(),
      });
    }
  }
);

// ======================= STRIPE FUNCTIONS (keep existing) =======================
export const ensureStripeCustomer = onCall(
  { secrets: [stripeSecret] },
  async (req) => {
    const uid = requireAuth(req);
    const { riderUid = uid, email, name } = req.data || {};
    const stripe = stripeClient();

    const userRef = db.collection("users").doc(riderUid);
    const snap = await userRef.get();
    let stripeCustomerId = snap.exists
      ? snap.data().stripeCustomerId
      : undefined;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        name: name || undefined,
        metadata: { riderUid },
      });
      stripeCustomerId = customer.id;
      await userRef.set({ stripeCustomerId }, { merge: true });
    }

    const pms = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
      limit: 1,
    });
    return { stripeCustomerId, hasDefaultPaymentMethod: pms.data.length > 0 };
  }
);

export const authorizeRide = onCall(
  { secrets: [stripeSecret] },
  async (req) => {
    const uid = requireAuth(req);
    const { rideId, riderUid = uid } = req.data || {};
    if (!rideId) throw new HttpsError("invalid-argument", "rideId required");

    const stripe = stripeClient();
    const rideRef = db.collection("rides").doc(rideId);
    const rideSnap = await rideRef.get();
    if (!rideSnap.exists) throw new HttpsError("not-found", "Ride not found");
    const ride = rideSnap.data();

    const userSnap = await db.collection("users").doc(riderUid).get();
    const stripeCustomerId = userSnap.exists
      ? userSnap.data().stripeCustomerId
      : undefined;
    if (!stripeCustomerId)
      throw new HttpsError("failed-precondition", "No Stripe customer");

    const estimate = Number(ride?.fare?.estimate || ride?.estimatedPrice || 0);
    const base = Math.round(estimate * 100);
    const amount = Math.max(50, Math.round(base * 1.15));

    const pi = await stripe.paymentIntents.create(
      {
        amount,
        currency: "usd",
        customer: stripeCustomerId,
        capture_method: "manual",
        automatic_payment_methods: { enabled: true },
        metadata: { rideId, riderUid },
      },
      { idempotencyKey: `auth_${rideId}` }
    );

    await rideRef.set(
      {
        payment: {
          method: "card",
          paymentIntentId: pi.id,
          status: "requires_confirmation",
          amountAuthorized: amount,
          currency: "usd",
          isTest: true,
        },
      },
      { merge: true }
    );

    return { clientSecret: pi.client_secret, paymentIntentId: pi.id, amount };
  }
);

export const initializePayment = onCall(
  { secrets: [stripeSecret] },
  async (req) => {
    const uid = requireAuth(req);
    const { amount, customerEmail, rideId } = req.data || {};
    if (!amount || !customerEmail || !rideId)
      throw new HttpsError("invalid-argument", "Missing fields");

    const stripe = stripeClient();

    const userRef = db.collection("users").doc(uid);
    let stripeCustomerId = (await userRef.get()).data()?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: { riderUid: uid },
      });
      stripeCustomerId = customer.id;
      await userRef.set({ stripeCustomerId }, { merge: true });
    }

    const amountCents = cents(amount);
    const pi = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: "usd",
        customer: stripeCustomerId,
        capture_method: "manual",
        automatic_payment_methods: { enabled: true },
        receipt_email: customerEmail,
        description: `NELA Ride ${rideId}`,
        metadata: { project: "NELA", rideId, riderUid: uid },
      },
      { idempotencyKey: `init_${rideId}` }
    );

    return {
      success: true,
      paymentIntentId: pi.id,
      clientSecret: pi.client_secret,
      amount,
    };
  }
);

export const capturePayment = onCall(
  { secrets: [stripeSecret] },
  async (req) => {
    requireAuth(req);
    const { paymentIntentId, finalAmount } = req.data || {};
    if (!paymentIntentId || !finalAmount)
      throw new HttpsError(
        "invalid-argument",
        "Missing payment intent or amount"
      );
    const stripe = stripeClient();
    const result = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: cents(finalAmount),
    });
    return {
      success: true,
      paymentIntentId: result.id,
      amount: finalAmount,
      status: result.status,
    };
  }
);

export const cancelPayment = onCall(
  { secrets: [stripeSecret] },
  async (req) => {
    requireAuth(req);
    const { paymentIntentId } = req.data || {};
    if (!paymentIntentId)
      throw new HttpsError("invalid-argument", "Missing payment intent ID");
    const stripe = stripeClient();
    const result = await stripe.paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: "requested_by_customer",
    });
    return { success: true, status: result.status, paymentIntentId: result.id };
  }
);
