import { useState, useEffect } from 'react';
import {
    Play, Pause, Square, ArrowLeft, Book, CheckCircle,
    ArrowRight, Home, Clock, Target, AlertCircle, Award
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

const StudySession = ({ onNavigateBack, onNavigateHome }) => {
    const {
        currentSession,
        isStudying,
        pauseSession,
        resumeSession,
        endSession,
        studyData,
        fetchDashboardAndTimetables,
        getTodaySchedule,
        getPendingSubjects,
        getSubjectActualTime,
        startStudySession
    } = useStudy()

    const [sessionNotes, setSessionNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const [nextSuggestions, setNextSuggestions] = useState([]);
    const [completionData, setCompletionData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchDashboardAndTimetables();
    }, []);

    // Initialize session data
    useEffect(() => {
        if (currentSession) {
            setSessionNotes(currentSession.notes || '');
        }
    }, [currentSession]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getSubjectDuration = (subject) => {
        const activeTimetable = studyData.activeTimetable;
        if (!activeTimetable) return 60;

        const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const todaySchedule = activeTimetable.schedule?.[todayKey] || [];
        const scheduleItem = todaySchedule.find(item => item.subject === subject);
        return scheduleItem ? scheduleItem.duration : 60;
    };

    const getNextSuggestions = (completedSubject) => {
        const pendingSubjects = getPendingSubjects();
        // Filter out the just completed subject
        return pendingSubjects.filter(subject => subject.subject !== completedSubject).slice(0, 3);
    };

    const getCircularProgress = () => {
        if (!currentSession) return 0;
        const targetTime = getSubjectDuration(currentSession.currentSubject) * 60;
        const progress = (currentSession.elapsedTime / targetTime) * 100;
        return Math.min(progress, 100);
    };

    const handlePauseSession = async () => {
        try {
            setIsLoading(true);
            await pauseSession();
        } catch (error) {
            console.error('Failed to pause session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResumeSession = async () => {
        try {
            setIsLoading(true);
            await resumeSession();
        } catch (error) {
            console.error('Failed to resume session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndSession = async () => {
        if (!currentSession) return;

        const targetTime = getSubjectDuration(currentSession.currentSubject);
        const actualTime = currentSession.elapsedTime;
        const isCompleted = actualTime >= (targetTime * 60);

        try {
            setIsLoading(true);
            const result = await endSession({
                actualTime: actualTime,
                targetTime: targetTime,
                notes: sessionNotes
            });

            if (isCompleted || result.completed) {
                const suggestions = getNextSuggestions(currentSession.currentSubject);
                setNextSuggestions(suggestions);
                setCompletionData({
                    subject: currentSession.currentSubject,
                    actualTime: actualTime,
                    targetTime: targetTime,
                    isCompleted: isCompleted
                });
                setShowCompletion(true);
            } else {
                // If not completed, go back to continue reading
                onNavigateBack();
            }

            setSessionNotes('');
            setShowNotes(false);
        } catch (error) {
            console.error('Failed to end session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackNavigation = async () => {
        if (isStudying) {
            // Pause the session when navigating back
            await handlePauseSession();
        }
        onNavigateBack();
    };

    const handleExitReading = () => {
        setShowCompletion(false);
        setNextSuggestions([]);
        setCompletionData(null);
        onNavigateHome();
    };

    const handleStartNextSubject = async (subject) => {
        try {
            setIsLoading(true);
            setShowCompletion(false);
            await startStudySession(subject.subject);
            // Session will continue in current component
        } catch (error) {
            console.error('Failed to start next subject:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Show completion screen
    if (showCompletion && completionData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                <div className="max-w-2xl mx-auto pt-8">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            {completionData.isCompleted ? (
                                <CheckCircle className="text-white" size={40} />
                            ) : (
                                <Award className="text-white" size={40} />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            {completionData.isCompleted ? 'Session Completed!' : 'Session Ended'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            {completionData.isCompleted
                                ? 'Great job! You completed your study session.'
                                : 'You made progress on your study session.'}
                        </p>
                    </div>

                    {/* Session Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            Session Summary
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">
                                            {completionData.subject.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">
                                            {completionData.subject}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Target: {completionData.targetTime} min
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                                        {formatTime(completionData.actualTime)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Studied
                                    </p>
                                </div>
                            </div>

                            {completionData.isCompleted && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4 rounded-xl">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="text-green-600" size={20} />
                                        <span className="text-green-700 dark:text-green-400 font-medium">
                                            Target time achieved!
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Next Suggestions */}
                    {nextSuggestions.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
                                <Target className="text-blue-600" size={20} />
                                <span>Continue with Next Subject</span>
                            </h3>

                            <div className="space-y-3">
                                {nextSuggestions.map((subject, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleStartNextSubject(subject)}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold">
                                                    {subject.subject.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-white">
                                                    {subject.subject}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {subject.time} • {subject.duration} min
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                                Pending
                                            </span>
                                            <ArrowRight className="text-gray-400" size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={onNavigateBack}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
                        >
                            <Book size={20} />
                            <span>Continue Reading</span>
                        </button>

                        <button
                            onClick={handleExitReading}
                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Home size={20} />
                            <span>Back to Home</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No active session
    if (!currentSession) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
                <div className="max-w-2xl mx-auto pt-8">
                    <div className="text-center">
                        <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            No Active Session
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Start a study session from the Continue Reading tab.
                        </p>
                        <button
                            onClick={onNavigateBack}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 mx-auto hover:scale-105 transition-transform"
                        >
                            <ArrowLeft size={20} />
                            <span>Back to Continue Reading</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main session interface
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-2xl mx-auto pt-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={handleBackNavigation}
                        disabled={isLoading}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>

                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                        Study Session
                    </h1>

                    <button
                        onClick={handleExitReading}
                        disabled={isLoading}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50"
                    >
                        <Home size={20} />
                        <span>Home</span>
                    </button>
                </div>

                {/* Timer Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 mb-6">
                    <div className="text-center mb-8">
                        {/* Circular Timer */}
                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
                                {/* Background circle */}
                                <circle
                                    cx="72"
                                    cy="72"
                                    r="64"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-gray-200 dark:text-gray-700"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="72"
                                    cy="72"
                                    r="64"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 64}`}
                                    strokeDashoffset={`${2 * Math.PI * 64 * (1 - getCircularProgress() / 100)}`}
                                    className="text-blue-600 transition-all duration-300"
                                />
                            </svg>

                            {/* Timer display */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-800 dark:text-white">
                                        {formatTime(currentSession.elapsedTime)}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        {Math.round(getCircularProgress())}% Complete
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subject Info */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                {currentSession.currentSubject}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Target: {getSubjectDuration(currentSession.currentSubject)} minutes
                            </p>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex justify-center space-x-4">
                            {isStudying ? (
                                <button
                                    onClick={handlePauseSession}
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 disabled:opacity-50 hover:scale-105 transition-transform"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Pause size={20} />
                                    )}
                                    <span>Pause</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleResumeSession}
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 disabled:opacity-50 hover:scale-105 transition-transform"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Play size={20} />
                                    )}
                                    <span>Resume</span>
                                </button>
                            )}

                            <button
                                onClick={handleEndSession}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 disabled:opacity-50 hover:scale-105 transition-transform"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Square size={20} />
                                )}
                                <span>End</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Session Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Session Notes
                        </h3>
                        <button
                            onClick={() => setShowNotes(!showNotes)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            {showNotes ? 'Hide' : 'Show'} Notes
                        </button>
                    </div>

                    {showNotes && (
                        <textarea
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                            placeholder="Add notes about your study session..."
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="4"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudySession;