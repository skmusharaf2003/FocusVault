import { useState, useEffect } from 'react';
import { Play, Clock, Book, ArrowRight, CheckCircle, PauseCircle, Target } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

const StudyTimer = ({ onNavigateToSession, studyContext }) => {
  const {
    studyData,
    fetchDashboardAndTimetables,
    fetchCompletedSubjects,
    startStudySession,
    getPendingSubjects,
    getPausedSubjects,
    getCompletedSubjects,
    getSubjectActualTime,
    getTodaySchedule
  } = useStudy(studyContext);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardAndTimetables();
    fetchCompletedSubjects();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = async () => {
    if (!selectedSubject) return;

    setLoading(true);
    try {
      await startStudySession(selectedSubject);
      onNavigateToSession();
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSession = async (subject) => {
    setLoading(true);
    try {
      await startStudySession(subject.subject);
      onNavigateToSession();
    } catch (error) {
      console.error('Failed to resume session:', error);
    } finally {
      setLoading(false);
    }
  };

  const todaySchedule = getTodaySchedule();
  const pendingSubjects = getPendingSubjects();
  const pausedSubjects = getPausedSubjects();
  const completedSubjects = getCompletedSubjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Continue Reading
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Resume your study sessions and complete today's schedule
        </p>
      </div>

      {/* Paused Sessions - Priority */}
      {pausedSubjects.length > 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
          <h3 className="text-lg font-bold text-orange-700 dark:text-orange-400 mb-4 flex items-center space-x-2">
            <PauseCircle size={20} />
            <span>Resume Paused Sessions</span>
          </h3>

          <div className="space-y-3">
            {pausedSubjects.map((subject, index) => {
              const actualTime = getSubjectActualTime(subject);
              const progress = (actualTime / (subject.duration * 60)) * 100;

              return (
                <div
                  key={`paused-${index}`}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-orange-200 dark:border-orange-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {subject.subject.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-white">
                          {subject.subject}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {subject.time} • {subject.duration} min
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(actualTime)} / {formatTime(subject.duration * 60)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResumeSession(subject)}
                      disabled={loading}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 hover:scale-105 transition-transform"
                    >
                      <Play size={16} />
                      <span>Resume</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Start New Session */}
      {pendingSubjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Target className="text-blue-600" size={20} />
            <span>Start New Session</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Subject from Today's Schedule
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a subject</option>
                {pendingSubjects.map((subject, index) => (
                  <option key={index} value={subject.subject}>
                    {subject.subject} ({subject.duration} min)
                  </option>
                ))}
              </select>
            </div>

            {selectedSubject && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedSubject.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {selectedSubject}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Duration: {pendingSubjects.find(s => s.subject === selectedSubject)?.duration} minutes
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Duration is automatically set from your timetable
                </p>
              </div>
            )}

            <button
              onClick={handleStartSession}
              disabled={!selectedSubject || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Play size={20} />
                  <span>Start Session</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Pending Subjects List */}
      {pendingSubjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Book className="text-blue-600" size={20} />
            <span>Pending Subjects</span>
          </h3>

          <div className="space-y-3">
            {pendingSubjects.map((subject, index) => (
              <div
                key={`pending-${index}`}
                onClick={() => setSelectedSubject(subject.subject)}
                className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer transition-all duration-200 ${selectedSubject === subject.subject
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                    <Clock className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {subject.subject}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {subject.time} • {subject.duration} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                    Pending
                  </span>
                  <ArrowRight className="text-gray-400" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Subjects Available */}
      {pendingSubjects.length === 0 && pausedSubjects.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            All Done! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You've completed all your scheduled subjects for today.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              Great job on staying consistent with your study schedule!
            </p>
          </div>
        </div>
      )}

      {/* Today's Progress Summary */}
      {todaySchedule.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center space-x-2">
            <Target size={20} />
            <span>Today's Progress</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedSubjects.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {pausedSubjects.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Paused</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingSubjects.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {todaySchedule.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTimer;