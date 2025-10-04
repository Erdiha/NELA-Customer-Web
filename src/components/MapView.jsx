import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapView = ({ pickup, destination, driverLocation }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const routeLayerRef = useRef(null);
  const [routeLoading, setRouteLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || !pickup || !destination) return;

    // Initialize map once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([pickup.lat, pickup.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance.current);
    }

    // Clear old markers and route
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};
    if (routeLayerRef.current) {
      mapInstance.current.removeLayer(routeLayerRef.current);
    }

    // Fetch actual driving route from OpenRouteService (free)
    const fetchRoute = async () => {
      setRouteLoading(true);
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
          ]);

          // Draw route with multiple layers for effect
          const routeGroup = L.layerGroup();

          // Bottom shadow layer
          L.polyline(coordinates, {
            color: "#1e40af",
            weight: 10,
            opacity: 0.2,
            smoothFactor: 1,
          }).addTo(routeGroup);

          // Main route layer
          L.polyline(coordinates, {
            color: "#3b82f6",
            weight: 6,
            opacity: 0.9,
            smoothFactor: 1,
            lineJoin: "round",
            lineCap: "round",
          }).addTo(routeGroup);

          // Top highlight layer
          L.polyline(coordinates, {
            color: "#60a5fa",
            weight: 3,
            opacity: 0.6,
            smoothFactor: 1,
            dashArray: "10, 15",
            lineJoin: "round",
            lineCap: "round",
          }).addTo(routeGroup);

          routeLayerRef.current = routeGroup;
          routeGroup.addTo(mapInstance.current);

          setRouteLoading(false);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        // Fallback to straight line if route fetch fails
        const straightLine = L.polyline(
          [
            [pickup.lat, pickup.lng],
            [destination.lat, destination.lng],
          ],
          {
            color: "#3b82f6",
            weight: 4,
            opacity: 0.6,
            dashArray: "10, 10",
          }
        );
        routeLayerRef.current = straightLine;
        straightLine.addTo(mapInstance.current);
        setRouteLoading(false);
      }
    };

    fetchRoute();

    // Pickup marker
    const pickupIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="transform: rotate(45deg); font-size: 20px;">📍</div>
          </div>
          <div style="
            position: absolute;
            top: 45px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            white-space: nowrap;
            font-size: 11px;
            font-weight: 600;
            color: #059669;
          ">Pickup</div>
        </div>
      `,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
    markersRef.current.pickup = L.marker([pickup.lat, pickup.lng], {
      icon: pickupIcon,
    }).addTo(mapInstance.current);

    // Destination marker
    const destIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="transform: rotate(45deg); font-size: 20px;">🎯</div>
          </div>
          <div style="
            position: absolute;
            top: 45px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            white-space: nowrap;
            font-size: 11px;
            font-weight: 600;
            color: #dc2626;
          ">Destination</div>
        </div>
      `,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
    markersRef.current.destination = L.marker(
      [destination.lat, destination.lng],
      { icon: destIcon }
    ).addTo(mapInstance.current);

    // Driver marker
    if (driverLocation) {
      const driverIcon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              width: 48px;
              height: 48px;
              border-radius: 50%;
              border: 4px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
              animation: pulse 2s infinite;
            ">🚗</div>
            <div style="
              position: absolute;
              top: 55px;
              left: 50%;
              transform: translateX(-50%);
              background: #3b82f6;
              color: white;
              padding: 4px 10px;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              white-space: nowrap;
              font-size: 11px;
              font-weight: 700;
            ">Your Driver</div>
            <style>
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
            </style>
          </div>
        `,
        className: "",
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });
      markersRef.current.driver = L.marker(
        [driverLocation.latitude, driverLocation.longitude],
        { icon: driverIcon }
      ).addTo(mapInstance.current);
    }

    // Fit bounds
    const bounds = L.latLngBounds([
      [pickup.lat, pickup.lng],
      [destination.lat, destination.lng],
    ]);
    if (driverLocation) {
      bounds.extend([driverLocation.latitude, driverLocation.longitude]);
    }
    mapInstance.current.fitBounds(bounds, {
      padding: [80, 80],
      maxZoom: 15,
    });
  }, [pickup, destination, driverLocation]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "300px",
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
