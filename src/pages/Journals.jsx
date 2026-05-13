import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { BookOpen, Search, Plus, ArrowRight, History, ClipboardList, X, Filter, ChevronRight, FileText, CheckCircle2, Activity, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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
  const [showDU2Modal, setShowDU2Modal] = useState(false);
  const [du2Action, setDu2Action] = useState('');
  const [activeTab, setActiveTab] = useState('DU-5'); // 'DU-5', 'DU-8', 'DU-46'
  const [activeCounts, setActiveCounts] = useState({ 'DU-5': 0, 'DU-8': 0, 'DU-46': 0 });

  useEffect(() => {
    fetchJournalTypes();
    fetchActiveCounts();
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
      <AnimatePresence>
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="header-section mb-12">
              <div className="flex flex-col md:flex-row items-md-end justify-between gap-10">
                <div>
                  <h1 className="title-liquid text-6xl">Raqamli <span className="text-primary italic">Jurnallar</span></h1>
                  <p className="subtitle-liquid">Toshkent Metropoliteni Hisobot Markazi</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setView('active')}
                    className={`btn-metro-ghost !py-2.5 !px-6 d-flex align-items-center gap-3 ${view === 'active' ? 'active shadow-lg' : ''}`}
                  >
                    <Activity size={18} className={view === 'active' ? 'text-primary' : 'opacity-40'} />
                    <span className="font-black text-[11px] uppercase tracking-widest">Faol Jurnallar</span>
                  </button>
                  <button 
                    onClick={() => setView('history')}
                    className={`btn-metro-ghost !py-2.5 !px-6 d-flex align-items-center gap-3 ${view === 'history' ? 'active shadow-lg' : ''}`}
                  >
                    <History size={18} className={view === 'history' ? 'text-primary' : 'opacity-40'} />
                    <span className="font-black text-[11px] uppercase tracking-widest">Tarix</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="search-container mb-12">
              <div className="glass-panel p-2 flex items-center relative overflow-hidden">
                 <div className="p-4 ml-2">
                   <Search size={24} className="opacity-30" />
                 </div>
                 <input 
                  type="text" 
                  className="bg-transparent border-0 w-full h-16 px-4 font-bold text-xl outline-none placeholder:opacity-20" 
                  placeholder="Jurnal turini qidiring..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>

            <div className="journal-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {sortedTypes.map((type, i) => (
                <motion.div
                  key={type._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => handleSelectType(type)}
                  className="card-metro p-6 group cursor-pointer border-2 hover:border-primary/40 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FileText size={80} strokeWidth={1} />
                  </div>
                  <div className="p-4 bg-metro-accent-glass rounded-2xl w-fit mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <FileText size={24} />
                  </div>
                  <h3 className="title-liquid text-xl mb-3 group-hover:text-primary transition-colors">{type.name}</h3>
                  <p className="text-[11px] font-medium opacity-50 mb-6 leading-relaxed line-clamp-2">
                    {type.description || 'Elektron qayd daftari. Xavfsizlik va aniqlik kafolati.'}
                  </p>
                  
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="badge-glass">{type.code}</span>
                    <div className="p-3 bg-white/5 rounded-xl group-hover:translate-x-2 transition-transform duration-500">
                      <ChevronRight size={24} className="opacity-40" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredTypes.length === 0 && (
              <div className="text-center py-20 opacity-30">
                <ClipboardList size={64} className="mx-auto mb-6" />
                <p className="text-xl font-bold uppercase tracking-widest italic">Hech narsa topilmadi</p>
              </div>
            )}
          </motion.div>
        )}

        {(view === 'create' || view === 'history' || view === 'active') && (
          <div key="form" className="fade-in">
            <div className="mb-3 d-flex align-items-center gap-3">
              <button 
                onClick={() => setView('list')}
                className="btn-metro-back"
              >
                <X size={16} strokeWidth={3} /> Orqaga
              </button>
              <div>
                <span className="text-muted" style={{ fontSize: '11px' }}>Hozirgi bo'lim: </span>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                  {view === 'create' ? `${selectedType?.name}` : view === 'active' ? 'Yopilmagan Yozuvlar' : 'Stansiya Tarixi'}
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
          </div>
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
