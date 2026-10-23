# Submission Evidence & Screenshot Capture Checklist

**Project:** Revenue Intelligence Inbox (Volopay Assignment)  
**Author:** Aswin  
**Application URL:** `http://localhost:5173/`  
**Design Language:** Editorial Sales Operations Console (#F7F6F2 warm off-white, #356B55 forest green, #C77B45 muted orange)

---

## 8 Required Screenshots Checklist

To capture these screenshots, open `http://localhost:5173/` in your browser at 1920x1080 resolution (100% zoom):

- [ ] **1. Dashboard (`/`)**
  - **View:** Top header bar with *Revenue Operations*, operational summary, date selector (`Oct 10 – Oct 22, 2026`), and horizontal metric strip (`Total Conversations: 25`, `Needs Attention: 7`, `Unassigned: 4`, `Overdue: 6`).
  - **Focus:** Asymmetric layout featuring the **Attention Queue** (left 8 columns) and **Recent Audit Activity** (right 4 columns with genuine event entries).
  - **File Save Target:** `demo/screenshots/01_dashboard.png`

- [ ] **2. Conversation Inbox (`/inbox`)**
  - **View:** Three-panel layout. Left compact sidebar, middle searchable conversation table with compact rows and priority tags, and right persistent details panel.
  - **Focus:** Selection on record `REV-1004` (*Apex Logistics*) displaying the account details, metadata grid, and deterministic routing rationale.
  - **File Save Target:** `demo/screenshots/02_conversation_inbox.png`

- [ ] **3. Difficult Routing Decision (`/routing`)**
  - **View:** Routing Decisions view showing the dedicated case study box for Record `REV-1012` (*FinVantage Corp*).
  - **Focus:** Conflict explainability showing Rule 1 (*Enterprise Escalation &rarr; Alex Rivera*) vs. Rule 2 (*Preserve Existing Ownership &rarr; Taylor Kim*), flagged as `Pending Review` with the manager override control.
  - **File Save Target:** `demo/screenshots/03_difficult_routing_decision.png`

- [ ] **4. Import Preview (`/import`)**
  - **View:** Import Centre after staging `test_update_import.csv`.
  - **Focus:** Step 3 *Pre-Confirmation Preview* table displaying row-by-row status tags (`[Existing Record Updated]`, `[New Record]`, `[Manual Edit Protected]`).
  - **File Save Target:** `demo/screenshots/04_import_preview.png`

- [ ] **5. Duplicate Import Test (`/import` &rarr; "Run Duplicate Import Test")**
  - **View:** Import Centre after clicking **"Run Duplicate Import Test"**.
  - **Focus:** The verified test modal displaying: `PASSED (100% Idempotent)`, `Initial Records: 25`, `Final Records: 25`, `Duplicates Ignored: 5`, `New Added: 0`.
  - **File Save Target:** `demo/screenshots/05_duplicate_import_test.png`

- [ ] **6. Existing-Record Update (`/import` &rarr; Confirm Update)**
  - **View:** Ingestion results summary showing `Existing Updated: 1`, `New Added: 1`, and `Manual Protected: 1`.
  - **Focus:** Record `REV-1004` updated attributes merged while preserving manager override.
  - **File Save Target:** `demo/screenshots/06_existing_record_update.png`

- [ ] **7. Manual Correction & Audit Trail Modal**
  - **View:** The Edit Modal or Persistent Right Details panel for an edited record.
  - **Focus:** Form fields with mandatory *Reason for Manual Edit* field filled, and the resulting audit history timeline item showing `MANUAL_EDIT`, timestamp, and rationale.
  - **File Save Target:** `demo/screenshots/07_manual_correction_audit.png`

- [ ] **8. Exported Files and Manifest (`/exports`)**
  - **View:** Exports view showing the download buttons and the **Export Manifest Ledger**.
  - **Focus:** Manifest table listing `conversations_master.csv`, `needs_attention_export.csv`, `routing_decisions_export.csv`, record counts, and `RFC_4180_VALID` status.
  - **File Save Target:** `demo/screenshots/08_exported_files_manifest.png`

---

## Separate Project Deliverables Reference
- **5-Slide PowerPoint File:** [`presentation/revenue_intelligence_presentation.pptx`](../presentation/revenue_intelligence_presentation.pptx)
- **Slide Layout & Script:** [`presentation/SLIDES.md`](../presentation/SLIDES.md)
- **3-Minute Demonstration Script:** [`demo/DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)
