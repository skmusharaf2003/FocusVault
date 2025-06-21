import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, MessageCircle, Hash } from 'lucide-react';
import { format } from 'date-fns';

const ChatRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Mock data for demonstration
  const mockMessages = [
    {
      id: 1,
      user: 'Alex',
      message: 'Hey everyone! Just started my math session 📚',
      timestamp: new Date(Date.now() - 300000),
      avatar: 'A'
    },
    {
      id: 2,
      user: 'Sarah',
      message: 'Good luck! I\'m working on chemistry today',
      timestamp: new Date(Date.now() - 240000),
      avatar: 'S'
    },
    {
      id: 3,
      user: 'Mike',
      message: 'Anyone need help with calculus? Happy to assist! 🤓',
      timestamp: new Date(Date.now() - 180000),
      avatar: 'M'
    },
    {
      id: 4,
      user: 'Emma',
      message: 'Thanks Mike! I might take you up on that later',
      timestamp: new Date(Date.now() - 120000),
      avatar: 'E'
    }
  ];

  const mockUsers = [
    { name: 'Alex', avatar: 'A', status: 'studying', subject: 'Mathematics' },
    { name: 'Sarah', avatar: 'S', status: 'break', subject: 'Chemistry' },
    { name: 'Mike', avatar: 'M', status: 'helping', subject: 'Calculus' },
    { name: 'Emma', avatar: 'E', status: 'studying', subject: 'Physics' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      setIsInRoom(true);
      setMessages(mockMessages);
      setUsers(mockUsers);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        user: 'You',
        message: message.trim(),
        timestamp: new Date(),
        avatar: 'Y',
        isOwn: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'studying': return 'bg-green-500';
      case 'break': return 'bg-orange-500';
      case 'helping': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isInRoom) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-white" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            Join Study Chat Room
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect with up to 5 study buddies and motivate each other!
          </p>

          <div className="space-y-4">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Enter Room ID (e.g., study123)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinRoom}
              disabled={!roomId.trim()}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Room
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
        >
          <h4 className="font-bold text-gray-800 dark:text-white mb-4">How it works:</h4>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 text-xs font-bold">1</span>
              </div>
              <p>Enter a Room ID or create your own unique room name</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 text-xs font-bold">2</span>
              </div>
              <p>Share the Room ID with your study partners (max 5 people)</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-600 text-xs font-bold">3</span>
              </div>
              <p>Chat, motivate each other, and share study progress!</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Room Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Hash className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">Room: {roomId}</h3>
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                <Users size={14} />
                <span>{users.length}/5 members</span>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsInRoom(false)}
            className="text-red-500 text-sm font-medium"
          >
            Leave Room
          </motion.button>
        </div>
      </motion.div>

      {/* Online Users */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
      >
        <h4 className="font-medium text-gray-800 dark:text-white mb-3">Online Now</h4>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {users.map((user, index) => (
            <div key={user.name} className="flex-shrink-0 text-center">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-1">
                  <span className="text-white font-bold text-sm">{user.avatar}</span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white dark:border-gray-800`} />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[60px]">
                {user.name}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chat Messages */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col h-80"
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h4 className="font-medium text-gray-800 dark:text-white">Chat</h4>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-end space-x-2 ${msg.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{msg.avatar}</span>
                  </div>
                  <div>
                    <div className={`px-4 py-2 rounded-2xl ${msg.isOwn
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                      }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <div className={`flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="mr-1">{msg.user}</span>
                      <span>•</span>
                      <span className="ml-1">{format(msg.timestamp, 'HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatRoom;