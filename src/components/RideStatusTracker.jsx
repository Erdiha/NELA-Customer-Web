// Add this to your customer web app
// Create as src/components/RideStatusTracker.jsx

import React, { useState, useEffect } from "react";
import { subscribeToRideUpdates } from "../services/firebaseService";

const RideStatusTracker = ({ rideId, onClose }) => {
  const [rideStatus, setRideStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rideId) return;

    const unsubscribe = subscribeToRideUpdates(rideId, (updatedRide) => {
      setRideStatus(updatedRide);
      setLoading(false);

      // Show browser notification when status changes
      if (updatedRide.status && Notification.permission === "granted") {
        showNotification(updatedRide);
      }
    });

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => unsubscribe();
  }, [rideId]);

  const showNotification = (ride) => {
    const statusMessages = {
      accepted: rideStatus.isScheduled
        ? `📅 Your ride is scheduled for ${new Date(
            rideStatus.scheduledDateTime
          ).toLocaleString()}`
        : `🚗 Your ride has been accepted! Driver is on the way.`,
      arrived: `📍 Your driver has arrived! Look for ${
        ride.vehicleInfo || "your ride"
      }.`,
      in_progress: `🚀 Trip started! Heading to ${ride.destination}.`,
      completed: `✅ Trip completed! Thanks for riding with NELA.`,
      cancelled: `❌ Your ride has been cancelled.`,
    };

    const message = statusMessages[ride.status];
    if (message) {
      new Notification("NELA Ride Update", {
        body: message,
        icon: "/favicon.ico",
      });
    }
  };
  const getStatusInfo = (status, isScheduled, scheduledDateTime) => {
    // For scheduled rides that are accepted
    if (status === "accepted" && isScheduled) {
      return {
        title: "Ride Scheduled",
        color: "#8B5CF6", // Purple for scheduled
        icon: "📅",
        description: `Scheduled for ${new Date(
          scheduledDateTime
        ).toLocaleString()}`,
      };
    }

    switch (status) {
      case "pending":
        return {
          title: "Finding Driver...",
          color: "#F59E0B",
          icon: "🔍",
          description: "Looking for available drivers in your area",
        };
      case "accepted":
        return {
          title: "Driver Found!",
          color: "#3B82F6",
          icon: "🚗",
          description: "Your driver is on the way to pickup",
        };
      case "arrived":
        return {
          title: "Driver Arrived",
          color: "#F59E0B",
          icon: "📍",
          description: "Your driver is waiting at the pickup location",
        };
      case "in_progress":
        return {
          title: "Trip in Progress",
          color: "#10B981",
          icon: "🛣️",
          description: "On your way to destination",
        };
      case "completed":
        return {
          title: "Trip Completed",
          color: "#10B981",
          icon: "✅",
          description: "You have arrived safely!",
        };
      case "cancelled":
        return {
          title: "Trip Cancelled",
          color: "#EF4444",
          icon: "❌",
          description: "Your ride has been cancelled",
        };
      default:
        return {
          title: "Processing...",
          color: "#6B7280",
          icon: "⏳",
          description: "Processing your request",
        };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ride status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!rideStatus) {
    return null;
  }

  const statusInfo = getStatusInfo(
    rideStatus.status,
    rideStatus.isScheduled,
    rideStatus.scheduledDateTime
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{statusInfo.icon}</div>
          <h2
            className="text-2xl font-bold"
            style={{ color: statusInfo.color }}
          >
            {statusInfo.title}
          </h2>
          <p className="text-gray-600 mt-2">{statusInfo.description}</p>
        </div>

        {/* Driver Info (when available) */}
        {rideStatus.driverName && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold mb-2">Driver Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Driver:</span>
                <span className="font-medium">{rideStatus.driverName}</span>
              </div>
              {rideStatus.vehicleInfo && (
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-medium">{rideStatus.vehicleInfo}</span>
                </div>
              )}
              {rideStatus.status === "accepted" && (
                <div className="flex justify-between">
                  <span>ETA:</span>
                  <span className="font-medium text-blue-600">8 minutes</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trip Details */}
        <div className="border-t pt-4 mb-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">From:</span>
              <span className="ml-2 font-medium">
                {rideStatus.pickupAddress}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-sm mr-3"></div>
              <span className="text-gray-600">To:</span>
              <span className="ml-2 font-medium">
                {rideStatus.destinationAddress}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Fare:</span>
              <span className="font-bold text-green-600">
                ${rideStatus.estimatedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {rideStatus.status === "completed" && (
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
            >
              Rate Your Driver
            </button>
          )}

          {rideStatus.status === "cancelled" && (
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Book Another Ride
            </button>
          )}

          {["pending", "accepted", "arrived"].includes(rideStatus.status) && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to cancel this ride?")) {
                  // Cancel ride logic here
                  onClose();
                }
              }}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold"
            >
              Cancel Ride
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideStatusTracker;
