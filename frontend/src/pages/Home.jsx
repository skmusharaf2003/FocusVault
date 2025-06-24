import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import {
  Clock,
  BookOpen,
  Target,
  TrendingUp,
  Quote,
  PlayCircle,
  Calendar,
  BarChart3,
  PieChart,
  Lightbulb,
  PauseCircle,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import SwipeableViews from 'react-swipeable-views';
import CountUp from 'react-countup';
import Confetti from 'react-confetti';
import { format } from 'date-fns';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import toast from 'react-hot-toast';
import { useMediaQuery } from 'react-responsive';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios with retry
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const Home = () => {
  const { user } = useAuth();
  const {
    studyData,
    fetchSessionStats,
    fetchDashboardAndTimetables,
    fetchCompletedSubjects,
    resumeSession,
  } = useStudy();
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [greeting, setGreeting] = useState('');
  const [statsFilter, setStatsFilter] = useState('week');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [detailedStats, setDetailedStats] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const audioRef = useRef(null);

  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#D946EF'];

  // Initialize audio for alarms
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0.7;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    const createAlarmSound = () => {
      const sampleRate = audioContext.sampleRate;
      const duration = 0.5;
      const frameCount = sampleRate * duration;
      const arrayBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
      const channelData = arrayBuffer.getChannelData(0);

      for (let i = 0; i < frameCount; i++) {
        channelData[i] = Math.sin(2 * Math.PI * 800 * i / sampleRate) * 0.3;
      }

      return arrayBuffer;
    };

    audioRef.current.alarmBuffer = createAlarmSound();
    audioRef.current.audioContext = audioContext;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Fetch data on mount
  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    loadQuote();
    const fetchData = async () => {
      try {
        await fetchDashboardAndTimetables();
        await fetchCompletedSubjects();

        // Fetch today's sessions
        const todaySessionsRes = await axios.get(`${API_URL}/api/study/sessions/today`);
        setTodaySessions(todaySessionsRes.data);

        // Check for streak milestone
        if (studyData?.currentStreak > (studyData?.highestStreak || 0)) {
          setShowConfetti(true);
          toast.success('🎉 New streak milestone achieved!');
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard');
      }
    };
    fetchData();
  }, []);

  // Load detailed stats when filter or subject changes
  useEffect(() => {
    loadDetailedStats();
  }, [statsFilter, selectedSubject]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTodayKey = () => new Date().toISOString().split('T')[0];

  const setRandomQuote = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/study/quote`);
      const randomQuote = { text: response.data[0].q, author: response.data[0].a };
      localStorage.setItem(
        'dailyQuote',
        JSON.stringify({ date: getTodayKey(), quote: randomQuote })
      );
      setQuote(randomQuote);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      setQuote({
        text: 'Keep pushing forward, one step at a time.',
        author: 'Anonymous',
      });
    }
  };

  const loadQuote = () => {
    const saved = localStorage.getItem('dailyQuote');
    const today = getTodayKey();
    if (saved) {
      const { date, quote } = JSON.parse(saved);
      if (date === today) {
        setQuote(quote);
        return;
      }
    }
    setRandomQuote();
  };

  const loadDetailedStats = async () => {
    try {
      const stats = await fetchSessionStats(statsFilter, selectedSubject);
      setDetailedStats(stats);
    } catch (error) {
      console.error('Failed to load detailed stats:', error);
      toast.error('Failed to load analytics');
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  // Weekly Chart Data
  const weeklyData = (studyData.weeklyData || []).map((day) => ({
    day: format(new Date(day.date), 'EEE'),
    hours: (day.timeStudied || 0) / 3600,
    sessions: day.sessionCount || 0,
  }));

  // Subject Pie Chart Data
  const subjectData = Object.values(
    studyData.completedSubjects.reduce((acc, session) => {
      const subj = session.subject;
      if (!acc[subj]) {
        acc[subj] = {
          name: subj,
          value: 0,
          color: colors[Object.keys(acc).length % colors.length],
        };
      }
      acc[subj].value += session.actualTime || 0;
      return acc;
    }, {})
  );

  // Unique Subjects for Filter
  const uniqueSubjects = [...new Set(studyData.completedSubjects.map((s) => s.subject))];

  // Smart Insights Generator
  const generateInsights = () => {
    if (!detailedStats || !studyData) return [];
    const insights = [];

    // Longest studied subject
    const longestSubject = subjectData.reduce(
      (max, curr) => (curr.value > max.value ? curr : max),
      subjectData[0] || { name: '', value: 0 }
    );
    if (longestSubject.value > 0) {
      insights.push(
        `🧠 You studied ${longestSubject.name} the longest (${formatTime(longestSubject.value)}). Great job!`
      );
    }

    // Low session day warning
    if (studyData.todayStats?.sessionCount < 2) {
      insights.push(`⚠️ Only ${studyData.todayStats?.sessionCount || 0} session today. Let’s bounce back!`);
    }

    // Most resumed subject
    const mostResumed = todaySessions.reduce(
      (max, curr) => (curr.resumedCount > max.resumedCount ? curr : max),
      todaySessions[0] || { subject: '', resumedCount: 0 }
    );
    if (mostResumed.resumedCount > 0) {
      insights.push(`🔁 Most resumed subject: ${mostResumed.subject} — try focusing earlier.`);
    }

    return insights.slice(0, 3);
  };

  // Alarm Playback for Resumed Sessions
  const playAlarm = () => {
    if (!audioRef.current?.audioContext) return;

    const playBeep = () => {
      const source = audioRef.current.audioContext.createBufferSource();
      const gainNode = audioRef.current.audioContext.createGain();
      source.buffer = audioRef.current.alarmBuffer;
      source.connect(gainNode);
      gainNode.connect(audioRef.current.audioContext.destination);
      gainNode.gain.setValueAtTime(0.3, audioRef.current.audioContext.currentTime);
      source.start();
      return source;
    };

    let isPlaying = true;
    const scheduleBeep = () => {
      if (!isPlaying) return;
      const source = playBeep();
      source.onended = () => {
        if (isPlaying) scheduleBeep();
      };
    };

    scheduleBeep();

    return () => {
      isPlaying = false;
    };
  };

  const stopAlarm = () => {
    if (audioRef.current?.stop) {
      audioRef.current.stop();
    }
  };

  const handleResumeSession = async (sessionId) => {
    try {
      await resumeSession(sessionId);
      toast.success('Session resumed!');
      const session = todaySessions.find((s) => s.sessionId === sessionId);
      if (session.elapsedTime >= session.targetTime) {
        const stop = playAlarm();
        setTimeout(() => stop(), 5000); // Stop after 5 seconds
      }
      navigate('/reading');
    } catch (error) {
      console.error('Failed to resume session:', error);
      toast.error('Failed to resume session');
    }
  };

  const statsCards = [
    {
      title: 'Today’s Reading',
      value: studyData.todayReading || 0,
      suffix: 'minutes',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Study Sessions',
      value: studyData.studySessions || 0,
      suffix: '',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Current Streak',
      value: studyData.currentStreak || 0,
      suffix: 'days',
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Highest Streak',
      value: studyData.highestStreak || 0,
      suffix: 'days',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 relative">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <motion.div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center space-x-4 mb-6"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {greeting}, {user?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
        </motion.div>

        {/* Swipeable Tabs (Mobile) */}
        {isMobile && (
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-2">
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
              {['Overview', 'Subjects', 'Timeline'].map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setTabIndex(index)}
                  className={`pb-2 text-sm font-medium ${tabIndex === index
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-300'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        <SwipeableViews index={isMobile ? tabIndex : 0} disabled={!isMobile}>
          {/* Overview Tab */}
          <div className="space-y-6">
            {/* Daily Quote */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer backdrop-blur-md bg-opacity-80"
              onClick={setRandomQuote}
            >
              <div className="absolute top-0 right-0 opacity-10">
                <Quote size={120} />
              </div>
              <div className="relative z-10">
                <Quote className="mb-3" size={24} />
                <p className="text-lg font-medium leading-relaxed mb-2">"{quote.text}"</p>
                <p className="text-primary-100 font-medium">- {quote.author}</p>
                <p className="text-primary-200 text-xs mt-2">Tap for new quote</p>
              </div>
            </motion.div>

            {/* Stats Cards (Sticky on Mobile) */}
            <div className={isMobile ? 'sticky top-10 z-10 bg-gray-50 dark:bg-gray-900 py-2' : ''}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * (index + 2) }}
                    className={`${stat.bgColor} rounded-2xl p-4 border border-gray-100 dark:border-gray-700 backdrop-blur-md`}
                  >
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}
                    >
                      <stat.icon className="text-white" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      <CountUp end={stat.value} duration={2} /> {stat.suffix}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Smart Study Insights */}
            {generateInsights().length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 backdrop-blur-md"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
                  <Lightbulb size={20} />
                  <span>Smart Insights</span>
                </h3>
                <div className="space-y-3">
                  {generateInsights().map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <p className="text-sm text-gray-800 dark:text-white">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Weekly Progress */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 backdrop-blur-md"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
                <Calendar size={20} />
                <span>Weekly Progress</span>
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis hide />
                    <Tooltip
                      content={({ payload }) =>
                        payload?.[0] ? (
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            <p>{payload[0].payload.day}</p>
                            <p>{payload[0].value.toFixed(2)} hours</p>
                            <p>{payload[0].payload.sessions} sessions</p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.hours === 0 ? '#D1D5DB' : `url(#gradient-${index})`}
                        />
                      ))}
                    </Bar>
                    <defs>
                      {weeklyData.map((_, index) => (
                        <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      ))}
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {weeklyData.some((day) => day.hours === 0) && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">⏸️ Missed some days? Keep going!</p>
              )}
            </motion.div>
          </div>

          {/* Subjects Tab */}
          <div className="space-y-6">
            {/* Study Analytics */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 backdrop-blur-md"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
                <BarChart3 size={20} />
                <span>Study Analytics</span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex space-x-2">
                  {['week', 'month', 'year'].map((period) => (
                    <motion.button
                      key={period}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatsFilter(period)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${statsFilter === period
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </motion.button>
                  ))}
                </div>
                {uniqueSubjects.length > 0 && (
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-none"
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                )}
              </div>
              {detailedStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary-600">
                      <CountUp end={detailedStats.summary.totalSessions} duration={2} />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      <CountUp end={Math.round(detailedStats.summary.totalStudyTime / 60)} duration={2} />m
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Study Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      <CountUp end={Math.round(detailedStats.summary.completionRate)} duration={2} />%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Completion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">
                      <CountUp end={Math.round(detailedStats.summary.averageSessionTime / 60)} duration={2} />m
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Avg Session</div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Subject Distribution */}
            {subjectData.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 backdrop-blur-md"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
                  <PieChart size={20} />
                  <span>Subject Distribution</span>
                </h3>
                <div className="flex flex-col md:flex-row items-center">
                  <div className="w-32 h-32 mb-4 md:mb-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={subjectData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {subjectData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 md:ml-4 space-y-2 w-full">
                    {subjectData.map((subject) => (
                      <div key={subject.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                          <span className="text-sm text-gray-600 dark:text-gray-300">{subject.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {Math.round(subject.value / 60)}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Timeline Tab */}
          <div className="space-y-6">
            {/* Daily Study Timeline */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 backdrop-blur-md"
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
                <Clock size={20} />
                <span>Today’s Study Timeline</span>
              </h3>
              {todaySessions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">No sessions today</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Start a new session to track your progress!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map((session, index) => (
                    <motion.div
                      key={session.sessionId}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * index }}
                      className={`flex items-center justify-between p-4 rounded-xl ${session.status === 'paused'
                        ? 'bg-orange-100 dark:bg-orange-900/20'
                        : session.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/20 opacity-75'
                          : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.status === 'paused'
                            ? 'bg-orange-500'
                            : session.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-gray-400'
                            }`}
                        >
                          {session.status === 'paused' ? (
                            <PauseCircle className="text-white" size={18} />
                          ) : session.status === 'completed' ? (
                            <CheckCircle className="text-white" size={18} />
                          ) : (
                            <Clock className="text-white" size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{session.subject}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(session.startTime), 'h:mm a')} –{' '}
                            {format(new Date(session.endTime || new Date()), 'h:mm a')} • {formatTime(session.elapsedTime)}/{formatTime(session.targetTime)}
                          </p>
                        </div>
                      </div>
                      {session.status === 'paused' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.05 }}
                          transition={{ scale: 0.95 }}
                          onClick={() => handleResumeSession(session.sessionId)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                          Resume
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </SwipeableViews>

        {/* All-Time Summary */}
        {detailedStats && (
          <motion.div
            initial={{ y: 20, opacity: '0' }}
            animate={{ y: '0' }}
            transition={{ opacity: 1, delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 backdrop-blur-md"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
              <Target size={20} />
              <span>All-Time Summary</span>
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="w-32 h-32 mb-4 md:mb-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: detailedStats.summary.completionRate },
                        { name: 'Remaining', value: 100 - detailedStats.summary.completionRate },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#D1D5DB" />
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1 md:ml-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800 dark:text-white">
                    <CountUp end={detailedStats.summary.totalSessions} duration={2} />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800 dark:text-white">
                    {formatTime(Math.round(detailedStats.summary.totalStudyTime))}
                    <CountUp end={Math.round(detailedStats.summary.totalStudyTime)} duration={2} />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Total Time</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800 dark:text-white">
                    <CountUp end={detailedStats.summary.daysActive} duration={2} />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Days Active</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800 dark:text-green-400">
                    {detailedStats.summary.totalSessions < 10
                      ? `Next goal: ${10 - detailedStats.summary.totalSessions} sessions 🎯`
                      : 'Great work! Keep it up!'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Milestone</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Action Button */}
        <motion.button
          onClick={() => navigate('/reading')}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full p-4 shadow-lg z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <PlayCircle size={24} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Home;