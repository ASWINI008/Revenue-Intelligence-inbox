import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  UserCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Flame,
  GitBranch,
  History,
  X,
  ExternalLink,
} from 'lucide-react';

export default function Inbox({
  records = [],
  onSelectRecord,
  onEditRecord,
  onQuickAssign,
  onToggleFollowup,
  onOpenOverrideModal,
}) {
  // Local filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Sorting state
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Persistent Selected Conversation for Right Detail Panel
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // Available unique values for dropdowns
  const uniqueOwners = useMemo(() => {
    const s = new Set();
    records.forEach((r) => {
      const o = r.assigned_owner || r.rep_name;
      if (o) s.add(o);
    });
    return Array.from(s);
  }, [records]);

  const uniqueOutcomes = useMemo(() => {
    const s = new Set();
    records.forEach((r) => {
      if (r.outcome) s.add(r.outcome);
    });
    return Array.from(s);
  }, [records]);

  const priorityWeights = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchAccount = (rec.account_name || '').toLowerCase().includes(term);
          const matchContact = (rec.contact_name || '').toLowerCase().includes(term);
          const matchId = (rec.id || '').toLowerCase().includes(term);
          const matchNotes = (rec.notes || '').toLowerCase().includes(term);
          const matchOwner = (rec.assigned_owner || rec.rep_name || '').toLowerCase().includes(term);
          if (!matchAccount && !matchContact && !matchId && !matchNotes && !matchOwner) {
            return false;
          }
        }

        if (ownerFilter !== 'ALL') {
          if (ownerFilter === 'UNASSIGNED') {
            if (rec.assigned_owner && rec.assigned_owner.trim() !== '') return false;
          } else if ((rec.assigned_owner || rec.rep_name) !== ownerFilter) {
            return false;
          }
        }

        if (priorityFilter !== 'ALL' && rec.priority !== priorityFilter) return false;
        if (outcomeFilter !== 'ALL' && rec.outcome !== outcomeFilter) return false;
        if (typeFilter !== 'ALL' && rec.type !== typeFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'priority') {
          valA = priorityWeights[a.priority] || 0;
          valB = priorityWeights[b.priority] || 0;
        } else if (sortField === 'duration_minutes') {
          valA = Number(a.duration_minutes || 0);
          valB = Number(b.duration_minutes || 0);
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    records,
    searchTerm,
    ownerFilter,
    priorityFilter,
    outcomeFilter,
    typeFilter,
    sortField,
    sortDirection,
  ]);

  // Default selection to first record if none selected or if selected was filtered out
  useEffect(() => {
    if (filteredRecords.length > 0) {
      const stillExists = filteredRecords.some((r) => r.id === selectedRecordId);
      if (!stillExists) {
        setSelectedRecordId(filteredRecords[0].id);
      }
    } else {
      setSelectedRecordId(null);
    }
  }, [filteredRecords, selectedRecordId]);

  // Selected record object
  const activeRecord = useMemo(() => {
    return records.find((r) => r.id === selectedRecordId) || null;
  }, [records, selectedRecordId]);

  // Pagination calculation
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setOwnerFilter('ALL');
    setPriorityFilter('ALL');
    setOutcomeFilter('ALL');
    setTypeFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="inbox-view">
      {/* Three-Panel Layout: List Panel + Persistent Details Panel */}
      <div className="inbox-three-panel">
        {/* Left / Middle: Searchable Conversation List Panel */}
        <div className="inbox-list-panel">
          {/* Top Filter & Search Toolbar */}
          <div className="p-2 border-bottom bg-surface d-flex flex-wrap gap-2 align-items-center">
            {/* Search Input */}
            <div className="input-group input-group-sm" style={{ width: '180px' }}>
              <span className="input-group-text bg-white border-end-0 py-1">
                <Search size={12} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-white border-start-0 py-1"
                placeholder="Filter table..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ fontSize: '0.78rem' }}
              />
            </div>

            {/* Owner Filter */}
            <select
              className="form-select form-select-sm py-1"
              style={{ width: 'auto', fontSize: '0.78rem' }}
              value={ownerFilter}
              onChange={(e) => {
                setOwnerFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Owners</option>
              <option value="UNASSIGNED">Unassigned Only</option>
              {uniqueOwners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              className="form-select form-select-sm py-1"
              style={{ width: 'auto', fontSize: '0.78rem' }}
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Outcome Filter */}
            <select
              className="form-select form-select-sm py-1"
              style={{ width: 'auto', fontSize: '0.78rem' }}
              value={outcomeFilter}
              onChange={(e) => {
                setOutcomeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Outcomes</option>
              {uniqueOutcomes.map((oc) => (
                <option key={oc} value={oc}>
                  {oc}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              className="form-select form-select-sm py-1"
              style={{ width: 'auto', fontSize: '0.78rem' }}
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Types</option>
              <option value="Demo">Demo</option>
              <option value="Discovery">Discovery</option>
              <option value="Call">Call</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Negotiation">Negotiation</option>
            </select>

            {/* Reset Filters */}
            {(searchTerm || ownerFilter !== 'ALL' || priorityFilter !== 'ALL' || outcomeFilter !== 'ALL' || typeFilter !== 'ALL') && (
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none text-muted small ms-auto"
                style={{ fontSize: '0.75rem' }}
                onClick={clearAllFilters}
              >
                Reset
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="flex-grow-1 overflow-auto">
            <table className="console-table align-middle">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('id')}>
                    <div className="d-flex align-items-center gap-1">
                      <span>ID</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('account_name')}>
                    <div className="d-flex align-items-center gap-1">
                      <span>Account</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th>Type</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('priority')}>
                    <div className="d-flex align-items-center gap-1">
                      <span>Priority</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th>Outcome</th>
                  <th>Owner</th>
                  <th>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <AlertCircle size={24} className="mb-1 text-warning" />
                      <div className="small">No conversations matched your filters.</div>
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((rec) => {
                    const isSelected = rec.id === selectedRecordId;
                    const isOverdue = rec.follow_up_status === 'Overdue';
                    const isUnassigned = !rec.assigned_owner || rec.assigned_owner.trim() === '';

                    return (
                      <tr
                        key={rec.id}
                        className={isSelected ? 'row-selected' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedRecordId(rec.id)}
                      >
                        {/* ID */}
                        <td className="font-mono text-dark fw-medium small">
                          {rec.id}
                        </td>

                        {/* Account & Contact */}
                        <td>
                          <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '140px', fontSize: '0.82rem' }}>
                            {rec.account_name}
                          </div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '140px', fontSize: '0.72rem' }}>
                            {rec.contact_name}
                          </div>
                        </td>

                        {/* Type */}
                        <td>
                          <span className="console-tag tag-medium font-mono">
                            {rec.type}
                          </span>
                        </td>

                        {/* Priority */}
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

                        {/* Outcome */}
                        <td>
                          <span
                            className={`console-tag ${
                              rec.outcome === 'Closed Won'
                                ? 'tag-won'
                                : rec.outcome === 'Closed Lost'
                                ? 'tag-lost'
                                : rec.outcome === 'Escalated'
                                ? 'tag-urgent'
                                : rec.outcome === 'Action Required'
                                ? 'tag-action'
                                : 'tag-medium'
                            }`}
                          >
                            {rec.outcome}
                          </span>
                        </td>

                        {/* Owner */}
                        <td>
                          {isUnassigned ? (
                            <span className="console-tag tag-high">Unassigned</span>
                          ) : (
                            <span className="text-secondary small fw-medium text-truncate d-block" style={{ maxWidth: '90px' }}>
                              {rec.assigned_owner}
                            </span>
                          )}
                        </td>

                        {/* Follow-up */}
                        <td>
                          {rec.follow_up_status && rec.follow_up_status !== 'None' ? (
                            <span
                              className={`console-tag ${
                                isOverdue ? 'tag-urgent' : 'tag-medium'
                              }`}
                            >
                              {isOverdue ? 'Overdue' : rec.follow_up_status}
                            </span>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-3 py-2 border-top bg-surface d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
            <span className="text-muted">
              Showing {filteredRecords.length} conversations (Page {currentPage} of {totalPages})
            </span>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-editorial-outline btn-sm py-0 px-2"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={13} />
              </button>
              <span className="font-mono px-1">{currentPage}</span>
              <button
                type="button"
                className="btn btn-editorial-outline btn-sm py-0 px-2"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Persistent Conversation Details Panel */}
        <div className="inbox-details-panel">
          {activeRecord ? (
            <div className="p-3">
              {/* Header: ID, Tier, and Quick Edit Button */}
              <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="font-mono fw-bold text-dark fs-6">{activeRecord.id}</span>
                  <span className="console-tag tag-medium font-mono">{activeRecord.account_tier}</span>
                  {activeRecord.is_escalated && (
                    <span className="console-tag tag-urgent d-flex align-items-center gap-1">
                      <Flame size={11} />
                      <span>Escalated</span>
                    </span>
                  )}
                </div>

                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-editorial-outline btn-sm py-1 px-2"
                    onClick={() => onEditRecord(activeRecord)}
                    title="Edit record fields"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-forest btn-sm py-1 px-2"
                    onClick={() => onOpenOverrideModal ? onOpenOverrideModal(activeRecord) : onQuickAssign(activeRecord)}
                    title="Override routing or reassign"
                  >
                    <UserCheck size={13} />
                    <span>Reassign</span>
                  </button>
                </div>
              </div>

              {/* Account & Contact Headline */}
              <div className="mb-3">
                <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
                  {activeRecord.account_name}
                </h5>
                <div className="text-secondary small mt-0.5">
                  Contact: <strong className="text-dark">{activeRecord.contact_name}</strong> &bull;{' '}
                  <span className="text-muted font-mono">{activeRecord.contact_email || 'no email'}</span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="p-2.5 bg-light rounded border mb-3">
                <div className="row g-2 small">
                  <div className="col-6">
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Date &amp; Time:</span>
                    <div className="fw-medium text-dark font-mono">{activeRecord.date} at {activeRecord.time}</div>
                  </div>
                  <div className="col-6">
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Duration:</span>
                    <div className="fw-medium text-dark font-mono">{activeRecord.duration_minutes} minutes</div>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Current Owner:</span>
                    <div className="fw-semibold text-dark">
                      {activeRecord.assigned_owner || <span className="text-danger">Unassigned</span>}
                    </div>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Priority:</span>
                    <div>
                      <span className={`console-tag ${activeRecord.priority === 'Urgent' ? 'tag-urgent' : activeRecord.priority === 'High' ? 'tag-high' : 'tag-medium'}`}>
                        {activeRecord.priority}
                      </span>
                    </div>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Outcome:</span>
                    <div>
                      <span className="console-tag tag-action">{activeRecord.outcome}</span>
                    </div>
                  </div>
                  <div className="col-6 mt-2">
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Follow-up:</span>
                    <div className="d-flex align-items-center gap-1">
                      <span className={activeRecord.follow_up_status === 'Overdue' ? 'text-danger fw-bold' : 'text-secondary'}>
                        {activeRecord.follow_up_status || 'None'}
                      </span>
                      {activeRecord.follow_up_due_date && (
                        <span className="font-mono text-muted">({activeRecord.follow_up_due_date})</span>
                      )}
                      <button
                        type="button"
                        className="btn btn-link p-0 text-muted small ms-1"
                        onClick={() => onToggleFollowup(activeRecord)}
                        title="Toggle follow-up status"
                      >
                        [toggle]
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deterministic Routing Explanation */}
              <div className="p-2.5 bg-surface border rounded mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="fw-semibold small text-dark d-flex align-items-center gap-1">
                    <GitBranch size={13} style={{ color: 'var(--accent-forest)' }} />
                    <span>Routing Rationale &amp; Rule Matching</span>
                  </div>
                  <span className="console-tag tag-routed">{activeRecord.routing_status}</span>
                </div>
                <div className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                  Rule Triggered: <strong className="text-dark">{activeRecord.routing_rule_triggered || 'Default Fallback'}</strong>
                </div>
                <div className="small text-secondary" style={{ fontSize: '0.78rem' }}>
                  {activeRecord.routing_reason || 'Retained existing assignment.'}
                </div>

                {activeRecord.routing_conflicts && activeRecord.routing_conflicts.length > 0 && (
                  <div className="mt-2 p-1.5 bg-warning bg-opacity-10 border border-warning rounded small text-dark" style={{ fontSize: '0.74rem' }}>
                    <strong>Conflict:</strong> {activeRecord.routing_conflicts.join('; ')}
                  </div>
                )}
              </div>

              {/* Conversation Notes / Intelligence */}
              <div className="mb-3">
                <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.74rem' }}>
                  MEETING INTELLIGENCE &amp; CONTEXT
                </div>
                <div className="p-2 bg-light border rounded small text-secondary" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                  {activeRecord.notes || 'No call summary provided.'}
                </div>
                {activeRecord.urgency_reason && (
                  <div className="mt-2 small text-danger p-2 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded">
                    <strong>Attention Trigger:</strong> {activeRecord.urgency_reason}
                  </div>
                )}
              </div>

              {/* Record Audit History Timeline */}
              <div>
                <div className="d-flex align-items-center gap-1 mb-2">
                  <History size={13} className="text-muted" />
                  <span className="text-muted small fw-semibold" style={{ fontSize: '0.74rem' }}>
                    RECORD AUDIT TRAIL ({activeRecord.audit_history ? activeRecord.audit_history.length : 0})
                  </span>
                </div>

                {(!activeRecord.audit_history || activeRecord.audit_history.length === 0) ? (
                  <div className="text-muted small p-2 bg-light rounded text-center" style={{ fontSize: '0.74rem' }}>
                    No manual corrections recorded yet.
                  </div>
                ) : (
                  <div className="activity-feed">
                    {activeRecord.audit_history.map((log, lIdx) => (
                      <div key={lIdx} className="activity-item pb-2 mb-2">
                        <div className="activity-indicator active" />
                        <div className="flex-grow-1 min-width-0">
                          <div className="d-flex justify-content-between align-items-baseline">
                            <span className="fw-semibold text-dark small" style={{ fontSize: '0.76rem' }}>
                              {log.action} &bull; {log.field}
                            </span>
                            <span className="font-mono text-muted" style={{ fontSize: '0.68rem' }}>
                              {log.timestamp ? log.timestamp.slice(0, 16).replace('T', ' ') : ''}
                            </span>
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            User: <span className="text-dark">{log.user || 'Sales Manager'}</span>
                          </div>
                          {log.reason && (
                            <div className="small text-secondary fst-italic mt-0.5" style={{ fontSize: '0.72rem' }}>
                              "{log.reason}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center text-muted">
              <Clock size={28} className="mb-2 text-muted" />
              <div className="fw-medium small">Select a conversation</div>
              <div className="small" style={{ fontSize: '0.75rem' }}>
                Click any row in the list to inspect full metadata, routing rationale, and immutable audit logs.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
