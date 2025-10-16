import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export const getPendingReviews = async (userId) => {
  try {
    const ridesQuery = query(
      collection(db, "rides"),
      where("customerId", "==", userId),
      where("status", "==", "completed"),
      where("reviewed", "!=", true),
      orderBy("reviewed"),
      orderBy("updatedAt", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(ridesQuery);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  } catch (error) {
    console.error("Error getting pending reviews:", error);
    return null;
  }
};

export const submitReview = async (reviewData) => {
  try {
    // Add review to reviews collection
    await addDoc(collection(db, "reviews"), {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    // Mark ride as reviewed
    await updateDoc(doc(db, "rides", reviewData.rideId), {
      reviewed: true,
      reviewedAt: serverTimestamp(),
    });

    // ✅ Update driver's rating
    if (reviewData.driverId) {
      await updateDriverRating(reviewData.driverId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: error.message };
  }
};

// ✅ Calculate and update driver rating
const updateDriverRating = async (driverId) => {
  try {
    // Get all reviews for this driver
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("driverId", "==", driverId)
    );

    const snapshot = await getDocs(reviewsQuery);

    // Calculate average
    let totalRating = 0;
    let count = 0;

    snapshot.forEach((doc) => {
      totalRating += doc.data().rating;
      count++;
    });

    const averageRating = count > 0 ? (totalRating / count).toFixed(2) : 5.0;

    // Update driver document
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      rating: parseFloat(averageRating),
      totalReviews: count,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Driver ${driverId} rating updated to ${averageRating}`);
  } catch (error) {
    console.error("Error updating driver rating:", error);
    // Don't throw - review was still saved
  }
};
