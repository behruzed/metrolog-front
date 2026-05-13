import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Save, Plus, Trash2, X } from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';

// ─── Main JournalForm ──────────────────────────────────────────────────────────
const JournalForm = ({ type, onSuccess, du2Action }) => {
  const { station } = useAuthStore();
  const [formData, setFormData] = useState({});
  const [personnelRows, setPersonnelRows] = useState([{ certificateId: '', fullName: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

  useEffect(() => {
    const fetchNextOrderNumber = async () => {
      if (type?.code === 'DU-19') {
        try {
          const { data } = await axios.get(`/journals/next-order/DU-19`);
          setFormData(prev => ({ ...prev, order_number: data.nextNumber }));
        } catch (err) {
          console.error('Error fetching next order number:', err);
        }
      }
    };

    let initialData = {};
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    if (type?.code === 'DU-2' && du2Action) {
      initialData = {
        action_type: du2Action,
        event_time: localNow
      };
    } else if (type?.code === 'DU-5') {
      initialData = {
        record_time: localNow
      };
    } else if (type?.code === 'DU-19') {
      initialData = {
        record_time: localNow,
        completion_time: localNow,
        end_time: localNow
      };
    } else if (type?.code === 'DU-8') {
      initialData = {
        record_time: localNow
      };
    } else if (type?.code === 'DU-46') {
      initialData = {
        record_time: localNow,
        notification_method: 'Telefon'
      };
    }
    setFormData(initialData);
    if (type?.code === 'DU-19') fetchNextOrderNumber();
    setPersonnelRows([{ certificateId: '', fullName: '' }]);
    setError('');
    setSuccess(false);
  }, [type, du2Action]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePersonnelChange = (index, field, value) => {
    setPersonnelRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addPersonnelRow = () => setPersonnelRows(prev => [...prev, { certificateId: '', fullName: '' }]);
  const removePersonnelRow = (index) => setPersonnelRows(prev => prev.filter((_, idx) => idx !== index));

  const formatToSubmissionDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  };

  const buildSubmissionData = () => {
    const processed = {};
    Object.keys(formData).forEach(key => {
      if (key.includes('time') || key.includes('date')) {
        processed[key] = formatToSubmissionDate(formData[key]);
      } else {
        processed[key] = formData[key];
      }
    });

    const base = {
      ...processed,
      stationName: station?.name || 'Unknown',
      stationCode: station?.department || 'Unknown',
      recordedAt: formatToSubmissionDate(new Date())
    };

    if (type.code === 'DU-5') {
      const filtered = personnelRows
        .filter(r => r.certificateId.trim() || r.fullName.trim())
        .map((r, i) => ({ id: i + 1, ...r, recordedAt: formatToSubmissionDate(new Date()) }));
      return { 
        ...base, 
        personnelCount: filtered.length, 
        personnel: filtered, 
        journal_status: 'open',
        dutyLabel: type.code, 
        dutyTime: formatToSubmissionDate(new Date()) 
      };
    }
    if (type.code === 'DU-8') {
      return {
        ...base,
        journal_status: 'open',
        dutyLabel: type.code,
        dutyTime: formatToSubmissionDate(new Date())
      };
    }
    if (type.code === 'DU-46') {
      const submissionData = { ...base };
      if (submissionData.malfunction_desc === "Boshqa (Qo'lda kiritish)") {
        submissionData.malfunction_desc = formData.malfunction_desc_custom || '';
      }
      return {
        ...submissionData,
        journal_status: 'open',
        dutyLabel: type.code,
        dutyTime: formatToSubmissionDate(new Date())
      };
    }
    return { ...base, dutyLabel: type.code, dutyTime: formatToSubmissionDate(new Date()) };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/journals/entries', { journalTypeId: type._id, data: buildSubmissionData() });
      setSuccess(true);
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  if (!type) return null;

  return (
    <div className="journal-1c-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">{type.name} ({type.code}) {du2Action ? `- ${du2Action}` : ''}</h2>
        <div className="text-muted" style={{ fontSize: '11px' }}>
          Stansiya: <b>{station?.name} {station?.stationCode && `(${station.stationCode})`}</b>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <div className={`journal-1c-card ${station?.distance ? `distance-glow-${station.distance}` : ''}`}>
          {(type.code === 'DU-5' || type.code === 'DU-8' || type.code === 'DU-46') && (
            <div className="journal-1c-form-group">
              <label>{type.code === 'DU-46' ? 'Nosozlik haqida xabar berilgan vaqt' : 'Kirish vaqti'}:</label>
              <input 
                type="datetime-local" 
                className="journal-1c-input" 
                required
                value={formData.record_time || ''}
                onChange={(e) => handleInputChange('record_time', e.target.value)}
              />
            </div>
          )}

          {type.code === 'DU-2' && (
            <div className="journal-1c-form-group">
              <label>Harakat vaqti:</label>
              <input 
                type="datetime-local" 
                className="journal-1c-input" 
                required
                value={formData.event_time || ''}
                onChange={(e) => handleInputChange('event_time', e.target.value)}
              />
            </div>
          )}

          {type.code === 'DU-19' && (
            <>
              <div className="journal-1c-form-group">
                <label>Tartib raqami:</label>
                <input type="number" className="journal-1c-input" required value={formData.order_number || ''} onChange={(e) => handleInputChange('order_number', e.target.value)} />
              </div>
              <div className="journal-1c-form-group">
                <label>Qayd vaqti:</label>
                <input type="datetime-local" className="journal-1c-input" required value={formData.record_time || ''} onChange={(e) => handleInputChange('record_time', e.target.value)} />
              </div>
              <div className="journal-1c-form-group">
                <label>Amalga oshirilgan vaqt:</label>
                <input type="datetime-local" className="journal-1c-input" required value={formData.completion_time || ''} onChange={(e) => handleInputChange('completion_time', e.target.value)} />
              </div>
              <div className="journal-1c-form-group">
                <label>Tugash vaqti:</label>
                <input type="datetime-local" className="journal-1c-input" required value={formData.end_time || ''} onChange={(e) => handleInputChange('end_time', e.target.value)} />
              </div>
              <div className="journal-1c-form-group">
                <label>Vagonlar soni:</label>
                <input type="number" className="journal-1c-input" required value={formData.wagon_count || ''} onChange={(e) => handleInputChange('wagon_count', e.target.value)} />
              </div>
              <div className="journal-1c-form-group">
                <label>Svetofor koʻrsatmasi:</label>
                <input type="text" className="journal-1c-input" required value={formData.traffic_light || ''} onChange={(e) => handleInputChange('traffic_light', e.target.value)} />
              </div>
              <div className="journal-1c-form-group">
                <label>Boshlanish manzili:</label>
                <input type="number" className="journal-1c-input" required value={formData.start_route || ''} onChange={(e) => handleInputChange('start_route', e.target.value)} />
              </div>
              <div className="journal-1c-form-group">
                <label>Tugash manzili:</label>
                <input type="number" className="journal-1c-input" required value={formData.end_route || ''} onChange={(e) => handleInputChange('end_route', e.target.value)} />
              </div>
              <div className="journal-1c-form-group">
                <label>Xodim F.I.Sh:</label>
                <input type="text" className="journal-1c-input" required value={formData.employee_name || ''} onChange={(e) => handleInputChange('employee_name', e.target.value)} />
              </div>
              <div className="journal-1c-form-group">
                <label>Lavozimi:</label>
                <input type="text" className="journal-1c-input" required value={formData.position || ''} onChange={(e) => handleInputChange('position', e.target.value)} />
              </div>
            </>
          )}

          {type.fields?.filter(f => f.name !== 'action_type' && !['event_time', 'record_time', 'completion_time', 'wagon_count', 'traffic_light', 'start_route', 'end_route', 'employee_name', 'position'].includes(f.name)).map((field) => (
            <div key={field.name} className="journal-1c-form-group">
              <label>{field.label}: {field.required && <span className="text-danger">*</span>}</label>
              {field.name === 'notification_method' && type.code === 'DU-46' ? (
                <div className="d-flex gap-4 mt-1">
                  {field.options.map(opt => (
                    <div key={opt} className="d-flex align-items-center gap-2">
                      <input 
                        type="radio" 
                        id={`radio-${opt}`}
                        name="notification_method" 
                        value={opt} 
                        checked={formData[field.name] === opt}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                      />
                      <label htmlFor={`radio-${opt}`} className="m-0" style={{ fontWeight: 'normal' }}>{opt}</label>
                    </div>
                  ))}
                </div>
              ) : field.type === 'textarea' ? (
                <textarea 
                  className="journal-1c-input" 
                  style={{ width: '450px', height: '60px' }}
                  required={field.required}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                />
              ) : field.type === 'select' ? (
                <div className="d-flex flex-column gap-2">
                  <select 
                    className="journal-1c-input" 
                    required={field.required} 
                    value={formData[field.name] || ''} 
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  >
                    <option value="">-- Tanlang --</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {field.name === 'malfunction_desc' && formData[field.name] === "Boshqa (Qo'lda kiritish)" && (
                    <textarea 
                      className="journal-1c-input" 
                      style={{ width: '450px', height: '60px' }}
                      placeholder="Nosozlik turini kiriting..."
                      required
                      value={formData.malfunction_desc_custom || ''}
                      onChange={(e) => handleInputChange('malfunction_desc_custom', e.target.value)}
                    />
                  )}
                </div>
              ) : field.type === 'datetime' ? (
                <input type="datetime-local" className="journal-1c-input" required={field.required} value={formData[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)} />
              ) : field.type === 'date' ? (
                <input type="date" className="journal-1c-input" required={field.required} value={formData[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)} />
              ) : field.type === 'boolean' ? (
                <input type="checkbox" checked={formData[field.name] || false} onChange={(e) => handleInputChange(field.name, e.target.checked)} />
              ) : (
                <input type={field.type === 'number' ? 'number' : 'text'} className="journal-1c-input" required={field.required} value={formData[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)} />
              )}
            </div>
          ))}
        </div>

        {type.code === 'DU-5' && (
          <div className={`journal-1c-card mt-3 ${station?.distance ? `distance-glow-${station.distance}` : ''}`}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="m-0" style={{ fontSize: '14px' }}>Xodimlar roʻyxati</h5>
              <button type="button" className="journal-1c-btn" onClick={addPersonnelRow}><Plus size={14} /> Qoʻshish</button>
            </div>
            <table className="journal-1c-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>№</th>
                  <th>Guvohnoma raqami</th>
                  <th>Toʻliq F.I.SH</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {personnelRows.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td><input type="text" className="journal-1c-input w-100" style={{ border: 'none', padding: '0' }} value={row.certificateId} onChange={(e) => handlePersonnelChange(index, 'certificateId', e.target.value)} /></td>
                    <td><input type="text" className="journal-1c-input w-100" style={{ border: 'none', padding: '0' }} value={row.fullName} onChange={(e) => handlePersonnelChange(index, 'fullName', e.target.value)} /></td>
                    <td>
                      <button type="button" className="text-danger border-0 bg-transparent" onClick={() => removePersonnelRow(index)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && <Alert variant="danger" className="py-2 px-3 mt-3" style={{ fontSize: '12px' }}>{error}</Alert>}
        
        <div className="d-flex gap-2 mt-4">
          <button type="submit" className="journal-1c-btn journal-1c-btn-primary" disabled={loading || success}>
            {loading ? <Spinner animation="border" size="sm" /> : <Save size={14} />} {success ? 'Saqlandi' : 'Saqlash (F2)'}
          </button>
          <button type="button" className="btn-metro-back" onClick={() => onSuccess()} disabled={loading}>
            <X size={16} strokeWidth={3} /> Yopish
          </button>
        </div>
      </Form>
    </div>
  );
};

export default JournalForm;
