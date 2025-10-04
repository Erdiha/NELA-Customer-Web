const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY; // Add this to your .env file
const ORS_BASE_URL = "https://api.openrouteservice.org/v2";

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
  return distance * 3 + 5; // Rough estimate: 3 min per mile + 5 min buffer
}

export async function getRouteDetails(startCoords, endCoords) {
  try {
    const response = await fetch(
      `${ORS_BASE_URL}/directions/driving-car?api_key=${ORS_API_KEY}&start=${startCoords.lng},${startCoords.lat}&end=${endCoords.lng},${endCoords.lat}`,
      {
        headers: {
          "Accept":
            "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        },
      }
    );

    const data = await response.json();

    if (data.features && data.features[0]) {
      const route = data.features[0].properties.segments[0];

      return {
        distance: route.distance / 1609.34, // Convert meters to miles
        duration: route.duration / 60, // Convert seconds to minutes
        geometry: data.features[0].geometry, // For displaying route on map
      };
    }

    throw new Error("No route found");
  } catch (error) {
    console.error("Routing error:", error);
    // Fallback to estimated calculations
    const fallbackDistance =
      calculateStraightLineDistance(startCoords, endCoords) * 1.5;
    return {
      distance: fallbackDistance,
      duration: estimateTimeFromDistance(fallbackDistance),
      geometry: null,
    };
  }
}
