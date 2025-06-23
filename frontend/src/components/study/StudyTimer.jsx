import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Clock, Target, Book, CheckCircle, PauseCircle, Save, ArrowLeft, Home, Volume2, VolumeX } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

const StudyTimer = () => {
  const {
    currentSession,
    isStudying,
    activeSessions,
    startStudySession,
    pauseSession,
    resumeSession,
    updateSessionTime,
    endSession,
    studyData,
    fetchDashboardAndTimetables,
    getPausedSessions,
    getSessionBySubject,
    fetchCompletedSubjects
  } = useStudy();

  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [alarmMuted, setAlarmMuted] = useState(false);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const getTodayKey = () =>
    new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Initialize audio
  useEffect(() => {
    // Create audio context for alarm
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0.7;

    // Use a simple beep sound (data URL for a 1kHz tone)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Create a simple alarm sound using Web Audio API
    const createAlarmSound = () => {
      const sampleRate = audioContext.sampleRate;
      const duration = 0.5; // 0.5 seconds
      const frameCount = sampleRate * duration;
      const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
      const channelData = arrayBuffer.getChannelData(0);

      for (let i = 0; i < frameCount; i++) {
        // Create a beep sound at 800Hz
        channelData[i] = Math.sin(2 * Math.PI * 800 * i / sampleRate) * 0.3;
      }

      return arrayBuffer;
    };

    // Store the alarm sound
    audioRef.current.alarmBuffer = createAlarmSound();
    audioRef.current.audioContext = audioContext;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);




  // Fetch initial data
  useEffect(() => {
    fetchDashboardAndTimetables();
  }, []);

  // Local timer for elapsed time
  useEffect(() => {
    let interval;
    if (isStudying && currentSession) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;

          // Check if target time is reached
          const targetTime = getSubjectDuration(currentSession.subject) * 60;
          if (newTime >= targetTime && !isAlarmPlaying && !alarmMuted) {
            playAlarm();
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying, currentSession, isAlarmPlaying, alarmMuted]);

  // Sync local state with context
  useEffect(() => {
    if (currentSession) {
      setElapsedTime(currentSession.elapsedTime || 0);
      setSessionNotes(currentSession.notes || '');
    } else {
      setElapsedTime(0);
      setSessionNotes('');
      stopAlarm();
    }
  }, [currentSession]);

  // Play alarm when target time is reached

  const playAlarm = () => {
    if (alarmMuted) return;

    setIsAlarmPlaying(true);

    // Request permission for browser notifications
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // Show notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Study Session Complete! 🎉', {
        body: `You've completed your ${currentSession?.subject} study session!`,
        icon: '/android/android-launchericon-192-192.png',
        tag: 'study-complete',
      });
    }

    // Start continuous alarm
    playBeep();

    toast.success('🎉 Study session target reached!', {
      duration: 5000,
      position: 'top-center',
    });
  };

  const playBeep = () => {
    if (!audioRef.current?.audioContext || alarmMuted || intervalRef.current) return;

    const audioContext = audioRef.current.audioContext;
    const buffer = audioRef.current.alarmBuffer;

    // Function to play a single beep
    const playSingleBeep = () => {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      source.start();
      return source;
    };

    // Play beeps repeatedly
    let isPlaying = true;
    const scheduleBeep = () => {
      if (!isPlaying) return;
      const source = playSingleBeep();
      source.onended = () => {
        if (isPlaying) {
          scheduleBeep();
        }
      };
    };

    scheduleBeep();

    // Store cleanup function in intervalRef
    intervalRef.current = () => {
      isPlaying = false;
    };
  };

  const stopAlarm = () => {
    setIsAlarmPlaying(false);
    if (intervalRef.current) {
      intervalRef.current();
      intervalRef.current = null;
    }
  };

  const muteAlarm = () => {
    setAlarmMuted(true);
    stopAlarm();
  };

  // Debounced session time update with retry logic
  const saveSessionTime = debounce(async () => {
    if (currentSession && isStudying) {
      try {
        await updateSessionTime(currentSession.sessionId, elapsedTime, 3, 1000);
      } catch (error) {
        console.error('Failed to save session time:', error);
      }
    }
  }, 1000);


  const handleEndButtonClick = async () => {
    setIsEnding(true);
    try {
      await saveSessionTime();

      setTimeout(() => {
        handleEndSession();         // Clear session after a short delay
        setIsEnding(false);
      }, 300);
    } catch (err) {
      console.error("Error ending session:", err);
      setIsEnding(false);
    }
  };

  // Handle window visibility and page unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveSessionTime();
      }
    };

    const handleBeforeUnload = () => {
      if (currentSession && isStudying) {
        const data = new Blob([JSON.stringify({ elapsedTime })], { type: 'application/json' });
        navigator.sendBeacon(
          `${import.meta.env.API_URL || 'http://localhost:5000'}/api/study/state/${currentSession.sessionId}`,
          data
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentSession, elapsedTime, isStudying, saveSessionTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSubjectDuration = (subject) => {
    const activeTimetable = studyData.activeTimetable;
    if (!activeTimetable) return 60;

    const todayKey = getTodayKey();
    const todaySchedule = activeTimetable.schedule?.[todayKey] || [];
    const scheduleItem = todaySchedule.find(item => item.subject === subject);
    return scheduleItem ? scheduleItem.duration : 60;
  };

  const getTodaySchedule = () => {
    const activeTimetable = studyData.activeTimetable;
    if (!activeTimetable) return [];

    const todayKey = getTodayKey();
    return activeTimetable.schedule?.[todayKey] || [];
  };

  const handleStartSession = async () => {
    if (selectedSubject) {
      try {
        const targetTime = getSubjectDuration(selectedSubject) * 60;
        await startStudySession(selectedSubject, targetTime);
        setElapsedTime(0);
        setSessionNotes('');
        setIsAlarmPlaying(false);
        setAlarmMuted(false);
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    }
  };

  const handlePauseSession = async () => {
    try {
      stopAlarm();
      await pauseSession();
      await saveSessionTime();
      await fetchDashboardAndTimetables();
      await fetchCompletedSubjects();
    } catch (error) {
      console.error('Failed to pause session:', error);
    }
  };

  const handleResumeSession = async (sessionId = null) => {
    try {
      await resumeSession(sessionId);
      await fetchDashboardAndTimetables();
    } catch (error) {
      console.error('Failed to resume session:', error);
    }
  };

  const handleEndSession = async () => {
    try {
      stopAlarm();
      await saveSessionTime();
      await endSession(currentSession?.sessionId, sessionNotes);
      setElapsedTime(0);
      setSessionNotes('');
      setShowNotes(false);
      setIsAlarmPlaying(false);
      setAlarmMuted(false);
      await fetchDashboardAndTimetables();
      await fetchCompletedSubjects();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (currentSession) {
      try {
        await updateSessionTime(currentSession.sessionId, elapsedTime);
        setShowNotes(false);
      } catch (error) {
        console.error('Failed to save notes:', error);
      }
    }
  };

  const todaySchedule = getTodaySchedule();
  const completedSubjects = studyData.completedSubjects || [];
  const pausedSessions = getPausedSessions();

  const getSubjectStatus = (subject) => {
    const completed = completedSubjects.find(s => s.subject === subject && s.completed);
    if (completed) return 'completed';

    const paused = pausedSessions.find(s => s.subject === subject);
    if (paused) return 'paused';

    const active = currentSession?.subject === subject;
    if (active) return 'active';

    return 'pending';
  };

  const getSubjectActualTime = (subject) => {
    const completed = completedSubjects.find(s => s.subject === subject);
    if (completed) return completed.actualTime || 0;

    const paused = pausedSessions.find(s => s.subject === subject);
    if (paused) return paused.elapsedTime || 0;

    if (currentSession?.subject === subject) return elapsedTime;

    return 0;
  };

  if (currentSession && isStudying) {
    const targetTime = currentSession.targetTime || 3600;
    const progress = (elapsedTime / targetTime) * 100;
    const isCompleted = progress >= 100;

    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              await saveSessionTime();
              await handlePauseSession();
              navigate('/reading');
            }}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              await saveSessionTime();
              navigate('/');
            }}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
          >
            <Home size={20} />
            <span>Home</span>
          </motion.button>
        </div>

        {/* Alarm Alert */}
        {isAlarmPlaying && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold">🎉 Target Time Reached!</h3>
                  <p className="text-sm opacity-90">You've completed your study session goal!</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={muteAlarm}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  {alarmMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopAlarm}
                  className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors font-medium"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 text-center">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-200 dark:text-gray-600"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={isCompleted ? "#10B981" : "url(#gradient)"}
                strokeWidth="4"
                fill="none"
                className="transition-all duration-300"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  of {formatTime(targetTime)}
                </div>
                {isCompleted && (
                  <div className="text-green-500 text-xs font-medium mt-1">
                    ✓ Completed
                  </div>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {currentSession.subject}
          </h3>

          <div className="flex justify-center space-x-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePauseSession}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2"
            >
              <Pause size={20} />
              <span>Pause</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotes(!showNotes)}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center space-x-2"
            >
              <Book size={20} />
              <span>Notes</span>
            </motion.button>

            <motion.button
              onClick={handleEndButtonClick}
              disabled={isEnding}
              className="bg-red-500 text-white px-6 py-3 rounded-xl flex items-center space-x-2"
            >
              <Square size={20} />
              <span> {isEnding ? "Ending..." : "End"}</span>
            </motion.button>
          </div>

          {showNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 text-left"
            >
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Add your study notes here..."
                className="w-full h-24 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
              />
              <button
                onClick={handleSaveNotes}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save Notes</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {pausedSessions.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <PauseCircle className="text-orange-600" size={20} />
            <span>Resume Paused Sessions</span>
          </h3>

          <div className="space-y-3">
            {pausedSessions.map((session) => (
              <motion.div
                key={session.sessionId}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <PauseCircle className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{session.subject}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Paused at: {formatTime(session.elapsedTime || 0)}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleResumeSession(session.sessionId)}
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2"
                >
                  <Play size={16} />
                  <span>Resume</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
          <Target className="text-primary-600" size={20} />
          <span>Start Study Session</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Subject from Today's Schedule
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="">Choose a subject</option>
              {todaySchedule
                .filter(subject => getSubjectStatus(subject.subject) === 'pending')
                .map((subject, index) => (
                  <option key={index} value={subject.subject}>
                    {subject.subject} ({subject.duration} min)
                  </option>
                ))}
            </select>
          </div>

          {selectedSubject && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Duration: <span className="font-medium">{getSubjectDuration(selectedSubject)} minutes</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Duration is automatically set from your timetable
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartSession}
            disabled={!selectedSubject}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Play size={20} />
            <span>Start Session</span>
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
          <Book className="text-primary-600" size={20} />
          <span>Today's Schedule</span>
        </h3>

        {todaySchedule.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 dark:text-gray-400">No subjects scheduled for today</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Create a timetable to see your daily schedule here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySchedule
              .filter(subject => getSubjectStatus(subject.subject) === 'pending')
              .map((subject, index) => (
                <motion.div
                  key={`pending-${index}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * index }}
                  onClick={() => setSelectedSubject(subject.subject)}
                  className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer transition-all duration-200 ${selectedSubject === subject.subject
                    ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                      <Clock className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{subject.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {subject.time} • {subject.duration} min
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                    Pending
                  </span>
                </motion.div>
              ))}

            {todaySchedule
              .filter(subject => getSubjectStatus(subject.subject) === 'paused')
              .map((subject, index) => (
                <motion.div
                  key={`paused-${index}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <PauseCircle className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{subject.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {subject.time} • {subject.duration} min • Spent: {formatTime(getSubjectActualTime(subject.subject))}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                    Paused
                  </span>
                </motion.div>
              ))}

            {todaySchedule
              .filter(subject => getSubjectStatus(subject.subject) === 'completed')
              .map((subject, index) => (
                <motion.div
                  key={`completed-${index}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl opacity-75"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white line-through">
                        {subject.subject}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {subject.time} • {subject.duration} min • Spent: {formatTime(getSubjectActualTime(subject.subject))}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    ✓
                  </span>
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
          <Clock className="text-primary-600" size={20} />
          <span>Today's Progress</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {completedSubjects.filter(s => s.completed).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pausedSessions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Paused</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(completedSubjects.reduce((total, s) => total + (s.actualTime || 0), 0))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {todaySchedule.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Scheduled</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudyTimer;