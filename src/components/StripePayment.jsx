// components/StripePayment.jsx
// Customer-facing payment component with card input

import React, { useState } from "react";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const StripePayment = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");

  // Format card number (add spaces every 4 digits)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : value;
  };

  // Format expiry (MM/YY)
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace(/\//g, "").length <= 4) {
      setExpiry(formatted);
    }
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 4) {
      setCvc(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      const cardNum = cardNumber.replace(/\s/g, "");
      if (cardNum.length < 13 || cardNum.length > 19) {
        throw new Error("Invalid card number");
      }

      const [expMonth, expYear] = expiry.split("/");
      if (
        !expMonth ||
        !expYear ||
        expMonth.length !== 2 ||
        expYear.length !== 2
      ) {
        throw new Error("Invalid expiry date");
      }

      if (cvc.length < 3 || cvc.length > 4) {
        throw new Error("Invalid CVC");
      }

      // Create token with Stripe
      const tokenResponse = await fetch("https://api.stripe.com/v1/tokens", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${STRIPE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "card[number]": cardNum,
          "card[exp_month]": expMonth,
          "card[exp_year]": `20${expYear}`,
          "card[cvc]": cvc,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(tokenData.error.message);
      }

      console.log("✅ Stripe token created:", tokenData.id);

      // Pass token to parent component
      onPaymentSuccess({
        token: tokenData.id,
        card: tokenData.card,
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
    <div className="stripe-payment-form">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Card Payment</h3>
        <p className="text-sm text-gray-600">
          Total:{" "}
          <span className="font-bold text-xl text-green-600">${amount}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Pre-authorized now, charged when trip completes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Card Number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-lg"
            required
          />
        </div>

        {/* Expiry and CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expiry
            </label>
            <input
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              value={cvc}
              onChange={handleCvcChange}
              placeholder="123"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-lg"
              required
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-xs text-blue-700">
              Secured by Stripe. Your card info is never stored.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Pre-authorize $${amount}`
          )}
        </button>

        {/* Test Card Info */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
          <p className="text-xs text-yellow-800 font-semibold mb-1">
            Test Mode:
          </p>
          <p className="text-xs text-yellow-700">
            Use card: 4242 4242 4242 4242, any future expiry, any CVC
          </p>
        </div>
      </form>
    </div>
  );
};

export default StripePayment;
