import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Send, User as UserIcon, MessageSquare, Shield, AlertCircle } from 'lucide-react';

export default function Chat() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserIdParam = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null); // The selected User object
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchConversations = async (selectTargetId = null) => {
    try {
      const res = await api.get('/api/chat/conversations/');
      setConversations(res.data);
      
      // If a ?user=ID parameter is passed in searchParams, select that user
      if (selectTargetId) {
        const found = res.data.find(c => c.id === parseInt(selectTargetId));
        if (found) {
          setActiveUser(found);
        } else {
          // If not in chat list, fetch user info from provider detail or profiles
          try {
            const userRes = await api.get(`/api/users/${selectTargetId}/`);
            setActiveUser({
              id: userRes.data.id,
              username: userRes.data.username,
              role: userRes.data.role
            });
          } catch(e) {
            // General user profile fallback
            console.error(e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConv(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeUser) return;
    try {
      const res = await api.get(`/api/chat/messages/${activeUser.id}/`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  };

  // 1. Initial Load of Conversations
  useEffect(() => {
    fetchConversations(targetUserIdParam);
  }, [targetUserIdParam]);

  // 2. Load Message history when Active User changes
  useEffect(() => {
    if (!activeUser) return;
    
    setLoadingHistory(true);
    fetchMessages().then(() => {
      setLoadingHistory(false);
      scrollToBottom();
    });

    // Clear any existing polling loop
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Set up polling loop every 4 seconds to fetch new messages and update conversations list
    pollingRef.current = setInterval(() => {
      fetchMessages();
      api.get('/api/chat/conversations/').then(res => setConversations(res.data));
    }, 4000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [activeUser]);

  // 3. Scroll to Bottom Helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeUser) return;

    const textToSend = messageText;
    setMessageText('');
    
    try {
      const res = await api.post('/api/chat/messages/send/', {
        receiver_id: activeUser.id,
        message: textToSend
      });
      setMessages(prev => [...prev, res.data]);
      
      // Update conversations list summary
      fetchConversations();
    } catch (err) {
      setError('Message delivery failed.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden transition-colors duration-200">
      
      {/* 1. Conversations Sidebar list */}
      <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-850">
          <h2 className="text-xl font-bold font-heading text-slate-850 dark:text-white">Conversations</h2>
          <p className="text-xs text-slate-400">Direct message history channels</p>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
          {loadingConv ? (
            <div className="p-6 text-center text-sm text-slate-400">Loading inbox...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm">No conversations started.</p>
              <p className="text-xs">Go to details page of any service to click 'Contact' and start chatting.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = activeUser && activeUser.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSearchParams({ user: conv.id });
                    setActiveUser(conv);
                  }}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-slate-50 dark:bg-slate-800/60' : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold uppercase shrink-0 border dark:border-slate-750">
                    {conv.username.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="block font-bold text-slate-800 dark:text-white truncate text-sm">
                        {conv.username}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {conv.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {conv.last_message || 'No messages'}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Message History Pane */}
      <div className="flex-1 flex flex-col bg-slate-55 dark:bg-slate-950/40 relative">
        {activeUser ? (
          <>
            {/* Header info */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-100 dark:border-indigo-900/30">
                  {activeUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{activeUser.username}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {activeUser.role}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="absolute top-16 left-6 right-6 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs z-50 flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Bubble logs timeline */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs text-slate-400">Loading logs...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm italic">
                  Say Hello to start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender.id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md p-4 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-bl-none text-slate-800 dark:text-slate-200'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <span className={`block text-[9px] mt-1.5 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                required
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button
                type="submit"
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
            <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-805" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Your Chat Workspace</h3>
              <p className="text-sm">Select a conversation from the sidebar to view history and chat in real-time.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
