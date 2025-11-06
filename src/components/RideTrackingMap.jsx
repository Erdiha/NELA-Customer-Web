import React, { useState, useEffect, useRef } from "react";

const RideTrackingMap = ({ ride, driverLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState("Calculating...");
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const driverMarkerRef = useRef(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&libraries=geometry`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if (window.google && window.google.maps) {
            initializeMap();
          }
        };

        document.head.appendChild(script);
      } else if (window.google && window.google.maps) {
        initializeMap();
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (driverLocation && ride && mapInstance.current) {
      updateDriverMarker();
      calculateETA();
    }
  }, [driverLocation, ride]);

  const initializeMap = () => {
    if (!ride || !mapRef.current) return;

    const google = window.google;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 13,
      center: ride.pickup || { lat: 34.0522, lng: -118.2437 },
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    // Pickup marker (green)
    if (ride.pickup) {
      new google.maps.Marker({
        position: ride.pickup,
        map: mapInstance.current,
        title: "Pickup Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });
    }

    // Destination marker (red square)
    if (ride.dropoff) {
      new google.maps.Marker({
        position: ride.dropoff,
        map: mapInstance.current,
        title: "Destination",
        icon: {
          path: "M -5,-5 L 5,-5 L 5,5 L -5,5 Z",
          scale: 1.4,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });
    }

    // Driver marker (if available)
    if (driverLocation) {
      driverMarkerRef.current = new google.maps.Marker({
        position: driverLocation,
        map: mapInstance.current,
        title: "Your Driver",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });

      // Update map bounds
      const bounds = new google.maps.LatLngBounds();
      if (ride.pickup) bounds.extend(ride.pickup);
      if (ride.dropoff) bounds.extend(ride.dropoff);
      bounds.extend(driverLocation);
      mapInstance.current.fitBounds(bounds, { padding: 50 });
    }

    setMapLoaded(true);
  };

  const updateDriverMarker = () => {
    if (!driverMarkerRef.current || !driverLocation) return;

    driverMarkerRef.current.setPosition(driverLocation);

    // Update bounds
    const google = window.google;
    const bounds = new google.maps.LatLngBounds();
    if (ride.pickup) bounds.extend(ride.pickup);
    if (ride.dropoff) bounds.extend(ride.dropoff);
    bounds.extend(driverLocation);
    mapInstance.current.fitBounds(bounds, { padding: 50 });
  };

  const calculateETA = () => {
    if (!driverLocation || !ride.pickup) return;

    const distance = calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      ride.pickup.latitude,
      ride.pickup.longitude
    );

    // ETA calculation (assuming 25 mph average speed)
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
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg border-2 border-gray-200"
        ></div>

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
