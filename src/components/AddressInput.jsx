/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { isPointInServiceArea } from "../data/serviceAreas";
import QuickLocationPicker from "./QuickLocationPicker";

function AddressInput({
  placeholder,
  onAddressSelect,
  icon,
  showCurrentLocation = false,
  currentUser = null,
  isPickup = true,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [showQuickPick, setShowQuickPick] = useState(false);
  const abortControllerRef = useRef(null);
  const [isSelectingFromSuggestion, setIsSelectingFromSuggestion] =
    useState(false);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    console.log(
      "⚡ useEffect triggered, query:",
      query,
      "length:",
      query.length
    );

    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (query.length > 3) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        searchAddresses(query);
      }, 500);

      return () => {
        clearTimeout(timer);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [query]);

  const searchAddresses = async (searchQuery) => {
    console.log("🔍 SEARCHING FOR:", searchQuery);
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&countrycodes=us`,
        {
          signal: abortControllerRef.current.signal,
        }
      );
      const data = await response.json();

      setSuggestions(data);
      setShowSuggestions(true);
      setIsLoading(false);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request cancelled");
        return;
      }
      console.error("Error searching addresses:", error);
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.display_name) {
            justSelectedRef.current = true;
            setQuery(data.display_name);
            onAddressSelect({
              address: data.display_name,
              lat: latitude,
              lng: longitude,
            });
            setShowFavorites(false);
          } else {
            setLocationError("Unable to get address for current location");
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          setLocationError("Error getting address for current location");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied by user");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleSelectAddress = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    if (isPickup && !isPointInServiceArea(lat, lng)) {
      alert(
        "Sorry, we only pick up from: Eagle Rock, Glendale, Highland Park, Cypress Park, Mount Washington, Glassell Park, and major LA airports (LAX, Burbank, Long Beach)."
      );
      return;
    }

    console.log("✅ SELECTED:", place.display_name);

    justSelectedRef.current = true; // Set flag
    setQuery(place.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsLoading(false);

    onAddressSelect({
      address: place.display_name,
      lat: lat,
      lng: lng,
    });
  };

  const handleFavoriteSelect = (location) => {
    setQuery(location.address);
    setShowFavorites(false);
    onAddressSelect(location);
  };

  const handleInputFocus = () => {
    setInputFocused(true);
    if (!query && !showSuggestions) {
      setShowFavorites(true);
    }
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    setTimeout(() => {
      setShowSuggestions(false);
      setShowFavorites(false);
    }, 200);
  };

  const clearInput = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setLocationError(null);
    setShowFavorites(true);
  };

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      {/* Quick Pick Button */}
      <div className="mb-2">
        <button
          onClick={() => setShowQuickPick(true)}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl hover:border-blue-400 transition-all text-left flex items-center justify-between group"
          type="button"
        >
          <span className="text-sm font-semibold text-blue-700">
            Quick Pick - Airports & Landmarks
          </span>
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Input Container */}
      <div className="relative group">
        {/* Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
          <span className="text-lg">{icon}</span>
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => {
            handleInputFocus();
            setTimeout(
              () =>
                e.target.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                }),
              300
            );
          }}
          onBlur={handleInputBlur}
          className="w-full pl-12 pr-24 sm:pr-28 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl 
             focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
             transition-all duration-200 text-gray-800 placeholder-gray-500 
             text-sm outline-none hover:border-gray-300"
        />

        {/* Right side buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Clear button */}
          {query && (
            <button
              onClick={clearInput}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200"
              type="button"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Current location button - hide on mobile */}
          {showCurrentLocation && (
            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="p-2 text-blue-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 hidden sm:block"
              type="button"
              title="Use current location"
            >
              {isGettingLocation ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Loading spinner */}
          {isLoading && (
            <div className="p-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-700">{locationError}</span>
          </div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((place, index) => (
            <div
              key={`${place.place_id}-${index}`}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
              onMouseDown={(e) => {
                e.preventDefault(); // CRITICAL: Prevent input blur/focus events
                handleSelectAddress(place);
              }}
            >
              <div className="flex items-center">
                <div className="text-gray-700 text-sm leading-relaxed">
                  {place.display_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Location Suggestion */}
      {showCurrentLocation && !query && !showFavorites && (
        <div className="mt-2">
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex items-center justify-center space-x-2">
              {isGettingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-blue-700 font-medium text-sm">
                    Getting location...
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-blue-700 font-medium text-sm">
                    Use Current Location
                  </span>
                </>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Quick Pick Modal */}
      {showQuickPick && (
        <QuickLocationPicker
          onSelectLocation={(location) => {
            justSelectedRef.current = true; // ADD THIS
            setQuery(location.address);
            onAddressSelect(location);
            setShowQuickPick(false);
          }}
          onClose={() => setShowQuickPick(false)}
          isPickup={isPickup}
        />
      )}
    </div>
  );
}

export default AddressInput;
