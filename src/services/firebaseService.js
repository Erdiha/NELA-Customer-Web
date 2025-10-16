/* eslint-disable no-unused-vars */
import { db, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// ✅ Smart timeout calculation
function calculateTimeoutMinutes(isScheduled, scheduledDateTime) {
  if (!isScheduled) return 5;
  const now = new Date();
  const rideTime = new Date(scheduledDateTime);
  const hoursUntil = (rideTime - now) / (1000 * 60 * 60);
  if (hoursUntil < 0) return 5;
  if (hoursUntil < 1) return 5;
  if (hoursUntil < 6) return 15;
  return 30;
}

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
};

export const onAuthStateChange = (callback) =>
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        callback(
          userDoc.exists()
            ? userDoc.data()
            : { uid: user.uid, email: user.email, name: "User" }
        );
      } catch {
        callback({ uid: user.uid, email: user.email, name: "User" });
      }
    } else {
      callback(null);
    }
  });

export const createUserAccount = async (email, password, userData) => {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userDoc = {
      uid: user.uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      createdAt: serverTimestamp(),
      totalRides: 0,
      favorites: [],
      recentLocations: [],
    };
    await setDoc(doc(db, "users", user.uid), userDoc);
    return { success: true, user: userDoc };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInUser = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: { uid: user.uid, email, name: "User" } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export async function createRideRequest(rideData) {
  try {
    const timeoutMinutes = calculateTimeoutMinutes(
      rideData.isScheduled,
      rideData.scheduledDateTime
    );
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const completeRideData = {
      // Customer info
      customerName: rideData.customerName,
      passengerName: rideData.customerName,
      customerPhone: rideData.customerPhone,
      customerEmail: rideData.customerEmail || null,
      customerId: rideData.customerId || null,

      // Location info
      pickupAddress: rideData.pickupAddress,
      pickupLocation: rideData.pickupAddress,
      destinationAddress: rideData.destinationAddress,
      destination: rideData.destinationAddress,
      pickupCoords: rideData.pickupCoords,
      destinationCoords: rideData.destinationCoords,
      pickup: {
        latitude: rideData.pickupCoords.lat,
        longitude: rideData.pickupCoords.lng,
        address: rideData.pickupAddress,
      },
      dropoff: {
        latitude: rideData.destinationCoords.lat,
        longitude: rideData.destinationCoords.lng,
        address: rideData.destinationAddress,
      },

      // Pricing info
      estimatedPrice: rideData.estimatedPrice,
      estimatedFare: rideData.estimatedPrice,
      fare: rideData.estimatedPrice,
      distance: rideData.distance,
      estimatedTime: rideData.estimatedTime,

      // PAYMENT INFO - PaymentIntent
      paymentMethod: rideData.paymentMethod || null,
      paymentIntentId: rideData.paymentIntentId || null,
      paymentStatus: rideData.paymentStatus || "pending",

      // Ride info
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isScheduled: rideData.isScheduled || false,
      scheduledDateTime: rideData.scheduledDateTime || null,
      isGuest: rideData.isGuest || false,
      passengerRating: 5.0,
      pendingTimeoutMinutes: timeoutMinutes,
      timeoutAt: new Date(Date.now() + timeoutMs),
    };

    console.log("🔍 Creating ride with data:", completeRideData);
    const docRef = await addDoc(collection(db, "rides"), completeRideData);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating ride:", error);
    throw error;
  }
}

export function subscribeToRideUpdates(rideId, callback) {
  const rideRef = doc(db, "rides", rideId);
  return onSnapshot(
    rideRef,
    (snap) =>
      snap.exists()
        ? callback({ id: snap.id, ...snap.data() })
        : callback(null),
    () => callback(null)
  );
}

export async function getRideDetails(rideId) {
  const rideRef = doc(db, "rides", rideId);
  const rideDoc = await getDoc(rideRef);
  return rideDoc.exists() ? { id: rideDoc.id, ...rideDoc.data() } : null;
}

export const updateRideStatus = async (rideId, status, additionalData = {}) => {
  const rideRef = doc(db, "rides", rideId);
  await updateDoc(rideRef, {
    status,
    updatedAt: serverTimestamp(),
    ...additionalData,
  });
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
