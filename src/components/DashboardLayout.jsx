import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  Send,
  Train,
  Archive as ArchiveIcon,
  Activity,
  ShieldAlert,
  Settings
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Container } from 'react-bootstrap';
import Navbar from './Navbar';
import Footer from './Footer';
import './DashboardLayout.scss';

const DashboardLayout = () => {
  const { employee, station, logoutEmployee, theme } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logoutEmployee();
    navigate('/employee-login');
  };

  const navGroups = [
    {
      title: 'ASOSIY',
      items: [
        { label: 'Umumiy Panel', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Analitika', icon: Activity, path: '/dashboard/analytics', role: ['superadmin', 'dispatcher'] }
      ]
    },
    {
      title: 'HUJJATLAR & JURNALLAR',
      items: [
        { label: 'Raqamli Jurnallar', icon: BookOpen, path: '/dashboard/journals' },
        { label: 'Arxivlar Base', icon: ArchiveIcon, path: '/dashboard/archive' }
      ]
    },
    {
      title: 'KOMMUNIKATSIYA',
      items: [
        { label: 'Xabarlar Markazi', icon: Bell, path: '/dashboard/messages' },
        { label: 'Dispetcherlik', icon: Send, path: '/dashboard/dispatcher', role: ['dispatcher', 'superadmin'] },
        { label: 'Favqulodda', icon: ShieldAlert, path: '/dashboard/emergency', role: ['dispatcher', 'superadmin'] }
      ]
    },
    {
      title: 'TIZIM',
      items: [
        { label: 'Mening Profilim', icon: User, path: '/dashboard/profile' },
        { label: 'Sozlamalar', icon: Settings, path: '/dashboard/settings' }
      ]
    }
  ];

  return (
    <div className={`min-h-screen d-flex ${isSidebarOpen ? 'sidebar-open' : ''} ${theme === 'dark' ? 'dark' : ''} bg-[var(--metro-background)]`}>
      {/* Professional Dashboard Aside */}
      <aside className={`sidebar-epic ${station?.distance ? `distance-glow-${station.distance}` : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo-container">
            <div className="brand-logo-icon">M</div>
            <div className="brand-glow" />
          </div>
          <div className="brand-text-container">
             <h1 className="brand-title">UZ METRO</h1>
             <p className="brand-subtitle">O'ZBEKISTON METROPOLITENI</p>
          </div>
        </div>

        <div className="system-status-indicator">
           <div className="status-dot pulse-green"></div>
           <span className="status-text">Tizim Barqaror</span>
        </div>

        <div className="nav-container-epic custom-scrollbar">
          {navGroups.map((group, groupIdx) => {
            const filteredItems = group.items.filter(item => !item.role || item.role.includes(employee?.role));
            if (filteredItems.length === 0) return null;

            return (
              <div key={groupIdx} className="nav-group-epic">
                <h6 className="nav-group-title">{group.title}</h6>
                <div className="nav-group-items">
                  {filteredItems.map((item, idx) => {
                    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    return (
                      <button
                        key={idx}
                        onClick={() => navigate(item.path)}
                        className={`nav-item-epic ${isActive ? 'active' : ''}`}
                      >
                        <div className="nav-icon-wrapper">
                          <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="nav-label">{item.label}</span>
                        {isActive && <motion.div layoutId="activeNavIndicator" className="active-indicator" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer-epic">
          <div className="user-profile-epic">
            <div className="user-avatar-epic">
               {employee?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-info-epic">
               <span className="user-name">{employee?.name}</span>
               <span className="user-role">{employee?.role}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn-epic" title="Tizimdan chiqish">
               <LogOut size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-wrapper-epic">
        <Navbar 
          isDashboard={true} 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />

        <Container fluid className="content-container-epic pt-32 pb-14 px-6 md:px-10 flex-1 animate-fade-in" key={location.pathname}>
          <Outlet />
        </Container>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
