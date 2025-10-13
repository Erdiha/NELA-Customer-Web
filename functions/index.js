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
    secrets: [twilioAccountSid, twilioAuthToken, twilioPhone],
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    if (!before || !after || before.status === after.status) return;

    const phone = after.customerPhone;
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
      case "completed":
        send = true;
        msg = `Trip completed! Thanks for riding with NELA. Total: $${
          after.estimatedPrice || after.fare || "0.00"
        }.`;
        break;
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

    if (send && msg)
      await client.messages.create({
        body: msg,
        to: phone,
        from: twilioPhone.value(),
      });
  }
);

// ======================= STRIPE =======================
/** Ensure a Stripe Customer for a rider and report if a saved card exists */
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

/** Create a manual-capture PaymentIntent (estimate + 15% buffer) */
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
    const amount = Math.max(50, Math.round(base * 1.15)); // 15% buffer

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

/** Legacy alias: create PI directly from amount/email (delegates to Stripe SDK). */
export const initializePayment = onCall(
  { secrets: [stripeSecret] },
  async (req) => {
    const uid = requireAuth(req);
    const { amount, customerEmail, rideId } = req.data || {};
    if (!amount || !customerEmail || !rideId)
      throw new HttpsError("invalid-argument", "Missing fields");

    const stripe = stripeClient();

    // Ensure customer (by email) or create minimal one:
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

/** Capture final amount (≤ authorized) */
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

/** Cancel a PaymentIntent */
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
