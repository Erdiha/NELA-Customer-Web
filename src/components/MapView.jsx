import React, { useEffect, useRef, useState } from "react";

const MapView = ({ pickup, destination, driverLocation }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const routePolylineRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Google Maps by loading script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&libraries=places,geometry`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if (
            window.google &&
            window.google.maps &&
            mapRef.current &&
            !mapInstance.current
          ) {
            initializeMap();
          }
        };

        document.head.appendChild(script);
      } else if (
        window.google &&
        window.google.maps &&
        mapRef.current &&
        !mapInstance.current
      ) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: 34.0522, lng: -118.2437 },
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

      directionsServiceRef.current = new window.google.maps.DirectionsService();
      setMapLoaded(true);
    };

    loadGoogleMaps();
  }, []);

  // Draw route and markers
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !pickup || !destination) return;

    const google = window.google;

    // Clear old markers and route
    Object.values(markersRef.current).forEach((marker) => marker.setMap(null));
    markersRef.current = {};
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
    }

    // Fetch and draw route
    const fetchRoute = async () => {
      setRouteLoading(true);
      try {
        const request = {
          origin: { lat: pickup.lat, lng: pickup.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsServiceRef.current.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const route = result.routes[0].overview_path;

            // Draw route polyline (NELA blue)
            routePolylineRef.current = new google.maps.Polyline({
              path: route,
              geodesic: true,
              strokeColor: "#3b82f6",
              strokeOpacity: 1.0,
              strokeWeight: 6,
              map: mapInstance.current,
            });

            setRouteLoading(false);
          } else {
            console.error("Directions request failed:", status);
            setRouteLoading(false);
          }
        });
      } catch (error) {
        console.error("Error fetching route:", error);
        setRouteLoading(false);
      }
    };

    fetchRoute();

    // Pickup marker (green circle)
    markersRef.current.pickup = new google.maps.Marker({
      position: { lat: pickup.lat, lng: pickup.lng },
      map: mapInstance.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#10b981",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
      title: "Pickup",
    });

    // Destination marker (red square)
    markersRef.current.destination = new google.maps.Marker({
      position: { lat: destination.lat, lng: destination.lng },
      map: mapInstance.current,
      icon: {
        path: "M -5,-5 L 5,-5 L 5,5 L -5,5 Z",
        scale: 1.4,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
      title: "Destination",
    });

    // Driver marker (car icon)
    if (driverLocation) {
      markersRef.current.driver = new google.maps.Marker({
        position: {
          lat: driverLocation.latitude,
          lng: driverLocation.longitude,
        },
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        title: "Driver",
      });
    }

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: pickup.lat, lng: pickup.lng });
    bounds.extend({ lat: destination.lat, lng: destination.lng });
    if (driverLocation) {
      bounds.extend({
        lat: driverLocation.latitude,
        lng: driverLocation.longitude,
      });
    }
    mapInstance.current.fitBounds(bounds, { padding: 50 });
  }, [mapLoaded, pickup, destination, driverLocation]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "300px",
          borderRadius: "16px",
          border: "2px solid #e5e7eb",
        }}
        className="shadow-lg"
      />

      {/* Loading indicator */}
      {routeLoading && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: "12px",
            fontWeight: "600",
            color: "#3b82f6",
          }}
        >
          Loading route...
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          background: "white",
          padding: "12px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          fontSize: "11px",
          fontWeight: "600",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "#10b981",
              borderRadius: "50%",
            }}
          ></div>
          <span>Pickup</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "#ef4444",
              borderRadius: "2px",
            }}
          ></div>
          <span>Drop-off</span>
        </div>
        {driverLocation && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "#3b82f6",
                borderRadius: "50%",
              }}
            ></div>
            <span>Driver</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
