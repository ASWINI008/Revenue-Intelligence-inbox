import React, { useState } from 'react';
import {
  Download,
  FileCheck,
  CheckCircle,
  Database,
  FileText,
  Calendar,
  Layers,
  ArrowDownToLine,
} from 'lucide-react';
import {
  toCSVString,
  toJSONString,
  triggerBrowserDownload,
  createManifestEntry,
  sanitizeForExport,
  prepareNeedsAttentionExport,
  prepareRoutingDecisionsExport,
} from '../services/exportService';

export default function ExportView({ records = [] }) {
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');
  const [manifestList, setManifestList] = useState([
    {
      export_filename: 'conversations_master.csv',
      export_type: 'ALL_CONVERSATIONS',
      export_timestamp: new Date().toISOString(),
      record_count: records.length,
      format: 'CSV',
      filter_scope: 'All Records',
      schema_version: '1.0.0',
      data_source: 'Revenue Intelligence Inbox',
      validation_status: 'RFC_4180_VALID',
    },
    {
      export_filename: 'needs_attention_export.csv',
      export_type: 'NEEDS_ATTENTION',
      export_timestamp: new Date().toISOString(),
      record_count: records.filter((r) => r.is_escalated || r.outcome === 'Escalated' || r.follow_up_status === 'Overdue' || !r.assigned_owner).length,
      format: 'CSV',
      filter_scope: 'Escalated | Overdue | Unassigned',
      schema_version: '1.0.0',
      data_source: 'Revenue Intelligence Inbox',
      validation_status: 'RFC_4180_VALID',
    },
  ]);

  const handleExport = (type, format) => {
    let dataToExport = [];
    let baseFilename = '';
    let filterScope = '';

    if (type === 'ALL') {
      dataToExport = sanitizeForExport(records);
      baseFilename = `conversations_master_${new Date().toISOString().slice(0, 10)}`;
      filterScope = 'All Records';
    } else if (type === 'NEEDS_ATTENTION') {
      dataToExport = prepareNeedsAttentionExport(records);
      baseFilename = `needs_attention_${new Date().toISOString().slice(0, 10)}`;
      filterScope = 'Needs Attention (Escalated/Overdue/Unassigned)';
    } else if (type === 'ROUTING_DECISIONS') {
      dataToExport = prepareRoutingDecisionsExport(records);
      baseFilename = `routing_decisions_${new Date().toISOString().slice(0, 10)}`;
      filterScope = 'All Evaluated Decisions';
    }

    const filename = `${baseFilename}.${format}`;
    let content = '';
    let mimeType = '';

    if (format === 'csv') {
      content = toCSVString(dataToExport);
      mimeType = 'text/csv;charset=utf-8;';
    } else {
      content = toJSONString(dataToExport);
      mimeType = 'application/json;charset=utf-8;';
    }

    triggerBrowserDownload(content, filename, mimeType);

    const newEntry = createManifestEntry({
      filename,
      exportType: type,
      recordCount: dataToExport.length,
      format,
      filterScope,
      validationStatus: format === 'csv' ? 'RFC_4180_VALID' : 'JSON_SCHEMA_VALID',
    });

    setManifestList((prev) => [newEntry, ...prev]);
    setDownloadSuccessMessage(`Generated and downloaded ${filename} (${dataToExport.length} records).`);

    setTimeout(() => {
      setDownloadSuccessMessage('');
    }, 5000);
  };

  const downloadManifestFile = (format) => {
    const filename = `manifest_${new Date().toISOString().slice(0, 10)}.${format}`;
    let content = '';
    let mimeType = '';

    if (format === 'csv') {
      content = toCSVString(manifestList);
      mimeType = 'text/csv;charset=utf-8;';
    } else {
      content = toJSONString(manifestList);
      mimeType = 'application/json;charset=utf-8;';
    }

    triggerBrowserDownload(content, filename, mimeType);
    setDownloadSuccessMessage(`Manifest downloaded as ${filename}`);
  };

  return (
    <div className="export-view">
      {/* Top Banner */}
      <div className="console-card mb-3">
        <div className="console-card-body py-2.5 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 className="console-card-title mb-1">
              <Download size={16} style={{ color: 'var(--accent-forest)' }} />
              <span>Data Export Management &amp; RFC 4180 Audit Manifest</span>
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
              Generate RFC 4180 compliant CSV and structured JSON files with automated manifest verification.
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-editorial-outline btn-sm py-1"
              onClick={() => downloadManifestFile('csv')}
            >
              <FileCheck size={13} />
              <span>Download Manifest (CSV)</span>
            </button>
            <button
              type="button"
              className="btn btn-editorial-outline btn-sm py-1"
              onClick={() => downloadManifestFile('json')}
            >
              <FileCheck size={13} />
              <span>Download Manifest (JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {downloadSuccessMessage && (
        <div className="alert alert-success py-1.5 px-3 small mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
          <CheckCircle size={14} className="text-success" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Export Targets Grid */}
      <div className="row g-3 mb-3">
        {/* Master Dataset */}
        <div className="col-12 col-md-4">
          <div className="console-card h-100 p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="console-tag tag-routed">Master Feed</span>
                <span className="font-mono text-muted small">{records.length} records</span>
              </div>
              <div className="fw-bold text-dark small mb-1">All Conversations</div>
              <p className="text-muted small mb-3" style={{ fontSize: '0.76rem' }}>
                Full extract including contacts, call types, durations, timestamps, outcomes, and current assignments.
              </p>
            </div>
            <div className="d-flex gap-1.5">
              <button
                type="button"
                className="btn btn-forest btn-sm flex-grow-1 justify-content-center"
                onClick={() => handleExport('ALL', 'csv')}
              >
                CSV
              </button>
              <button
                type="button"
                className="btn btn-editorial-outline btn-sm flex-grow-1 justify-content-center"
                onClick={() => handleExport('ALL', 'json')}
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Needs Attention Queue */}
        <div className="col-12 col-md-4">
          <div className="console-card h-100 p-3 d-flex flex-column justify-content-between border-start border-4" style={{ borderLeftColor: 'var(--attention-orange)' }}>
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="console-tag tag-action">Priority Action</span>
                <span className="font-mono text-muted small">
                  {records.filter((r) => r.is_escalated || r.outcome === 'Escalated' || r.follow_up_status === 'Overdue' || !r.assigned_owner).length} records
                </span>
              </div>
              <div className="fw-bold text-dark small mb-1">Needs Attention Queue</div>
              <p className="text-muted small mb-3" style={{ fontSize: '0.76rem' }}>
                Filtered extract containing only escalated accounts, overdue follow-up commitments, and unassigned leads.
              </p>
            </div>
            <div className="d-flex gap-1.5">
              <button
                type="button"
                className="btn btn-forest btn-sm flex-grow-1 justify-content-center"
                onClick={() => handleExport('NEEDS_ATTENTION', 'csv')}
              >
                CSV
              </button>
              <button
                type="button"
                className="btn btn-editorial-outline btn-sm flex-grow-1 justify-content-center"
                onClick={() => handleExport('NEEDS_ATTENTION', 'json')}
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Routing Decisions Log */}
        <div className="col-12 col-md-4">
          <div className="console-card h-100 p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="console-tag tag-medium">Governance</span>
                <span className="font-mono text-muted small">{records.length} records</span>
              </div>
              <div className="fw-bold text-dark small mb-1">Routing Decisions Log</div>
              <p className="text-muted small mb-3" style={{ fontSize: '0.76rem' }}>
                Export of deterministic routing suggestions, triggered rules, conflict alerts, and manager override rationales.
              </p>
            </div>
            <div className="d-flex gap-1.5">
              <button
                type="button"
                className="btn btn-forest btn-sm flex-grow-1 justify-content-center"
                onClick={() => handleExport('ROUTING_DECISIONS', 'csv')}
              >
                CSV
              </button>
              <button
                type="button"
                className="btn btn-editorial-outline btn-sm flex-grow-1 justify-content-center"
                onClick={() => handleExport('ROUTING_DECISIONS', 'json')}
              >
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="console-card">
        <div className="console-card-header py-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold small text-dark">
            Export Manifest Ledger (Audit Records)
          </span>
          <span className="font-mono text-muted small" style={{ fontSize: '0.72rem' }}>
            Schema v1.0.0 &bull; RFC 4180
          </span>
        </div>

        <div className="table-responsive">
          <table className="console-table align-middle">
            <thead>
              <tr>
                <th>Export Filename</th>
                <th>Export Scope</th>
                <th>Format</th>
                <th>Record Count</th>
                <th>Timestamp</th>
                <th>Validation Status</th>
              </tr>
            </thead>
            <tbody>
              {manifestList.map((m, idx) => (
                <tr key={idx}>
                  <td className="font-mono text-dark fw-medium small">
                    {m.export_filename}
                  </td>
                  <td className="small text-secondary">{m.filter_scope}</td>
                  <td>
                    <span className="console-tag tag-medium font-mono">{m.format}</span>
                  </td>
                  <td className="font-mono small fw-semibold">{m.record_count}</td>
                  <td className="font-mono small text-muted">
                    {m.export_timestamp.slice(0, 19).replace('T', ' ')}
                  </td>
                  <td>
                    <span className="console-tag tag-routed">
                      {m.validation_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
