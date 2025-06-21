import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';
import axios from 'axios';

// Determine today's weekday (e.g., "monday")
const getTodayKey = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

const TimetableView = () => {
  const [activeTimetable, setActiveTimetable] = useState(null);
  const [todayKey, setTodayKey] = useState(getTodayKey());
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchActiveTimetable();
  }, []);

  const fetchActiveTimetable = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/study/timetables`);
      const active = res.data.find(t => t.isActive);
      setActiveTimetable(active || null);
    } catch (error) {
      console.error('Error fetching active timetable:', error);
    }
  };

  const todaySchedule = activeTimetable?.schedule?.[todayKey] || [];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return (
    <div className="space-y-6">
      {/* Today’s Schedule */}
      {activeTimetable && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Calendar className="text-primary-600" size={20} />
            <span>Today’s Schedule ({todayKey.charAt(0).toUpperCase() + todayKey.slice(1)})</span>
          </h3>

          {todaySchedule.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No sessions scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((slot, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {slot.subject.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-white">{slot.subject}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {slot.time} | {slot.duration} min
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
          <Clock className="text-primary-600" size={20} />
          <span>Current Active Timetable</span>
        </h3>

        {!activeTimetable ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">No active timetable found.</p>
        ) : (
          <>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white">{activeTimetable.name}</h4>
              {activeTimetable.description && (
                <p className="text-sm text-gray-500 dark:text-gray-300">{activeTimetable.description}</p>
              )}
            </div>

            {daysOfWeek.map(day => (
              <div key={day} className="mb-6">
                <h5 className="text-md font-semibold text-gray-700 dark:text-gray-300 capitalize mb-2 border-b pb-1 border-gray-200 dark:border-gray-600">
                  {day}
                </h5>

                {activeTimetable.schedule?.[day]?.length ? (
                  <div className="space-y-3">
                    {activeTimetable.schedule[day].map((slot, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {slot.subject.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-white">{slot.subject}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{slot.time} | {slot.duration} min</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No schedule for this day.</p>
                )}
              </div>
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TimetableView;
