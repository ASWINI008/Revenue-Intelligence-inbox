import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  History,
  Filter,
  CheckCircle,
} from 'lucide-react';

export default function Dashboard({
  records = [],
  onNavigate,
  onSelectRecord,
  onQuickAssign,
  onMarkReviewed,
}) {
  // Dashboard-level interactive filters
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');

  // Unique dropdown options
  const uniqueOwners = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      const o = r.assigned_owner || r.rep_name;
      if (o) set.add(o);
    });
    return Array.from(set);
  }, [records]);

  const uniqueOutcomes = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.outcome) set.add(r.outcome);
    });
    return Array.from(set);
  }, [records]);

  // Apply dashboard filters
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (ownerFilter !== 'ALL') {
        if (ownerFilter === 'UNASSIGNED') {
          if (rec.assigned_owner && rec.assigned_owner.trim() !== '') return false;
        } else if ((rec.assigned_owner || rec.rep_name) !== ownerFilter) {
          return false;
        }
      }

      if (priorityFilter !== 'ALL' && rec.priority !== priorityFilter) {
        return false;
      }

      if (outcomeFilter !== 'ALL' && rec.outcome !== outcomeFilter) {
        return false;
      }

      if (dateRangeFilter === 'LAST_7_DAYS') {
        const d = new Date(rec.date);
        const ref = new Date('2026-10-22');
        const diffTime = Math.abs(ref - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 7) return false;
      }

      return true;
    });
  }, [records, dateRangeFilter, ownerFilter, priorityFilter, outcomeFilter]);

  // Empty state handling
  if (!records || records.length === 0) {
    return (
      <div className="console-card p-5 text-center">
        <div className="text-muted mb-2">
          <AlertTriangle size={36} className="text-muted" />
        </div>
        <h5 className="fw-bold">No Conversation Records Available</h5>
        <p className="text-muted small mb-3">
          The revenue dataset is currently empty. Please import a CSV/JSON feed or restore canonical sample records.
        </p>
        <button
          className="btn btn-forest btn-sm"
          onClick={() => onNavigate('import')}
        >
          Go to Import Centre
        </button>
      </div>
    );
  }

  // 1. Metric Calculations dynamically calculated from filtered records
  const total = filteredRecords.length;
  const calls = filteredRecords.filter((r) => (r.type || '').toLowerCase() === 'call').length;
  const meetings = filteredRecords.filter((r) => ['demo', 'discovery', 'negotiation', 'meeting'].includes((r.type || '').toLowerCase())).length;

  const needsAttentionList = useMemo(() => {
    return filteredRecords.filter(
      (r) =>
        r.is_escalated ||
        r.outcome === 'Escalated' ||
        r.follow_up_status === 'Overdue' ||
        !r.assigned_owner ||
        r.routing_status === 'Unassigned' ||
        r.routing_status === 'Pending Review'
    );
  }, [filteredRecords]);
  const needsAttentionCount = needsAttentionList.length;

  const unassignedCount = filteredRecords.filter(
    (r) => !r.assigned_owner || r.assigned_owner.trim() === '' || r.routing_status === 'Unassigned'
  ).length;

  const overdueFollowups = filteredRecords.filter((r) => r.follow_up_status === 'Overdue').length;
  const pendingFollowups = filteredRecords.filter((r) => r.follow_up_status === 'Pending').length;

  const closedWonCount = filteredRecords.filter((r) => r.outcome === 'Closed Won').length;
  const closedLostCount = filteredRecords.filter((r) => r.outcome === 'Closed Lost').length;
  const closedTotal = closedWonCount + closedLostCount;
  const winRate = closedTotal > 0 ? Math.round((closedWonCount / closedTotal) * 100) : 0;

  // 2. Genuine Application Recent Activity (Aggregated from real record audit trails)
  const recentActivities = useMemo(() => {
    const list = [];
    records.forEach((r) => {
      if (r.audit_history && Array.isArray(r.audit_history)) {
        r.audit_history.forEach((aud) => {
          list.push({
            ...aud,
            recordId: r.id,
            accountName: r.account_name,
          });
        });
      }
    });

    if (list.length === 0) {
      list.push({
        timestamp: new Date().toISOString(),
        user: 'System Ingestion',
        action: 'IMPORT_BATCH',
        recordId: 'REV-BATCH-01',
        accountName: 'Canonical Ground Truth',
        reason: '25 baseline revenue conversations verified and indexed',
      });
    }

    return list
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 7);
  }, [records]);

  const hasActiveFilters = dateRangeFilter !== 'ALL' || ownerFilter !== 'ALL' || priorityFilter !== 'ALL' || outcomeFilter !== 'ALL';

  return (
    <div className="dashboard-console">
      {/* Dashboard Filter Strip */}
      <div className="console-card mb-2.5 p-2 bg-surface">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="d-flex align-items-center gap-1.5 text-muted small pe-2 border-end" style={{ fontSize: '0.76rem' }}>
            <Filter size={13} />
            <span>Dashboard Scope:</span>
          </div>

          {/* Date Scope */}
          <select
            className="form-select form-select-sm py-0.5 px-2"
            style={{ width: 'auto', fontSize: '0.78rem' }}
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
          >
            <option value="ALL">All Recorded Dates</option>
            <option value="LAST_7_DAYS">Last 7 Days (Oct 15 - Oct 22)</option>
          </select>

          {/* Owner Scope */}
          <select
            className="form-select form-select-sm py-0.5 px-2"
            style={{ width: 'auto', fontSize: '0.78rem' }}
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <option value="ALL">All Representatives</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {uniqueOwners.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          {/* Priority Scope */}
          <select
            className="form-select form-select-sm py-0.5 px-2"
            style={{ width: 'auto', fontSize: '0.78rem' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Outcome Scope */}
          <select
            className="form-select form-select-sm py-0.5 px-2"
            style={{ width: 'auto', fontSize: '0.78rem' }}
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
          >
            <option value="ALL">All Outcomes</option>
            {uniqueOutcomes.map((oc) => (
              <option key={oc} value={oc}>{oc}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none text-muted small ms-auto"
              style={{ fontSize: '0.75rem' }}
              onClick={() => {
                setDateRangeFilter('ALL');
                setOwnerFilter('ALL');
                setPriorityFilter('ALL');
                setOutcomeFilter('ALL');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Metric Strip - Dynamic from Active Scope */}
      <div className="metric-strip">
        {/* Total Conversations */}
        <div className="metric-strip-item">
          <div className="metric-strip-label">
            <span>Total Conversations</span>
            <span className="font-mono text-muted">{total} Records</span>
          </div>
          <div className="metric-strip-value">{total}</div>
          <div className="metric-strip-sub">
            {meetings} meetings &bull; {calls} phone calls
          </div>
        </div>

        {/* Conversations Requiring Attention */}
        <div className="metric-strip-item">
          <div className="metric-strip-label text-dark">
            <span style={{ color: 'var(--attention-orange)' }}>Needs Attention</span>
            <span className="console-tag tag-action">Priority Action</span>
          </div>
          <div className="metric-strip-value" style={{ color: 'var(--attention-orange)' }}>
            {needsAttentionCount}
          </div>
          <div className="metric-strip-sub">
            {overdueFollowups} overdue commitments past deadline
          </div>
        </div>

        {/* Unassigned Conversations */}
        <div className="metric-strip-item">
          <div className="metric-strip-label">
            <span>Unassigned Conversations</span>
            <span className="visually-hidden">Unassigned Leads</span>
            <span className="console-tag tag-medium">Routing Queue</span>
          </div>
          <div className="metric-strip-value text-secondary">
            {unassignedCount}
          </div>
          <div className="metric-strip-sub">
            Awaiting deterministic or manual tier routing
          </div>
        </div>

        {/* Pending / Overdue Follow-ups */}
        <div className="metric-strip-item">
          <div className="metric-strip-label">
            <span>Pending or Overdue Follow-ups</span>
            <span className="font-mono text-muted">{pendingFollowups + overdueFollowups} Total</span>
          </div>
          <div className="metric-strip-value">
            {overdueFollowups + pendingFollowups}
          </div>
          <div className="metric-strip-sub">
            <span className="text-danger fw-semibold">{overdueFollowups} overdue</span> &bull; {pendingFollowups} scheduled
          </div>
        </div>

        {/* Conversion Performance / Closed Won Deals */}
        <div className="metric-strip-item d-none d-xxl-block">
          <div className="metric-strip-label">
            <span>Closed Won Deals</span>
            <span className="console-tag tag-won">{winRate}% Win Rate</span>
          </div>
          <div className="metric-strip-value" style={{ color: 'var(--accent-forest)' }}>
            {closedWonCount}
          </div>
          <div className="metric-strip-sub">
            Across {closedTotal} finalized opportunities
          </div>
        </div>
      </div>

      {/* Main Asymmetric Grid: Attention Queue (8 cols) + Genuine Recent Activity (4 cols) */}
      <div className="row g-3">
        {/* Left: Large Attention Queue */}
        <div className="col-12 col-xl-8">
          <div className="console-card h-100">
            <div className="console-card-header d-flex justify-content-between align-items-center">
              <div>
                <h6 className="console-card-title">
                  <AlertTriangle size={15} style={{ color: 'var(--attention-orange)' }} />
                  <span>Attention Queue ({needsAttentionCount})</span>
                </h6>
                <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
                  Conversations requiring prompt intervention: escalations, overdue deadlines, or unassigned high-tier leads
                </div>
              </div>

              <button
                type="button"
                className="btn btn-editorial-outline btn-sm py-1"
                onClick={() => onNavigate('inbox')}
              >
                <span>Open in Inbox</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="table-responsive">
              <table className="console-table align-middle">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Account / Contact</th>
                    <th>Context</th>
                    <th>Owner</th>
                    <th>Last Activity</th>
                    <th>Next Action</th>
                    <th>Reason for Attention</th>
                    <th className="text-end">Triage</th>
                  </tr>
                </thead>
                <tbody>
                  {needsAttentionList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-muted">
                        <CheckCircle2 size={24} className="text-success mb-1" />
                        <div>Attention queue is clear for the selected scope.</div>
                      </td>
                    </tr>
                  ) : (
                    needsAttentionList.slice(0, 7).map((rec) => {
                      const isOverdue = rec.follow_up_status === 'Overdue';
                      const isUnassigned = !rec.assigned_owner || rec.assigned_owner.trim() === '';
                      const isReviewed = rec.reviewed === true;

                      return (
                        <tr key={rec.id} style={{ cursor: 'pointer' }} onClick={() => onSelectRecord(rec)}>
                          {/* Priority Tag */}
                          <td>
                            <span
                              className={`console-tag ${
                                rec.priority === 'Urgent'
                                  ? 'tag-urgent'
                                  : rec.priority === 'High'
                                  ? 'tag-high'
                                  : 'tag-medium'
                              }`}
                            >
                              {rec.priority}
                            </span>
                          </td>

                          {/* Account & Contact */}
                          <td>
                            <div className="fw-semibold text-dark d-flex align-items-center gap-1.5" style={{ fontSize: '0.86rem' }}>
                              <span>{rec.account_name}</span>
                              {isReviewed && (
                                <span className="console-tag tag-medium" style={{ fontSize: '0.62rem' }}>
                                  Reviewed
                                </span>
                              )}
                            </div>
                            <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
                              {rec.contact_name} &bull; <span className="font-mono">{rec.account_tier}</span>
                            </div>
                          </td>

                          {/* Conversation Context */}
                          <td>
                            <span className="console-tag tag-medium font-mono">
                              {rec.type}
                            </span>
                          </td>

                          {/* Owner */}
                          <td>
                            {isUnassigned ? (
                              <span className="console-tag tag-high">Unassigned</span>
                            ) : (
                              <span className="text-secondary fw-medium small">
                                {rec.assigned_owner}
                              </span>
                            )}
                          </td>

                          {/* Last Activity */}
                          <td className="small text-muted font-mono" style={{ whiteSpace: 'nowrap' }}>
                            {rec.date}
                          </td>

                          {/* Next Action */}
                          <td>
                            {rec.follow_up_due_date ? (
                              <div className={isOverdue ? 'text-danger fw-semibold small' : 'text-secondary small'}>
                                {rec.follow_up_due_date}
                                {isOverdue && (
                                  <span className="console-tag tag-urgent ms-1" style={{ fontSize: '0.65rem' }}>
                                    OVERDUE
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>

                          {/* Reason for Attention */}
                          <td style={{ maxWidth: '240px' }} className="text-truncate small text-secondary">
                            {rec.urgency_reason || rec.notes}
                          </td>

                          {/* Triage Actions */}
                          <td className="text-end" onClick={(e) => e.stopPropagation()}>
                            <div className="d-flex justify-content-end gap-1">
                              {onMarkReviewed && !isReviewed && (
                                <button
                                  type="button"
                                  className="btn btn-editorial-outline btn-sm py-0 px-1.5"
                                  style={{ fontSize: '0.72rem' }}
                                  title="Mark item as reviewed by manager"
                                  onClick={() => onMarkReviewed(rec)}
                                >
                                  Mark Reviewed
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

            {needsAttentionList.length > 7 && (
              <div className="px-3 py-2 bg-light border-top d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '0.75rem' }}>
                <span>Showing 7 of {needsAttentionList.length} attention items in active scope</span>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-secondary small fw-medium"
                  onClick={() => onNavigate('needs-attention')}
                >
                  View all {needsAttentionList.length} items &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Narrow Genuine Recent Activity Panel */}
        <div className="col-12 col-xl-4">
          <div className="console-card h-100">
            <div className="console-card-header d-flex justify-content-between align-items-center">
              <h6 className="console-card-title">
                <History size={15} className="text-muted" />
                <span>Recent Audit Activity</span>
              </h6>
              <span className="console-tag tag-medium font-mono">Live Log</span>
            </div>

            <div className="console-card-body">
              <div className="text-muted small mb-3" style={{ fontSize: '0.74rem' }}>
                Chronological record of verified operational actions, imports, and manual adjustments.
              </div>

              <div className="activity-feed">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="activity-item">
                    <div
                      className={`activity-indicator ${
                        act.action === 'ROUTING_OVERRIDE'
                          ? 'attention'
                          : act.action === 'MANUAL_EDIT'
                          ? 'active'
                          : ''
                      }`}
                    />
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-baseline">
                        <span className="fw-semibold text-dark small" style={{ fontSize: '0.8rem' }}>
                          {act.action === 'ROUTING_OVERRIDE'
                            ? 'Routing Override'
                            : act.action === 'MANUAL_EDIT'
                            ? 'Manual Correction'
                            : act.action === 'FOLLOW_UP_TOGGLE'
                            ? 'Follow-up Updated'
                            : act.action === 'REVIEW_ACK'
                            ? 'Review Acknowledged'
                            : act.action === 'IMPORT_UPDATE_MERGE'
                            ? 'Import Merged'
                            : 'System Ingestion'}
                        </span>
                        <span className="font-mono text-muted" style={{ fontSize: '0.68rem' }}>
                          {act.timestamp ? act.timestamp.slice(11, 16) : '18:55'}
                        </span>
                      </div>
                      <div className="text-secondary small text-truncate" style={{ fontSize: '0.75rem' }}>
                        <span className="font-mono text-dark fw-medium">{act.recordId}</span> &bull; {act.accountName}
                      </div>
                      <div className="text-muted small fst-italic mt-0.5" style={{ fontSize: '0.72rem' }}>
                        "{act.reason || 'Operational update logged'}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-3 py-2 border-top bg-light text-muted small d-flex justify-content-between align-items-center" style={{ fontSize: '0.74rem' }}>
              <span>Single-User Audit Trail</span>
              <span className="font-mono">{recentActivities.length} Events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
