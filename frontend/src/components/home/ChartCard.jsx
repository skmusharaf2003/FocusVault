import PropTypes from "prop-types";
const ChartCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            {Icon && <Icon size={20} />}
            <span>{title}</span>
        </h3>
        {children}
    </div>
);

ChartCard.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.elementType, // Optional
    children: PropTypes.node.isRequired,
};

export default ChartCard;