import React, { useState } from "react";

const ReviewModal = ({ rideData, onSubmit, onSkip }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickTags = [
    { id: "clean", label: "Clean Car", emoji: "🧼" },
    { id: "on_time", label: "On Time", emoji: "⏰" },
    { id: "friendly", label: "Friendly", emoji: "😊" },
    { id: "professional", label: "Professional", emoji: "👔" },
    { id: "safe_driver", label: "Safe Driver", emoji: "🛡️" },
    { id: "comfortable", label: "Comfortable", emoji: "🪑" },
  ];

  const quickComments = [
    "Great driver! Would ride again.",
    "Very professional and friendly.",
    "Clean car and smooth ride.",
    "Arrived on time, safe driver.",
    "Excellent service overall!",
  ];

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        rideId: rideData.id,
        driverId: rideData.driverId,
        driverName: rideData.driverName,
        customerId: rideData.customerId,
        customerName: rideData.customerName,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Rate Your Ride
          </h2>
          <p className="text-gray-600 text-sm">
            How was your experience with {rideData.driverName || "your driver"}?
          </p>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <svg
                  className={`w-12 h-12 ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500">
            {rating === 0
              ? "Tap to rate"
              : rating === 5
              ? "Excellent!"
              : rating === 4
              ? "Great!"
              : rating === 3
              ? "Good"
              : rating === 2
              ? "Fair"
              : "Needs improvement"}
          </p>
        </div>

        {/* Quick Tags */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            What did you like? (Optional)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  selectedTags.includes(tag.id)
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300 text-gray-700"
                }`}
              >
                <span className="mr-2">{tag.emoji}</span>
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Comment Buttons */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Quick comments:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickComments.map((text, idx) => (
              <button
                key={idx}
                onClick={() => setComment(text)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Additional feedback (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share more details about your experience..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {comment.length}/500
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your review helps us maintain quality service
        </p>
      </div>
    </div>
  );
};

export default ReviewModal;
