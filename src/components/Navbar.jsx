import React from 'react';
import { Search, RotateCcw, DownloadCloud, Calendar, Clock, Database } from 'lucide-react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onResetData,
  totalRecords,
  activeTab,
  onQuickExport,
  lastImportTime = 'Oct 22, 2026, 18:55',
}) {
  return (
    <header className="console-header-bar">
      {/* Title & Operational Summary */}
      <div className="d-flex align-items-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0 fw-bold text-dark" style={{ letterSpacing: '-0.02em', fontSize: '1rem' }}>
              Revenue Operations
            </h5>
            <span className="console-tag tag-routed font-mono">
              {totalRecords} Active Records
            </span>
          </div>
          <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
            Multi-source sales conversation triage, decision auditing &amp; pipeline governance
          </div>
        </div>
      </div>

      {/* Global Actions: Date Range, Sync Status, Search & Export */}
      <div className="d-flex align-items-center gap-2">
        {/* Date Range Selector */}
        <div className="d-none d-lg-flex align-items-center gap-1 px-2 py-1 bg-white border rounded text-secondary" style={{ fontSize: '0.78rem' }}>
          <Calendar size={13} className="text-muted" />
          <span>Oct 10 – Oct 22, 2026</span>
        </div>

        {/* Last Successful Ingestion Status */}
        <div className="d-none d-xl-flex align-items-center gap-1 px-2 py-1 bg-white border rounded text-muted" style={{ fontSize: '0.76rem' }}>
          <Clock size={12} className="text-muted" />
          <span>Synced: {lastImportTime}</span>
        </div>

        {/* Global Search Bar */}
        <div className="input-group input-group-sm" style={{ width: '220px' }}>
          <span className="input-group-text bg-white border-end-0 py-1">
            <Search size={13} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control bg-white border-start-0 py-1"
            placeholder="Search account, ID, rep..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.8rem' }}
          />
        </div>

        {/* Reset to Canonical Dataset */}
        <button
          type="button"
          className="btn btn-editorial-outline btn-sm py-1"
          onClick={onResetData}
          title="Restore canonical baseline sample records"
        >
          <RotateCcw size={13} />
          <span className="d-none d-md-inline">Reset Sample Data</span>
        </button>

        {/* Export Action */}
        <button
          type="button"
          className="btn btn-forest btn-sm py-1 shadow-none"
          onClick={onQuickExport}
          title="Export current view to CSV"
        >
          <DownloadCloud size={13} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
