import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  UserX,
  Flame,
  CheckCircle,
  Eye,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

export default function NeedsAttention({
  records = [],
  onSelectRecord,
  onEditRecord,
  onQuickAssign,
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const needsAttentionRecords = useMemo(() => {
    return records.filter((r) => {
      const isEsc = r.is_escalated || r.outcome === 'Escalated';
      const isOverdue = r.follow_up_status === 'Overdue';
      const isUnassigned = !r.assigned_owner || r.assigned_owner.trim() === '' || r.routing_status === 'Unassigned';
      const isConflicted = r.routing_status === 'Pending Review' || (r.routing_conflicts && r.routing_conflicts.length > 0);

      if (activeFilter === 'ESCALATED') return isEsc;
      if (activeFilter === 'OVERDUE') return isOverdue;
      if (activeFilter === 'UNASSIGNED') return isUnassigned;
      if (activeFilter === 'CONFLICTED') return isConflicted;

      return isEsc || isOverdue || isUnassigned || isConflicted;
    });
  }, [records, activeFilter]);

  const escalatedCount = records.filter((r) => r.is_escalated || r.outcome === 'Escalated').length;
  const overdueCount = records.filter((r) => r.follow_up_status === 'Overdue').length;
  const unassignedCount = records.filter((r) => !r.assigned_owner || r.assigned_owner.trim() === '').length;
  const conflictedCount = records.filter((r) => r.routing_status === 'Pending Review').length;

  return (
    <div className="needs-attention-view">
      {/* Top Banner */}
      <div className="console-card mb-3 border-start border-4" style={{ borderLeftColor: 'var(--attention-orange)' }}>
        <div className="console-card-body py-2.5 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 className="console-card-title mb-1">
              <AlertTriangle size={16} style={{ color: 'var(--attention-orange)' }} />
              <span>Manager Triage &bull; High-Priority Action Items</span>
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
              Conversations requiring managerial intervention: customer escalations, overdue commitments past due date, and unassigned accounts.
            </div>
          </div>

          <div className="d-flex gap-2">
            <span className="console-tag tag-action font-mono">
              {needsAttentionRecords.length} Items Pending Action
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-forest' : 'btn-editorial-outline'}`}
          onClick={() => setActiveFilter('ALL')}
        >
          All Attention Items ({records.filter((r) => r.is_escalated || r.outcome === 'Escalated' || r.follow_up_status === 'Overdue' || !r.assigned_owner || r.routing_status === 'Pending Review').length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFilter === 'ESCALATED' ? 'btn-forest' : 'btn-editorial-outline'}`}
          onClick={() => setActiveFilter('ESCALATED')}
        >
          <Flame size={13} />
          <span>Escalated Deals ({escalatedCount})</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFilter === 'OVERDUE' ? 'btn-forest' : 'btn-editorial-outline'}`}
          onClick={() => setActiveFilter('OVERDUE')}
        >
          <Clock size={13} />
          <span>Overdue Follow-ups ({overdueCount})</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFilter === 'UNASSIGNED' ? 'btn-forest' : 'btn-editorial-outline'}`}
          onClick={() => setActiveFilter('UNASSIGNED')}
        >
          <UserX size={13} />
          <span>Unassigned ({unassignedCount})</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeFilter === 'CONFLICTED' ? 'btn-forest' : 'btn-editorial-outline'}`}
          onClick={() => setActiveFilter('CONFLICTED')}
        >
          <ShieldAlert size={13} />
          <span>Routing Ambiguities ({conflictedCount})</span>
        </button>
      </div>

      {/* Table */}
      <div className="console-card">
        <div className="table-responsive">
          <table className="console-table align-middle mb-0">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Account &amp; Tier</th>
                <th>Rep / Owner</th>
                <th>Priority</th>
                <th>Outcome</th>
                <th>Attention Trigger / Risk Evidence</th>
                <th>Follow-up Due</th>
                <th className="text-end">Triage Action</th>
              </tr>
            </thead>
            <tbody>
              {needsAttentionRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <CheckCircle size={28} className="text-success mb-1" />
                    <div className="fw-medium small">All caught up!</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      No unresolved conversations in this filter category.
                    </div>
                  </td>
                </tr>
              ) : (
                needsAttentionRecords.map((rec) => {
                  const isEsc = rec.is_escalated || rec.outcome === 'Escalated';
                  const isOverdue = rec.follow_up_status === 'Overdue';
                  const isUnassigned = !rec.assigned_owner || rec.assigned_owner.trim() === '';

                  return (
                    <tr key={rec.id} className={isEsc ? 'row-selected' : ''}>
                      <td className="font-mono text-dark fw-medium small">{rec.id}</td>
                      <td>
                        <div className="fw-semibold text-dark small">{rec.account_name}</div>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {rec.contact_name} &bull; <span className="font-mono">{rec.account_tier}</span>
                        </div>
                      </td>
                      <td>
                        {isUnassigned ? (
                          <span className="console-tag tag-high">Unassigned</span>
                        ) : (
                          <span className="text-secondary small">{rec.assigned_owner}</span>
                        )}
                      </td>
                      <td>
                        <span className={`console-tag ${rec.priority === 'Urgent' ? 'tag-urgent' : 'tag-high'}`}>
                          {rec.priority}
                        </span>
                      </td>
                      <td>
                        <span className="console-tag tag-action">{rec.outcome}</span>
                      </td>
                      <td style={{ maxWidth: '300px' }} className="small text-secondary">
                        {isEsc && (
                          <span className="console-tag tag-urgent me-1" style={{ fontSize: '0.65rem' }}>
                            ESCALATION
                          </span>
                        )}
                        <span>{rec.urgency_reason || rec.notes}</span>
                      </td>
                      <td>
                        {rec.follow_up_due_date ? (
                          <div className={isOverdue ? 'text-danger fw-bold small' : 'text-secondary small'}>
                            {rec.follow_up_due_date}
                            {isOverdue && <span className="console-tag tag-urgent ms-1" style={{ fontSize: '0.65rem' }}>OVERDUE</span>}
                          </div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          {isUnassigned && (
                            <button
                              type="button"
                              className="btn btn-forest btn-sm py-0 px-2"
                              style={{ fontSize: '0.76rem' }}
                              onClick={() => onQuickAssign(rec)}
                            >
                              Assign
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-editorial-outline btn-sm py-0 px-2"
                            style={{ fontSize: '0.76rem' }}
                            onClick={() => onSelectRecord(rec)}
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
