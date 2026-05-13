import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Activity, Gauge, User, Clock, 
  Plus, Trash2, Save, X, CheckCircle2, AlertCircle, Users
} from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import { Spinner, Alert, Table } from 'react-bootstrap';

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
    <div className="archive-epic-layout" style={{ height: 'auto', minHeight: '600px' }}>
      <div className="archive-column flex-1">
        <div className="column-header space-between">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <AlertCircle size={20} className="text-primary" />
            </div>
            <h5>Ogohlantirishni Rasmiylashtirish (DU-60)</h5>
          </div>
          <div className="results-count">
            Bekat: <span>{station?.name}</span>
          </div>
        </div>

        <div className="custom-scrollbar p-6 lg:p-10" style={{ overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} className="du60-modern-form">
            {/* Upper Part: General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="form-group-modern">
                <label>№ Tartib raqami</label>
                <input 
                  type="number" 
                  required 
                  className="input-metro-industrial"
                  value={formData.order_number}
                  onChange={(e) => handleInputChange('order_number', e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label><Clock size={14} /> Ariza kelib tushgan vaqt</label>
                <input 
                  type="datetime-local" 
                  required 
                  className="input-metro-industrial"
                  value={formData.application_time}
                  onChange={(e) => handleInputChange('application_time', e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label><Activity size={14} /> Ariza raqami</label>
                <input 
                  type="text" 
                  required 
                  className="input-metro-industrial"
                  placeholder="Ariza №"
                  value={formData.application_number}
                  onChange={(e) => handleInputChange('application_number', e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label><User size={14} /> Arizani imzolagan shaxs</label>
                <input 
                  type="text" 
                  required 
                  className="input-metro-industrial"
                  placeholder="Lavozimi va F.I.Sh"
                  value={formData.signed_by}
                  onChange={(e) => handleInputChange('signed_by', e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label><Clock size={14} /> Ogohlantirish boshlanishi</label>
                <input 
                  type="datetime-local" 
                  required 
                  className="input-metro-industrial"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label><MapPin size={14} /> Kilometr / Joy</label>
                <input 
                  type="text" 
                  required 
                  className="input-metro-industrial"
                  placeholder="Masalan: 12-km, 3-piket"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label><Gauge size={14} /> Tezlik cheklovi</label>
                <input 
                  type="text" 
                  required 
                  className="input-metro-industrial"
                  placeholder="Masalan: 25 km/soat"
                  value={formData.speed_limit}
                  onChange={(e) => handleInputChange('speed_limit', e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label><User size={14} /> Mas'ul xodim</label>
                <input 
                  type="text" 
                  required 
                  className="input-metro-industrial"
                  placeholder="Ism sharifi..."
                  value={formData.responsible_person}
                  onChange={(e) => handleInputChange('responsible_person', e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label><Calendar size={14} /> Amal qilish muddati</label>
                <input 
                  type="datetime-local" 
                  required 
                  className="input-metro-industrial"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-modern mb-12">
              <label><Activity size={14} /> Ogohlantirish xarakteri</label>
              <textarea 
                required
                className="input-metro-industrial"
                style={{ minHeight: '100px' }}
                placeholder="Bajariladigan ish turi va qo'shimcha shartlarni batafsil yozing..."
                value={formData.character}
                onChange={(e) => handleInputChange('character', e.target.value)}
              />
            </div>

            {/* Lower Part: Personnel Table */}
            <div className="personnel-section mb-12">
              <div className="d-flex justify-content-between align-items-center mb-6">
                <div className="d-flex align-items-center gap-3">
                  <Users size={20} className="text-primary" />
                  <h5 className="m-0 font-black uppercase tracking-widest text-sm opacity-60">Xodimlar jadvali</h5>
                </div>
                <button 
                  type="button"
                  onClick={addPersonnelRow}
                  className="btn-metro-ghost !py-2 !px-4"
                >
                  <Plus size={16} /> <span>Xodim qo'shish</span>
                </button>
              </div>

              <div className="glass-panel overflow-hidden border-white/5">
                <Table responsive hover className="du60-table m-0">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>№</th>
                      <th>Guvohnoma №</th>
                      <th>F.I.SH</th>
                      <th>Holat / Imzo</th>
                      <th style={{ width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.personnel.map((p, index) => (
                      <tr key={index}>
                        <td className="text-center font-black opacity-30">{index + 1}</td>
                        <td>
                          <input 
                            type="text" 
                            className="table-input" 
                            placeholder="000000"
                            value={p.id_number}
                            onChange={(e) => handlePersonnelChange(index, 'id_number', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="table-input" 
                            placeholder="Xodim F.I.SH"
                            value={p.name}
                            onChange={(e) => handlePersonnelChange(index, 'name', e.target.value)}
                          />
                        </td>
                        <td>
                          <select 
                            className="table-input"
                            value={p.status}
                            onChange={(e) => handlePersonnelChange(index, 'status', e.target.value)}
                          >
                            <option value="Kutilmoqda">Kutilmoqda</option>
                            <option value="Tasdiqlangan">Tasdiqlangan</option>
                            <option value="Rad etilgan">Rad etilgan</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            type="button"
                            onClick={() => removePersonnelRow(index)}
                            className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.personnel.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-10 opacity-30 italic">
                          Hech qanday xodim qo'shilmagan. "Xodim qo'shish" tugmasini bosing.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>

            {error && <Alert variant="danger" className="mb-6">{error}</Alert>}
            {success && <Alert variant="success" className="mb-6 flex items-center gap-2"><CheckCircle2 size={18} /> Ma'lumotlar saqlandi!</Alert>}

            <div className="d-flex gap-4">
              <button 
                type="submit" 
                disabled={saving}
                className="btn-metro-primary !py-4 !px-12"
              >
                {saving ? <Spinner animation="border" size="sm" /> : <Save size={20} />}
                <span>Saqlash va Rasmiylashtirish</span>
              </button>
              <button 
                type="button" 
                onClick={onCancel}
                className="btn-metro-ghost !py-4 !px-12"
              >
                <X size={20} />
                <span>Bekor qilish</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .du60-modern-form {
          .form-group-modern {
            display: flex;
            flex-direction: column;
            gap: 10px;
            
            label {
              font-size: 0.75rem;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: var(--metro-text-muted);
              display: flex;
              align-items: center;
              gap: 8px;
              margin-left: 5px;
            }
          }
        }

        .du60-table {
          color: var(--metro-fg) !important;
          
          th {
            background: rgba(var(--metro-card-bg-rgb), 0.5) !important;
            border-bottom: 1px solid var(--metro-glass-border) !important;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--metro-text-muted) !important;
            padding: 1rem !important;
          }

          td {
            border-bottom: 1px solid var(--metro-glass-border) !important;
            padding: 0.75rem !important;
            vertical-align: middle;
            background: transparent !important;
          }

          .table-input {
            width: 100%;
            background: transparent;
            border: 1px solid transparent;
            color: var(--metro-fg);
            font-weight: 600;
            padding: 0.5rem;
            border-radius: 0.5rem;
            outline: none;
            transition: all 0.2s;

            &:focus {
              background: var(--metro-input-bg);
              border-color: var(--metro-accent);
            }
            
            &::placeholder {
              opacity: 0.2;
            }
          }
          
          select.table-input {
            cursor: pointer;
            option { background: var(--metro-bg); }
          }
        }
      `}</style>
    </div>
  );
};

export default JournalDU60;
