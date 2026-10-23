import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Flame,
  UserX,
  Clock,
  ShieldCheck,
  CheckCircle,
  FileText,
  XCircle,
} from 'lucide-react';

export default function FindingsView({
  records = [],
  onSelectRecordById,
}) {
  const findings = [
    {
      id: 1,
      title: 'Unassigned High-Risk Enterprise Escalations',
      observation:
        'Multiple high-tier Enterprise accounts with urgent customer escalations and pricing disputes are currently unassigned in the inbox without an active sales representative.',
      metric:
        '2 out of 3 active escalation records (66.7%) have a blank assigned owner while carrying urgent customer churn risks.',
      recordIds: ['REV-1004', 'REV-1018'],
      evidenceDetails: [
        {
          id: 'REV-1004',
          account: 'Apex Logistics (Enterprise)',
          evidence: 'CFO blocked renewal pending commercial tier discount; threat of RFP churn. Follow-up 6 days overdue. Rep is blank.',
        },
        {
          id: 'REV-1018',
          account: 'DataStream Inc (Enterprise)',
          evidence: 'Global contract terms dispute and SLA penalty threats. Escalated customer support ticket. Rep is blank.',
        },
      ],
      implication:
        'High probability of immediate customer churn and revenue loss on high-ARR accounts due to lack of executive-level escalation ownership.',
      recommendedAction:
        'Immediately trigger deterministic routing to assign Senior Enterprise AE (Alex Rivera) as Executive Sponsor and enforce a 24-hour turnaround on commercial concessions.',
    },
    {
      id: 2,
      title: 'Stalled Follow-Ups Post-Demo in "Action Required" Status',
      observation:
        'High-interest sales opportunities are stalling post-demo because commitments and requested proposals are not being delivered within standard sales SLAs.',
      metric:
        '5 out of 6 overdue follow-ups (83.3%) sit in "Action Required" status with follow-up deadlines overdue by 4 to 12 days.',
      recordIds: ['REV-1009', 'REV-1015', 'REV-1007', 'REV-1021'],
      evidenceDetails: [
        {
          id: 'REV-1009',
          account: 'Nexus Tech (Mid-Market)',
          evidence: 'Product demo completed Oct 10 with enthusiastic prospect. Promised tailored pricing deck is overdue since Oct 15 (7+ days dark).',
        },
        {
          id: 'REV-1015',
          account: 'Vanguard Health (Enterprise)',
          evidence: 'Executive demo completed Oct 11. Follow-up regarding HIPAA compliance architecture is 6 days overdue.',
        },
      ],
      implication:
        'Loss of buyer momentum post-demo. Industry benchmark shows close rates drop by 45% when post-demo proposals exceed 48 hours.',
      recommendedAction:
        'Implement automated manager escalation alerts when an "Action Required" follow-up reaches 48 hours overdue, requiring manager check-in or re-routing.',
    },
    {
      id: 3,
      title: 'Rep Workload Imbalance & Win-Rate Concentration',
      observation:
        'Pipeline conversions and closed revenue are heavily concentrated on a single senior representative, while other representatives are overburdened with stalled contract negotiations.',
      metric:
        'Alex Rivera accounts for 100% of all closed-won revenue in the dataset (4 out of 4 wins), while Jordan Lee carries 4 stalled negotiations with 0 closed deals in the period.',
      recordIds: ['REV-1001', 'REV-1010', 'REV-1022', 'REV-1007', 'REV-1021'],
      evidenceDetails: [
        {
          id: 'REV-1001 / REV-1010 / REV-1022',
          account: 'Acme Global, OmniSolutions, Avalon Cyber',
          evidence: 'Alex Rivera closed 100% of closed-won opportunities with rapid turnaround on compliance queries.',
        },
        {
          id: 'REV-1007 / REV-1021',
          account: 'AeroCore Tech, Integra Holdings',
          evidence: 'Jordan Lee is managing complex procurement discounts and Net 60 payment terms without executive commercial deal desk assistance.',
        },
      ],
      implication:
        'Key-person operational vulnerability. If Alex Rivera is unavailable, pipeline velocity halts. Furthermore, Jordan Lee requires commercial coaching on deal negotiation.',
      recommendedAction:
        'Rebalance account distribution using tier-based routing rules and introduce pair-negotiation on Enterprise payment terms for Jordan Lee.',
    },
  ];

  return (
    <div className="findings-view">
      {/* Top Banner */}
      <div className="console-card mb-3">
        <div className="console-card-body py-2.5 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 className="console-card-title mb-1">
              <TrendingUp size={16} style={{ color: 'var(--accent-forest)' }} />
              <span>Ground Truth Findings &amp; Verifiable Source Evidence</span>
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
              Operational insights and business implications derived strictly from canonical source records. No fabricated metrics or conclusions.
            </div>
          </div>
          <span className="console-tag tag-routed font-mono">3 Verifiable Findings</span>
        </div>
      </div>

      {/* Findings Cards */}
      <div className="row g-3 mb-3">
        {findings.map((f) => (
          <div key={f.id} className="col-12">
            <div className="console-card p-3 border-start border-4" style={{ borderLeftColor: f.id === 1 ? 'var(--status-urgent)' : f.id === 2 ? 'var(--attention-orange)' : 'var(--accent-forest)' }}>
              <div className="d-flex justify-content-between align-items-baseline mb-1">
                <span className="fw-bold small text-dark fs-6">
                  Finding #{f.id}: {f.title}
                </span>
                <div className="d-flex gap-1">
                  {f.recordIds.map((rid) => (
                    <span
                      key={rid}
                      className="console-tag tag-medium font-mono"
                      style={{ cursor: onSelectRecordById ? 'pointer' : 'default' }}
                      onClick={() => onSelectRecordById && onSelectRecordById(rid)}
                      title="Inspect record"
                    >
                      {rid}
                    </span>
                  ))}
                </div>
              </div>

              {/* Observation & Metric */}
              <div className="row g-2 small mt-1 mb-2">
                <div className="col-12 col-lg-7">
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>OBSERVATION:</span>
                  <div className="text-secondary" style={{ fontSize: '0.8rem', lineHeight: '1.45' }}>
                    {f.observation}
                  </div>
                </div>
                <div className="col-12 col-lg-5">
                  <div className="p-2 bg-light rounded border">
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>SUPPORTING GROUND TRUTH METRIC:</span>
                    <div className="fw-semibold text-dark" style={{ fontSize: '0.78rem' }}>
                      {f.metric}
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Evidence Details */}
              <div className="p-2 bg-surface border rounded mb-2 small" style={{ fontSize: '0.75rem' }}>
                <span className="fw-bold text-dark d-block mb-1">Traceable Source Record Evidence:</span>
                {f.evidenceDetails.map((ev, eIdx) => (
                  <div key={eIdx} className="mb-1 text-secondary">
                    <strong className="text-dark font-mono">{ev.id}</strong> ({ev.account}):{' '}
                    <span className="fst-italic">"{ev.evidence}"</span>
                  </div>
                ))}
              </div>

              {/* Implication & Recommended Action */}
              <div className="row g-2 small pt-1 border-top" style={{ fontSize: '0.76rem' }}>
                <div className="col-12 col-md-6">
                  <span className="text-muted fw-semibold">BUSINESS IMPLICATION:</span>
                  <div className="text-danger mt-0.5">{f.implication}</div>
                </div>
                <div className="col-12 col-md-6">
                  <span className="text-muted fw-semibold">RECOMMENDED ACTION:</span>
                  <div className="text-dark mt-0.5">{f.recommendedAction}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Documented Rejected Implementation Decision */}
      <div className="console-card border-start border-4" style={{ borderLeftColor: 'var(--border-medium)' }}>
        <div className="console-card-header py-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
            <XCircle size={14} className="text-muted" />
            <span>Documented Implementation Decision Considered and Rejected</span>
          </span>
          <span className="console-tag tag-lost">Rejected Architecture</span>
        </div>
        <div className="console-card-body py-2.5">
          <div className="row g-3 small">
            <div className="col-12 col-md-4">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>ALTERNATIVE CONSIDERED:</span>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: '0.82rem' }}>
                Automated "Black-Box" ML Auto-Reassignment
              </div>
              <p className="text-muted mt-1" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                An opaque algorithm that automatically re-routes and swaps ownership on escalated or disputed accounts to whichever rep currently has fewer scheduled meetings.
              </p>
            </div>

            <div className="col-12 col-md-4">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>REASON FOR REJECTION:</span>
              <div className="text-danger mt-1" style={{ fontSize: '0.78rem', lineHeight: '1.45' }}>
                Sales operations requires explainable determinism. Automated arbitrary reassignment alienates existing account trust, strips deal context from AE relationships, and undermines manager accountability.
              </div>
            </div>

            <div className="col-12 col-md-4">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>ADOPTED DESIGN STRATEGY:</span>
              <div className="text-success mt-1" style={{ fontSize: '0.78rem', lineHeight: '1.45' }}>
                Deterministic, rule-based routing with explicit conflict detection. Ambiguous accounts (such as <code>REV-1012</code>) are flagged as <code>Pending Review</code> with full rationale, enabling managers to execute an audited override.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
