/* eslint-disable no-unused-vars */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { defineSecret } from "firebase-functions/params";
import twilio from "twilio";

initializeApp();

// Define secrets
const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioPhone = defineSecret("TWILIO_PHONE_NUMBER");

// Manual SMS function (for booking confirmations)
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

      console.log("✅ SMS sent successfully:", result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error("❌ SMS error:", error);
      throw new HttpsError("internal", error.message);
    }
  }
);

// Auto SMS on ride status change
// SMS ONLY - Email handled by driver app
export const onRideStatusChangev2 = onDocumentUpdated(
  {
    document: "rides/{rideId}",
    secrets: [twilioAccountSid, twilioAuthToken, twilioPhone],
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    // Only proceed if status actually changed
    if (before.status === after.status) {
      console.log("Status unchanged, skipping notification");
      return;
    }

    const phone = after.customerPhone;
    if (!phone) {
      console.warn("⚠️ No customer phone, skipping SMS");
      return;
    }

    const client = twilio(twilioAccountSid.value(), twilioAuthToken.value());

    let message = "";
    let shouldSendSMS = false;

    // SMS Flow: Accepted, Arrived, Completed only
    switch (after.status) {
      case "accepted": {
        shouldSendSMS = true;
        const vehicleInfo = after.driverVehicle
          ? `${after.driverVehicle.year || ""} ${
              after.driverVehicle.color || ""
            } ${after.driverVehicle.make || ""} ${
              after.driverVehicle.model || ""
            } (${after.driverVehicle.licensePlate || "N/A"})`.trim()
          : "your ride";

        message = after.isScheduled
          ? `Your NELA ride is confirmed! ${
              after.driverName || "Your driver"
            } will pick you up at ${new Date(
              after.scheduledDateTime
            ).toLocaleString()}. Vehicle: ${vehicleInfo}`
          : `Your NELA driver ${
              after.driverName || "is"
            } on the way! Vehicle: ${vehicleInfo}. ETA: 8 minutes.`;
        break;
      }

      case "arrived":
        shouldSendSMS = true;
        message = `${
          after.driverName || "Your driver"
        } has arrived! Look for the ${after.driverVehicle?.color || ""} ${
          after.driverVehicle?.make || ""
        } ${after.driverVehicle?.model || ""}`.trim();
        break;

      case "in_progress":
        // No SMS - customer is in the car
        console.log("📱 Trip started - No SMS (customer in car)");
        shouldSendSMS = false;
        break;

      case "completed":
        shouldSendSMS = true;
        message = `Trip completed! Thanks for riding with NELA. Total: $${
          after.estimatedPrice || after.fare || "0.00"
        }. Check your email for receipt.`;
        break;

      case "cancelled":
        shouldSendSMS = true;
        message = `Your NELA ride has been cancelled. ${
          after.cancelReason || "We apologize for the inconvenience."
        } Book again anytime!`;
        break;

      case "no_driver_available":
        shouldSendSMS = true;
        message = `No drivers available right now. Please try booking again in a few minutes. We apologize for the inconvenience.`;
        break;

      default:
        console.log(`ℹ️ Status '${after.status}' - No SMS needed`);
        return;
    }

    // Send SMS if needed
    if (shouldSendSMS && message) {
      try {
        const result = await client.messages.create({
          body: message,
          to: phone,
          from: twilioPhone.value(),
        });
        console.log(
          `✅ SMS sent successfully for ${after.status}:`,
          result.sid
        );
        console.log(`   To: ${phone}`);
      } catch (error) {
        console.error(`❌ SMS failed for ${after.status}:`, error.message);
        // Don't throw - log error but don't break the function
      }
    }
  }
);
