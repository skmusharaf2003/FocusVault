import { motion } from 'framer-motion';
import { FileText, Shield, Eye, Database, Bell, Users, Mail, Phone } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Terms and Conditions
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Last updated: January 2025
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 space-y-8"
        >
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
              <Shield className="text-primary-600" size={24} />
              <span>Agreement to Terms</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              By accessing and using Focus Vault ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Use License */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              1. Use License
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>Permission is granted to temporarily use Focus Vault for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained in the Service</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
              <Users className="text-blue-600" size={20} />
              <span>2. User Accounts</span>
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Safeguarding the password and all activities under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring your account information remains accurate and up-to-date</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
              <Database className="text-green-600" size={20} />
              <span>3. Privacy and Data Collection</span>
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>We collect and process your personal data in accordance with our Privacy Policy. By using our service, you consent to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Collection of study session data, notes, and timetables for service functionality</li>
                <li>Use of cookies and local storage for app functionality</li>
                <li>Email communications related to your account and study reminders</li>
                <li>Anonymous analytics to improve our service</li>
              </ul>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
              <Bell className="text-yellow-600" size={20} />
              <span>4. Notifications</span>
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>By using Focus Vault, you agree to receive:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Push notifications for study reminders and calendar events</li>
                <li>Email notifications for account security and study progress</li>
                <li>In-app notifications for real-time updates</li>
              </ul>
              <p>You can disable these notifications in your account settings at any time.</p>
            </div>
          </section>

          {/* Content Guidelines */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              5. Content Guidelines
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>You are responsible for all content you create, upload, or share through the Service. You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload harmful, offensive, or inappropriate content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Share false or misleading information</li>
              </ul>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              6. Service Availability
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We strive to provide continuous service availability but do not guarantee uninterrupted access. 
              We reserve the right to modify, suspend, or discontinue the service with or without notice. 
              We are not liable for any interruption of service.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              In no event shall Focus Vault or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
              to use the materials on Focus Vault, even if Focus Vault or an authorized representative has been notified 
              orally or in writing of the possibility of such damage.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              8. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We reserve the right to update these terms at any time. We will notify users of any material changes 
              via email or through the application. Your continued use of the service after such modifications 
              constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
              <Mail className="text-purple-600" size={20} />
              <span>9. Contact Information</span>
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>If you have any questions about these Terms and Conditions, please contact us:</p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail size={16} />
                  <span>Email: support@focusvault.app</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span>Support: Available through the app</span>
                </div>
              </div>
            </div>
          </section>

          {/* Effective Date */}
          <section className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              These terms and conditions are effective as of January 2025 and were last updated on January 2025.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsAndConditions;