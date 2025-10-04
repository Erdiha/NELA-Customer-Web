/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ScheduleCalendar({ isOpen, onClose, onSelectDateTime, minDateTime }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState([]);
  const [showCalendar, setShowCalendar] = useState(true);

  useEffect(() => {
    if (selectedDate) {
      generateAvailableTimes();
      setShowCalendar(false);
    }
  }, [selectedDate]);

  const generateAvailableTimes = () => {
    const times = [];
    const today = new Date();
    const selectedDateObj = new Date(selectedDate + "T00:00:00");

    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = new Date(
          selectedDate +
            `T${String(hour).padStart(2, "0")}:${String(minute).padStart(
              2,
              "0"
            )}:00`
        );

        if (timeSlot > today) {
          times.push({
            time: timeSlot,
            display: timeSlot.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          });
        }
      }
    }
    setAvailableTimes(times);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
    setSelectedTime("");
  };

  const handleTimeSelect = (timeSlot) => {
    setSelectedTime(timeSlot.display);
    onSelectDateTime(timeSlot.time);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const resetSelection = () => {
    setShowCalendar(true);
    setSelectedTime("");
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getFormattedDate = () => {
    if (!selectedDate) return "";
    const date = new Date(selectedDate + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 "
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl ">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Schedule Your Ride</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
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
            </motion.button>
          </div>
          <p className="text-blue-100 text-sm">
            {selectedDate
              ? "Pick your preferred time"
              : "Select your preferred date and time"}
          </p>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <AnimatePresence>
            {selectedDate && !showCalendar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-blue-600 font-semibold mb-1">
                        SELECTED DATE
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {getFormattedDate()}
                      </div>
                    </div>
                    <button
                      onClick={resetSelection}
                      className="ml-4 px-4 py-2 bg-white border-2 border-blue-300 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-blue-700 text-sm"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </motion.button>
                  <motion.h3
                    key={currentMonth.getMonth()}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg font-semibold text-gray-800"
                  >
                    {monthNames[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </motion.h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
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
                  </motion.button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <motion.div
                  key={currentMonth.getMonth()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-7 gap-1"
                >
                  {days.map((date, index) => {
                    const isSelected =
                      date &&
                      selectedDate ===
                        `${date.getFullYear()}-${String(
                          date.getMonth() + 1
                        ).padStart(2, "0")}-${String(date.getDate()).padStart(
                          2,
                          "0"
                        )}`;

                    return (
                      <motion.button
                        key={index}
                        whileHover={!isDateDisabled(date) ? { scale: 1.1 } : {}}
                        whileTap={!isDateDisabled(date) ? { scale: 0.95 } : {}}
                        onClick={() => date && handleDateSelect(date)}
                        disabled={isDateDisabled(date)}
                        className={`
                          h-12 text-sm rounded-lg transition-all duration-200 font-medium
                          ${!date ? "invisible" : ""}
                          ${
                            isDateDisabled(date)
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          }
                          ${
                            isSelected ? "bg-blue-600 text-white shadow-lg" : ""
                          }
                        `}
                      >
                        {date?.getDate()}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-md font-semibold text-gray-800 mb-3">
                  Available Times
                </h4>
                <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                  {availableTimes.map((timeSlot, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02, duration: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTimeSelect(timeSlot)}
                      className={`
                        p-4 text-sm rounded-xl border-2 transition-all duration-200 font-semibold
                        ${
                          selectedTime === timeSlot.display
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        }
                      `}
                    >
                      {timeSlot.display}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 
                             text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Confirm: {getFormattedDate()} at {selectedTime}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ScheduleCalendar;
