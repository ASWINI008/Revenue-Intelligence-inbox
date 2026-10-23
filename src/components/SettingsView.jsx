import React, { useState } from 'react';
import {
  Settings,
  Database,
  ShieldAlert,
  RotateCcw,
  Trash2,
  HardDrive,
  Info,
  CheckCircle,
  FileCode,
} from 'lucide-react';
import { clearAllData, resetToSampleData } from '../services/storageService';

export default function SettingsView({
  records = [],
  onDataUpdated,
}) {
  const [successMessage, setSuccessMessage] = useState('');

  // Estimate localStorage storage size
  const rawData = localStorage.getItem('volopay_revenue_inbox_v1') || '[]';
  const storageBytes = new Blob([rawData]).size;
  const storageKb = (storageBytes / 1024).toFixed(2);

  const handleReset = () => {
    if (window.confirm('Reset all records to canonical baseline dataset (25 records)? Any manual edits will be refreshed.')) {
      const reset = resetToSampleData();
      onDataUpdated(reset);
      setSuccessMessage('Successfully reset dataset to canonical baseline (25 verified records).');
      setTimeout(() => setSuccessMessage(''), 4500);
    }
  };

  const handleClear = () => {
    if (window.confirm('WARNING: This will clear all conversation records from local storage. Are you sure?')) {
      const empty = clearAllData();
      onDataUpdated(empty);
      setSuccessMessage('Cleared local storage dataset.');
      setTimeout(() => setSuccessMessage(''), 4500);
    }
  };

  return (
    <div className="settings-view">
      {/* Top Banner */}
      <div className="console-card mb-3">
        <div className="console-card-body py-2.5 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 className="console-card-title mb-1">
              <Settings size={16} style={{ color: 'var(--accent-forest)' }} />
              <span>Application Settings &amp; Data Store Governance</span>
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
              Inspect client-side storage architecture, schema definitions, and persistent state management.
            </div>
          </div>
          <span className="console-tag tag-routed font-mono">Single-User Local Storage</span>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success py-1.5 px-3 small mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
          <CheckCircle size={14} className="text-success" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Storage Architecture & Limitations Panel */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-7">
          <div className="console-card h-100 p-3">
            <h6 className="fw-semibold small text-dark mb-2 d-flex align-items-center gap-1.5">
              <Database size={14} style={{ color: 'var(--accent-forest)' }} />
              <span>Persistence Architecture &amp; Single-User Constraints</span>
            </h6>
            <p className="text-secondary small mb-2" style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
              The application utilizes HTML5 <code>localStorage</code> (key: <code>volopay_revenue_inbox_v1</code>) for instant, client-first data access without network roundtrip latency.
            </p>
            <div className="p-2.5 bg-light rounded border mb-2 small text-muted" style={{ fontSize: '0.76rem' }}>
              <strong>Documented Limitations:</strong>
              <ul className="mb-0 ps-3 mt-1">
                <li>Scoped strictly to this browser instance and origin.</li>
                <li>Does not provide multi-user live synchronization or concurrent edit locking.</li>
                <li>Manual edits and overrides survive page refreshes and subsequent deduplicated imports.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="console-card h-100 p-3 d-flex flex-column justify-content-between">
            <div>
              <h6 className="fw-semibold small text-dark mb-2 d-flex align-items-center gap-1.5">
                <HardDrive size={14} className="text-muted" />
                <span>Storage Utilization Diagnostics</span>
              </h6>
              <div className="row g-2 small font-mono">
                <div className="col-6">
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Total Active Records:</span>
                  <div className="fw-bold fs-6 text-dark">{records.length}</div>
                </div>
                <div className="col-6">
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Payload Size:</span>
                  <div className="fw-bold fs-6 text-dark">{storageKb} KB</div>
                </div>
                <div className="col-12 mt-2">
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Storage Key:</span>
                  <div className="text-secondary small"><code>volopay_revenue_inbox_v1</code></div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3 pt-2 border-top">
              <button
                type="button"
                className="btn btn-editorial-outline btn-sm flex-grow-1"
                onClick={handleReset}
              >
                <RotateCcw size={12} />
                <span>Reset Baseline</span>
              </button>
              <button
                type="button"
                className="btn btn-editorial-outline btn-sm text-danger"
                onClick={handleClear}
              >
                <Trash2 size={12} />
                <span>Purge Store</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schema Reference Specification */}
      <div className="console-card">
        <div className="console-card-header py-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
            <FileCode size={14} className="text-muted" />
            <span>Supported Schema Specification &amp; Field Mappings</span>
          </span>
          <span className="console-tag tag-medium font-mono">Schema v1.0.0</span>
        </div>
        <div className="table-responsive">
          <table className="console-table align-middle">
            <thead>
              <tr>
                <th>Field Name</th>
                <th>Data Type</th>
                <th>Requirement</th>
                <th>Standard Enumeration / Allowed Values</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono text-dark fw-medium small">id</td>
                <td className="font-mono text-muted small">String</td>
                <td><span className="console-tag tag-routed">Primary Key</span></td>
                <td className="font-mono small">REV-xxxx</td>
                <td className="small text-secondary">Unique conversation identifier used for stable deduplication.</td>
              </tr>
              <tr>
                <td className="font-mono text-dark fw-medium small">account_name</td>
                <td className="font-mono text-muted small">String</td>
                <td><span className="console-tag tag-urgent">Required</span></td>
                <td className="small text-muted">-</td>
                <td className="small text-secondary">Organization / Company name.</td>
              </tr>
              <tr>
                <td className="font-mono text-dark fw-medium small">contact_name</td>
                <td className="font-mono text-muted small">String</td>
                <td><span className="console-tag tag-urgent">Required</span></td>
                <td className="small text-muted">-</td>
                <td className="small text-secondary">Primary stakeholder or customer contact person.</td>
              </tr>
              <tr>
                <td className="font-mono text-dark fw-medium small">priority</td>
                <td className="font-mono text-muted small">Enum</td>
                <td><span className="console-tag tag-medium">Optional</span></td>
                <td className="font-mono small text-secondary">Urgent, High, Medium, Low</td>
                <td className="small text-secondary">Operational triage urgency level.</td>
              </tr>
              <tr>
                <td className="font-mono text-dark fw-medium small">outcome</td>
                <td className="font-mono text-muted small">Enum</td>
                <td><span className="console-tag tag-medium">Optional</span></td>
                <td className="font-mono small text-secondary">Closed Won, Closed Lost, Qualified, Meeting Scheduled, Action Required, Needs Nurturing, Escalated</td>
                <td className="small text-secondary">Business conversation outcome classification.</td>
              </tr>
              <tr>
                <td className="font-mono text-dark fw-medium small">follow_up_status</td>
                <td className="font-mono text-muted small">Enum</td>
                <td><span className="console-tag tag-medium">Optional</span></td>
                <td className="font-mono small text-secondary">Pending, Completed, Overdue, None</td>
                <td className="small text-secondary">Action item tracking status.</td>
              </tr>
              <tr>
                <td className="font-mono text-dark fw-medium small">assigned_owner</td>
                <td className="font-mono text-muted small">String</td>
                <td><span className="console-tag tag-medium">Optional</span></td>
                <td className="small text-muted">-</td>
                <td className="small text-secondary">Sales executive or account representative assigned.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
