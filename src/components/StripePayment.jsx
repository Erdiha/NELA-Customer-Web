import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CardForm = ({ amount, onPaymentSuccess, onPaymentError }) => {
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

      const { token, error } = await stripe.createToken(cardElement);

      if (error) {
        throw new Error(error.message);
      }

      console.log("✅ Stripe token created:", token.id);
      onPaymentSuccess({
        token: token.id,
        card: token.card,
        amount: amount,
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
          Total:{" "}
          <span className="font-bold text-xl text-green-600">${amount}</span>
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
        {loading ? "Processing..." : `Pre-authorize $${amount}`}
      </button>
    </form>
  );
};

const StripePayment = ({ amount, onPaymentSuccess, onPaymentError }) => {
  return (
    <Elements stripe={stripePromise}>
      <CardForm
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripePayment;
