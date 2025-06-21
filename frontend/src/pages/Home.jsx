import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { Clock, BookOpen, Target, TrendingUp, Quote, PlayCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = () => {
  const { user } = useAuth();
  const { studyData } = useStudy();
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    loadQuote();
  }, []);

  // console.log('User:', studyData);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  //Random Quote
  const getTodayKey = () => new Date().toISOString().split('T')[0];
  const setRandomQuote = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/study/quote`);
      if (!response.status || response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const randomQuote = {
        text: response.data[0].q,
        author: response.data[0].a,
      };

      localStorage.setItem('dailyQuote', JSON.stringify({
        date: getTodayKey(),
        quote: randomQuote,
      }));

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

    // No quote for today
    setRandomQuote();
  };

  const handleQuoteClick = () => {
    // Always fetch a new quote and override today's quote
    setRandomQuote();
  };



  const weeklyData = studyData.weeklyData


  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#D946EF'];

  const grouped = {};
  let colorIndex = 0;

  studyData.completedSubjects.forEach(session => {
    const subj = session.subject;

    if (!grouped[subj]) {
      grouped[subj] = {
        name: subj,
        value: 0,
        color: colors[colorIndex % colors.length]
      };
      colorIndex++;
    }

    grouped[subj].value += session.actualTime;
  });

  const subjectData = Object.values(grouped);

  const statsCards = [
    {
      title: 'Reading Hours',
      value: studyData.todayReading || '0 hours',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Study Sessions',
      value: studyData.studySessions || '0 sessions',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Current Streak',
      value: studyData.currentStreak || '0',
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Highest Streak',
      value: studyData.highestStreak || '0',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center space-x-4 mb-6"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">

          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {format(new Date(), 'EEEE, MMMM do')}
          </p>
        </div>
      </motion.div>

      {/* Daily Quote */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 opacity-10">
          <Quote size={120} />
        </div>
        <div className="relative z-10" onClick={handleQuoteClick} style={{ cursor: 'pointer' }}>
          <Quote className="mb-3" size={24} />
          <p className="text-lg font-medium leading-relaxed mb-2">
            "{quote.text}"
          </p>
          <p className="text-primary-100 font-medium">
            - {quote.author}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * (index + 2) }}
            className={`${stat.bgColor} rounded-2xl p-4 border border-gray-100 dark:border-gray-700`}
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="text-white" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stat.value}
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {stat.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Continue Reading Button */}
      <motion.button
        onClick={() => window.location.href = '/reading'}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-2xl p-4 flex items-center justify-center space-x-2 font-medium"
      >
        <PlayCircle size={20} />
        <span>Continue Reading</span>
      </motion.button>

      {/* Weekly Progress */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Weekly Progress
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar
                dataKey="hours"
                radius={[8, 8, 0, 0]}
                fill="url(#gradient)"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Subject Distribution */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Subject Distribution
        </h3>
        <div className="flex items-center">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
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
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 ml-4 space-y-2">
            {subjectData.map((subject) => (
              <div key={subject.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                  {subject.name}
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {subject.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>



    </div>
  );
};

export default Home;