import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircleMore } from 'lucide-react';

const FloatingFeedbackButton = ({ hasNewFeedback = true }) => {
    const navigate = useNavigate();
    const buttonRef = useRef(null);
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem('feedbackBtnPosition');
        return saved ? JSON.parse(saved) : { x: 20, y: window.innerHeight - 100 };
    });
    const [dragging, setDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });

    // Handle mouse/touch move
    const handleMove = (e) => {
        if (!dragging) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const newX = clientX - offset.current.x;
        const newY = clientY - offset.current.y;

        const clampedX = Math.max(0, Math.min(window.innerWidth - 60, newX));
        const clampedY = Math.max(0, Math.min(window.innerHeight - 60, newY));

        setPosition({ x: clampedX, y: clampedY });
    };

    // Stop dragging
    const stopDragging = () => {
        if (dragging) {
            setDragging(false);
            localStorage.setItem('feedbackBtnPosition', JSON.stringify(position));
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', stopDragging);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', stopDragging);
        };
    }, [dragging, position]);

    return (
        <div
            ref={buttonRef}
            onMouseDown={(e) => {
                offset.current = {
                    x: e.clientX - position.x,
                    y: e.clientY - position.y,
                };
                setDragging(true);
            }}
            onTouchStart={(e) => {
                offset.current = {
                    x: e.touches[0].clientX - position.x,
                    y: e.touches[0].clientY - position.y,
                };
                setDragging(true);
            }}
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 9999,
                touchAction: 'none',
                cursor: dragging ? 'grabbing' : 'grab',
                transition: dragging ? 'none' : 'transform 0.3s',
            }}
        >
            <button
                onClick={() => navigate('/feedback')}
                className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300"
            >
                <MessageCircleMore className="w-4 h-4" />
                <span className="hidden sm:inline">Feedback</span>

                {/* 🔴 Notification Badge */}
                {hasNewFeedback && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                )}
            </button>
        </div>
    );
};

export default FloatingFeedbackButton;
