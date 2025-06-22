import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import FilterChip from "./FilterChip";

const FilterPanel = ({
    showFilters, searchQuery, setSearchQuery, dateRange, setDateRange,
    selectedSubjects, setSelectedSubjects, performanceFilter, setPerformanceFilter,
    uniqueSubjects, subjectData
}) => (
    <AnimatePresence>
        {showFilters && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="p-6 space-y-4">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Time Period
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {["week", "month", "quarter", "year"].map((period) => (
                                <FilterChip
                                    key={period}
                                    label={period.charAt(0).toUpperCase() + period.slice(1)}
                                    active={dateRange === period}
                                    onClick={() => setDateRange(period)}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subjects
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {uniqueSubjects.map((subject) => (
                                <FilterChip
                                    key={subject}
                                    label={subject}
                                    active={selectedSubjects.includes(subject)}
                                    onClick={() =>
                                        setSelectedSubjects((prev) =>
                                            prev.includes(subject)
                                                ? prev.filter((s) => s !== subject)
                                                : [...prev, subject]
                                        )
                                    }
                                    count={subjectData.find((s) => s.name === subject)?.sessions}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Performance
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: "all", label: "All Sessions" },
                                { id: "overperformed", label: "Over Target" },
                                { id: "ontrack", label: "On Track" },
                                { id: "underperformed", label: "Under Target" },
                            ].map((filter) => (
                                <FilterChip
                                    key={filter.id}
                                    label={filter.label}
                                    active={performanceFilter === filter.id}
                                    onClick={() => setPerformanceFilter(filter.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default FilterPanel;