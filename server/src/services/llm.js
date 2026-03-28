const fetch = require('node-fetch');
const { db } = require('../db/database');

function getConfig() {
  const rows = db.prepare("SELECT key, value FROM app_settings WHERE key LIKE 'ai_%'").all();
  const config = {};
  for (const row of rows) config[row.key] = row.value;
  return config;
}

function isConfigured() {
  const config = getConfig();
  const provider = config.ai_provider;
  if (!provider) return false;
  if (provider === 'ollama') return !!config.ai_endpoint;
  if (provider === 'openai') return !!config.ai_api_key;
  if (provider === 'anthropic') return !!config.ai_api_key;
  return false;
}

async function chat(messages, options = {}) {
  const config = getConfig();
  const provider = config.ai_provider;
  const model = options.model || config.ai_model;

  if (!provider) throw new Error('AI provider not configured');

  const controller = new AbortController();
  // No timeout — user controls cancellation via UI abort button
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    if (provider === 'ollama') {
      const endpoint = config.ai_endpoint || 'http://localhost:11434';
      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model || 'llama3', messages, stream: false }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Ollama error (${response.status}): ${err}`);
      }
      const data = await response.json();
      return data.message?.content || '';
    }

    if (provider === 'openai') {
      const apiKey = config.ai_api_key;
      if (!apiKey) throw new Error('OpenAI API key not configured');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: model || 'gpt-4o-mini', messages }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI error (${response.status}): ${err}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }

    if (provider === 'anthropic') {
      const apiKey = config.ai_api_key;
      if (!apiKey) throw new Error('Anthropic API key not configured');

      // Convert messages to Anthropic format (separate system from user/assistant)
      const systemMsg = messages.find(m => m.role === 'system');
      const nonSystemMsgs = messages.filter(m => m.role !== 'system');

      const body = {
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: nonSystemMsgs,
      };
      if (systemMsg) body.system = systemMsg.content;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Anthropic error (${response.status}): ${err}`);
      }
      const data = await response.json();
      return data.content?.[0]?.text || '';
    }

    throw new Error(`Unknown AI provider: ${provider}`);
  } finally {
    // cleanup
  }
}

module.exports = { getConfig, isConfigured, chat };
