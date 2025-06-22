import StatCard from "./StatCard";
import { Clock, Target, Zap, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const StatsGrid = ({ benchmarks, studyData, detailedStats }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
            title="Study Time"
            value={`${Math.round(benchmarks.totalTime / 60)}m`}
            subtitle="This week"
            icon={Clock}
            color="from-primary-500 to-primary-600"
            bgColor="bg-purple-50 dark:bg-purple-900/20"
            trend={7}
        />
        <StatCard
            title="Efficiency"
            value={`${Math.round(benchmarks.efficiency)}%`}
            subtitle="Target ratio"
            icon={Target}
            color="from-blue-500 to-blue-600"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
            trend={-5}
        />
        <StatCard
            title="Streak"
            value={`${studyData?.currentStreak || 0}d`}
            subtitle="Current"
            icon={Zap}
            color="from-green-500 to-green-600"
            bgColor="bg-green-50 dark:bg-green-900/20"
            trend={4}
        />
        <StatCard
            title="Sessions"
            value={detailedStats?.summary.totalSessions || 0}
            subtitle="Completed"
            icon={BookOpen}
            color="from-orange-500 to-orange-600"
            bgColor="bg-orange-50 dark:bg-orange-900/20"
            trend={8}
        />
    </div>
);

export default StatsGrid;