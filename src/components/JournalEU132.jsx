import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Save, X, ChevronRight, Activity, Calendar, 
  Hash, MapPin, ClipboardList, AlertCircle, CheckCircle2, 
  Plus, PlusCircle 
} from 'lucide-react';
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
      <div className="d-flex align-items-center justify-content-center p-5 min-vh-50">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="journal-1c-container d-flex flex-column flex-md-row gap-4" style={{ height: 'auto', minHeight: '650px' }}>
      
      {/* Column 1: Categories */}
      <div className="d-flex flex-column gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5" style={{ minWidth: '260px', maxWidth: '300px' }}>
        <div className="d-flex align-items-center gap-2 border-bottom pb-2 border-black/10 dark:border-white/10">
          <Shield size={18} className="text-primary" />
          <h5 className="m-0 font-bold uppercase tracking-wider text-xs opacity-85">Himoya vositalari</h5>
        </div>
        <div className="d-flex flex-column gap-2 overflow-y-auto custom-scrollbar" style={{ maxHeight: '500px' }}>
          {categories.map((cat) => (
            <button
              key={cat.category}
              className={`d-flex align-items-center justify-content-between p-3 rounded-xl border font-bold text-sm text-left transition-all border-0 bg-transparent ${
                selectedCategory?.category === cat.category 
                  ? 'bg-primary text-white border-primary shadow' 
                  : 'bg-white/5 dark:bg-black/20 border-white/10 text-inherit hover:bg-white/10 dark:hover:bg-black/40'
              }`}
              style={{ color: selectedCategory?.category === cat.category ? 'white' : 'inherit' }}
              onClick={() => handleSelectCategory(cat)}
            >
              <span style={{ fontSize: '0.8rem' }}>{cat.category}</span>
              <ChevronRight size={16} className="opacity-55" />
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: Specific Items */}
      <div className="d-flex flex-column gap-3 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5" style={{ minWidth: '260px', maxWidth: '300px' }}>
        <div className="d-flex align-items-center gap-2 border-bottom pb-2 border-black/10 dark:border-white/10">
          <ClipboardList size={18} className="text-primary" />
          <h5 className="m-0 font-bold uppercase tracking-wider text-xs opacity-85">
            {selectedCategory?.category?.toLowerCase().includes('qo`lqop') ? 'Qo\'lqoplar' : 
             selectedCategory?.category?.toLowerCase().includes('galosh') ? 'Galoshlar' : 
             'Vositalar'}
          </h5>
        </div>
        
        <div className="d-flex flex-column gap-2 overflow-y-auto custom-scrollbar" style={{ maxHeight: '500px' }}>
          <button 
            type="button"
            className="d-flex align-items-center justify-content-between p-3 rounded-xl border border-dashed border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-all font-bold text-xs uppercase tracking-wider border-0"
            onClick={handleAddNew}
          >
            <span>Yangi Qo'shish</span>
            <Plus size={18} />
          </button>
          
          {selectedCategory?.items.map((item) => (
            <button
              key={item.data.equipment_number}
              type="button"
              className={`d-flex align-items-center justify-content-between p-3 rounded-xl border font-bold text-sm text-left transition-all border-0 bg-transparent ${
                selectedItem?.data?.equipment_number === item.data.equipment_number && !selectedItem.isNew
                  ? 'bg-primary text-white border-primary shadow' 
                  : 'bg-white/5 dark:bg-black/20 border-white/10 text-inherit hover:bg-white/10 dark:hover:bg-black/40'
              }`}
              style={{ color: selectedItem?.data?.equipment_number === item.data.equipment_number && !selectedItem.isNew ? 'white' : 'inherit' }}
              onClick={() => handleSelectItem(item)}
            >
              <div className="d-flex flex-column">
                <span className="font-extrabold">№ {item.data.equipment_number}</span>
                <span className="text-xs opacity-60 font-semibold">{item.data.location}</span>
              </div>
              <ChevronRight size={16} className="opacity-55" />
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
      <div className="journal-1c-card flex-1 p-4 mb-0 d-flex flex-column" style={{ background: 'rgba(var(--metro-card-bg-rgb), 0.25)' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2 border-black/10 dark:border-white/10">
          <div className="d-flex align-items-center gap-2">
            <h5 className="m-0 font-bold" style={{ fontSize: '15px' }}>{selectedItem?.isNew ? "Yangi Ma'lumot" : "Tafsilotlar"}</h5>
            {selectedItem && (
               <span className="badge-glass">
                 {selectedItem.isNew ? "Yangi" : `№ ${selectedItem.data.equipment_number}`}
               </span>
            )}
          </div>
          <div className="text-xs opacity-75 font-semibold">
             {selectedCategory?.category}
          </div>
        </div>
        
        <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.isNew ? 'new' : selectedItem.data.equipment_number}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="d-flex flex-column h-100"
              >
                <form onSubmit={handleSubmit} className="d-flex flex-column h-100">
                  <div className="d-flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 mb-4">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border-0 ${formData.registration_type === 'Sinovni rasmiylashtirish' ? 'bg-primary text-white shadow' : 'bg-transparent text-inherit opacity-60 hover:opacity-100'}`}
                      style={{ color: formData.registration_type === 'Sinovni rasmiylashtirish' ? 'white' : 'inherit' }}
                      onClick={() => handleInputChange('registration_type', 'Sinovni rasmiylashtirish')}
                    >
                      Sinovni rasmiylashtirish
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border-0 ${formData.registration_type === 'Ko`rikni rasmiylashtirish' ? 'bg-primary text-white shadow' : 'bg-transparent text-inherit opacity-60 hover:opacity-100'}`}
                      style={{ color: formData.registration_type === 'Ko`rikni rasmiylashtirish' ? 'white' : 'inherit' }}
                      onClick={() => handleInputChange('registration_type', 'Ko`rikni rasmiylashtirish')}
                    >
                      Ko`rikni rasmiylashtirish
                    </button>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <div className="d-flex flex-column gap-1">
                        <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                          <Hash size={14} className="text-primary" /> Himoya vositasi raqami
                        </label>
                        <input 
                          type="text" 
                          required 
                          className="journal-1c-input w-100"
                          value={formData.equipment_number || ''}
                          onChange={(e) => handleInputChange('equipment_number', e.target.value)}
                          placeholder="Masalan: G-123"
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex flex-column gap-1">
                        <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                          <MapPin size={14} className="text-primary" /> Joylashgan o'rni
                        </label>
                        <select 
                          required 
                          value={formData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="journal-1c-input w-100"
                          style={{ background: 'var(--metro-bg)' }}
                        >
                          <option value="">-- Tanlang --</option>
                          <option value="Bekat boshlig‘i xonasi">Bekat boshlig‘i xonasi</option>
                          <option value="Bekat navbatchisi xonasi">Bekat navbatchisi xonasi</option>
                          <option value="Blok-post xonasi">Blok-post xonasi</option>
                          <option value="Kub xonasi">Kub xonasi</option>
                          <option value="Quritish shkafida">Quritish shkafida</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex flex-column gap-1">
                        <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                          <Calendar size={14} className="text-primary" /> Oxirgi sinov sanasi
                        </label>
                        <input 
                          type="date" 
                          required 
                          className="journal-1c-input w-100"
                          value={formData.last_test_date || ''}
                          onChange={(e) => handleInputChange('last_test_date', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex flex-column gap-1">
                        <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                          <ClipboardList size={14} className="text-primary" /> Bayonnoma raqami
                        </label>
                        <input 
                          type="text" 
                          required 
                          className="journal-1c-input w-100"
                          value={formData.protocol_number || ''}
                          onChange={(e) => handleInputChange('protocol_number', e.target.value)}
                          placeholder="Bayonnoma №"
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex flex-column gap-1">
                        <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                          <Calendar size={14} className="text-primary" /> Keyingi tekshiruv sanasi
                        </label>
                        <input 
                          type="date" 
                          required 
                          className="journal-1c-input w-100"
                          value={formData.next_test_date || ''}
                          onChange={(e) => handleInputChange('next_test_date', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex flex-column gap-1">
                        <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                          <Activity size={14} className="text-primary" /> Ko`rikdan o`tkazish davriyligi
                        </label>
                        <input 
                          type="text" 
                          required 
                          className="journal-1c-input w-100"
                          value={formData.interval || ''}
                          onChange={(e) => handleInputChange('interval', e.target.value)}
                          placeholder="Masalan: 6 oy"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-1 mb-4">
                    <label className="font-bold text-xs uppercase tracking-wider text-muted m-0 d-flex align-items-center gap-2">
                      <AlertCircle size={14} className="text-primary" /> Izoh
                    </label>
                    <textarea 
                      className="journal-1c-input w-100"
                      style={{ height: '70px', minHeight: '70px' }}
                      value={formData.comment || ''}
                      onChange={(e) => handleInputChange('comment', e.target.value)}
                      placeholder="Qo'shimcha ma'lumotlar..."
                    />
                  </div>

                  {error && <Alert variant="danger" className="mb-3 py-2 px-3" style={{ fontSize: '12px' }}>{error}</Alert>}
                  {success && <Alert variant="success" className="mb-3 py-2 px-3 flex items-center gap-2" style={{ fontSize: '12px' }}><CheckCircle2 size={16} /> Muvaffaqiyatli saqlandi!</Alert>}

                  <div className="d-flex gap-2 mt-auto pt-3 border-top border-black/10 dark:border-white/10">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="journal-1c-btn journal-1c-btn-primary"
                    >
                      {saving ? <Spinner animation="border" size="sm" /> : <Save size={16} />}
                      <span>{selectedItem.isNew ? "Qo'shish" : "Saqlash"}</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={onCancel}
                      className="btn-metro-back"
                    >
                      <X size={16} />
                      <span>Yopish</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center opacity-30 py-5">
                <PlusCircle size={60} className="mb-3 text-muted" />
                <h5 className="font-black text-uppercase tracking-wider">Vositani tanlang yoki yangi qo'shing</h5>
                <p className="text-sm">Ma'lumotlarni ko'rish uchun chapdagi ro'yxatdan foydalaning</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default JournalEU132;
