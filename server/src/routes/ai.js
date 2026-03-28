const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { db, canAccessTrip } = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');
const llm = require('../services/llm');

const router = express.Router({ mergeParams: true });

// --------------- Rate limiter ---------------
const aiLimiter = new Map();
const AI_LIMIT = 10;
const AI_WINDOW = 60 * 60 * 1000; // 1 hour

function checkAiRateLimit(userId) {
  const now = Date.now();
  const entry = aiLimiter.get(userId);
  if (!entry || now - entry.windowStart > AI_WINDOW) {
    aiLimiter.set(userId, { windowStart: now, count: 1 });
    return true;
  }
  if (entry.count >= AI_LIMIT) return false;
  entry.count++;
  return true;
}

// --------------- Preference merging ---------------
const BUDGET_ORDER = { budget: 0, medium: 1, luxury: 2 };
const MOBILITY_ORDER = { limited: 0, moderate: 1, full: 2 };

function mergePreferences(prefsList) {
  const merged = {
    interests: [],
    budget_level: 'luxury',
    mobility: 'full',
    food_preferences: [],
    avoid: [],
  };

  for (const prefs of prefsList) {
    const interests = safeParse(prefs.interests, []);
    const food = safeParse(prefs.food_preferences, []);
    const avoid = safeParse(prefs.avoid, []);

    merged.interests = [...new Set([...merged.interests, ...interests])];
    merged.food_preferences = [...new Set([...merged.food_preferences, ...food])];
    merged.avoid = [...new Set([...merged.avoid, ...avoid])];

    // Pick lowest budget
    if ((BUDGET_ORDER[prefs.budget_level] ?? 1) < (BUDGET_ORDER[merged.budget_level] ?? 1)) {
      merged.budget_level = prefs.budget_level;
    }
    // Pick most restrictive mobility
    if ((MOBILITY_ORDER[prefs.mobility] ?? 2) < (MOBILITY_ORDER[merged.mobility] ?? 2)) {
      merged.mobility = prefs.mobility;
    }
  }

  return merged;
}

function safeParse(val, fallback) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return fallback;
}

// --------------- System prompt ---------------
const SYSTEM_PROMPT = `You are a travel recommendation assistant for NOMAD, a collaborative trip planner.
You recommend activities and places based on the group's preferences and trip context.

RULES:
- Return ONLY a valid JSON array, no markdown, no explanations outside the JSON
- Return 5-8 recommendations
- Each recommendation MUST include: name, description (2-3 sentences), category (one of: Hotel, Restaurant, Attraction, Museum, Beach, Park, Shopping, Nightlife, Cafe, Transport), lat, lng, estimated_duration, estimated_price (in trip currency with currency code), why (1 sentence why this fits the group), best_time (when to visit)
- Do NOT recommend places the group has already planned
- Tailor recommendations to the group's combined preferences
- Consider weather and season when relevant
- Respond in the user's language`;

// --------------- POST /trips/:tripId/ai/recommend ---------------
router.post('/trips/:tripId/ai/recommend', authenticate, async (req, res) => {
  const { tripId } = req.params;

  try {
    // Check AI addon enabled
    const addon = db.prepare("SELECT enabled FROM addons WHERE id = 'ai'").get();
    if (!addon || !addon.enabled) {
      return res.status(403).json({ error: 'AI addon is not enabled' });
    }

    // Check AI is configured
    if (!llm.isConfigured()) {
      return res.status(503).json({ error: 'AI provider is not configured' });
    }

    // Verify trip access
    const trip = canAccessTrip(tripId, req.user.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Rate limit
    if (!checkAiRateLimit(req.user.id)) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
    }

    // Collect context
    const tripData = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
    const places = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.trip_id = ?
    `).all(tripId);

    // Get all trip members (owner + members)
    const members = db.prepare('SELECT user_id FROM trip_members WHERE trip_id = ?').all(tripId);
    const memberIds = [...new Set([tripData.user_id, ...members.map(m => m.user_id)])];

    // Get preferences for all members
    const placeholders = memberIds.map(() => '?').join(',');
    const allPrefs = db.prepare(`SELECT * FROM user_preferences WHERE user_id IN (${placeholders})`).all(...memberIds);
    const merged = allPrefs.length > 0 ? mergePreferences(allPrefs) : {
      interests: [], budget_level: 'medium', mobility: 'full', food_preferences: [], avoid: [],
    };

    // Compute destination from place coordinates centroid
    const geoPlaces = places.filter(p => p.lat && p.lng);
    let destinationHint = tripData.title; // fallback to trip title
    let centroidLat = null, centroidLng = null;
    if (geoPlaces.length > 0) {
      centroidLat = geoPlaces.reduce((s, p) => s + p.lat, 0) / geoPlaces.length;
      centroidLng = geoPlaces.reduce((s, p) => s + p.lng, 0) / geoPlaces.length;
      // Use the first place's address as destination hint
      const firstWithAddr = geoPlaces.find(p => p.address);
      if (firstWithAddr) destinationHint = firstWithAddr.address;
    }

    // Build user prompt
    const existingPlaces = places.map(p => `${p.name}${p.category_name ? ` (${p.category_name})` : ''}`).join(', ');
    const { day_id } = req.body;

    let weatherInfo = '';
    if (day_id && centroidLat) {
      try {
        const day = db.prepare('SELECT date FROM days WHERE id = ? AND trip_id = ?').get(day_id, tripId);
        if (day?.date) {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${centroidLat}&longitude=${centroidLng}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${day.date}&end_date=${day.date}`;
          const weatherResp = await fetch(url);
          if (weatherResp.ok) {
            const wd = await weatherResp.json();
            if (wd.daily?.temperature_2m_max?.[0] != null) {
              weatherInfo = `\nWeather for ${day.date}: ${Math.round(wd.daily.temperature_2m_min[0])}-${Math.round(wd.daily.temperature_2m_max[0])}°C`;
            }
          }
        }
      } catch { /* weather is optional */ }
    }

    const userPrompt = `Trip: "${tripData.title}"
Destination: ${destinationHint}
Dates: ${tripData.start_date || '?'} to ${tripData.end_date || '?'}
Group size: ${memberIds.length} people
Group interests: ${merged.interests.length ? merged.interests.join(', ') : 'general sightseeing'}
Budget level: ${merged.budget_level}
Mobility: ${merged.mobility}
Food preferences: ${merged.food_preferences.length ? merged.food_preferences.join(', ') : 'none specified'}
Avoid: ${merged.avoid.length ? merged.avoid.join(', ') : 'nothing specified'}
Already planned places: ${existingPlaces || 'none yet'}${weatherInfo}

Please recommend 5-8 activities or places for this trip.`;

    // Check cache by prompt hash
    const promptHash = crypto.createHash('sha256').update(userPrompt).digest('hex');
    const cached = db.prepare(
      "SELECT recommendations FROM ai_recommendations WHERE trip_id = ? AND prompt_hash = ? AND created_at > datetime('now', '-1 hour')"
    ).get(tripId, promptHash);

    if (cached) {
      return res.json({ recommendations: JSON.parse(cached.recommendations), cached: true });
    }

    // Call LLM
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    let recommendations = null;
    let attempts = 0;

    while (attempts < 2 && !recommendations) {
      attempts++;
      try {
        console.log(`[AI] Attempt ${attempts} — calling LLM...`);
        const response = await llm.chat(messages);
        console.log(`[AI] Raw response (first 500 chars):`, response.substring(0, 500));
        // Strip markdown code fences if present
        let cleaned = response.replace(/^[\s\S]*?(\[)/m, '$1'); // find first [
        const lastBracket = cleaned.lastIndexOf(']');
        if (lastBracket !== -1) cleaned = cleaned.substring(0, lastBracket + 1);
        cleaned = cleaned.trim();
        const parsed = JSON.parse(cleaned);

        if (!Array.isArray(parsed)) throw new Error('Response is not an array');

        // Validate required fields
        const valid = parsed.every(r =>
          r.name && r.description && r.category && r.lat != null && r.lng != null
        );
        if (!valid) throw new Error('Missing required fields in recommendations');

        recommendations = parsed;
      } catch (parseErr) {
        console.error(`[AI] Parse attempt ${attempts} failed:`, parseErr.message);
        if (attempts >= 2) {
          return res.status(502).json({ error: 'Failed to parse AI response' });
        }
      }
    }

    // Cache the result
    db.prepare(
      'INSERT INTO ai_recommendations (trip_id, user_id, prompt_hash, recommendations) VALUES (?, ?, ?, ?)'
    ).run(tripId, req.user.id, promptHash, JSON.stringify(recommendations));

    res.json({ recommendations, cached: false });
  } catch (err) {
    console.error('AI recommend error:', err);
    res.status(500).json({ error: 'Error generating recommendations' });
  }
});

// --------------- GET /ai/config (admin) ---------------
router.get('/ai/config', authenticate, adminOnly, (req, res) => {
  const config = llm.getConfig();
  res.json({
    provider: config.ai_provider || '',
    endpoint: config.ai_endpoint || '',
    model: config.ai_model || '',
    configured: llm.isConfigured(),
  });
});

// --------------- PUT /ai/config (admin) ---------------
router.put('/ai/config', authenticate, adminOnly, (req, res) => {
  const { provider, endpoint, model, api_key } = req.body;

  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }

  const upsert = db.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)");

  upsert.run('ai_provider', provider);
  if (endpoint !== undefined) upsert.run('ai_endpoint', endpoint);
  if (model !== undefined) upsert.run('ai_model', model);
  if (api_key !== undefined) upsert.run('ai_api_key', api_key);

  res.json({ success: true, configured: llm.isConfigured() });
});

// --------------- POST /ai/test (admin) ---------------
// Accepts config in body so user can test BEFORE saving
router.post('/ai/test', authenticate, adminOnly, async (req, res) => {
  try {
    const { provider, endpoint, model, api_key } = req.body;

    // If config provided in body, save it first so llm.chat can use it
    if (provider) {
      const upsert = db.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)");
      upsert.run('ai_provider', provider);
      if (endpoint) upsert.run('ai_endpoint', endpoint);
      if (model) upsert.run('ai_model', model);
      if (api_key) upsert.run('ai_api_key', api_key);
    }

    if (!llm.isConfigured()) {
      return res.json({ success: false, message: 'AI provider is not configured' });
    }
    const response = await llm.chat([
      { role: 'user', content: 'Reply with exactly: OK' },
    ]);
    res.json({ success: true, message: response.trim() });
  } catch (err) {
    res.json({ success: false, message: err.message || 'Connection failed' });
  }
});

// --------------- GET /preferences ---------------
router.get('/preferences', authenticate, (req, res) => {
  const prefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);

  if (!prefs) {
    return res.json({
      interests: [],
      budget_level: 'medium',
      mobility: 'full',
      food_preferences: [],
      avoid: [],
    });
  }

  res.json({
    interests: safeParse(prefs.interests, []),
    budget_level: prefs.budget_level,
    mobility: prefs.mobility,
    food_preferences: safeParse(prefs.food_preferences, []),
    avoid: safeParse(prefs.avoid, []),
  });
});

// --------------- PUT /preferences ---------------
router.put('/preferences', authenticate, (req, res) => {
  const { interests, budget_level, mobility, food_preferences, avoid } = req.body;

  db.prepare(`
    INSERT INTO user_preferences (user_id, interests, budget_level, mobility, food_preferences, avoid, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      interests = excluded.interests,
      budget_level = excluded.budget_level,
      mobility = excluded.mobility,
      food_preferences = excluded.food_preferences,
      avoid = excluded.avoid,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    req.user.id,
    JSON.stringify(interests || []),
    budget_level || 'medium',
    mobility || 'full',
    JSON.stringify(food_preferences || []),
    JSON.stringify(avoid || []),
  );

  res.json({ success: true });
});

module.exports = router;
