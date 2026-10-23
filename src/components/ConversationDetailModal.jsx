import React from 'react';
import {
  X,
  User,
  Building,
  Calendar,
  Clock,
  PhoneCall,
  Flame,
  CheckCircle,
  AlertTriangle,
  History,
  Edit,
  GitBranch,
} from 'lucide-react';

export default function ConversationDetailModal({
  record,
  onClose,
  onEdit,
  onOverride,
}) {
  if (!record) return null;

  const isOverdue = record.follow_up_status === 'Overdue';
  const isEscalated = record.is_escalated || record.outcome === 'Escalated';

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4">
          {/* Header */}
          <div className="modal-header modal-header-custom d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary fs-6 font-monospace">{record.id}</span>
              <h5 className="modal-title fw-bold mb-0 text-dark">
                {record.account_name} &bull; {record.type}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Urgency Alert if escalated */}
            {isEscalated && (
              <div className="alert alert-danger d-flex align-items-start gap-2 mb-4" role="alert">
                <Flame size={20} className="text-danger flex-shrink-0 mt-1" />
                <div>
                  <div className="fw-bold">Escalation Flagged</div>
                  <div className="small">
                    {record.urgency_reason || 'Urgent customer issue requiring executive attention.'}
                  </div>
                </div>
              </div>
            )}

            {/* Core Info Grid */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded border">
                  <div className="text-muted small fw-semibold mb-2 d-flex align-items-center gap-1">
                    <User size={14} />
                    <span>Contact &amp; Account Details</span>
                  </div>
                  <div className="fw-bold fs-6 text-dark">{record.contact_name}</div>
                  <div className="small text-muted">{record.contact_email || 'No email provided'}</div>
                  <div className="mt-2 d-flex gap-2">
                    <span className="badge bg-light text-dark border">{record.account_tier}</span>
                    <span className="badge bg-secondary text-white">{record.type}</span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 bg-light rounded border">
                  <div className="text-muted small fw-semibold mb-2 d-flex align-items-center gap-1">
                    <Clock size={14} />
                    <span>Call Schedule &amp; Outcome</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Date &amp; Time:</span>
                    <span className="fw-medium text-dark">{record.date} at {record.time}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span className="small text-muted">Duration:</span>
                    <span className="fw-medium text-dark">{record.duration_minutes} minutes</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="small text-muted">Outcome:</span>
                    <span className="badge badge-outcome-action">{record.outcome}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership & Routing Summary */}
            <div className="saas-card p-3 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="fw-bold text-dark d-flex align-items-center gap-1">
                  <GitBranch size={16} className="text-primary" />
                  <span>Ownership &amp; Routing Status</span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => onOverride(record)}
                >
                  Override Routing
                </button>
              </div>

              <div className="row g-2 small">
                <div className="col-12 col-sm-4">
                  <span className="text-muted">Assigned Owner:</span>
                  <div className="fw-semibold text-dark">
                    {record.assigned_owner || <span className="text-warning">Unassigned</span>}
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <span className="text-muted">Suggested Priority:</span>
                  <div>
                    <span className="badge bg-danger text-white">{record.priority}</span>
                  </div>
                </div>
                <div className="col-12 col-sm-4">
                  <span className="text-muted">Routing Status:</span>
                  <div>
                    <span className="badge bg-info text-dark">{record.routing_status}</span>
                  </div>
                </div>
                <div className="col-12 mt-2">
                  <span className="text-muted">Triggered Rule:</span>
                  <div className="fw-medium text-secondary">{record.routing_rule_triggered || 'None'}</div>
                </div>
                <div className="col-12">
                  <span className="text-muted">Routing Explanation:</span>
                  <div className="text-dark">{record.routing_reason || '-'}</div>
                </div>
              </div>
            </div>

            {/* Conversation Intelligence Notes */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-2">Meeting Notes &amp; Intelligence Summary</h6>
              <div className="p-3 bg-light rounded border text-muted small" style={{ lineHeight: '1.6' }}>
                {record.notes || 'No conversation notes available.'}
              </div>
            </div>

            {/* Audit History Timeline */}
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <History size={16} className="text-secondary" />
                <h6 className="fw-bold text-dark mb-0">Record Audit Trail &amp; History</h6>
              </div>

              {(!record.audit_history || record.audit_history.length === 0) ? (
                <div className="text-muted small ps-3">No manual modifications recorded yet.</div>
              ) : (
                <div className="audit-timeline">
                  {record.audit_history.map((log, idx) => (
                    <div key={idx} className="audit-item">
                      <div className="audit-dot" />
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold small text-dark">{log.action || 'MODIFIED'}</span>
                        <span className="text-muted small" style={{ fontSize: '0.725rem' }}>
                          {log.timestamp ? log.timestamp.replace('T', ' ').slice(0, 19) : ''}
                        </span>
                      </div>
                      <div className="small text-muted">
                        User: <strong className="text-dark">{log.user || 'Sales Manager'}</strong> &bull; Field: {log.field}
                      </div>
                      {log.reason && (
                        <div className="small text-secondary fst-italic mt-1">
                          "{log.reason}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-top">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => onEdit(record)}
            >
              <Edit size={14} />
              <span>Edit Record Fields</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
