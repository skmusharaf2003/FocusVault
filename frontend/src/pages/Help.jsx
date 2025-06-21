import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Clock, Calendar, FileText, MessageCircle, User, Search } from 'lucide-react';

const Help = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      icon: BookOpen,
      question: 'How do I create my first study session?',
      answer: 'To start your first study session, go to the Reading Space tab and click "Start Study Session". Select a subject from your timetable or create a custom session. Set your target time and click "Start Session" to begin tracking your study time.'
    },
    {
      id: 2,
      category: 'Timetables',
      icon: Calendar,
      question: 'How do I create and manage timetables?',
      answer: 'Go to Profile > Study Settings to create up to 3 timetables. Add subjects with specific times and durations for each day of the week. You can set one timetable as active, and it will appear in your daily schedule. Edit or delete timetables as needed.'
    },
    {
      id: 3,
      category: 'Study Timer',
      icon: Clock,
      question: 'Can I pause and resume study sessions?',
      answer: 'Yes! You can pause your study session at any time by clicking the pause button. Your progress is automatically saved, and you can resume from where you left off. The timer will continue from the paused time when you resume.'
    },
    {
      id: 4,
      category: 'Notes',
      icon: FileText,
      question: 'How do I organize my study notes?',
      answer: 'In the Notes section, you can create, edit, and organize notes with titles, content, and tags. Pin important notes to keep them at the top. Use the search function to quickly find specific notes. You can also add tags to categorize your notes by subject or topic.'
    },
    {
      id: 5,
      category: 'Progress Tracking',
      icon: BookOpen,
      question: 'How can I track my study progress?',
      answer: 'Your progress is tracked automatically on the Home dashboard. View daily, weekly, monthly, and yearly statistics including total study time, session counts, completion rates, and subject-wise breakdowns. Charts help visualize your learning patterns.'
    },
    {
      id: 6,
      category: 'Chat Room',
      icon: MessageCircle,
      question: 'How does the study chat room work?',
      answer: 'Join study rooms by entering a Room ID (or create your own). Share the ID with up to 4 study partners. Chat in real-time, share progress, and motivate each other. Each room supports a maximum of 5 participants for focused group study sessions.'
    },
    {
      id: 7,
      category: 'Profile & Settings',
      icon: User,
      question: 'How do I customize my profile and preferences?',
      answer: 'Go to the Profile tab to update your personal information, profile picture, study preferences, and app settings. You can set default study times, preferred study hours, active study days, and notification preferences.'
    },
    {
      id: 8,
      category: 'Data & Sync',
      icon: BookOpen,
      question: 'Is my data saved and synced across devices?',
      answer: 'Yes, all your data including study sessions, notes, timetables, and progress is automatically saved to the cloud. You can access your account from any device and your data will be synced in real-time.'
    },
    {
      id: 9,
      category: 'PWA Features',
      icon: BookOpen,
      question: 'Can I install this app on my phone?',
      answer: 'Yes! This is a Progressive Web App (PWA). You can install it on your phone or desktop for a native app experience. Look for the "Add to Home Screen" option in your browser menu, or you\'ll see an install prompt when visiting the app.'
    },
    {
      id: 10,
      category: 'Troubleshooting',
      icon: HelpCircle,
      question: 'What should I do if I encounter issues?',
      answer: 'If you experience any problems: 1) Refresh the page, 2) Clear your browser cache, 3) Check your internet connection, 4) Try logging out and back in. If issues persist, the app automatically saves your progress, so you won\'t lose data.'
    }
  ];

  const categories = [...new Set(faqs.map(faq => faq.category))];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const getCategoryIcon = (category) => {
    const faq = faqs.find(f => f.category === category);
    return faq ? faq.icon : HelpCircle;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Help & Support
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Find answers to common questions and learn how to use Focus Vault
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Quick Start Guide */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Quick Start Guide
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Create Your Timetable</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Set up your weekly study schedule in Profile > Study Settings</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Start Studying</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Go to Reading Space and begin your first study session</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Track Progress</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Monitor your study statistics on the Home dashboard</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Take Notes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Organize your study notes with tags and search</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Browse by Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category);
            const categoryCount = faqs.filter(faq => faq.category === category).length;
            
            return (
              <motion.button
                key={category}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSearchTerm(category)}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Icon className="text-primary-600 mb-2" size={20} />
                <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                  {category}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {categoryCount} article{categoryCount !== 1 ? 's' : ''}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
          Frequently Asked Questions
          {searchTerm && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              ({filteredFaqs.length} results)
            </span>
          )}
        </h3>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 * index }}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <motion.button
                whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                onClick={() => toggleFaq(faq.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <faq.icon className="text-primary-600 flex-shrink-0" size={20} />
                  <div>
                    <span className="text-xs text-primary-600 font-medium">
                      {faq.category}
                    </span>
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {faq.question}
                    </h4>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="text-gray-400" size={20} />
                </motion.div>
              </motion.button>

              <motion.div
                initial={false}
                animate={{
                  height: expandedFaq === faq.id ? 'auto' : 0,
                  opacity: expandedFaq === faq.id ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {filteredFaqs.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              No help articles found for "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 text-center"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
          Still Need Help?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Can't find what you're looking for? We're here to help!
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Focus Vault is designed to be intuitive and user-friendly. Most features are self-explanatory, 
            but if you need assistance, try exploring the app or refer to the FAQ above.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This app is continuously being improved based on user feedback.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Help;