import React, { useState } from 'react';
import { Edit, Save, X, AlertTriangle } from 'lucide-react';

export default function EditModal({
  record,
  onClose,
  onSave,
}) {
  if (!record) return null;

  const [formData, setFormData] = useState({
    account_name: record.account_name || '',
    contact_name: record.contact_name || '',
    assigned_owner: record.assigned_owner || record.rep_name || '',
    outcome: record.outcome || 'Action Required',
    priority: record.priority || 'Medium',
    follow_up_status: record.follow_up_status || 'None',
    follow_up_due_date: record.follow_up_due_date || '',
    notes: record.notes || '',
    editReason: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.account_name.trim()) {
      setValidationError('Account name is required.');
      return;
    }
    if (!formData.contact_name.trim()) {
      setValidationError('Contact name is required.');
      return;
    }
    if (!formData.editReason.trim()) {
      setValidationError('Please specify the justification reason for this manual edit (required for audit compliance).');
      return;
    }

    const changedFields = [];
    const fieldsToCompare = [
      'account_name',
      'contact_name',
      'assigned_owner',
      'outcome',
      'priority',
      'follow_up_status',
      'follow_up_due_date',
      'notes',
    ];

    fieldsToCompare.forEach((f) => {
      if (String(formData[f] || '') !== String(record[f] || '')) {
        changedFields.push({
          field: f,
          oldValue: record[f] || 'None',
          newValue: formData[f],
        });
      }
    });

    if (changedFields.length === 0) {
      setValidationError('No fields were changed.');
      return;
    }

    const timestamp = new Date().toISOString();
    const auditEntries = changedFields.map((cf) => ({
      timestamp,
      user: 'Sales Manager',
      action: 'MANUAL_EDIT',
      field: cf.field,
      oldValue: cf.oldValue,
      newValue: cf.newValue,
      reason: formData.editReason,
    }));

    const updatedRecord = {
      ...record,
      ...formData,
      rep_name: formData.assigned_owner,
      manual_override: true,
      audit_history: [...auditEntries, ...(record.audit_history || [])],
    };

    onSave(updatedRecord);
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
              <span className="text-secondary small">&bull; Manual Record Correction</span>
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
              {validationError && (
                <div className="alert alert-danger py-1.5 px-2 small mb-2" style={{ fontSize: '0.76rem' }}>
                  {validationError}
                </div>
              )}

              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Account Name</label>
                  <input
                    type="text"
                    name="account_name"
                    className="form-control"
                    value={formData.account_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Contact Name</label>
                  <input
                    type="text"
                    name="contact_name"
                    className="form-control"
                    value={formData.contact_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Assigned Owner</label>
                  <input
                    type="text"
                    name="assigned_owner"
                    className="form-control"
                    value={formData.assigned_owner}
                    onChange={handleChange}
                    placeholder="e.g. Alex Rivera"
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Outcome</label>
                  <select
                    name="outcome"
                    className="form-select"
                    value={formData.outcome}
                    onChange={handleChange}
                  >
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Meeting Scheduled">Meeting Scheduled</option>
                    <option value="Action Required">Action Required</option>
                    <option value="Needs Nurturing">Needs Nurturing</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Priority</label>
                  <select
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Follow-up Status</label>
                  <select
                    name="follow_up_status"
                    className="form-select"
                    value={formData.follow_up_status}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Follow-up Due Date</label>
                  <input
                    type="date"
                    name="follow_up_due_date"
                    className="form-control font-mono"
                    value={formData.follow_up_due_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label text-muted small mb-1" style={{ fontSize: '0.74rem' }}>Meeting Notes</label>
                  <textarea
                    name="notes"
                    rows={2}
                    className="form-control"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold text-dark small mb-1" style={{ fontSize: '0.76rem' }}>
                    Reason for Manual Edit <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="editReason"
                    className="form-control"
                    placeholder="e.g. Corrected rep assignment following manager pipeline review"
                    value={formData.editReason}
                    onChange={handleChange}
                    required
                  />
                  <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>
                    Appended to immutable audit trail and protects this record from being clobbered in future imports.
                  </div>
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
                <Save size={13} />
                <span>Save Correction</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
