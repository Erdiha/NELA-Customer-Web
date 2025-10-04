// /* eslint-disable no-unused-vars */
// // Create as src/components/FavoriteLocations.jsx

// import React, { useState, useEffect } from "react";

// const FavoriteLocations = ({
//   onSelectLocation,
//   currentUser,
//   isPickup = true,
// }) => {
//   const [favorites, setFavorites] = useState([]);
//   const [recentLocations, setRecentLocations] = useState([]);
//   const [showAddFavorite, setShowAddFavorite] = useState(false);
//   const [newFavorite, setNewFavorite] = useState({
//     name: "",
//     address: "",
//     lat: null,
//     lng: null,
//   });

//   useEffect(() => {
//     loadFavoriteLocations();
//     loadRecentLocations();
//   }, [currentUser]);

//   const loadFavoriteLocations = () => {
//     const userId = currentUser?.id || "guest";
//     const savedFavorites = localStorage.getItem(`favorites_${userId}`);
//     if (savedFavorites) {
//       setFavorites(JSON.parse(savedFavorites));
//     } else {
//       // Default favorites for new users
//       // const defaultFavorites = [
//       //   {
//       //     id: "home",
//       //     name: "🏠 Home",
//       //     address: "",
//       //     lat: null,
//       //     lng: null,
//       //     isEmpty: true,
//       //   },
//       //   {
//       //     id: "work",
//       //     name: "🏢 Work",
//       //     address: "",
//       //     lat: null,
//       //     lng: null,
//       //     isEmpty: true,
//       //   },
//       // ];
//       setFavorites(defaultFavorites);
//     }
//   };

//   const loadRecentLocations = () => {
//     const userId = currentUser?.id || "guest";
//     const saved = localStorage.getItem(`recent_locations_${userId}`);
//     if (saved) {
//       setRecentLocations(JSON.parse(saved));
//     }
//   };

//   const saveFavoriteLocations = (updatedFavorites) => {
//     const userId = currentUser?.id || "guest";
//     localStorage.setItem(
//       `favorites_${userId}`,
//       JSON.stringify(updatedFavorites)
//     );
//     setFavorites(updatedFavorites);
//   };

//   const saveRecentLocation = (location) => {
//     const userId = currentUser?.id || "guest";
//     const recent = [...recentLocations];

//     // Remove if already exists
//     const existingIndex = recent.findIndex(
//       (loc) => loc.address === location.address
//     );
//     if (existingIndex > -1) {
//       recent.splice(existingIndex, 1);
//     }

//     // Add to beginning
//     recent.unshift({
//       ...location,
//       timestamp: new Date().toISOString(),
//     });

//     // Keep only last 5
//     const updatedRecent = recent.slice(0, 5);
//     localStorage.setItem(
//       `recent_locations_${userId}`,
//       JSON.stringify(updatedRecent)
//     );
//     setRecentLocations(updatedRecent);
//   };

//   const handleSelectLocation = (location) => {
//     if (location.isEmpty) {
//       // Show add favorite form
//       setNewFavorite({
//         ...newFavorite,
//         name: location.name,
//         id: location.id,
//       });
//       setShowAddFavorite(true);
//       return;
//     }

//     onSelectLocation({
//       address: location.address,
//       lat: location.lat,
//       lng: location.lng,
//     });

//     // Save to recent if not a favorite
//     if (!location.isFavorite) {
//       saveRecentLocation(location);
//     }
//   };

//   const handleAddFavorite = (addressData) => {
//     const updatedFavorites = favorites.map((fav) =>
//       fav.id === newFavorite.id
//         ? {
//             ...fav,
//             address: addressData.address,
//             lat: addressData.lat,
//             lng: addressData.lng,
//             isEmpty: false,
//           }
//         : fav
//     );

//     saveFavoriteLocations(updatedFavorites);
//     setShowAddFavorite(false);
//     setNewFavorite({ name: "", address: "", lat: null, lng: null });

//     // Select the location
//     onSelectLocation(addressData);
//   };

//   const handleRemoveFavorite = (favoriteId) => {
//     const updatedFavorites = favorites.map((fav) =>
//       fav.id === favoriteId
//         ? { ...fav, address: "", lat: null, lng: null, isEmpty: true }
//         : fav
//     );
//     saveFavoriteLocations(updatedFavorites);
//   };

//   const addCustomFavorite = () => {
//     setNewFavorite({
//       name: "",
//       address: "",
//       lat: null,
//       lng: null,
//       id: `custom_${Date.now()}`,
//     });
//     setShowAddFavorite(true);
//   };

//   const filledFavorites = favorites.filter((fav) => !fav.isEmpty);
//   const emptyFavorites = favorites.filter((fav) => fav.isEmpty);

//   return (
//     <div className="favorite-locations space-y-4">
//       {/* Quick Access Favorites */}
//       {filledFavorites.length > 0 && (
//         <div>
//           <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//             <span className="text-lg mr-2">⭐</span>
//             Favorite Places
//           </h4>
//           <div className="space-y-2">
//             {filledFavorites.map((favorite) => (
//               <div
//                 key={favorite.id}
//                 className="group bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 cursor-pointer"
//                 onClick={() =>
//                   handleSelectLocation({ ...favorite, isFavorite: true })
//                 }
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-2">
//                       <span className="font-medium text-blue-800">
//                         {favorite.name}
//                       </span>
//                     </div>
//                     <p className="text-sm text-blue-600 mt-1 truncate">
//                       {favorite.address}
//                     </p>
//                   </div>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleRemoveFavorite(favorite.id);
//                     }}
//                     className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all duration-200"
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M6 18L18 6M6 6l12 12"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Empty Favorite Slots */}
//       {emptyFavorites.length > 0 && (
//         <div onClick={(e) => e.stopPropagation()}>
//           <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//             <span className="text-lg mr-2">➕</span>
//             Add Favorites
//           </h4>
//           <div className="space-y-2">
//             {emptyFavorites.map((favorite) => (
//               <button
//                 key={favorite.id}
//                 type="button"
//                 onClick={() => handleSelectLocation(favorite)}
//                 className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100 transition-all duration-200 group"
//               >
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-gray-200 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-all duration-200">
//                     <svg
//                       className="w-5 h-5 text-gray-500 group-hover:text-blue-600"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 4v16m8-8H4"
//                       />
//                     </svg>
//                   </div>
//                   <div className="text-left">
//                     <p className="font-medium text-gray-700 group-hover:text-blue-800">
//                       Set {favorite.name}
//                     </p>
//                     <p className="text-sm text-gray-500 group-hover:text-blue-600">
//                       Add your{" "}
//                       {favorite.name.includes("Home") ? "home" : "work"} address
//                     </p>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Add Custom Favorite */}
//       <button
//         onClick={addCustomFavorite}
//         type="button"
//         className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
//       >
//         <div className="flex items-center justify-center space-x-2">
//           <svg
//             className="w-5 h-5 text-green-600"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M12 4v16m8-8H4"
//             />
//           </svg>
//           <span className="font-medium text-green-700">
//             Add Custom Favorite
//           </span>
//         </div>
//       </button>

//       {/* Recent Locations */}
//       {recentLocations.length > 0 && (
//         <div>
//           <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//             <span className="text-lg mr-2">🕒</span>
//             Recent Places
//           </h4>
//           <div className="space-y-2">
//             {recentLocations.map((location, index) => (
//               <button
//                 key={index}
//                 type="button"
//                 onClick={() => handleSelectLocation(location)}
//                 className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-3 transition-all duration-200 text-left group"
//               >
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
//                     <svg
//                       className="w-4 h-4 text-gray-500"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                       />
//                     </svg>
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-sm text-gray-800 truncate">
//                       {location.address}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {new Date(location.timestamp).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Add Favorite Modal */}
//       {showAddFavorite && (
//         <AddFavoriteModal
//           favorite={newFavorite}
//           onSave={handleAddFavorite}
//           onCancel={() => {
//             setShowAddFavorite(false);
//             setNewFavorite({ name: "", address: "", lat: null, lng: null });
//           }}
//         />
//       )}
//     </div>
//   );
// };

// // Add Favorite Modal Component
// const AddFavoriteModal = ({ favorite, onSave, onCancel }) => {
//   const [address, setAddress] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [customName, setCustomName] = useState(favorite.name || "");

//   const searchAddresses = async (query) => {
//     if (query.length < 3) {
//       setSuggestions([]);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//           query
//         )}&limit=5&countrycodes=us`
//       );
//       const data = await response.json();
//       setSuggestions(data);
//     } catch (error) {
//       console.error("Error searching addresses:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddressChange = (e) => {
//     const value = e.target.value;
//     setAddress(value);

//     if (value.length > 3) {
//       const timer = setTimeout(() => searchAddresses(value), 500);
//       return () => clearTimeout(timer);
//     }
//   };

//   const handleSelectSuggestion = (suggestion) => {
//     setAddress(suggestion.display_name);
//     setSuggestions([]);

//     onSave({
//       name: customName || favorite.name,
//       address: suggestion.display_name,
//       lat: parseFloat(suggestion.lat),
//       lng: parseFloat(suggestion.lon),
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-md">
//         <h3 className="text-xl font-bold mb-4">Add Favorite Location</h3>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Name
//             </label>
//             <input
//               type="text"
//               value={customName}
//               onChange={(e) => setCustomName(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="e.g., Home, Work, Gym"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Address
//             </label>
//             <div className="relative">
//               <input
//                 type="text"
//                 value={address}
//                 onChange={handleAddressChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter address"
//               />

//               {isLoading && (
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
//                 </div>
//               )}
//             </div>

//             {suggestions.length > 0 && (
//               <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
//                 {suggestions.map((suggestion, index) => (
//                   <button
//                     key={index}
//                     onClick={() => handleSelectSuggestion(suggestion)}
//                     className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
//                   >
//                     <p className="text-sm">{suggestion.display_name}</p>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex space-x-3 mt-6">
//           <button
//             onClick={onCancel}
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => {
//               if (suggestions.length > 0) {
//                 handleSelectSuggestion(suggestions[0]);
//               }
//             }}
//             disabled={!address || suggestions.length === 0}
//             className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FavoriteLocations;
