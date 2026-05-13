import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup, Spinner } from 'react-bootstrap';
import { Send, AlertTriangle, Users, Building2, MapPin, Search, Radio, ShieldAlert, Globe, Layout, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import axios from '../api/axios';
import { socket } from '../utils/socket';
import './DispatcherPanel.scss';

const DispatcherPanel = () => {
  const [formData, setFormData] = useState({
    text: '',
    targetType: 'all',
    targetId: '',
    isUrgent: false
  });
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/messages', formData);
      socket.emit('new_dispatcher_message', data);
      setMessageSent(true);
      setFormData({ text: '', targetType: 'all', targetId: '', isUrgent: false });
      setTimeout(() => setMessageSent(false), 3000);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dispatcher-container">
      <header className="panel-header mb-12 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-6">
        <div className="title-group">
          <h2 className="title-liquid text-4xl">Markaziy <span className="text-danger italic">Dispetcherlik</span></h2>
          <p className="subtitle-liquid">Global operatsion boshqaruv markazi</p>
        </div>
        <div className="badge-glass px-6 py-3 border-danger/30 text-danger bg-danger/5 d-flex align-items-center gap-3">
          <div className="dot w-2 h-2 rounded-full bg-danger shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
          <span className="font-black uppercase tracking-widest text-[9px]">Jonli Efir Faol</span>
        </div>
      </header>

      <div className="main-controls">
        {/* Left: Broadcast Form */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-metro p-10 bg-transparent"
        >
          <h3 className="title-liquid text-2xl mb-8 d-flex align-items-center gap-4">
            <div className="p-3 bg-metro-accent-glass rounded-xl shadow-lg">
              <Send className="text-primary" size={24} />
            </div>
            Tezkor E'lon
          </h3>

          <Form onSubmit={handleSubmit} className="space-y-10">
            <Form.Group className="form-group-liquid">
              <Form.Label className="form-label-liquid">Xabar Mazmuni</Form.Label>
              <Form.Control 
                as="textarea"
                required
                className="input-metro-industrial min-h-[180px] text-lg"
                placeholder="Rasmiy xabar matnini kiriting..."
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              />
            </Form.Group>

            <Row className="g-4">
              <Col md={6}>
                <Form.Group className="form-group-liquid">
                  <Form.Label className="form-label-liquid">Yuborish Ko'lami</Form.Label>
                  <Form.Select 
                    className="input-metro-industrial cursor-pointer"
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                  >
                    <option value="all">Barcha Stansiyalar</option>
                    <option value="station">Maxsus Stansiya</option>
                    <option value="department">Yo'nalish / Bo'lim</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {formData.targetType !== 'all' && (
                <Col md={6}>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="form-group-liquid">
                    <Form.Label className="form-label-liquid">
                      Target ID
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      required
                      className="input-metro-industrial"
                      placeholder="Identifikator..."
                      value={formData.targetId}
                      onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                    />
                  </motion.div>
                </Col>
              )}
            </Row>

            <div 
              className={`glass-panel p-6 d-flex align-items-center gap-4 cursor-pointer transition-all border-2 ${formData.isUrgent ? 'border-danger bg-danger/10' : 'border-transparent bg-white/5'}`}
              onClick={() => setFormData({ ...formData, isUrgent: !formData.isUrgent })}
            >
              <div className={`p-4 rounded-2xl ${formData.isUrgent ? 'bg-danger text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-danger/10 text-danger'} transition-all`}>
                <Zap size={24} />
              </div>
              <div>
                <p className={`text-sm font-black m-0 leading-none mb-2 ${formData.isUrgent ? 'text-danger' : ''}`}>SHOSHILINCH E'LON</p>
                <p className="subtitle-liquid m-0 text-[9px]">Ovozli va vizual signalni faollashtirish</p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading || messageSent}
              className={`btn-metro-primary w-100 py-4 !text-base ${
                messageSent ? '!bg-success !border-success' : ''
              }`}
            >
              {messageSent ? (
                <div className="d-flex align-items-center justify-content-center gap-3"><CheckCircle2 size={24} /> YUBORILDI</div>
              ) : (
                <div className="d-flex align-items-center justify-content-center gap-3">
                  {loading ? <Spinner animation="border" size="sm" /> : <Send size={24} />}
                  <span>TIZIMGA E'LON QILISH</span>
                </div>
              )}
            </Button>
          </Form>
        </motion.div>

        {/* Right: Monitoring */}
        <div className="status-monitor space-y-8">
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="glass-panel p-10 shadow-2xl">
              <h4 className="subtitle-liquid mb-8 d-flex align-items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Liniyalar Holati
              </h4>
              <div className="space-y-4">
                {[
                  { name: 'Chilonzor Yo\'li', status: 'Barqaror' },
                  { name: 'O\'zbekiston Yo\'li', status: 'Barqaror' },
                  { name: 'Yunusobod Yo\'li', status: 'Barqaror' },
                  { name: 'Halqa Yo\'li', status: 'Nazoratda' }
                ].map((line, i) => (
                  <div key={i} className="glass-panel p-5 bg-white/5 border-transparent hover:border-primary/20 hover:translate-x-3 transition-all d-flex justify-content-between align-items-center">
                    <span className="font-black text-sm">{line.name}</span>
                    <div className="d-flex align-items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                       <span className="subtitle-liquid m-0 text-[10px]">{line.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <div className="glass-panel p-10 border-top-4 border-primary shadow-2xl">
              <h4 className="subtitle-liquid mb-8 d-flex align-items-center gap-3">
                <ShieldAlert size={18} className="text-primary" />
                Xavfsizlik Tizimi
              </h4>
              <div className="p-6 bg-metro-accent-glass rounded-[2rem] border border-primary/10">
                <p className="text-xs font-bold leading-relaxed opacity-60 m-0">
                  <AlertCircle size={16} className="inline mr-2 text-primary" />
                  Barcha stansiyalar bilan ulanish barqaror. Xavfsizlik protokollari operatsion rejimda.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ActivityCircle = ({ size, className }) => (
  <div className={`w-2 h-2 rounded-full bg-primary animate-pulse ${className}`} style={{ width: size, height: size }} />
);

export default DispatcherPanel;
