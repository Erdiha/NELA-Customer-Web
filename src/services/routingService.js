const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

function calculateStraightLineDistance(start, end) {
  const R = 3959;
  const dLat = toRadians(end.lat - start.lat);
  const dLon = toRadians(end.lng - start.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function estimateTimeFromDistance(distance) {
  return distance * 3 + 5;
}

export async function getRouteDetails(startCoords, endCoords) {
  console.log("🔍 Getting route:", { startCoords, endCoords });

  // ✅ Use OSRM (free, no key needed) as primary
  try {
    console.log("🔄 Trying OSRM...");
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("📦 OSRM response:", data);

    if (data.routes && data.routes[0]) {
      const route = data.routes[0];
      const result = {
        distance: route.distance / 1609.34,
        duration: route.duration / 60,
        geometry: route.geometry,
      };
      console.log("✅ OSRM route:", result);
      return result;
    }
  } catch (error) {
    console.error("❌ OSRM failed:", error);
  }

  // Fallback to straight-line
  console.warn("⚠️ Using straight-line fallback");
  const fallbackDistance =
    calculateStraightLineDistance(startCoords, endCoords) * 1.4;
  const result = {
    distance: fallbackDistance,
    duration: estimateTimeFromDistance(fallbackDistance),
    geometry: null,
  };
  console.log("📍 Fallback result:", result);
  return result;
}
