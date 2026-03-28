import React from 'react'
import { MapPin, Plus } from 'lucide-react'
import { useTranslation } from '../../i18n'

const CATEGORY_ICONS = {
  Hotel: '\u{1F3E8}', Restaurant: '\u{1F37D}\uFE0F', Attraction: '\u{1F3DB}\uFE0F', Museum: '\u{1F3DB}\uFE0F',
  Beach: '\u{1F3D6}\uFE0F', Park: '\u{1F33F}', Shopping: '\u{1F6CD}\uFE0F', Nightlife: '\u{1F3B5}',
  Cafe: '\u2615', Transport: '\u{1F68C}',
}

export default function RecommendationCard({ recommendation, onShowOnMap, onAddToTrip }) {
  const { t } = useTranslation()
  const r = recommendation
  const icon = CATEGORY_ICONS[r.category] || '\u{1F4CD}'

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      borderRadius: 12,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>{r.name}</div>
          {r.description && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>{r.description}</p>
          )}
        </div>
      </div>

      {(r.estimated_duration || r.estimated_price) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          {r.estimated_duration && <span>{'\u23F1'} {r.estimated_duration}</span>}
          {r.estimated_price && <span>{'\u{1F4B0}'} {r.estimated_price}</span>}
        </div>
      )}

      {r.why && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
          <span style={{ flexShrink: 0 }}>{'\u{1F4A1}'}</span>
          <span>{r.why}</span>
        </div>
      )}

      {r.best_time && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
          <span style={{ flexShrink: 0 }}>{'\u{1F550}'}</span>
          <span>{r.best_time}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {r.lat && r.lng && (
          <button
            onClick={() => onShowOnMap({ lat: r.lat, lng: r.lng })}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <MapPin size={13} />
            {t('discover.showOnMap')}
          </button>
        )}
        <button
          onClick={() => onAddToTrip(r)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '7px 10px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: 'var(--accent-text)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plus size={13} />
          {t('discover.addToTrip')}
        </button>
      </div>
    </div>
  )
}
