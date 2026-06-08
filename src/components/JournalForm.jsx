import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { Save, Plus, Trash2, X } from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import DU5TemplatePanel from './DU5TemplatePanel';
import DU46TemplatePanel from './DU46TemplatePanel';

// ─── Main JournalForm ──────────────────────────────────────────────────────────
const JournalForm = ({ type, onSuccess, du2Action }) => {
  const { station } = useAuthStore();
  const [formData, setFormData] = useState({});
  const [personnelRows, setPersonnelRows] = useState([{ certificateId: '', fullName: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showOtherEmployee, setShowOtherEmployee] = useState(false);
  const [stations, setStations] = useState([]);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [customTrackValue, setCustomTrackValue] = useState('');
  const [showEntranceModal, setShowEntranceModal] = useState(false);
  const [customEntranceValue, setCustomEntranceValue] = useState('');
  // ─── DU-5: kirish va chiqish bekat maydonlarini shablon bilan bog'lash ──────
  const [linkedByTemplate, setLinkedByTemplate] = useState(false);
  const [suggestions, setSuggestions] = useState({
    traffic_light: [],
    employee_name: [],
    position: []
  });

  useEffect(() => {
    if (type?.code === 'DU-19') {
      try {
        const trafficLights = JSON.parse(localStorage.getItem('du19_suggestions_traffic_light')) || [];
        const employeeNames = JSON.parse(localStorage.getItem('du19_suggestions_employee_name')) || [];
        const positions = JSON.parse(localStorage.getItem('du19_suggestions_position')) || [];
        setSuggestions({
          traffic_light: trafficLights,
          employee_name: employeeNames,
          position: positions
        });
      } catch (e) {
        console.error('Error loading suggestions:', e);
      }
    }
  }, [type]);

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
        end_time: localNow,
        traffic_light: '',
        employee_name: '',
        position: ''
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
    setShowOtherEmployee(false);
  }, [type, du2Action]);

  const handleInputChange = (name, value) => {
    if (name === 'track_id' && value === "Qo'lda kiritish") {
      setShowTrackModal(true);
      return;
    }
    if (name === 'entrance_door' && value === "Qo'lda kiritish") {
      setShowEntranceModal(true);
      return;
    }
    // ─── Kirish/chiqish bekat linked mantiq ──────────────────────────────────
    if (name === 'entrance_door' || name === 'exit_location') {
      setLinkedByTemplate(false); // Qo'lda o'zgartirildi → bog'lanishni uzish
      // Bir xil bekat tanlanmasin: kirish va chiqish bekat bir xil bo'lsa chiqish tozalanadi
      if (name === 'entrance_door' && value && value === formData.exit_location) {
        setFormData(prev => ({ ...prev, entrance_door: value, exit_location: '' }));
        return;
      }
      if (name === 'exit_location' && value && value === formData.entrance_door) {
        setFormData(prev => ({ ...prev, exit_location: value, entrance_door: '' }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTrackModalConfirm = () => {
    if (customTrackValue.trim()) {
      setFormData(prev => ({ ...prev, track_id: customTrackValue.trim() }));
      setShowTrackModal(false);
      setCustomTrackValue('');
    }
  };

  const handleEntranceModalConfirm = () => {
    if (customEntranceValue.trim()) {
      setFormData(prev => ({ ...prev, entrance_door: customEntranceValue.trim() }));
      setShowEntranceModal(false);
      setCustomEntranceValue('');
    }
  };

  const getFieldOptions = (field) => {
    if (field.name === 'exit_location') {
      const currentStationName = station?.name;
      const allStations = stations.length > 0 ? stations : field.options;
      const sorted = [...allStations].sort((a, b) => {
        if (a === currentStationName) return -1;
        if (b === currentStationName) return 1;
        return a.localeCompare(b, 'uz');
      });
      return sorted;
    }
    return field.options || [];
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

    if (type?.code === 'DU-19') {
      if (formData.completion_time && formData.end_time) {
        if (new Date(formData.end_time) < new Date(formData.completion_time)) {
          setError("Tugash vaqti boshlanish (amalga oshirilgan) vaqtidan oldin bo'lishi mumkin emas!");
          setLoading(false);
          return;
        }
      }
    }

    try {
      await axios.post('/journals/entries', { journalTypeId: type._id, data: buildSubmissionData() });
      
      if (type?.code === 'DU-19') {
        const saveSuggestion = (key, val) => {
          if (!val || !val.trim()) return;
          const trimmed = val.trim();
          try {
            const existing = JSON.parse(localStorage.getItem(key)) || [];
            const filtered = existing.filter(x => x !== trimmed);
            const updated = [trimmed, ...filtered].slice(0, 5);
            localStorage.setItem(key, JSON.stringify(updated));
          } catch (e) {
            localStorage.setItem(key, JSON.stringify([trimmed]));
          }
        };

        saveSuggestion('du19_suggestions_traffic_light', formData.traffic_light);
        saveSuggestion('du19_suggestions_employee_name', formData.employee_name);
        saveSuggestion('du19_suggestions_position', formData.position);
      }

      setSuccess(true);
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  if (!type) return null;

  // ─── Handle template apply for DU-5 ─────────────────────────────────────────
  const handleTemplateApply = (values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    // Agar kirish yoki chiqish bekat shablon orqali kelgan bo'lsa → bog'lash belgisini o'rnatish
    if (values.entrance_door || values.exit_location) {
      setLinkedByTemplate(true);
    }
  };

  const handleDU46TemplateApply = (text) => {
    setFormData((prev) => ({
      ...prev,
      malfunction_desc: "Boshqa (Qo'lda kiritish)",
      malfunction_desc_custom: text
    }));
  };

  return (
    <div className="journal-1c-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">{type.name} ({type.code}) {du2Action ? `- ${du2Action}` : ''}</h2>
        <div className="text-muted" style={{ fontSize: '11px' }}>
          Stansiya: <b>{station?.name} {station?.stationCode && `(${station.stationCode})`}</b>
        </div>
      </div>

      {/* DU-5 & DU-46: two-column layout with template panel on the right */}
      {type.code === 'DU-5' || type.code === 'DU-46' ? (
        <div className="du5-split-layout">
          {/* ── Left: form ── */}
          <div className="du5-form-col">
            <Form onSubmit={handleSubmit}>
              <div className={`journal-1c-card ${station?.distance ? `distance-glow-${station.distance}` : ''}`}>
                {/* DU-5 / DU-46: Kirish/Xabar vaqti */}
                <div className="journal-1c-form-group">
                  <label>{type.code === 'DU-46' ? 'Nosozlik haqida xabar berilgan vaqt:' : 'Kirish vaqti:'}</label>
                  <input
                    type="datetime-local"
                    className="journal-1c-input"
                    required
                    value={formData.record_time || ''}
                    onChange={(e) => handleInputChange('record_time', e.target.value)}
                  />
                </div>

                {/* DU-5 / DU-46: Dynamic fields from type.fields */}
                {type.fields?.filter(f => f.name !== 'action_type' && f.name !== 'record_time').map((field) => {
                  const isLinkedField = (field.name === 'entrance_door' || field.name === 'exit_location') && linkedByTemplate;
                  return (
                    <React.Fragment key={field.name}>
                      <div className={`journal-1c-form-group${isLinkedField ? ' du5-linked-field-group' : ''}`}>
                        <label>
                          {field.label}: {field.required && <span className="text-danger">*</span>}
                          {/* Maqsad / Nosozlik maydon: shablon badge */}
                          {((field.name === 'purpose' && formData.purpose) || (field.name === 'malfunction_desc' && formData.malfunction_desc === "Boshqa (Qo'lda kiritish)" && formData.malfunction_desc_custom)) && (
                            <span className="du5-purpose-filled-badge">✓ Shablon qo'llanildi</span>
                          )}
                          {/* Kirish/chiqish bekat: bog'liq badge */}
                          {isLinkedField && (
                            <span className="du5-linked-badge">
                              🔗 {field.name === 'entrance_door' ? 'Kirish → Chiqish bog\'liq' : 'Chiqish → Kirish bog\'liq'}
                            </span>
                          )}
                        </label>
                        {field.name === 'notification_method' && type.code === 'DU-46' ? (
                          <div className="d-flex gap-4 mt-1">
                            {field.options.map(opt => (
                              <div key={opt} className="d-flex align-items-center gap-2">
                                <input type="radio" id={`radio-${opt}`} name="notification_method" value={opt} checked={formData[field.name] === opt} onChange={(e) => handleInputChange(field.name, e.target.value)} />
                                <label htmlFor={`radio-${opt}`} className="m-0" style={{ fontWeight: 'normal' }}>{opt}</label>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            className="journal-1c-input du5-purpose-input"
                            style={{ maxWidth: '480px', width: '100%', height: '80px' }}
                            required={field.required}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.name === 'purpose' ? 'Shablondan tanlang yoki bu yerga yozing...' : ''}
                          />
                        ) : field.type === 'select' ? (
                          <div className="d-flex flex-column gap-2">
                            <div className="d-flex">
                              <select
                                className={`journal-1c-input${isLinkedField ? ' du5-linked-select' : ''}`}
                                required={field.required}
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                              >
                                <option value="">-- Tanlang --</option>
                                {getFieldOptions(field).map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                                {formData[field.name] && !getFieldOptions(field).includes(formData[field.name]) && (
                                  <option value={formData[field.name]}>{formData[field.name]}</option>
                                )}
                              </select>
                              {field.name === 'malfunction_desc' && (
                                <button type="button" style={{ borderRadius: '8px', borderColor: '#E97C19', background: showOtherEmployee ? '#E97C19' : 'transparent', color: showOtherEmployee ? 'white' : '#E97C19', minWidth: '250px', height: '32px', fontSize: '12px', fontWeight: '700', marginLeft: '10px', border: '1.5px solid #E97C19', transition: 'all 0.3s ease' }} onClick={() => setShowOtherEmployee(!showOtherEmployee)}>
                                  {showOtherEmployee ? "Bekor qilish" : "Qayd boshqa xodim tomonidan kiritiladi"}
                                </button>
                              )}
                            </div>
                            {field.name === 'malfunction_desc' && formData[field.name] === "Boshqa (Qo'lda kiritish)" && (
                              <textarea 
                                className="journal-1c-input du5-purpose-input" 
                                style={{ maxWidth: '480px', width: '100%', height: '100px' }} 
                                placeholder="Shablondan tanlang yoki nosozlik turini kiriting..." 
                                required 
                                value={formData.malfunction_desc_custom || ''} 
                                onChange={(e) => handleInputChange('malfunction_desc_custom', e.target.value)} 
                              />
                            )}
                            {/* Bog'liq juft bekat ko'rsatkichi */}
                            {field.name === 'entrance_door' && linkedByTemplate && formData.exit_location && (
                              <div className="du5-pair-connector">
                                <span className="du5-pair-arrow">↕</span>
                                <span className="du5-pair-note">Chiqish: <b>{formData.exit_location}</b></span>
                              </div>
                            )}
                            {field.name === 'exit_location' && linkedByTemplate && formData.entrance_door && (
                              <div className="du5-pair-connector">
                                <span className="du5-pair-arrow">↕</span>
                                <span className="du5-pair-note">Kirish: <b>{formData.entrance_door}</b></span>
                              </div>
                            )}
                          </div>
                        ) : field.type === 'datetime' ? (
                          <input type="datetime-local" className="journal-1c-input" required={field.required} value={formData[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)} />
                        ) : field.type === 'date' ? (
                          <input type="date" className="journal-1c-input" required={field.required} value={formData[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)} />
                        ) : field.type === 'boolean' ? (
                          <input type="checkbox" checked={formData[field.name] || false} onChange={(e) => handleInputChange(field.name, e.target.checked)} />
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            className="journal-1c-input"
                            required={field.required}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          />
                        )}
                      </div>

                      {field.name === 'malfunction_desc' && showOtherEmployee && (
                        <div className="journal-security-alert-card" style={{ marginLeft: type.code === 'DU-46' ? '0' : '220px' }}>
                          <h6>Qayd kirituvchi xodim login va paroli</h6>
                          <div className="mb-3">
                            <label>Login:</label>
                            <input type="text" className="journal-1c-input w-100" placeholder="Loginni kiriting" value={formData.other_login || ''} onChange={(e) => handleInputChange('other_login', e.target.value)} />
                          </div>
                          <div>
                            <label>Parol:</label>
                            <div className="d-flex flex-column">
                              <input type="password" className="journal-1c-input w-100" placeholder="Parolni kiriting" style={{ borderColor: '#E97C19', borderWidth: '1.5px' }} value={formData.other_password || ''} onChange={(e) => handleInputChange('other_password', e.target.value)} />
                              <Alert variant="danger" className="py-1 px-2 mt-2 mb-0" style={{ fontSize: '10px', borderLeft: '3px solid red' }}>Parolni xodim shaxsan kiritishi kerak.</Alert>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* DU-5 specific: Personnel list */}
              {type.code === 'DU-5' && (
                <div className={`journal-1c-card mt-3 ${station?.distance ? `distance-glow-${station.distance}` : ''}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="m-0" style={{ fontSize: '14px' }}>Xodimlar roʻyxati</h5>
                    <button type="button" className="journal-1c-btn" onClick={addPersonnelRow}><Plus size={14} /> Qoʻshish</button>
                  </div>
                  <div className="table-responsive custom-scrollbar">
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

          {/* ── Right: template panel ── */}
          <div className="du5-template-col">
            {type.code === 'DU-5' ? (
              <DU5TemplatePanel onApply={handleTemplateApply} stations={stations} />
            ) : (
              <DU46TemplatePanel mode="zapis" onApply={handleDU46TemplateApply} stations={stations} />
            )}
          </div>
        </div>
      ) : (
        /* ── Non-DU-5: original single-column layout ── */
        <Form onSubmit={handleSubmit}>
          <div className={`journal-1c-card ${station?.distance ? `distance-glow-${station.distance}` : ''}`}>
            {(type.code === 'DU-8' || type.code === 'DU-46') && (
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
                  <input disabled type="number" className="journal-1c-input" required value={formData.order_number || ''} onChange={(e) => handleInputChange('order_number', e.target.value)} />
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
                  <label>Svetofor:</label>
                  <input type="text" className="journal-1c-input" required value={formData.traffic_light || ''} onChange={(e) => handleInputChange('traffic_light', e.target.value)} list="traffic-light-suggestions" autoComplete="off" />
                  <datalist id="traffic-light-suggestions">
                    {suggestions.traffic_light.map((val) => (<option key={val} value={val} />))}
                  </datalist>
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
                  <input type="text" className="journal-1c-input" required value={formData.employee_name || ''} onChange={(e) => handleInputChange('employee_name', e.target.value)} list="employee-name-suggestions" autoComplete="off" />
                  <datalist id="employee-name-suggestions">
                    {suggestions.employee_name.map((val) => (<option key={val} value={val} />))}
                  </datalist>
                </div>
                <div className="journal-1c-form-group">
                  <label>Lavozimi:</label>
                  <input type="text" className="journal-1c-input" required value={formData.position || ''} onChange={(e) => handleInputChange('position', e.target.value)} list="position-suggestions" autoComplete="off" />
                  <datalist id="position-suggestions">
                    {suggestions.position.map((val) => (<option key={val} value={val} />))}
                  </datalist>
                </div>
              </>
            )}

            {type.fields?.filter(f => f.name !== 'action_type' && !['event_time', 'record_time', 'completion_time', 'end_time', 'order_number', 'wagon_count', 'traffic_light', 'start_route', 'end_route', 'employee_name', 'position'].includes(f.name)).map((field) => (
              <React.Fragment key={field.name}>
                <div className="journal-1c-form-group">
                <label>{field.label}: {field.required && <span className="text-danger">*</span>}</label>
                {field.name === 'notification_method' && type.code === 'DU-46' ? (
                  <div className="d-flex gap-4 mt-1">
                    {field.options.map(opt => (
                      <div key={opt} className="d-flex align-items-center gap-2">
                        <input type="radio" id={`radio-${opt}`} name="notification_method" value={opt} checked={formData[field.name] === opt} onChange={(e) => handleInputChange(field.name, e.target.value)} />
                        <label htmlFor={`radio-${opt}`} className="m-0" style={{ fontWeight: 'normal' }}>{opt}</label>
                      </div>
                    ))}
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea className="journal-1c-input" style={{ maxWidth: '480px', width: '100%', height: '60px' }} required={field.required} value={formData[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)} />
                ) : field.type === 'select' ? (
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex">
                      <select className="journal-1c-input" required={field.required} value={formData[field.name] || ''} onChange={(e) => handleInputChange(field.name, e.target.value)}>
                        <option value="">-- Tanlang --</option>
                        {getFieldOptions(field).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        {field.name === 'track_id' && formData[field.name] && !getFieldOptions(field).includes(formData[field.name]) && (<option value={formData[field.name]}>{formData[field.name]}</option>)}
                        {field.name === 'entrance_door' && formData[field.name] && !getFieldOptions(field).includes(formData[field.name]) && (<option value={formData[field.name]}>{formData[field.name]}</option>)}
                      </select>
                      {field.name === 'malfunction_desc' && (
                        <button type="button" style={{ borderRadius: '8px', borderColor: '#E97C19', background: showOtherEmployee ? '#E97C19' : 'transparent', color: showOtherEmployee ? 'white' : '#E97C19', minWidth: '250px', height: '32px', fontSize: '12px', fontWeight: '700', marginLeft: '10px', border: '1.5px solid #E97C19', transition: 'all 0.3s ease' }} onClick={() => setShowOtherEmployee(!showOtherEmployee)}>
                          {showOtherEmployee ? "Bekor qilish" : "Qayd boshqa xodim tomonidan kiritiladi"}
                        </button>
                      )}
                    </div>
                    {field.name === 'malfunction_desc' && formData[field.name] === "Boshqa (Qo'lda kiritish)" && (
                      <textarea className="journal-1c-input" style={{ maxWidth: '480px', width: '100%', height: '60px' }} placeholder="Nosozlik turini kiriting..." required value={formData.malfunction_desc_custom || ''} onChange={(e) => handleInputChange('malfunction_desc_custom', e.target.value)} />
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

              {field.name === 'malfunction_desc' && showOtherEmployee && (
                <div className="journal-security-alert-card">
                  <h6>Qayd kirituvchi xodim login va paroli</h6>
                  <div className="mb-3">
                    <label>Login:</label>
                    <input type="text" className="journal-1c-input w-100" placeholder="Loginni kiriting" value={formData.other_login || ''} onChange={(e) => handleInputChange('other_login', e.target.value)} />
                  </div>
                  <div>
                    <label>Parol:</label>
                    <div className="d-flex flex-column">
                      <input type="password" className="journal-1c-input w-100" placeholder="Parolni kiriting" style={{ borderColor: '#E97C19', borderWidth: '1.5px' }} value={formData.other_password || ''} onChange={(e) => handleInputChange('other_password', e.target.value)} />
                      <Alert variant="danger" className="py-1 px-2 mt-2 mb-0" style={{ fontSize: '10px', borderLeft: '3px solid red' }}>Parolni xodim shaxsan kiritishi kerak.</Alert>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
          </div>

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
      )}

      <Modal show={showTrackModal} onHide={() => setShowTrackModal(false)} centered>
        <Modal.Header closeButton style={{ background: '#f8f9fa', borderBottom: '2px solid #0056b3' }}>
          <Modal.Title style={{ color: '#0056b3', fontWeight: 'bold' }}>Yo'lni qo'lda kiritish</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group>
            <Form.Label style={{ fontWeight: '500', marginBottom: '10px' }}>Yo'l raqami yoki nomini kiriting:</Form.Label>
            <Form.Control 
              type="text" 
              className="journal-1c-input w-100"
              style={{ height: '45px', fontSize: '16px' }}
              value={customTrackValue} 
              onChange={(e) => setCustomTrackValue(e.target.value)}
              placeholder="Masalan: 3A, 4B, 11..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTrackModalConfirm();
                }
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ background: '#f8f9fa' }}>
          <Button variant="secondary" onClick={() => setShowTrackModal(false)}>
            Bekor qilish
          </Button>
          <Button 
            style={{ background: '#0056b3', borderColor: '#0056b3' }}
            onClick={handleTrackModalConfirm}
            disabled={!customTrackValue.trim()}
          >
            Tasdiqlash
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEntranceModal} onHide={() => setShowEntranceModal(false)} centered>
        <Modal.Header closeButton style={{ background: '#f8f9fa', borderBottom: '2px solid #0056b3' }}>
          <Modal.Title style={{ color: '#0056b3', fontWeight: 'bold' }}>Eshikni qo'lda kiritish</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group>
            <Form.Label style={{ fontWeight: '500', marginBottom: '10px' }}>Eshik raqami yoki nomini kiriting:</Form.Label>
            <Form.Control 
              type="text" 
              className="journal-1c-input w-100"
              style={{ height: '45px', fontSize: '16px' }}
              value={customEntranceValue} 
              onChange={(e) => setCustomEntranceValue(e.target.value)}
              placeholder="Masalan: 5-eshik, Maxsus..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleEntranceModalConfirm();
                }
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ background: '#f8f9fa' }}>
          <Button variant="secondary" onClick={() => setShowEntranceModal(false)}>
            Bekor qilish
          </Button>
          <Button 
            style={{ background: '#0056b3', borderColor: '#0056b3' }}
            onClick={handleEntranceModalConfirm}
            disabled={!customEntranceValue.trim()}
          >
            Tasdiqlash
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JournalForm;
