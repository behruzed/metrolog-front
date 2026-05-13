import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Row, Col, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { User, LogIn, ShieldCheck, ArrowLeft, Send, Award, Clock, Briefcase, Zap, ShieldAlert, CheckCircle2, ChevronRight, Fingerprint } from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EmployeeLogin = () => {
  const [personalId, setPersonalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { station, setEmployee, logoutStation } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/auth/employee-login', {
        licenseId: personalId,
        password,
        stationId: station?._id
      });
      setEmployee(data, data.employeeToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Xodim login xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-metro-bg text-metro-fg transition-colors duration-500 overflow-hidden">
      <Navbar isDashboard={false} />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side: Creative Metro Animation */}
        <div className="hidden lg:flex lg:w-1/2 bg-metro-sidebar relative overflow-hidden items-center justify-center p-24">
           {/* Animated Metro Lines Overlay */}
           <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
             <motion.path 
               d="M-100 200 L400 200 L600 400 L1200 400" 
               stroke="var(--metro-accent)" 
               strokeWidth="2" 
               fill="none" 
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: 1, opacity: 1 }}
               transition={{ duration: 3, repeat: Infinity, repeatType: "loop", ease: "linear" }}
             />
             <motion.path 
               d="M-100 600 L800 600 L1000 800" 
               stroke="var(--metro-accent)" 
               strokeWidth="1" 
               fill="none" 
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: 1, opacity: 0.5 }}
               transition={{ duration: 4, repeat: Infinity, repeatType: "loop", ease: "linear", delay: 1 }}
             />
             <circle cx="400" cy="200" r="4" fill="var(--metro-accent)" />
             <circle cx="600" cy="400" r="4" fill="var(--metro-accent)" />
           </svg>

           <div className="relative z-10 space-y-16 max-w-lg">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 text-[10px] uppercase font-black tracking-widest bg-metro-accent/20 text-metro-accent border border-metro-accent/30 rounded-lg">
                  <Fingerprint size={14} /> BIOMETRIK VA RAQAMLI NAZORAT
                </div>
                <h1 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">
                  XIZMAT <br /><span className="text-metro-accent">PROFILI</span>
                </h1>
                <p className="text-xl text-white/40 font-bold leading-relaxed border-l-4 border-metro-accent pl-8 py-2">
                  Toshkent Metropolitenining raqamli ekotizimiga xush kelibsiz. Ish faoliyatingizni boshlash uchun shaxsingizni tasdiqlang.
                </p>
              </motion.div>

              <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/5">
                 {[
                   { icon: Award, label: 'TASDIQLANGAN', sub: 'Xavfsiz portal' },
                   { icon: Clock, label: 'LOGLASH', sub: '24/7 Monitoring' },
                   { icon: Briefcase, label: 'OPERATSION', sub: 'To\'liq nazorat' },
                   { icon: ShieldCheck, label: 'HIMOYALANGAN', sub: 'End-to-end' }
                 ].map((item, i) => (
                   <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex items-center gap-4 group"
                   >
                     <div className="p-3 bg-white/5 rounded-xl text-metro-accent group-hover:bg-metro-accent group-hover:text-white transition-all duration-500">
                       <item.icon size={20} />
                     </div>
                     <div>
                       <h4 className="text-white font-black text-[10px] uppercase m-0 tracking-widest">{item.label}</h4>
                       <p className="text-white/20 text-[9px] font-bold uppercase m-0">{item.sub}</p>
                     </div>
                   </motion.div>
                 ))}
              </div>
           </div>
           
           {/* Pulsing indicator */}
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute md:top-20 md:right-20 w-96 h-96 bg-metro-accent/10 rounded-full blur-3xl pointer-events-none" 
           />
        </div>

        {/* Right Side: Creative Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-24 bg-metro-bg dark:bg-metro-bg relative text-metro-fg">
          <div className="absolute top-12 right-12 hidden md:block">
             <div className="text-right">
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] m-0 mb-1">STANSIYA FAOLLIYATI</p>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-metro-success animate-pulse" />
                   <span className="text-lg font-black italic uppercase text-metro-primary">{station?.name || 'PAXTAKOR'}</span>
                </div>
             </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md space-y-12 bg-metro-panel border border-metro-border rounded-[2rem] p-10 shadow-xl text-metro-fg"
          >
            <div className="space-y-4">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter m-0 text-metro-fg">XODIM <span className="text-metro-primary">KIRISHI</span></h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-metro-fg">Identifikatsiya kodi va parol talab etiladi</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Alert variant="danger" className="border-0 bg-metro-danger/10 text-metro-danger rounded-2xl flex items-center gap-4 p-5">
                    <ShieldAlert size={24} />
                    <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Form onSubmit={handleLogin} className="space-y-8">
              {[
                { label: 'Shaxsiy ID (Taber)', icon: Briefcase, type: 'text', value: personalId, setter: setPersonalId, placeholder: 'EMP-0000' },
                { label: 'Parol', icon: ShieldCheck, type: 'password', value: password, setter: setPassword, placeholder: '••••••••' }
              ].map((field, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                >
                  <Form.Group className="space-y-3">
                    <Form.Label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 text-metro-fg">{field.label}</Form.Label>
                    <div className="relative group">
                       <field.icon className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-metro-primary group-focus-within:opacity-100 transition-all text-metro-fg" size={20} />
                       <Form.Control 
                         type={field.type} 
                         required
                         className="input-metro-industrial h-16 ps-14 text-sm font-bold tracking-widest border-2 bg-metro-panel"
                         placeholder={field.placeholder}
                         value={field.value}
                         onChange={(e) => field.setter(e.target.value)}
                       />
                    </div>
                  </Form.Group>
                </motion.div>
              ))}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="btn-metro-primary w-100 h-16 flex items-center justify-center gap-4 group overflow-hidden relative"
                >
                  {loading ? <Spinner animation="border" size="sm" /> : (
                    <>
                      <Zap size={22} className="group-hover:scale-125 transition-transform" />
                      <span className="relative z-10">TAVSIFNI TASDIQLASH</span>
                      <ChevronRight size={18} className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </>
                  )}
                </Button>
              </motion.div>
            </Form>

            <div className="pt-12 border-t border-metro-border flex items-center justify-between">
               <button 
                onClick={() => {
                  logoutStation();
                  navigate('/station-login');
                }}
                className="btn-metro-back"
               >
                 <ArrowLeft size={16} strokeWidth={3} /> Boshqa Stansiya
               </button>
               <span className="text-[9px] font-black opacity-20 text-metro-fg">SECURE NODE: 771-UX</span>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EmployeeLogin;
