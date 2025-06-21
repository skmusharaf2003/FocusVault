import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const StudyContext = createContext();

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

export const StudyProvider = ({ children }) => {
  const [studyData, setStudyData] = useState({
    todayReading: 0,
    studySessions: 0,
    currentStreak: 0,
    highestStreak: 0,
    weeklyData: [],
    timetables: [],
    activeTimetable: null,
    notes: [],
    completedSubjects: []
  });

  const [currentSession, setCurrentSession] = useState(null);
  const [isStudying, setIsStudying] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Set up axios interceptor for authentication
  useEffect(() => {
    const token = getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Timer management
  useEffect(() => {
    if (isStudying && currentSession) {
      const interval = setInterval(() => {
        setCurrentSession(prev => {
          if (prev) {
            const newElapsedTime = prev.elapsedTime + 1;
            // Auto-save session state every 10 seconds
            if (newElapsedTime % 10 === 0) {
              saveSessionState({
                ...prev,
                elapsedTime: newElapsedTime
              });
            }
            return {
              ...prev,
              elapsedTime: newElapsedTime
            };
          }
          return prev;
        });
      }, 1000);

      setSessionTimer(interval);
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
  }, [isStudying, currentSession?.id]);

  useEffect(() => {
    fetchDashboardAndTimetables();
    fetchCurrentSession();
    fetchCompletedSubjects();
  }, []);

  const fetchDashboardAndTimetables = async () => {
    try {
      const [dashboardRes, timetableRes] = await Promise.all([
        axios.get(`${API_URL}/api/study/dashboard`),
        axios.get(`${API_URL}/api/study/timetables`)
      ]);
      const active = timetableRes.data.find(t => t.isActive);
      setStudyData(prev => ({
        ...prev,
        ...dashboardRes.data,
        timetables: timetableRes.data,
        activeTimetable: active
      }));
    } catch (err) {
      console.error('Failed to fetch dashboard/timetables:', err);
    }
  };

  const fetchCurrentSession = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/study/state`);
      if (res.data?.currentSubject) {
        setCurrentSession(res.data);
        setIsStudying(res.data.status === 'active');
      }
    } catch (err) {
      console.error('Failed to fetch session state:', err);
    }
  };

  const fetchCompletedSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/study/sessions/today`);
      setStudyData(prev => ({
        ...prev,
        completedSubjects: res.data || []
      }));
    } catch (err) {
      console.error('Failed to fetch completed subjects:', err);
      setStudyData(prev => ({
        ...prev,
        completedSubjects: []
      }));
    }
  };

  // Save session state to backend
  const saveSessionState = async (sessionData) => {
    try {
      await axios.post(`${API_URL}/api/study/state`, sessionData);
    } catch (err) {
      console.error('Failed to save session state:', err);
    }
  };

  const fetchSessionStats = async (period = 'week') => {
    try {
      const res = await axios.get(`${API_URL}/api/study/sessions/stats`, {
        params: { period }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch session stats:', err);
      return null;
    }
  };

  const startStudySession = async (subject) => {
    const startTime = new Date();
    const sessionData = {
      id: Date.now().toString(), // Simple ID generation
      currentSubject: subject,
      elapsedTime: 0,
      startTime,
      status: 'active'
    };

    try {
      const res = await axios.post(`${API_URL}/api/study/state`, sessionData);
      setCurrentSession(res.data || sessionData);
      setIsStudying(true);
    } catch (err) {
      console.error('Failed to start session:', err);
      // Fallback to local state if API fails
      setCurrentSession(sessionData);
      setIsStudying(true);
    }
  };

  const pauseSession = async () => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      status: 'paused'
    };

    try {
      await saveSessionState(updatedSession);
      setCurrentSession(updatedSession);
      setIsStudying(false);
    } catch (err) {
      console.error('Failed to pause session:', err);
      // Still update local state even if API fails
      setCurrentSession(updatedSession);
      setIsStudying(false);
    }
  };

  const resumeSession = async () => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      status: 'active'
    };

    try {
      await saveSessionState(updatedSession);
      setCurrentSession(updatedSession);
      setIsStudying(true);
    } catch (err) {
      console.error('Failed to resume session:', err);
      // Still update local state even if API fails
      setCurrentSession(updatedSession);
      setIsStudying(true);
    }
  };

  const endSession = async ({ actualTime, notes = '', targetTime }) => {
    if (!currentSession) return;

    try {
      const endTime = new Date();
      const isCompleted = actualTime >= (targetTime * 60);

      // Create session record
      await axios.post(`${API_URL}/api/study/sessions`, {
        subject: currentSession.currentSubject,
        actualTime,
        targetTime: targetTime * 60, // Convert to seconds
        startTime: currentSession.startTime,
        endTime,
        completed: isCompleted,
        notes
      });

      // Clear session state
      await axios.delete(`${API_URL}/api/study/state`);

      setCurrentSession(null);
      setIsStudying(false);

      // Refresh data after ending session
      await Promise.all([
        fetchDashboardAndTimetables(),
        fetchCompletedSubjects()
      ]);

      return { completed: isCompleted };
    } catch (err) {
      console.error('Failed to end session:', err);
      throw err;
    }
  };

  const fetchNotes = async (search = '', subject = '', page = 1, limit = 20) => {
    try {
      setLoadingNotes(true);
      const params = new URLSearchParams({ search, subject, page, limit });
      const res = await axios.get(`${API_URL}/api/study/notes?${params.toString()}`);
      setStudyData(prev => ({ ...prev, notes: res.data }));
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Helper functions for subject status
  const getSubjectStatus = (subject) => {
    const completedSubjects = studyData.completedSubjects || [];
    const completed = completedSubjects.find(s => s.subject === subject.subject);
    if (!completed) return 'pending';

    if (completed.completed) return 'completed';
    return 'paused';
  };

  const getSubjectActualTime = (subject) => {
    const completedSubjects = studyData.completedSubjects || [];
    const completed = completedSubjects.find(s => s.subject === subject.subject);
    return completed ? completed.actualTime : 0;
  };

  const getTodaySchedule = () => {
    const activeTimetable = studyData.activeTimetable;
    if (!activeTimetable) return [];

    const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return activeTimetable.schedule?.[todayKey] || [];
  };

  const getPendingSubjects = () => {
    const todaySchedule = getTodaySchedule();
    return todaySchedule.filter(subject => getSubjectStatus(subject) === 'pending');
  };

  const getPausedSubjects = () => {
    const todaySchedule = getTodaySchedule();
    return todaySchedule.filter(subject => getSubjectStatus(subject) === 'paused');
  };

  const getCompletedSubjects = () => {
    const todaySchedule = getTodaySchedule();
    return todaySchedule.filter(subject => getSubjectStatus(subject) === 'completed');
  };

  const value = useMemo(() => ({
    studyData,
    currentSession,
    isStudying,
    startStudySession,
    pauseSession,
    resumeSession,
    endSession,
    fetchDashboardAndTimetables,
    fetchCurrentSession,
    fetchCompletedSubjects,
    fetchSessionStats,
    fetchNotes,
    loadingNotes,
    getSubjectStatus,
    getSubjectActualTime,
    getTodaySchedule,
    getPendingSubjects,
    getPausedSubjects,
    getCompletedSubjects
  }), [studyData, currentSession, isStudying, loadingNotes]);

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};