import React, { useState, useMemo } from 'react';
import { FileText, ChevronRight, X, Check, ChevronLeft, Eye } from 'lucide-react';

const DU46_TEMPLATES = [
  {
    id: 'strelka_yuritma_tekshiruv',
    name: 'Strelka elektr yuritmasini tekshirish',
    icon: '🔀',
    color: '#006ce4',
    description: 'Elektr dvigatellarning tok kuchini o‘lchash, yuritmalarni tekshirish',
    fields: [
      { key: 'station_name', label: 'Stansiya nomi', type: 'station_select', required: true },
      { key: 'strelka_number', label: 'Strelka raqami (№)', type: 'text', placeholder: 'Masalan: 1, 2, 3...', required: true }
    ],
    buildZapis: (v) => 
      `“${v.station_name || '___'}” stansiyasida yo‘nalishlarni oldindan tayyorlab, navbatchini ogohlantirgan holda, №${v.strelka_number || '___'}-sonli strelkalarda normal o‘tkazish va friksiyada ishlash jarayonida elektr dvigatellarning tok kuchini o‘lchagan holda, strelka elektr yuritmalarini tashqi va ichki tekshirish ishlari olib boriladi. Ish davomida tekshirilayotgan strelkani boshqaruv pultidan o‘tkazish taqiqlanadi. Yo‘nalish tayyorlanishi haqida oldindan xabar beriladi. ShN, DSCP`,
    buildOtpiska: (v) => 
      `“${v.station_name || '___'}” stansiyasida №${v.strelka_number || '___'}-sonli strelkalarda normal o‘tkazish va friksiyada ishlash jarayonida elektr dvigatellarning tok kuchini o‘lchagan holda, strelka elektr yuritmalarini tashqi va ichki tekshirish ishlari yakunlandi. Strelkalar tekshirildi, soz holatda ishlamoqda, elektr dvigatellarning tok kuchi me’yorda. ShN, DSCP`
  },
  {
    id: 'kurbel_bloklash',
    name: 'Kurbel bloklanishi',
    icon: '🔑',
    color: '#8b5cf6',
    description: 'Kurbel bloklash apparatida bloklanishi',
    fields: [
      { key: 'kurbel_number', label: 'Kurbel raqami (№)', type: 'text', placeholder: 'Masalan: 1, 2...', required: true },
      { key: 'technician_id', label: 'Texnik ID (ShN-...)', type: 'text', placeholder: 'Masalan: 12, 15...', required: true }
    ],
    buildZapis: (v) => 
      `№${v.kurbel_number || '___'}-sonli kurbel bloklash apparatida bloklandi, №${v.kurbel_number || '___'}-sonli kurbelni bo‘shatish tugmasi ShN-${v.technician_id || '___'} bosma iz bilan muhrlandi. ShN, DSCP`
  },
  {
    id: 'pult_tablo_tugma_tekshiruv',
    name: 'Pult-tablo tugmalarini tekshirish',
    icon: '🎛️',
    color: '#0ea5e9',
    description: 'Tugmalar hisoblagichlarini tekshirish, tozalash va sozlash',
    fields: [
      { key: 'station_name', label: 'Stansiya nomi', type: 'station_select', required: true },
      { key: 'chk58_from', label: 'ChK58 (dan)', type: 'text', placeholder: 'Masalan: 124', onlyOtpiska: true },
      { key: 'chk58_to', label: 'ChK58 (gacha)', type: 'text', placeholder: 'Masalan: 125', onlyOtpiska: true },
      { key: 'chk40m_from', label: 'ChK40M (dan)', type: 'text', placeholder: 'Masalan: 88', onlyOtpiska: true },
      { key: 'chk40m_to', label: 'ChK40M (gacha)', type: 'text', placeholder: 'Masalan: 89', onlyOtpiska: true },
      { key: 'dm_from', label: 'DM (dan)', type: 'text', placeholder: 'Masalan: 412', onlyOtpiska: true },
      { key: 'dm_to', label: 'DM (gacha)', type: 'text', placeholder: 'Masalan: 414', onlyOtpiska: true },
      { key: 'chk3_from', label: 'ChK3 (dan)', type: 'text', placeholder: 'Masalan: 55', onlyOtpiska: true },
      { key: 'chk3_to', label: 'ChK3 (gacha)', type: 'text', placeholder: 'Masalan: 55', onlyOtpiska: true },
      { key: 'chk4_from', label: 'ChK4 (dan)', type: 'text', placeholder: 'Masalan: 20', onlyOtpiska: true },
      { key: 'chk4_to', label: 'ChK4 (gacha)', type: 'text', placeholder: 'Masalan: 21', onlyOtpiska: true },
      { key: 'ch1_from', label: 'Ch1 (dan)', type: 'text', placeholder: 'Masalan: 102', onlyOtpiska: true },
      { key: 'ch1_to', label: 'Ch1 (gacha)', type: 'text', placeholder: 'Masalan: 102', onlyOtpiska: true },
      { key: 'ch2_from', label: 'Ch2 (dan)', type: 'text', placeholder: 'Masalan: 95', onlyOtpiska: true },
      { key: 'ch2_to', label: 'Ch2 (gacha)', type: 'text', placeholder: 'Masalan: 96', onlyOtpiska: true },
      { key: 'e1m_from', label: 'E1M (dan)', type: 'text', placeholder: 'Masalan: 14', onlyOtpiska: true },
      { key: 'e1m_to', label: 'E1M (gacha)', type: 'text', placeholder: 'Masalan: 14', onlyOtpiska: true },
      { key: 'e2m_from', label: 'E2M (dan)', type: 'text', placeholder: 'Masalan: 3', onlyOtpiska: true },
      { key: 'e2m_to', label: 'E2M (gacha)', type: 'text', placeholder: 'Masalan: 4', onlyOtpiska: true }
    ],
    buildZapis: (v) => 
      `“${v.station_name || '___'}” stansiyasining pult-tablosida tugmalar hisoblagichlari ko‘rsatkichlarini tekshirish, tozalash va to‘g‘ri ko‘rsatishini sozlash hamda ularning ishlash holatini tekshirish ishlari olib boriladi. ShN, DSCP`,
    buildOtpiska: (v) => 
      `“${v.station_name || '___'}” stansiyasining pult-tablosida tugmalar hisoblagichlari ko‘rsatkichlarini tekshirish, tozalash va to‘g‘ri ko‘rsatishini sozlash ishlari yakunlandi. Bunda hisoblagich ko‘rsatkichlari quyidagicha o‘zgardi:
ChK58- ${v.chk58_from || '___'}÷${v.chk58_to || '___'}
ChK40M- ${v.chk40m_from || '___'}÷${v.chk40m_to || '___'}
DM- ${v.dm_from || '___'}÷${v.dm_to || '___'}
ChK3- ${v.chk3_from || '___'}÷${v.chk3_to || '___'}
ChK4- ${v.chk4_from || '___'}÷${v.chk4_to || '___'}
Ch1- ${v.ch1_from || '___'}÷${v.ch1_to || '___'}
Ch2- ${v.ch2_from || '___'}÷${v.ch2_to || '___'}
E1M- ${v.e1m_from || '___'}÷${v.e1m_to || '___'}
E2M- ${v.e2m_from || '___'}÷${v.e2m_to || '___'}
ShN, DSCP`
  },
  {
    id: 'strelka_ochirish_tugma_muhr',
    name: 'Strelkani o‘chirish tugmasi muhrlanishi',
    icon: '🔴',
    color: '#ef4444',
    description: 'Strelkani o‘chirish tugmasi muhrlanishi qaydi',
    fields: [
      { key: 'strelka_number', label: 'Strelka raqami (№)', type: 'text', placeholder: 'Masalan: 1, 2...', required: true },
      { key: 'technician_id', label: 'Texnik ID (ShN-...)', type: 'text', placeholder: 'Masalan: 14, 18...', required: true }
    ],
    buildZapis: (v) => 
      `№${v.strelka_number || '___'}-sonli strelkalarni o‘chirish tugmasi ShN-${v.technician_id || '___'} bosma iz bilan muhrlandi. ShN, DSCP`
  },
  {
    id: 'strelka_zichlik_tekshiruv',
    name: 'Strelka zich yopishishini tekshirish',
    icon: '📐',
    color: '#f59e0b',
    description: '4mm lik shablon bilan zich yopishish tekshiruvi',
    fields: [
      { key: 'station_name', label: 'Stansiya nomi', type: 'station_select', required: true },
      { key: 'strelka_number', label: 'Strelka raqami (№)', type: 'text', placeholder: 'Masalan: 2, 4...', required: true }
    ],
    buildZapis: (v) => 
      `“${v.station_name || '___'}” stansiyasida №${v.strelka_number || '___'}-sonli strelkalarning ramali relsga zich yopishishini qalinligi 4mm bo‘lgan shablon qo‘yish orqali tekshirish ishlari olib boriladi. Yo‘nalish tayyorlanishi haqida oldindan xabar beriladi. ShN, PD, DSCP`,
    buildOtpiska: (v) => 
      `“${v.station_name || '___'}” stansiyasida strelkalarning ramali relsga zich yopishishini tekshirish yakunlandi. Qalinligi 4mm bo‘lgan shablon qo‘yilganda №${v.strelka_number || '___'}-sonli strelkalar holat nazoratiga ega emas. ShN, PD, DSCP`
  },
  {
    id: 'strelka_parrak_yengillik',
    name: 'Strelka parraklari yengilligi',
    icon: '⚙️',
    color: '#10b981',
    description: 'Kurbel bilan o‘tkazganda parraklar yurishini tekshirish',
    fields: [
      { key: 'strelka_number', label: 'Strelka raqami (№)', type: 'text', placeholder: 'Masalan: 3, 5...', required: true }
    ],
    buildZapis: (v) => 
      `№${v.strelka_number || '___'}-sonli strelkalarda kurbel yordamida o‘tkazilganda parraklarning yurish yengilligini tekshirish ishlari olib boriladi. Yo‘nalish tayyorlanishi haqida oldindan xabar beriladi. ShN, PD, DSCP`,
    buildOtpiska: (v) => 
      `Kurbel yordamida o‘tkazilganda parraklarning yurish yengilligini tekshirish yakunlandi. Kurbel bilan o‘tkazilganda №${v.strelka_number || '___'}-sonli strelka parraklari silkinishlarsiz, ravon o‘tmoqda. ShN, PD, DSCP`
  },
  {
    id: 'strelka_qutilari_tozalash',
    name: 'Aylanma chiqishda strelka qutilarini tozalash',
    icon: '🧹',
    color: '#0284c7',
    description: 'Strelka qutilarini tekshirish va tozalash',
    fields: [
      { key: 'station_name', label: 'Stansiya nomi', type: 'station_select', required: true },
      { key: 'strelka_number', label: 'Strelka raqami (№)', type: 'text', placeholder: 'Masalan: 4, 6...', required: true }
    ],
    buildZapis: (v) => 
      `“${v.station_name || '___'}” stansiyasining aylanma chiqish (oborotny s'ezd) yo‘lida №${v.strelka_number || '___'}-sonli strelkalar qutilarini ichki tekshirish va tozalash ishlari olib boriladi. Yo‘nalish tayyorlanishi haqida oldindan xabar beriladi. ShN, DSCP`,
    buildOtpiska: (v) => 
      `“${v.station_name || '___'}” stansiyasining aylanma chiqish (oborotny s'ezd) yo‘lida №${v.strelka_number || '___'}-sonli strelkalar qutilarini ichki tekshirish va tozalash ishlari yakunlandi, strelka qutilari texnik me’yorlarga javob beradi. ShN, DSCP`
  },
  {
    id: 'serga_ugolnik_izolyatsiya',
    name: 'Sergalar va burchakliklar izolyatsiyasi',
    icon: '⚡',
    color: '#f97316',
    description: 'Parrak sergalari va burchakliklar izolyatsiyasini tekshirish',
    fields: [
      { key: 'station_name', label: 'Stansiya nomi', type: 'station_select', required: true },
      { key: 'strelka_number', label: 'Strelka raqami (№)', type: 'text', placeholder: 'Masalan: 1, 5...', required: true }
    ],
    buildZapis: (v) => 
      `“${v.station_name || '___'}” stansiyasida №${v.strelka_number || '___'}-sonli strelkalarda parrak sergalari va asosiy burchakliklar (fundamentalnie ugolniki) izolyatsiyasini tekshirish ishlari olib boriladi. Yo‘nalish tayyorlanishi haqida oldindan xabar beriladi. ShN, PD, DSCP`,
    buildOtpiska: (v) => 
      `“${v.station_name || '___'}” stansiyasida №${v.strelka_number || '___'}-sonli strelkalarda parrak sergalari va asosiy burchakliklar izolyatsiyasini tekshirish yakunlandi, parrak sergalari va asosiy burchakliklar izolyatsiyasi qarshiligi PTE (Texnik foydalanish qoidalari) talablariga javob beradi. ShN, PD, DSCP`
  },
  {
    id: 'rele_kuchlanish_olchash',
    name: 'Rele xonasida kuchlanishni o‘lchash',
    icon: '📊',
    color: '#7c3aed',
    description: 'Nazorat strelka relelaridagi kuchlanishni o‘lchash',
    fields: [
      { key: 'station_name', label: 'Stansiya nomi', type: 'station_select', required: true },
      { key: 'strelka_number', label: 'Strelka raqami (№)', type: 'text', placeholder: 'Masalan: 2, 6...', required: true }
    ],
    buildZapis: (v) => 
      `В релейной АРС на станции “${v.station_name || '___'}” будет производится измерение напряжения на контрольных стрелочных реле стрелок №${v.strelka_number || '___'} с переводом стрелок. О приготовлении маршрутов сообщат заранее. ШН, ДСЦП`,
    buildOtpiska: (v) => 
      `В релейной АРС на станции “${v.station_name || '___'}” измерение напряжения на контрольных стрелочных реле стрелок №${v.strelka_number || '___'} закончена напряжения на КСР соответствует тех нормам. ШН, ДСЦП`
  },
  {
    id: 'mayatnik_transmitter_almashtirish',
    name: 'Mayatnikli transmitterni almashtirish',
    icon: '💾',
    color: '#ec4899',
    description: 'Mayatnikli transmitterni almashtirish ishlari',
    fields: [
      { key: 'station_name', label: 'Stansiya nomi', type: 'station_select', required: true },
      { key: 'chk58_from', label: 'ChK58 (dan)', type: 'text', placeholder: 'Masalan: 124', onlyOtpiska: true },
      { key: 'chk58_to', label: 'ChK58 (gacha)', type: 'text', placeholder: 'Masalan: 125', onlyOtpiska: true },
      { key: 'chk40m_from', label: 'ChK40M (dan)', type: 'text', placeholder: 'Masalan: 88', onlyOtpiska: true },
      { key: 'chk40m_to', label: 'ChK40M (gacha)', type: 'text', placeholder: 'Masalan: 89', onlyOtpiska: true },
      { key: 'dm_from', label: 'DM (dan)', type: 'text', placeholder: 'Masalan: 412', onlyOtpiska: true },
      { key: 'dm_to', label: 'DM (gacha)', type: 'text', placeholder: 'Masalan: 414', onlyOtpiska: true },
      { key: 'chk3_from', label: 'ChK3 (dan)', type: 'text', placeholder: 'Masalan: 55', onlyOtpiska: true },
      { key: 'chk3_to', label: 'ChK3 (gacha)', type: 'text', placeholder: 'Masalan: 55', onlyOtpiska: true },
      { key: 'chk4_from', label: 'ChK4 (dan)', type: 'text', placeholder: 'Masalan: 20', onlyOtpiska: true },
      { key: 'chk4_to', label: 'ChK4 (gacha)', type: 'text', placeholder: 'Masalan: 21', onlyOtpiska: true },
      { key: 'ch1_from', label: 'Ch1 (dan)', type: 'text', placeholder: 'Masalan: 102', onlyOtpiska: true },
      { key: 'ch1_to', label: 'Ch1 (gacha)', type: 'text', placeholder: 'Masalan: 102', onlyOtpiska: true },
      { key: 'ch2_from', label: 'Ch2 (dan)', type: 'text', placeholder: 'Masalan: 95', onlyOtpiska: true },
      { key: 'ch2_to', label: 'Ch2 (gacha)', type: 'text', placeholder: 'Masalan: 96', onlyOtpiska: true },
      { key: 'e1m_from', label: 'E1M (dan)', type: 'text', placeholder: 'Masalan: 14', onlyOtpiska: true },
      { key: 'e1m_to', label: 'E1M (gacha)', type: 'text', placeholder: 'Masalan: 14', onlyOtpiska: true },
      { key: 'e2m_from', label: 'E2M (dan)', type: 'text', placeholder: 'Masalan: 3', onlyOtpiska: true },
      { key: 'e2m_to', label: 'E2M (gacha)', type: 'text', placeholder: 'Masalan: 4', onlyOtpiska: true }
    ],
    buildZapis: (v) => 
      `В релейной АРС на станции “${v.station_name || '___'}” будет производится замена маятникового трансмиттера. О приготовлении маршрутов сообщат заранее. ШН, ДСЦП`,
    buildOtpiska: (v) => 
      `В релейной АРС на станции “${v.station_name || '___'}” замена маятникового трансмиттера закончена проверена работает исправно. Bunda hisoblagich ko‘rsatkichlari quyidagicha o‘zgardi:
ChK58- ${v.chk58_from || '___'}÷${v.chk58_to || '___'}
ChK40M- ${v.chk40m_from || '___'}÷${v.chk40m_to || '___'}
DM- ${v.dm_from || '___'}÷${v.dm_to || '___'}
ChK3- ${v.chk3_from || '___'}÷${v.chk3_to || '___'}
ChK4- ${v.chk4_from || '___'}÷${v.chk4_to || '___'}
Ch1- ${v.ch1_from || '___'}÷${v.ch1_to || '___'}
Ch2- ${v.ch2_from || '___'}÷${v.ch2_to || '___'}
E1M- ${v.e1m_from || '___'}÷${v.e1m_to || '___'}
E2M- ${v.e2m_from || '___'}÷${v.e2m_to || '___'}
ShN, DSCP`
  }
];

const DU46TemplatePanel = ({ mode = 'zapis', onApply, stations = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelected] = useState(null);
  const [fieldValues, setFieldValues] = useState({});

  // Filter templates based on whether they have Zapis or Otpiska functions
  const filteredTemplates = useMemo(() => {
    return DU46_TEMPLATES.filter((tpl) => {
      if (mode === 'zapis') return !!tpl.buildZapis;
      if (mode === 'otpiska') return !!tpl.buildOtpiska;
      return true;
    });
  }, [mode]);

  // Compute text preview
  const previewText = useMemo(() => {
    if (!selectedTemplate) return '';
    try {
      if (mode === 'zapis') {
        return selectedTemplate.buildZapis(fieldValues);
      } else {
        return selectedTemplate.buildOtpiska(fieldValues);
      }
    } catch (e) {
      return '';
    }
  }, [selectedTemplate, fieldValues, mode]);

  const handleOpen = () => { setIsOpen(true); setSelected(null); setFieldValues({}); };
  const handleClose = () => { setIsOpen(false); setSelected(null); setFieldValues({}); };
  const handleBack = () => { setSelected(null); setFieldValues({}); };

  const handleSelectTemplate = (tpl) => {
    setSelected(tpl);
    const defaults = {};
    tpl.fields.forEach((f) => {
      // For zapis mode, only require fields that are not onlyOtpiska
      if (mode === 'zapis' && f.onlyOtpiska) return;
      defaults[f.key] = '';
    });
    setFieldValues(defaults);
  };

  const setField = (key, value) =>
    setFieldValues((prev) => ({ ...prev, [key]: value }));

  const isApplyDisabled = () => {
    if (!selectedTemplate) return true;
    const requiredFields = selectedTemplate.fields.filter(f => {
      if (mode === 'zapis' && f.onlyOtpiska) return false;
      return f.required;
    });
    return requiredFields.some(
      (f) => !fieldValues[f.key] || fieldValues[f.key].trim() === ''
    );
  };

  const handleApply = () => {
    if (!selectedTemplate) return;
    const text = mode === 'zapis' 
      ? selectedTemplate.buildZapis(fieldValues) 
      : selectedTemplate.buildOtpiska(fieldValues);
    
    onApply(text);
    handleClose();
  };

  const renderField = (field) => {
    const val = fieldValues[field.key] || '';
    const onChange = (e) => setField(field.key, e.target.value);

    if (field.type === 'station_select') {
      return (
        <select className="du5-form-select" value={val} onChange={onChange}>
          <option value="">-- Bekatni tanlang --</option>
          {stations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      );
    }
    return (
      <input
        type="text"
        className="du5-form-input"
        placeholder={field.placeholder || ''}
        value={val}
        onChange={onChange}
      />
    );
  };

  return (
    <>
      {!isOpen && (
        <div className="du5-template-trigger-wrapper">
          <button type="button" className="du5-template-trigger-btn" onClick={handleOpen}>
            <FileText size={18} />
            <span>Shablonlar ({mode === 'zapis' ? 'Qayd' : 'Javob'})</span>
            <ChevronRight size={16} className="du5-btn-arrow" />
          </button>
          <p className="du5-template-hint">
            DU-46 {mode === 'zapis' ? 'qayd' : 'javob'} matnlarini tezkor to'ldirish uchun shablondan foydalaning
          </p>
        </div>
      )}

      {isOpen && (
        <div className="du5-template-panel">
          <div className="du5-panel-header">
            <div className="du5-panel-title-row">
              {selectedTemplate && (
                <button type="button" className="du5-back-btn" onClick={handleBack}>
                  <ChevronLeft size={16} />
                </button>
              )}
              <div className="du5-panel-title">
                <FileText size={16} />
                <span>{selectedTemplate ? selectedTemplate.name : `Shablonlar (${mode === 'zapis' ? 'Qayd' : 'Javob'})`}</span>
              </div>
              <button type="button" className="du5-close-btn" onClick={handleClose}>
                <X size={16} />
              </button>
            </div>
            {!selectedTemplate && (
              <p className="du5-panel-subtitle">
                Tegishli shablonni tanlab, maydonlarni to'ldiring va «Qo'llash» tugmasini bosing
              </p>
            )}
          </div>

          {!selectedTemplate && (
            <div className="du5-template-list">
              {filteredTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  className="du5-template-item"
                  onClick={() => handleSelectTemplate(tpl)}
                >
                  <div
                    className="du5-tpl-icon"
                    style={{ background: tpl.color + '18', color: tpl.color }}
                  >
                    <span style={{ fontSize: '20px' }}>{tpl.icon}</span>
                  </div>
                  <div className="du5-tpl-info">
                    <span className="du5-tpl-name">{tpl.name}</span>
                    <span className="du5-tpl-desc">{tpl.description}</span>
                  </div>
                  <ChevronRight size={16} className="du5-tpl-arrow" />
                </button>
              ))}
            </div>
          )}

          {selectedTemplate && (
            <div className="du5-template-form">
              <div
                className="du5-tpl-badge"
                style={{
                  background: selectedTemplate.color + '12',
                  borderColor: selectedTemplate.color + '40',
                }}
              >
                <span style={{ fontSize: '18px' }}>{selectedTemplate.icon}</span>
                <span style={{ color: selectedTemplate.color, fontWeight: 700, fontSize: '12.5px' }}>
                  {selectedTemplate.name}
                </span>
              </div>

              {selectedTemplate.fields.filter(f => !(mode === 'zapis' && f.onlyOtpiska)).map((field) => (
                <div key={field.key} className="du5-form-group">
                  <label className="du5-form-label">
                    {field.label}
                    {field.required && <span className="du5-required-dot"> *</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}

              {previewText && (
                <div className="du5-preview-box">
                  <div className="du5-preview-label">
                    <Eye size={12} /> Ko'rinish (preview):
                  </div>
                  <div className="du5-preview-text">{previewText}</div>
                </div>
              )}

              <button
                type="button"
                className="du5-apply-btn"
                onClick={handleApply}
                disabled={isApplyDisabled()}
              >
                <Check size={16} />
                Maydonga qo'llash
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DU46TemplatePanel;
