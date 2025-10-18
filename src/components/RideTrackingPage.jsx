/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import { updateRideStatus } from "../services/firebaseService";

const RideTrackingPage = ({
  rideData,
  pickupAddress,
  destinationAddress,
  priceEstimate,
  rideId,
  onBookAnother,
  isScheduled,
  scheduledDateTime,
}) => {
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (rideData?.driverLocation && pickupAddress) {
      const calc = calculateETA(rideData.driverLocation, {
        lat: pickupAddress.lat,
        lng: pickupAddress.lng,
      });
      setEta(calc.eta);
      setDistance(calc.distance);
    }
  }, [rideData?.driverLocation, pickupAddress]);

  useEffect(() => {
    if (rideData?.status === "pending" && rideData?.timeoutAt) {
      const updateCountdown = () => {
        const now = new Date();
        const timeout = rideData.timeoutAt?.toDate
          ? rideData.timeoutAt.toDate()
          : new Date(rideData.timeoutAt);
        const remainingMs = Math.max(0, timeout - now);

        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);

        setTimeRemaining(`${minutes}:${String(seconds).padStart(2, "0")}`);
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeRemaining(null);
    }
  }, [rideData?.status, rideData?.timeoutAt]);

  const calculateETA = (from, to) => {
    const R = 3959;
    const dLat = toRad(to.lat - from.latitude);
    const dLon = toRad(to.lng - from.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(from.latitude)) *
        Math.cos(toRad(to.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return {
      distance: dist.toFixed(1),
      eta: Math.max(Math.round((dist / 25) * 60), 3),
    };
  };

  const toRad = (deg) => deg * (Math.PI / 180);

  const getStatusDisplay = () => {
    if (!rideData) {
      if (isScheduled) {
        const rideTime = new Date(scheduledDateTime);
        const hoursUntil = (rideTime - new Date()) / (1000 * 60 * 60);
        if (hoursUntil > 1) {
          return {
            title: "Request Sent",
            subtitle: "Finding driver for your scheduled ride",
            color: "purple",
            icon: "📅",
          };
        }
      }
      return {
        title: "Looking for Driver",
        subtitle: "Finding nearby driver...",
        color: "blue",
        icon: "🔍",
      };
    }

    switch (rideData.status) {
      case "pending":
        if (isScheduled) {
          const rideTime = new Date(scheduledDateTime);
          const timeStr = rideTime.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });

          return {
            title: "Finding Driver",
            subtitle: `For your ${timeStr} ride`,
            color: "purple",
            icon: "🔍",
            showTimeout: true,
          };
        }
        return {
          title: "Finding Driver",
          subtitle: "Searching nearby...",
          color: "blue",
          icon: "🔍",
          showTimeout: true,
        };

      case "no_driver_available":
      case "declined":
        return {
          title: "No Drivers Available",
          subtitle: isScheduled
            ? "Try a different time"
            : "Try again in a few minutes",
          color: "red",
          icon: "❌",
          isError: true,
        };

      case "accepted":
        if (isScheduled && scheduledDateTime) {
          const rideTime = new Date(scheduledDateTime);
          const now = new Date();
          const hoursUntil = (rideTime - now) / (1000 * 60 * 60);

          if (hoursUntil > 1) {
            return {
              title: "Driver Confirmed",
              subtitle: `See you ${rideTime.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}`,
              color: "purple",
              icon: "✅",
              hideMap: true,
            };
          }
        }

        return {
          title: "Driver On The Way",
          subtitle: `Arriving in ${eta || "..."} min`,
          color: "blue",
          icon: "🚗",
        };

      case "arrived":
        return {
          title: "Driver Has Arrived",
          subtitle: "Look outside",
          color: "orange",
          icon: "📍",
        };

      case "in_progress":
        return {
          title: "Trip In Progress",
          subtitle: "Heading to destination",
          color: "green",
          icon: "🛣️",
        };

      case "completed":
        return {
          title: "Trip Complete",
          subtitle: "Thanks for riding!",
          color: "green",
          icon: "✅",
        };

      default:
        return {
          title: "Processing",
          subtitle: "Please wait...",
          color: "gray",
          icon: "⏳",
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Status Header - Compact */}
      <div
        className={`flex-shrink-0 bg-gradient-to-r ${
          statusDisplay.color === "blue"
            ? "from-blue-500 to-blue-600"
            : statusDisplay.color === "green"
            ? "from-green-500 to-green-600"
            : statusDisplay.color === "orange"
            ? "from-orange-500 to-orange-600"
            : statusDisplay.color === "purple"
            ? "from-purple-500 to-purple-600"
            : statusDisplay.color === "red"
            ? "from-red-500 to-red-600"
            : "from-gray-500 to-gray-600"
        } text-white shadow-md`}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{statusDisplay.icon}</span>
              <div>
                <h1 className="text-base font-bold">{statusDisplay.title}</h1>
                <p className="text-xs text-white/90">
                  {statusDisplay.subtitle}
                </p>
              </div>
            </div>
            {timeRemaining && statusDisplay.showTimeout && (
              <div className="text-right">
                <div className="text-xl font-bold">{timeRemaining}</div>
                <div className="text-[10px] text-white/80">left</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-3 space-y-3">
          {/* Driver Card - Compact */}
          {rideData?.driverName && (
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{rideData.driverName}</div>
                  {rideData.driverVehicle && (
                    <div className="text-xs text-gray-600 truncate">
                      {rideData.driverVehicle.color}{" "}
                      {rideData.driverVehicle.make} •{" "}
                      {rideData.driverVehicle.licensePlate}
                    </div>
                  )}
                </div>
                {eta && !statusDisplay.hideMap && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {eta}
                    </div>
                    <div className="text-[10px] text-gray-600">min</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map - BIGGER (was 300px, now 450px) */}
          {pickupAddress && destinationAddress && !statusDisplay.hideMap ? (
            <div
              className="bg-white rounded-xl overflow-hidden shadow-sm"
              style={{ height: "450px" }}
            >
              <MapView
                pickup={{ lat: pickupAddress.lat, lng: pickupAddress.lng }}
                destination={{
                  lat: destinationAddress.lat,
                  lng: destinationAddress.lng,
                }}
                driverLocation={rideData?.driverLocation}
                autoFocusDelay={5000} // 5 second delay before auto-refocusing
              />
            </div>
          ) : (
            <div
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 text-center"
              style={{
                height: "450px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text-6xl mb-4">{statusDisplay.icon}</div>
              <p className="text-gray-700 font-medium">
                {statusDisplay.subtitle}
              </p>
            </div>
          )}

          {/* Trip Stats - Compact */}
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-bold mb-1">
                  DISTANCE
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {priceEstimate?.distance || "--"}
                </div>
                <div className="text-[10px] text-gray-500">miles</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-[10px] text-gray-500 font-bold mb-1">
                  TIME
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {priceEstimate?.estimatedTime || "--"}
                </div>
                <div className="text-[10px] text-gray-500">minutes</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 font-bold mb-1">
                  FARE
                </div>
                <div className="text-lg font-bold text-green-600">
                  ${priceEstimate?.finalPrice || "--"}
                </div>
                <div className="text-[10px] text-gray-500">total</div>
              </div>
            </div>
          </div>

          {/* Addresses - Compact */}
          <div className="bg-white rounded-xl p-3 shadow-sm space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-gray-500 font-bold mb-0.5">
                  PICKUP
                </div>
                <div className="text-xs text-gray-900 leading-tight">
                  {pickupAddress?.address}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100"></div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm flex-shrink-0 mt-0.5"></div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-gray-500 font-bold mb-0.5">
                  DESTINATION
                </div>
                <div className="text-xs text-gray-900 leading-tight">
                  {destinationAddress?.address}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {rideData?.status === "completed" && (
            <button
              onClick={onBookAnother}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              Book Another Ride
            </button>
          )}

          {/* Emergency & Share Buttons - Compact */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}/track/${rideId}`;
                if (navigator.share) {
                  navigator.share({
                    title: "Track My NELA Ride",
                    url: shareUrl,
                  });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  alert("Link copied!");
                }
              }}
              className="bg-white border-2 border-blue-200 text-blue-600 py-2 rounded-lg font-semibold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>

            <button
              onClick={() => {
                if (confirm("Call emergency services?")) {
                  window.location.href = "tel:911";
                }
              }}
              className="bg-red-500 text-white py-2 rounded-lg font-semibold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Emergency
            </button>
            {/* Cancel Ride Button - Only show when ride can be cancelled */}
            {rideData?.status &&
              ["pending", "accepted", "arrived"].includes(rideData.status) && (
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to cancel this ride?")) {
                      try {
                        await updateRideStatus(rideId, "cancelled", {
                          cancelledBy: "customer",
                          cancelReason: "Cancelled by customer",
                          cancelledAt: new Date(),
                        });
                        alert("Ride cancelled successfully");
                        onBookAnother();
                      } catch (error) {
                        console.error("Error cancelling ride:", error);
                        alert("Failed to cancel ride. Please try again.");
                      }
                    }
                  }}
                  className="w-full bg-white border-2 border-red-300 text-red-600 py-3 rounded-xl font-bold active:scale-95 transition-transform"
                >
                  Cancel Ride
                </button>
              )}
          </div>

          {/* Bottom Padding */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default RideTrackingPage;
