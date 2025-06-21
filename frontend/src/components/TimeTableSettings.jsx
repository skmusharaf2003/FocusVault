import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X, Clock, BookOpen, Star, Calendar } from 'lucide-react';

const TimetableManager = () => {
    const [timetables, setTimetables] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTimetable, setEditingTimetable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const emptyTimetable = {
        name: '',
        description: '',
        schedule: daysOfWeek.reduce((acc, day) => ({
            ...acc,
            [day]: [{ time: '09:00', subject: '', duration: 60 }]
        }), {})
    };

    const [currentTimetable, setCurrentTimetable] = useState(emptyTimetable);

    // Fetch timetables from backend
    useEffect(() => {
        fetchTimetables();
    }, []);

    const fetchTimetables = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/study/timetables`);
            if (!response.ok) throw new Error('Failed to fetch timetables');
            const data = await response.json();
            setTimetables(data);
        } catch (err) {
            setError('Failed to load timetables');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTimetable = async () => {
        if (!currentTimetable.name.trim()) {
            setError('Please enter a timetable name');
            return;
        }

        try {
            setLoading(true);
            const url = editingTimetable
                ? `/api/timetables/${editingTimetable._id}`
                : '/api/timetables';

            const method = editingTimetable ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentTimetable)
            });

            if (!response.ok) throw new Error('Failed to save timetable');

            await fetchTimetables();
            handleCloseForm();
        } catch (err) {
            setError('Failed to save timetable');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTimetable = async (id) => {
        if (!confirm('Are you sure you want to delete this timetable?')) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/timetables/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete timetable');
            await fetchTimetables();
        } catch (err) {
            setError('Failed to delete timetable');
        } finally {
            setLoading(false);
        }
    };

    const handleActivateTimetable = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/timetables/${id}/activate`, { method: 'PUT' });
            if (!response.ok) throw new Error('Failed to activate timetable');
            await fetchTimetables();
        } catch (err) {
            setError('Failed to activate timetable');
        } finally {
            setLoading(false);
        }
    };

    const handleEditTimetable = (timetable) => {
        setEditingTimetable(timetable);
        setCurrentTimetable({
            name: timetable.name,
            description: timetable.description || '',
            schedule: { ...timetable.schedule }
        });
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTimetable(null);
        setCurrentTimetable(emptyTimetable);
        setError('');
    };

    const updateScheduleSlot = (day, index, field, value) => {
        setCurrentTimetable(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [day]: prev.schedule[day].map((slot, i) =>
                    i === index ? { ...slot, [field]: value } : slot
                )
            }
        }));
    };

    const addScheduleSlot = (day) => {
        setCurrentTimetable(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [day]: [...prev.schedule[day], { time: '09:00', subject: '', duration: 60 }]
            }
        }));
    };

    const removeScheduleSlot = (day, index) => {
        if (currentTimetable.schedule[day].length <= 1) return;

        setCurrentTimetable(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [day]: prev.schedule[day].filter((_, i) => i !== index)
            }
        }));
    };

    const getDayColor = (index) => {
        const colors = [
            'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
            'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700',
            'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700',
            'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700',
            'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700',
            'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700',
            'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Timetable Manager
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Create and manage your weekly schedules ({timetables.length}/3)
                    </p>
                </div>

                {timetables.length < 3 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <Plus size={20} />
                        New Timetable
                    </motion.button>
                )}
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl"
                    >
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timetables Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {timetables.map((timetable, index) => (
                    <motion.div
                        key={timetable._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={18} className="text-blue-600" />
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                        {timetable.name}
                                    </h3>
                                    {timetable.isActive && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 text-xs font-medium rounded-full"
                                        >
                                            <Star size={12} />
                                            Active
                                        </motion.div>
                                    )}
                                </div>
                                {timetable.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                        {timetable.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Schedule Preview */}
                        <div className="mb-4 space-y-2">
                            {Object.entries(timetable.schedule).slice(0, 3).map(([day, slots]) => (
                                <div key={day} className="flex items-center gap-2 text-xs">
                                    <span className="w-16 text-gray-500 dark:text-gray-400 capitalize">
                                        {day.slice(0, 3)}
                                    </span>
                                    <div className="flex gap-1">
                                        {slots.slice(0, 3).map((slot, i) => (
                                            <div key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                                {slot.time}
                                            </div>
                                        ))}
                                        {slots.length > 3 && (
                                            <span className="text-gray-400">+{slots.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {!timetable.isActive && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleActivateTimetable(timetable._id)}
                                    className="flex items-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 rounded-lg text-sm font-medium transition-colors"
                                    disabled={loading}
                                >
                                    <Check size={14} />
                                    Activate
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditTimetable(timetable)}
                                className="flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Edit size={14} />
                                Edit
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteTimetable(timetable._id)}
                                className="flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 rounded-lg text-sm font-medium transition-colors"
                                disabled={loading}
                            >
                                <Trash2 size={14} />
                                Delete
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Timetable Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && handleCloseForm()}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {editingTimetable ? 'Edit Timetable' : 'Create New Timetable'}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {editingTimetable ? 'Modify your existing schedule' : 'Set up your weekly schedule'}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleCloseForm}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>

                            {/* Basic Info */}
                            <div className="mb-8 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Timetable Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Spring Semester 2025"
                                        value={currentTimetable.name}
                                        onChange={(e) => setCurrentTimetable(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Optional description..."
                                        value={currentTimetable.description}
                                        onChange={(e) => setCurrentTimetable(prev => ({ ...prev, description: e.target.value }))}
                                        rows={2}
                                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="space-y-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Clock size={20} />
                                    Weekly Schedule
                                </h3>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {daysOfWeek.map((day, dayIndex) => (
                                        <motion.div
                                            key={day}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: dayIndex * 0.05 }}
                                            className={`p-4 rounded-xl border-2 ${getDayColor(dayIndex)}`}
                                        >
                                            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 capitalize mb-3 flex items-center gap-2">
                                                <BookOpen size={16} />
                                                {day}
                                            </h4>

                                            <div className="space-y-3">
                                                {currentTimetable.schedule[day].map((slot, slotIndex) => (
                                                    <motion.div
                                                        key={slotIndex}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="flex items-center gap-2 p-3 bg-white/60 dark:bg-gray-700/60 rounded-lg"
                                                    >
                                                        <input
                                                            type="time"
                                                            value={slot.time}
                                                            onChange={(e) => updateScheduleSlot(day, slotIndex, 'time', e.target.value)}
                                                            className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Subject"
                                                            value={slot.subject}
                                                            onChange={(e) => updateScheduleSlot(day, slotIndex, 'subject', e.target.value)}
                                                            className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Min"
                                                            value={slot.duration}
                                                            onChange={(e) => updateScheduleSlot(day, slotIndex, 'duration', parseInt(e.target.value))}
                                                            className="w-16 p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            min="15"
                                                            max="300"
                                                        />
                                                        {currentTimetable.schedule[day].length > 1 && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => removeScheduleSlot(day, slotIndex)}
                                                                className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                                                            >
                                                                <X size={14} />
                                                            </motion.button>
                                                        )}
                                                    </motion.div>
                                                ))}

                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => addScheduleSlot(day)}
                                                    className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:border-blue-400 hover:text-blue-500 transition-colors text-sm"
                                                >
                                                    + Add Slot
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCloseForm}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSaveTimetable}
                                    disabled={loading || !currentTimetable.name.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : editingTimetable ? 'Update Timetable' : 'Create Timetable'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                <span className="text-gray-700 dark:text-gray-300">Processing...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimetableManager;