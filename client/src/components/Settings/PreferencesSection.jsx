import React, { useState, useEffect } from 'react'
import { Heart, Save, X } from 'lucide-react'
import { preferencesApi } from '../../api/client'
import { useTranslation } from '../../i18n'
import { useToast } from '../shared/Toast'

const INTEREST_OPTIONS = ['culture', 'food', 'outdoor', 'nightlife', 'adventure', 'relaxation', 'family']
const FOOD_OPTIONS = ['vegetarian', 'vegan', 'halal', 'kosher', 'local_cuisine']
const BUDGET_OPTIONS = ['budget', 'medium', 'luxury']
const MOBILITY_OPTIONS = ['full', 'limited']

function ChipToggle({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 500,
        border: '1px solid',
        borderColor: active ? 'var(--accent-primary)' : 'var(--border-primary)',
        background: active ? 'var(--accent-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        cursor: 'pointer', transition: 'all 0.15s',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
      <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-secondary)' }}>
        <Icon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  )
}

export default function PreferencesSection() {
  const { t } = useTranslation()
  const toast = useToast()

  const [preferences, setPreferences] = useState({
    interests: [],
    budget: 'medium',
    food_preferences: [],
    avoid: [],
    mobility: 'full',
  })
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [avoidInput, setAvoidInput] = useState('')

  useEffect(() => {
    preferencesApi.get()
      .then(data => {
        if (data.preferences) setPreferences(data.preferences)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const toggleArrayItem = (field, item) => {
    setPreferences(prev => {
      const arr = prev[field] || []
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      }
    })
  }

  const handleAddAvoid = (e) => {
    if (e.key === 'Enter' && avoidInput.trim()) {
      e.preventDefault()
      const val = avoidInput.trim()
      if (!(preferences.avoid || []).includes(val)) {
        setPreferences(prev => ({ ...prev, avoid: [...(prev.avoid || []), val] }))
      }
      setAvoidInput('')
    }
  }

  const handleRemoveAvoid = (item) => {
    setPreferences(prev => ({ ...prev, avoid: (prev.avoid || []).filter(i => i !== item) }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await preferencesApi.update(preferences)
      toast.success(t('settings.toast.preferencesSaved') || 'Preferences saved')
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  return (
    <Section title={t('settings.travelPreferences') || 'Travel Preferences'} icon={Heart}>
      {/* Interests */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          {t('settings.interests') || 'Interests'}
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map(opt => (
            <ChipToggle
              key={opt}
              label={t(`settings.interest.${opt}`) || opt.charAt(0).toUpperCase() + opt.slice(1)}
              active={(preferences.interests || []).includes(opt)}
              onClick={() => toggleArrayItem('interests', opt)}
            />
          ))}
        </div>
      </div>

      {/* Budget Level */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          {t('settings.budgetLevel') || 'Budget Level'}
        </label>
        <div className="flex gap-3">
          {BUDGET_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setPreferences(prev => ({ ...prev, budget: opt }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                border: preferences.budget === opt ? '2px solid var(--text-primary)' : '2px solid var(--border-primary)',
                background: preferences.budget === opt ? 'var(--bg-hover)' : 'var(--bg-card)',
                color: 'var(--text-primary)',
                transition: 'all 0.15s',
              }}
            >
              {t(`settings.budget.${opt}`) || opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Food Preferences */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          {t('settings.foodPreferences') || 'Food Preferences'}
        </label>
        <div className="flex flex-wrap gap-2">
          {FOOD_OPTIONS.map(opt => (
            <ChipToggle
              key={opt}
              label={t(`settings.food.${opt}`) || opt.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              active={(preferences.food_preferences || []).includes(opt)}
              onClick={() => toggleArrayItem('food_preferences', opt)}
            />
          ))}
        </div>
      </div>

      {/* Avoid */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          {t('settings.avoid') || 'Avoid'}
        </label>
        <div
          style={{
            border: '1px solid var(--border-primary)',
            borderRadius: 8,
            padding: 8,
            minHeight: 44,
            background: 'var(--bg-card)',
          }}
        >
          <div className="flex flex-wrap gap-2" style={{ marginBottom: (preferences.avoid || []).length > 0 ? 8 : 0 }}>
            {(preferences.avoid || []).map(item => (
              <span
                key={item}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                  background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                }}
              >
                {item}
                <button
                  onClick={() => handleRemoveAvoid(item)}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'flex', color: 'var(--text-muted)' }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={avoidInput}
            onChange={e => setAvoidInput(e.target.value)}
            onKeyDown={handleAddAvoid}
            placeholder={t('settings.avoidPlaceholder') || 'Type something + Enter'}
            style={{
              width: '100%', border: 'none', outline: 'none', fontSize: 13,
              background: 'transparent', color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Mobility */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          {t('settings.mobility') || 'Mobility'}
        </label>
        <div className="flex gap-3">
          {MOBILITY_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setPreferences(prev => ({ ...prev, mobility: opt }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                border: preferences.mobility === opt ? '2px solid var(--text-primary)' : '2px solid var(--border-primary)',
                background: preferences.mobility === opt ? 'var(--bg-hover)' : 'var(--bg-card)',
                color: 'var(--text-primary)',
                transition: 'all 0.15s',
              }}
            >
              {t(`settings.mobility.${opt}`) || (opt === 'full' ? 'Full mobility' : 'Limited mobility')}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700 disabled:bg-slate-400"
      >
        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
        {t('settings.savePreferences') || 'Save Preferences'}
      </button>
    </Section>
  )
}
