import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Save, X, ChevronRight, Activity, Calendar, Hash, MapPin, ClipboardList, AlertCircle, CheckCircle2, Plus, PlusCircle } from 'lucide-react';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import { Spinner, Alert } from 'react-bootstrap';

const JournalEU132 = ({ type, onSuccess, onCancel }) => {
  const { station } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/journals/entries/latest/eu132');
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0]);
        if (data[0].items.length > 0) {
          setSelectedItem(data[0].items[0]);
          setFormData(data[0].items[0].data);
        }
      }
    } catch (err) {
      console.error('Error fetching EU-132 data:', err);
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    if (cat.items.length > 0) {
      setSelectedItem(cat.items[0]);
      setFormData(cat.items[0].data);
    } else {
      setSelectedItem(null);
      setFormData({});
    }
    setError('');
    setSuccess(false);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData(item.data);
    setError('');
    setSuccess(false);
  };

  const handleAddNew = () => {
    setSelectedItem({ isNew: true });
    setFormData({
      registration_type: 'Sinovni rasmiylashtirish',
      equipment_name: selectedCategory.category,
      equipment_number: '',
      location: '',
      last_test_date: '',
      protocol_number: '',
      next_test_date: '',
      interval: '',
      comment: ''
    });
    setError('');
    setSuccess(false);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const submissionData = {
        ...formData,
        recordedAt: new Date().toLocaleString('uz-UZ'),
        stationName: station?.name
      };

      await axios.post('/journals/entries', { 
        journalTypeId: type._id, 
        data: submissionData
      });
      
      setSuccess(true);
      // Refresh data to show the newly added/updated item
      await fetchData();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Saqlashda xatolik yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center p-20">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="archive-epic-layout" style={{ height: 'auto', minHeight: '650px' }}>
      
      {/* Column 1: Categories */}
      <div className="archive-column col-types" style={{ width: '280px' }}>
        <div className="column-header">
          <Shield size={18} className="header-icon" />
          <h5>Himoya vositalari</h5>
        </div>
        <div className="types-list custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.category}
              className={`type-btn-epic ${selectedCategory?.category === cat.category ? 'active' : ''}`}
              onClick={() => handleSelectCategory(cat)}
            >
              <div className="type-info">
                <span className="type-code" style={{ fontSize: '0.8rem' }}>{cat.category}</span>
              </div>
              <div className="type-meta">
                <ChevronRight size={16} className="arrow-icon" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: Specific Items */}
      <div className="archive-column col-types" style={{ width: '280px' }}>
        <div className="column-header space-between">
          <div className="d-flex align-items-center gap-2">
            <ClipboardList size={18} className="header-icon" />
            <h5 className="capitalize">
              {selectedCategory?.category?.toLowerCase().includes('qo`lqop') ? 'Qo\'lqoplar' : 
               selectedCategory?.category?.toLowerCase().includes('galosh') ? 'Galoshlar' : 
               'Vositalar'}
            </h5>
          </div>
        </div>
        <div className="types-list custom-scrollbar">
          <button 
            className="type-btn-epic mb-2" 
            style={{ background: 'var(--metro-accent-glass)', borderColor: 'var(--metro-accent)' }}
            onClick={handleAddNew}
          >
            <div className="type-info">
              <span className="type-code" style={{ color: 'var(--metro-accent)' }}>Yangi Qo'shish</span>
              <span className="type-name">{selectedCategory?.category?.split(' ')[1]} qo'shish</span>
            </div>
            <Plus size={18} className="text-primary" />
          </button>
          
          {selectedCategory?.items.map((item) => (
            <button
              key={item.data.equipment_number}
              className={`type-btn-epic ${selectedItem?.data?.equipment_number === item.data.equipment_number ? 'active' : ''}`}
              onClick={() => handleSelectItem(item)}
            >
              <div className="type-info">
                <span className="type-code">№ {item.data.equipment_number}</span>
                <span className="type-name">{item.data.location}</span>
              </div>
              <div className="type-meta">
                <ChevronRight size={16} className="arrow-icon" />
              </div>
            </button>
          ))}

          {selectedCategory?.items.length === 0 && !selectedItem?.isNew && (
            <div className="p-4 text-center opacity-40 italic text-xs">
              Ushbu turdagi vositalar hali kiritilmagan
            </div>
          )}
        </div>
      </div>

      {/* Column 3: Form */}
      <div className="archive-column flex-1">
        <div className="column-header space-between">
          <div className="d-flex align-items-center gap-2">
            <h5>{selectedItem?.isNew ? "Yangi Ma'lumot" : "Tafsilotlar"}</h5>
            {selectedItem && (
               <span className="selected-type-badge">
                 {selectedItem.isNew ? "Yangi" : `№ ${selectedItem.data.equipment_number}`}
               </span>
            )}
          </div>
          <div className="results-count">
             {selectedCategory?.category}
          </div>
        </div>
        
        <div className="custom-scrollbar p-6" style={{ overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.isNew ? 'new' : selectedItem.data.equipment_number}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSubmit} className="eu132-modern-form">
                  <div className="registration-type-selector mb-8">
                    <div className="d-flex gap-2 p-1 bg-metro-input-bg rounded-2xl border border-metro-glass-border">
                      <button
                        type="button"
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formData.registration_type === 'Sinovni rasmiylashtirish' ? 'bg-primary text-white shadow-lg' : 'text-metro-fg opacity-40 hover:opacity-100'}`}
                        onClick={() => handleInputChange('registration_type', 'Sinovni rasmiylashtirish')}
                        style={{ color: formData.registration_type === 'Sinovni rasmiylashtirish' ? 'white' : 'var(--metro-fg)' }}
                      >
                        Sinovni rasmiylashtirish
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formData.registration_type === 'Ko`rikni rasmiylashtirish' ? 'bg-primary text-white shadow-lg' : 'text-metro-fg opacity-40 hover:opacity-100'}`}
                        onClick={() => handleInputChange('registration_type', 'Ko`rikni rasmiylashtirish')}
                        style={{ color: formData.registration_type === 'Ko`rikni rasmiylashtirish' ? 'white' : 'var(--metro-fg)' }}
                      >
                        Ko`rikni rasmiylashtirish
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="form-group-modern">
                      <label><Hash size={14} /> Himoya vositasi raqami</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.equipment_number || ''}
                        onChange={(e) => handleInputChange('equipment_number', e.target.value)}
                        placeholder="Masalan: G-123"
                      />
                    </div>

                    <div className="form-group-modern">
                      <label><MapPin size={14} /> Joylashgan o'rni</label>
                      <select 
                        required 
                        value={formData.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="eu132-input"
                      >
                        <option value="">-- Tanlang --</option>
                        <option value="Bekat boshlig‘i xonasi">Bekat boshlig‘i xonasi</option>
                        <option value="Bekat navbatchisi xonasi">Bekat navbatchisi xonasi</option>
                        <option value="Blok-post xonasi">Blok-post xonasi</option>
                        <option value="Kub xonasi">Kub xonasi</option>
                        <option value="Quritish shkafida">Quritish shkafida</option>
                      </select>
                    </div>

                    <div className="form-group-modern">
                      <label><Calendar size={14} /> Oxirgi sinov sanasi</label>
                      <input 
                        type="date" 
                        required 
                        value={formData.last_test_date || ''}
                        onChange={(e) => handleInputChange('last_test_date', e.target.value)}
                      />
                    </div>

                    <div className="form-group-modern">
                      <label><ClipboardList size={14} /> Bayonnoma raqami</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.protocol_number || ''}
                        onChange={(e) => handleInputChange('protocol_number', e.target.value)}
                        placeholder="Bayonnoma №"
                      />
                    </div>

                    <div className="form-group-modern">
                      <label><Calendar size={14} /> Keyingi tekshiruv sanasi</label>
                      <input 
                        type="date" 
                        required 
                        value={formData.next_test_date || ''}
                        onChange={(e) => handleInputChange('next_test_date', e.target.value)}
                      />
                    </div>

                    <div className="form-group-modern">
                      <label><Activity size={14} /> Ko`rikdan o`tkazish davriyligi</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.interval || ''}
                        onChange={(e) => handleInputChange('interval', e.target.value)}
                        placeholder="Masalan: 6 oy"
                      />
                    </div>
                  </div>

                  <div className="form-group-modern mb-6">
                    <label><AlertCircle size={14} /> Izoh</label>
                    <textarea 
                      style={{ minHeight: '80px' }}
                      value={formData.comment || ''}
                      onChange={(e) => handleInputChange('comment', e.target.value)}
                      placeholder="Qo'shimcha ma'lumotlar..."
                    />
                  </div>

                  {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                  {success && <Alert variant="success" className="mb-4 flex items-center gap-2"><CheckCircle2 size={18} /> Muvaffaqiyatli saqlandi!</Alert>}

                  <div className="d-flex gap-3">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="btn-metro-primary !py-3 !px-8"
                    >
                      {saving ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                      <span>{selectedItem.isNew ? "Qo'shish" : "Saqlash"}</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={onCancel}
                      className="btn-metro-ghost !py-3 !px-8"
                    >
                      <X size={18} />
                      <span>Yopish</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="h-full d-flex flex-column align-items-center justify-content-center opacity-30 py-20">
                <PlusCircle size={60} className="mb-4" />
                <h4 className="font-black text-uppercase">Vositani tanlang yoki yangi qo'shing</h4>
                <p className="text-sm">Ma'lumotlarni ko'rish uchun chapdagi ro'yxatdan foydalaning</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .eu132-modern-form {
          .form-group-modern {
            display: flex;
            flex-direction: column;
            gap: 8px;
            
            label {
              font-size: 0.7rem;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--metro-text-muted);
              display: flex;
              align-items: center;
              gap: 6px;
              margin-left: 4px;
            }
            
            input, textarea {
              background: var(--metro-input-bg);
              border: 1px solid var(--metro-glass-border);
              border-radius: 1rem;
              padding: 0.8rem 1.2rem;
              color: var(--metro-fg);
              font-weight: 600;
              font-size: 0.95rem;
              transition: all 0.3s ease;
              outline: none;
              
              &:focus {
                border-color: var(--metro-accent);
                background: var(--metro-glass);
                box-shadow: 0 0 0 4px var(--metro-accent-glass);
              }
              
              &::placeholder {
                color: var(--metro-fg);
                opacity: 0.2;
              }
            }
          }
        }
      `}</style>
    </div>
  );
};

export default JournalEU132;
