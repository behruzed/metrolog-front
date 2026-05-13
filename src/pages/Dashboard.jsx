import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { 
  BookOpen, 
  MessageSquare, 
  User, 
  Bell, 
  ShieldCheck,
  Activity,
  PlusCircle,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Train
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { socket } from '../utils/socket';
import './Dashboard.scss';

const Dashboard = () => {
  const { employee, station, theme } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(3);
  const [greeting, setGreeting] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('XAYRLI TONG');
    else if (hours < 18) setGreeting('XAYRLI KUN');
    else setGreeting('XAYRLI KECH');

    if (station) {
       socket.connect();
       socket.emit('join_room', station._id);
       socket.on('receive_dispatcher_message', () => {
         setUnreadCount(prev => prev + 1);
       });
    }
    return () => {
      socket.off('receive_dispatcher_message');
    };
  }, [station]);

  const stats = [
    { label: "JURNAL YOZUVLARI", value: "1,420", trend: "+12.5%", isPositive: true, icon: BookOpen, color: "var(--metro-accent)" },
    { label: "TIZIM BARQARORLIGI", value: "99.9%", trend: "OPTIMAL", isPositive: true, icon: ShieldCheck, color: "#10b981" },
    { label: "FAOL POYEZDLAR", value: "42", trend: "+3 Bugun", isPositive: true, icon: Train, color: "#f59e0b" },
    { label: "XABARNOMALAR", value: unreadCount, trend: "MUHIM", isPositive: false, icon: Bell, color: "#ef4444" }
  ];

  const activities = [
    { time: '11:45', title: 'DISPETCHER BUYRUG\'I', desc: '1-liniya tezligini oshirish', type: 'warning', icon: AlertTriangle },
    { time: '10:20', title: 'TIZIM TEKSHIRUVI', desc: 'Smenadagi texnik holat tekshirildi - Barcha tizimlar OK', type: 'success', icon: CheckCircle2 },
    { time: '09:00', title: 'SMENA QABULI', desc: 'Smena qabul qilindi. 42-marshrut yo\'lga chiqdi', type: 'info', icon: Activity }
  ];

  return (
    <div className="dashboard-epic-container">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-epic"
      >
        <div className="hero-content">
          <div className="hero-badge">
            <span className="live-indicator"></span>
            TIZIM ONLAYN
          </div>
          <h1 className="hero-title">
            <span className="greeting">{greeting},</span>
            <br />
            {employee?.name}
          </h1>
          <div className="hero-meta">
            <div className="meta-item">
              <MapPin size={16} />
              <span>{station?.name || 'Markaziy'} stansiyasi</span>
            </div>
            <div className="meta-item">
              <Clock size={16} />
              <span>{time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
        </div>
        <div className="hero-graphics">
           <div className="graphic-circle circle-1"></div>
           <div className="graphic-circle circle-2"></div>
           <div className="graphic-grid"></div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <Row className="g-4 mb-4">
        {stats.map((stat, i) => (
          <Col key={i} xs={12} sm={6} lg={3}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card-epic"
              style={{ '--stat-color': stat.color }}
            >
              <div className="stat-header">
                <div className="stat-icon-wrapper">
                  <stat.icon size={20} />
                </div>
                <div className={`stat-trend ${stat.isPositive ? 'positive' : 'negative'}`}>
                   {stat.isPositive ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                   {stat.trend}
                </div>
              </div>
              <div className="stat-body">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
              <div className="stat-bg-icon">
                <stat.icon size={100} />
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Quick Actions */}
        <Col lg={8}>
          <div className="section-panel-epic">
            <div className="panel-header">
               <div className="panel-title-wrapper">
                 <Zap size={20} className="panel-icon text-warning" />
                 <h2 className="panel-title">TEZKOR AMALLAR</h2>
               </div>
            </div>
            <div className="quick-actions-grid">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/journals')} 
                className="action-card-epic primary"
              >
                <div className="action-icon-box">
                  <PlusCircle size={24} />
                </div>
                <div className="action-content">
                  <h4>YANGI YOZUV</h4>
                  <p>RAQAMLI JURNALLARNI TO'LDIRISH</p>
                </div>
                <ArrowUpRight size={20} className="action-arrow" />
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/messages')} 
                className="action-card-epic danger"
              >
                <div className="action-icon-box">
                  <MessageSquare size={24} />
                </div>
                <div className="action-content">
                  <h4>XABARLAR MARKAZI</h4>
                  <p>DISPETCHERLIK KO'RSATMALARI</p>
                </div>
                <ArrowUpRight size={20} className="action-arrow" />
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/profile')} 
                className="action-card-epic success"
              >
                <div className="action-icon-box">
                  <User size={24} />
                </div>
                <div className="action-content">
                  <h4>SHAXSIY PROFIL</h4>
                  <p>LOYIHA SOZLAMALARI VA STATISTIKA</p>
                </div>
                <ArrowUpRight size={20} className="action-arrow" />
              </motion.button>
            </div>
          </div>
        </Col>

        {/* Activity Timeline */}
        <Col lg={4}>
          <div className="section-panel-epic h-100">
            <div className="panel-header">
               <div className="panel-title-wrapper">
                 <Activity size={20} className="panel-icon text-success" />
                 <h2 className="panel-title">OPERATSION FAOLIYAT</h2>
               </div>
            </div>
            <div className="timeline-epic custom-scrollbar">
              {activities.map((activity, i) => (
                <div key={i} className="timeline-item-epic">
                  <div className={`timeline-marker ${activity.type}`}>
                     <activity.icon size={12} />
                  </div>
                  <div className="timeline-content">
                    <span className="timeline-time">{activity.time}</span>
                    <h5 className="timeline-title">{activity.title}</h5>
                    <p className="timeline-desc">{activity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
