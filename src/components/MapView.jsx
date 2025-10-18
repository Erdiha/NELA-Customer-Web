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
    // Fetch actual driving route from OSRM
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

          // Professional multi-layer route (Uber-style)
          const routeGroup = L.layerGroup();

          // Bottom glow/shadow
          L.polyline(coordinates, {
            color: "#1e40af",
            weight: 12,
            opacity: 0.15,
            smoothFactor: 1,
            lineJoin: "round",
            lineCap: "round",
          }).addTo(routeGroup);

          // Main route line (NELA blue)
          L.polyline(coordinates, {
            color: "#3b82f6",
            weight: 6,
            opacity: 1,
            smoothFactor: 1,
            lineJoin: "round",
            lineCap: "round",
          }).addTo(routeGroup);

          routeLayerRef.current = routeGroup;
          routeGroup.addTo(mapInstance.current);
          setRouteLoading(false);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
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

    // Pickup marker (green - professional size)
    const pickupIcon = L.divIcon({
      html: `
    <div style="
      position: relative;
      width: 28px;
      height: 28px;
    ">
      <div style="
        width: 28px;
        height: 28px;
        background: #10b981;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    </div>
  `,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    markersRef.current.pickup = L.marker([pickup.lat, pickup.lng], {
      icon: pickupIcon,
    }).addTo(mapInstance.current);

    // Destination marker (red square - Uber style)
    const destIcon = L.divIcon({
      html: `
    <div style="
      position: relative;
      width: 28px;
      height: 28px;
    ">
      <div style="
        width: 28px;
        height: 28px;
        background: #ef4444;
        border: 3px solid white;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 1px;
        "></div>
      </div>
    </div>
  `,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    markersRef.current.destination = L.marker(
      [destination.lat, destination.lng],
      { icon: destIcon }
    ).addTo(mapInstance.current);

    // Driver marker (car icon - slightly larger, NELA blue)
    if (driverLocation) {
      const driverIcon = L.divIcon({
        html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
      ">
        <div style="
          width: 36px;
          height: 36px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 3px 12px rgba(59,130,246,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        ">🚗</div>
        <div style="
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: #3b82f6;
          opacity: 0.3;
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.3; }
          50% { transform: translateX(-50%) scale(1.5); opacity: 0; }
        }
      </style>
    `,
        className: "",
        iconSize: [8, 8],
        iconAnchor: [10, 10],
      });
      markersRef.current.driver = L.marker(
        [driverLocation.latitude, driverLocation.longitude],
        { icon: driverIcon }
      ).addTo(mapInstance.current);
    }
    // Fit bounds with proper padding
    const bounds = L.latLngBounds([
      [pickup.lat, pickup.lng],
      [destination.lat, destination.lng],
    ]);
    if (driverLocation) {
      bounds.extend([driverLocation.latitude, driverLocation.longitude]);
    }
    mapInstance.current.fitBounds(bounds, {
      padding: [30, 30],
      animate: true,
    });

    // Fetch actual driving route from OpenRouteService (free)
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
