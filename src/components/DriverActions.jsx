import React, { useState, useEffect } from "react";
import {
  updateRideStatusWithNotification,
  getRideDetails,
} from "../services/firebaseService";

function DriverActions({ rideId, currentStatus, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [rideDetails, setRideDetails] = useState(null);

  useEffect(() => {
    if (rideId) {
      loadRideDetails();
    }
  }, [rideId]);

  const loadRideDetails = async () => {
    try {
      const details = await getRideDetails(rideId);
      setRideDetails(details);
    } catch (error) {
      console.error("Error loading ride details:", error);
    }
  };

  const handleStatusUpdate = async (newStatus, additionalData = {}) => {
    setIsUpdating(true);
    try {
      await updateRideStatusWithNotification(rideId, newStatus, {
        driverName: "John (NELA Driver)",
        vehicleInfo: "Black Honda Civic - ABC123",
        eta: 8,
        updatedAt: new Date(),
        ...additionalData,
      });
      onStatusUpdate(newStatus);
      await loadRideDetails(); // Refresh details after update
    } catch (error) {
      alert("Error updating status: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      "pending": { label: "Pending", color: "yellow", icon: "⏳" },
      "accepted": { label: "Accepted", color: "blue", icon: "✅" },
      "driver_on_way": { label: "Driver On Way", color: "purple", icon: "🚗" },
      "driver_arrived": {
        label: "Driver Arrived",
        color: "orange",
        icon: "📍",
      },
      "picked_up": { label: "Trip Started", color: "green", icon: "🛣️" },
      "completed": { label: "Completed", color: "emerald", icon: "🏁" },
      "cancelled": { label: "Cancelled", color: "red", icon: "❌" },
    };
    return statusMap[status] || { label: status, color: "gray", icon: "❓" };
  };

  const getAvailableActions = () => {
    switch (currentStatus) {
      case "pending":
        return [
          { label: "Accept Ride", status: "accepted", color: "blue" },
          { label: "Decline Ride", status: "cancelled", color: "red" },
        ];
      case "accepted":
        return [
          { label: "On My Way", status: "driver_on_way", color: "purple" },
        ];
      case "driver_on_way":
        return [
          { label: "I've Arrived", status: "driver_arrived", color: "orange" },
        ];
      case "driver_arrived":
        return [
          { label: "Customer Picked Up", status: "picked_up", color: "green" },
        ];
      case "picked_up":
        return [
          { label: "Trip Completed", status: "completed", color: "emerald" },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions();
  const statusInfo = getStatusDisplay(currentStatus);

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <h3 className="font-bold text-gray-800 mb-3">
          Driver Dashboard (Testing)
        </h3>

        {/* Current Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Current Status:
            </span>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusInfo.color === "yellow"
                  ? "bg-yellow-100 text-yellow-800"
                  : statusInfo.color === "blue"
                  ? "bg-blue-100 text-blue-800"
                  : statusInfo.color === "purple"
                  ? "bg-purple-100 text-purple-800"
                  : statusInfo.color === "orange"
                  ? "bg-orange-100 text-orange-800"
                  : statusInfo.color === "green"
                  ? "bg-green-100 text-green-800"
                  : statusInfo.color === "emerald"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {statusInfo.icon} {statusInfo.label}
            </div>
          </div>
        </div>

        {/* Ride Details */}
        {rideDetails && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Customer:</span>
                <div>{rideDetails.customerName}</div>
              </div>
              <div>
                <span className="font-medium">Phone:</span>
                <div>{rideDetails.customerPhone}</div>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Pickup:</span>
                <div className="text-xs">{rideDetails.pickupAddress}</div>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Destination:</span>
                <div className="text-xs">{rideDetails.destinationAddress}</div>
              </div>
              <div>
                <span className="font-medium">Fare:</span>
                <div>${rideDetails.estimatedPrice}</div>
              </div>
              <div>
                <span className="font-medium">Distance:</span>
                <div>{rideDetails.distance} miles</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {actions.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Available Actions:
            </div>
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleStatusUpdate(action.status)}
                disabled={isUpdating}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 ${
                  action.color === "blue"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : action.color === "purple"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : action.color === "orange"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : action.color === "green"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : action.color === "emerald"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {isUpdating ? "Updating..." : action.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            {currentStatus === "completed"
              ? "Ride Complete! 🎉"
              : currentStatus === "cancelled"
              ? "Ride Cancelled"
              : "No actions available"}
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverActions;
