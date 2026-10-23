import React, { useState } from 'react';
import {
  GitBranch,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Flame,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { DEFAULT_ROUTING_RULES } from '../services/routingEngine';

export default function RoutingView({
  records = [],
  onSelectRecord,
  onOpenOverrideModal,
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const conflictedRecords = records.filter(
    (r) => r.routing_status === 'Pending Review' || (r.routing_conflicts && r.routing_conflicts.length > 0)
  );
  const overriddenRecords = records.filter((r) => r.manual_override === true || r.routing_status === 'Overridden');
  const routedRecords = records.filter((r) => r.routing_status === 'Routed');
  const unassignedRecords = records.filter((r) => !r.assigned_owner || r.routing_status === 'Unassigned');

  // Case study record REV-1012 (FinVantage)
  const caseStudyRecord = records.find((r) => r.id === 'REV-1012');

  const filteredRecords = records.filter((r) => {
    if (statusFilter === 'CONFLICT') return r.routing_status === 'Pending Review' || (r.routing_conflicts && r.routing_conflicts.length > 0);
    if (statusFilter === 'OVERRIDDEN') return r.manual_override || r.routing_status === 'Overridden';
    if (statusFilter === 'UNASSIGNED') return !r.assigned_owner || r.routing_status === 'Unassigned';
    if (statusFilter === 'ROUTED') return r.routing_status === 'Routed';
    return true;
  });

  return (
    <div className="routing-view">
      {/* Top Console Summary */}
      <div className="console-card mb-3">
        <div className="console-card-body d-flex flex-wrap align-items-center justify-content-between gap-3 py-2.5">
          <div>
            <h6 className="console-card-title mb-1">
              <GitBranch size={16} style={{ color: 'var(--accent-forest)' }} />
              <span>Deterministic Routing &amp; Governance Engine</span>
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
              Every routing suggestion is grounded in deterministic business logic. No opaque machine learning scores or arbitrary auto-assignments.
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-forest' : 'btn-editorial-outline'}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({records.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'CONFLICT' ? 'btn-forest' : 'btn-editorial-outline'}`}
              onClick={() => setStatusFilter('CONFLICT')}
            >
              Conflicts / Review ({conflictedRecords.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'UNASSIGNED' ? 'btn-forest' : 'btn-editorial-outline'}`}
              onClick={() => setStatusFilter('UNASSIGNED')}
            >
              Unassigned ({unassignedRecords.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'OVERRIDDEN' ? 'btn-forest' : 'btn-editorial-outline'}`}
              onClick={() => setStatusFilter('OVERRIDDEN')}
            >
              Overridden ({overriddenRecords.length})
            </button>
          </div>
        </div>
      </div>

      {/* Case Study Spotlight: The Difficult Routing Decision (REV-1012) */}
      {caseStudyRecord && (
        <div className="console-card mb-3 border-start border-4" style={{ borderLeftColor: 'var(--accent-forest)' }}>
          <div className="console-card-header bg-surface py-2 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <ShieldAlert size={15} style={{ color: 'var(--attention-orange)' }} />
              <span className="fw-bold small text-dark">
                CASE STUDY &bull; Difficult Decision: Record {caseStudyRecord.id} ({caseStudyRecord.account_name})
              </span>
            </div>
            <span className="console-tag tag-action">
              {caseStudyRecord.manual_override ? 'Manager Override Recorded' : 'Pending Review'}
            </span>
          </div>

          <div className="console-card-body py-2.5">
            <div className="row g-3">
              <div className="col-12 col-lg-8">
                <div className="small text-secondary mb-2" style={{ lineHeight: '1.5', fontSize: '0.8rem' }}>
                  <strong>Operational Context:</strong> FinVantage ($250k ARR Enterprise expansion) triggered an escalation due to an aggressive competitor displacement counter-offer.
                </div>

                <div className="p-2 bg-light rounded border mb-2">
                  <div className="row g-2 small" style={{ fontSize: '0.76rem' }}>
                    <div className="col-12 col-sm-6">
                      <span className="text-muted">Rule 1 Triggered:</span>
                      <div className="fw-semibold text-danger">Enterprise Escalation Priority</div>
                      <div className="text-muted">Suggests Senior AE <strong>Alex Rivera</strong> for executive escalation.</div>
                    </div>
                    <div className="col-12 col-sm-6">
                      <span className="text-muted">Rule 2 Triggered:</span>
                      <div className="fw-semibold text-primary">Existing Ownership Preservation</div>
                      <div className="text-muted">Current assigned rep is <strong>Taylor Kim</strong> (at near capacity).</div>
                    </div>
                  </div>
                </div>

                <div className="small text-muted" style={{ fontSize: '0.76rem' }}>
                  <strong>Deterministic Fallback:</strong> Rather than arbitrarily forcing an unexplainable reassignment, the engine safely suspended automated routing with status <code>Pending Review</code>, requiring managerial ratification.
                </div>
              </div>

              <div className="col-12 col-lg-4 d-flex flex-column justify-content-between border-start ps-lg-3">
                <div>
                  <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Current Assignment State:</div>
                  <div className="fw-bold text-dark">{caseStudyRecord.assigned_owner || 'Unassigned'}</div>
                  <div className="small text-secondary font-mono">Priority: {caseStudyRecord.priority}</div>
                  {caseStudyRecord.override_details && (
                    <div className="small text-success mt-1 fst-italic" style={{ fontSize: '0.72rem' }}>
                      "{caseStudyRecord.override_details.reason}"
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-forest btn-sm mt-2 w-100"
                  onClick={() => onOpenOverrideModal(caseStudyRecord)}
                >
                  <UserCheck size={13} />
                  <span>Execute Manager Override</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Reference Table */}
      <div className="console-card mb-3">
        <div className="console-card-header py-2">
          <span className="fw-semibold small text-dark">Active Deterministic Rule Logic</span>
          <span className="font-mono text-muted small" style={{ fontSize: '0.72rem' }}>5 Rules Configured</span>
        </div>
        <div className="table-responsive">
          <table className="console-table align-middle">
            <thead>
              <tr>
                <th>Rule Identifier</th>
                <th>Rule Name</th>
                <th>Condition Expression</th>
                <th>Priority Target</th>
                <th>Suggested Owner</th>
                <th>Governance Status</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_ROUTING_RULES.map((rule) => (
                <tr key={rule.id}>
                  <td className="font-mono text-muted small">{rule.id}</td>
                  <td className="fw-medium text-dark small">{rule.name}</td>
                  <td className="small text-muted">{rule.description}</td>
                  <td>
                    <span className="console-tag tag-urgent font-mono">
                      {typeof rule.recommendation === 'function' ? 'Dynamic' : rule.recommendation.priority}
                    </span>
                  </td>
                  <td className="small text-dark font-mono">
                    {typeof rule.recommendation === 'function' ? 'Tier Match' : rule.recommendation.suggested_owner || 'Preserve Rep'}
                  </td>
                  <td>
                    <span className="console-tag tag-routed">Deterministic</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Evaluated Records Table */}
      <div className="console-card">
        <div className="console-card-header py-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold small text-dark">
            Conversation Routing Ledger ({filteredRecords.length} records)
          </span>
          <span className="font-mono text-muted small" style={{ fontSize: '0.72rem' }}>
            Showing {filteredRecords.length} of {records.length}
          </span>
        </div>

        <div className="table-responsive">
          <table className="console-table align-middle">
            <thead>
              <tr>
                <th>Record</th>
                <th>Account</th>
                <th>Current Owner</th>
                <th>Suggested Owner</th>
                <th>Matching Rule &amp; Rationale</th>
                <th>Evidence / Context</th>
                <th>Status</th>
                <th className="text-end">Override</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => {
                const hasConflict = rec.routing_status === 'Pending Review' || (rec.routing_conflicts && rec.routing_conflicts.length > 0);
                const isOverridden = rec.manual_override;

                return (
                  <tr key={rec.id} className={hasConflict ? 'row-selected' : ''}>
                    {/* ID */}
                    <td className="font-mono fw-medium text-dark small">
                      {rec.id}
                    </td>

                    {/* Account */}
                    <td>
                      <div className="fw-semibold text-dark small">{rec.account_name}</div>
                      <div className="text-muted small font-mono" style={{ fontSize: '0.72rem' }}>{rec.account_tier}</div>
                    </td>

                    {/* Current Owner */}
                    <td className="small">
                      {rec.assigned_owner ? (
                        <span className="text-secondary">{rec.assigned_owner}</span>
                      ) : (
                        <span className="console-tag tag-high">Unassigned</span>
                      )}
                    </td>

                    {/* Suggested Owner */}
                    <td className="small font-mono text-dark fw-medium">
                      {rec.suggested_owner || rec.assigned_owner || 'Unassigned'}
                    </td>

                    {/* Matching Rule & Rationale */}
                    <td style={{ maxWidth: '250px' }}>
                      <div className="fw-medium text-dark small text-truncate">
                        {rec.routing_rule_triggered || 'Default Fallback'}
                      </div>
                      <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                        {rec.routing_reason}
                      </div>
                    </td>

                    {/* Supporting Evidence */}
                    <td style={{ maxWidth: '240px' }} className="text-truncate small text-secondary">
                      {rec.urgency_reason || rec.notes}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`console-tag ${
                          isOverridden
                            ? 'tag-won'
                            : hasConflict
                            ? 'tag-action'
                            : rec.assigned_owner
                            ? 'tag-routed'
                            : 'tag-medium'
                        }`}
                      >
                        {isOverridden ? 'Overridden' : rec.routing_status || 'Routed'}
                      </span>
                    </td>

                    {/* Override Action */}
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-editorial-outline btn-sm py-0 px-2"
                        style={{ fontSize: '0.76rem' }}
                        onClick={() => onOpenOverrideModal(rec)}
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
