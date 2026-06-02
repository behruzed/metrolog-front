import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { 
  BookOpen, Search, Plus, ArrowRight, History, ClipboardList, X, Filter, 
  ChevronRight, FileText, CheckCircle2, Activity, ArrowDownLeft, ArrowUpRight,
  Shield, Key, Wrench, Zap, Clock, Database, Server, Cpu
} from 'lucide-react';
import axios from '../api/axios';
import JournalForm from '../components/JournalForm';
import JournalHistory from '../components/JournalHistory';
import OpenDU5Tracker from '../components/OpenDU5Tracker';
import OpenDU8Tracker from '../components/OpenDU8Tracker';
import OpenDU46Tracker from '../components/OpenDU46Tracker';
import JournalEU132 from '../components/JournalEU132';
import JournalDU60 from '../components/JournalDU60';
import './Journals.scss';

const Journals = () => {
  const [journalTypes, setJournalTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'history', 'active'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All'); // 'All', 'DU', 'EU'
  const [showDU2Modal, setShowDU2Modal] = useState(false);
  const [du2Action, setDu2Action] = useState('');
  const [activeTab, setActiveTab] = useState('DU-5'); // 'DU-5', 'DU-8', 'DU-46'
  const [activeCounts, setActiveCounts] = useState({ 'DU-5': 0, 'DU-8': 0, 'DU-46': 0 });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchJournalTypes();
    fetchActiveCounts();

    // Clock Interval
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchActiveCounts = async () => {
    try {
      const [du5, du8, du46] = await Promise.all([
        axios.get('/journals/entries/open/du5'),
        axios.get('/journals/entries/open/du8'),
        axios.get('/journals/entries/open/du46')
      ]);
      setActiveCounts({
        'DU-5': du5.data.length,
        'DU-8': du8.data.length,
        'DU-46': du46.data.length
      });
    } catch (err) {
      console.error('Error fetching active counts:', err);
    }
  };

  const fetchJournalTypes = async () => {
    try {
      const { data } = await axios.get('/journals/types');
      setJournalTypes(data);
    } catch (err) {
      console.error('Error fetching journal types:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stagger container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  // Helper to customize card theme based on journal code
  const getJournalCardDetails = (code) => {
    switch (code) {
      case 'DU-2':
        return {
          themeClass: 'card-theme-du2',
          icon: <Shield size={26} />,
          tagline: 'Qabul qilish va jo‘natish',
          desc: 'Poyezdlar harakati va ularni qabul qilish-jo‘natish bo‘yicha tezkor topshiriqlar jurnali.'
        };
      case 'DU-5':
        return {
          themeClass: 'card-theme-du5',
          icon: <BookOpen size={26} />,
          tagline: 'Tunnel xodimlari nazorati',
          desc: 'Tunnel va yo‘llarda xodimlarning bo‘lishini hamda ishlarni hisobga olish elektron jurnali.'
        };
      case 'DU-8':
        return {
          themeClass: 'card-theme-du8',
          icon: <Key size={26} />,
          tagline: 'Kalit-sterjenlar topshirish',
          desc: 'Chiquvchi kalit-sterjenlar, kalitlar va apparatlarni topshirish hamda qabul qilish jurnali.'
        };
      case 'DU-46':
        return {
          themeClass: 'card-theme-du46',
          icon: <Wrench size={26} />,
          tagline: 'Texnik nosozliklar jurnali',
          desc: 'Yo‘l va stansiya qurilmalarining nosozliklari, shikastlanishlarini ro‘yxatga olish jurnali.'
        };
      case 'EU-132':
        return {
          themeClass: 'card-theme-eu132',
          icon: <Zap size={26} />,
          tagline: 'Elektr ta‘minoti nazorati',
          desc: 'Yuqori kuchlanishli tarmoqlar va elektr uskunalari ish faoliyatini nazorat qilish jurnali.'
        };
      case 'DU-60':
        return {
          themeClass: 'card-theme-du60',
          icon: <FileText size={26} />,
          tagline: 'Stansiya tezkor hisoboti',
          desc: 'Stansiya navbatchisining kunlik tezkor hisoboti va poyezdlar harakatini boshqarish jurnali.'
        };
      default:
        return {
          themeClass: 'card-theme-default',
          icon: <FileText size={26} />,
          tagline: 'Elektron qayd daftari',
          desc: 'Raqamli hisobot va metropoliten nazorati elektron tizimi jurnali.'
        };
    }
  };

  const filteredTypes = journalTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    type.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTypes = [...filteredTypes].sort((a, b) => {
    const order = ['DU-2', 'DU-5', 'DU-8', 'DU-46', 'DU-19', 'DU-60'];
    const aIndex = order.indexOf(a.code);
    const bIndex = order.indexOf(b.code);
    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }
    return a.name.localeCompare(b.name);
  });

  // Filter based on selected category tab
  const categoryFilteredTypes = sortedTypes.filter(type => {
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'DU') return type.code.startsWith('DU');
    if (categoryFilter === 'EU') return type.code.startsWith('EU');
    return true;
  });

  const handleSelectType = (type) => {
    if (type.code === 'DU-2') {
      setSelectedType(type);
      setShowDU2Modal(true);
    } else {
      setSelectedType(type);
      setView('create');
      setDu2Action('');
    }
  };

  const handleDU2ActionSelect = (action) => {
    setDu2Action(action);
    setView('create');
    setShowDU2Modal(false);
  };

  const totalActiveEntries = activeCounts['DU-5'] + activeCounts['DU-8'] + activeCounts['DU-46'];

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-50">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" className="mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="journals-container">
      {/* Background Ambient Blur Spots */}
      <div className="bg-glow-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header Section */}
            <div className="header-section mb-6">
              <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
                <div>
                  <h1 className="title-liquid text-6xl mb-1">
                    Raqamli <span className="text-primary italic">Jurnallar</span>
                  </h1>
                  <p className="subtitle-liquid mb-0">Toshkent Metropoliteni Hisobot Markazi</p>
                </div>
                <div className="d-flex flex-wrap gap-3">
                  <button 
                    onClick={() => setView('active')}
                    className={`btn-metro-ghost !py-2.5 !px-6 d-flex align-items-center gap-3 ${view === 'active' ? 'active shadow-lg' : ''}`}
                  >
                    <Activity size={18} className="text-primary" />
                    <span className="font-black text-[11px] uppercase tracking-widest">Faol Jurnallar</span>
                    {totalActiveEntries > 0 && (
                      <Badge bg="danger" className="rounded-pill px-2.5 py-1 text-[9px] font-extrabold shadow-sm">
                        {totalActiveEntries}
                      </Badge>
                    )}
                  </button>
                  <button 
                    onClick={() => setView('history')}
                    className={`btn-metro-ghost !py-2.5 !px-6 d-flex align-items-center gap-3 ${view === 'history' ? 'active shadow-lg' : ''}`}
                  >
                    <History size={18} className="opacity-60" />
                    <span className="font-black text-[11px] uppercase tracking-widest">Tarix va Arxiv</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Telemetry Panel */}
            <Row className="telemetry-row g-4">
              <Col xs={12} sm={6} lg={3}>
                <div className="telemetry-card">
                  <div className="telemetry-icon-box">
                    <Server size={22} />
                  </div>
                  <div className="telemetry-info">
                    <span className="telemetry-label">Tizim holati</span>
                    <div className="d-flex align-items-center gap-2">
                      <span className="telemetry-value text-success">ONLINE</span>
                      <div className="neon-pulse-dot" />
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <div 
                  className="telemetry-card cursor-pointer"
                  onClick={() => setView('active')}
                >
                  <div className="telemetry-icon-box" style={{ color: 'var(--chilonzor-red)', background: 'rgba(228, 28, 45, 0.08)' }}>
                    <Activity size={22} />
                  </div>
                  <div className="telemetry-info">
                    <span className="telemetry-label">Faol yozuvlar</span>
                    <span className="telemetry-value">{totalActiveEntries} ta ochiq</span>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <div className="telemetry-card">
                  <div className="telemetry-icon-box" style={{ color: 'var(--yunusobod-green)', background: 'rgba(0, 166, 81, 0.08)' }}>
                    <Database size={22} />
                  </div>
                  <div className="telemetry-info">
                    <span className="telemetry-label">Jami jurnallar</span>
                    <span className="telemetry-value">{journalTypes.length} turdagi</span>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <div className="telemetry-card">
                  <div className="telemetry-icon-box" style={{ color: 'var(--ozbekiston-blue)', background: 'rgba(0, 174, 239, 0.08)' }}>
                    <Clock size={22} />
                  </div>
                  <div className="telemetry-info">
                    <span className="telemetry-label">Live Soat</span>
                    <span className="telemetry-value tracking-wider">{currentTime}</span>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Search & Filters Section */}
            <div className="search-filter-section">
              <div className="creative-search-box flex items-center p-1 w-full">
                <div className="p-3 ml-2 text-muted">
                  <Search size={20} className="opacity-45" />
                </div>
                <input 
                  type="text" 
                  className="bg-transparent border-0 w-full h-12 px-3 font-semibold text-lg outline-none placeholder:opacity-30" 
                  placeholder="Jurnal turini yoki kodini yozing..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="p-3 bg-transparent border-0 text-muted hover:text-danger transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="premium-filter-tabs">
                <button 
                  onClick={() => setCategoryFilter('All')}
                  className={`filter-tab ${categoryFilter === 'All' ? 'active' : ''}`}
                >
                  Barchasi
                </button>
                <button 
                  onClick={() => setCategoryFilter('DU')}
                  className={`filter-tab ${categoryFilter === 'DU' ? 'active' : ''}`}
                >
                  Harakat (DU)
                </button>
                <button 
                  onClick={() => setCategoryFilter('EU')}
                  className={`filter-tab ${categoryFilter === 'EU' ? 'active' : ''}`}
                >
                  Energetika (EU)
                </button>
              </div>
            </div>

            {/* Journal Grid */}
            <motion.div 
              className="journal-grid row g-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {categoryFilteredTypes.map((type) => {
                const cardDetails = getJournalCardDetails(type.code);
                const activeCount = activeCounts[type.code] || 0;

                return (
                  <Col key={type._id} xs={12} sm={6} md={4} lg={4} xl={4}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -8 }}
                      onClick={() => handleSelectType(type)}
                      className={`premium-journal-card ${cardDetails.themeClass} cursor-pointer`}
                    >
                      {/* Background Hover Gradient */}
                      <div className="hover-gradient-bg" />

                      {/* Rail Line glowing footer */}
                      <div className="card-rail-line" />

                      <div className="card-top">
                        <div className="card-icon-wrapper">
                          {cardDetails.icon}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {activeCount > 0 && (
                            <Badge bg="danger" className="rounded-pill animate-pulse">
                              {activeCount} faol
                            </Badge>
                          )}
                          <span className="card-code-badge">{type.code}</span>
                        </div>
                      </div>

                      <div className="card-body-content">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-1 block">
                          {cardDetails.tagline}
                        </span>
                        <h3 className="card-title">{type.name}</h3>
                        <p className="card-desc">
                          {type.description || cardDetails.desc}
                        </p>
                      </div>

                      <div className="card-footer-info">
                        <span className="card-stat">
                          <span className="stat-dot" />
                          ONLINE HISOBOT
                        </span>
                        <div className="card-arrow">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                );
              })}
            </motion.div>

            {categoryFilteredTypes.length === 0 && (
              <div className="text-center py-20 opacity-30">
                <ClipboardList size={64} className="mx-auto mb-6" />
                <p className="text-xl font-bold uppercase tracking-widest italic">Hech qanday jurnal topilmadi</p>
              </div>
            )}
          </motion.div>
        )}

        {(view === 'create' || view === 'history' || view === 'active') && (
          <motion.div 
            key="form" 
            className="fade-in-up"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-4 d-flex align-items-center gap-3">
              <button 
                onClick={() => setView('list')}
                className="btn-metro-back"
              >
                <X size={16} strokeWidth={3} /> Orqaga
              </button>
              <div>
                <span className="text-muted" style={{ fontSize: '11px' }}>Hozirgi bo'lim: </span>
                <span className="text-primary font-bold" style={{ fontSize: '13px' }}>
                  {view === 'create' ? `${selectedType?.name} (Yaratish)` : view === 'active' ? 'Yopilmagan Faol Yozuvlar' : 'Stansiya Tarixi'}
                </span>
              </div>
            </div>

            {view === 'create' ? (
              selectedType?.code === 'EU-132' ? (
                <JournalEU132 
                  type={selectedType} 
                  onSuccess={() => setView('list')} 
                  onCancel={() => setView('list')} 
                />
              ) : selectedType?.code === 'DU-60' ? (
                <JournalDU60 
                  type={selectedType} 
                  onSuccess={() => setView('list')} 
                  onCancel={() => setView('list')} 
                />
              ) : (
                <JournalForm 
                  type={selectedType} 
                  du2Action={du2Action}
                  onSuccess={() => {
                    setView('active');
                    if (selectedType?.code === 'DU-5' || selectedType?.code === 'DU-8' || selectedType?.code === 'DU-46') {
                      setActiveTab(selectedType.code);
                    }
                    fetchActiveCounts();
                  }} 
                  onCancel={() => setView('list')} 
                />
              )
            ) : view === 'active' ? (
              <>
                <div className="d-flex gap-2 mb-4">
                  <button 
                    className={`journal-1c-btn ${activeTab === 'DU-5' ? 'journal-1c-btn-primary' : ''}`}
                    onClick={() => setActiveTab('DU-5')}
                  >
                    Tunnelda xodimlar (DU-5) {activeCounts['DU-5'] > 0 && <Badge bg="danger" className="ms-1">{activeCounts['DU-5']}</Badge>}
                  </button>
                  <button 
                    className={`journal-1c-btn ${activeTab === 'DU-8' ? 'journal-1c-btn-primary' : ''}`}
                    onClick={() => setActiveTab('DU-8')}
                  >
                    Kalitlar (DU-8) {activeCounts['DU-8'] > 0 && <Badge bg="danger" className="ms-1">{activeCounts['DU-8']}</Badge>}
                  </button>
                  <button 
                    className={`journal-1c-btn ${activeTab === 'DU-46' ? 'journal-1c-btn-primary' : ''}`}
                    onClick={() => setActiveTab('DU-46')}
                  >
                    Nosozliklar (DU-46) {activeCounts['DU-46'] > 0 && <Badge bg="danger" className="ms-1">{activeCounts['DU-46']}</Badge>}
                  </button>
                </div>
                {activeTab === 'DU-5' ? (
                  <OpenDU5Tracker onUpdate={fetchActiveCounts} />
                ) : activeTab === 'DU-8' ? (
                  <OpenDU8Tracker onUpdate={fetchActiveCounts} />
                ) : (
                  <OpenDU46Tracker onUpdate={fetchActiveCounts} />
                )}
              </>
            ) : (
              <JournalHistory />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DU-2 Modal */}
      <Modal 
        show={showDU2Modal} 
        onHide={() => setShowDU2Modal(false)}
        centered
        className="modal-metro"
      >
        <Modal.Body className="p-12">
          <div className="mb-12">
            <div className="w-20 h-20 mx-auto mb-6 glass-panel flex items-center justify-center bg-primary/10 border-primary/20 shadow-2xl rounded-2xl animate-float">
              <BookOpen size={40} className="text-primary" strokeWidth={2.5} />
            </div>
            <h3 className="title-liquid text-4xl mb-2 tracking-tight text-center">DU-2 JURNALI</h3>
            <p className="subtitle-liquid text-[8px] tracking-[0.5em] text-center">Harakat Yo'nalishini Tanlang</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <motion.button 
              whileHover={{ scale: 1.05, translateY: -10 }}
              whileTap={{ scale: 0.95 }}
              className="glass-panel p-8 d-flex flex-column align-items-center gap-6 border-2 border-primary/20 hover:border-primary transition-all bg-white/5 relative overflow-hidden group shadow-2xl"
              onClick={() => handleDU2ActionSelect('Qabul qilish')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] group-hover:bg-primary/20 transition-all" />
              <div className="w-16 h-16 rounded-2xl bg-primary text-white d-flex align-items-center justify-content-center shadow-[0_10px_30px_rgba(0,122,255,0.4)]">
                <ArrowDownLeft size={32} strokeWidth={3} />
              </div>
              <div className="text-center">
                <span className="font-black text-lg uppercase block mb-1">Qabul Qilish</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Poyezdni stansiyaga kiritish</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05, translateY: -10 }}
              whileTap={{ scale: 0.95 }}
              className="glass-panel p-8 d-flex flex-column align-items-center gap-6 border-2 border-success/20 hover:border-success transition-all bg-white/5 relative overflow-hidden group shadow-2xl"
              onClick={() => handleDU2ActionSelect('Jo‘natish')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 blur-[60px] group-hover:bg-success/20 transition-all" />
              <div className="w-16 h-16 rounded-2xl bg-success text-white d-flex align-items-center justify-content-center shadow-[0_10px_30px_rgba(34,197,94,0.4)]">
                <ArrowUpRight size={32} strokeWidth={3} />
              </div>
              <div className="text-center">
                <span className="font-black text-lg uppercase block mb-1">Jo'natish</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Poyezdni yo'lga chiqarish</span>
              </div>
            </motion.button>
          </div>
          
          <button 
            className="text-[10px] font-black uppercase tracking-[0.6em] text-danger/40 hover:text-danger hover:opacity-100 transition-all border-0 bg-transparent flex items-center justify-center gap-3 mx-auto"
            onClick={() => setShowDU2Modal(false)}
          >
            <div className="w-6 h-[1px] bg-current opacity-20" />
            Bekor qilish
            <div className="w-6 h-[1px] bg-current opacity-20" />
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Journals;
