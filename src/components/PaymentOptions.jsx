import React, { useState } from "react";

const PaymentOptions = ({ totalFare, onPaymentSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const paymentMethods = [
    {
      id: "venmo",
      name: "Venmo",
      description: "Pay with Venmo",
    },
    {
      id: "cashapp",
      name: "Cash App",
      description: "Pay with Cash App",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pay with PayPal",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Pay with card",
    },
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    onPaymentSelect(method);
  };

  return (
    <div className="w-full">
      <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center">
        Choose Payment
      </h3>
      <p className="text-gray-600 text-sm sm:text-base text-center mb-6">
        Select how you'd like to pay
      </p>

      <div className="space-y-3 mb-6">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method)}
            className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all text-left ${
              selectedMethod?.id === method.id
                ? "border-blue-500 bg-blue-50 shadow-lg"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl sm:text-4xl">{method.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-base sm:text-lg text-gray-900">
                  {method.name}
                </div>
                <div className="text-sm text-gray-600">
                  {method.description}
                </div>
              </div>
              {selectedMethod?.id === method.id && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedMethod && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total</span>
            <span className="text-2xl sm:text-3xl font-bold text-green-600">
              ${totalFare}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentOptions;
