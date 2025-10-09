/* eslint-disable no-unused-vars */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { defineSecret } from "firebase-functions/params";
import twilio from "twilio";

initializeApp();

// Define secrets (not strings!)
const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioPhone = defineSecret("TWILIO_PHONE_NUMBER");

// Manual SMS function
export const sendSMSv2 = onCall(
  { secrets: [twilioAccountSid, twilioAuthToken, twilioPhone] },
  async (request) => {
    const { to, message } = request.data;

    if (!to || !message) {
      throw new HttpsError("invalid-argument", "Phone and message required");
    }

    const client = twilio(twilioAccountSid.value(), twilioAuthToken.value());

    try {
      const result = await client.messages.create({
        body: message,
        to: to,
        from: twilioPhone.value(),
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error("SMS error:", error);
      throw new HttpsError("internal", error.message);
    }
  }
);

// Auto SMS on ride status change
export const onRideStatusChangev2 = onDocumentUpdated(
  {
    document: "rides/{rideId}",
    secrets: [twilioAccountSid, twilioAuthToken, twilioPhone],
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (before.status === after.status) return;

    const phone = after.customerPhone;
    if (!phone) return;

    const client = twilio(twilioAccountSid.value(), twilioAuthToken.value());

    let message = "";

    switch (after.status) {
      case "accepted":
        message = `Your NELA driver ${after.driverName} is on the way! Vehicle: ${after.driverVehicle?.year} ${after.driverVehicle?.color} ${after.driverVehicle?.make} (${after.driverVehicle?.licensePlate})`;
        break;
      case "arrived":
        message = `${after.driverName} has arrived!`;
        break;
      case "in_progress":
        message = `Trip started! Heading to ${after.destinationAddress}`;
        break;
      case "completed":
        message = `Trip completed! Thanks for riding with NELA. Fare: $${after.estimatedPrice}`;
        break;
      case "cancelled":
        message = `Your ride has been cancelled. ${after.cancelReason || ""}`;
        break;
      case "no_driver_available":
        message = `No drivers available. Please try again soon.`;
        break;
      default:
        return;
    }

    try {
      await client.messages.create({
        body: message,
        to: phone,
        from: twilioPhone.value(),
      });
      console.log("✅ SMS sent successfully to", phone);
    } catch (error) {
      console.error("SMS failed:", error);
    }
  }
);
