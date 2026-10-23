# Three-Minute Demonstration Script & Walkthrough

**Project:** Revenue Intelligence Inbox (Volopay Assignment)  
**Target Duration:** Exactly 3 minutes (180 seconds)  
**Presenter:** Aswin (Lead Full-Stack Developer & Product Designer)

---

## Pre-Recording Checklist
Before starting your screen capture:
- [ ] Application running on `http://localhost:5173`
- [ ] Reset database to canonical sample state by clicking **"Reset Sample Data"** in the top navigation bar.
- [ ] Ensure browser is in 1080p (1920x1080) at 100% zoom.
- [ ] Have test files ready on desktop/folder: `data/test_duplicate_import.csv` and `data/test_update_import.csv`.
- [ ] Check microphone audio levels and set timer/stopwatch to 3:00.

---

## Minute-by-Minute Script & Visual Actions

### 0:00 – 0:25 | Introduction & Dashboard Overview (25s)
- **On Screen:** Dashboard view (`/`). Mouse smoothly hovers over summary metric cards and dynamic Chart.js charts.
- **Presenter Narration:**
  > "Hello, I am presenting the Revenue Intelligence Inbox built for the Volopay assignment. As a sales manager, understanding conversation health across reps and accounts is critical. Here on the dashboard, we see real-time dynamic KPIs calculated directly from our canonical dataset: 25 total conversations, 15 meetings, 10 calls, with 7 flagged under 'Needs Attention', 4 unassigned conversations, and 5 overdue follow-ups. Below, our dynamic visual analytics break down conversation outcomes, rep workload distributions, and volume trends over time, providing immediate operational clarity."

---

### 0:25 – 1:00 | Reviewing a Conversation & Identifying an Issue (35s)
- **On Screen:** Navigate to **"Conversation Inbox"** tab. Type `Apex Logistics` into the search bar, or filter by Priority = `Urgent`. Click on `REV-1004`. Open the **Conversation Details & Audit Modal**.
- **Presenter Narration:**
  > "Let's review the conversation inbox. Searching for 'Apex Logistics', we locate record REV-1004. Opening the detail view reveals a critical issue: Marcus Vance, an Enterprise client, called objecting to a renewal price hike with their CFO threatening an RFP churn. Notice that the assigned owner is blank, and the follow-up deadline of October 16 is already six days overdue! Without immediate triage, this enterprise account will churn. Right here in the modal, I can click 'Edit Record' or 'Quick Assign' to assign it to Alex Rivera, update the status, and record an immutable audit note explaining the corrective action."

---

### 1:00 – 1:45 | A Difficult Routing Decision & Transparent Conflict Resolution (45s)
- **On Screen:** Navigate to the **"Routing & Analysis"** section. Filter to **"Pending Review / Conflicts"**. Select record `REV-1012` (FinVantage Corp).
- **Presenter Narration:**
  > "Next, let's examine our deterministic rule-based routing engine and look at a difficult routing decision: record REV-1012 for FinVantage Corp. This is a high-value $250k ARR expansion opportunity that escalated due to an aggressive competitor counter-offer.
  > Here we encounter a genuine business conflict: Rule 1 dictates routing high-urgency enterprise escalations to Senior AE Alex Rivera. However, Rule 2 mandates preserving existing account ownership with Taylor Kim. Rather than arbitrarily forcing an unexplainable black-box decision, our routing engine flags this as 'Pending Review' with full conflict transparency. As the manager, I review the conflict and execute an audited Override: assigning Alex Rivera as executive co-sponsor while keeping Taylor Kim on delivery, entering 'Executive escalation co-ownership' as our recorded rationale."

---

### 1:45 – 2:25 | Idempotent Import Verification (Zero Duplicate Records) (40s)
- **On Screen:** Click on the **"Data Import & Quality"** tab. Note current total records: 25. Click the **"Test Duplicate Import"** button (or drag & drop `test_duplicate_import.csv`). Observe the instant Import Summary modal.
- **Presenter Narration:**
  > "A core requirement of this platform is idempotent data ingestion. Sales reps and automated tools often import the same files repeatedly. Let's demonstrate this by clicking 'Test Duplicate Import', which attempts to re-import five existing records.
  > Look at the generated Import Summary: Processed: 5, New Added: 0, Existing Updated: 0, Duplicates Ignored: 5, Invalid: 0. Our dual-key matching engine verified that all five records were already present with identical attributes. Our total record count remains exactly 25. There is zero double-counting in any KPI or chart."

---

### 2:25 – 2:45 | Record Updates & Manual Correction Precedence (20s)
- **On Screen:** Click **"Test Update Import"** (loading `test_update_import.csv`). Show summary modal: 1 New Added, 1 Updated, 0 Duplicates. Show that previously edited records did NOT lose manager corrections.
- **Presenter Narration:**
  > "Now let's test importing an updated dataset using `test_update_import.csv`. This batch contains an update to record REV-1004 and a new record REV-1026. The import engine adds the new record and updates REV-1004. Notice our strict Precedence Policy: the manager's manual assignment and priority override are preserved rather than silently overwritten by incoming stale data, with a merge notice appended to the audit trail."

---

### 2:45 – 3:00 | Exports & Manifest Verification (15s)
- **On Screen:** Navigate to the **"Exports & Manifest"** tab. Click **"Download All Records (CSV)"** and click **"Generate & Download Manifest (JSON)"**. Show the live manifest table on screen.
- **Presenter Narration:**
  > "Finally, let's look at data exports. Managers can download filtered or full records in RFC 4180 compliant CSV or validated JSON. Alongside every export, the system automatically compiles an Export Manifest tracking timestamp, record count, filter scope, and schema checksum. Both the exports and manifest are saved permanently in the project's exports folder. Thank you!"

---

## Recording Instructions
1. Use OBS Studio or Windows Game Bar (`Win + G`) to record the browser window.
2. Keep speech steady and follow the visual cue points.
3. Verify that all UI modals open smoothly.
