import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend
} from "recharts";
import { BarChart3, Target, Activity, BookOpen, Calendar, PieChart, TrendingUp, Trophy, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useStudy } from "../../context/StudyContext";
import Header from "./Header";
import QuoteCard from "./QuoteCard";
import StatsGrid from "./StatsGrid";
import FilterPanel from "./FilterPanel";
import ChartCard from "./ChartCard";
import SessionsList from "./SessionsList";

const Home = () => {
    const { user } = useAuth();
    const { studyData, fetchSessionStats, fetchDashboardAndTimetables } = useStudy();
    const [quote, setQuote] = useState({ text: "", author: "" });
    const [activeView, setActiveView] = useState("overview");
    const [dateRange, setDateRange] = useState("week");
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [performanceFilter, setPerformanceFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [detailedStats, setDetailedStats] = useState(null);

    const colors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#14B8A6", "#D946EF"];

    // Fetch data with caching
    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchDashboardAndTimetables();
                const stats = await fetchSessionStats(dateRange, selectedSubjects.join(","));
                setDetailedStats(stats);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        const cacheKey = `stats_${dateRange}_${selectedSubjects.join("_")}`;
        const cachedStats = localStorage.getItem(cacheKey);
        if (cachedStats) {
            setDetailedStats(JSON.parse(cachedStats));
        } else {
            fetchData();
        }
    }, [dateRange, selectedSubjects, fetchSessionStats, fetchDashboardAndTimetables]);

    // Cache stats
    useEffect(() => {
        if (detailedStats) {
            const cacheKey = `stats_${dateRange}_${selectedSubjects.join("_")}`;
            localStorage.setItem(cacheKey, JSON.stringify(detailedStats));
        }
    }, [detailedStats, dateRange, selectedSubjects]);

    // Performance benchmarks
    const benchmarks = useMemo(() => {
        const sessions = studyData?.completedSubjects || [];
        const efficiency = sessions.map((s) => ({
            subject: s.subject,
            efficiency: s.targetTime > 0 ? (s.actualTime / s.targetTime) * 100 : 0,
            actualTime: s.actualTime,
            targetTime: s.targetTime,
        }));
        const avgEfficiency = efficiency.length > 0 ? efficiency.reduce((sum, e) => sum + e.efficiency, 0) / efficiency.length : 0;
        return {
            efficiency: avgEfficiency,
            totalTime: sessions.reduce((sum, s) => sum + s.actualTime, 0),
            completionRate: detailedStats?.summary.completionRate || 0,
            consistency: studyData?.currentStreak || 0,
            productivity: avgEfficiency > 100 ? "High" : avgEfficiency > 50 ? "Medium" : "Low",
        };
    }, [studyData, detailedStats]);

    // Filtered sessions
    const filteredSessions = useMemo(() => {
        let filtered = studyData?.completedSubjects || [];
        if (selectedSubjects.length > 0) {
            filtered = filtered.filter((s) => selectedSubjects.includes(s.subject));
        }
        if (searchQuery) {
            filtered = filtered.filter((s) => s.subject.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (performanceFilter !== "all") {
            filtered = filtered.filter((s) => {
                const efficiency = s.targetTime > 0 ? (s.actualTime / s.targetTime) * 100 : 0;
                switch (performanceFilter) {
                    case "overperformed":
                        return efficiency > 100;
                    case "ontrack":
                        return efficiency >= 80 && efficiency <= 120;
                    case "underperformed":
                        return efficiency < 80;
                    default:
                        return true;
                }
            });
        }
        return filtered;
    }, [studyData?.completedSubjects, selectedSubjects, searchQuery, performanceFilter]);

    // Pagination
    const paginatedSessions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSessions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSessions, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

    // Unique subjects
    const uniqueSubjects = [...new Set((studyData?.completedSubjects || []).map((s) => s.subject))];

    // Chart data
    const subjectData = useMemo(() => {
        const grouped = {};
        let colorIndex = 0;
        (studyData?.completedSubjects || []).forEach((session) => {
            const subj = session.subject;
            if (!grouped[subj]) {
                grouped[subj] = {
                    name: subj,
                    value: 0,
                    sessions: 0,
                    color: colors[colorIndex % colors.length],
                };
                colorIndex++;
            }
            grouped[subj].value += session.actualTime || 0;
            grouped[subj].sessions += 1;
        });
        return Object.values(grouped);
    }, [studyData?.completedSubjects]);

    // Performance trend
    const performanceTrend = useMemo(() => {
        return (studyData?.completedSubjects || []).map((session, index) => ({
            session: index + 1,
            efficiency: session.targetTime > 0 ? (session.actualTime / session.targetTime) * 100 : 0,
            subject: session.subject,
            date: new Date(session.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }));
    }, [studyData?.completedSubjects]);

    // Radar chart data
    const radarData = useMemo(() => {
        const subjects = Object.keys(detailedStats?.subjectStats || {});
        return subjects.map((subject) => {
            const stats = detailedStats?.subjectStats[subject] || {};
            const avgTime = stats.totalTime / stats.sessions || 0;
            return {
                subject,
                consistency: Math.min((stats.sessions || 0) * 20, 100),
                efficiency: Math.min((avgTime / 60) * 10, 100),
                completion: ((stats.completed || 0) / (stats.sessions || 1)) * 100,
            };
        });
    }, [detailedStats?.subjectStats]);

    const views = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "performance", label: "Performance", icon: Target },
        { id: "sessions", label: "Sessions", icon: BookOpen },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <Header
                    user={user}
                    toggleFilters={() => setShowFilters(!showFilters)}

                />
                <QuoteCard quote={quote} setQuote={setQuote} />
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex overflow-x-auto space-x-1 bg-white dark:bg-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700"
                >
                    {views.map((view) => (
                        <motion.button
                            key={view.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveView(view.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeView === view.id
                                ? "bg-primary-600 text-white shadow-lg"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <view.icon size={18} />
                            <span>{view.label}</span>
                        </motion.button>
                    ))}
                </motion.div>
                <FilterPanel
                    showFilters={showFilters}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    selectedSubjects={selectedSubjects}
                    setSelectedSubjects={setSelectedSubjects}
                    performanceFilter={performanceFilter}
                    setPerformanceFilter={setPerformanceFilter}
                    uniqueSubjects={uniqueSubjects}
                    subjectData={subjectData}
                />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeView === "overview" && (
                            <div className="space-y-6">
                                <StatsGrid benchmarks={benchmarks} studyData={studyData} detailedStats={detailedStats} />
                                <ChartCard title="Weekly Progress" icon={Calendar}>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={studyData?.weeklyData || []}>
                                                <defs>
                                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                                <YAxis hide />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="hours" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorGradient)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </ChartCard>
                                <div className="grid md:grid-cols-2 gap-6">

                                    <ChartCard title="Time Distribution" icon={PieChart}>
                                        <div className="h-80 px-2 pb-4">
                                            {subjectData && subjectData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RechartsPieChart>
                                                        <Pie
                                                            data={subjectData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={80}
                                                            paddingAngle={2}
                                                            dataKey="value"
                                                            isAnimationActive={true}
                                                        >
                                                            {subjectData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ fontSize: '14px', borderRadius: '8px' }}
                                                            formatter={(value, name) => [`${Math.round(value / 60)} mins`, name]}
                                                            labelStyle={{ color: '#374151', fontWeight: 500 }}
                                                        />
                                                    </RechartsPieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                                    No data available for Time Distribution
                                                </div>
                                            )}
                                        </div>
                                    </ChartCard>

                                    <ChartCard title="Subject Rankings" icon={BarChart3}>
                                        {subjectData && subjectData.length > 0 ? (
                                            <div className="space-y-3">
                                                {subjectData
                                                    .sort((a, b) => b.value - a.value)
                                                    .map((subject, index) => (
                                                        <div key={subject.name} className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium">
                                                                    {index + 1}
                                                                </div>
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: subject.color }}
                                                                />
                                                                <span className="font-medium text-gray-800 dark:text-white">
                                                                    {subject.name}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-medium text-gray-800 dark:text-white">
                                                                    {Math.round(subject.value / 60)}m
                                                                </div>
                                                                <div className="text-sm text-gray-500">{subject.sessions} sessions</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No subjects ranked yet
                                            </div>
                                        )}
                                    </ChartCard>

                                </div>
                            </div>
                        )}
                        {activeView === "performance" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-gray-800 dark:text-white">Efficiency Score</h3>
                                            <div
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${benchmarks.efficiency > 100 ? "bg-green-100 text-green-800" :
                                                    benchmarks.efficiency > 80 ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {benchmarks.productivity}
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{Math.round(benchmarks.efficiency)}%</div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-primary-500 to-blue-500 h-2 rounded-full"
                                                style={{ width: `${Math.min(benchmarks.efficiency, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">Completion Rate</h3>
                                        <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{Math.round(benchmarks.completionRate)}%</div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                            <CheckCircle size={16} className="text-green-500" />
                                            <span>{detailedStats?.summary.completedSessions || 0} completed</span>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">Consistency</h3>
                                        <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{benchmarks.consistency} days</div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Trophy size={16} className="text-yellow-500" />
                                            <span>Best: {studyData?.highestStreak || 0} days</span>
                                        </div>
                                    </div>
                                </div>
                                <ChartCard title="Performance Trends">
                                    <div className="h-64">
                                        {performanceTrend && performanceTrend.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={performanceTrend}>
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="efficiency"
                                                        stroke="#8B5CF6"
                                                        strokeWidth={2}
                                                        dot={{ fill: "#8B5CF6" }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                                No performance data available
                                            </div>
                                        )}
                                    </div>
                                </ChartCard>

                                {radarData.length > 0 && (
                                    <ChartCard title="Subject Analysis">
                                        <div className="h-72 px-4 pb-6"> {/* Added padding and more height */}
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={radarData} outerRadius="80%">
                                                    <PolarGrid />
                                                    <PolarAngleAxis
                                                        dataKey="subject"
                                                        tick={{ fontSize: 12, dy: 4 }} // Adds padding to labels
                                                    />
                                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                                    <Radar
                                                        name="Consistency"
                                                        dataKey="consistency"
                                                        stroke="#8B5CF6"
                                                        fill="#8B5CF6"
                                                        fillOpacity={0.2}
                                                    />
                                                    <Radar
                                                        name="Efficiency"
                                                        dataKey="efficiency"
                                                        stroke="#3B82F6"
                                                        fill="#3B82F6"
                                                        fillOpacity={0.2}
                                                    />
                                                    <Radar
                                                        name="Completion"
                                                        dataKey="completion"
                                                        stroke="#10B981"
                                                        fill="#10B981"
                                                        fillOpacity={0.2}
                                                    />
                                                    <Tooltip />
                                                    <Legend wrapperStyle={{ bottom: -20 }} /> {/* Space below chart */}
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </ChartCard>

                                )}
                            </div>
                        )}
                        {activeView === "sessions" && (
                            <SessionsList
                                paginatedSessions={paginatedSessions}

                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                totalPages={totalPages}
                                filteredSessions={filteredSessions}
                                itemsPerPage={itemsPerPage}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Home;