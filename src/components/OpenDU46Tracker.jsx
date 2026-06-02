import React, { useState, useEffect } from 'react';
import { Spinner, Modal } from 'react-bootstrap';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import DU46TemplatePanel from './DU46TemplatePanel';

const OpenDU46Tracker = ({ onUpdate }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entryToClose, setEntryToClose] = useState(null);
  const [confirmData, setConfirmData] = useState({ measures_taken: '' });
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data } = await axios.get('/auth/stations');
        setStations(data.map(s => s.name));
      } catch (err) {
        setStations(['Bodomzor', 'Shahriston', 'Yunusobod', 'Turkiston', 'Minor', 'Abdulla Qodiriy', 'Paxtakor', 'Chorsu']);
      }
    };
    fetchStations();
  }, []);

  const handleOtpiskaApply = (text) => {
    setConfirmData(prev => ({ ...prev, measures_taken: text }));
  };

  useEffect(() => {
    fetchOpenEntries();
    const interval = setInterval(fetchOpenEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOpenEntries = async () => {
    try {
      const { data } = await axios.get('/journals/entries/open/du46');
      setEntries(data);
    } catch (err) {
      console.error('Error fetching open DU-46 entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = (entry) => {
    setEntryToClose(entry);
    setConfirmData({
      measures_taken: ''
    });
    setShowConfirmModal(true);
  };

  const confirmClose = async () => {
    if (!entryToClose || !confirmData.measures_taken.trim()) {
        toast.error('Chora-tadbirlarni to\'ldiring');
        return;
    }
    setClosing(entryToClose._id);
    try {
      await axios.put(`/journals/entries/${entryToClose._id}/close-du46`, {
        measures_taken: confirmData.measures_taken
      });
      toast.success('Nosozlik bartaraf etildi.');
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
           <AlertTriangle size={20} className="text-warning" />
           <h2 className="m-0">Faol Nosozliklar (DU-46)</h2>
        </div>
        <div className="text-danger" style={{ fontWeight: 'bold' }}>
          Faol: {entries.length}
        </div>
      </div>

      {loading && entries.length === 0 ? (
        <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
      ) : entries.length === 0 ? (
        <div className="journal-1c-card text-center py-4 text-success">
          <b>Barcha nosozliklar bartaraf etilgan</b>
        </div>
      ) : (
        <table className="journal-1c-table">
          <thead>
            <tr>
              <th>Xabar vaqti</th>
              <th>Nosozlik tavsifi</th>
              <th>Xabar berish usuli</th>
              <th>Qabul qildi</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry._id}>
                <td style={{ whiteSpace: 'nowrap' }}>{entry.data?.record_time || new Date(entry.createdAt).toLocaleString('uz-UZ')}</td>
                <td>
                  <div style={{ fontSize: '12px', maxWidth: '300px' }}>{entry.data.malfunction_desc}</div>
                </td>
                <td>
                   <span className="badge-glass" style={{ fontSize: '10px' }}>{entry.data.notification_method}</span>
                </td>
                <td>
                   <div style={{ fontSize: '11px' }}>{entry.data.technician_name} {entry.data.technician_phone && `(${entry.data.technician_phone})`}</div>
                   <div style={{ fontSize: '10px', opacity: 0.6 }}>{entry.createdBy?.name}</div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="journal-1c-btn journal-1c-btn-primary"
                    onClick={() => handleCloseClick(entry)}
                    disabled={closing === entry._id}
                  >
                    {closing === entry._id ? '...' : 'Bartaraf etish'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal show={showConfirmModal} onHide={() => !closing && setShowConfirmModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ padding: '10px 15px' }}>
          <Modal.Title style={{ fontSize: '16px', fontWeight: 'bold' }}>Nosozlikni Bartaraf Etish (DU-46)</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="du5-split-layout">
            {/* Left Col: Textarea & Buttons */}
            <div className="du5-form-col">
              <div className="mb-3">
                 <p className="mb-1" style={{ fontSize: '14px' }}><b>Nosozlik:</b> {entryToClose?.data.malfunction_desc}</p>
                 {entryToClose?.data.malfunction_desc === "Boshqa (Qo'lda kiritish)" && entryToClose?.data.malfunction_desc_custom && (
                   <div className="mb-2 p-2 border rounded" style={{ fontSize: '12.5px', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)' }}>
                     {entryToClose.data.malfunction_desc_custom}
                   </div>
                 )}
              </div>
              <div className="journal-1c-form-group mb-4">
                <label className="d-block mb-1" style={{ fontWeight: 'bold' }}>Shikastlanish sabablari va ko‘rilgan choralar:</label>
                <textarea 
                  className="journal-1c-input w-100"
                  style={{ height: '180px', maxWidth: '100%' }}
                  placeholder="Shablondan tanlang yoki ko'rilgan choralarni yozing..."
                  value={confirmData.measures_taken}
                  onChange={(e) => setConfirmData(prev => ({ ...prev, measures_taken: e.target.value }))}
                />
              </div>
              
              <div className="d-flex gap-2 justify-content-end mt-4">
                <button 
                  className="journal-1c-btn journal-1c-btn-primary" 
                  onClick={confirmClose}
                  disabled={closing}
                >
                  {closing ? 'Saqlanmoqda...' : 'Yopish va Saqlash'}
                </button>
                <button 
                  className="btn-metro-back" 
                  onClick={() => setShowConfirmModal(false)}
                  disabled={closing}
                >
                  <X size={14} /> Bekor qilish
                </button>
              </div>
            </div>

            {/* Right Col: Template Panel */}
            <div className="du5-template-col" style={{ width: '320px', position: 'static' }}>
              <DU46TemplatePanel mode="otpiska" onApply={handleOtpiskaApply} stations={stations} />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OpenDU46Tracker;
