'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { FOOD_LIBRARY, calcFromLibrary } from '../lib/foods'

const C = {
  bg: '#faf8f5', bgWarm: '#f7f4f0', card: '#ffffff', border: '#ede8e0',
  borderLight: '#f2ede6', cream: '#f0ebe0', creamDark: '#e0d8cc',
  warm: '#c8b89a', warmDark: '#a8966e', warmPale: '#f5f0e8',
  text: '#2a2420', textMid: '#6a5a4a', textMuted: '#a09080', textDim: '#c8beb0',
  protein: '#8aaa8a', carbs: '#c4a870', fat: '#a89ab0', accent: '#3a2e28',
  white: '#ffffff', shadow: '#2a242008',
}

const TODAY = new Date().toISOString().split('T')[0]
const DEFAULT_TARGETS = { calories: 1600, protein: 120, carbs: 165, fat: 52 }
const DEFAULT_MEALS = [
  { id: 'm1', name: 'Breakfast', time: '7:30 – 8:00 am', emoji: '☀️', items: [] },
  { id: 'm2', name: 'Lunch', time: '1:00 pm', emoji: '🍃', items: [] },
  { id: 'm3', name: 'Afternoon Snack', time: '4:30 – 5:00 pm', emoji: '🫖', items: [] },
  { id: 'm4', name: 'Dinner', time: '8:00 pm', emoji: '🌙', items: [] },
]

// ── Dual Arc ──────────────────────────────────────────────────────────────────
function DualArc({ planned, actual, target, color, label }) {
  const size = 68, outerR = 28, innerR = 19
  const circ = r => 2 * Math.PI * r
  const cx = size / 2, cy = size / 2
  const pPct = Math.min(planned / target, 1)
  const aPct = Math.min(actual / target, 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={C.cream} strokeWidth="4" />
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.35"
            strokeDasharray={`${pPct * circ(outerR)} ${circ(outerR)}`} style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.34,1.56,0.64,1)' }} />
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={C.cream} strokeWidth="3.5" />
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={`${aPct * circ(innerR)} ${circ(innerR)}`} style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.text, lineHeight: 1 }}>{Math.round(actual)}</span>
          <span style={{ fontSize: 8, color: C.textDim, lineHeight: 1.3 }}>/{Math.round(planned)}</span>
        </div>
      </div>
      <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</span>
    </div>
  )
}

// ── Targets Editor Modal ───────────────────────────────────────────────────────
function TargetsModal({ targets, onSave, onClose }) {
  const [form, setForm] = useState({ ...targets })
  const set = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) || 0 }))
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#2a242077', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 380, border: `1px solid ${C.border}`, boxShadow: '0 20px 60px #2a242020' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.text, fontWeight: 700 }}>Daily Targets</span>
          <button onClick={onClose} style={{ background: C.cream, border: 'none', color: C.textMuted, width: 28, height: 28, borderRadius: 8, cursor: 'pointer' }}>✕</button>
        </div>
        <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>Adjust your daily macro targets. These are used for the planned ring on the dashboard.</p>
        {[
          { label: 'Calories (kcal)', key: 'calories', color: C.warm },
          { label: 'Protein (g)', key: 'protein', color: C.protein },
          { label: 'Carbs (g)', key: 'carbs', color: C.carbs },
          { label: 'Fat (g)', key: 'fat', color: C.fat },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.color }} />
              {f.label}
            </label>
            <input type="number" value={form[f.key]} onChange={e => set(f.key, e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgWarm, color: C.text, fontSize: 16, fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
        ))}
        <button onClick={() => onSave(form)} style={{ width: '100%', marginTop: 8, padding: '13px', borderRadius: 12, border: 'none', background: C.accent, color: C.white, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Save Targets</button>
      </div>
    </div>
  )
}

// ── Import from Chat Modal ─────────────────────────────────────────────────────
function ImportModal({ onImport, onClose }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async () => {
    if (!text.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `Parse this meal plan text and return ONLY valid JSON, no markdown, no explanation:
{
  "meals": [
    {
      "id": "m1",
      "name": "Breakfast",
      "time": "7:30 am",
      "emoji": "☀️",
      "items": [
        { "name": "food name", "amount": "150", "unit": "g", "calories": 93, "protein": 13, "carbs": 9, "fat": 0 }
      ]
    }
  ]
}
Rules:
- amount must be a number string (no units in the amount field, put units in the unit field separately)
- Use emojis: ☀️ breakfast, 🍃 lunch, 🫖 snack, 🌙 dinner, 🥗 other
- Estimate macros from food + amount if not explicitly given
- id should be m1, m2, m3 etc

Meal plan text to parse:
${text}`
          }]
        })
      })
      const data = await res.json()
      const raw = data.content?.map(i => i.text || '').join('') || ''
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      onImport(parsed.meals)
    } catch (e) {
      setError('Could not parse — try pasting the meal summary from your Claude chat.')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#2a242077', zIndex: 300, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: '22px 22px 0 0', padding: '22px 22px 40px', width: '100%', maxWidth: 480, margin: '0 auto', border: `1px solid ${C.border}`, boxShadow: '0 -8px 40px #2a242015' }}>
        <div style={{ width: 32, height: 3, background: C.cream, borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, color: C.text, fontWeight: 700 }}>Import from Chat</span>
          <button onClick={onClose} style={{ background: C.cream, border: 'none', color: C.textMuted, width: 28, height: 28, borderRadius: 8, cursor: 'pointer' }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
          Paste your meal plan from your Claude conversation — it will auto-parse all foods, amounts and macros for you.
        </p>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="e.g. Breakfast: 150g Greek yogurt, 1 banana, 1 egg, 80g berries, 15g honey. Lunch: 80g protein pasta, 229g chicken breast..."
          style={{ width: '100%', height: 140, background: C.bgWarm, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, color: C.text, fontSize: 13, resize: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
        {error && <p style={{ fontSize: 12, color: '#c97d6e', marginTop: 8 }}>{error}</p>}
        <button onClick={handle} disabled={loading || !text.trim()}
          style={{ width: '100%', marginTop: 14, padding: '14px', borderRadius: 12, border: 'none', background: loading || !text.trim() ? C.cream : C.accent, color: loading || !text.trim() ? C.textMuted : C.white, fontWeight: 600, fontSize: 14, cursor: loading || !text.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
          {loading ? 'Parsing your meals...' : 'Import Meal Plan'}
        </button>
      </div>
    </div>
  )
}

// ── Food Picker Modal ─────────────────────────────────────────────────────────
function FoodPickerModal({ initial, onSave, onDelete, onClose, isEdit }) {
  const [query, setQuery] = useState(initial?.name || '')
  const [selected, setSelected] = useState(initial ? FOOD_LIBRARY.find(f => f.name === initial.name) || null : null)
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '100')
  const [manual, setManual] = useState({ name: initial?.name || '', amount: initial?.amount || '100', unit: initial?.unit || 'g', calories: initial?.calories || 0, protein: initial?.protein || 0, carbs: initial?.carbs || 0, fat: initial?.fat || 0 })
  const [mode, setMode] = useState('library')
  const filtered = query.length > 0 ? FOOD_LIBRARY.filter(f => f.name.toLowerCase().includes(query.toLowerCase())) : FOOD_LIBRARY
  const computed = selected ? calcFromLibrary(selected, amount) : null

  const handleSave = () => {
    if (mode === 'library' && selected) {
      onSave({ name: selected.name, amount: String(amount), unit: selected.unit, ...calcFromLibrary(selected, amount) })
    } else {
      onSave({ name: manual.name, amount: String(manual.amount), unit: manual.unit, calories: +manual.calories || 0, protein: +manual.protein || 0, carbs: +manual.carbs || 0, fat: +manual.fat || 0 })
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#2a242077', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: '22px 22px 0 0', padding: '20px 20px 36px', width: '100%', maxWidth: 480, margin: '0 auto', border: `1px solid ${C.border}`, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ width: 32, height: 3, background: C.cream, borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.text, fontWeight: 700 }}>{isEdit ? 'Edit Food' : 'Add Food'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {isEdit && onDelete && <button onClick={onDelete} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.textMuted, padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>🗑 Remove</button>}
            <button onClick={onClose} style={{ background: C.cream, border: 'none', color: C.textMuted, width: 28, height: 28, borderRadius: 8, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ display: 'flex', background: C.cream, borderRadius: 10, padding: 3, marginBottom: 12, gap: 3 }}>
          {['library', 'manual'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer', background: mode === m ? C.white : 'transparent', color: mode === m ? C.accent : C.textMuted, fontWeight: mode === m ? 600 : 400, fontSize: 12 }}>
              {m === 'library' ? '🔍 Food Library' : '✏️ Manual Entry'}
            </button>
          ))}
        </div>
        {mode === 'library' ? (
          <>
            <input value={query} onChange={e => { setQuery(e.target.value); setSelected(null) }} placeholder="Search foods..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgWarm, color: C.text, fontSize: 13, fontFamily: 'inherit', marginBottom: 8, boxSizing: 'border-box' }} />
            {!selected && (
              <div style={{ maxHeight: 200, overflowY: 'auto', borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 12 }}>
                {filtered.map((f, i) => (
                  <div key={i} onClick={() => { setSelected(f); setQuery(f.name); setAmount(String(f.per)) }}
                    style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: C.text, borderBottom: i < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none', display: 'flex', justifyContent: 'space-between', background: C.white }}>
                    <span>{f.name}</span><span style={{ fontSize: 10, color: C.textMuted }}>per {f.per}{f.unit}</span>
                  </div>
                ))}
              </div>
            )}
            {selected && (
              <>
                <div style={{ background: C.warmPale, borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: C.warmDark, fontWeight: 600, marginBottom: 8 }}>{selected.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Amount ({selected.unit})</label>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <button onClick={() => { setSelected(null); setQuery('') }} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 18, cursor: 'pointer', marginTop: 16 }}>×</button>
                  </div>
                </div>
                {computed && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {[{ l: 'Calories', v: computed.calories, u: 'kcal', c: C.warm }, { l: 'Protein', v: computed.protein, u: 'g', c: C.protein }, { l: 'Carbs', v: computed.carbs, u: 'g', c: C.carbs }, { l: 'Fat', v: computed.fat, u: 'g', c: C.fat }].map(m => (
                      <div key={m.l} style={{ flex: 1, background: C.bgWarm, borderRadius: 10, padding: '8px 4px', textAlign: 'center', border: `1px solid ${C.borderLight}` }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: m.c }}>{Math.round(m.v * 10) / 10}</div>
                        <div style={{ fontSize: 9, color: C.textMuted }}>{m.u}</div>
                        <div style={{ fontSize: 8, color: C.textDim }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          [{ label: 'Food name', key: 'name', type: 'text' }, { label: 'Amount', key: 'amount', type: 'text' }, { label: 'Unit (g/ml/egg...)', key: 'unit', type: 'text' }, { label: 'Calories (kcal)', key: 'calories', type: 'number' }, { label: 'Protein (g)', key: 'protein', type: 'number' }, { label: 'Carbs (g)', key: 'carbs', type: 'number' }, { label: 'Fat (g)', key: 'fat', type: 'number' }].map(f => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input type={f.type} value={manual[f.key]} onChange={e => setManual(m => ({ ...m, [f.key]: f.type === 'number' ? (+e.target.value || 0) : e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.bgWarm, color: C.text, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          ))
        )}
        <button onClick={handleSave} disabled={mode === 'library' ? !selected : !manual.name.trim()}
          style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', marginTop: 6, background: (mode === 'library' ? selected : manual.name.trim()) ? C.accent : C.cream, color: (mode === 'library' ? selected : manual.name.trim()) ? C.white : C.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {isEdit ? 'Save Changes' : 'Add to Meal'}
        </button>
      </div>
    </div>
  )
}

// ── Meal Card ─────────────────────────────────────────────────────────────────
function MealCard({ meal, checkedItems, onToggle, onUpdateMeal }) {
  const [open, setOpen] = useState(true)
  const [editIdx, setEditIdx] = useState(null)
  const [adding, setAdding] = useState(false)
  const [editingMeal, setEditingMeal] = useState(false)
  const [mealForm, setMealForm] = useState({ name: meal.name, time: meal.time, emoji: meal.emoji })

  const totals = meal.items.reduce((a, i) => ({ cal: a.cal + (i.calories || 0), p: a.p + (i.protein || 0), c: a.c + (i.carbs || 0), f: a.f + (i.fat || 0) }), { cal: 0, p: 0, c: 0, f: 0 })
  const eaten = meal.items.filter((_, idx) => checkedItems[`${meal.id}-${idx}`]).length
  const done = eaten === meal.items.length && meal.items.length > 0

  return (
    <>
      <div style={{ background: done ? C.warmPale : C.white, borderRadius: 20, marginBottom: 10, overflow: 'hidden', border: `1px solid ${done ? C.creamDark : C.border}`, boxShadow: `0 2px 20px ${C.shadow}`, transition: 'all 0.3s' }}>
        <div style={{ padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={() => setOpen(!open)} style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: done ? C.creamDark : C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>{meal.emoji}</div>
          <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 700, color: C.text }}>{meal.name}</span>
              {done && <span style={{ fontSize: 9, background: C.warm, color: C.white, padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>done</span>}
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>{meal.time} · {Math.round(totals.cal)} kcal · {eaten}/{meal.items.length}</div>
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: C.protein, fontWeight: 600 }}>P{Math.round(totals.p)}</span>
            <span style={{ fontSize: 9, color: C.carbs, fontWeight: 600 }}>C{Math.round(totals.c)}</span>
            <span style={{ fontSize: 9, color: C.fat, fontWeight: 600 }}>F{Math.round(totals.f)}</span>
            <button onClick={() => setEditingMeal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.textDim }}>✏️</button>
            <span onClick={() => setOpen(!open)} style={{ color: C.textDim, fontSize: 10, cursor: 'pointer' }}>{open ? '▴' : '▾'}</span>
          </div>
        </div>
        {open && (
          <div style={{ borderTop: `1px solid ${C.borderLight}` }}>
            {meal.items.map((item, i) => {
              const ck = checkedItems[`${meal.id}-${i}`]
              return (
                <div key={i} style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.borderLight}`, background: ck ? C.warmPale : 'transparent', transition: 'background 0.15s' }}>
                  <div onClick={() => onToggle(`${meal.id}-${i}`)} style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, cursor: 'pointer', border: `1.5px solid ${ck ? C.warm : C.creamDark}`, background: ck ? C.warm : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {ck && <span style={{ fontSize: 8, color: C.white, fontWeight: 800 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onToggle(`${meal.id}-${i}`)}>
                    <div style={{ fontSize: 12, color: ck ? C.textMuted : C.text, fontWeight: 500, textDecoration: ck ? 'line-through' : 'none' }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: C.textDim }}>{item.amount}{item.unit === 'g' || item.unit === 'ml' ? item.unit : ' ' + item.unit}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 4 }}>
                    <div style={{ fontSize: 11, color: ck ? C.textDim : C.textMid, fontWeight: 600 }}>{Math.round(item.calories)} kcal</div>
                    <div style={{ fontSize: 9, color: C.textDim }}>P{Math.round(item.protein)} C{Math.round(item.carbs)} F{Math.round(item.fat)}</div>
                  </div>
                  <button onClick={() => setEditIdx(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: C.textDim }}>✏️</button>
                </div>
              )
            })}
            <div onClick={() => setAdding(true)} style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px dashed ${C.creamDark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.textDim }}>+</div>
              <span style={{ fontSize: 12, color: C.textMuted }}>Add food item</span>
            </div>
          </div>
        )}
      </div>

      {editIdx !== null && meal.items[editIdx] && (
        <FoodPickerModal initial={meal.items[editIdx]} isEdit={true} onClose={() => setEditIdx(null)}
          onSave={u => { onUpdateMeal({ ...meal, items: meal.items.map((it, i) => i === editIdx ? u : it) }); setEditIdx(null) }}
          onDelete={() => { onUpdateMeal({ ...meal, items: meal.items.filter((_, i) => i !== editIdx) }); setEditIdx(null) }} />
      )}
      {adding && <FoodPickerModal initial={null} isEdit={false} onClose={() => setAdding(false)} onSave={item => { onUpdateMeal({ ...meal, items: [...meal.items, item] }); setAdding(false) }} />}
      {editingMeal && (
        <div style={{ position: 'fixed', inset: 0, background: '#2a242066', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditingMeal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 24, padding: '26px 22px', width: '100%', maxWidth: 420, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.text, fontWeight: 700 }}>Edit Meal</span>
              <button onClick={() => setEditingMeal(false)} style={{ background: C.cream, border: 'none', color: C.textMuted, width: 28, height: 28, borderRadius: 8, cursor: 'pointer' }}>✕</button>
            </div>
            {[{ label: 'Meal name', key: 'name' }, { label: 'Time', key: 'time' }, { label: 'Emoji', key: 'emoji' }].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input value={mealForm[f.key]} onChange={e => setMealForm(m => ({ ...m, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgWarm, color: C.text, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
            ))}
            <button onClick={() => { onUpdateMeal({ ...meal, ...mealForm }); setEditingMeal(false) }} style={{ width: '100%', marginTop: 6, padding: '13px', borderRadius: 12, border: 'none', background: C.accent, color: C.white, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Save</button>
          </div>
        </div>
      )}
    </>
  )
}

// ── History View ──────────────────────────────────────────────────────────────
function HistoryView({ history, onLoad }) {
  if (!history.length) return (
    <div style={{ textAlign: 'center', padding: '70px 20px' }}>
      <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.3 }}>○</div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.textMid, marginBottom: 8 }}>Your journal is empty</p>
      <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>Save your first day to begin tracking.</p>
    </div>
  )
  return (
    <div style={{ paddingBottom: 100 }}>
      {history.map((entry, i) => {
        const t = (entry.meals || []).flatMap(m => m.items || []).reduce((a, x) => ({ cal: a.cal + (x.calories || 0), p: a.p + (x.protein || 0) }), { cal: 0, p: 0 })
        const d = new Date(entry.date)
        return (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, marginBottom: 8, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.cream, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.warmDark, lineHeight: 1 }}>{d.getDate()}</span>
              <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase' }}>{d.toLocaleString('en-GB', { month: 'short' })}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: C.text, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>{d.toLocaleDateString('en-GB', { weekday: 'long' })}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{Math.round(t.cal)} kcal · {Math.round(t.p)}g protein · {(entry.meals || []).length} meals</div>
            </div>
            <button onClick={() => onLoad(entry)} style={{ background: C.cream, border: 'none', color: C.textMid, padding: '7px 14px', borderRadius: 9, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>View</button>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Tracker ──────────────────────────────────────────────────────────────
export default function Tracker({ session }) {
  const [tab, setTab] = useState('today')
  const [meals, setMeals] = useState(DEFAULT_MEALS)
  const [checked, setChecked] = useState({})
  const [targets, setTargets] = useState(DEFAULT_TARGETS)
  const [history, setHistory] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showTargets, setShowTargets] = useState(false)
  const userId = session.user.id

  useEffect(() => {
    const load = async () => {
      const { data: todayData } = await supabase
        .from('daily_logs').select('*').eq('user_id', userId).eq('date', TODAY).single()
      if (todayData) {
        setMeals(todayData.meals || DEFAULT_MEALS)
        setChecked(todayData.checked || {})
      }

      const { data: profileData } = await supabase
        .from('user_profiles').select('targets').eq('user_id', userId).single()
      if (profileData?.targets) setTargets(profileData.targets)

      const { data: histData } = await supabase
        .from('daily_logs').select('*').eq('user_id', userId).neq('date', TODAY)
        .order('date', { ascending: false }).limit(30)
      if (histData) setHistory(histData)
      setLoaded(true)
    }
    load()
  }, [userId])

  const persist = useCallback(async (newMeals, newChecked) => {
    await supabase.from('daily_logs').upsert(
      { user_id: userId, date: TODAY, meals: newMeals, checked: newChecked, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    )
  }, [userId])

  const updateMeals = (newMeals) => { setMeals(newMeals); persist(newMeals, checked) }
  const updateChecked = (newChecked) => { setChecked(newChecked); persist(meals, newChecked) }
  const updateMeal = (updatedMeal) => updateMeals(meals.map(m => m.id === updatedMeal.id ? updatedMeal : m))

  const saveTargets = async (newTargets) => {
    setTargets(newTargets)
    setShowTargets(false)
    await supabase.from('user_profiles').upsert(
      { user_id: userId, targets: newTargets, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  }

  const saveToJournal = async () => {
    setSaving(true)
    await persist(meals, checked)
    const { data } = await supabase.from('daily_logs').select('*').eq('user_id', userId).neq('date', TODAY).order('date', { ascending: false }).limit(30)
    if (data) setHistory(data)
    setSaving(false)
    alert('Saved to your journal ✓')
  }

  const handleImport = (importedMeals) => {
    updateMeals(importedMeals)
    setShowImport(false)
    setTab('today')
  }

  const addMeal = () => {
    const newMeal = { id: `m${Date.now()}`, name: 'New Meal', time: '—', emoji: '🥗', items: [] }
    updateMeals([...meals, newMeal])
  }

  const signOut = () => supabase.auth.signOut()

  if (!loaded) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 36, marginBottom: 12 }}>🧸</div><div style={{ fontSize: 13, color: C.textMuted }}>Loading your journal...</div></div>
    </div>
  )

  const allItems = meals.flatMap(m => m.items)
  const planned = allItems.reduce((a, i) => ({ cal: a.cal + (i.calories || 0), p: a.p + (i.protein || 0), c: a.c + (i.carbs || 0), f: a.f + (i.fat || 0) }), { cal: 0, p: 0, c: 0, f: 0 })
  const actual = meals.flatMap(m => m.items.filter((_, idx) => checked[`${m.id}-${idx}`])).reduce((a, i) => ({ cal: a.cal + (i.calories || 0), p: a.p + (i.protein || 0), c: a.c + (i.carbs || 0), f: a.f + (i.fat || 0) }), { cal: 0, p: 0, c: 0, f: 0 })
  const calPct = Math.min((actual.cal / targets.calories) * 100, 100)
  const totalItems = allItems.length
  const totalChecked = meals.reduce((acc, m) => acc + m.items.filter((_, idx) => checked[`${m.id}-${idx}`]).length, 0)

  return (
    <div style={{ background: C.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', fontFamily: "'DM Sans', sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(170deg, #f5f0e8 0%, #ede8de 40%, #f0ebe2 100%)', padding: '44px 22px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '60% 40% 55% 45%', background: '#ffffff40' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '45% 55% 40% 60%', background: '#e8e0d040' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 9, color: C.warm, letterSpacing: 3.5, textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>wellness journal</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: C.text, lineHeight: 1.1, fontWeight: 700 }}>Princess<br />Teddy 🧸</h1>
              <p style={{ fontSize: 11, color: C.textMid, marginTop: 8, fontStyle: 'italic' }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ position: 'relative', width: 86, height: 86 }}>
                <svg width="86" height="86" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="43" cy="43" r="35" fill="none" stroke={C.creamDark} strokeWidth="4" />
                  <circle cx="43" cy="43" r="35" fill="none" stroke={C.warmDark} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${calPct / 100 * 2 * Math.PI * 35} ${2 * Math.PI * 35}`} style={{ transition: 'stroke-dasharray 0.9s ease' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1 }}>{Math.round(actual.cal)}</span>
                  <span style={{ fontSize: 8, color: C.textMuted, marginTop: 1 }}>eaten</span>
                  <span style={{ fontSize: 8, color: C.warm, fontWeight: 600 }}>/{targets.calories}</span>
                </div>
              </div>
              <button onClick={signOut} style={{ background: 'none', border: `1px solid ${C.creamDark}`, color: C.textMuted, padding: '4px 10px', borderRadius: 8, fontSize: 10, cursor: 'pointer' }}>sign out</button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 2, background: C.creamDark, borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${calPct}%`, background: C.warmDark, borderRadius: 1, transition: 'width 0.8s ease' }} />
            </div>
            <span style={{ fontSize: 10, color: C.textMuted, whiteSpace: 'nowrap' }}>{totalChecked} of {totalItems} eaten</span>
          </div>

          {/* Dual macro rings */}
          <div style={{ background: '#ffffff70', borderRadius: 18, padding: '14px 8px 10px', border: `1px solid ${C.border}`, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 16, height: 3, borderRadius: 2, background: C.warm, opacity: 0.35 }} />
                  <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Planned</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 16, height: 3, borderRadius: 2, background: C.warm }} />
                  <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>Eaten</span>
                </div>
              </div>
              <button onClick={() => setShowTargets(true)} style={{ background: C.warmPale, border: `1px solid ${C.creamDark}`, color: C.textMid, padding: '3px 10px', borderRadius: 8, fontSize: 10, cursor: 'pointer', fontWeight: 500 }}>✏️ Edit targets</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <DualArc label="Protein" planned={planned.p} actual={actual.p} target={targets.protein} color={C.protein} />
              <div style={{ width: 1, background: C.borderLight, margin: '6px 0' }} />
              <DualArc label="Carbs" planned={planned.c} actual={actual.c} target={targets.carbs} color={C.carbs} />
              <div style={{ width: 1, background: C.borderLight, margin: '6px 0' }} />
              <DualArc label="Fat" planned={planned.f} actual={actual.f} target={targets.fat} color={C.fat} />
              <div style={{ width: 1, background: C.borderLight, margin: '6px 0' }} />
              <DualArc label="Cals" planned={planned.cal} actual={actual.cal} target={targets.calories} color={C.warm} />
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 9, color: C.textDim }}>inner = eaten · outer = planned · number = eaten / planned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '12px 16px 0', background: C.bg, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 12px #2a242008' }}>
        <div style={{ display: 'flex', gap: 4, background: C.cream, borderRadius: 13, padding: 4, marginBottom: 12 }}>
          {[{ key: 'today', label: 'Today' }, { key: 'history', label: 'Journal' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer', background: tab === t.key ? C.white : 'transparent', color: tab === t.key ? C.accent : C.textMuted, fontWeight: tab === t.key ? 600 : 400, fontSize: 13, transition: 'all 0.2s' }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 14px 120px', background: C.bg }}>
        {tab === 'today' && (
          <>
            {meals.map(meal => (
              <MealCard key={meal.id} meal={meal} checkedItems={checked}
                onToggle={key => updateChecked({ ...checked, [key]: !checked[key] })}
                onUpdateMeal={updateMeal} />
            ))}
            <button onClick={addMeal} style={{ width: '100%', padding: '11px', borderRadius: 16, marginBottom: 10, border: `1.5px dashed ${C.creamDark}`, background: 'transparent', color: C.textMuted, fontSize: 13, cursor: 'pointer' }}>+ Add meal</button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowImport(true)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, color: C.textMid, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>✨ Import from Chat</button>
              <button onClick={saveToJournal} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: saving ? C.cream : C.accent, color: saving ? C.textMuted : C.white, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                {saving ? 'Saving...' : 'Save to Journal'}
              </button>
            </div>
          </>
        )}
        {tab === 'history' && (
          <HistoryView history={history} onLoad={entry => { setMeals(entry.meals || DEFAULT_MEALS); setChecked(entry.checked || {}); setTab('today') }} />
        )}
      </div>

      {showImport && <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />}
      {showTargets && <TargetsModal targets={targets} onSave={saveTargets} onClose={() => setShowTargets(false)} />}
    </div>
  )
}
