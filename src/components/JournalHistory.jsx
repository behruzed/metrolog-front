import React, { useState, useEffect } from 'react';
import { Form, Spinner, Table, Modal } from 'react-bootstrap';
import { Search, X } from 'lucide-react';
import axios from '../api/axios';

const JournalHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('/journals/entries');
      setEntries(data);
    } catch (err) {
      console.error('Error fetching journal history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionDescription = (entry) => {
    const data = entry.data || {};
    const journalCode = entry.journalTypeId?.code;
    
    switch(journalCode) {
      case 'DU-2':
        return `${data.action_type || ''} - ${data.train_number || ''} (${data.track_id || ''})`;
      case 'DU-5':
        return `${data.personnelCount || 0} ta xodim kiritildi`;
      case 'DU-19':
        return `№${data.order_number || '-'} | ${data.wagon_count || 0} vagon - ${data.start_route || '-'} → ${data.end_route || '-'} yo'l`;
      case 'EU-132':
        return `Himoya vositasi: ${data.equipment_name || ''} (№${data.equipment_number || ''})`;
      case 'DU-60':
        return `Ogohlantirish: ${data.location || ''} | ${data.speed_limit || ''}`;
      default:
        return entry.journalTypeId?.name || 'Noma\'lum';
    }
  };

  const filteredEntries = entries.filter(entry => {
    let matches = true;
    if (searchTerm) {
      matches = matches && (
        entry.journalTypeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getActionDescription(entry).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType) {
      matches = matches && entry.journalTypeId?.code === filterType;
    }
    return matches;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const uniqueTypes = [...new Set(entries.map(e => e.journalTypeId?.code).filter(Boolean))];

  return (
    <div className="journal-1c-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Jurnal Tarixi</h2>
        <div className="d-flex gap-2">
          <div className="position-relative">
            <Search size={14} className="position-absolute" style={{ left: '8px', top: '8px', opacity: 0.5 }} />
            <input 
              type="text" 
              className="journal-1c-input" 
              style={{ paddingLeft: '28px', width: '250px' }}
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="journal-1c-input" 
            style={{ width: '150px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Barcha turlar</option>
            {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          { (searchTerm || filterType) && (
            <button className="journal-1c-btn" onClick={() => {setSearchTerm(''); setFilterType('');}}><X size={14} /></button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
      ) : (
        <table className="journal-1c-table">
          <thead>
            <tr>
              <th>Vaqt</th>
              <th>Jurnal</th>
              <th>Harakat / Ma'lumot</th>
              <th>Xodim</th>
              <th>Holat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry._id} style={{ cursor: 'pointer' }} onClick={() => {setSelectedEntry(entry); setShowDetailModal(true);}}>
                <td style={{ whiteSpace: 'nowrap' }}>{entry.data?.recordedAt || new Date(entry.createdAt).toLocaleString('uz-UZ')}</td>
                <td><b>{entry.journalTypeId?.code}</b></td>
                <td>{getActionDescription(entry)}</td>
                <td>{entry.createdBy?.name}</td>
                <td>
                  {entry.journalTypeId?.code === 'DU-5' ? (
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: entry.data?.journal_status === 'closed' ? '#28a745' : '#fd7e14' }}>
                      {entry.data?.journal_status === 'closed' ? 'Chiqdi' : 'Tunelda'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: entry.status === 'verified' ? 'green' : (entry.status === 'pending' ? 'orange' : 'red') }}>
                      {entry.status === 'verified' ? 'Tasdiqlangan' : (entry.status === 'pending' ? 'Kutilmoqda' : 'Rad etilgan')}
                    </span>
                  )}
                </td>
                <td>
                  <button className="journal-1c-btn" style={{ padding: '0 5px' }}>Ochish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton style={{ padding: '10px 15px' }}>
          <Modal.Title style={{ fontSize: '16px', fontWeight: 'bold' }}>Yozuv tafsiloti</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          {selectedEntry && (
            <div className="journal-1c-card">
              <div className="mb-2"><b>Turi:</b> {selectedEntry.journalTypeId?.name} ({selectedEntry.journalTypeId?.code})</div>
              <div className="mb-2"><b>Xodim:</b> {selectedEntry.createdBy?.name} ({selectedEntry.createdBy?.role})</div>
              <div className="mb-2"><b>Sana:</b> {selectedEntry.data?.recordedAt || new Date(selectedEntry.createdAt).toLocaleString('uz-UZ')}</div>
              {selectedEntry.data?.closedBy && (
                <div className="mb-2 text-success"><b>Amalni yakunladi:</b> {selectedEntry.data.closedBy.name} ({selectedEntry.data.closedBy.role})</div>
              )}
              {selectedEntry.data?.verifiedBy && (
                <div className="mb-2 text-primary"><b>Tasdiqladi:</b> {selectedEntry.data.verifiedBy.name} ({selectedEntry.data.verifiedBy.role}) - {selectedEntry.data.verifiedBy.time}</div>
              )}
              <hr />
              <div className="mt-3">
                <table className="journal-1c-table">
                  <tbody>
                    {Object.entries(selectedEntry.data || {}).map(([key, value]) => {
                      if (['closedBy', 'recordedAt', 'employee_name', 'employee_role', 'verifiedBy'].includes(key)) return null;
                      return (
                        <tr key={key}>
                          <td style={{ width: '200px', background: '#f5f5f5', fontWeight: 'bold' }}>{key}</td>
                          <td>
                            {Array.isArray(value) ? (
                              <table className="journal-1c-table m-0">
                                <tbody>
                                  {value.map((item, i) => (
                                    <tr key={i}>
                                      {typeof item === 'object' ? Object.entries(item).map(([k, v]) => (
                                        <td key={k} style={{ fontSize: '11px' }}>{k}: {String(v)}</td>
                                      )) : <td>{String(item)}</td>}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default JournalHistory;
