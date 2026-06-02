import React, { useState, useMemo } from 'react';
import { FileText, ChevronRight, X, Check, ChevronLeft, Eye } from 'lucide-react';

// ─── Template Definitions ─────────────────────────────────────────────────────
// Word hujjati (ДУ-5.docx) asosida tuzilgan shablonlar
// buildText(values, stations) → tayyor maqsad matni

const TRACK_OPTIONS = ['1', '2', '3', '4', '1 va 2', '3 va 4', '1, 2, 3, 4'];
const STRELKA_OPTIONS = ['1', '2', '3', '4', '5', '6', '1 va 2', '3 va 4', '5 va 6', '1,2,3,4', '1,2,3,4,5,6'];
const DIRECTION_OPTIONS = ['I-bosh yo\'l', 'II-bosh yo\'l', 'I va II-bosh yo\'l'];
const DIRECTION_SHORT = ['I', 'II', 'I va II'];
const SECTION_OPTIONS = [
  'Aylanma chiqish',
  'I-bosh yo\'l',
  'II-bosh yo\'l',
  'I va II-bosh yo\'l',
  'Kesma (perегon)',
  'Uchastka',
];
const PK_OPTIONS = Array.from({ length: 30 }, (_, i) => `PK ${(i + 1) * 10}`);

const DU5_TEMPLATES = [
  // ─── 1. Aylanma chiqishda tarkibni to'xtatish ──────────────────────────────
  {
    id: 'aylanma_toxtatish',
    name: 'Aylanma chiqishda tarkib to\'xtatish',
    icon: '🚉',
    color: '#006ce4',
    description: 'Oborotny s\'ezd — tarkibni to\'xtatish (otboy)',
    fields: [
      {
        key: 'track_number',
        label: 'Yo\'l raqami',
        type: 'select',
        options: TRACK_OPTIONS,
        required: true,
      },
    ],
    buildText: (v) =>
      `Aylanish yo'lida ${v.track_number}-chi yo'lga tarkibni qo'yish (otstoy)`,
  },

  // ─── 2. Bosh yo'lda UKPT-M tekshiruvi (bekat tomon) ────────────────────────
  {
    id: 'ukptm_tekshiruv',
    name: 'UKPT-M tekshiruvi (odam o\'tishi)',
    icon: '🚶',
    color: '#8b5cf6',
    description: 'Bosh yo\'l bo\'ylab odam o\'tishi uchun UKPT-M tekshiruvi',
    fields: [
      {
        key: 'direction',
        label: 'Yo\'l yo\'nalishi',
        type: 'select',
        options: DIRECTION_OPTIONS,
        required: true,
      },
      {
        key: 'station_to',
        label: 'Qaysi bekat tomonga',
        type: 'station_select',
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.direction} bo'ylab (${v.station_to} bekat tomonga) odam o'tishi uchun UKPT-M tekshiruvi`,
  },

  // ─── 3. Kesma/uchastka bo'ylab yo'l va kontakt relsini ko'rish ────────────
  {
    id: 'yol_kontakt_rels_korik',
    name: 'Yo\'l va kontakt relsi ko\'rigi',
    icon: '🔎',
    color: '#0ea5e9',
    description: 'Kesma bo\'ylab yo\'l va kontakt relslarini aylanib tekshirish',
    fields: [
      {
        key: 'direction',
        label: 'Yo\'l yo\'nalishi',
        type: 'select',
        options: DIRECTION_OPTIONS,
        required: true,
      },
      {
        key: 'station_from',
        label: 'Boshlang\'ich bekat (dan)',
        type: 'station_select',
        required: true,
      },
      {
        key: 'station_to',
        label: 'Tugash bekat (gacha)',
        type: 'station_select',
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.direction} kesma ${v.station_from} – ${v.station_to} bo'ylab yo'l va kontakt rel'slarini aylanib tekshirish (obkhod)`,
  },

  // ─── 4. Kesma/uchastka bo'ylab nasos ko'rikdan o'tkazish ───────────────────
  {
    id: 'nasos_korik',
    name: 'Nasos ko\'rik (PK bo\'yicha)',
    icon: '⚙️',
    color: '#f59e0b',
    description: 'PK raqami bo\'ylab nasos ko\'rikdan o\'tkazish',
    fields: [
      {
        key: 'direction',
        label: 'Yo\'l yo\'nalishi',
        type: 'select',
        options: DIRECTION_OPTIONS,
        required: true,
      },
      {
        key: 'station_from',
        label: 'Kesma boshi (dan)',
        type: 'station_select',
        required: true,
      },
      {
        key: 'station_to',
        label: 'Kesma oxiri (gacha)',
        type: 'station_select',
        required: true,
      },
      {
        key: 'pk_number',
        label: 'PK raqami',
        type: 'select',
        options: PK_OPTIONS,
        required: true,
      },
      {
        key: 'nasos_number',
        label: 'Nasos raqami',
        type: 'select',
        options: ['№1', '№2', '№3', '№4', '№5', '№6', '№1 va №2', '№3 va №4'],
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.direction} kesma ${v.station_from} – ${v.station_to}, ${v.pk_number} (raqami) — ${v.nasos_number} nasosni ko'rikdan o'tkazish`,
  },

  // ─── 5. Svetofor lampasini almashtirish ────────────────────────────────────
  {
    id: 'svetofor_lampa',
    name: 'Svetofor lampasini almashtirish',
    icon: '🚦',
    color: '#ef4444',
    description: 'Kesma bo\'ylab kuygan svetofor lampasini almashtirish',
    fields: [
      {
        key: 'direction',
        label: 'Yo\'l yo\'nalishi',
        type: 'select',
        options: DIRECTION_OPTIONS,
        required: true,
      },
      {
        key: 'station_from',
        label: 'Kesma boshi (dan)',
        type: 'station_select',
        required: true,
      },
      {
        key: 'station_to',
        label: 'Kesma oxiri (gacha)',
        type: 'station_select',
        required: true,
      },
      {
        key: 'signal_name',
        label: 'Svetofor nomi/raqami',
        type: 'text',
        placeholder: 'Masalan: ChS-138, MS-24...',
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.direction} kesma ${v.station_from} – ${v.station_to} — ${v.signal_name} svetoforning kuygan lampasini almashtirish`,
  },

  // ─── 6. Aylanma chiqishda yo'l va strelkani ko'rish (RV o'tgandan keyin) ──
  {
    id: 'aylanma_rv_korik',
    name: 'Aylanma chiqishda yo\'l ko\'rik (RV keyin)',
    icon: '🔍',
    color: '#10b981',
    description: 'Rel\'sovoz (RV) o\'tgandan keyin yo\'l va strelkani ko\'rikdan o\'tkazish',
    fields: [],
    buildText: () =>
      `Aylanma chiqishda rel'sovoz (RV) o'tgandan keyin yo'l va strelkani vizual ko'rikdan o'tkazish`,
  },

  // ─── 7. Aylanma chiqishda strelka o'tkazgichlarni ko'rish ─────────────────
  {
    id: 'aylanma_strelka_korik',
    name: 'Aylanma chiqishda strelka ko\'rik',
    icon: '🔀',
    color: '#f97316',
    description: 'Aylanma chiqishdagi strelka o\'tkazgichlarni ko\'rikdan o\'tkazish',
    fields: [
      {
        key: 'strelka_numbers',
        label: 'Strelka raqamlari',
        type: 'select',
        options: STRELKA_OPTIONS,
        required: true,
      },
    ],
    buildText: (v) =>
      `Aylanma chiqishda ${v.strelka_numbers}-raqamli strelka o'tkazgichlarni vizual ko'rikdan o'tkazish`,
  },

  // ─── 8. Oqish joylarini to'sish (tunel inshootlari) ───────────────────────
  {
    id: 'oqish_tosish',
    name: 'Oqish joylarini to\'sish (tunel inshootlari)',
    icon: '💧',
    color: '#0284c7',
    description: 'Tunel inshootlarida kontrol naynos, oqish joylarini bartaraf etish',
    fields: [
      {
        key: 'section',
        label: 'Bo\'lim / yo\'nalish',
        type: 'select',
        options: SECTION_OPTIONS,
        required: true,
      },
      {
        key: 'station_from',
        label: 'Kesma boshi (dan)',
        type: 'station_select',
        required: true,
      },
      {
        key: 'station_to',
        label: 'Kesma oxiri (gacha)',
        type: 'station_select',
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.section} kesma ${v.station_from} – ${v.station_to} — tunel inshootlarining oqish joylarini to'sish (kontrol naynos naylanmasi)`,
  },

  // ─── 9. DU-46 buyrug'i bo'yicha strelkalarda ish ──────────────────────────
  {
    id: 'du46_strelka_ish',
    name: 'DU-46 bo\'yicha strelkalarda ish',
    icon: '📋',
    color: '#7c3aed',
    description: 'DU-46 ga yozilgan kamchilikni KMO ko\'rsatmasi bo\'yicha bartaraf etish',
    fields: [
      {
        key: 'section',
        label: 'Bo\'lim / yo\'nalish',
        type: 'select',
        options: SECTION_OPTIONS,
        required: true,
      },
      {
        key: 'strelka_numbers',
        label: 'Strelka raqamlari',
        type: 'select',
        options: STRELKA_OPTIONS,
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.section} — ${v.strelka_numbers}-raqamli strelkalarda DU-46 buyrug'iga yozilgan KMO ko'rsatmasi bo'yicha kamchilikni bartaraf etish`,
  },

  // ─── 10. Kesma bo'ylab rel's va kontakt relslari tekshiruvi ───────────────
  {
    id: 'yol_korik_kesma',
    name: 'Kesma bo\'ylab yo\'l ko\'rik (kechqurun)',
    icon: '🌙',
    color: '#1e40af',
    description: 'Tungi texnik ko\'rik — yo\'l va kontakt rel\'si holati',
    fields: [
      {
        key: 'direction',
        label: 'Yo\'l yo\'nalishi',
        type: 'select',
        options: DIRECTION_OPTIONS,
        required: true,
      },
      {
        key: 'station_from',
        label: 'Kesma boshi (dan)',
        type: 'station_select',
        required: true,
      },
      {
        key: 'station_to',
        label: 'Kesma oxiri (gacha)',
        type: 'station_select',
        required: true,
      },
      {
        key: 'work_type',
        label: 'Ish turi',
        type: 'select',
        options: [
          'Yo\'l va kontakt rel\'sini aylanib tekshirish (obkhod)',
          'Texnik ko\'rik (texosmotr)',
          'Rel\'s birikmalari va stiqlarni tekshirish',
          'Drenaj tizimini tekshirish',
          'Tunel devorini tekshirish',
          'Yoritish tizimini tekshirish',
        ],
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.direction} kesma ${v.station_from} – ${v.station_to} — ${v.work_type}`,
  },

  // ─── 11. Bekat/kesma yo'l ta'mirlash ishlari ──────────────────────────────
  {
    id: 'yol_tamir_kesma',
    name: 'Kesma/bekatda yo\'l ta\'mirlash',
    icon: '🛠️',
    color: '#ca8a04',
    description: 'Kesma yoki bekatda rejali yo\'l ta\'mirlash ishlari',
    fields: [
      {
        key: 'section',
        label: 'Joylashuv',
        type: 'select',
        options: SECTION_OPTIONS,
        required: true,
      },
      {
        key: 'station_from',
        label: 'Dan',
        type: 'station_select',
        required: true,
      },
      {
        key: 'station_to',
        label: 'Gacha',
        type: 'station_select',
        required: true,
      },
      {
        key: 'work_type',
        label: 'Ish turi',
        type: 'select',
        options: [
          'Rel\'s almashtirish',
          'Shpal almashtirish',
          'Rel\'s birlashtirish (stiqlar)',
          'Yo\'l tekislash (nivelirovat\')',
          'Shuruplar va bloklash elementlarini mustahkamlash',
          'Ballast tozalash va zichlash',
          'O\'tish yo\'l ta\'mirlash',
        ],
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.section} ${v.station_from} – ${v.station_to} — ${v.work_type}`,
  },

  // ─── 12. Elektr va kabel ishlari ──────────────────────────────────────────
  {
    id: 'elektr_kabel',
    name: 'Elektr / kabel ishlari',
    icon: '⚡',
    color: '#d97706',
    description: 'Kontakt rel\'s, kabel va elektr jihozlari ta\'mirlash',
    fields: [
      {
        key: 'direction',
        label: 'Yo\'l yo\'nalishi',
        type: 'select',
        options: DIRECTION_OPTIONS,
        required: true,
      },
      {
        key: 'station_from',
        label: 'Dan',
        type: 'station_select',
        required: true,
      },
      {
        key: 'station_to',
        label: 'Gacha',
        type: 'station_select',
        required: true,
      },
      {
        key: 'work_type',
        label: 'Ish turi',
        type: 'select',
        options: [
          'Uchinchi rel\'s va ulanmalarni tekshirish va ta\'mirlash',
          'Elektr kabellarini ta\'mirlash va almashtirish',
          'Elektr muftalarini almashtirish',
          'Kabel kanallarini tekshirish',
          'Yoritish moslamalarini ta\'mirlash',
          'Uchinchi rel\'s izolatorlarini almashtirish',
          'Tok o\'tkazuvchi shinalar ta\'mirlash',
        ],
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.direction} kesma ${v.station_from} – ${v.station_to} — ${v.work_type}`,
  },

  // ─── 13. Signal va aloqa qurilmalari ta'mirlash ───────────────────────────
  {
    id: 'signal_aloqa_tamir',
    name: 'Signal va aloqa ta\'mirlash',
    icon: '📡',
    color: '#059669',
    description: 'Svetofor, ABB, rel\'s zanjirlari va aloqa tizimlarini ta\'mirlash',
    fields: [
      {
        key: 'direction',
        label: 'Yo\'l yo\'nalishi',
        type: 'select',
        options: DIRECTION_OPTIONS,
        required: true,
      },
      {
        key: 'station_from',
        label: 'Dan',
        type: 'station_select',
        required: true,
      },
      {
        key: 'station_to',
        label: 'Gacha',
        type: 'station_select',
        required: true,
      },
      {
        key: 'work_type',
        label: 'Ish turi',
        type: 'select',
        options: [
          'Avtomatik blokirovka (ABB) tekshirish va ta\'mirlash',
          'Rel\'s zanjirlarini tekshirish va ta\'mirlash',
          'Svetofor lampalarini almashtirish',
          'Svetoforni sozlash va ta\'mirlash',
          'Aloqa kabellarini ta\'mirlash',
          'SAUT tizimi qurilmalarini tekshirish',
          'Dispetcherlik aloqa tizimi ta\'mirlash',
          'EPB qurilmalarini ta\'mirlash',
        ],
        required: true,
      },
    ],
    buildText: (v) =>
      `${v.direction} kesma ${v.station_from} – ${v.station_to} — ${v.work_type}`,
  },

  // ─── 14. Boshqa / erkin yozuv ────────────────────────────────────────────
  {
    id: 'boshqa',
    name: 'Boshqa / erkin yozuv',
    icon: '📝',
    color: '#6b7280',
    description: 'Yuqoridagi shablonga to\'g\'ri kelmaydigan ishlar',
    fields: [
      {
        key: 'purpose',
        label: 'Maqsad matni',
        type: 'textarea',
        placeholder: 'Tunelga tushishdan maqsadni batafsil yozing...',
        rows: 4,
        required: true,
      },
    ],
    buildText: (v) => v.purpose || '',
  },
];

// ─── DU5TemplatePanel Component ──────────────────────────────────────────────
const DU5TemplatePanel = ({ onApply, stations = [] }) => {
  const [isOpen, setIsOpen]               = useState(false);
  const [selectedTemplate, setSelected]   = useState(null);
  const [fieldValues, setFieldValues]     = useState({});

  // Build preview text from current values
  const previewText = useMemo(() => {
    if (!selectedTemplate) return '';
    try { return selectedTemplate.buildText(fieldValues, stations); }
    catch { return ''; }
  }, [selectedTemplate, fieldValues, stations]);

  const handleOpen = () => { setIsOpen(true); setSelected(null); setFieldValues({}); };
  const handleClose = () => { setIsOpen(false); setSelected(null); setFieldValues({}); };
  const handleBack = () => { setSelected(null); setFieldValues({}); };

  const handleSelectTemplate = (tpl) => {
    setSelected(tpl);
    const defaults = {};
    tpl.fields.forEach((f) => { defaults[f.key] = ''; });
    setFieldValues(defaults);
  };

  const setField = (key, value) =>
    setFieldValues((prev) => ({ ...prev, [key]: value }));

  const isApplyDisabled = () => {
    if (!selectedTemplate) return true;
    // Templates with no fields (like RV ko'rik) are always ready
    if (selectedTemplate.fields.length === 0) return false;
    return selectedTemplate.fields.some(
      (f) => f.required && (!fieldValues[f.key] || fieldValues[f.key].trim() === '')
    );
  };

  const handleApply = () => {
    if (!selectedTemplate) return;
    const text = selectedTemplate.buildText(fieldValues, stations);

    const result = { purpose: text };

    // station_from → entrance_door (qaysi eshikdan tushdi)
    if (fieldValues.station_from) result.entrance_door = fieldValues.station_from;
    // station_to   → exit_location (chiqish manzili bekat)
    if (fieldValues.station_to)   result.exit_location  = fieldValues.station_to;

    onApply(result);
    handleClose();
  };

  // ── Render a single field ─────────────────────────────────────────────────
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
    if (field.type === 'select') {
      return (
        <select className="du5-form-select" value={val} onChange={onChange}>
          <option value="">-- Tanlang --</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          className="du5-form-textarea"
          rows={field.rows || 3}
          placeholder={field.placeholder || ''}
          value={val}
          onChange={onChange}
        />
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
      {/* ── Trigger (closed state) ── */}
      {!isOpen && (
        <div className="du5-template-trigger-wrapper">
          <button type="button" className="du5-template-trigger-btn" onClick={handleOpen}>
            <FileText size={18} />
            <span>Shablonlar</span>
            <ChevronRight size={16} className="du5-btn-arrow" />
          </button>
          <p className="du5-template-hint">
            «Tunelga tushishdan maqsad» maydonini tez to'ldirish uchun shablon tanlang
          </p>
        </div>
      )}

      {/* ── Panel (open state) ── */}
      {isOpen && (
        <div className="du5-template-panel">
          {/* Header */}
          <div className="du5-panel-header">
            <div className="du5-panel-title-row">
              {selectedTemplate && (
                <button type="button" className="du5-back-btn" onClick={handleBack}>
                  <ChevronLeft size={16} />
                </button>
              )}
              <div className="du5-panel-title">
                <FileText size={16} />
                <span>{selectedTemplate ? selectedTemplate.name : 'Shablonlar ro\'yxati'}</span>
              </div>
              <button type="button" className="du5-close-btn" onClick={handleClose}>
                <X size={16} />
              </button>
            </div>
            {!selectedTemplate && (
              <p className="du5-panel-subtitle">
                Maqsad turini tanlang — maydonlar to'ldirilgach «Qo'llash» ni bosing
              </p>
            )}
          </div>

          {/* ── Template List ── */}
          {!selectedTemplate && (
            <div className="du5-template-list">
              {DU5_TEMPLATES.map((tpl) => (
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

          {/* ── Template Form ── */}
          {selectedTemplate && (
            <div className="du5-template-form">
              {/* Badge */}
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

              {/* Fields */}
              {selectedTemplate.fields.length > 0 ? (
                selectedTemplate.fields.map((field) => (
                  <div key={field.key} className="du5-form-group">
                    <label className="du5-form-label">
                      {field.label}
                      {field.required && <span className="du5-required-dot"> *</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))
              ) : (
                <div className="du5-no-fields-note">
                  <Eye size={14} />
                  <span>Bu shablon uchun qo'shimcha ma'lumot kerak emas</span>
                </div>
              )}

              {/* Live Preview */}
              {previewText && (
                <div className="du5-preview-box">
                  <div className="du5-preview-label">
                    <Eye size={12} /> Ko'rinish (preview):
                  </div>
                  <div className="du5-preview-text">{previewText}</div>
                </div>
              )}

              {/* Apply Button */}
              <button
                type="button"
                className="du5-apply-btn"
                onClick={handleApply}
                disabled={isApplyDisabled()}
              >
                <Check size={16} />
                Maqsad maydoniga qo'llash
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DU5TemplatePanel;
