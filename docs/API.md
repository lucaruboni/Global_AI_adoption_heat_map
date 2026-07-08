# API Reference

Base URL (local): `http://localhost:3000/api/v1`

All responses use a consistent envelope:

```jsonc
// success
{ "data": <payload>, "meta": { "count": 121, "generatedAt": "2026-07-08T..." } }
// error
{ "error": { "message": "…", "code": "COUNTRY_NOT_FOUND", "status": 404 } }
```

Rate limit: 100 requests / 15 min per IP on `/api/*`.

---

## Auth

### `POST /auth/register`
Create an account and receive a JWT.

```jsonc
// body
{
  "email": "you@example.com",     // required
  "password": "at-least-8-chars", // required
  "githubUsername": "octocat",    // optional
  "linkedinUrl": "https://…",     // optional
  "optedInNewsletter": true       // optional
}
// 201 → { "data": { "user": { id, email, … }, "token": "<jwt>" } }
```

Errors: `409 EMAIL_EXISTS`, `400 VALIDATION_ERROR`.

### `POST /auth/login`
```jsonc
// body → { "email": "…", "password": "…" }
// 200 → { "data": { "user": {…}, "token": "<jwt>" } }
```
Errors: `401 INVALID_CREDENTIALS`.

---

## Countries & adoption

### `GET /countries`
All countries with their latest snapshot. Drives the globe and lists.
```jsonc
// 200 → { "data": [ { iso3, name, region, latitude, longitude, gdp2024,
//                     workingAgePopulation, stats: { usagePct, … } | null } ], "meta": { count } }
```

### `GET /countries/:iso3`
A single country (e.g. `/countries/USA`). Errors: `404 COUNTRY_NOT_FOUND`.

### `GET /countries/:iso3/history`
Full per-country time-series (oldest first).
```jsonc
// 200 → { "data": [ { snapshotDate, usagePct, usagePerCapitaIndex } ] }
```

---

## Aggregations & time-series

### `GET /regions`
Latest usage aggregated by region, sorted by share desc.
```jsonc
// 200 → { "data": [ { region, snapshotDate, totalUsagePct, avgPerCapitaIndex, countryCount } ] }
```

### `GET /history/global`
World AI adoption aggregated per snapshot date.
```jsonc
// 200 → { "data": [ { snapshotDate, totalUsagePct, avgPerCapitaIndex, countryCount } ] }
```

---

## Market signals

### `GET /stocks`
AI / cloud companies with full price history.
```jsonc
// 200 → { "data": [ { symbol, name, sector,
//                     prices: [ { dateRecorded, price, marketCap } ],
//                     latestPrice, latestMarketCap } ] }
```

### `GET /hardware`
AI-capable hardware sales index over time (proxy for local AI capacity).
```jsonc
// 200 → { "data": [ { dateRecorded, gpuSalesUnits, cpuSalesUnits,
//                     ramGbSold, priceIndex, source } ] }
```

---

## Downloads (gated)

### `GET /downloads/dataset`
Full historical dataset as CSV. **Requires `Authorization: Bearer <jwt>`.**
Rate limited to **one download per user per 24h**; each call writes an audit row.

```bash
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/v1/downloads/dataset -o ai-adoption-dataset.csv
```

Errors: `401 NO_TOKEN` / `INVALID_TOKEN`, `429 DOWNLOAD_RATE_LIMIT`.

---

## Health

### `GET /health` (no `/api/v1` prefix)
```jsonc
// 200 → { "status": "ok", "database": "connected", "timestamp": "…" }
```
