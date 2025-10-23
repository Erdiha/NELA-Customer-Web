/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import MapView from "./MapView";
import { updateRideStatus } from "../services/firebaseService";
import OnboardingSlider from "./OnboardingSlider";

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
  const [showActions, setShowActions] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

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

  const toRad = (deg) => deg * (Math.PI / 180);

  const calculateETA = (from, to) => {
    const R = 3959; // miles
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
      eta: Math.max(Math.round((dist / 25) * 60), 3), // assume ~25 mph avg
    };
  };

  const shareTrip = () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/track/${rideId}`
        : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Track My NELA Ride", url: shareUrl });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      if (typeof window !== "undefined")
        window.alert("Link copied to clipboard!");
    }
  };

  const call911 = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Call emergency services (911)?")
    ) {
      window.location.href = "tel:911";
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex flex-col">
      {/* Fixed Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={onBookAnother}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-all active:scale-95 group"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Track Ride
              </h1>
            </div>

            {/* Menu Button */}
            <button
              onClick={() => {
                setShowActions(false);
                setShowOnboarding(true);
              }}
              className="w-fit   px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1 text-gray-700"
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Get Help</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-safe">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3">
          {/* Status Hero Card */}
          <div
            className={`relative overflow-hidden rounded-2xl p-4 sm:p-6 shadow-xl bg-gradient-to-br ${
              statusDisplay.color === "blue"
                ? "from-blue-500 via-blue-600 to-indigo-700"
                : statusDisplay.color === "green"
                ? "from-green-500 via-emerald-600 to-teal-700"
                : statusDisplay.color === "orange"
                ? "from-orange-500 via-amber-600 to-yellow-700"
                : statusDisplay.color === "purple"
                ? "from-purple-500 via-violet-600 to-indigo-700"
                : statusDisplay.color === "red"
                ? "from-red-500 via-rose-600 to-pink-700"
                : "from-gray-500 via-slate-600 to-gray-700"
            } text-white`}
          >
            {/* Animated Background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{statusDisplay.icon}</div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">
                      {statusDisplay.title}
                    </h2>
                    <p className="text-sm text-white/90">
                      {statusDisplay.subtitle}
                    </p>
                  </div>
                </div>
                {timeRemaining && statusDisplay.showTimeout && (
                  <div className="text-right bg-white/20 rounded-xl px-3 py-1.5 backdrop-blur">
                    <div className="text-xl font-bold tabular-nums">
                      {timeRemaining}
                    </div>
                    <div className="text-xs text-white/80">left</div>
                  </div>
                )}
              </div>

              {eta && !statusDisplay.hideMap && (
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                  <span className="text-sm text-white/80">Driver ETA</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tabular-nums">
                      {eta}
                    </span>
                    <span className="text-base">min</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Driver Card */}
          {rideData?.driverName && (
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-md">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {rideData.driverName}
                  </h3>
                  {rideData.driverVehicle && (
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-600 truncate">
                        {rideData.driverVehicle.color}{" "}
                        {rideData.driverVehicle.make}
                      </p>
                      <p className="text-xs font-mono text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded">
                        {rideData.driverVehicle.licensePlate}
                      </p>
                    </div>
                  )}
                </div>
                <a
                  href={`tel:${rideData.driverPhone || ""}`}
                  className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all"
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Map */}
          {pickupAddress && destinationAddress && !statusDisplay.hideMap ? (
            <div
              className="bg-white rounded-2xl overflow-hidden shadow-lg relative"
              style={{ height: "clamp(250px, 40vh, 450px)", zIndex: 1 }}
            >
              <MapView
                pickup={{ lat: pickupAddress.lat, lng: pickupAddress.lng }}
                destination={{
                  lat: destinationAddress.lat,
                  lng: destinationAddress.lng,
                }}
                driverLocation={rideData?.driverLocation}
                autoFocusDelay={5000}
              />
            </div>
          ) : (
            <div
              className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-12 sm:p-16 text-center shadow-xl"
              style={{
                height: "clamp(300px, 40vh, 500px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="text-7xl sm:text-8xl mb-4 animate-pulse">
                {statusDisplay.icon}
              </div>
              <p className="text-lg sm:text-xl text-gray-700 font-medium">
                {statusDisplay.subtitle}
              </p>
            </div>
          )}

          {/* Compact Trip Info - Accordion Style */}
          <div className="space-y-3">
            {/* Quick Stats - Always Visible */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {priceEstimate?.distance || "--"}
                  </div>
                  <div className="text-xs text-gray-500">miles</div>
                </div>
                <div className="border-x border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {priceEstimate?.estimatedTime || "--"}
                  </div>
                  <div className="text-xs text-gray-500">minutes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 tabular-nums">
                    ${priceEstimate?.finalPrice || "--"}
                  </div>
                  <div className="text-xs text-gray-500">fare</div>
                </div>
              </div>
            </div>

            {/* Addresses - Compact Always Visible */}
            <div className="bg-white rounded-xl p-3 shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate font-medium">
                    {pickupAddress?.address.split(",")[0]}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-1 py-1">
                <div className="w-px h-3 bg-gradient-to-b from-green-500 to-red-500"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-sm flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate font-medium">
                    {destinationAddress?.address.split(",")[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          {rideData?.status === "completed" && (
            <button
              onClick={onBookAnother}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg shadow-2xl active:scale-95 transition-all"
            >
              🚗 Book Another Ride
            </button>
          )}

          {rideData?.status &&
            ["pending", "accepted", "arrived"].includes(rideData.status) && (
              <button
                onClick={async () => {
                  if (
                    typeof window === "undefined" ||
                    window.confirm("Are you sure you want to cancel this ride?")
                  ) {
                    try {
                      await updateRideStatus(rideId, "cancelled", {
                        cancelledBy: "customer",
                        cancelReason: "Cancelled by customer",
                        cancelledAt: new Date(),
                      });
                      onBookAnother();
                    } catch (error) {
                      console.error("Error cancelling ride:", error);
                      if (typeof window !== "undefined") {
                        window.alert(
                          "Failed to cancel ride. Please try again."
                        );
                      }
                    }
                  }
                }}
                className="w-full bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg shadow-lg active:scale-95 transition-all"
              >
                ❌ Cancel Ride
              </button>
            )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={shareTrip}
              className="bg-white hover:bg-gray-50 border-2 border-blue-200 hover:border-blue-300 text-blue-600 py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span className="hidden sm:inline">Share Trip</span>
              <span className="sm:hidden">Share</span>
            </button>

            <button
              onClick={call911}
              className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="hidden sm:inline">Emergency</span>
              <span className="sm:hidden">SOS</span>
            </button>
          </div>

          {/* Bottom safe area padding */}
          <div className="h-4"></div>
        </div>
      </div>

      {/* Actions Menu Overlay */}
      {showActions && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowActions(false)}
        >
          <div
            className="absolute top-20 right-4 bg-white rounded-2xl shadow-2xl p-2 min-w-[200px] animate-in slide-in-from-top"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-3 text-gray-700">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <button
                onClick={() => setShowOnboarding(true)}
                className="font-medium"
              >
                Get Help
              </button>
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-3 text-gray-700">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium">View Receipt</span>
            </button>
          </div>
        </div>
      )}
      {showOnboarding && (
        <div className="fixed inset-0 z-[60]">
          <OnboardingSlider onComplete={handleOnboardingComplete} />
        </div>
      )}
    </div>
  );
};

export default RideTrackingPage;
