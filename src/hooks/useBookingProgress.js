// Create new file: src/hooks/useBookingProgress.js
// This hook saves and restores booking progress using in-memory storage

import { useEffect, useRef } from "react";

// Global in-memory storage (persists across component re-renders but not page refreshes)
// For artifact environment, we use module-level variable
let bookingProgressStore = null;

export const useBookingProgress = (bookingState) => {
  const {
    pickupAddress,
    destinationAddress,
    priceEstimate,
    customerDetails,
    isScheduled,
    scheduledDateTime,
    selectedPaymentMethod,
    setPickupAddress,
    setDestinationAddress,
    setPriceEstimate,
    setCustomerDetails,
    setIsScheduled,
    setScheduledDateTime,
    setSelectedPaymentMethod,
  } = bookingState;

  const isRestoringRef = useRef(false);

  // Save booking progress whenever it changes (debounced)
  useEffect(() => {
    // Don't save while we're restoring
    if (isRestoringRef.current) return;

    // Only save if we have some booking data
    const hasBookingData = pickupAddress || destinationAddress || priceEstimate;

    if (hasBookingData) {
      bookingProgressStore = {
        pickupAddress,
        destinationAddress,
        priceEstimate,
        customerDetails,
        isScheduled,
        scheduledDateTime,
        selectedPaymentMethod,
        savedAt: new Date().toISOString(),
      };
      console.log("💾 Booking progress saved to memory");
    }
  }, [
    pickupAddress,
    destinationAddress,
    priceEstimate,
    customerDetails,
    isScheduled,
    scheduledDateTime,
    selectedPaymentMethod,
  ]);

  // Restore booking progress on mount
  useEffect(() => {
    const restoreProgress = () => {
      if (!bookingProgressStore) {
        console.log("📋 No saved booking progress found");
        return;
      }

      try {
        // Check if saved data is less than 24 hours old
        const savedTime = new Date(bookingProgressStore.savedAt);
        const now = new Date();
        const hoursSince = (now - savedTime) / (1000 * 60 * 60);

        if (hoursSince < 24) {
          console.log("📋 Restoring booking progress...");
          isRestoringRef.current = true;

          if (bookingProgressStore.pickupAddress) {
            setPickupAddress(bookingProgressStore.pickupAddress);
          }
          if (bookingProgressStore.destinationAddress) {
            setDestinationAddress(bookingProgressStore.destinationAddress);
          }
          if (bookingProgressStore.priceEstimate) {
            setPriceEstimate(bookingProgressStore.priceEstimate);
          }
          if (
            bookingProgressStore.customerDetails?.name ||
            bookingProgressStore.customerDetails?.phone
          ) {
            setCustomerDetails(bookingProgressStore.customerDetails);
          }
          if (bookingProgressStore.isScheduled !== undefined) {
            setIsScheduled(bookingProgressStore.isScheduled);
          }
          if (bookingProgressStore.scheduledDateTime) {
            setScheduledDateTime(bookingProgressStore.scheduledDateTime);
          }
          if (bookingProgressStore.selectedPaymentMethod) {
            setSelectedPaymentMethod(
              bookingProgressStore.selectedPaymentMethod
            );
          }

          console.log("✅ Booking progress restored");

          // Reset flag after a brief delay
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 100);
        } else {
          console.log("⏰ Saved booking too old, clearing...");
          clearBookingProgress();
        }
      } catch (error) {
        console.error("Error restoring booking progress:", error);
        isRestoringRef.current = false;
      }
    };

    restoreProgress();
  }, []); // Empty dependency - only run on mount

  // Function to clear booking progress
  const clearBookingProgress = () => {
    bookingProgressStore = null;
    console.log("🗑️ Booking progress cleared");
  };

  return { clearBookingProgress };
};

export default useBookingProgress;
