import React from 'react';
import { motion } from 'framer-motion';
import { Row, Col } from 'react-bootstrap';
import { 
  User, 
  Mail, 
  Award, 
  Clock, 
  Shield, 
  Edit3, 
  MapPin, 
  Briefcase, 
  Zap, 
  Fingerprint,
  Calendar
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import './Profile.scss';

const Profile = () => {
  const { employee, station } = useAuthStore();

  const stats = [
    { label: 'Smenalar', value: '128', icon: Clock, color: '#007aff' },
    { label: 'Jurnallar', value: '1,420', icon: Edit3, color: '#10b981' },
    { label: 'Reyting', value: '4.9', icon: Award, color: '#ffd100' },
  ];

  // 3D Tilt calculations
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Rotate max 12 degrees
    const rotateX = -(y / (rect.height / 2)) * 12;
    const rotateY = (x / (rect.width / 2)) * 12;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    // Shimmer/Glow gradient location
    const glowX = ((e.clientX - rect.left) / rect.width) * 100;
    const glowY = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--glow-x', `${glowX}%`);
    card.style.setProperty('--glow-y', `${glowY}%`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    card.style.setProperty('--glow-x', `50%`);
    card.style.setProperty('--glow-y', `50%`);
  };

  const lineThemeClass = station?.distance ? `card-line-${station.distance}` : 'card-line-default';

  return (
    <div className="profile-epic-container">
      {/* Background Glow Blobs */}
      <div className="bg-glow-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* 3D Smart ID Card */}
      <div className="card-3d-wrapper">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className={`nfc-smartcard-epic ${lineThemeClass}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Holographic background lines */}
          <div className="holo-stripes" />

          {/* Card Top */}
          <div className="card-top">
            <div className="card-brand">
              <div className="brand-logo">M</div>
              <div className="brand-text">
                <h5>TOSHKENT METROPOLITENI</h5>
                <p>RAQAMLI XODIM PASPORTI</p>
              </div>
            </div>
            <div className="card-chip" />
          </div>

          {/* Card Middle */}
          <div className="card-middle">
            <div className="avatar-glow-ring">
              <div className="avatar-inside">
                {employee?.avatar ? (
                  <img src={employee.avatar} alt="Profile" />
                ) : (
                  <User size={36} />
                )}
              </div>
            </div>
            <div className="employee-details">
              <h3>{employee?.name}</h3>
              <div className="role-pill">
                <Fingerprint size={12} className="text-primary animate-pulse" />
                <span>{employee?.role || 'Xodim'}</span>
              </div>
            </div>
          </div>

          {/* Card Bottom */}
          <div className="card-bottom">
            <div className="card-info-block">
              <div className="info-field">
                <span>BEKAT</span>
                <p>{station?.name || 'Markaziy'} Bekati</p>
              </div>
              <div className="info-field">
                <span>ID RAQAM</span>
                <p>EMP-{employee?._id?.substring(18, 24).toUpperCase() || '62B904'}</p>
              </div>
            </div>

            <div className="card-barcode">
              <div className="barcode-lines" />
              <span className="barcode-text">TASHMETRO-{employee?._id?.substring(20, 24).toUpperCase()}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Smena Stats Grid */}
      <Row className="g-4 mb-5 profile-stats-grid">
        {stats.map((stat, i) => (
          <Col key={i} xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="profile-stat-card"
              style={{ '--metro-accent': stat.color }}
            >
              <div className="icon-circle">
                <stat.icon size={22} />
              </div>
              <div className="stat-content">
                <h4>{stat.value}</h4>
                <p>{stat.label}</p>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Details Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="profile-details-panel"
      >
        <div className="panel-header-epic">
          <div className="title-wrapper">
            <Shield size={20} className="text-primary" />
            <h3>Shaxsiy ma'lumotlar va xavfsizlik</h3>
          </div>
          <button className="btn-edit-profile">Profilni tahrirlash</button>
        </div>

        <div className="info-list-epic">
          {[
            { label: 'F.I.SH (To\'liq ismi)', value: employee?.name, icon: User },
            { label: 'Tizimdagi Email', value: employee?.email || 'Noma\'lum', icon: Mail },
            { label: 'Hozirgi Lavozim', value: employee?.role?.toUpperCase() || 'Navbatchi', icon: Briefcase },
            { label: 'Tizim darajasi', value: 'Boshqaruvchi Xodim', icon: Shield },
            { label: 'Biriktirilgan Liniya', value: station?.distance ? `${station.distance.toUpperCase()} yo'nalishi` : 'Noma\'lum', icon: MapPin },
            { label: 'Smena jadvali', value: 'Navbatchilik - Smena 24/7', icon: Calendar },
          ].map((info, i) => (
            <div key={i} className="info-field-epic">
              <span className="field-label">
                <info.icon size={14} className="text-primary" />
                {info.label}
              </span>
              <p className="field-value">{info.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
