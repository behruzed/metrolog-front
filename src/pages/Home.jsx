import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { 
  Shield, Zap, Activity, Users, Lock, Clock, ArrowRight, MapPin, 
  CheckCircle2, ChevronRight, Train, Globe, ShieldCheck, Database, Server
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import heroImg from '../assets/hero.png';
import './Home.scss';

const Home = () => {
  const { theme, station, employee } = useAuthStore();
  const navigate = useNavigate();
  const [activeTrains, setActiveTrains] = useState(12);

  useEffect(() => {
    // Dynamic train count simulator to make page feel alive
    const interval = setInterval(() => {
      setActiveTrains(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 10 && next <= 15 ? next : prev;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleActionClick = () => {
    if (station) {
      if (employee) navigate('/dashboard');
      else navigate('/employee-login');
    } else {
      navigate('/station-login');
    }
  };

  const features = [
    { 
      title: 'Raqamli Jurnallash', 
      desc: 'Barcha qog‘oz jurnallarni zamonaviy, tezkor va ekologik toza raqamli elektron formatga o‘tkazing.',
      icon: <Zap size={28} />,
      cardClass: 'feat-card-1'
    },
    { 
      title: 'Real-vaqt Monitoringi', 
      desc: 'Yo‘nalishdagi poyezdlar harakati, dispetcherlik xabarlari va stansiyalar holatini doimiy nazorat qiling.',
      icon: <Activity size={28} />,
      cardClass: 'feat-card-2'
    },
    { 
      title: 'Maksimal Xavfsizlik', 
      desc: 'Tizim xavfsizligi va shaxsiy ma‘lumotlar himoyasi yuqori darajadagi shifrlash standartlari bilan ta‘minlangan.',
      icon: <ShieldCheck size={28} />,
      cardClass: 'feat-card-3'
    }
  ];

  const metroLines = [
    {
      name: 'Chilonzor Liniyasi',
      badge: 'Qizil liniya',
      stations: '17 ta stansiya',
      length: '23.7 km',
      status: 'FAOL',
      cardClass: 'line-card-chilonzor'
    },
    {
      name: 'O‘zbekiston Liniyasi',
      badge: 'Moviy liniya',
      stations: '11 ta stansiya',
      length: '14.3 km',
      status: 'FAOL',
      cardClass: 'line-card-ozbekiston'
    },
    {
      name: 'Yunusobod Liniyasi',
      badge: 'Yashil liniya',
      stations: '8 ta stansiya',
      length: '10.5 km',
      status: 'FAOL',
      cardClass: 'line-card-yunusobod'
    },
    {
      name: 'Yerusti Halqa Yo‘li',
      badge: 'Sariq liniya',
      stations: '14 ta stansiya',
      length: '29.1 km',
      status: 'FAOL',
      cardClass: 'line-card-halqa'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 overflow-x-hidden home-premium-container ${theme === 'dark' ? 'dark bg-metro-sidebar' : 'bg-metro-bg'}`}>
      {/* Ambient Blur Background Blobs */}
      <div className="bg-glow-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <Navbar isDashboard={false} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-premium-section">
          <Container className="px-6">
            <Row className="align-items-center g-5">
              <Col lg={7} className="text-center text-lg-start">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="hero-badge"
                >
                  <div className="pulse-dot" />
                  Yangi Avlod Raqamli Ekotizimi
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="hero-title"
                >
                  METRO <br /> <span className="italic-gradient">RAQAMLI</span> <br /> OLAMI.
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="hero-desc"
                >
                  Toshkent Metropolitenining barcha operatsion jarayonlarini, elektron jurnallarini va monitoring xizmatlarini yagona, xavfsiz hamda real vaqtdagi raqamli platformada birlashtiring.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="d-flex flex-column flex-sm-row align-items-center gap-4 justify-content-center justify-content-lg-start"
                >
                  <button 
                     onClick={handleActionClick}
                     className="creative-btn-primary min-w-[260px]"
                  >
                    {station ? 'BOSHQARUVGA O‘TISH' : 'TIZIMNI BOSHLASH'} 
                    <ArrowRight size={20} className="ml-2" />
                  </button>
                  <button 
                    onClick={() => {
                      const element = document.getElementById('features');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="creative-btn-secondary min-w-[180px]"
                  >
                    Tizim haqida 
                    <Globe size={18} className="ml-2" />
                  </button>
                </motion.div>
              </Col>

              <Col lg={5} className="d-none d-lg-block">
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
                   className="hologram-card-wrapper"
                 >
                    <div className="glass-photo-frame">
                       {/* Radar scan animation line */}
                       <div className="scan-line" />

                       {/* Live Telemetry Badge 1 */}
                       <div className="telemetry-overlay-badge badge-top-right">
                          <div className="pulse-neon-green" />
                          <div className="badge-info">
                             <span className="badge-lbl">Tizim holati</span>
                             <span className="badge-val">ONLINE</span>
                          </div>
                       </div>

                       {/* Live Telemetry Badge 2 */}
                       <div className="telemetry-overlay-badge badge-bottom-left">
                          <Train size={18} className="text-primary animate-pulse" />
                          <div className="badge-info">
                             <span className="badge-lbl">Harakat tarkibi</span>
                             <span className="badge-val">{activeTrains} ta poyezd</span>
                          </div>
                       </div>

                       <img 
                         src={heroImg} 
                         alt="Toshkent Metro Digital Platform" 
                         className="hero-photo"
                       />
                    </div>
                 </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section className="features-section" id="features">
           <Container>
              <div className="text-center mb-20 max-w-2xl mx-auto space-y-4">
                 <div className="inline-block px-4 py-2 text-[10px] uppercase font-black tracking-widest bg-primary text-white rounded-lg">
                   Tizim Imkoniyatlari
                 </div>
                 <h2 className="text-5xl font-black italic uppercase tracking-tighter text-metro-fg m-0 mt-3">
                   Mukammal Boshqaruv
                 </h2>
                 <p className="text-xs font-black opacity-45 uppercase tracking-widest text-metro-fg">
                   Har bir detal xavfsizlik va tezkorlik uchun xizmat qiladi
                 </p>
              </div>

              <Row className="g-4">
                 {features.map((feature, i) => (
                    <Col md={4} key={i}>
                       <motion.div 
                         initial={{ opacity: 0, y: 30 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: i * 0.1 }}
                         className={`premium-feature-card ${feature.cardClass}`}
                       >
                          <div className="feat-icon-box">
                             {feature.icon}
                          </div>
                          <h3 className="feat-title">{feature.title}</h3>
                          <p className="feat-desc">{feature.desc}</p>
                          <div 
                            onClick={handleActionClick}
                            className="feat-link"
                          >
                             O‘tish <ChevronRight size={15} className="feat-arrow" />
                          </div>
                       </motion.div>
                    </Col>
                 ))}
              </Row>
           </Container>
        </section>

        {/* Metro Lines Section */}
        <section className="metro-lines-section">
          <Container>
            <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
              <div className="inline-block px-4 py-2 text-[10px] uppercase font-black tracking-widest bg-success text-white rounded-lg">
                Metropoliten Liniyalari
              </div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter text-metro-fg m-0 mt-3">
                Liniyalar holati
              </h2>
              <p className="text-xs font-black opacity-45 uppercase tracking-widest text-metro-fg">
                Toshkent Metropolitenining barcha liniyalari integratsiyasi
              </p>
            </div>

            <Row className="lines-grid g-4">
              {metroLines.map((line, i) => (
                <Col key={i} xs={12} sm={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className={`line-status-card ${line.cardClass}`}
                  >
                    <div className="line-glow-strip" />
                    <div className="line-top">
                      <h3 className="line-name">{line.name}</h3>
                      <span className="line-badge">{line.badge}</span>
                    </div>
                    <div className="line-body">
                      <div className="line-stat-item">
                        <span>Stansiyalar:</span>
                        <span>{line.stations}</span>
                      </div>
                      <div className="line-stat-item">
                        <span>Liniya uzunligi:</span>
                        <span>{line.length}</span>
                      </div>
                      <div className="line-stat-item">
                        <span>Holati:</span>
                        <span className="text-success font-black">{line.status}</span>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
