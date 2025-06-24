// components/StarRating.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const StarRating = ({
    rating = 0,
    onRatingChange,
    readOnly = false,
    size = 'md',
    showLabel = true,
    className = ''
}) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    // Size configurations
    const sizeConfig = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10'
    };

    const textSizeConfig = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    const starSize = sizeConfig[size] || sizeConfig.md;
    const textSize = textSizeConfig[size] || textSizeConfig.md;

    // Rating labels
    const ratingLabels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    const handleStarClick = (starRating) => {
        if (!readOnly && onRatingChange) {
            onRatingChange(starRating);
        }
    };

    const handleStarMouseEnter = (starRating) => {
        if (!readOnly) {
            setHoverRating(starRating);
            setIsHovering(true);
        }
    };

    const handleStarMouseLeave = () => {
        if (!readOnly) {
            setHoverRating(0);
            setIsHovering(false);
        }
    };

    const getStarFill = (starIndex) => {
        const currentRating = isHovering ? hoverRating : rating;
        return starIndex <= currentRating;
    };

    const getCurrentLabel = () => {
        const currentRating = isHovering ? hoverRating : rating;
        return ratingLabels[currentRating] || '';
    };

    return (
        <div className={`flex flex-col items-start gap-2 ${className}`}>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                    <motion.button
                        key={starIndex}
                        type="button"
                        className={`
              ${starSize} 
              ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} 
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded
            `}
                        onClick={() => handleStarClick(starIndex)}
                        onMouseEnter={() => handleStarMouseEnter(starIndex)}
                        onMouseLeave={handleStarMouseLeave}
                        disabled={readOnly}
                        whileHover={!readOnly ? { scale: 1.1 } : {}}
                        whileTap={!readOnly ? { scale: 0.95 } : {}}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className={`
                w-full h-full transition-colors duration-200
                ${getStarFill(starIndex)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 hover:text-yellow-300 fill-current'
                                }
              `}
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </motion.button>
                ))}

                {/* Numeric rating display */}
                {rating > 0 && (
                    <span className={`ml-2 font-medium text-gray-600 ${textSize}`}>
                        {rating}/5
                    </span>
                )}
            </div>

            {/* Rating label */}
            {showLabel && (getCurrentLabel() || (rating > 0 && !isHovering)) && (
                <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${textSize} text-gray-500 font-medium`}
                >
                    {getCurrentLabel()}
                </motion.span>
            )}

            {/* Interactive instructions */}
            {!readOnly && !rating && !isHovering && (
                <span className={`${textSize} text-gray-400 italic`}>
                    Click to rate
                </span>
            )}
        </div>
    );
};

// Compact version for display-only purposes
export const CompactStarRating = ({ rating, className = '' }) => {
    if (!rating) return null;

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[1, 2, 3, 4, 5].map((starIndex) => (
                <svg
                    key={starIndex}
                    viewBox="0 0 24 24"
                    className={`
            w-4 h-4 
            ${starIndex <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 fill-current'
                        }
          `}
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
            <span className="text-sm text-gray-600 ml-1">
                {rating}/5
            </span>
        </div>
    );
};

export default StarRating;