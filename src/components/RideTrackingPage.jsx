/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import MapView from "./MapView";

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

  // ✅ NEW: Countdown timer for pending rides
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
            subtitle: `Looking for driver for your ${timeStr} ride`,
            color: "purple",
            icon: "🔍",
            showTimeout: true,
          };
        }
        return {
          title: "Finding Driver",
          subtitle: "Searching for nearby drivers...",
          color: "blue",
          icon: "🔍",
          showTimeout: true,
        };

      case "no_driver_available":
      case "declined":
        return {
          title: "No Drivers Available",
          subtitle: isScheduled
            ? "No drivers available for this time slot. Please try a different time."
            : "All drivers are busy right now. Please try again in a few minutes.",
          color: "red",
          icon: "❌",
          isError: true,
        };

      case "accepted":
        // ✅ FIXED: Check if scheduled and time hasn't arrived yet
        if (isScheduled && scheduledDateTime) {
          const rideTime = new Date(scheduledDateTime);
          const now = new Date();
          const hoursUntil = (rideTime - now) / (1000 * 60 * 60);

          if (hoursUntil > 1) {
            // More than 1 hour away - driver confirmed but not heading yet
            return {
              title: "Driver Confirmed",
              subtitle: `See you at ${rideTime.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}`,
              color: "purple",
              icon: "✅",
              hideETA: true, // Don't show ETA yet
            };
          } else {
            // Within 1 hour - driver should be heading soon
            return {
              title: "Driver Heading to Pickup",
              subtitle: "Your driver will be there soon",
              color: "blue",
              icon: "🚗",
              showETA: true,
            };
          }
        }

        // Immediate ride - driver on the way now
        return {
          title: "Driver On The Way",
          subtitle: `Arriving in ${eta || "..."}  min`,
          color: "blue",
          icon: "🚗",
          showETA: true,
        };

      case "arrived":
        return {
          title: "Driver Has Arrived",
          subtitle: "Look for your driver outside",
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
          subtitle: "Thanks for riding with NELA",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-y-auto">
      {/* ✅ Status Header with Countdown */}
      <div
        className={`bg-gradient-to-r ${
          statusDisplay.color === "blue"
            ? "from-blue-500 to-blue-600"
            : statusDisplay.color === "green"
            ? "from-green-500 to-green-600"
            : statusDisplay.color === "orange"
            ? "from-orange-500 to-orange-600"
            : statusDisplay.color === "purple"
            ? "from-purple-500 to-purple-600"
            : statusDisplay.color === "yellow"
            ? "from-yellow-500 to-yellow-600"
            : statusDisplay.color === "red"
            ? "from-red-500 to-red-600"
            : "from-gray-500 to-gray-600"
        } text-white px-4 sm:px-6 py-4 sm:py-6 shadow-lg`}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl mb-2">
              {statusDisplay.icon}
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              {statusDisplay.title}
            </div>
            <div className="text-xs sm:text-sm opacity-90">
              {statusDisplay.subtitle}
            </div>

            {/* ✅ NEW: Show countdown for pending rides */}
            {statusDisplay.showTimeout && timeRemaining && (
              <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                <div className="text-xs opacity-90 mb-1">Time remaining</div>
                <div className="text-2xl font-bold font-mono">
                  {timeRemaining}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 pb-24">
        {/* Error State - No Driver Available */}
        {statusDisplay.isError && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl mb-4 border-2 border-red-200">
            <div className="text-center mb-4">
              <div className="text-4xl sm:text-5xl mb-3">😔</div>
              <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-2">
                Sorry About That!
              </h3>
              <p className="text-sm sm:text-base text-red-700 mb-3">
                {statusDisplay.subtitle}
              </p>
            </div>

            <button
              onClick={onBookAnother}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
            >
              Try Booking Again
            </button>
          </div>
        )}

        {/* Normal Flow - Only show if not error */}
        {!statusDisplay.isError && (
          <>
            {/* Driver Card - Only when driver assigned */}
            {rideData?.driverName && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl mb-4 border-2 border-blue-100">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  {rideData.driverPhotoURL ? (
                    <img
                      src={rideData.driverPhotoURL}
                      alt={rideData.driverName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-blue-500 shadow-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg flex-shrink-0">
                      {rideData.driverName.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-500 font-medium mb-1">
                      YOUR DRIVER
                    </div>
                    <div className="font-bold text-lg sm:text-xl text-gray-900 truncate">
                      {rideData.driverName}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 text-sm">⭐</span>
                      <span className="text-xs sm:text-sm font-semibold">
                        5.0
                      </span>
                      <span className="text-xs text-gray-500">(Driver)</span>
                    </div>
                  </div>

                  {rideData.driverPhone && (
                    <a
                      href={`tel:${rideData.driverPhone}`}
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition shadow-lg flex-shrink-0"
                    >
                      <svg
                        className="w-6 h-6 sm:w-7 sm:h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Vehicle Info */}
                {rideData.driverVehicle && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">
                        Vehicle
                      </span>
                      <span className="font-semibold text-gray-900 text-xs sm:text-base text-right">
                        {rideData.driverVehicle.year}{" "}
                        {rideData.driverVehicle.make}{" "}
                        {rideData.driverVehicle.model}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">
                        Color
                      </span>
                      <span className="font-semibold text-gray-900 text-xs sm:text-base">
                        {rideData.driverVehicle.color}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">
                        License Plate
                      </span>
                      <span className="font-bold text-lg sm:text-xl text-blue-600">
                        {rideData.driverVehicle.licensePlate}
                      </span>
                    </div>
                  </div>
                )}

                {/* Live ETA - Only show when appropriate */}
                {statusDisplay.showETA &&
                  eta &&
                  rideData.status === "accepted" && (
                    <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border-2 border-green-200">
                      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xl sm:text-2xl font-bold text-green-700">
                          {eta} min
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-base sm:text-lg text-gray-700">
                          {distance} miles away
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Trip Route Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-4">
              <div className="text-xs sm:text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">
                Trip Route
              </div>

              {/* Pickup */}
              <div className="flex gap-3 sm:gap-4 mb-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full shadow"></div>
                  <div className="w-0.5 flex-1 bg-gray-300 my-1"></div>
                </div>
                <div className="flex-1 pb-4 min-w-0">
                  <div className="text-xs text-gray-500 font-semibold mb-1">
                    PICKUP
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                    {pickupAddress?.address}
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-sm shadow"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 font-semibold mb-1">
                    DESTINATION
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                    {destinationAddress?.address}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Stats */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-semibold mb-1">
                    DISTANCE
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">
                    {priceEstimate?.distance || rideData?.distance || "--"}
                    <span className="text-xs sm:text-sm text-gray-600 ml-0.5 sm:ml-1">
                      mi
                    </span>
                  </div>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <div className="text-xs text-gray-500 font-semibold mb-1">
                    DURATION
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">
                    {priceEstimate?.estimatedTime ||
                      rideData?.estimatedTime ||
                      "--"}
                    <span className="text-xs sm:text-sm text-gray-600 ml-0.5 sm:ml-1">
                      min
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 font-semibold mb-1">
                    FARE
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    $
                    {priceEstimate?.finalPrice ||
                      rideData?.estimatedPrice ||
                      "--"}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Map - Only show when driver assigned and not too early */}
            {pickupAddress && destinationAddress && !statusDisplay.hideETA && (
              <MapView
                pickup={{ lat: pickupAddress.lat, lng: pickupAddress.lng }}
                destination={{
                  lat: destinationAddress.lat,
                  lng: destinationAddress.lng,
                }}
                driverLocation={rideData?.driverLocation}
              />
            )}

            {/* Action Button */}
            {rideData?.status === "completed" && (
              <button
                onClick={onBookAnother}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg mt-4"
              >
                Book Another Ride
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RideTrackingPage;
