import { useState, useRef, useEffect } from 'react';
import { m, motion } from 'framer-motion';
import { Send, Users, MessageCircle, Hash, LogOut, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const ChatRoom = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const {
    currentRoom,
    messages,
    roomUsers,
    isInRoom,
    recentRooms,
    joinRoom,
    leaveRoom,
    sendMessage,
  } = useChat();

  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      joinRoom(roomId.trim());
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'break': return 'bg-orange-500';
      case 'studying': return 'bg-yellow-500';
      case 'helping': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getMessageTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return '';
    }
  };

  if (!isInRoom) {
    return (
      <div className="space-y-6">
        {/* Connection Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`flex items-center justify-center space-x-2 p-3 rounded-xl ${isConnected
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600'
            }`}
        >
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </motion.div>

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
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                disabled={!isConnected}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinRoom}
              disabled={!roomId.trim() || !isConnected}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Room
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Rooms */}
        {recentRooms.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
          >
            <h4 className="font-bold text-gray-800 dark:text-white mb-4">Recent Rooms</h4>
            <div className="space-y-2">
              {recentRooms.slice(0, 5).map((room, index) => (
                <motion.button
                  key={room}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRoomId(room);
                    joinRoom(room);
                  }}
                  disabled={!isConnected}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center space-x-2">
                    <Hash size={16} className="text-gray-400" />
                    <span className="text-gray-800 dark:text-white">{room}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

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
              <h3 className="font-bold text-gray-800 dark:text-white">Room: {currentRoom}</h3>
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                <Users size={14} />
                <span>{roomUsers.length}/5 members</span>
                {isConnected ? (
                  <span className="text-green-500">• Online</span>
                ) : (
                  <span className="text-red-500">• Offline</span>
                )}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={leaveRoom}
            className="flex items-center space-x-2 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Leave</span>
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
          {roomUsers.map((roomUser, index) => (

            <div key={roomUser.id} className="flex-shrink-0 text-center">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-1">
                  {roomUser.avatar ? (
                    <img
                      src={roomUser.avatar}
                      alt={roomUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {roomUser.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}

                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(roomUser.status)} rounded-full border-2 border-white dark:border-gray-800`} />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[60px]">
                {roomUser.name === user?.name ? 'You' : roomUser.name}
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
          {messages.map((msg) => {
            const isOwnMessage = msg.userId === user?._id;
            const isSystemMessage = msg.messageType !== 'text';

            if (isSystemMessage) {
              return (
                <div key={msg._id} className="text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-end space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                      {msg.userAvatar ? (
                        <img
                          src={msg.userAvatar}
                          alt={msg.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-400 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {msg.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}

                    </div>
                    <div>
                      <div className={`px-4 py-2 rounded-2xl ${isOwnMessage
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                        }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <div className={`flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="mr-1">{isOwnMessage ? 'You' : msg.username}</span>
                        <span>•</span>
                        <span className="ml-1">{getMessageTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex space-x-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm resize-none"
              rows="1"
              disabled={!isConnected}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected}
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