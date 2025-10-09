/* eslint-disable no-unused-vars */
// STEP 1.5 FIX: Added proper logout functionality
// Removed localStorage usage

import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { updateUserProfile, signOutUser } from "../services/firebaseService";

const AccountDashboard = ({
  user,
  setCurrentPage,
  onLogout,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [rideHistory, setRideHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalRides: 0,
    totalSaved: 0,
    avgRating: 0,
    memberSince: null,
  });
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user?.uid) return;

    try {
      // Load user stats
      setStats({
        totalRides: user.totalRides || 0,
        totalSaved: user.totalSaved || 0,
        avgRating: user.avgRating || 5.0,
        memberSince: user.createdAt || new Date().toISOString(),
      });

      // Load ride history from Firebase
      const ridesQuery = query(
        collection(db, "rides"),
        where("customerPhone", "==", user.phone),
        orderBy("createdAt", "desc")
      );

      onSnapshot(ridesQuery, (snapshot) => {
        const rides = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt:
            doc.data().createdAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
        }));
        setRideHistory(rides.slice(0, 5));
      });

      // Load favorites
      setFavorites(user.favorites || []);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      let date;
      if (dateString.toDate) {
        date = dateString.toDate();
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return "N/A";

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRideStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      case "in_progress":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // FIXED: Proper logout with Firebase signOut
  const handleLogout = async () => {
    try {
      await signOutUser();
      onLogout(); // This will update App.jsx state
      setCurrentPage("home");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error signing out. Please try again.");
    }
  };

  const ProfileHeader = () => (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 mx-auto sm:mx-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {user.name}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">{user.email}</p>
          <p className="text-gray-500 text-sm">{user.phone}</p>
        </div>
        <button
          onClick={() => setShowEditProfile(true)}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600 mx-auto sm:mx-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Since {formatDate(stats.memberSince)}</span>
        </div>
      </div>
    </div>
  );

  const StatsCards = () => (
    <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
        <div className="text-xl sm:text-2xl font-bold text-blue-600">
          {stats.totalRides}
        </div>
        <div className="text-sm text-gray-600">Total Rides</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
        <div className="text-xl sm:text-2xl font-bold text-green-600">
          ${stats.totalSaved}
        </div>
        <div className="text-sm text-gray-600">Saved</div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
        <div className="text-xl sm:text-2xl font-bold text-yellow-600">
          {stats.avgRating}
        </div>
        <div className="text-sm text-gray-600">Avg Rating</div>
      </div>
    </div>
  );

  const TabNavigation = () => (
    <div className="bg-gray-100 rounded-xl p-1 mb-4 sm:mb-6 overflow-x-auto">
      <div className="flex min-w-max">
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "rides", label: "Rides", icon: "🚗" },
          { id: "settings", label: "Settings", icon: "⚙️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[80px] flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-3 sm:px-4 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-white shadow-sm text-blue-600 font-medium border-[1px] border-black"
                : "text-gray-600 hover:text-gray-800 border-[1px] border-none"
            }`}
          >
            <span className="text-sm sm:text-base">{tab.icon}</span>
            <span className="text-xs sm:text-sm">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {rideHistory.length > 0 ? (
          <div className="space-y-3">
            {rideHistory.slice(0, 3).map((ride, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {ride.destinationAddress?.split(",")[0] || "Recent Trip"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(ride.createdAt)} • ${ride.estimatedPrice}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getRideStatusColor(
                    ride.status || "completed"
                  )}`}
                >
                  {ride.status || "Completed"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">No rides yet</p>
            <p className="text-xs sm:text-sm text-gray-400">
              Book your first ride to get started
            </p>
            <button
              onClick={() => setCurrentPage("home")}
              type="button"
              className="mt-4 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Book Your First Ride
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const RidesTab = () => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold">Ride History</h3>
        <p className="text-sm text-gray-500">Your recent trips with NELA</p>
      </div>
      <div className="divide-y divide-gray-100">
        {rideHistory.length > 0 ? (
          rideHistory.map((ride, index) => (
            <div
              key={index}
              className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="font-medium">
                      {ride.destinationAddress?.split(",")[0] || "Trip"}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium mt-2 sm:mt-0 inline-block ${getRideStatusColor(
                        ride.status || "completed"
                      )}`}
                    >
                      {ride.status || "Completed"}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      📍 From: {ride.pickupAddress?.split(",")[0] || "Unknown"}
                    </p>
                    <p>
                      🎯 To:{" "}
                      {ride.destinationAddress?.split(",")[0] || "Unknown"}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                      <span>
                        {formatDate(ride.createdAt)} at{" "}
                        {formatTime(ride.createdAt)}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-semibold text-green-600">
                        ${ride.estimatedPrice}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>{ride.distance || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No rides yet
            </h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              Start your journey with NELA
            </p>
            <button
              onClick={() => setCurrentPage("home")}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Book Your First Ride
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Account Settings</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium">Edit Profile</p>
                <p className="text-sm text-gray-500">
                  Update your personal information
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">Payment Methods</p>
                <p className="text-sm text-gray-500">
                  Manage your payment options
                </p>
              </div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "rides":
        return <RidesTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex flex-col p-1 max-w-full min-h-[90vh] w-full md:max-w-2xl justify-center my-10 md:mx-0">
      <ProfileHeader />
      <StatsCards />
      <TabNavigation />
      {renderTabContent()}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md mx-4">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Edit Profile</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updates = {
                  name: formData.get("name"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                };

                const result = await updateUserProfile(user.uid, updates);
                if (result.success) {
                  const updatedUser = { ...user, ...updates };
                  onUpdateProfile(updatedUser);
                  setShowEditProfile(false);
                } else {
                  alert("Error updating profile: " + result.error);
                }
              }}
            >
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={user.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDashboard;
