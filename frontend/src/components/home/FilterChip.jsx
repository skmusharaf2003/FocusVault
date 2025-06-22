import { motion } from "framer-motion";

const FilterChip = ({ label, active, onClick, count }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center space-x-1 ${active
            ? "bg-primary-600 text-white shadow-lg"
            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
    >
        <span>{label}</span>
        {count !== undefined && (
            <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-gray-300 dark:bg-gray-600"
                    }`}
            >
                {count}
            </span>
        )}
    </motion.button>
);

export default FilterChip;