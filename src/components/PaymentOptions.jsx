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
    <div className="w-full max-h-[85vh] overflow-y-auto p-3 sm:p-4">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">
          Choose Payment Method
        </h3>
        <p className="text-center text-gray-600 text-xs sm:text-sm">
          Select how you'd like to pay for your ride
        </p>
      </div>

      {/* Total Amount */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-green-200">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Trip Total</p>
          <p className="text-3xl sm:text-4xl font-bold text-green-600">
            ${totalFare}
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => !method.disabled && handleMethodSelect(method)}
            disabled={method.disabled}
            className={`w-full p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 transition-all text-left relative group ${
              method.disabled
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : "hover:shadow-lg active:scale-[0.98]"
            } ${
              selectedMethod?.id === method.id
                ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.01]"
                : "border-gray-200 hover:border-blue-300 bg-white"
            }`}
          >
            {/* Badge */}
            {method.badge && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                <span
                  className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${method.badgeColor}`}
                >
                  {method.badge}
                </span>
              </div>
            )}

            <div className="flex items-start gap-3 sm:gap-4">
              {/* Icon */}
              <div
                className={`text-2xl sm:text-3xl md:text-4xl transition-transform group-hover:scale-110 flex-shrink-0 ${
                  selectedMethod?.id === method.id ? "scale-110" : ""
                }`}
              >
                {method.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base sm:text-lg text-gray-900 mb-0.5 sm:mb-1 pr-16 sm:pr-0">
                  {method.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                  {method.description}
                </div>

                {/* Payment Details */}
                {method.username && (
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    Username:{" "}
                    <span className="font-mono font-semibold">
                      {method.username}
                    </span>
                  </div>
                )}
                {method.cashtag && (
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    Cashtag:{" "}
                    <span className="font-mono font-semibold">
                      {method.cashtag}
                    </span>
                  </div>
                )}
                {method.email && (
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    Email:{" "}
                    <span className="font-mono font-semibold">
                      {method.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Checkmark */}
              {selectedMethod?.id === method.id && (
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-white"
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
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
                <div className="flex items-start gap-2 text-[10px] sm:text-xs text-blue-700">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5"
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
                    <ul className="space-y-0.5 sm:space-y-1 list-disc list-inside leading-tight">
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
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-2 text-[10px] sm:text-xs text-gray-600">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5"
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
                    <p className="leading-tight">
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
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0"
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
            <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">
              Secure Payment
            </p>
            <p className="text-[10px] sm:text-xs text-blue-700 leading-tight">
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
          className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all font-semibold text-sm sm:text-base"
        >
          ← Back to Pricing
        </button>
      )}
    </div>
  );
};

export default PaymentOptions;
