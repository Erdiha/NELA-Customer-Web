// Create as src/components/RideTrackingMap.jsx in customer web app

import React, { useState, useEffect } from "react";

const RideTrackingMap = ({ ride, driverLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState("Calculating...");

  useEffect(() => {
    // Initialize Google Maps
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      loadGoogleMapsScript();
    }
  }, []);

  useEffect(() => {
    if (driverLocation && ride) {
      calculateETA();
    }
  }, [driverLocation, ride]);

  const loadGoogleMapsScript = () => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY
    }&libraries=geometry`;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!ride) return;

    const map = new window.google.maps.Map(
      document.getElementById("ride-map"),
      {
        zoom: 13,
        center: ride.pickup || { lat: 40.7128, lng: -74.006 },
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }
    );

    // Pickup marker
    if (ride.pickup) {
      new window.google.maps.Marker({
        position: ride.pickup,
        map: map,
        title: "Pickup Location",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });
    }

    // Destination marker
    if (ride.dropoff) {
      new window.google.maps.Marker({
        position: ride.dropoff,
        map: map,
        title: "Destination",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });
    }

    // Driver marker (if available)
    if (driverLocation) {
      window.driverMarker = new window.google.maps.Marker({
        position: driverLocation,
        map: map,
        title: "Your Driver",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });

      // Update map bounds to include all markers
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(ride.pickup);
      bounds.extend(ride.dropoff);
      bounds.extend(driverLocation);
      map.fitBounds(bounds);
    }

    setMapLoaded(true);
  };

  const calculateETA = () => {
    if (!driverLocation || !ride.pickup) return;

    // Simple distance calculation (you can use Google Distance Matrix API for accuracy)
    const distance = calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      ride.pickup.latitude,
      ride.pickup.longitude
    );

    // Rough ETA calculation (assuming 25 mph average speed)
    const etaMinutes = Math.round((distance / 25) * 60);
    setEstimatedArrival(`${etaMinutes} min`);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  if (!ride) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No ride data available</p>
      </div>
    );
  }

  return (
    <div className="ride-tracking-map">
      {/* Map Container */}
      <div className="relative">
        <div id="ride-map" className="w-full h-64 rounded-lg border"></div>

        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {/* Driver info overlay */}
        {driverLocation && ride.driverName && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-semibold text-sm">{ride.driverName}</p>
                <p className="text-xs text-gray-600">ETA: {estimatedArrival}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Pickup</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Destination</span>
        </div>
        {driverLocation && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Your Driver</span>
          </div>
        )}
      </div>

      {/* Trip Details */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="font-medium">Distance</p>
          <p className="text-gray-600">{ride.distance || "Calculating..."}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="font-medium">Duration</p>
          <p className="text-gray-600">
            {ride.estimatedTime || "Calculating..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RideTrackingMap;
