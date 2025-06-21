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
      // Use the dedicated today's sessions endpoint
      const res = await axios.get(`${API_URL}/api/study/sessions/today`);

      setStudyData(prev => ({
        ...prev,
        completedSubjects: res.data || []
      }));
    } catch (err) {
      console.error('Failed to fetch completed subjects:', err);
      // If the API doesn't exist, we'll keep completedSubjects as empty array
      setStudyData(prev => ({
        ...prev,
        completedSubjects: []
      }));
    }
  };

  // Additional helper function to fetch session statistics
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
    try {
      const res = await axios.post(`${API_URL}/api/study/state`, {
        currentSubject: subject,
        elapsedTime: 0,
        startTime,
        status: 'active'
      });
      setCurrentSession(res.data);
      setIsStudying(true);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const pauseSession = async () => {
    try {
      await axios.post(`${API_URL}/api/study/state`, {
        ...currentSession,
        status: 'paused'
      });
      setCurrentSession(prev => ({ ...prev, status: 'paused' }));
      setIsStudying(false);
    } catch (err) {
      console.error('Failed to pause session:', err);
    }
  };

  const resumeSession = async () => {
    try {
      await axios.post(`${API_URL}/api/study/state`, {
        ...currentSession,
        status: 'active'
      });
      setCurrentSession(prev => ({ ...prev, status: 'active' }));
      setIsStudying(true);
    } catch (err) {
      console.error('Failed to resume session:', err);
    }
  };

  const endSession = async ({ actualTime, notes = '', targetTime }) => {
    try {
      const endTime = new Date();
      await axios.post(`${API_URL}/api/study/sessions`, {
        subject: currentSession.currentSubject,
        actualTime,
        targetTime,
        startTime: currentSession.startTime,
        endTime,
        completed: true,
        notes
      });
      await axios.delete(`${API_URL}/api/study/state`);
      setCurrentSession(null);
      setIsStudying(false);

      // Refresh data after ending session
      fetchDashboardAndTimetables();
      fetchCompletedSubjects();
    } catch (err) {
      console.error('Failed to end session:', err);
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
    loadingNotes
  }), [studyData, currentSession, isStudying, loadingNotes]);

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};