import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target, Book, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useStudy } from '../../context/StudyContext';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

// Gradient colors for subjects (to mimic mock data)
const gradientColors = [
  'from-purple-500 to-purple-600',
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-red-500 to-red-600',
  'from-yellow-500 to-yellow-600',
  'from-indigo-500 to-indigo-600'
];

const CompletedSubjects = () => {
  const { studyData, fetchCompletedSubjects } = useStudy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch completed subjects on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchCompletedSubjects();
        setError(null);
      } catch (err) {
        setError('Failed to fetch completed subjects.');
        toast.error('Failed to load completed subjects. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debounced refresh function
  const handleRefresh = debounce(async () => {
    setLoading(true);
    try {
      await fetchCompletedSubjects();
      setError(null);
      toast.success('Data refreshed successfully.');
    } catch (err) {
      setError('Failed to refresh data.');
      toast.error('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, 1000);

  // Map backend data to UI format
  const completedSubjects = (studyData.completedSubjects || []).map((subject, index) => ({
    id: subject._id || subject.sessionId || index, // Use _id or sessionId from backend
    subject: subject.subject,
    completedAt: new Date(subject.endTime), // Ensure it's a Date object
    targetTime: Math.round(subject.targetTime / 60), // Convert seconds to minutes
    actualTime: Math.round(subject.actualTime / 60), // Convert seconds to minutes
    color: gradientColors[index % gradientColors.length] // Assign color dynamically
  }));

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getPerformance = (target, actual) => {
    const percentage = (actual / target) * 100;
    if (percentage >= 100) return { text: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    if (percentage >= 80) return { text: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' };
    return { text: 'Needs Focus', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/20' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex justify-between items-center"
      >
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center space-x-2">
            <CheckCircle className="text-green-600" size={20} />
            <span>Today's Completed Subjects</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <RefreshCw className="mx-auto text-gray-400 animate-spin" size={48} />
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading completed subjects...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 text-blue-600 dark:text-blue-400 underline"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Stats Summary */}
      {!loading && !error && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="text-white" size={20} />
            </div>
            <p className="text-2xl font-bold text-green-600">{completedSubjects.length}</p>
            <p className="text-xs text-green-600 font-medium">Completed</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="text-white" size={20} />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatTime(completedSubjects.reduce((sum, s) => sum + s.actualTime, 0))}
            </p>
            <p className="text-xs text-blue-600 font-medium">Total Time</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Target className="text-white" size={20} />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {completedSubjects.length
                ? Math.round(
                  (completedSubjects.reduce((sum, s) => sum + (s.actualTime / s.targetTime) * 100, 0) /
                    completedSubjects.length)
                )
                : 0}
              %
            </p>
            <p className="text-xs text-purple-600 font-medium">Avg Completion</p>
          </div>
        </motion.div>
      )}

      {/* Completed Subjects List */}
      {!loading && !error && (
        <div className="space-y-4">
          {completedSubjects.map((subject, index) => {
            const performance = getPerformance(subject.targetTime, subject.actualTime);

            return (
              <motion.div
                key={subject.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * (index + 2) }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Book className="text-white" size={20} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-800 dark:text-white">
                        {subject.subject}
                      </h4>
                      <div className={`px-2 py-1 rounded-lg ${performance.bgColor}`}>
                        <span className={`text-xs font-medium ${performance.color}`}>
                          {performance.text}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>Completed at {format(subject.completedAt, 'h:mm a')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        <div className="text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Target: </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatTime(subject.targetTime)}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Actual: </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatTime(subject.actualTime)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <CheckCircle className="text-green-500" size={16} />
                        <span className="text-xs font-medium text-green-600">
                          {Math.round((subject.actualTime / subject.targetTime) * 100)}% Complete
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((subject.actualTime / subject.targetTime) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && !error && completedSubjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">
            No subjects completed yet today.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Start a study session to see your progress here!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CompletedSubjects;