# AI-Powered Activity Recommendations for NOMAD

**Date:** 2026-03-27
**Status:** Approved
**Scope:** v1 — destination-based recommendations with explicit user preferences

## Overview

Add AI-powered activity and place recommendations to NOMAD. Users set travel preferences (interests, budget, food, mobility), and the AI suggests places/activities tailored to the group's combined profile and trip context. Recommendations are one-click-addable as trip places.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM provider | Configurable: Ollama / OpenAI / Anthropic | Matches NOMAD's pattern (Google Maps optional, OSM fallback). Respects data sovereignty. |
| User preferences | Explicit profile in settings | Clear input, no cold-start guessing. Minimal: 5-6 fields. |
| UI placement | Discover drawer in TripPlannerPage | Non-intrusive, doesn't compete with existing panels. |
| Knowledge source | LLM world knowledge only (v1) | No additional API dependencies. Sufficient for destination recommendations. |
| Scope | Destination recommendations only (v1) | En-route/stopover suggestions deferred to v2. |
| Recommendation action | One-click add to trip | Key UX differentiator. LLM returns structured JSON with coordinates. |
| Architecture | Server-side endpoint | Keys stay on server, matches existing Express pattern, client stays thin. |

## Data Model

### New Table: `user_preferences`

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  interests TEXT NOT NULL DEFAULT '[]',
  budget_level TEXT NOT NULL DEFAULT 'medium',
  mobility TEXT NOT NULL DEFAULT 'full',
  food_preferences TEXT NOT NULL DEFAULT '[]',
  avoid TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| Field | Type | Values |
|-------|------|--------|
| interests | JSON array | `["culture","food","outdoor","nightlife","adventure","relaxation","family"]` |
| budget_level | string | `"budget"` / `"medium"` / `"luxury"` |
| mobility | string | `"full"` / `"limited"` |
| food_preferences | JSON array | `["vegetarian","vegan","halal","kosher","local_cuisine"]` |
| avoid | JSON array | Free-text strings, e.g. `["heights","crowds","long_walks"]` |

### New Table: `ai_recommendations`

```sql
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prompt_hash TEXT NOT NULL,
  recommendations TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Caches LLM responses. `prompt_hash` is SHA256 of the effective prompt to detect identical requests.

### AI Configuration (in existing `app_settings`)

| Key | Example Value | Description |
|-----|--------------|-------------|
| `ai_provider` | `"none"` / `"ollama"` / `"openai"` / `"anthropic"` | Active LLM provider |
| `ai_endpoint` | `"http://localhost:11434"` | Ollama URL or Cloud base URL |
| `ai_model` | `"llama3.1"` / `"gpt-4o-mini"` / `"claude-sonnet-4-5-20250514"` | Model identifier |
| `ai_api_key` | `"sk-..."` | API key (empty for Ollama) |

### Addon Registration

```js
{ name: 'ai', description: 'AI-powered activity recommendations',
  type: 'global', icon: '✨', enabled: false, config: '{}' }
```

Disabled by default. Admin must enable and configure a provider.

## Server API

### New File: `server/src/routes/ai.js`

#### `POST /api/trips/:tripId/ai/recommend`

Authenticated. Requires AI addon enabled and provider configured.

**Request:**
```json
{
  "context": "destination",
  "day_id": null,
  "custom_prompt": null
}
```

- `context`: `"destination"` (v1). Reserved for `"enroute"` (v2).
- `day_id`: Optional. If set, includes day-specific weather and already-planned activities.
- `custom_prompt`: Optional free-text from user, e.g. "Something for a rainy day".

**Response:**
```json
{
  "recommendations": [
    {
      "name": "Kolosseum",
      "description": "Das ikonische Amphitheater aus dem Jahr 80 n.Chr. bietet faszinierende Einblicke in die römische Geschichte.",
      "category": "Attraction",
      "lat": 41.8902,
      "lng": 12.4922,
      "estimated_duration": "2-3h",
      "estimated_price": "16 EUR",
      "why": "Passt zu eurem Interesse an Kultur und Geschichte",
      "best_time": "Vormittags, weniger Andrang"
    }
  ],
  "cached": false
}
```

**Server logic:**
1. Verify trip access (`canAccessTrip`)
2. Check AI addon enabled and provider configured
3. Check rate limit (10/hour/user)
4. Compute prompt hash, check `ai_recommendations` cache
5. If not cached: collect context (trip, places, preferences, weather), build prompt, call LLM
6. Parse JSON response, validate structure
7. On parse failure: retry once with stricter prompt
8. Cache result, return to client

#### `GET /api/ai/config` (Admin only)

Returns current AI configuration (provider, endpoint, model — not the API key).

#### `PUT /api/ai/config` (Admin only)

Sets AI configuration. Stores in `app_settings`.

#### `GET /api/preferences` (Authenticated)

Returns current user's preferences. Returns defaults if none set.

#### `PUT /api/preferences` (Authenticated)

Upserts user preferences.

### New File: `server/src/services/llm.js`

LLM provider abstraction.

```
exports:
  isConfigured()          → boolean (checks app_settings)
  chat(messages, options) → string (calls configured provider)
```

**Provider implementations:**

| Provider | Endpoint | Auth |
|----------|---------|------|
| Ollama | `POST {endpoint}/api/chat` | None |
| OpenAI | `POST https://api.openai.com/v1/chat/completions` | `Authorization: Bearer {key}` |
| Anthropic | `POST https://api.anthropic.com/v1/messages` | `x-api-key: {key}` |

All three return text. Server parses as JSON.

Options: `{ timeout: 30000 }` — 30s timeout for LLM calls.

## Prompt Architecture

### System Prompt

```
You are a travel recommendation assistant for NOMAD, a collaborative trip planner.
You recommend activities and places based on the group's preferences and trip context.

RULES:
- Return ONLY valid JSON array, no markdown, no explanations outside the JSON
- Return 5-8 recommendations
- Each recommendation MUST include: name, description (2-3 sentences),
  category (one of: Hotel, Restaurant, Attraction, Museum, Beach, Park,
  Shopping, Nightlife, Cafe, Transport), lat, lng, estimated_duration,
  estimated_price (in trip currency with currency code), why (1 sentence why
  this fits the group), best_time (when to visit)
- Do NOT recommend places the group has already planned
- Tailor recommendations to the group's combined preferences
- Consider weather and season when relevant
- Respond in the user's language
```

### User Prompt (dynamically built)

```
TRIP: {title}, {destination from place centroid or trip title}
DATES: {start_date} to {end_date}
CURRENCY: {currency}
LANGUAGE: {language}

GROUP PREFERENCES:
- Interests: {merged interests}
- Budget: {budget_level}
- Food: {merged food preferences}
- Avoid: {merged avoid list}
- Mobility: {most restrictive}

ALREADY PLANNED:
- {place.name} ({category})
...

WEATHER (if day_id):
{date}: {temp}°C, {condition}, sunrise {time}, sunset {time}

ADDITIONAL REQUEST (if custom_prompt):
{user's free text}

Recommend 5-8 activities/places that this group would enjoy.
```

### Group Preference Merging

When multiple trip members have preferences:

| Field | Merge Strategy | Rationale |
|-------|---------------|-----------|
| interests | Union | Include all members' interests |
| budget_level | Lowest | Conservative — don't exceed anyone's budget |
| food_preferences | Union | Respect all dietary restrictions |
| avoid | Union | If one person avoids it, avoid it for all |
| mobility | Most restrictive | Accessibility for all |

Members without preferences are skipped (no contribution to merge).

## Client Components

### New Files

```
client/src/components/Discover/
  DiscoverPanel.jsx          # Drawer with recommendation cards
  RecommendationCard.jsx     # Single recommendation display

client/src/components/Settings/
  PreferencesSection.jsx     # Travel preferences in SettingsPage

client/src/components/Admin/
  AIConfigPanel.jsx          # AI configuration in AdminPage
```

### DiscoverPanel.jsx

Slide-in drawer from the right side of TripPlannerPage.

- Trigger: "Discover" button in the map toolbar area. Hidden when AI addon not configured.
- Top: Day filter dropdown (optional) + free-text input + "Get Recommendations" button
- Content: Recommendation cards or loading skeleton
- Loading state: Skeleton cards with "AI is thinking..." text

### RecommendationCard.jsx

Each card displays:
- Category icon + name
- Description (2-3 sentences)
- Duration + estimated price
- "Why" badge (why it fits the group)
- Best time hint
- Two action buttons: "Show on Map" (centers map) and "Add to Trip" (creates place)

**"Add to Trip" action:**
1. Calls existing `POST /api/trips/:tripId/places` with pre-filled data from recommendation
2. Maps recommendation `category` to existing NOMAD category (by name match)
3. Opens place edit form so user can adjust category, tags, assign to day

### PreferencesSection.jsx

New section in existing SettingsPage:
- Interest chips (toggleable): Culture, Food, Outdoor, Nightlife, Adventure, Relaxation, Family
- Budget level: 3 radio buttons
- Food preference chips: Vegetarian, Vegan, Halal, Kosher, Local Cuisine
- Avoid: Tag input (Enter to add, X to remove)
- Mobility: Toggle switch

### AIConfigPanel.jsx

New section in existing AdminPage (visible when AI addon enabled):
- Provider dropdown: Disabled / Ollama / OpenAI / Anthropic
- Endpoint URL field (shown for Ollama, pre-filled for Cloud)
- API Key field (shown for Cloud providers, password-type)
- Model name field
- "Test Connection" button — calls a minimal LLM request to verify

## Integration Points (existing files modified)

| File | Change |
|------|--------|
| `server/src/db/database.js` | Migration #32: create `user_preferences` and `ai_recommendations` tables. Add AI addon to seed. |
| `server/src/index.js` | Mount `ai` routes: `app.use('/api', aiRoutes)` |
| `client/src/pages/TripPlannerPage.jsx` | Add Discover button + DiscoverPanel drawer |
| `client/src/pages/SettingsPage.jsx` | Add PreferencesSection |
| `client/src/pages/AdminPage.jsx` | Add AIConfigPanel (when addon enabled) |
| `client/src/api/client.js` | Add `aiApi` and `preferencesApi` methods |
| `client/src/i18n/translations/en.js` | ~45 new keys |
| `client/src/i18n/translations/de.js` | ~45 new keys |

## Error Handling

| Scenario | Server Response | Client Behavior |
|----------|----------------|-----------------|
| AI not configured | `403 { error: "AI not configured" }` | Discover button hidden |
| LLM unreachable | `503 { error: "AI service unavailable" }` | Toast: "AI-Service nicht erreichbar" |
| LLM returns invalid JSON | Retry once, then `502 { error: "AI response invalid" }` | Toast: "AI-Antwort konnte nicht verarbeitet werden" |
| Rate limit exceeded | `429 { error: "Rate limit exceeded" }` | Toast: "Zu viele Anfragen, bitte warte" |
| No destination detectable | `400 { error: "No destination found" }` | Toast: "Füge zuerst einen Ort hinzu" |
| No preferences set | Works — generic recommendations | Hint: "Setze Präferenzen für bessere Empfehlungen" |
| Demo mode | Recommendations allowed | "Add to Trip" blocked (existing demo restriction) |

## Rate Limiting

In-memory rate limiter (same pattern as auth rate limiter in `auth.js`):
- 10 AI requests per user per hour
- Keyed on `user.id`
- Returns 429 when exceeded

## Scope Boundaries

**In scope (v1):**
- User preference CRUD
- Admin AI config
- Destination-based recommendations
- One-click add to trip
- Ollama + OpenAI + Anthropic support
- Response caching
- Rate limiting
- i18n (EN/DE)

**Out of scope (v2+):**
- En-route/stopover recommendations
- Implicit preference learning from trip history
- Contextual suggestions (auto-popup)
- Streaming responses (SSE)
- Google Places enrichment
- Multiple recommendation "sessions" per trip
