import { getRouteDetails } from "./routingService";

const PRICING_CONFIG = {
  baseFare: 3.5,
  perMile: 2.25,
  perMinute: 0.35,
  discountPercent: 20,
  surgePricing: 1.0,
};

// Replace your existing calculateRidePrice function with this:
export async function calculateRidePrice(pickupCoords, destinationCoords) {
  const routeData = await getRouteDetails(pickupCoords, destinationCoords);

  const basePrice =
    PRICING_CONFIG.baseFare +
    routeData.distance * PRICING_CONFIG.perMile +
    routeData.duration * PRICING_CONFIG.perMinute;

  const surgePrice = basePrice * PRICING_CONFIG.surgePricing;
  const discountAmount = surgePrice * (PRICING_CONFIG.discountPercent / 100);
  const finalPrice = surgePrice - discountAmount;

  return {
    distance: Math.round(routeData.distance * 10) / 10,
    estimatedTime: Math.round(routeData.duration),
    basePrice: Math.round(basePrice * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    savings: Math.round(discountAmount * 100) / 100,
    routeGeometry: routeData.geometry,
  };
}
