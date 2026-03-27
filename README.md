# Av/IntelOS — GlobalAir.com Marketing Intelligence Hub

7-page SPA intelligence dashboard for GlobalAir.com marketing operations. Surfaces GA4, Google Ads, and Search Console data with role-based access and data confidence scoring.

## Quick Start

```bash
npm start
# Open http://localhost:8093
```

## Architecture

- **Frontend:** Vanilla JavaScript SPA with hash-based routing
- **Server:** Node.js static file server + JSON data API
- **Data:** Pre-fetched via Windsor.ai MCP, stored as JSON in `data/`
- **Storage:** Browser localStorage for UI state (role, date range, preferences)

## Pages

| Route | Page | Data Source |
|-------|------|-------------|
| `#dashboard` | Intelligence Dashboard | GA4 + Google Ads (aggregated KPIs) |
| `#ga4` | GA4 Analytics Hub | GA4 channels + landing pages |
| `#organic` | Organic Intelligence | Google Search Console |
| `#competitive` | Competitive Intelligence | Seed data (SEMrush/SpyFu not connected) |
| `#ppc` | PPC Analytics | Google Ads campaigns |
| `#content` | Content & Channel | GA4 landing pages mapped to content pillars |
| `#health` | Data Health | Connector status + GA4 property health |

## Data Refresh

Data is fetched via Windsor.ai MCP in Claude Code and written to `data/*.json`. To refresh:

1. Open Claude Code in the project directory
2. Use Windsor MCP tools to fetch updated data
3. Write results to `data/` directory
4. Commit and push

## Role-Based Access

- **Casey** — Full access, all confidence levels
- **Clay** — Full access, technical framing
- **Jeffrey** — Confirmed data only (PROBABLE and POSSIBLE hidden)

## Brand

- Navy: `#102297` | Green: `#97CB00` | Blue: `#4782D3`
- Fonts: Montserrat 700 (headings), DM Sans (body)

---

*GlobalAir.com — Aviation's Homepage Since 1995*
