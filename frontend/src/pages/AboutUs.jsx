import { motion } from 'framer-motion';
import { BookOpen, Target, Users, Zap, Heart, Star, Award, Lightbulb } from 'lucide-react';

const AboutUs = () => {
  const features = [
    {
      icon: Target,
      title: 'Goal-Oriented Learning',
      description: 'Set clear study goals and track your progress with detailed analytics and insights.'
    },
    {
      icon: Zap,
      title: 'Smart Study Sessions',
      description: 'Intelligent timer system that adapts to your learning patterns and preferences.'
    },
    {
      icon: Users,
      title: 'Collaborative Study',
      description: 'Connect with study partners in real-time chat rooms for motivation and support.'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Notes',
      description: 'Organize your study materials with powerful note-taking and search capabilities.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Study Sessions Completed' },
    { number: '500+', label: 'Hours of Learning Tracked' },
    { number: '95%', label: 'User Satisfaction Rate' },
    { number: '24/7', label: 'Available Anywhere' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Student-Centered',
      description: 'Every feature is designed with students\' needs and learning patterns in mind.'
    },
    {
      icon: Star,
      title: 'Excellence',
      description: 'We strive for the highest quality in user experience and educational value.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Continuously evolving with the latest in educational technology and research.'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="text-white" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          About Focus Vault
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your personal study companion designed to transform the way you learn, 
          track progress, and achieve academic excellence.
        </p>
      </motion.div>

      {/* Mission Statement */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-3xl p-8 border border-primary-200 dark:border-primary-800"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            To empower students worldwide with intelligent study tools that make learning more 
            effective, organized, and enjoyable. We believe that with the right tools and mindset, 
            every student can achieve their academic goals and unlock their full potential.
          </p>
        </div>
      </motion.div>

      {/* Key Features */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Why Choose Focus Vault?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * (index + 3) }}
              className="flex items-start space-x-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Impact by Numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * (index + 4) }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Our Values */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">
          Our Core Values
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * (index + 5) }}
              className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <value.icon className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-800"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Built with Modern Technology
        </h2>
        <div className="text-center space-y-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Focus Vault is built as a Progressive Web App (PWA) using the latest web technologies 
            including React, Node.js, and MongoDB. This ensures a fast, reliable, and native-like 
            experience across all devices.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['React', 'Node.js', 'MongoDB', 'PWA', 'Real-time Chat', 'Cloud Sync'].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Future Vision */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Looking Forward
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            We're constantly evolving Focus Vault based on user feedback and educational research. 
            Our roadmap includes AI-powered study recommendations, advanced analytics, 
            integration with popular learning platforms, and much more.
          </p>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 text-white text-center"
      >
        <h2 className="text-2xl font-bold mb-4">
          Ready to Transform Your Study Experience?
        </h2>
        <p className="text-lg mb-6 opacity-90">
          Join thousands of students who have already improved their learning with Focus Vault.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/reading'}
          className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          Start Studying Now
        </motion.button>
      </motion.div>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400"
      >
        <p>Focus Vault v1.0.0 • Built with ❤️ for students worldwide</p>
      </motion.div>
    </div>
  );
};

export default AboutUs;