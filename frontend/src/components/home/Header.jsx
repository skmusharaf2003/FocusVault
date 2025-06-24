import { motion } from "framer-motion";
import { Filter, Grid, List, Lightbulb } from "lucide-react";
import { format } from "date-fns";

const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
};

const Header = ({ user }) => (
    <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6"
    >
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                {user?.profileImage ? (
                    <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <span className="text-white font-bold text-lg">
                        {user?.name?.charAt(0) || "U"}
                    </span>
                )}
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    {getTimeBasedGreeting()}, {user?.name?.split(" ")[0] || "Student"}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {format(new Date(), "EEEE, MMMM do")}
                </p>
            </div>
        </div>
    </motion.div>
);

export default Header;