const ORS_API_KEY = import.meta.env.VITE_OPEN_ROUTE_API; // ✅ Fixed to match your .env

function calculateStraightLineDistance(start, end) {
  const R = 3959; // Earth's radius in miles
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
  return distance * 3 + 5; // 3 min per mile + 5 min buffer
}

export async function getRouteDetails(startCoords, endCoords) {
  // ✅ Try API first, fallback if it fails
  if (!ORS_API_KEY) {
    console.warn("⚠️ No ORS API key, using fallback calculation");
    const fallbackDistance =
      calculateStraightLineDistance(startCoords, endCoords) * 1.4;
    return {
      distance: fallbackDistance,
      duration: estimateTimeFromDistance(fallbackDistance),
      geometry: null,
    };
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startCoords.lng},${startCoords.lat}&end=${endCoords.lng},${endCoords.lat}`,
      {
        headers: {
          "Accept": "application/json, application/geo+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features[0]) {
      const route = data.features[0].properties.segments[0];
      console.log("✅ Using real route data");
      return {
        distance: route.distance / 1609.34, // meters to miles
        duration: route.duration / 60, // seconds to minutes
        geometry: data.features[0].geometry,
      };
    }

    throw new Error("No route found");
  } catch (error) {
    console.warn("⚠️ Routing API failed, using fallback:", error.message);
    const fallbackDistance =
      calculateStraightLineDistance(startCoords, endCoords) * 1.4;
    return {
      distance: fallbackDistance,
      duration: estimateTimeFromDistance(fallbackDistance),
      geometry: null,
    };
  }
}
