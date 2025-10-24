import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';

export default function RecipeChat({ recipe, isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    // Get the API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Initialize socket connection
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      setSocket(null);
    });

    newSocket.on('connect_error', (error) => {
      // Connection error handling
    });

    // Join recipe room after connection
    newSocket.on('connect', () => {
      const recipeId = recipe.postType === 'User' ? recipe._id : recipe.mealId;
      const recipeType = recipe.postType;
      
      newSocket.emit('join-recipe', { recipeId, recipeType });
    });

    // Listen for chat history
    newSocket.on('chat-history', (history) => {
      setMessages(history || []);
    });

    // Listen for new messages
    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen, user, recipe]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) {
      return;
    }

    const recipeId = recipe.postType === 'User' ? recipe._id : recipe.mealId;
    const recipeType = recipe.postType;

    const messageData = {
      recipeId,
      recipeType,
      message: newMessage.trim(),
      userId: user.id || user._id, // Handle both id and _id formats
      username: user.username
    };

    socket.emit('send-message', messageData);

    setNewMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Live Chat - {recipe.strMeal}</h3>
            <div className={`w-2 h-2 rounded-full ${socket ? 'bg-green-500' : 'bg-red-500'}`} title={socket ? 'Connected' : 'Disconnected'}></div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!socket ? (
            <div className="text-center text-red-500">
              <p>⚠️ Connection failed</p>
              <p className="text-sm">WebSocket connection could not be established.</p>
              <p className="text-xs mt-2">Check console for details.</p>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.user === (user?.id || user?._id) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.user === (user?.id || user?._id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm font-medium">{msg.username}</p>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={socket ? "Type a message..." : "Connection failed - cannot send messages"}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!user || !socket}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !user || !socket}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
