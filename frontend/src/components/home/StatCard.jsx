import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, subtitle }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className={`${bgColor} rounded-2xl p-4 border border-gray-100 dark:border-gray-700 relative overflow-hidden`}
    >
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
            <Icon className="text-white" size={20} />
        </div>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{title}</p>
                {subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                )}
            </div>
            {trend && (
                <div
                    className={`flex items-center space-x-1 ${trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-gray-500"
                        }`}
                >
                    {trend > 0 ? <ArrowUp size={16} /> : trend < 0 ? <ArrowDown size={16} /> : <Minus size={16} />}
                    <span className="text-sm font-medium">{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
    </motion.div>
);

export default StatCard;