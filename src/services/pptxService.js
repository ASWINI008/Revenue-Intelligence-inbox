/**
 * Presentation Service for Revenue Intelligence Inbox
 * Generates an editable, professionally formatted PowerPoint (.pptx) file using pptxgenjs,
 * and exports slide content for the in-app visual slide presentation modal.
 */

import pptxgen from 'pptxgenjs';

export const PRESENTATION_SLIDES = [
  {
    slideNumber: 1,
    title: 'Revenue Intelligence Overview',
    subtitle: 'Transforming Sales Activity Data into Deterministic Actionable Pipeline Velocity',
    bullets: [
      {
        heading: 'Business Problem',
        text: 'Sales managers lack unified visibility into multi-channel conversation outcomes, resulting in unassigned enterprise escalations, missed follow-up deadlines, and delayed pipeline velocity.',
      },
      {
        heading: 'Product Objective',
        text: 'Deliver a robust, auditable Revenue Intelligence Inbox that automates conversation routing, enforces idempotent multi-source data ingestion, and empowers managers with override workflows.',
      },
      {
        heading: 'Dataset Scope & Ground Truth',
        text: 'Canonical 25-record baseline containing multi-tier accounts (Enterprise, Mid-Market, SMB), multi-call types (Demo, Discovery, Negotiation), real-world data gaps, and overdue commitments.',
      },
      {
        heading: 'Core Product Workflow',
        text: 'Ingest (CSV/JSON with schema validation) → Idempotent Deduplication → Deterministic Rule-Based Routing → Needs Attention Intervention → Audited Manual Corrections → RFC 4180 Validated Exports.',
      },
    ],
  },
  {
    slideNumber: 2,
    title: 'Three Important Findings from Ground Truth Data',
    subtitle: 'Traceable Pipeline Realities Backed by Actual Source Record Evidence',
    bullets: [
      {
        heading: 'Finding 1: Unassigned High-Risk Enterprise Escalations',
        text: 'Critical enterprise accounts with urgent escalation flags lack assigned sales ownership. Traceable evidence: Record REV-1004 (Apex Logistics - CFO blocked renewal over pricing, follow-up 6 days overdue, 0 rep assigned) and REV-1018 (DataStream Inc - SLA penalty dispute, unassigned). Implication: High probability of immediate enterprise customer churn without instant intervention.',
      },
      {
        heading: 'Finding 2: Overdue Follow-ups in "Action Required" Status',
        text: 'Post-demo conversion momentum is severely compromised by overdue follow-up tasks. Traceable evidence: Record REV-1009 (Nexus Tech - demo completed Oct 10, promised pricing deck overdue since Oct 15) and REV-1015 (Vanguard Health - compliance follow-up 6 days overdue). Implication: Leads go cold post-demo due to lack of scheduled touchpoint enforcement.',
      },
      {
        heading: 'Finding 3: Rep Workload Imbalance & Win-Rate Concentration',
        text: 'Disproportionate win concentration on a single senior rep while others face stalled negotiations. Traceable evidence: Alex Rivera accounts for 100% of closed won deals (REV-1001, REV-1010, REV-1022), while Jordan Lee carries 4 overdue stalled negotiations (REV-1007, REV-1009, REV-1015, REV-1021) without closed wins in the period.',
      },
    ],
  },
  {
    slideNumber: 3,
    title: 'Rule-Based Routing & The Difficult Routing Decision',
    subtitle: 'Deterministic Transparency with Conflict Resolution & Manager Override',
    bullets: [
      {
        heading: 'Deterministic Routing Logic',
        text: 'Eliminated "black-box" decisions. Applied 5 explicit business rules evaluating Account Tier, Escalation Flags, Overdue Status, Deal Stage, and Content Intelligence keywords (competitor/churn).',
      },
      {
        heading: 'Case Study: The Difficult Routing Decision (REV-1012)',
        text: 'Account: FinVantage Corp ($250k ARR Enterprise expansion). Discovery call escalated due to aggressive competitor displacement counter-offer. Current Rep: Taylor Kim (overloaded). Account previously managed by Alex Rivera.',
      },
      {
        heading: 'Rule Conflict Detected',
        text: 'Rule 1 ("Enterprise Escalation -> Senior AE Alex Rivera") directly conflicted with Rule 2 ("Preserve Existing Account Ownership -> Taylor Kim").',
      },
      {
        heading: 'Resolution & Manager Override',
        text: 'The engine safely flagged the record as "Pending Review" with explicit conflict disclosure rather than arbitrarily reassigning. Sales Manager executed an audited override to co-assign Alex Rivera as executive sponsor while retaining Taylor Kim as day-to-day lead.',
      },
    ],
  },
  {
    slideNumber: 4,
    title: 'Data Quality, Deduplication & Reliability',
    subtitle: 'Idempotent Ingestion, Manual Edit Precedence, and RFC 4180 Export Integrity',
    bullets: [
      {
        heading: 'Idempotent Import & Zero Double-Counting',
        text: 'Dual-key matching strategy: Primary ID (REV-xxxx) supplemented by composite key (Account | Contact | Date). Verified: Importing the exact dataset twice generates 0 new records, 0 double-counted metrics, and flags 100% duplicates as ignored.',
      },
      {
        heading: 'Manual Edit Precedence Policy',
        text: 'Subsequent imports must NEVER clobber manager corrections. If an existing record was manually modified or overridden, manager decisions are strictly preserved, while non-conflicting new fields are merged with a logged audit notice.',
      },
      {
        heading: 'Data Quality Diagnostics',
        text: 'Real-time distinction between Critical Schema Errors (missing ID, malformed dates, invalid priority strings) and Business Warnings (unassigned leads, overdue deadlines, routing ambiguities). Health score calculated dynamically.',
      },
      {
        heading: 'Export Manifest Verification',
        text: 'All CSV/JSON exports adhere strictly to RFC 4180 escaping and valid JSON schema. Paired with an automated Export Manifest tracking filename, timestamp, record count, filter scope, and validation checksum.',
      },
    ],
  },
  {
    slideNumber: 5,
    title: 'Decisions, Lessons Learned & Rejected Alternatives',
    subtitle: 'Architectural Rationale, Trade-offs, and Future Scalability Roadmap',
    bullets: [
      {
        heading: 'Key Architectural Decision',
        text: 'Client-first reactive architecture using React 19, Vite, and LocalStorage caching for rapid, zero-latency manager triage without requiring multi-second roundtrips during live sales pipeline reviews.',
      },
      {
        heading: 'Rejected Alternative: Black-Box ML / Arbitrary Auto-Reassignment',
        text: 'Considered: An opaque auto-assignment algorithm that automatically shuffles unassigned or disputed deals to whichever rep has fewer meetings. REJECTED: Sales managers need explainable determinism. Arbitrary automated assignment damages rep trust and alienates existing client relationships.',
      },
      {
        heading: 'Adopted Strategy',
        text: 'Transparent rule evaluation showing exact rule triggered, conflicting suggestions, and a safe "Pending Review" fallback requiring explicit manager ratification with full audit tracking.',
      },
      {
        heading: 'Documented Limitations & Next Steps',
        text: 'LocalStorage is single-user and scoped to the active browser profile. Next phase includes PostgreSQL/Supabase multi-tenant backend, WebSockets for live collaborative routing, and CRM bidirectional sync (Salesforce/HubSpot).',
      },
    ],
  },
];

/**
 * Builds and downloads the .pptx file
 */
export const downloadPowerPointPresentation = async () => {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Volopay Assignment - Aswin';
  pptx.company = 'Revenue Intelligence Inbox';
  pptx.title = 'Revenue Intelligence Inbox - Executive Presentation';

  // Define Master slide colors
  const NAVY = '0F172A';
  const SLATE = '1E293B';
  const BLUE = '2563EB';
  const TEXT_DARK = '1E293B';
  const TEXT_MUTED = '64748B';
  const BG_LIGHT = 'F8FAFC';

  PRESENTATION_SLIDES.forEach((slideData) => {
    const slide = pptx.addSlide();
    slide.background = { color: BG_LIGHT };

    // Header banner
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.1,
      fill: { color: NAVY },
    });

    // Slide Tag & Title
    slide.addText(`SLIDE ${slideData.slideNumber} / 5 | REVENUE INTELLIGENCE INBOX`, {
      x: 0.8,
      y: 0.2,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: '93C5FD',
      bold: true,
    });

    slide.addText(slideData.title, {
      x: 0.8,
      y: 0.45,
      w: 11.5,
      h: 0.55,
      fontSize: 20,
      fontFace: 'Arial',
      color: 'FFFFFF',
      bold: true,
    });

    // Subtitle
    slide.addText(slideData.subtitle, {
      x: 0.8,
      y: 1.25,
      w: 11.5,
      h: 0.4,
      fontSize: 13,
      fontFace: 'Arial',
      color: BLUE,
      italic: true,
      bold: true,
    });

    // Content cards
    let currentY = 1.75;
    const cardHeight = (5.3 - currentY) / slideData.bullets.length;

    slideData.bullets.forEach((bullet, bIdx) => {
      // Background card
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: currentY,
        w: 11.7,
        h: cardHeight - 0.1,
        fill: { color: 'FFFFFF' },
        line: { color: 'E2E8F0', width: 1 },
      });

      // Accent pill
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: currentY,
        w: 0.15,
        h: cardHeight - 0.1,
        fill: { color: bIdx === 0 ? BLUE : SLATE },
      });

      // Heading
      slide.addText(bullet.heading, {
        x: 1.1,
        y: currentY + 0.08,
        w: 11.2,
        h: 0.28,
        fontSize: 12,
        fontFace: 'Arial',
        color: NAVY,
        bold: true,
      });

      // Body text
      slide.addText(bullet.text, {
        x: 1.1,
        y: currentY + 0.34,
        w: 11.2,
        h: cardHeight - 0.45,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_DARK,
        lineSpacing: 14,
      });

      currentY += cardHeight;
    });

    // Footer
    slide.addText('Volopay Assignment - Revenue Intelligence Inbox | Single Source of Truth Grounded in Canonical Records', {
      x: 0.8,
      y: 7.1,
      w: 11.5,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });
  });

  return pptx.writeFile({ fileName: 'revenue_intelligence_presentation.pptx' });
};
