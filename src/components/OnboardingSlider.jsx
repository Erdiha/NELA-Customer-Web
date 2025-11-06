/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OnboardingSlider = ({ onComplete, showSkip = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [containerHeight, setContainerHeight] = useState(0);
  const contentRef = useRef(null);

  const slides = [
    {
      id: "welcome",
      shortName: "Welcome",
      icon: "👋",
      title: "Welcome to NELA",
      subtitle: "Northeast LA's Community Rideshare",
      description:
        "NELA is a non-profit rideshare service built for our community, by our community. We're not Uber or Lyft - we're your neighbors working together for affordable, reliable transportation.",
      color: "from-blue-500 to-cyan-500",
      keywords: "welcome intro community nonprofit",
    },
    {
      id: "pricing",
      shortName: "Pricing",
      icon: "💰",
      title: "20% Lower Prices",
      subtitle: "Price Match Guarantee",
      description:
        "We automatically match Uber/Lyft prices and apply 20% discount. No surge pricing. No hidden fees. Show your driver a competitor's quote and we'll beat it on the spot.",
      color: "from-green-500 to-emerald-500",
      keywords: "pricing cost savings discount price match guarantee",
      comparison: { uber: "$25.00", lyft: "$24.50", nela: "$20.00" },
    },
    {
      id: "drivers",
      shortName: "Drivers",
      icon: "🤝",
      title: "Fair Driver Pay",
      subtitle: "90% Goes to Drivers",
      description:
        "Our drivers earn 90% of every fare - compared to Uber's and Lyft's average 40% - 55%. Better pay means experienced, professional drivers who care about your experience.",
      color: "from-purple-500 to-pink-500",
      keywords: "drivers pay earnings fair wages",
      driverPay: { uber: "40% - 55%", lyft: "40% - 55%", nela: "90%" },
    },
    {
      id: "how-it-works",
      shortName: "How",
      icon: "🚀",
      title: "How It Works",
      subtitle: "Simple 3-Step Process",
      description:
        "1️⃣ Enter pickup & destination\n2️⃣ Get instant guaranteed price\n3️⃣ Book - driver assigned in minutes\n\nTrack in real-time. Pay securely. Rate your experience.",
      color: "from-indigo-500 to-blue-500",
      keywords: "how to use book ride process steps tutorial",
    },
    {
      id: "service-area",
      shortName: "Areas",
      icon: "🗺️",
      title: "Service Area",
      subtitle: "We Know Northeast LA",
      description:
        "We serve: Eagle Rock, Glendale, Highland Park, Cypress Park, Mount Washington, Glassell Park, and all major LA airports. We are constantly trying to reach every neighborhood.",
      color: "from-orange-500 to-red-500",
      keywords: "service area locations coverage neighborhoods",
    },
    {
      id: "payment",
      shortName: "Payment",
      icon: "💳",
      title: "Payment Options",
      subtitle: "Multiple Ways to Pay",
      description:
        "• Credit/Debit Cards\n• Venmo (Coming Soon)\n• Cash App (Coming Soon)\n• PayPal  (Coming Soon)\n• Cash",
      color: "from-teal-500 to-green-500",
      keywords: "payment methods cards venmo cashapp paypal cash",
    },
    {
      id: "safety",
      shortName: "Safety",
      icon: "🛡️",
      title: "Safety First",
      subtitle: "Your Security Matters",
      description:
        "• All drivers background-checked\n• Real-time ride tracking\n• Share trip link with friends/family\n•  Emergency: Call 911 or use in-app SOS",
      color: "from-red-500 to-orange-500",
      keywords: "safety security background check emergency",
    },
    {
      id: "community",
      shortName: "Impact",
      icon: "🏘️",
      title: "Community Impact",
      subtitle: "More Than Just Rides",
      description:
        "How we help our community:\n• 5% extra discount for seniors & students\n• Drivers earn 90% (vs 48-55% elsewhere)\n• Lower prices for everyone\n• Built on neighborhood trust\n• Keeping money in our community",
      color: "from-purple-500 to-indigo-500",
      keywords:
        "community nonprofit impact social good seniors students discounts",
    },
  ];

  // Calculate max height on mount
  useEffect(() => {
    const calculateMaxHeight = () => {
      let maxHeight = 0;
      slides.forEach((_, index) => {
        setCurrentSlide(index);
        setTimeout(() => {
          if (contentRef.current) {
            const height = contentRef.current.scrollHeight;
            if (height > maxHeight) {
              maxHeight = height;
              setContainerHeight(height);
            }
          }
        }, 0);
      });
      setCurrentSlide(0);
    };

    calculateMaxHeight();
  }, []);

  const filteredSlides = searchQuery
    ? slides.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : slides;

  useEffect(() => {
    // Reset or clamp index when results change
    if (currentSlide >= (filteredSlides?.length ?? 0)) {
      setCurrentSlide(0);
    }
  }, [searchQuery, filteredSlides?.length]);

  const currentSlideData =
    filteredSlides && filteredSlides.length > 0
      ? filteredSlides[Math.min(currentSlide, filteredSlides.length - 1)]
      : null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-red-50 flex flex-col">
      {/* Fixed Header */}
      <header className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="h-12 sm:h-14 px-3 sm:px-4 flex items-center justify-between gap-2 max-w-7xl mx-auto">
          <button
            onClick={onComplete}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation flex-shrink-0"
          >
            Skip
          </button>

          <div className="flex-1 max-w-md min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <span className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap flex-shrink-0">
            {currentSlide + 1}/{filteredSlides.length}
          </span>
        </div>
      </header>

      {/* Mobile Topic Buttons - Bottom Fixed */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg z-50 pb-safe">
        <div className="px-1.5 sm:px-2 py-1.5 sm:py-2">
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
            {filteredSlides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className={`flex flex-col items-center  justify-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg transition-all touch-manipulation ${
                  currentSlide === index
                    ? `bg-gradient-to-r ${slide.color} text-white shadow-md scale-105`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="text-md md:text-xl mb-0.5">{slide.icon}</span>
                <span className="text-[14px] sm:text-[9px] font-medium text-center leading-tight">
                  {slide.shortName}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden ">
        <div className="h-full max-w-7xl mx-auto ">
          <div className="h-full grid lg:grid-cols-[280px,1fr] gap-6 ">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block overflow-y-auto p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">
                Topics
              </h3>
              <nav className="space-y-2">
                {filteredSlides.map((slide, index) => (
                  <motion.button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all  ${
                      currentSlide === index
                        ? `bg-gradient-to-r ${slide.color} text-white shadow-lg`
                        : "bg-white text-gray-700 border border-gray-100 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{slide.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {slide.title}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            currentSlide === index
                              ? "text-white/80"
                              : "text-gray-500"
                          }`}
                        >
                          {slide.subtitle}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </nav>
            </aside>

            {/* Content Area */}
            <main className="h-full overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-24 sm:pb-32 lg:pb-6">
              <div className="max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    ref={contentRef}
                    style={{ minHeight: containerHeight || "auto" }}
                    className="bg-white/50 min-h rounded-xl sm:rounded-2xl md:mt-10 mt-0 p-4 sm:p-6 md:p-10 shadow-lg relative flex flex-col justify-between"
                  >
                    <div className="flex  flex-col  h-full ">
                      {/* Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className={`inline-flex items-center justify-center w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-r ${currentSlideData.color} mb-4 sm:mb-6 shadow-xl`}
                      >
                        <span className="text-2xl md:text-4xl">
                          {currentSlideData.icon}
                        </span>
                      </motion.div>
                      {/* Title */}
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight"
                      >
                        {currentSlideData.title}
                      </motion.h1>
                      {/* Subtitle */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className={`text-base sm:text-lg lg:text-xl font-semibold bg-gradient-to-r ${currentSlideData.color} bg-clip-text text-transparent mb-4 sm:mb-6`}
                      >
                        {currentSlideData.subtitle}
                      </motion.p>
                      {/* Description */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line mb-6 sm:mb-8"
                      >
                        {currentSlideData.description}
                      </motion.p>
                    </div>

                    {/* Comparison Cards */}
                    {currentSlideData.comparison && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8"
                      >
                        <div className="bg-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                          <p className="text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2">
                            Uber
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-gray-700">
                            {currentSlideData.comparison.uber}
                          </p>
                        </div>
                        <div className="bg-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                          <p className="text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2">
                            Lyft
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-gray-700">
                            {currentSlideData.comparison.lyft}
                          </p>
                        </div>
                        <div className="bg-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border-2 border-green-400">
                          <p className="text-[10px] sm:text-xs text-green-700 font-bold mb-1 sm:mb-2">
                            NELA ✨
                          </p>
                          <p className="text-lg sm:text-2xl font-bold text-green-600">
                            {currentSlideData.comparison.nela}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {currentSlideData.driverPay && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-3 gap-3 mb-8"
                      >
                        <div className="bg-gray-100 rounded-xl md:p-4 text-center p-2">
                          <p className="text-sm md:text-xl text-gray-600 mb-2">
                            Uber
                          </p>
                          <p className="text-sm font-bold md:text-2xl text-gray-700">
                            {currentSlideData.driverPay.uber}
                          </p>
                        </div>
                        <div className="bg-gray-100 rounded-xl md:p-4 text-center p-2">
                          <p className="text-sm text-gray-600 mb-2 md:text-xl">
                            Lyft
                          </p>
                          <p className="text-sm font-bold md:text-2xl text-gray-700">
                            {currentSlideData.driverPay.lyft}
                          </p>
                        </div>
                        <div className="bg-green-100 rounded-xl md:p-4 p-2 text-center border-2 border-green-400">
                          <p className="text-sm text-green-900 font-bold mb-2  md:text-xl">
                            NELA
                          </p>
                          <p className="text-lg font-bold text-green-600 md:text-3xl">
                            {currentSlideData.driverPay.nela}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Navigation */}
                    <div className="flex w-full items-center  justify-between border-t border-gray-200 pt-3 md:pt-4 mt-4 md:mt-6">
                      <button
                        onClick={() =>
                          setCurrentSlide(Math.max(0, currentSlide - 1))
                        }
                        disabled={currentSlide === 0}
                        className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                      >
                        ← Prev
                      </button>

                      <div className="hidden sm:flex gap-2">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`transition-all rounded-full ${
                              i === currentSlide
                                ? "bg-blue-500 w-6 sm:w-8 h-1.5 sm:h-2"
                                : "bg-gray-300 w-1.5 sm:w-2 h-1.5 sm:h-2"
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          currentSlide === filteredSlides.length - 1
                            ? onComplete()
                            : setCurrentSlide(currentSlide + 1)
                        }
                        className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all touch-manipulation"
                      >
                        {currentSlide === filteredSlides.length - 1
                          ? "Start"
                          : "Next →"}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlider;
