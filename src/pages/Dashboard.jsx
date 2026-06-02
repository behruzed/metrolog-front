import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Row, Col, Badge, Modal, Button, ProgressBar } from 'react-bootstrap';
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
  Train,
  Archive,
  Database,
  Radio,
  Gauge,
  Wind,
  Droplets,
  Cpu,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { socket } from '../utils/socket';
import axios from '../api/axios';
import './Dashboard.scss';

const Dashboard = () => {
  const { employee, station } = useAuthStore();
  const navigate = useNavigate();
  
  // Real-time Counts
  const [journalCount, setJournalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Connection & Ping States
  const [pingHistory, setPingHistory] = useState([100, 100, 100, 100, 100, 100, 100, 100, 100, 100]); // last 10 tests (100 for success, 0 for failure)
  const [currentLatency, setCurrentLatency] = useState(12);
  const [backendOnline, setBackendOnline] = useState(true);
  const [systemLoad, setSystemLoad] = useState({ cpu: 14, memory: 42, threads: 8 });
  const [showSystemModal, setShowSystemModal] = useState(false);

  // Weather States
  const [weather, setWeather] = useState({
    temp: 24,
    feelsLike: 25,
    humidity: 45,
    windSpeed: 4.2,
    code: 0,
    condition: 'Quyoshli',
    type: 'sunny', // sunny, cloudy, rainy, snowy, thunderstorm
    forecast: [
      { day: 'Ertaga', temp: 26, cond: 'Ochiq osmon', type: 'sunny' },
      { day: 'Indinga', temp: 23, cond: 'Qisman bulutli', type: 'cloudy' },
      { day: '22 May', temp: 21, cond: 'Yengil yomg\'ir', type: 'rainy' }
    ]
  });
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  // General States
  const [greeting, setGreeting] = useState('');
  const [time, setTime] = useState(new Date());
  const [activeTrains, setActiveTrains] = useState(42);
  const [trains, setTrains] = useState([]);
  const [telemetry, setTelemetry] = useState({
    voltage: 824,
    signal: 'YASHIL',
    temp: 21.8,
    humidity: 48,
    ventilation: 'FAOL'
  });

  const getSimulatedDestinations = (line) => {
    switch (line) {
      case 'chilonzor':
        return ['Buyuk Ipak Yo\'li', 'Olmazor', 'Qipchoq'];
      case 'ozbekiston':
        return ['Beruniy', 'Do\'stlik'];
      case 'yunusobod':
        return ['Turkiston', 'Mingo\'rik'];
      case 'halqa':
        return ['Texnopark', 'Qipchoq'];
      default:
        return ['Beruniy', 'Buyuk Ipak Yo\'li', 'Turkiston'];
    }
  };

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Stats (Journal count and Unread messages)
  const fetchDashboardStats = async () => {
    try {
      // Fetch Journals count
      const journalsRes = await axios.get('/journals/entries');
      if (journalsRes.data) {
        setJournalCount(journalsRes.data.length);
      }

      // Fetch Unread Messages count
      const messagesRes = await axios.get('/messages');
      if (messagesRes.data) {
        const unread = messagesRes.data.filter(msg => !msg.isRead).length;
        setUnreadCount(unread);
      }
      setLoadingStats(false);
    } catch (err) {
      console.error("Dashboard stats fetch error:", err);
      setLoadingStats(false);
    }
  };

  // Fetch Tashkent Weather
  const fetchTashkentWeather = async () => {
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=41.2646&longitude=69.2163&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m"
      );
      
      if (!response.ok) throw new Error("Weather API failed");
      
      const data = await response.json();
      const current = data.current;
      const t = current.temperature_2m;
      const fl = current.apparent_temperature;
      const hum = current.relative_humidity_2m;
      const ws = current.wind_speed_10m;
      const code = current.weather_code;

      // Map weather code to Uzbek description and type
      let UzbekCond = 'Quyoshli';
      let type = 'sunny';

      if (code === 0) {
        UzbekCond = 'Musaffo osmon';
        type = 'sunny';
      } else if ([1, 2, 3].includes(code)) {
        UzbekCond = 'Qisman bulutli';
        type = 'cloudy';
      } else if ([45, 48].includes(code)) {
        UzbekCond = 'Tumanli';
        type = 'cloudy';
      } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        UzbekCond = 'Yomg\'irli';
        type = 'rainy';
      } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        UzbekCond = 'Qor yog\'ishi';
        type = 'snowy';
      } else if ([95, 96, 99].includes(code)) {
        UzbekCond = 'Momaqaldiroq';
        type = 'thunderstorm';
      }

      // Generate forecast based on current temp
      const generatedForecast = [
        { day: 'Ertaga', temp: Math.round(t + (Math.random() * 4 - 2)), cond: type === 'sunny' ? 'Ochiq' : type === 'rainy' ? 'Yomg\'ir' : 'Bulutli', type },
        { day: 'Indinga', temp: Math.round(t + (Math.random() * 4 - 2)), cond: 'Qisman bulutli', type: 'cloudy' },
        { day: 'Ona-Yer', temp: Math.round(t + (Math.random() * 4 - 2)), cond: 'Bulutli', type: 'cloudy' }
      ];

      setWeather({
        temp: Math.round(t),
        feelsLike: Math.round(fl),
        humidity: Math.round(hum),
        windSpeed: ws,
        code,
        condition: UzbekCond,
        type,
        forecast: generatedForecast
      });
    } catch (err) {
      console.warn("Weather API unreachable. Launching realistic seasonal simulator...", err);
      // Failover - Realistic seasonal Tashkent weather simulation based on current month
      const month = new Date().getMonth(); // 0 = Jan, 4 = May
      let simulatedTemp = 25;
      let simulatedType = 'sunny';
      let simulatedCond = 'Ochiq osmon';

      if ([11, 0, 1].includes(month)) { // Winter
        simulatedTemp = Math.floor(Math.random() * 8) - 1;
        simulatedType = Math.random() > 0.5 ? 'snowy' : 'cloudy';
        simulatedCond = simulatedType === 'snowy' ? 'Qor yog\'ishi' : 'Sovuq tuman';
      } else if ([2, 3, 4].includes(month)) { // Spring
        simulatedTemp = Math.floor(Math.random() * 12) + 14;
        simulatedType = Math.random() > 0.4 ? 'sunny' : 'rainy';
        simulatedCond = simulatedType === 'sunny' ? 'Bahoriy quyosh' : 'Bahor yomg\'iri';
      } else if ([5, 6, 7].includes(month)) { // Summer
        simulatedTemp = Math.floor(Math.random() * 8) + 33;
        simulatedType = 'sunny';
        simulatedCond = 'Jazirama quyoshli';
      } else { // Autumn
        simulatedTemp = Math.floor(Math.random() * 12) + 12;
        simulatedType = Math.random() > 0.5 ? 'cloudy' : 'rainy';
        simulatedCond = simulatedType === 'rainy' ? 'Kuzgi yomg\'ir' : 'Kuzgi bulutli';
      }

      setWeather({
        temp: simulatedTemp,
        feelsLike: simulatedTemp + (Math.random() > 0.5 ? 1 : -1),
        humidity: simulatedType === 'rainy' ? 82 : 44,
        windSpeed: parseFloat((3 + Math.random() * 4).toFixed(1)),
        code: 0,
        condition: simulatedCond,
        type: simulatedType,
        forecast: [
          { day: 'Ertaga', temp: simulatedTemp + 1, cond: simulatedType === 'sunny' ? 'Ochiq osmon' : 'Bulutli', type: simulatedType },
          { day: 'Indinga', temp: simulatedTemp - 2, cond: 'Yomg\'ir ehtimoli', type: 'rainy' },
          { day: 'Keyingi kun', temp: simulatedTemp - 1, cond: 'Qisman bulutli', type: 'cloudy' }
        ]
      });
    }
  };

  // Real-time backend ping check (Tizim Barqarorligi)
  const pingBackend = async () => {
    const startTime = Date.now();
    try {
      // Call test route
      await axios.get('/test', { timeout: 3500 });
      const latency = Date.now() - startTime;
      setCurrentLatency(latency);
      setBackendOnline(true);

      // Record successful ping in history
      setPingHistory(prev => {
        const next = [...prev.slice(1), 100];
        return next;
      });

      // Update simulated system load when online
      setSystemLoad(prev => ({
        cpu: Math.floor(Math.random() * 10) + 12,
        memory: Math.floor(Math.random() * 5) + 40,
        threads: Math.floor(Math.random() * 4) + 6
      }));
    } catch (err) {
      console.warn("Ping failed - Backend offline!");
      setBackendOnline(false);
      setCurrentLatency(0);

      // Record failed ping in history
      setPingHistory(prev => {
        const next = [...prev.slice(1), 0];
        return next;
      });

      // CPU/RAM drop to 0 when disconnected
      setSystemLoad({ cpu: 0, memory: 0, threads: 0 });
    }
  };

  // Main Setup Effect
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('XAYRLI TONG');
    else if (hours < 18) setGreeting('XAYRLI KUN');
    else setGreeting('XAYRLI KECH');

    // Initial statistics and weather loads
    fetchDashboardStats();
    fetchTashkentWeather();
    pingBackend();

    if (station) {
      socket.connect();
      socket.emit('join_room', station._id);
      socket.on('receive_dispatcher_message', () => {
        setUnreadCount(prev => prev + 1);
      });
    }

    // Telemetry and train schedules interval
    const telemetryTimer = setInterval(() => {
      setActiveTrains(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 38 && next <= 45 ? next : prev;
      });

      setTelemetry(prev => ({
        ...prev,
        voltage: Math.floor(Math.random() * 8) + 820,
        temp: parseFloat((21.5 + Math.random() * 0.8).toFixed(1)),
        humidity: Math.floor(Math.random() * 4) + 46
      }));
    }, 10000);

    // Backend ping interval (every 8 seconds)
    const pingTimer = setInterval(pingBackend, 8000);

    // Weather sync interval (every 10 minutes)
    const weatherTimer = setInterval(fetchTashkentWeather, 600000);

    return () => {
      socket.off('receive_dispatcher_message');
      clearInterval(telemetryTimer);
      clearInterval(pingTimer);
      clearInterval(weatherTimer);
    };
  }, [station]);

  // Train countdown simulation
  useEffect(() => {
    const line = station?.distance || 'default';
    const destinations = getSimulatedDestinations(line);
    
    setTrains([
      { id: `T-${line.substring(0, 2).toUpperCase()}-104`, destination: destinations[0], timeRemaining: 74, maxTime: 180, line, status: 'YAQINLASHMOQDA' },
      { id: `T-${line.substring(0, 2).toUpperCase()}-208`, destination: destinations[1] || destinations[0], timeRemaining: 210, maxTime: 360, line, status: 'YOLDA' },
      { id: `T-${line.substring(0, 2).toUpperCase()}-315`, destination: destinations[2] || destinations[0], timeRemaining: 440, maxTime: 540, line, status: 'KUTILMOQDA' }
    ]);

    const trainCountdown = setInterval(() => {
      setTrains(prevTrains => 
        prevTrains.map(train => {
          let nextTime = train.timeRemaining - 1;
          let status = train.status;

          if (nextTime <= 0) {
            nextTime = Math.floor(Math.random() * 180) + 200;
            status = 'KUTILMOQDA';
          } else if (nextTime < 20) {
            status = 'BEKATDA';
          } else if (nextTime < 80) {
            status = 'YAQINLASHMOQDA';
          } else {
            status = 'YOLDA';
          }

          return {
            ...train,
            timeRemaining: nextTime,
            status
          };
        })
      );
    }, 1000);

    return () => clearInterval(trainCountdown);
  }, [station]);

  const activities = [
    { time: '11:45', title: 'DISPETCHER BUYRUG\'I', desc: '1-liniya tezligini 40 km/soatga tushirish', type: 'warning', icon: AlertTriangle },
    { time: '10:20', title: 'TIZIM TEKSHIRUVI', desc: 'Smenadagi texnik holat tekshirildi - Barcha qurilmalar OK', type: 'success', icon: CheckCircle2 },
    { time: '09:00', title: 'SMENA QABULI', desc: 'Smena muvaffaqiyatli qabul qilindi. Navbatchi SMENA-02 faol', type: 'info', icon: Activity }
  ];

  const lineThemeClass = station?.distance ? `hero-line-${station.distance}` : 'hero-line-default';

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Stability average calculation
  const stabilityPercentage = Math.round(
    pingHistory.reduce((acc, val) => acc + val, 0) / pingHistory.length
  );

  // Weather Icon Component
  const WeatherIcon = ({ type, size = 20, animate = true }) => {
    const classAnim = animate ? 'weather-anim' : '';
    switch (type) {
      case 'sunny':
        return <Sun size={size} className={`text-warning ${classAnim} sun-spin`} />;
      case 'cloudy':
        return <Cloud size={size} className={`text-info ${classAnim} cloud-drift`} />;
      case 'rainy':
        return <CloudRain size={size} className={`text-primary ${classAnim} rain-fall`} />;
      case 'snowy':
        return <CloudSnow size={size} className={`text-light ${classAnim} snow-drift`} />;
      case 'thunderstorm':
        return <CloudLightning size={size} className={`text-danger ${classAnim} lightning-flash`} />;
      default:
        return <Sun size={size} className="text-warning" />;
    }
  };

  return (
    <div className="dashboard-epic-container">
      {/* Background Glow Blobs */}
      <div className="bg-glow-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`hero-epic ${lineThemeClass}`}
      >
        <div className="hero-content">
          <div className="hero-badge">
            <span className={`live-indicator ${backendOnline ? 'online' : 'offline'}`}></span>
            {backendOnline ? 'TIZIM ONLAYN (SMENA AKTIV)' : 'TIZIM OFLAYN (ALOQA UZILGAN)'}
          </div>
          <h1 className="hero-title">
            <span className="greeting">{greeting},</span>
            <span className="greeting-gradient">{employee?.name}</span>
          </h1>
          <div className="hero-meta">
            <div className="meta-item">
              <MapPin size={16} className="text-primary" />
              <span>{station?.name || 'Markaziy'} Stansiyasi</span>
            </div>
            <div className="meta-item">
              <Clock size={16} className="text-primary animate-pulse" />
              <span>
                {time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="meta-item">
              <ShieldCheck size={16} className="text-success" />
              <span>{employee?.role?.toUpperCase() || 'XODIM'}</span>
            </div>
          </div>
        </div>

        {/* HUD Radar Screen Graphics */}
        <div className="hero-graphics">
           <div className="hud-radar-screen">
              <div className="radar-sweep" />
              <div className="radar-circle circle-inner" />
              <div className="radar-circle circle-mid" />
              <div className="radar-node node-1" />
              <div className="radar-node node-2" />
              <div className="radar-node node-3" />
              <div className="hud-grid-overlay" />
           </div>
        </div>
      </motion.div>

      {/* Stats Section with customizable interactive widgets */}
      <Row className="g-4 mb-5">
        {/* Stat 1: Jurnal yozuvlari */}
        <Col xs={12} sm={6} lg={3}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 }}
            className="stat-card-epic cursor-pointer"
            style={{ '--stat-color': 'var(--metro-accent)' }}
            onClick={() => navigate('/dashboard/archive')}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <BookOpen size={20} />
              </div>
              <div className="stat-trend positive">
                 <TrendingUp size={14} />
                 Faol jurnallar
              </div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{loadingStats ? '...' : journalCount}</h3>
              <p className="stat-label">Jurnal yozuvlari</p>
            </div>
            <div className="stat-bg-icon">
              <BookOpen size={100} />
            </div>
          </motion.div>
        </Col>

        {/* Stat 2: Tizim barqarorligi */}
        <Col xs={12} sm={6} lg={3}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.16 }}
            className={`stat-card-epic cursor-pointer ${!backendOnline ? 'stat-card-alarm' : ''}`}
            style={{ '--stat-color': backendOnline ? '#10b981' : '#ef4444' }}
            onClick={() => setShowSystemModal(true)}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <ShieldCheck size={20} />
              </div>
              <div className={`stat-trend ${backendOnline ? 'positive' : 'negative'}`}>
                 <Activity size={14} className={backendOnline ? 'animate-pulse' : ''} />
                 {backendOnline ? `${currentLatency}ms Ping` : 'ALOQA UZILDI'}
              </div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{backendOnline ? `${stabilityPercentage}%` : '0%'}</h3>
              <p className="stat-label">Tizim barqarorligi</p>
            </div>
            <div className="stat-bg-icon">
              <ShieldCheck size={100} />
            </div>
          </motion.div>
        </Col>

        {/* Stat 3: Tashkent Weather Widget */}
        <Col xs={12} sm={6} lg={3}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.24 }}
            className="stat-card-epic weather-widget-card cursor-pointer"
            style={{ '--stat-color': 'var(--yunusobod-green)' }}
            onClick={() => setShowWeatherModal(true)}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <WeatherIcon type={weather.type} size={20} animate={true} />
              </div>
              <div className="stat-trend info">
                 <Wind size={12} className="animate-spin-slow" />
                 {weather.windSpeed} m/s
              </div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{weather.temp}°C</h3>
              <p className="stat-label">Toshkent: {weather.condition}</p>
            </div>
            <div className="stat-bg-icon">
              <Thermometer size={100} />
            </div>
          </motion.div>
        </Col>

        {/* Stat 4: Yangi ko'rsatmalar */}
        <Col xs={12} sm={6} lg={3}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.32 }}
            className="stat-card-epic cursor-pointer"
            style={{ '--stat-color': unreadCount > 0 ? '#ef4444' : '#e5b900' }}
            onClick={() => navigate('/dashboard/messages')}
          >
            <div className="stat-header">
              <div className="stat-icon-wrapper">
                <Bell size={20} className={unreadCount > 0 ? 'animate-bounce' : ''} />
              </div>
              <div className={`stat-trend ${unreadCount > 0 ? 'negative' : 'positive'}`}>
                 <Bell size={14} />
                 {unreadCount > 0 ? 'TEZKOR XABAR' : 'E\'LONLAR'}
              </div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{unreadCount}</h3>
              <p className="stat-label">Yangi ko'rsatmalar</p>
            </div>
            <div className="stat-bg-icon">
              <Bell size={100} />
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* Live Train Traffic Board & Telemetry HUD */}
      <Row className="g-4 mb-5">
        {/* Poyezdlar Harakati Monitoringi */}
        <Col lg={8}>
          <div className="section-panel-epic">
            <div className="panel-header space-between">
              <div className="panel-title-wrapper">
                <Train size={20} className="panel-icon text-primary animate-pulse" />
                <h2 className="panel-title">POYEZDLAR HARAKATI MONITORINGI</h2>
              </div>
              <span className="hud-live-tag">LIVE HUD TELEMETRY</span>
            </div>

            <div className="train-traffic-board">
              {trains.map((train, i) => {
                const progress = Math.min(100, Math.max(0, ((train.maxTime - train.timeRemaining) / train.maxTime) * 100));
                
                return (
                  <div key={train.id} className="train-hud-item">
                    <div className="train-hud-header">
                      <div className="train-identity">
                        <span className="train-id">{train.id}</span>
                        <span className="train-dest">⇄ {train.destination}</span>
                      </div>
                      
                      <div className="train-status-timer">
                        <span className={`train-status-badge ${train.status.toLowerCase()}`}>
                          {train.status === 'YOLDA' ? 'Yo\'nalishda' : train.status === 'BEKATDA' ? 'Bekatda' : train.status === 'YAQINLASHMOQDA' ? 'Yaqinlashmoqda' : 'Navbatda'}
                        </span>
                        <div className="countdown-clock">
                          <Clock size={12} className="animate-spin-slow" />
                          <span>{formatTime(train.timeRemaining)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Animated visual track rail segment */}
                    <div className="rail-track-segment">
                      <div className="rail-line-back" />
                      <div className="rail-line-fill" style={{ width: `${progress}%` }} />
                      
                      {/* Ticks along the segment representing station junctions */}
                      <div className="rail-ticks">
                        <span className="tick tick-start"><small>O'tgan bekat</small></span>
                        <span className="tick tick-mid"><small>Tunel</small></span>
                        <span className="tick tick-end active"><small>{station?.name || 'Bizning bekat'}</small></span>
                      </div>

                      {/* Floating pulsing Train Node */}
                      <div 
                        className={`glowing-train-node ${train.status.toLowerCase()}`}
                        style={{ left: `${progress}%` }}
                      >
                        <Train size={12} />
                        <div className="node-glow-ring" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Col>

        {/* Telemetry HUD */}
        <Col lg={4}>
          <div className="section-panel-epic h-100">
            <div className="panel-header">
              <div className="panel-title-wrapper">
                <Radio size={20} className="panel-icon text-success" />
                <h2 className="panel-title">BEKAT TELEMETRIYASI</h2>
              </div>
            </div>

            <div className="telemetry-hud-grid">
              <div className="tele-card">
                <div className="tele-icon-wrapper text-primary">
                  <Gauge size={18} />
                </div>
                <div className="tele-info">
                  <label>Uchinchi Rel's Kuchlanishi</label>
                  <h3>{telemetry.voltage} V</h3>
                  <Badge bg="success" className="hud-tele-badge">OPTIMAL STATUS</Badge>
                </div>
              </div>

              <div className="tele-card">
                <div className="tele-icon-wrapper text-warning">
                  <Radio size={18} />
                </div>
                <div className="tele-info">
                  <label>Svetofor Signalizatsiyasi</label>
                  <h3 className="text-success d-flex align-items-center gap-2">
                    <span className="signal-dot pulsing-green-dot" />
                    {telemetry.signal}
                  </h3>
                  <small>AVTOMATIK BLOKIROVKA</small>
                </div>
              </div>

              <div className="tele-card">
                <div className="tele-icon-wrapper text-success">
                  <Wind size={18} />
                </div>
                <div className="tele-info">
                  <label>Ventilyatsiya tizimi</label>
                  <h3>{telemetry.ventilation}</h3>
                  <small>HAVO ALMAShINUVI - 100%</small>
                </div>
              </div>

              <div className="tele-card">
                <div className="tele-icon-wrapper text-info">
                  <Droplets size={18} />
                </div>
                <div className="tele-info">
                  <label>Tunnel iqlimi</label>
                  <h3>{telemetry.temp} °C <span className="opacity-40">/ {telemetry.humidity}% RH</span></h3>
                  <small>NORMAL DARADA</small>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Quick Actions - Perfectly Symmetrical 2x2 Grid */}
        <Col lg={8}>
          <div className="section-panel-epic">
            <div className="panel-header">
               <div className="panel-title-wrapper">
                 <Zap size={20} className="panel-icon text-warning animate-bounce" />
                 <h2 className="panel-title">Tezkor amallar paneli</h2>
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
                  <h4>Yangi yozuv</h4>
                  <p>Elektron jurnallarni to'ldirish</p>
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
                  <h4>Ko'rsatmalar</h4>
                  <p>Tezkor dispetcherlik xabarlari</p>
                </div>
                <ArrowUpRight size={20} className="action-arrow" />
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard/archive')} 
                className="action-card-epic warning"
              >
                <div className="action-icon-box">
                  <Archive size={24} />
                </div>
                <div className="action-content">
                  <h4>Arxivlar bazasi</h4>
                  <p>Tarixiy qaydlarni ko'rish</p>
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
                  <h4>Mening profilim</h4>
                  <p>Smena sozlamalari va hisobot</p>
                </div>
                <ArrowUpRight size={20} className="action-arrow" />
              </motion.button>
            </div>
          </div>
        </Col>

        {/* Activity Timeline with Hover Glow */}
        <Col lg={4}>
          <div className="section-panel-epic h-100">
            <div className="panel-header">
               <div className="panel-title-wrapper">
                 <Activity size={20} className="panel-icon text-success" />
                 <h2 className="panel-title">Operatsion faoliyat</h2>
               </div>
            </div>
            <div className="timeline-epic custom-scrollbar">
              {activities.map((activity, i) => (
                <div key={i} className="timeline-item-epic">
                  <div className={`timeline-marker ${activity.type}`}>
                     <activity.icon size={12} />
                  </div>
                  <div className={`timeline-content timeline-hover-${activity.type}`}>
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

      {/* WEATHER DETAILS Glassmorphic Modal */}
      <AnimatePresence>
        {showWeatherModal && (
          <Modal
            show={showWeatherModal}
            onHide={() => setShowWeatherModal(false)}
            centered
            contentClassName="weather-modal-content-epic"
            dialogClassName="modal-dialog-epic"
          >
            <Modal.Header closeButton className="weather-modal-header border-0 pb-0">
              <div className="modal-title-custom text-center w-100 pt-3">
                <MapPin size={18} className="text-primary d-inline-block me-2 align-middle" />
                <span className="text-[10px] font-black tracking-widest text-metro-fg uppercase">Toshkent shahri ob-havosi</span>
              </div>
            </Modal.Header>
            <Modal.Body className="weather-modal-body text-center px-4 pb-5 pt-3">
              <div className="weather-large-icon mb-4 d-flex justify-content-center">
                <WeatherIcon type={weather.type} size={88} animate={true} />
              </div>
              <h2 className="weather-modal-temp">{weather.temp}°C</h2>
              <h4 className="weather-modal-cond">{weather.condition}</h4>
              <p className="weather-modal-feels text-metro-text-muted">
                Tuyulishi: <strong className="text-white">{weather.feelsLike}°C</strong>
              </p>

              <Row className="weather-modal-details-grid my-4 pt-3 border-top border-bottom border-white/5">
                <Col xs={6} className="border-end border-white/5 py-2">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                    <Droplets size={16} className="text-info" />
                    <span className="label">Namlilik</span>
                  </div>
                  <span className="value">{weather.humidity}% RH</span>
                </Col>
                <Col xs={6} className="py-2">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                    <Wind size={16} className="text-warning" />
                    <span className="label">Shamol</span>
                  </div>
                  <span className="value">{weather.windSpeed} m/s</span>
                </Col>
              </Row>

              {/* 3-Day Forecast */}
              <div className="forecast-section text-start mt-4">
                <h5 className="forecast-title mb-3">3 KUNLIK PROGNOZ</h5>
                <div className="forecast-list d-flex flex-column gap-3">
                  {weather.forecast.map((f, index) => (
                    <div key={index} className="forecast-row d-flex align-items-center justify-content-between">
                      <span className="forecast-day font-bold">{f.day}</span>
                      <div className="d-flex align-items-center gap-2">
                        <WeatherIcon type={f.type} size={18} animate={false} />
                        <span className="forecast-cond">{f.cond}</span>
                      </div>
                      <span className="forecast-temp font-black">{f.temp}°C</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => setShowWeatherModal(false)}
                className="btn-metro w-100 mt-5 border-2 border-transparent bg-white/5 text-metro-fg"
              >
                YOPISH
              </Button>
            </Modal.Body>
          </Modal>
        )}
      </AnimatePresence>

      {/* SYSTEM TELEMETRY / STABILITY Glassmorphic Modal */}
      <AnimatePresence>
        {showSystemModal && (
          <Modal
            show={showSystemModal}
            onHide={() => setShowSystemModal(false)}
            centered
            contentClassName="system-modal-content-epic"
            dialogClassName="modal-dialog-epic"
          >
            <Modal.Header closeButton className="system-modal-header border-0 pb-0">
              <div className="modal-title-custom text-center w-100 pt-3">
                <Database size={18} className="text-primary d-inline-block me-2 align-middle animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-metro-fg uppercase">TIZIM SALOMATLIGI MONITORINGI</span>
              </div>
            </Modal.Header>
            <Modal.Body className="system-modal-body px-4 pb-5 pt-3">
              <div className="text-center mb-4">
                <div className={`status-orb-lg mx-auto ${backendOnline ? 'online' : 'offline'}`} />
                <h3 className="system-status-text mt-3">{backendOnline ? 'ALERTLAR YETKAZILMOQDA (FAOL)' : 'KUCHLANISH UZILGAN (OFLAYN)'}</h3>
                <p className="text-metro-text-muted uppercase text-[9px] tracking-widest">
                  Backend API statusi
                </p>
              </div>

              {/* Latency meter */}
              <div className="metric-box-custom p-3 rounded-2xl mb-4 border border-white/5 bg-white/2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="label d-flex align-items-center gap-2"><Gauge size={14} className="text-info" /> Latency (Aloqa tezligi)</span>
                  <span className="value font-black text-info">{backendOnline ? `${currentLatency} ms` : 'N/A'}</span>
                </div>
                <div className="d-flex gap-1 ping-bars justify-content-between">
                  {pingHistory.map((val, idx) => (
                    <div 
                      key={idx} 
                      className={`ping-bar ${val === 100 ? 'ok' : 'fail'}`} 
                      title={val === 100 ? 'Muvaffaqiyatli' : 'Xatolik'}
                    />
                  ))}
                </div>
              </div>

              {/* CPU & Memory Simulation */}
              <h5 className="section-subtitle-custom mb-3 mt-4">SERVER TELEMETRIYASI (LIVE)</h5>
              <div className="d-flex flex-column gap-3 mb-4">
                {/* CPU */}
                <div className="progress-metric-wrapper">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="label d-flex align-items-center gap-2"><Cpu size={14} className="text-warning" /> CPU Yuklamasi</span>
                    <span className="value font-bold">{systemLoad.cpu}%</span>
                  </div>
                  <ProgressBar now={systemLoad.cpu} variant="warning" className="metric-progressbar" />
                </div>

                {/* Memory */}
                <div className="progress-metric-wrapper">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="label d-flex align-items-center gap-2"><Database size={14} className="text-success" /> RAM (Xotira) Bandligi</span>
                    <span className="value font-bold">{systemLoad.memory}%</span>
                  </div>
                  <ProgressBar now={systemLoad.memory} variant="success" className="metric-progressbar" />
                </div>

                {/* Active socket channels */}
                <div className="d-flex justify-content-between align-items-center py-2 border-top border-white/5 mt-2">
                  <span className="label d-flex align-items-center gap-2"><Activity size={14} className="text-primary" /> Aloqa kanallari</span>
                  <span className="value font-black">{systemLoad.threads} faol potok</span>
                </div>
              </div>

              <div className="alert-message-system p-3 rounded-xl bg-white/5 border border-white/10 d-flex gap-2 align-items-start mt-3">
                <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
                <p className="m-0 text-[10px] text-metro-text-muted leading-relaxed uppercase font-semibold">
                  Tizim barqarorligi so'nggi 10 ta so'rovdagi muvaffaqiyat foizi orqali aniqlanadi. Muammolar yuzaga kelganda server loglarini tekshiring.
                </p>
              </div>

              <Button 
                onClick={() => setShowSystemModal(false)}
                className="btn-metro w-100 mt-5 border-2 border-transparent bg-white/5 text-metro-fg"
              >
                YOPISH
              </Button>
            </Modal.Body>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
