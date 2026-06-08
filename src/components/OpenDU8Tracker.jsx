import React, { useState, useEffect } from 'react';
import { Spinner, Modal } from 'react-bootstrap';
import { Key, X } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const OpenDU8Tracker = ({ onUpdate }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entryToClose, setEntryToClose] = useState(null);
  const [confirmData, setConfirmData] = useState({ return_time: '' });

  useEffect(() => {
    fetchOpenEntries();
    const interval = setInterval(fetchOpenEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOpenEntries = async () => {
    try {
      const { data } = await axios.get('/journals/entries/open/du8');
      setEntries(data);
    } catch (err) {
      console.error('Error fetching open DU-8 entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = (entry) => {
    setEntryToClose(entry);
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setConfirmData({
      return_time: localNow
    });
    setShowConfirmModal(true);
  };

  const confirmClose = async () => {
    if (!entryToClose) return;
    setClosing(entryToClose._id);
    try {
      await axios.put(`/journals/entries/${entryToClose._id}/close-du8`, {
        return_time: confirmData.return_time
      });
      toast.success('Kalit topshirildi.');
      fetchOpenEntries();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Xatolik yuz berdi.');
    } finally {
      setClosing(null);
      setShowConfirmModal(false);
      setEntryToClose(null);
    }
  };

  return (
    <div className="journal-1c-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
           <Key size={20} className="text-primary" />
           <h2 className="m-0">Topshirilmagan Kalitlar (DU-8)</h2>
        </div>
        <div className="text-danger" style={{ fontWeight: 'bold' }}>
          Faol: {entries.length}
        </div>
      </div>

      {loading && entries.length === 0 ? (
        <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
      ) : entries.length === 0 ? (
        <div className="journal-1c-card text-center py-4 text-success">
          <b>Barcha kalitlar topshirilgan</b>
        </div>
      ) : (
        <div className="table-responsive custom-scrollbar">
          <table className="journal-1c-table">
            <thead>
              <tr>
                <th>Olingan vaqti</th>
                <th>Xodim (F.I.Sh)</th>
                <th>Lavozim / Departament</th>
                <th>Maqsad</th>
                <th>Guvohnoma</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{entry.data?.record_time || new Date(entry.createdAt).toLocaleString('uz-UZ')}</td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{entry.data.employee_name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '11px' }}>{entry.data.position}</div>
                    <div style={{ fontSize: '10px', opacity: 0.6 }}>{entry.data.department}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '11px' }}>{entry.data.purpose}</div>
                  </td>
                  <td>
                     <div style={{ fontSize: '11px' }}>{entry.data.licence_id}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="journal-1c-btn journal-1c-btn-primary"
                      onClick={() => handleCloseClick(entry)}
                      disabled={closing === entry._id}
                    >
                      {closing === entry._id ? '...' : 'Kalitni topshirdi'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={showConfirmModal} onHide={() => !closing && setShowConfirmModal(false)} centered size="md">
        <Modal.Header closeButton style={{ padding: '10px 15px' }}>
          <Modal.Title style={{ fontSize: '16px', fontWeight: 'bold' }}>Kalit Topshirishni Tasdiqlash</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="mb-3">
             <p className="mb-1" style={{ fontSize: '14px' }}><b>Xodim:</b> {entryToClose?.data.employee_name}</p>
             <p style={{ fontSize: '12px', opacity: 0.7 }}>Kalit topshirilganligini tasdiqlang.</p>
          </div>
          <div className="journal-1c-form-group mb-4">
            <label className="d-block mb-1">Topshirish vaqti:</label>
            <input 
              type="datetime-local" 
              className="journal-1c-input w-100"
              value={confirmData.return_time}
              onChange={(e) => setConfirmData(prev => ({ ...prev, return_time: e.target.value }))}
            />
          </div>
          
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button 
              className="journal-1c-btn journal-1c-btn-primary" 
              onClick={confirmClose}
              disabled={closing}
            >
              {closing ? 'Saqlanmoqda...' : 'Topshirdi'}
            </button>
            <button 
              className="btn-metro-back" 
              onClick={() => setShowConfirmModal(false)}
              disabled={closing}
            >
              <X size={14} /> Bekor qilish
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OpenDU8Tracker;
