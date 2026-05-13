import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Spinner, Modal, Alert } from 'react-bootstrap';
import { Calendar as CalendarIcon, Search, X, Filter, ChevronRight, Info, ChevronLeft, Printer, CheckCircle2, Clock, User, FileText, Activity, Hash, Zap, AlertTriangle } from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import pechatImg from '../Images/harakat_pechat.png';
import './Archive.scss';

const CustomCalendar = ({ selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  // Sync currentMonth if selectedDate changes externally (e.g. "Bugun" button)
  useEffect(() => {
    setCurrentMonth(new Date(selectedDate));
  }, [selectedDate]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // Adjust so Monday is 0, Sunday is 6
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const dayNames = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Format to YYYY-MM-DD local time safely
    const offset = newDate.getTimezoneOffset();
    const localDate = new Date(newDate.getTime() - (offset * 60 * 1000));
    onSelectDate(localDate.toISOString().split('T')[0]);
  };

  const renderDays = () => {
    const days = [];
    // Empty slots before 1st day
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    // Actual days
    const selDateObj = new Date(selectedDate);
    const isSameMonthAndYear = selDateObj.getMonth() === currentMonth.getMonth() && selDateObj.getFullYear() === currentMonth.getFullYear();
    const selDay = selDateObj.getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = isSameMonthAndYear && selDay === i;
      const isToday = new Date().getDate() === i && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

      days.push(
        <button 
          key={i} 
          onClick={() => handleDayClick(i)}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''}`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="custom-calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav-btn"><ChevronLeft size={18} /></button>
        <span className="calendar-title">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
        <button onClick={nextMonth} className="calendar-nav-btn"><ChevronRight size={18} /></button>
      </div>
      <div className="calendar-grid-header">
        {dayNames.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="calendar-grid">
        {renderDays()}
      </div>
    </div>
  );
};

const SecureStamp = ({ stationName }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.src = pechatImg;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#2e2865';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const fontSize = canvas.width * 0.055; 
      ctx.font = `800 ${fontSize}px Arial`;
      
      const stName = (stationName || "PAXTAKOR").toUpperCase();
      const centerY = canvas.height / 2 + (canvas.height * 0.07);
      
      if (stName.length > 12) {
        const words = stName.split(' ');
        const firstWord = words[0];
        const rest = words.slice(1).join(' ') + ' BEKATI';
        
        ctx.fillText(firstWord, canvas.width / 2, centerY - (fontSize * 0.6));
        ctx.fillText(rest, canvas.width / 2, centerY + (fontSize * 0.6));
      } else {
        ctx.fillText(stName + ' BEKATI', canvas.width / 2, centerY);
      }
    };
  }, [stationName]);

  return (
    <div className="stamp-container secure-stamp-container" onContextMenu={(e) => e.preventDefault()}>
      <canvas ref={canvasRef} className="stamp-canvas" />
      <div className="stamp-overlay-block"></div>
    </div>
  );
};

const Archive = () => {
  const { station } = useAuthStore();
  const [types, setTypes] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  
  // Use local time YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
     const d = new Date();
     const offset = d.getTimezoneOffset();
     return new Date(d.getTime() - (offset*60*1000)).toISOString().split('T')[0];
  });
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewMode, setViewMode] = useState('simple');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [typesRes, entriesRes] = await Promise.all([
        axios.get('/journals/types'),
        axios.get('/journals/entries')
      ]);
      setTypes(typesRes.data);
      setEntries(entriesRes.data);
      if (typesRes.data.length > 0) {
        setSelectedType(typesRes.data[0]);
      }
    } catch (err) {
      console.error('Error fetching archive data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToday = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    setSelectedDate(new Date(d.getTime() - (offset*60*1000)).toISOString().split('T')[0]);
  };

  const getActionDescription = (entry) => {
    const data = entry.data || {};
    const journalCode = entry.journalTypeId?.code;
    
    switch(journalCode) {
      case 'DU-2':
        return `${data.action_type || ''} - ${data.train_number || ''} (${data.track_id || ''})`;
      case 'DU-5':
        return `${data.personnelCount || 0} ta xodim`;
      case 'DU-19':
        return `№${data.order_number || '-'} | ${data.wagon_count || 0} vagon - ${data.start_route || '-'} → ${data.end_route || '-'} manzili`;
      case 'DU-8':
        return `Kalit: ${data.employee_name || ''} (${data.licence_id || ''})`;
      case 'DU-46':
        return `Nosozlik: ${data.malfunction_desc?.substring(0, 30)}...`;
      case 'EU-132':
        return `Himoya vositasi: ${data.equipment_name || ''} (№${data.equipment_number || ''})`;
      case 'DU-60':
        return `Ogohlantirish: ${data.location || ''} | ${data.speed_limit || ''}`;
      default:
        return entry.journalTypeId?.name || 'Noma\'lum';
    }
  };

  // Helper to normalize entry date to YYYY-MM-DD
  const getNormalizedEntryDate = (entry) => {
    if (entry.data?.recordedAt) {
      // Assuming recordedAt is "DD-MM-YYYY HH:mm"
      return entry.data.recordedAt.split(' ')[0].split('-').reverse().join('-');
    }
    // Fallback to createdAt
    return new Date(entry.createdAt).toISOString().split('T')[0];
  };

  const typeCounts = useMemo(() => {
    const counts = {};
    entries.forEach(entry => {
      const entryDate = getNormalizedEntryDate(entry);
      if (entryDate === selectedDate) {
        const typeId = entry.journalTypeId?._id;
        if (typeId) {
          counts[typeId] = (counts[typeId] || 0) + 1;
        }
      }
    });
    return counts;
  }, [entries, selectedDate]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = getNormalizedEntryDate(entry);
      const typeMatch = selectedType ? entry.journalTypeId?._id === selectedType._id : true;
      const dateMatch = selectedDate ? entryDate === selectedDate : true;
      return typeMatch && dateMatch;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [entries, selectedType, selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="archive-epic-layout">
      
      {/* Column 1: Journal Types */}
      <div className="archive-column col-types">
        <div className="column-header">
          <Filter size={18} className="header-icon" />
          <h5>Jurnal Turlari</h5>
        </div>
        <div className="types-list custom-scrollbar">
          {types.map(type => {
            const count = typeCounts[type._id] || 0;
            const isSelected = selectedType?._id === type._id;
            return (
              <button
                key={type._id}
                className={`type-btn-epic ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                <div className="type-info">
                  <span className="type-code">{type.code}</span>
                  <span className="type-name">{type.name}</span>
                </div>
                <div className="type-meta">
                  {count > 0 && (
                    <div className="notification-badge">{count}</div>
                  )}
                  <ChevronRight size={16} className="arrow-icon" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Column 2: Calendar */}
      <div className="archive-column col-calendar">
        <div className="column-header">
          <CalendarIcon size={18} className="header-icon" />
          <h5>Sana</h5>
        </div>
        <div className="calendar-wrapper">
          <CustomCalendar 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
          <button className="today-btn-epic" onClick={handleToday}>
            BUGUNNI TANLASH
          </button>
        </div>
      </div>

      {/* Column 3: Journals List */}
      <div className="archive-column col-journals flex-1">
        <div className="column-header space-between">
          <div className="d-flex align-items-center gap-2">
             <h5>Jurnallar</h5>
             {selectedType && <span className="selected-type-badge">{selectedType.code}</span>}
          </div>
          <div className="results-count">
            Topilgan: <span>{filteredEntries.length}</span>
          </div>
        </div>
        
        <div className="journals-table-wrapper custom-scrollbar">
          <table className="journals-table-epic">
            <thead>
              <tr>
                <th>Vaqt</th>
                <th>Harakat / Ma'lumot</th>
                <th>Xodim</th>
                <th>Holat</th>
                <th>Tafsilot</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length > 0 ? (
                filteredEntries.map(entry => (
                  <tr key={entry._id} onClick={() => { setSelectedEntry(entry); setViewMode('simple'); setShowDetailModal(true); }}>
                    <td className="time-col">
                       {entry.data?.recordedAt?.split(' ')[1] || new Date(entry.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="desc-col">{getActionDescription(entry)}</td>
                    <td className="emp-col">{entry.createdBy?.name}</td>
                    <td className="status-col">
                      {entry.journalTypeId?.code === 'DU-5' ? (
                        <span className={`status-badge ${entry.data?.journal_status === 'closed' ? 'success' : 'warning'}`}>
                          {entry.data?.journal_status === 'closed' ? 'Chiqdi' : 'Tunelda'}
                        </span>
                      ) : entry.journalTypeId?.code === 'DU-8' ? (
                        <span className={`status-badge ${entry.data?.journal_status === 'closed' ? 'success' : 'warning'}`}>
                          {entry.data?.journal_status === 'closed' ? 'Topshirdi' : 'Olingan'}
                        </span>
                      ) : entry.journalTypeId?.code === 'DU-46' ? (
                        <span className={`status-badge ${entry.data?.journal_status === 'closed' ? 'success' : 'warning'}`}>
                          {entry.data?.journal_status === 'closed' ? 'Tuzatildi' : 'Nosoz'}
                        </span>
                      ) : (
                        <span className={`status-badge ${entry.status === 'verified' ? 'success' : (entry.status === 'pending' ? 'warning' : 'danger')}`}>
                          {entry.status === 'verified' ? 'Tasdiqlangan' : (entry.status === 'pending' ? 'Kutilmoqda' : 'Rad etilgan')}
                        </span>
                      )}
                    </td>
                    <td className="action-col"><Info size={18} className="info-icon" /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Ushbu sanada yozuvlar topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modals */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)} 
        size="lg" 
        centered 
        className={viewMode === 'document' ? "a4-document-modal" : "epic-modal"}
        contentClassName={viewMode === 'document' ? "bg-transparent border-0" : ""}
      >
        {viewMode === 'simple' ? (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Arxiv Yozuvi Tafsiloti</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              {selectedEntry && (
                <div className="entry-details-premium">
                  
                  <div className="premium-hero">
                     <div className="hero-icon-wrapper">
                        <FileText size={36} className="hero-icon" />
                        <div className="icon-glow"></div>
                     </div>
                     <div className="hero-content">
                        <span className="journal-code">{selectedEntry.journalTypeId?.code}</span>
                        <h3 className="journal-title">{selectedEntry.journalTypeId?.name}</h3>
                     </div>
                     <div className="hero-status">
                       {selectedEntry.journalTypeId?.code === 'DU-5' ? (
                         <div className={`premium-status-badge ${selectedEntry.data?.journal_status === 'closed' ? 'success' : 'warning'}`}>
                           {selectedEntry.data?.journal_status === 'closed' ? <CheckCircle2 size={16}/> : <Activity size={16}/>}
                           <span>{selectedEntry.data?.journal_status === 'closed' ? 'Chiqdi' : 'Tunelda'}</span>
                         </div>
                       ) : selectedEntry.journalTypeId?.code === 'DU-8' ? (
                         <div className={`premium-status-badge ${selectedEntry.data?.journal_status === 'closed' ? 'success' : 'warning'}`}>
                           {selectedEntry.data?.journal_status === 'closed' ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                           <span>{selectedEntry.data?.journal_status === 'closed' ? 'Topshirdi' : 'Olingan'}</span>
                         </div>
                       ) : selectedEntry.journalTypeId?.code === 'DU-46' ? (
                         <div className={`premium-status-badge ${selectedEntry.data?.journal_status === 'closed' ? 'success' : 'warning'}`}>
                           {selectedEntry.data?.journal_status === 'closed' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16} className="text-warning"/>}
                           <span>{selectedEntry.data?.journal_status === 'closed' ? 'Tuzatildi' : 'Nosoz'}</span>
                         </div>
                       ) : (
                         <div className={`premium-status-badge ${selectedEntry.status === 'verified' ? 'success' : (selectedEntry.status === 'pending' ? 'warning' : 'danger')}`}>
                           {selectedEntry.status === 'verified' ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                           <span>{selectedEntry.status === 'verified' ? 'Tasdiqlangan' : (selectedEntry.status === 'pending' ? 'Kutilmoqda' : 'Rad etilgan')}</span>
                         </div>
                       )}
                     </div>
                  </div>

                  <div className="premium-stats-grid">
                     <div className="stat-box">
                        <div className="stat-icon"><User size={18} /></div>
                        <div className="stat-info">
                           <label>Mas'ul Xodim</label>
                           <span>{selectedEntry.createdBy?.name}</span>
                           <small>{selectedEntry.createdBy?.role}</small>
                        </div>
                     </div>
                     <div className="stat-box">
                        <div className="stat-icon warning"><Clock size={18} /></div>
                        <div className="stat-info">
                           <label>Qayd qilingan vaqt</label>
                           <span>{selectedEntry.data?.recordedAt || new Date(selectedEntry.createdAt).toLocaleString('uz-UZ')}</span>
                        </div>
                     </div>
                     {selectedEntry.data?.closedBy && (
                       <div className="stat-box success">
                          <div className="stat-icon success"><CheckCircle2 size={18} /></div>
                          <div className="stat-info">
                             <label>Yopishni tasdiqladi</label>
                             <span>{selectedEntry.data.closedBy.name}</span>
                             <small>{selectedEntry.data.closedBy.role}</small>
                          </div>
                       </div>
                     )}
                  </div>
                  
                  <div className="premium-data-section">
                    <h4 className="section-title"><Zap size={18} /> Operatsion Ma'lumotlar</h4>
                    <div className="dynamic-data-grid">
                      {Object.entries(selectedEntry.data || {}).map(([key, value]) => {
                        if (['closedBy', 'recordedAt', 'journal_status'].includes(key)) return null;
                        return (
                          <div className="data-card" key={key}>
                            <div className="data-key">
                              <Hash size={14} />
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className="data-val">
                              {Array.isArray(value) ? (
                                <div className="data-nested-array">
                                  {value.map((item, i) => (
                                    <div key={i} className="data-nested-item">
                                      {typeof item === 'object' ? Object.entries(item).map(([k, v]) => (
                                        <div className="nested-key-val" key={k}>
                                          <span className="n-key">{k}:</span> 
                                          <span className="n-val">{String(v)}</span>
                                        </div>
                                      )) : String(item)}
                                    </div>
                                  ))}
                                </div>
                              ) : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="premium-action-footer">
                     <button 
                       className="btn-hujjatlashtirish group" 
                       onClick={() => setViewMode('document')}
                     >
                        <div className="btn-bg-glow"></div>
                        <Printer size={18} className="group-hover:scale-110 transition-transform" /> 
                        <span>Hujjatlashtirish</span>
                     </button>
                  </div>
                </div>
              )}
            </Modal.Body>
          </>
        ) : (
          <div className="a4-document-wrapper">
            {/* Action Bar (Not Printed) */}
            <div className="document-action-bar no-print">
               <h5 className="m-0 text-white" style={{ fontWeight: 800 }}>Hujjat Tafsiloti</h5>
               <div className="d-flex gap-2">
                 <button className="btn-document-action print" onClick={handlePrint}>
                   <Printer size={18} /> Chop etish
                 </button>
                 <button className="btn-document-action close" onClick={() => setShowDetailModal(false)}>
                   <X size={20} />
                 </button>
               </div>
            </div>

            {/* A4 Paper Body */}
            {selectedEntry && (
              <div className="a4-paper print-area">
                 <div className="paper-header">
                    <h3>"TOSHKENT METROPOLITENI" AJ</h3>
                    <h4>"HARAKAT XIZMATI"</h4>
                    <div className="divider"></div>
                    <h2>{selectedEntry.journalTypeId?.name} ({selectedEntry.journalTypeId?.code})</h2>
                 </div>
                 
                 <div className="paper-body">
                    <div className="info-grid">
                       <div className="info-row">
                          <span className="info-label">Sana va Vaqt:</span>
                          <span className="info-val">{selectedEntry.data?.recordedAt || new Date(selectedEntry.createdAt).toLocaleString('uz-UZ')}</span>
                       </div>
                       <div className="info-row">
                          <span className="info-label">To'ldirdi (Xodim):</span>
                          <span className="info-val">{selectedEntry.createdBy?.name} ({selectedEntry.createdBy?.role})</span>
                       </div>
                       {selectedEntry.data?.closedBy && (
                         <div className="info-row">
                            <span className="info-label">Chiqishni tasdiqladi:</span>
                            <span className="info-val">{selectedEntry.data.closedBy.name} ({selectedEntry.data.closedBy.role})</span>
                         </div>
                       )}
                    </div>

                    <div className="data-table-wrapper">
                      <table className="a4-data-table">
                        <tbody>
                          {Object.entries(selectedEntry.data || {}).map(([key, value]) => {
                            if (['closedBy', 'recordedAt', 'journal_status'].includes(key)) return null;
                            return (
                              <tr key={key}>
                                <td className="key-col">
                                  {key.replace(/_/g, ' ').toUpperCase()}
                                </td>
                                <td className="val-col">
                                  {Array.isArray(value) ? (
                                    <ul className="a4-list">
                                      {value.map((item, i) => (
                                        <li key={i}>
                                          {typeof item === 'object' ? Object.entries(item).map(([k, v]) => (
                                            <span key={k}><b>{k}:</b> {String(v)} </span>
                                          )) : String(item)}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                 </div>

                 {/* Stamp Footer */}
                 <div className="paper-footer">
                    <div className="signature-line">
                       <div className="sign-box">
                          <span>Tasdiqladi:</span>
                          <div className="line"></div>
                       </div>
                       <div className="sign-name">{selectedEntry.createdBy?.name}</div>
                    </div>

                    <SecureStamp stationName={station?.name} />
                 </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Archive;
