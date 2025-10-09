/* eslint-disable no-unused-vars */
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

// ✅ FIXED: Actual SMS sending via Firebase Functions
const sendSMSFunction = httpsCallable(functions, "sendSMSv2");

export async function sendSMS(to, message) {
  try {
    console.log("📱 Sending SMS to:", to);
    console.log("📄 Message:", message);

    // Call Firebase Function to send SMS
    const result = await sendSMSFunction({ to, message });

    console.log("✅ SMS sent successfully:", result.data);

    return {
      success: true,
      messageId: result.data.messageId,
      status: result.data.status,
    };
  } catch (error) {
    console.error("❌ SMS failed:", error);

    // Fallback: Log for manual follow-up
    console.warn("📝 MANUAL SMS NEEDED:");
    console.warn(`   To: ${to}`);
    console.warn(`   Message: ${message}`);

    return {
      success: false,
      error: error.message,
      fallback: true,
    };
  }
}

export const SMS_TEMPLATES = {
  rideBooked: (trackingUrl) =>
    `🚗 NELA ride booked! Track your driver: ${trackingUrl}`,

  onTheWay: (driverName, eta) =>
    `Hi! Your NELA driver ${driverName} is on the way. ETA: ${eta} minutes.`,

  arrived: (driverName, vehicleInfo) =>
    `Your NELA driver ${driverName} has arrived! Vehicle: ${vehicleInfo}. Look for us outside.`,

  pickedUp: (driverName, destination) =>
    `Trip started! ${driverName} is taking you to ${destination}. Enjoy your ride!`,

  completed: (driverName, fare) =>
    `Trip completed! Thanks for riding with NELA. Fare: $${fare}. Rate your experience!`,

  cancelled: (reason) =>
    `Your NELA ride has been cancelled. ${
      reason || "We apologize for the inconvenience."
    } Book another ride anytime!`,
};
