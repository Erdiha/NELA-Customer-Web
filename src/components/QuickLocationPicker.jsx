/* eslint-disable no-unused-vars */
import React from "react";
import { QUICK_LOCATIONS } from "../data/serviceAreas";

const QuickLocationPicker = ({
  onSelectLocation,
  onClose,
  isPickup = true,
}) => {
  const handleSelect = (location) => {
    onSelectLocation({
      address: location.address,
      lat: location.lat,
      lng: location.lng,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">Quick Locations</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
          </div>
          <p className="text-sm text-gray-600">Popular pickup/drop-off spots</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[500px]">
          <div className="grid grid-cols-1 gap-3">
            {QUICK_LOCATIONS.map((location) => (
              <button
                key={location.id}
                onClick={() => handleSelect(location)}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors text-2xl">
                    {location.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {location.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {location.address}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickLocationPicker;
