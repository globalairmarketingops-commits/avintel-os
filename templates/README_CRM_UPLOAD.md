# CRM Manual Upload Templates

Upload CSV files to `POST /api/v1/ingestion/crm-upload` (multipart/form-data, field name: `file`).

Both broker and listing rows can be combined in a single CSV — the system detects row type by column headers.

---

## Broker Metrics Template (`crm_broker_upload_template.csv`)

| Column | Required | Description |
|--------|----------|-------------|
| date | Yes | Snapshot date (YYYY-MM-DD) |
| broker_name | Yes | Exact broker/dealer name |
| category | No | Primary category: piston, jet, helicopter, turboprop |
| tier | No | Account tier: premium, standard, basic |
| qualified_inquiries | Yes | QI count for this period |
| total_inquiries | No | Total inquiries (including unqualified) |
| active_listings | No | Number of active listings |
| avg_quality_score | No | Listing quality score (0-100) |
| health_score | No | Overall broker health (0-100) |

## Listing Metrics Template (`crm_listing_upload_template.csv`)

| Column | Required | Description |
|--------|----------|-------------|
| listing_id | Yes | GlobalAir listing ID (e.g., GA-12345) |
| make | Yes | Aircraft manufacturer |
| model | Yes | Aircraft model |
| category | No | piston, jet, helicopter, turboprop |
| detail_views | Yes | Detail page views (30-day) |
| inquiries | Yes | Inquiry count (30-day) |
| photo_count | No | Number of photos on listing |
| price_visible | No | true/false — is price displayed? |

## How Keaton Should Use This

1. Export broker inquiry data from the CRM
2. Map columns to match the template headers exactly
3. Save as CSV (UTF-8)
4. Upload via AvIntelOS Data Health page or API endpoint

The system will:
- Create new broker records if broker_name doesn't exist
- Create new listing records if listing_id doesn't exist
- Update existing records with new metrics
- Log the upload in the ingestion history
- Mark confidence as CONFIRMED (manual = verified data)
