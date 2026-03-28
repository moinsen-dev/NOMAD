import React, { useState, useEffect } from 'react'
import { Sparkles, Save, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { aiApi } from '../../api/client'
import { useTranslation } from '../../i18n'
import { useToast } from '../shared/Toast'
import CustomSelect from '../shared/CustomSelect'

const PROVIDER_OPTIONS = [
  { value: 'none', labelKey: 'admin.ai.providerNone' },
  { value: 'ollama', labelKey: 'admin.ai.providerOllama' },
  { value: 'openai', labelKey: 'admin.ai.providerOpenAI' },
  { value: 'anthropic', labelKey: 'admin.ai.providerAnthropic' },
]

const DEFAULT_ENDPOINTS = {
  ollama: 'http://localhost:11434',
  openai: 'https://api.openai.com',
  anthropic: 'https://api.anthropic.com',
}

export default function AIConfigPanel() {
  const { t } = useTranslation()
  const toast = useToast()

  const [config, setConfig] = useState({
    provider: 'none',
    endpoint: '',
    model: '',
    api_key: '',
  })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    aiApi.getConfig()
      .then(data => {
        setConfig({
          provider: data.provider || 'none',
          endpoint: data.endpoint || '',
          model: data.model || '',
          api_key: data.api_key || '',
        })
      })
      .catch(() => {})
  }, [])

  const handleProviderChange = (provider) => {
    setConfig(prev => ({
      ...prev,
      provider,
      endpoint: DEFAULT_ENDPOINTS[provider] || '',
      api_key: provider === 'ollama' ? '' : prev.api_key,
    }))
    setTestResult(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await aiApi.updateConfig(config)
      toast.success(t('admin.ai.saved') || 'AI configuration saved')
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await aiApi.testConnection(config)
      setTestResult(result.success ? 'success' : 'error')
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
      <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-secondary)' }}>
        <Sparkles className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        <div>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('admin.ai.title') || 'AI Configuration'}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{t('admin.ai.subtitle') || 'Configure AI provider for smart recommendations'}</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {/* Provider */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            {t('admin.ai.provider') || 'Provider'}
          </label>
          <CustomSelect
            value={config.provider}
            onChange={handleProviderChange}
            options={PROVIDER_OPTIONS.map(o => ({
              value: o.value,
              label: t(o.labelKey) || o.value.charAt(0).toUpperCase() + o.value.slice(1),
            }))}
          />
        </div>

        {config.provider !== 'none' && (
          <>
            {/* Endpoint */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('admin.ai.endpoint') || 'Endpoint URL'}
              </label>
              <input
                type="text"
                value={config.endpoint}
                onChange={e => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder={DEFAULT_ENDPOINTS[config.provider] || 'https://...'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>

            {/* API Key (not for Ollama) */}
            {config.provider !== 'ollama' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {t('admin.ai.apiKey') || 'API Key'}
                </label>
                <input
                  type="password"
                  value={config.api_key}
                  onChange={e => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
            )}

            {/* Model */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('admin.ai.model') || 'Model'}
              </label>
              <input
                type="text"
                value={config.model}
                onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                placeholder={
                  config.provider === 'ollama' ? 'e.g., llama3.1' :
                  config.provider === 'openai' ? 'e.g., gpt-4o-mini' :
                  'e.g., claude-sonnet-4-5-20250514'
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleTest}
                disabled={testing || !config.endpoint || !config.model}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {t('admin.ai.testConnection') || 'Test Connection'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700 disabled:bg-slate-400"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {t('common.save') || 'Save'}
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className="flex items-center gap-2 text-sm" style={{ color: testResult === 'success' ? '#16a34a' : '#ef4444' }}>
                {testResult === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {testResult === 'success'
                  ? (t('admin.ai.connected') || 'Connected')
                  : (t('admin.ai.connectionFailed') || 'Connection failed')
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
