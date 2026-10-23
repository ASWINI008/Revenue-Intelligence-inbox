# Revenue Intelligence Inbox

A professional sales-operations web application built for the **Volopay assignment**. The application empowers sales managers to review multi-source sales call and meeting activity, understand rep workloads and conversation outcomes, triage escalated accounts, evaluate and override transparent rule-based routing, manage repeated imports with strict idempotency and auditability, and generate RFC 4180 compliant exports accompanied by an automated export manifest.

---

## 1. Project Overview

In fast-paced B2B sales organizations, customer touchpoints occur across phone calls, discovery sessions, product demonstrations, and contract negotiations. Without unified intelligence, critical enterprise escalations go unassigned, follow-up deadlines slip, and sales managers lack actionable insight into deal health.

**Revenue Intelligence Inbox** solves this by providing:
- **Real-Time KPI Dashboard:** Dynamic sales metrics and visual analytics derived directly from canonical ground truth data.
- **Searchable Conversation Inbox:** Multi-column sorting, filtering, pagination, and inline operational status updates.
- **Manager Triage ("Needs Attention"):** Priority queue for urgent customer escalations, overdue commitments, and unassigned leads.
- **Deterministic Routing Engine:** Transparent, rule-based decision logic that exposes triggering rules, explains conflicting objectives, and facilitates audited manager overrides.
- **Idempotent Ingestion Engine:** Stable-key deduplication preventing double-counting, alongside a **Manual Correction Precedence Policy** that prevents stale imports from clobbering manager overrides.
- **Data Quality Diagnostics:** Separation between critical schema errors (missing IDs, bad dates, invalid priorities) and business policy warnings.
- **RFC 4180 Exports & Manifest:** Client-side downloadable CSV and JSON exports with an automated validation manifest.
- **Audited Findings & Ground Truth Evidence:** In-app ledger documenting verified operational anomalies (`REV-1004`, `REV-1018`, `REV-1009`, `REV-1015`, `REV-1001`, `REV-1010`, `REV-1022`) and routing trade-offs.
- **Executive Presentation:** Standalone 5-slide PowerPoint (`presentation/revenue_intelligence_presentation.pptx`) and accompanying slide deck specification (`presentation/SLIDES.md`).
- **Editorial Console UI:** Built specifically with an Editorial Sales Operations aesthetic (warm off-white `#F7F6F2`, `#252923` deep charcoal, `#356B55` forest green, `#C77B45` attention orange, `#E3E2DC` soft grey borders, Inter + JetBrains Mono, no generic AI dashboard tropes).

---

## 2. Technology Stack

- **Frontend Framework:** React 19 (SPA) with Vite build system
- **Language:** Modern JavaScript (ES Modules)
- **Styling:** Bootstrap 5.3 + Bootstrap Icons + Custom SaaS CSS (*No Tailwind CSS*)
- **Visual Analytics:** Chart.js + react-chartjs-2
- **Iconography:** Lucide React & Bootstrap Icons
- **Data Ingestion:** Papa Parse (CSV) and native JSON parsing
- **Data Export:** RFC 4180 CSV generation, formatted JSON serialization, and Manifest generator
- **Presentation Generation:** PptxGenJS (generates editable `.pptx` slides)
- **Persistence:** Browser `localStorage` (configured for single-user manager workflow)
- **Test Suite:** Vitest + React Testing Library + JSDOM
- **Version Control:** Git

---

## 3. Architecture & Project Structure

```
revenue-intelligence-inbox/
├── data/                               # Canonical datasets and test fixture files
│   ├── sample_conversations.json       # Ground truth canonical baseline (25 records)
│   ├── sample_conversations.csv        # Ground truth CSV counterpart
│   ├── test_duplicate_import.csv       # Test dataset for 100% duplicate detection
│   ├── test_update_import.csv          # Test dataset for updates and precedence
│   └── test_malformed_import.csv       # Test dataset for validation rejection
├── exports/                            # Physical export directory
│   ├── conversations_master.csv        # Full dataset export (CSV)
│   ├── conversations_master.json       # Full dataset export (JSON)
│   ├── needs_attention_export.csv      # Needs Attention queue export (CSV)
│   ├── needs_attention_export.json     # Needs Attention queue export (JSON)
│   ├── routing_decisions_export.csv    # Evaluated decisions and overrides (CSV)
│   ├── manifest.json                   # Automated export manifest (JSON)
│   └── manifest.csv                    # Automated export manifest (CSV)
├── presentation/                       # Presentation deliverables
│   ├── revenue_intelligence_presentation.pptx  # Editable 5-slide PowerPoint file
│   ├── generate_pptx.js                # PPTX generator script
│   └── SLIDES.md                       # Complete slide-by-slide transcript & layout
├── demo/                               # Demonstration deliverables
│   └── DEMO_SCRIPT.md                  # 3-minute narration script & visual cue points
├── tests/                              # Automated test suites (Vitest)
│   ├── metrics.test.js                 # KPI calculation & zero-data handling tests
│   ├── import_idempotency.test.js      # Deduplication, update & precedence tests
│   ├── routing_engine.test.js          # Rule evaluation & override tests
│   ├── data_quality.test.js            # Hard schema errors vs soft warnings tests
│   ├── export_manifest.test.js         # CSV escaping, JSON schema & manifest tests
│   └── ui_smoke.test.jsx               # React component rendering smoke tests
├── src/
│   ├── components/                     # Reusable React UI components
│   │   ├── Sidebar.jsx                 # Restrained monochrome navigation with section headers
│   │   ├── Navbar.jsx                  # Header with active scope, sync status, and search
│   │   ├── Dashboard.jsx               # Horizontal metric strip, Attention Queue & Recent Activity
│   │   ├── Inbox.jsx                   # Filterable, sortable conversation table & details panel
│   │   ├── NeedsAttention.jsx          # Dedicated manager triage view
│   │   ├── RoutingView.jsx             # Rule inspector, conflict case study & overrides
│   │   ├── ImportView.jsx              # 5-step workflow & 1-click duplicate test runners
│   │   ├── DataQualityView.jsx         # Health score, schema diagnostics & warning ledger
│   │   ├── ExportView.jsx              # Download workspace & live manifest viewer
│   │   ├── FindingsView.jsx            # Audited findings backed by exact record IDs
│   │   ├── SettingsView.jsx            # System diagnostics, schema definitions & storage reset
│   │   ├── ConversationDetailModal.jsx # Metadata & audit timeline drawer
│   │   ├── EditModal.jsx               # Field editor with audit reason requirement
│   │   └── OverrideModal.jsx           # Routing override modal with conflict view
│   ├── services/
│   │   ├── storageService.js           # LocalStorage wrapper & canonical seeding
│   │   ├── routingEngine.js            # Deterministic rules & conflict engine
│   │   ├── importService.js            # Ingestion, validation & deduplication
│   │   ├── exportService.js            # RFC 4180 export & manifest builder
│   │   ├── dataQualityService.js       # Data integrity health score analyzer
│   │   └── pptxService.js              # Client-side PPTX generation & slides
│   ├── styles/
│   │   └── custom.css                  # Custom SaaS typography and card layout
│   ├── App.jsx                         # Main application root
│   └── main.jsx                        # React root entrypoint
├── package.json
├── vite.config.js
└── vercel.json                         # Vercel deployment configuration
```

---

## 4. Getting Started Locally

### Prerequisites
- Node.js: `v18.0.0` or higher (verified on Node `v24.12.0`)
- npm: `v9.0.0` or higher (verified on npm `11.6.2`)

### Installation Steps
1. Clone or extract the repository into your local environment:
   ```bash
   cd Revenue
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 5. Ground Truth Dataset & Key Findings

Because no pre-existing dataset was present in the blank workspace, a canonical reference dataset was engineered into `data/sample_conversations.json` and `data/sample_conversations.csv` reflecting real-world sales operations challenges.

### Three Important Findings (Backed by Exact Record IDs)

1. **Finding 1: Unassigned High-Risk Enterprise Escalations**
   - **Traceable Evidence:** Record [`REV-1004`](./data/sample_conversations.json) (*Apex Logistics*, Enterprise tier, CFO blocked renewal due to pricing, follow-up overdue by 6 days, assigned owner is blank) and Record [`REV-1018`](./data/sample_conversations.json) (*DataStream Inc*, Enterprise tier, SLA penalty threat, unassigned).
   - **Business Implication:** Enterprise customers with high ARR are at imminent risk of churn due to lack of immediate executive ownership.
2. **Finding 2: Stalled Follow-Ups Post-Demo ("Action Required")**
   - **Traceable Evidence:** Record [`REV-1009`](./data/sample_conversations.json) (*Nexus Tech*, demo concluded Oct 10 with promised pricing deck overdue since Oct 15) and Record [`REV-1015`](./data/sample_conversations.json) (*Vanguard Health*, compliance follow-up overdue by 6 days).
   - **Business Implication:** Reps fail to fulfill commitments during the critical 48-hour post-meeting window, causing deal velocity to collapse.
3. **Finding 3: Rep Workload Imbalance & Win Concentration**
   - **Traceable Evidence:** Senior AE **Alex Rivera** accounts for 100% of closed won deals in the period ([`REV-1001`](./data/sample_conversations.json), [`REV-1010`](./data/sample_conversations.json), [`REV-1022`](./data/sample_conversations.json)), whereas **Jordan Lee** manages 4 stalled negotiations without a closed win ([`REV-1007`](./data/sample_conversations.json), [`REV-1009`](./data/sample_conversations.json), [`REV-1015`](./data/sample_conversations.json), [`REV-1021`](./data/sample_conversations.json)).
   - **Business Implication:** Extreme pipeline risk due to single-rep dependency; stalled reps require targeted coaching and capacity rebalancing.

---

## 6. How Conversation Routing Works

The platform uses a deterministic, rule-based routing engine rather than an opaque "black-box" model.

### Active Rules:
1. **`RULE_ENTERPRISE_ESCALATION`:** If account tier is `Enterprise` AND (`is_escalated === true` OR `outcome === 'Escalated'`), set priority to `Urgent` and suggest owner `Alex Rivera` (Senior Enterprise AE).
2. **`RULE_OVERDUE_STALLED_FOLLOWUP`:** If `follow_up_status === 'Overdue'` AND `outcome === 'Action Required'`, elevate priority to `Urgent`.
3. **`RULE_UNASSIGNED_INBOUND_TIER`:** If record has no assigned owner, match by tier: Enterprise &rarr; Alex Rivera, Mid-Market &rarr; Taylor Kim, SMB &rarr; Jordan Lee.
4. **`RULE_COMPETITIVE_THREAT`:** If notes or urgency reason mentions "competitor", "RFP", or "churn", elevate priority to `Urgent`.
5. **`RULE_CLOSED_WON_HANDOFF`:** If `outcome === 'Closed Won'`, route suggested owner to `Customer Success Team`.

### Conflict Handling & Case Study: The Difficult Routing Decision (REV-1012)
- **Context:** Record [`REV-1012`](./data/sample_conversations.json) for **FinVantage Corp** ($250k ARR expansion). An aggressive competitor displacement offer triggered an escalation.
- **The Conflict:** Rule 1 ("Enterprise Escalation &rarr; Alex Rivera") directly conflicted with Rule 2 ("Preserve Existing Rep Taylor Kim").
- **System Resolution:** Rather than making an arbitrary automated assignment, the engine flagged the status as **`Pending Review`** with explicit conflict explanation.
- **Manager Override:** The sales manager reviews the conflict and executes an audited override, assigning Alex Rivera as executive co-sponsor while keeping Taylor Kim on delivery, logging the justification in the immutable audit trail.

---

## 7. Data Ingestion & Deduplication Architecture

### Stable Key Matching Strategy
Records are matched using a dual-key strategy:
1. **Primary Key:** Record `id` (e.g. `REV-1001`).
2. **Fallback Composite Key:** If `id` is absent, the system constructs a composite key: `COMPOSITE:${account_name}|${contact_name}|${date}`.

### Idempotent Ingestion Policy
- **Identical Records:** If an incoming record matches an existing record across all data fields, it is categorized as a duplicate and **ignored** (0 added, 0 double-counted).
- **New Records:** Evaluated against routing rules and appended to the dataset.
- **Manual Edit Precedence Policy:** If an existing record was manually modified or overridden by a manager, incoming records **never overwrite manual corrections** (owner, priority, outcome). Non-conflicting newer fields (such as updated notes or duration) are merged, and an `IMPORT_UPDATE_MERGE` notice is appended to the audit history.
- **Malformed Records:** Validated row-by-row; rows missing account/contact or containing invalid date formats are rejected and detailed in the Ingestion Summary.

---

## 8. Data Quality Diagnostics

The application runs continuous diagnostics on the active dataset:
- **Critical Schema Errors:** Missing primary IDs, duplicate primary keys, missing account/contact, invalid date formats, and invalid priority levels.
- **Business Policy Warnings:** Unassigned leads, overdue follow-up commitments, and unresolved routing conflicts.
- **Health Score:** A dynamic percentage metric reflecting overall dataset compliance.

---

## 9. Exports & Export Manifest

Users can download:
- All Conversations (`CSV` or `JSON`)
- Needs Attention Queue (`CSV` or `JSON`)
- Routing Decisions Log (`CSV` or `JSON`)
- Export Manifest (`CSV` or `JSON`)

All CSVs follow strict RFC 4180 escaping (properly wrapping commas, quotes, and line breaks). Every export is paired with a manifest entry recording filename, export type, ISO timestamp, record count, format, filter scope, schema version (`1.0.0`), data source, and validation status.

---

## 10. Automated Testing

The project includes 6 automated test suites with 20 unit and integration tests written in Vitest.

To run the test suite:
```bash
npm test
```

### Verified Behaviors:
- [x] Application components render without crashing (React Testing Library)
- [x] Dashboard metrics calculate accurately from canonical data
- [x] Empty datasets handled without NaN or division by zero
- [x] Dual-key generation and validation error identification
- [x] 100% Idempotent duplicate import (0 duplicates added)
- [x] Record updates follow documented update policy
- [x] Manual manager corrections survive subsequent imports
- [x] Deterministic routing rules evaluate correctly
- [x] Rule conflicts identified and flagged as "Pending Review"
- [x] Manager routing overrides record prior decisions and audit reasons
- [x] Hard schema errors distinguished from soft business warnings
- [x] RFC 4180 CSV escaping handles quotes and commas correctly
- [x] Generated export files match manifest entries in `exports/`

---

## 11. Deployment Instructions

### Build Verification
To compile the production build:
```bash
npm run build
```
The optimized client bundle is written to the `dist/` directory.

### Deploying to Vercel
1. Ensure the code is committed to Git:
   ```bash
   git add .
   git commit -m "feat: complete revenue intelligence inbox implementation"
   ```
2. Push to your GitHub / GitLab repository.
3. In the Vercel dashboard, click **"Add New Project"** and import the repository.
4. Vercel automatically detects the Vite framework and uses `vercel.json` for routing rewrites.
5. Alternatively, deploy via Vercel CLI:
   ```bash
   npx vercel --prod
   ```

---

## 12. Known Limitations & Documented Assumptions

1. **Single-User LocalStorage Persistence:** In accordance with the single-user requirements, state persistence utilizes browser `localStorage`. Data changes are persisted in the active browser profile and do not sync across different physical machines or browsers. In an enterprise production setting, this would be replaced with a PostgreSQL database and REST/GraphQL API.
2. **Dataset Assumption:** Because no pre-existing dataset was provided in the initial workspace, a canonical reference dataset was authored into `data/sample_conversations.json` containing 25 records with realistic sales operations complexities.
3. **Deterministic vs ML Routing:** The routing engine deliberately uses deterministic business logic to ensure complete governance explainability for sales managers.
