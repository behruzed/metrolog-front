import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, Search, Menu, X, LogOut as LogOutIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';
import './Navbar.scss';

const Navbar = ({ isDashboard = false, onToggleSidebar, isSidebarOpen }) => {
  const { theme, setTheme, station, employee, logoutEmployee } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutEmployee();
    navigate('/employee-login');
  };

  return (
    <header className={`navbar-liquid-epic ${scrolled ? 'scrolled' : ''} ${station?.distance ? `distance-glow-${station.distance}` : ''}`}>
      <div className="navbar-container-epic">
        
        {/* Brand Section */}
        <div className="navbar-brand-epic" onClick={() => navigate('/')}>
          <div className="logo-box-epic">M</div>
          <div className="brand-text">
            <h1>MetroLog</h1>
            <p>Harakat xizmati</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="ml-auto flex items-center gap-4 lg:gap-6">
          
          {/* Status Hub (Hidden on small screens) */}
          <div className="hidden xl:flex status-hub-epic">
             <div className="status-item">
                <span className="status-label">Post</span>
                <span className="status-value">{station?.name || 'CENTRAL HUB'}</span>
             </div>
             <div className="status-divider" />
             <div className="status-item text-right">
                <span className="status-label">Agent</span>
                <span className="status-value">{employee?.name || 'ROOT'}</span>
             </div>
          </div>

          {/* Theme & Notifications */}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="btn-nav-liquid group"
              title="Mavzuni o'zgartirish"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-warning group-hover:rotate-180 transition-transform duration-700" />
              ) : (
                <Moon size={18} className="text-primary group-hover:-rotate-12 transition-transform duration-700" />
              )}
            </button>
            
            <button className="btn-nav-liquid group relative" title="Xabarnomalar">
              <Bell size={18} className="group-hover:animate-shake" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger rounded-full border border-[var(--metro-glass)] shadow-[0_0_10px_rgba(239,68,68,0.5)] group-hover:scale-125 transition-transform" />
            </button>
          </div>

          {/* User Profile & Actions */}
          <div className="nav-actions">
            <div className="hidden sm:flex nav-profile-epic cursor-pointer">
              <div className="profile-avatar-epic">
                {employee?.name?.charAt(0) || 'U'}
              </div>
              <div className="profile-info">
                <span className="profile-name">{employee?.name || 'OPERATOR'}</span>
                <span className="profile-role">{employee?.role || 'SYSTEM OFFICER'}</span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="btn-nav-liquid danger group"
              title="Tizimdan chiqish"
            >
              <LogOutIcon size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
