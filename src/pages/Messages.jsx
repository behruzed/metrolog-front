import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { MessageSquare, Bell, BellOff, CheckCircle2, AlertTriangle, Clock, Paperclip, Send, ShieldAlert, AlertCircle, ArrowUpRight, Globe } from 'lucide-react';
import axios from '../api/axios';
import { socket } from '../utils/socket';
import useAuthStore from '../store/authStore';
import './Messages.scss';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { station, employee, theme } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications_enabled') !== 'false';
  });

  const toggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem('notifications_enabled', String(next));
  };

  useEffect(() => {
    fetchMessages();
    socket.connect();
    socket.emit('join_room', station?._id);
    socket.emit('join_room', station?.department);

    socket.on('receive_dispatcher_message', (message) => {
      setMessages(prev => [message, ...prev]);
    });

    return () => {
      socket.off('receive_dispatcher_message');
    };
  }, [station]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get('/messages');
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`/messages/${id}/read`);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-50">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" className="mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-metro-foreground">Xabarlar markazi yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <header className="flex flex-col md:flex-row items-md-end justify-between gap-6 pb-12 mb-10 border-b border-white/5">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-metro-foreground">Xabarlar <span className="text-danger">Markazi</span></h2>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] text-metro-foreground">Dispatcherlik ko'rsatmalari va e'lonlar markazi</p>
        </div>
        <Button 
          onClick={toggleNotifications}
          className={`btn-metro h-14 px-8 border-2 ${notificationsEnabled ? 'btn-primary' : 'bg-white/5 border-white/10 text-metro-foreground/40'}`}
        >
          {notificationsEnabled ? <Bell size={20} className="animate-bounce" /> : <BellOff size={20} />}
          <span>{notificationsEnabled ? 'BILDIRISHNOMALAR YOQILDI' : 'BILDIRISHNOMALAR O\'CHIQ'}</span>
        </Button>
      </header>

      {messages.length === 0 ? (
        <div className="p-24 card-modern text-center border-2 border-dashed border-white/10 d-flex flex-column align-items-center justify-content-center opacity-30">
           <MessageSquare size={80} strokeWidth={1} />
           <p className="text-xl font-bold uppercase tracking-widest italic mt-8">Hozirda yangi xabarlar mavjud emas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <motion.div 
              key={msg._id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`message-card ${msg.isUrgent ? 'urgent' : ''} ${msg.isRead ? 'read' : ''}`}
            >
              {msg.isUrgent && (
                <div className="urgent-badge shadow-lg">SHOSHILINCH</div>
              )}

              <div className="message-body">
                <div className={`icon-box ${msg.isUrgent ? 'urgent-icon' : 'standard'}`}>
                  {msg.isUrgent ? <ShieldAlert size={28} strokeWidth={3} /> : <Send size={28} />}
                </div>

                <div className="text-content">
                  <span className="sender">{msg.createdBy?.name || 'Tizim Dispetcheri'}</span>
                  <h3 className="text-metro-foreground">{msg.text}</h3>
                  <div className="meta text-metro-foreground/40">
                    <span className="d-flex align-items-center gap-2"><Clock size={14} /> {new Date(msg.createdAt).toLocaleTimeString('uz-UZ')}</span>
                    <span className="d-flex align-items-center gap-2"><Globe size={14} /> {msg.targetType}</span>
                  </div>
                </div>

                <div className="actions">
                   {msg.isRead ? (
                     <div className="d-flex align-items-center gap-2 px-6 py-3 text-success font-black text-[10px] tracking-widest bg-success/5 border border-success/20 rounded-xl">
                       <CheckCircle2 size={16} />
                       <span>O'QILGAN</span>
                     </div>
                   ) : (
                     <Button 
                      onClick={() => markAsRead(msg._id)}
                      className="btn-metro px-6 py-3 border-2 border-transparent hover:border-primary/20 bg-white/5 group"
                     >
                       <CheckCircle2 size={18} className="text-success group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-black tracking-widest text-metro-foreground">O'QILDI</span>
                     </Button>
                   )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
