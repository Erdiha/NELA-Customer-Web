export const QUICK_LOCATIONS = [
  {
    id: "lax",
    name: "LAX - Los Angeles International Airport",
    address: "1 World Way, Los Angeles, CA 90045",
    lat: 33.9416,
    lng: -118.4085,
    icon: "✈️",
  },
  {
    id: "burbank",
    name: "Hollywood Burbank Airport",
    address: "2627 N Hollywood Way, Burbank, CA 91505",
    lat: 34.2007,
    lng: -118.3587,
    icon: "✈️",
  },
  {
    id: "union-station",
    name: "Union Station",
    address: "800 N Alameda St, Los Angeles, CA 90012",
    lat: 34.056,
    lng: -118.2348,
    icon: "🚂",
  },
  {
    id: "dodger-stadium",
    name: "Dodger Stadium",
    address: "1000 Vin Scully Ave, Los Angeles, CA 90012",
    lat: 34.0739,
    lng: -118.24,
    icon: "⚾",
  },
];

// Service area boundary (covers Eagle Rock, Glendale, Highland Park, etc.)
export const SERVICE_AREA_BOUNDS = [
  { lat: 34.25, lng: -118.4 },
  { lat: 34.25, lng: -118.15 },
  { lat: 34.05, lng: -118.15 },
  { lat: 34.05, lng: -118.4 },
];

export function isPointInServiceArea(lat, lng) {
  const polygon = SERVICE_AREA_BOUNDS;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
