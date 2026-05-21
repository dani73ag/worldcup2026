# AGENTS.md — Mundial 2026

## Project overview

Vanilla JS/HTML/CSS app for World Cup 2026 predictions. No framework, no backend — everything is client-side plus Google Sheets integration.

- Entry point: `index.html` → loads `app.js`, `results.js`, `third_place_table.js`
- Repo: `dani73ag/worldcup2026`
- Upstream remote already configured as `upstream`

## Critical data flow

```
results.js       ← REAL tournament results (filled manually or by scraper)
  └─> RESULTS constant used by scorePrediction() to calculate scores

User predictions  ← stored in browser state, saved to localStorage
  └─> buildPayload() → POST to Google Forms → Google Sheets CSV

Leaderboard       ← fetch CSV, parse JSON per row, scorePrediction() vs RESULTS
```

**Key gotcha:** `results.js` exports `const RESULTS` = the REAL results. It is NOT the output of scoring. It's the input against which predictions are compared. Scoring happens in `scorePrediction()` (line ~2408 in app.js).

**"Borrar todo" button:** Calls `resetState()` → only clears user predictions (the `state` object in memory). Does NOT touch `RESULTS`.

## Commands

```bash
# Run scraper manually (uses Wikipedia API, needs cheerio)
node scraper/scrape.js

# Lint (ESLint with legacy config)
npx eslint app.js
```

## Scraper architecture

```
scraper/
  sources/wikipedia.js    — fetchGroupPage(), parseMatches(), parseStandings()
  generate-results.js     — computeStandingsFromMatches(), generateResults()
  scrape.js               — main orchestrator
.github/workflows/
  update-results.yml      — cron daily at 5AM UTC, auto-commits results.js
```

- Scrapes Wikipedia API (`action=parse&page=2026_FIFA_World_Cup_Group_A...`)
- Requires `cheerio` (devDependency, already in package.json)
- Token: GitHub Secret `PAT` (fine-grained, Contents: R/W on this repo)
- **2026 pages don't exist yet** → scraper skips gracefully (logs and continues)
- Tested against 2022 World Cup data: all 8 groups parse correctly

## Team name mapping

Wikipedia uses full names. The app uses abbreviated names. Mapping is in `scraper/sources/wikipedia.js`:

| Wikipedia              | App                  |
| ---------------------- | -------------------- |
| United States          | USA                  |
| Korea Republic         | South Korea          |
| Bosnia and Herzegovina | Bosnia & Herzegovina |
| Côte d'Ivoire          | Ivory Coast          |

If scraping produces wrong scores, check that Wikipedia team names match what the app expects.

## Style / conventions

- Double quotes (`"`) in JS, not single quotes — app.js uses this consistently
- Module system: CommonJS (`require`), not ESM (`import`)

## Secrets

- `.env` — gitignored, never commit
- `PAT` — GitHub secret for Actions auto-push
- Google Form ID / Sheet CSV URL — hardcoded in app.js lines 9–11

## Files to never modify without understanding

- `results.js` — if overwritten, scoring breaks. The scraper regenerates this file.
- `third_place_table.js` — auto-generated FIFA third-place mapping, must match bracket structure
- `results-empty.js` — backup template of empty results.js, keep in sync with structure
