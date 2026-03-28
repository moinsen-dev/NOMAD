import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Sparkles, RefreshCw, Square } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { useToast } from '../shared/Toast'
import { aiApi } from '../../api/client'
import RecommendationCard from './RecommendationCard'

export default function DiscoverPanel({ open, onClose, tripId, days, onShowOnMap, onAddPlace }) {
  const { t } = useTranslation()
  const toast = useToast()

  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDayId, setSelectedDayId] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [configured, setConfigured] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const abortRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (open && configured === null) {
      aiApi.checkConfig()
        .then(data => setConfigured(data.configured))
        .catch(() => setConfigured(false))
    }
  }, [open, configured])

  // Elapsed timer during loading
  useEffect(() => {
    if (loading) {
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [loading])

  const handleAbort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setLoading(false)
    setError(null)
  }, [])

  const handleFetch = useCallback(async () => {
    if (!tripId) return
    // Abort any previous request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    try {
      const data = await aiApi.recommend(tripId, {
        context: 'destination',
        day_id: selectedDayId || undefined,
        custom_prompt: customPrompt || undefined,
      }, { signal: controller.signal })
      if (!controller.signal.aborted) {
        setRecommendations(data.recommendations || [])
        if (data.cached) toast.info(t('discover.cachedResults'))
      }
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED' || controller.signal.aborted) return
      const msg = err?.response?.data?.error || err.message || t('discover.fetchError')
      setError(msg)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [tripId, selectedDayId, customPrompt, toast, t])

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`
  }

  if (!open) return null

  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.25)',
          transition: 'opacity 0.2s',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 999,
        width: 400, maxWidth: '100vw',
        background: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border-primary)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
        fontFamily: 'inherit',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border-secondary)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
              {t('discover.title')}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)', border: 'none', borderRadius: '50%',
              width: 28, height: 28, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {configured === false ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
            }}>
              <span style={{ fontSize: 36, marginBottom: 12 }}>{'\u{1F916}'}</span>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {t('discover.notConfigured')}
              </p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
                {days && days.length > 0 && (
                  <select
                    value={selectedDayId}
                    onChange={e => setSelectedDayId(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-input)', color: 'var(--text-primary)',
                      fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                    }}
                  >
                    <option value="">{t('discover.allDays')}</option>
                    {days.map(d => (
                      <option key={d.id} value={d.id}>
                        {t('discover.day')} {d.day_number}{d.title ? ` - ${d.title}` : ''}
                      </option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder={t('discover.promptPlaceholder')}
                  onKeyDown={e => { if (e.key === 'Enter' && !loading) handleFetch() }}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 8,
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                    fontSize: 13, fontFamily: 'inherit',
                  }}
                />

                {!loading ? (
                  <button
                    onClick={handleFetch}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none',
                      background: 'var(--accent)', color: 'var(--accent-text)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Sparkles size={14} />
                    {t('discover.getRecommendations')}
                  </button>
                ) : (
                  <button
                    onClick={handleAbort}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Square size={12} fill="currentColor" />
                    {t('discover.abort')} ({formatElapsed(elapsed)})
                  </button>
                )}
              </div>

              {/* Results */}
              <div style={{ flex: 1, padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {loading && (
                  <>
                    <div style={{
                      textAlign: 'center', padding: '8px 0', fontSize: 12,
                      color: 'var(--text-muted)', fontStyle: 'italic',
                    }}>
                      {t('discover.loading')} {formatElapsed(elapsed)}
                    </div>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        background: 'var(--bg-secondary)', borderRadius: 12, padding: 14,
                        display: 'flex', flexDirection: 'column', gap: 10,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--border-primary)' }} />
                          <div style={{ height: 14, width: '60%', borderRadius: 4, background: 'var(--border-primary)' }} />
                        </div>
                        <div style={{ height: 10, width: '90%', borderRadius: 4, background: 'var(--border-primary)' }} />
                        <div style={{ height: 10, width: '70%', borderRadius: 4, background: 'var(--border-primary)' }} />
                      </div>
                    ))}
                  </>
                )}

                {error && !loading && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    padding: 24, textAlign: 'center',
                  }}>
                    <span style={{ fontSize: 28 }}>{'\u26A0\uFE0F'}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{error}</p>
                    <button
                      onClick={handleFetch}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 14px', borderRadius: 8,
                        border: '1px solid var(--border-primary)',
                        background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      <RefreshCw size={13} />
                      {t('discover.retry')}
                    </button>
                  </div>
                )}

                {!loading && !error && recommendations.length > 0 && (
                  recommendations.map((rec, i) => (
                    <RecommendationCard
                      key={i}
                      recommendation={rec}
                      onShowOnMap={onShowOnMap}
                      onAddToTrip={onAddPlace}
                    />
                  ))
                )}

                {!loading && !error && recommendations.length === 0 && configured !== null && (
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
                  }}>
                    <span style={{ fontSize: 36, marginBottom: 12 }}>{'\u2728'}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {t('discover.emptyHint')}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
