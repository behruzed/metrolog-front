import React, { useState } from 'react';
import { 
  Calendar, MapPin, Activity, Gauge, User, Clock, 
  Plus, Trash2, Save, X, CheckCircle2, AlertCircle, Users
} from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import { Spinner, Alert } from 'react-bootstrap';

const JournalDU60 = ({ type, onSuccess, onCancel }) => {
  const { station } = useAuthStore();
  const [formData, setFormData] = useState({
    order_number: '',
    application_time: '',
    application_number: '',
    signed_by: '',
    start_time: '',
    location: '',
    character: '',
    speed_limit: '',
    responsible_person: '',
    end_time: '',
    personnel: []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    fetchNextOrderNumber();
  }, []);

  const fetchNextOrderNumber = async () => {
    try {
      const { data } = await axios.get(`/journals/next-order/${type.code}`);
      setFormData(prev => ({ ...prev, order_number: data.nextOrderNumber }));
    } catch (err) {
      console.error('Error fetching order number:', err);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addPersonnelRow = () => {
    setFormData(prev => ({
      ...prev,
      personnel: [...prev.personnel, { id_number: '', name: '', status: 'Kutilmoqda' }]
    }));
  };

  const removePersonnelRow = (index) => {
    setFormData(prev => ({
      ...prev,
      personnel: prev.personnel.filter((_, i) => i !== index)
    }));
  };

  const handlePersonnelChange = (index, field, value) => {
    const updatedPersonnel = [...formData.personnel];
    updatedPersonnel[index][field] = value;
    setFormData(prev => ({ ...prev, personnel: updatedPersonnel }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('/journals/entries', {
        journalTypeId: type._id,
        data: {
          ...formData,
          recordedAt: new Date().toLocaleString('uz-UZ'),
          stationName: station?.name
        }
      });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Saqlashda xatolik yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="journal-1c-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 border-white/10">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 bg-primary/20 rounded-lg">
            <AlertCircle size={20} className="text-primary" />
          </div>
          <h5 className="m-0 font-bold">Ogohlantirishni Rasmiylashtirish (DU-60)</h5>
        </div>
        <div className="results-count font-semibold text-xs opacity-75">
          Bekat: <span className="text-primary">{station?.name}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Form Grid */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-1">
              <label className="font-bold text-xs uppercase tracking-wider text-muted m-0">№ Tartib raqami</label>
              <input 
                type="number" 
                required 
                className="journal-1c-input w-100"
                value={formData.order_number}
                onChange={(e) => handleInputChange('order_number', e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-1">
              <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                <Clock size={14} className="text-primary" /> Ariza kelib tushgan vaqt
              </label>
              <input 
                type="datetime-local" 
                required 
                className="journal-1c-input w-100"
                value={formData.application_time}
                onChange={(e) => handleInputChange('application_time', e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-1">
              <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                <Activity size={14} className="text-primary" /> Ariza raqami
              </label>
              <input 
                type="text" 
                required 
                className="journal-1c-input w-100"
                placeholder="Ariza №"
                value={formData.application_number}
                onChange={(e) => handleInputChange('application_number', e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-1">
              <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                <User size={14} className="text-primary" /> Arizani imzolagan shaxs
              </label>
              <input 
                type="text" 
                required 
                className="journal-1c-input w-100"
                placeholder="Lavozimi va F.I.Sh"
                value={formData.signed_by}
                onChange={(e) => handleInputChange('signed_by', e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-1">
              <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                <Clock size={14} className="text-primary" /> Ogohlantirish boshlanishi
              </label>
              <input 
                type="datetime-local" 
                required 
                className="journal-1c-input w-100"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-1">
              <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                <MapPin size={14} className="text-primary" /> Kilometr / Joy
              </label>
              <input 
                type="text" 
                required 
                className="journal-1c-input w-100"
                placeholder="Masalan: 12-km, 3-piket"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-1">
              <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                <Gauge size={14} className="text-primary" /> Tezlik cheklovi
              </label>
              <input 
                type="text" 
                required 
                className="journal-1c-input w-100"
                placeholder="Masalan: 25 km/soat"
                value={formData.speed_limit}
                onChange={(e) => handleInputChange('speed_limit', e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-1">
              <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                <User size={14} className="text-primary" /> Mas'ul xodim
              </label>
              <input 
                type="text" 
                required 
                className="journal-1c-input w-100"
                placeholder="Ism sharifi..."
                value={formData.responsible_person}
                onChange={(e) => handleInputChange('responsible_person', e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="d-flex flex-column gap-1">
              <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                <Calendar size={14} className="text-primary" /> Amal qilish muddati
              </label>
              <input 
                type="datetime-local" 
                required 
                className="journal-1c-input w-100"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div className="d-flex flex-column gap-1 mb-4">
          <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
            <Activity size={14} className="text-primary" /> Ogohlantirish xarakteri
          </label>
          <textarea 
            required
            className="journal-1c-input w-100"
            style={{ height: '70px', minHeight: '70px' }}
            placeholder="Bajariladigan ish turi va qo'shimcha shartlarni batafsil yozing..."
            value={formData.character}
            onChange={(e) => handleInputChange('character', e.target.value)}
          />
        </div>

        {/* Personnel Section */}
        <div className={`journal-1c-card mb-4 ${station?.distance ? `distance-glow-${station.distance}` : ''}`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <Users size={18} className="text-primary" />
              <h5 className="m-0 font-bold" style={{ fontSize: '13.5px' }}>Xodimlar jadvali</h5>
            </div>
            <button 
              type="button"
              onClick={addPersonnelRow}
              className="journal-1c-btn"
            >
              <Plus size={14} /> <span>Xodim qo'shish</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="journal-1c-table m-0">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>№</th>
                  <th>Guvohnoma №</th>
                  <th>F.I.SH</th>
                  <th style={{ width: '180px' }}>Holat / Imzo</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.personnel.map((p, index) => (
                  <tr key={index}>
                    <td className="text-center font-bold opacity-50">{index + 1}</td>
                    <td>
                      <input 
                        type="text" 
                        required
                        placeholder="000000"
                        value={p.id_number}
                        onChange={(e) => handlePersonnelChange(index, 'id_number', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        required
                        placeholder="Xodim F.I.SH"
                        value={p.name}
                        onChange={(e) => handlePersonnelChange(index, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <select 
                        className="journal-1c-input py-1 h-auto w-100 border border-white/10"
                        style={{ fontSize: '12px', background: 'var(--metro-bg)' }}
                        value={p.status}
                        onChange={(e) => handlePersonnelChange(index, 'status', e.target.value)}
                      >
                        <option value="Kutilmoqda">⏳ Kutilmoqda</option>
                        <option value="Tasdiqlangan">✅ Tasdiqlangan</option>
                        <option value="Rad etilgan">❌ Rad etilgan</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <button 
                        type="button"
                        onClick={() => removePersonnelRow(index)}
                        className="p-1 text-danger hover:bg-danger/10 rounded border-0 bg-transparent transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {formData.personnel.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 opacity-50 italic text-sm">
                      Hech qanday xodim qo'shilmagan. "Xodim qo'shish" tugmasini bosing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && <Alert variant="danger" className="mb-4 py-2 px-3" style={{ fontSize: '12px' }}>{error}</Alert>}
        {success && <Alert variant="success" className="mb-4 py-2 px-3 flex items-center gap-2" style={{ fontSize: '12px' }}><CheckCircle2 size={16} /> Ma'lumotlar saqlandi!</Alert>}

        {/* Buttons */}
        <div className="d-flex gap-2">
          <button 
            type="submit" 
            disabled={saving}
            className="journal-1c-btn journal-1c-btn-primary"
          >
            {saving ? <Spinner animation="border" size="sm" /> : <Save size={16} />}
            <span>Saqlash va Rasmiylashtirish</span>
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-metro-back"
          >
            <X size={16} />
            <span>Bekor qilish</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default JournalDU60;
