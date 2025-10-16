import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CardForm = ({
  amount,
  customerEmail,
  rideId,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    try {
      const cardElement = elements.getElement(CardElement);

      // Step 1: Call cloud function to create PaymentIntent
      console.log("🔵 Creating PaymentIntent...");
      const initializePaymentFn = httpsCallable(functions, "initializePayment");
      const { data: paymentData } = await initializePaymentFn({
        amount: amount,
        customerEmail: customerEmail,
        rideId: rideId,
      });

      console.log("✅ PaymentIntent created:", paymentData.paymentIntentId);

      // Step 2: Confirm the PaymentIntent with card details
      console.log("🔵 Confirming PaymentIntent...");
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(paymentData.clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      console.log("✅ PaymentIntent confirmed:", paymentIntent.id);
      onPaymentSuccess({
        paymentIntentId: paymentIntent.id,
        amount: amount,
        status: paymentIntent.status,
      });
    } catch (err) {
      console.error("❌ Payment error:", err);
      setError(err.message);
      onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Card Payment</h3>
        <p className="text-sm text-gray-600">
          We'll pre-authorize{" "}
          <span className="font-bold text-xl text-green-600">${amount}</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Final charge happens when trip completes. If cancelled, hold is
          released automatically.
        </p>
      </div>

      <div className="p-4 border-2 border-gray-200 rounded-xl">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all disabled:opacity-50"
      >
        {loading ? "Processing..." : `Authorize $${amount}`}
      </button>
    </form>
  );
};

const StripePayment = ({
  amount,
  customerEmail,
  rideId,
  onPaymentSuccess,
  onPaymentError,
}) => {
  return (
    <Elements stripe={stripePromise}>
      <CardForm
        amount={amount}
        customerEmail={customerEmail}
        rideId={rideId}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripePayment;
