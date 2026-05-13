import React, { useState, useEffect } from 'react';
import { Spinner, Table, Modal, Button } from 'react-bootstrap';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';

const OpenDU5Tracker = ({ onUpdate }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entryToClose, setEntryToClose] = useState(null);
  const [confirmData, setConfirmData] = useState({ exit_location: '', exit_time: '' });
  const [stations, setStations] = useState([]);

  useEffect(() => {
    fetchOpenEntries();
    fetchStations();
    const interval = setInterval(fetchOpenEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStations = async () => {
    try {
      const { data } = await axios.get('/auth/stations');
      setStations(data.map(s => s.name));
    } catch (err) {
      setStations(['Bodomzor', 'Shahriston', 'Yunusobod', 'Turkiston', 'Minor', 'Abdulla Qodiriy', 'Paxtakor', 'Chorsu']);
    }
  };

  const fetchOpenEntries = async () => {
    try {
      const { data } = await axios.get('/journals/entries/open/du5');
      setEntries(data);
    } catch (err) {
      console.error('Error fetching open DU-5 entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = (entry) => {
    setEntryToClose(entry);
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setConfirmData({
      exit_location: entry.data?.exit_location || stations[0] || '',
      exit_time: localNow
    });
    setShowConfirmModal(true);
  };

  const confirmClose = async () => {
    if (!entryToClose) return;
    setClosing(entryToClose._id);
    try {
      await axios.put(`/journals/entries/${entryToClose._id}/close`, {
        exit_time: confirmData.exit_time,
        exit_location: confirmData.exit_location
      });
      toast.success('Tasdiqlandi.');
      fetchOpenEntries();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Xatolik.');
    } finally {
      setClosing(null);
      setShowConfirmModal(false);
      setEntryToClose(null);
    }
  };

  return (
    <div className="journal-1c-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Tuneldagi Xodimlar Monitoringi</h2>
        <div className="text-danger" style={{ fontWeight: 'bold' }}>
          Faol: {entries.length}
        </div>
      </div>

      {loading && entries.length === 0 ? (
        <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
      ) : entries.length === 0 ? (
        <div className="journal-1c-card text-center py-4 text-success">
          <b>Tunnelda hech kim yo'q</b>
        </div>
      ) : (
        <table className="journal-1c-table">
          <thead>
            <tr>
              <th>Kirish vaqti</th>
              <th>Xodimlar</th>
              <th>Eshik / Maqsad</th>
              <th>Mo'ljal Chiqish</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry._id}>
                <td style={{ whiteSpace: 'nowrap' }}>{entry.data?.recordedAt || new Date(entry.createdAt).toLocaleTimeString('uz-UZ')}</td>
                <td>
                  <div style={{ fontSize: '12px' }}>
                    {entry.data.personnel?.map((p, i) => (
                      <div key={i}>• {p.fullName} ({p.certificateId})</div>
                    ))}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '11px' }}><b>Eshik:</b> {entry.data.entrance_door || '-'}</div>
                  <div style={{ fontSize: '11px' }}><b>Maqsad:</b> {entry.data.purpose}</div>
                </td>
                <td>
                  <div style={{ fontSize: '11px' }}><b>Bekat:</b> {entry.data.exit_location}</div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="journal-1c-btn journal-1c-btn-primary"
                    onClick={() => handleCloseClick(entry)}
                    disabled={closing === entry._id}
                  >
                    {closing === entry._id ? '...' : 'Chiqishni tasdiqlash'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal show={showConfirmModal} onHide={() => !closing && setShowConfirmModal(false)} centered size="md">
        <Modal.Header closeButton style={{ padding: '10px 15px' }}>
          <Modal.Title style={{ fontSize: '16px', fontWeight: 'bold' }}>Chiqishni Tasdiqlash</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="journal-1c-form-group mb-3">
            <label className="d-block mb-1">Xodim ushbu bekatdan chiqdi:</label>
            <select 
              className="journal-1c-input w-100"
              value={confirmData.exit_location}
              onChange={(e) => setConfirmData(prev => ({ ...prev, exit_location: e.target.value }))}
            >
              {stations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="journal-1c-form-group mb-4">
            <label className="d-block mb-1">Chiqish vaqti:</label>
            <input 
              type="datetime-local" 
              className="journal-1c-input w-100"
              value={confirmData.exit_time}
              onChange={(e) => setConfirmData(prev => ({ ...prev, exit_time: e.target.value }))}
            />
          </div>
          
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button 
              className="journal-1c-btn journal-1c-btn-primary" 
              onClick={confirmClose}
              disabled={closing}
            >
              {closing ? 'Saqlanmoqda...' : 'Tasdiqlash va Saqlash'}
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

export default OpenDU5Tracker;
