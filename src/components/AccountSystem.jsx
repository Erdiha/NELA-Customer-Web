import React, { useState, useEffect } from "react";
import {
  createUserAccount,
  signInUser,
  onAuthStateChange,
} from "../services/firebaseService";

const AccountSystem = ({ onLogin, onSkip }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FIXED: Single auth listener - no localStorage
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        console.log("Auth state changed, user logged in:", user.name);
        onLogin(user);
      }
    });

    return () => unsubscribe();
  }, [onLogin]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const result = await signInUser(formData.email, formData.password);
        if (result.success) {
          // onLogin will be called by onAuthStateChange listener
          console.log("Login successful");
        } else {
          setError(result.error);
        }
      } else {
        const result = await createUserAccount(
          formData.email,
          formData.password,
          formData
        );
        if (result.success) {
          // onLogin will be called by onAuthStateChange listener
          console.log("Account created successfully");
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-system w-full max-w-md lg:max-w-lg">
      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {isLogin
            ? "Sign in to your NELA account"
            : "Join NELA for faster bookings"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onFocus={(e) =>
                setTimeout(
                  () =>
                    e.target.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    }),
                  300
                )
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm sm:text-base"
              placeholder="Enter your full name"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onFocus={(e) =>
              setTimeout(
                () =>
                  e.target.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  }),
                300
              )
            }
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm sm:text-base"
            placeholder="Enter your email"
            required
          />
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onFocus={(e) =>
                setTimeout(
                  () =>
                    e.target.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    }),
                  300
                )
              }
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm sm:text-base"
              placeholder="(555) 123-4567"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={(e) =>
              setTimeout(
                () =>
                  e.target.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  }),
                300
              )
            }
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm sm:text-base"
            placeholder="Enter your password"
            required
            minLength="6"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 px-4 rounded-xl sm:rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </div>
          ) : isLogin ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({
                email: "",
                password: "",
                name: "",
                phone: "",
              });
            }}
            className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="text-center border-t border-gray-200 pt-4 mt-6">
          <button
            type="button"
            onClick={onSkip}
            className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            Continue as guest
          </button>
        </div>
      </form>

      <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 sm:p-4 border border-gray-100">
        <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
          Account Benefits:
        </h4>
        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Faster booking with saved info</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Ride history and receipts</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Favorite locations</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Premium member discounts</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AccountSystem;
