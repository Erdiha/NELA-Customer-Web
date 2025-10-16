// components/PaymentOptions.jsx
// Unified payment selection - works with all payment methods

import React, { useState } from "react";

const PaymentOptions = ({ totalFare, onPaymentSelect, onBack }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Charged automatically when trip ends",
      icon: "💳",
      badge: "Recommended",
      badgeColor: "bg-green-100 text-green-700",
      disabled: false,
    },
    {
      id: "cash",
      name: "Cash",
      description: "Pay driver directly",
      icon: "💰",
      disabled: false,
    },
    {
      id: "venmo",
      name: "Venmo",
      description: "Coming soon - check back later!",
      icon: "📱",
      badge: "Coming Soon",
      badgeColor: "bg-gray-100 text-gray-600",
      disabled: true,
    },
    {
      id: "cashapp",
      name: "Cash App",
      description: "Coming soon - check back later!",
      icon: "💵",
      badge: "Coming Soon",
      badgeColor: "bg-gray-100 text-gray-600",
      disabled: true,
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Coming soon - check back later!",
      icon: "🅿️",
      badge: "Coming Soon",
      badgeColor: "bg-gray-100 text-gray-600",
      disabled: true,
    },
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    onPaymentSelect(method);
  };

  return (
    <div className="w-full  max-h-[80vh] md:max-h-[90vh] overflow-y-auto p-2 ">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-center mb-2">
          Choose Payment Method
        </h3>
        <p className="text-center text-gray-600 text-sm">
          Select how you'd like to pay for your ride
        </p>
      </div>

      {/* Total Amount */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl md:p-6 mb-6 border-2 border-green-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Trip Total</p>
          <p className="text-4xl font-bold text-green-600">${totalFare}</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-1 mb-6 min-h-full overflow-y-auto h-full w-full">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => !method.disabled && handleMethodSelect(method)}
            disabled={method.disabled}
            className={`w-full p-5 rounded-2xl border-2 transition-all text-left relative group ${
              method.disabled
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : "hover:shadow-lg"
            } ${
              selectedMethod?.id === method.id
                ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.02]"
                : "border-gray-200 hover:border-blue-300 bg-white"
            }`}
          >
            {/* Badge */}
            {method.badge && (
              <div className="absolute md:top-3 md:right-3 top-[-3px] right-[-3px] ">
                <span
                  className={`text-xs md:font-bold px-3 py-1 rounded-full ${method.badgeColor}`}
                >
                  {method.badge}
                </span>
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`text-4xl transition-transform group-hover:scale-110 ${
                  selectedMethod?.id === method.id ? "scale-110" : ""
                }`}
              >
                {method.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="font-bold text-lg text-gray-900 mb-1">
                  {method.name}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {method.description}
                </div>

                {/* Payment Details */}
                {method.username && (
                  <div className="text-xs text-gray-500">
                    Username:{" "}
                    <span className="font-mono font-semibold">
                      {method.username}
                    </span>
                  </div>
                )}
                {method.cashtag && (
                  <div className="text-xs text-gray-500">
                    Cashtag:{" "}
                    <span className="font-mono font-semibold">
                      {method.cashtag}
                    </span>
                  </div>
                )}
                {method.email && (
                  <div className="text-xs text-gray-500">
                    Email:{" "}
                    <span className="font-mono font-semibold">
                      {method.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Checkmark */}
              {selectedMethod?.id === method.id && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Card Payment Notice */}
            {method.id === "card" && selectedMethod?.id === method.id && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-start gap-2 text-xs text-blue-700">
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold mb-1">
                      How card payment works:
                    </p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>We'll pre-authorize ${totalFare} on your card</li>
                      <li>Actual charge happens when trip completes</li>
                      <li>If cancelled, pre-auth is released automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Peer-to-Peer Notice */}
            {["venmo", "cashapp", "paypal"].includes(method.id) &&
              selectedMethod?.id === method.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>
                      You'll receive a payment request link via text when your
                      trip completes. Please pay within 24 hours.
                    </p>
                  </div>
                </div>
              )}
          </button>
        ))}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0"
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
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Secure Payment
            </p>
            <p className="text-xs text-blue-700">
              {selectedMethod?.id === "card"
                ? "Card payments secured by Stripe. Your information is encrypted and never stored."
                : "All payment methods are secure. Choose the one you're most comfortable with."}
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl transition-all font-semibold"
        >
          ← Back to Pricing
        </button>
      )}
    </div>
  );
};

export default PaymentOptions;
