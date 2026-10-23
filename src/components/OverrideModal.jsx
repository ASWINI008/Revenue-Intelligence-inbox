import React, { useState } from 'react';
import { GitBranch, ShieldAlert, AlertTriangle, UserCheck } from 'lucide-react';
import { applyManagerOverride } from '../services/routingEngine';

export default function OverrideModal({
  record,
  onClose,
  onSaveOverride,
}) {
  if (!record) return null;

  const [selectedOwner, setSelectedOwner] = useState(
    record.suggested_owner || record.assigned_owner || 'Alex Rivera'
  );
  const [selectedPriority, setSelectedPriority] = useState(
    record.suggested_priority || record.priority || 'High'
  );
  const [overrideReason, setOverrideReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const repOptions = [
    'Alex Rivera', // Senior Enterprise AE
    'Taylor Kim',  // Mid-Market AE
    'Jordan Lee',  // Commercial / SMB AE
    'Customer Success Team',
    'Escalations Management Desk',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      setErrorMsg('Please specify the operational rationale for overriding the rule-based recommendation.');
      return;
    }

    const updated = applyManagerOverride(
      record,
      selectedOwner,
      selectedPriority,
      overrideReason,
      'Sales Manager'
    );

    onSaveOverride(updated);
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(37, 41, 35, 0.45)' }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content border rounded-2 shadow-sm" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="modal-header py-2.5 px-3 bg-surface border-bottom d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="font-mono text-dark fw-bold small">{record.id}</span>
              <span className="text-secondary small">&bull; Routing Override ({record.account_name})</span>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              style={{ fontSize: '0.75rem' }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-3">
              {errorMsg && (
                <div className="alert alert-danger py-1.5 px-2 small mb-2" style={{ fontSize: '0.76rem' }}>
                  {errorMsg}
                </div>
              )}

              {/* Conflict Context Banner */}
              {record.routing_conflicts && record.routing_conflicts.length > 0 && (
                <div className="p-2 bg-light border border-warning rounded mb-2 small" style={{ fontSize: '0.75rem' }}>
                  <div className="fw-bold text-dark d-flex align-items-center gap-1 mb-1">
                    <ShieldAlert size={13} style={{ color: 'var(--attention-orange)' }} />
                    <span>Rule Conflicts Detected:</span>
                  </div>
                  <ul className="mb-0 ps-3 text-secondary">
                    {record.routing_conflicts.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Current Recommendation */}
              <div className="p-2 bg-light rounded border mb-2 small" style={{ fontSize: '0.75rem' }}>
                <div className="text-muted fw-semibold mb-1">Engine Decision Reference:</div>
                <div>Rule Triggered: <span className="fw-semibold text-dark">{record.routing_rule_triggered || 'Default'}</span></div>
                <div>Suggested Owner: <span className="font-mono text-dark fw-medium">{record.suggested_owner || record.assigned_owner || 'Unassigned'}</span></div>
                <div>Suggested Priority: <span className="console-tag tag-urgent ms-1">{record.suggested_priority || record.priority}</span></div>
              </div>

              {/* Override Controls */}
              <div className="mb-2">
                <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Override Assigned Owner</label>
                <select
                  className="form-select"
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                >
                  {repOptions.map((rep) => (
                    <option key={rep} value={rep}>
                      {rep}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Override Priority Level</label>
                <select
                  className="form-select"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label fw-bold text-dark small mb-1" style={{ fontSize: '0.76rem' }}>
                  Manager Justification Rationale <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={2}
                  className="form-control"
                  placeholder="e.g. Account assigned to Alex Rivera as Executive Sponsor to handle CFO pricing objections."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  required
                />
                <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>
                  Recorded in audit trail alongside the previous decision to provide complete operational governance transparency.
                </div>
              </div>
            </div>

            <div className="modal-footer py-2 px-3 bg-light border-top d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-editorial-outline btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-forest btn-sm"
              >
                <UserCheck size={13} />
                <span>Confirm Override</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
