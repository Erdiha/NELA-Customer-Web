/* eslint-disable no-unused-vars */
// Create this file: src/components/GuestAccountPrompt.jsx

import React, { useState } from "react";
import { createUserAccount } from "../services/firebaseService";

const GuestAccountPrompt = ({
  customerDetails,
  onAccountCreated,
  onDismiss,
}) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Generate email from phone if not provided
    const email =
      customerDetails.email ||
      `${customerDetails.phone.replace(/\D/g, "")}@nela-guest.com`;

    try {
      const result = await createUserAccount(email, password, {
        name: customerDetails.name,
        email: email,
        phone: customerDetails.phone,
      });

      if (result.success) {
        onAccountCreated(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform animate-in fade-in zoom-in duration-300">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg
            className="w-8 h-8 text-white"
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

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Ride Booked! 🎉
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Create an account to track your ride and save 15% on your next trip!
        </p>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Track your current ride in real-time</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>View ride history and receipts</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Save favorite locations</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Get 15% off</strong> your next ride
              </span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Quick Account Form */}
        <form onSubmit={handleCreateAccount} className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Create Password (6+ characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Enter a secure password"
              minLength="6"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              We'll use your phone number as your login
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account & Track Ride"}
          </button>
        </form>

        {/* Skip Option */}
        <button
          onClick={onDismiss}
          className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
        >
          Skip for now
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          You can track your ride via SMS link
        </p>
      </div>
    </div>
  );
};

export default GuestAccountPrompt;
