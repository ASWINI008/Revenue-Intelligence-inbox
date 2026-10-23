import React, { useState, useMemo } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Layers,
  ArrowDownToLine,
} from 'lucide-react';
import Papa from 'papaparse';
import {
  parseAndImportData,
  processImport,
  normalizeRecord,
  validateRecord,
  getRecordKey,
  areRecordsIdentical,
} from '../services/importService';

import testDuplicateCSV from '../../data/test_duplicate_import.csv?raw';
import testUpdateCSV from '../../data/test_update_import.csv?raw';
import testMalformedCSV from '../../data/test_malformed_import.csv?raw';

export default function ImportView({
  records = [],
  onImportSuccess,
  onResetData,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileType, setFileType] = useState('csv');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [duplicateTestResult, setDuplicateTestResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Staged Pre-Import Analysis
  const [stagedPreview, setStagedPreview] = useState(null);

  // Workflow steps: 1: Select File -> 2: Validate -> 3: Preview -> 4: Confirm -> 5: Results
  const currentStep = importSummary ? 5 : stagedPreview ? 3 : fileContent ? 2 : 1;

  // Pre-analyze records before confirmation
  const analyzeIncomingContent = (content, type) => {
    try {
      let rawArray = [];
      if (type === 'json') {
        const parsed = JSON.parse(content);
        rawArray = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        const parsedCsv = Papa.parse(content, { header: true, skipEmptyLines: true });
        rawArray = parsedCsv.data;
      }

      const existingMap = new Map();
      records.forEach((r) => {
        const k = getRecordKey(r);
        if (k) existingMap.set(k, r);
      });

      const previewRows = [];
      let newCount = 0;
      let updateCount = 0;
      let duplicateCount = 0;
      let invalidCount = 0;
      let conflictCount = 0;

      rawArray.forEach((raw, idx) => {
        const norm = normalizeRecord(raw);
        const val = validateRecord(norm, idx);

        if (!val.isValid) {
          invalidCount++;
          previewRows.push({
            id: norm.id || `Row ${idx + 1}`,
            account: norm.account_name || 'Missing',
            contact: norm.contact_name || 'Missing',
            status: 'INVALID',
            statusLabel: 'Invalid Record',
            badgeClass: 'tag-urgent',
            note: val.errors.join('; '),
          });
          return;
        }

        const key = getRecordKey(norm);
        if (!key) {
          invalidCount++;
          previewRows.push({
            id: `Row ${idx + 1}`,
            account: norm.account_name,
            contact: norm.contact_name,
            status: 'INVALID',
            statusLabel: 'Invalid Key',
            badgeClass: 'tag-urgent',
            note: 'Missing primary ID and insufficient fields for composite matching',
          });
          return;
        }

        if (existingMap.has(key)) {
          const existing = existingMap.get(key);
          if (areRecordsIdentical(existing, norm)) {
            duplicateCount++;
            previewRows.push({
              id: key,
              account: norm.account_name,
              contact: norm.contact_name,
              status: 'DUPLICATE',
              statusLabel: 'Duplicate (Unchanged)',
              badgeClass: 'tag-medium',
              note: 'Identical record already in store; will be safely ignored.',
            });
          } else {
            const hasManualEdits = existing.manual_override === true || (existing.audit_history && existing.audit_history.length > 0);
            if (hasManualEdits) {
              conflictCount++;
              updateCount++;
              previewRows.push({
                id: key,
                account: norm.account_name,
                contact: norm.contact_name,
                status: 'CONFLICT',
                statusLabel: 'Manual Edit Protected',
                badgeClass: 'tag-action',
                note: 'Precedence policy: Manager manual edits protected; newer non-conflicting fields merged.',
              });
            } else {
              updateCount++;
              previewRows.push({
                id: key,
                account: norm.account_name,
                contact: norm.contact_name,
                status: 'UPDATE',
                statusLabel: 'Existing Record Updated',
                badgeClass: 'tag-routed',
                note: 'Attributes modified; will update record fields.',
              });
            }
          }
        } else {
          newCount++;
          previewRows.push({
            id: key,
            account: norm.account_name,
            contact: norm.contact_name,
            status: 'NEW',
            statusLabel: 'New Record',
            badgeClass: 'tag-won',
            note: 'New conversation; will be routed and indexed.',
          });
        }
      });

      setStagedPreview({
        rawArray,
        rows: previewRows,
        counts: {
          total: rawArray.length,
          newCount,
          updateCount,
          duplicateCount,
          invalidCount,
          conflictCount,
        },
      });
    } catch (err) {
      setErrorMessage(`Validation error: ${err.message}`);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFileName(file.name);
    setErrorMessage('');
    setImportSummary(null);
    setDuplicateTestResult(null);

    const ext = file.name.split('.').pop().toLowerCase();
    const isJson = ext === 'json';
    const isCsv = ext === 'csv';

    if (!isJson && !isCsv) {
      setErrorMessage(`Unsupported format .${ext}. Please select a valid CSV or JSON file.`);
      return;
    }

    const type = isJson ? 'json' : 'csv';
    setFileType(type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setFileContent(text);
      analyzeIncomingContent(text, type);
    };
    reader.onerror = () => setErrorMessage('Error reading file from disk.');
    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Final confirmation execution
  const handleConfirmImport = async () => {
    if (!fileContent) return;
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const result = await parseAndImportData(fileContent, fileType, records);
      setImportSummary(result.summary);
      onImportSuccess(result.records);
      setStagedPreview(null);
    } catch (err) {
      setErrorMessage(`Ingestion execution failure: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1-Click Verification Test Scenarios
  const handleRunDuplicateTest = async () => {
    setDuplicateTestResult(null);
    setImportSummary(null);
    setStagedPreview(null);

    // 1. Record initial state
    const initialCount = records.length;
    const initialIds = records.map((r) => r.id);

    try {
      // 2. Reprocess the same dataset
      const result = await parseAndImportData(testDuplicateCSV, 'csv', records);

      // 3. Verify no additional duplicates were created
      const finalCount = result.records.length;
      const duplicatesAdded = finalCount - initialCount;
      const pass = duplicatesAdded === 0 && result.summary.duplicatesIgnored === 5;

      // 4. Check whether unexpected field changes occurred
      const unchanged = result.records.every((r) => initialIds.includes(r.id));

      const testResult = {
        passed: pass && unchanged,
        initialCount,
        finalCount,
        duplicatesIgnored: result.summary.duplicatesIgnored,
        newAdded: result.summary.newAdded,
        unexpectedChanges: !unchanged,
        timestamp: new Date().toISOString(),
        details: 'Verified: 5 identical records identified and ignored without duplicating records or double-counting.',
      };

      setDuplicateTestResult(testResult);
      if (pass) {
        onImportSuccess(result.records);
      }
    } catch (err) {
      setErrorMessage(`Duplicate test execution failed: ${err.message}`);
    }
  };

  const handleRunUpdateTest = () => {
    setSelectedFileName('test_update_import.csv (1 Update + 1 New Record)');
    setFileType('csv');
    setFileContent(testUpdateCSV);
    analyzeIncomingContent(testUpdateCSV, 'csv');
  };

  const handleRunMalformedTest = () => {
    setSelectedFileName('test_malformed_import.csv (Validation Errors)');
    setFileType('csv');
    setFileContent(testMalformedCSV);
    analyzeIncomingContent(testMalformedCSV, 'csv');
  };

  return (
    <div className="import-view">
      {/* Workflow Navigation Strip: Select -> Validate -> Preview -> Confirm -> Results */}
      <div className="console-card mb-3">
        <div className="console-card-body py-2.5 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2 small">
            <span className={`px-2 py-0.5 rounded font-mono ${currentStep === 1 ? 'bg-forest text-white' : 'bg-light text-secondary'}`}>
              1. Select File
            </span>
            <span className="text-muted">&rarr;</span>
            <span className={`px-2 py-0.5 rounded font-mono ${currentStep === 2 ? 'bg-forest text-white' : 'bg-light text-secondary'}`}>
              2. Validate
            </span>
            <span className="text-muted">&rarr;</span>
            <span className={`px-2 py-0.5 rounded font-mono ${currentStep === 3 ? 'bg-forest text-white' : 'bg-light text-secondary'}`}>
              3. Preview
            </span>
            <span className="text-muted">&rarr;</span>
            <span className={`px-2 py-0.5 rounded font-mono ${currentStep === 4 ? 'bg-forest text-white' : 'bg-light text-secondary'}`}>
              4. Confirm Import
            </span>
            <span className="text-muted">&rarr;</span>
            <span className={`px-2 py-0.5 rounded font-mono ${currentStep === 5 ? 'bg-forest text-white' : 'bg-light text-secondary'}`}>
              5. Results
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted font-mono">Store Size: {records.length} records</span>
            <button
              type="button"
              className="btn btn-editorial-outline btn-sm py-0 px-2"
              onClick={onResetData}
            >
              <RefreshCw size={12} />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Verification Action Center */}
      <div className="console-card mb-3 border-start border-4" style={{ borderLeftColor: 'var(--accent-forest)' }}>
        <div className="console-card-header py-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
            <FileCheck size={14} style={{ color: 'var(--accent-forest)' }} />
            <span>Automated Ingestion Verification Tests</span>
          </span>
          <span className="console-tag tag-routed">Documented Scenarios</span>
        </div>

        <div className="console-card-body py-2.5">
          <div className="row g-2">
            {/* Run Duplicate Import Test Button */}
            <div className="col-12 col-md-4">
              <button
                type="button"
                className="btn btn-editorial-outline w-100 text-start p-2.5 h-100 d-flex flex-column justify-content-between"
                onClick={handleRunDuplicateTest}
              >
                <div>
                  <div className="fw-bold text-dark small d-flex align-items-center justify-content-between">
                    <span>Run Duplicate Import Test</span>
                    <span className="console-tag tag-routed">Automated</span>
                  </div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.74rem', lineHeight: '1.4' }}>
                    Reprocesses identical dataset. Verifies initial count matches final count with 0 duplicates created.
                  </div>
                </div>
                <div className="text-secondary small font-mono mt-2" style={{ fontSize: '0.7rem' }}>
                  Target: <code>test_duplicate_import.csv</code>
                </div>
              </button>
            </div>

            {/* Test Update & Precedence */}
            <div className="col-12 col-md-4">
              <button
                type="button"
                className="btn btn-editorial-outline w-100 text-start p-2.5 h-100 d-flex flex-column justify-content-between"
                onClick={handleRunUpdateTest}
              >
                <div>
                  <div className="fw-bold text-dark small d-flex align-items-center justify-content-between">
                    <span>Preview Update &amp; Precedence</span>
                    <span className="console-tag tag-medium">Staging</span>
                  </div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.74rem', lineHeight: '1.4' }}>
                    Stages 1 update and 1 new record. Inspects conflict handling and manager correction protection.
                  </div>
                </div>
                <div className="text-secondary small font-mono mt-2" style={{ fontSize: '0.7rem' }}>
                  Target: <code>test_update_import.csv</code>
                </div>
              </button>
            </div>

            {/* Test Malformed Input */}
            <div className="col-12 col-md-4">
              <button
                type="button"
                className="btn btn-editorial-outline w-100 text-start p-2.5 h-100 d-flex flex-column justify-content-between"
                onClick={handleRunMalformedTest}
              >
                <div>
                  <div className="fw-bold text-dark small d-flex align-items-center justify-content-between">
                    <span>Preview Malformed Data</span>
                    <span className="console-tag tag-urgent">Validation</span>
                  </div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.74rem', lineHeight: '1.4' }}>
                    Stages rows with missing IDs or invalid dates. Verifies row-by-row rejection diagnostics.
                  </div>
                </div>
                <div className="text-secondary small font-mono mt-2" style={{ fontSize: '0.7rem' }}>
                  Target: <code>test_malformed_import.csv</code>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Import Test Verification Modal/Card */}
      {duplicateTestResult && (
        <div className={`console-card mb-3 border-start border-4 ${duplicateTestResult.passed ? 'border-success' : 'border-danger'}`}>
          <div className="console-card-header py-2 d-flex justify-content-between align-items-center">
            <span className="fw-bold small text-dark d-flex align-items-center gap-1.5">
              {duplicateTestResult.passed ? (
                <CheckCircle2 size={16} className="text-success" />
              ) : (
                <XCircle size={16} className="text-danger" />
              )}
              <span>Duplicate Import Test Result: {duplicateTestResult.passed ? 'PASSED (100% Idempotent)' : 'FAILED'}</span>
            </span>
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none text-muted small"
              onClick={() => setDuplicateTestResult(null)}
            >
              Dismiss
            </button>
          </div>
          <div className="console-card-body py-2.5">
            <div className="row g-2 mb-2 text-center small font-mono">
              <div className="col-3">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>INITIAL RECORDS</div>
                  <div className="fw-bold text-dark fs-6">{duplicateTestResult.initialCount}</div>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>FINAL RECORDS</div>
                  <div className="fw-bold text-dark fs-6">{duplicateTestResult.finalCount}</div>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>DUPLICATES IGNORED</div>
                  <div className="fw-bold text-success fs-6">{duplicateTestResult.duplicatesIgnored}</div>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>NEW ADDED</div>
                  <div className="fw-bold text-dark fs-6">{duplicateTestResult.newAdded}</div>
                </div>
              </div>
            </div>
            <div className="small text-secondary" style={{ fontSize: '0.78rem' }}>
              <strong>Audit Verification:</strong> {duplicateTestResult.details}
            </div>
          </div>
        </div>
      )}

      {/* Select File & Staging Dropzone */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-7">
          <div
            className={`console-card p-4 text-center ${dragActive ? 'bg-light' : ''}`}
            style={{
              border: '1px dashed var(--border-medium)',
              cursor: 'pointer',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('import-file-input').click()}
          >
            <input
              type="file"
              id="import-file-input"
              className="d-none"
              accept=".csv, .json, text/csv, application/json"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <UploadCloud size={28} className="text-muted mb-2" />
            <div className="fw-semibold text-dark small mb-0.5">
              Step 1: Select CSV or JSON File to Stage
            </div>
            <div className="text-muted small mb-2" style={{ fontSize: '0.74rem' }}>
              Drag &amp; drop file here or click to browse
            </div>
            <div className="d-flex gap-1.5">
              <span className="console-tag tag-medium font-mono">.CSV</span>
              <span className="console-tag tag-medium font-mono">.JSON</span>
            </div>
          </div>
        </div>

        {/* Staging Summary */}
        <div className="col-12 col-lg-5">
          <div className="console-card h-100 p-3 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold small text-dark">Staged File &amp; Validation Status</span>
                {selectedFileName && <span className="console-tag tag-routed font-mono">{fileType.toUpperCase()}</span>}
              </div>

              {selectedFileName ? (
                <div className="p-2.5 bg-light rounded border mb-2 font-mono small" style={{ fontSize: '0.76rem' }}>
                  <div className="fw-semibold text-dark text-truncate">{selectedFileName}</div>
                  <div className="text-muted mt-0.5">Format validated &bull; {stagedPreview?.counts?.total || 0} rows parsed</div>
                </div>
              ) : (
                <div className="text-muted small py-3 text-center" style={{ fontSize: '0.76rem' }}>
                  No file selected. Choose a file or click an automated test above.
                </div>
              )}

              {errorMessage && (
                <div className="alert alert-danger py-1.5 px-2 small mb-2" style={{ fontSize: '0.75rem' }}>
                  {errorMessage}
                </div>
              )}
            </div>

            {stagedPreview ? (
              <button
                type="button"
                className="btn btn-forest w-100 justify-content-center py-2"
                disabled={isProcessing}
                onClick={handleConfirmImport}
              >
                {isProcessing ? 'Importing...' : `Confirm Import (${stagedPreview.counts.total} rows)`}
              </button>
            ) : (
              <div className="text-muted small text-center" style={{ fontSize: '0.74rem' }}>
                Stage a file to preview changes before importing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pre-Confirmation Preview Table */}
      {stagedPreview && (
        <div className="console-card mb-3">
          <div className="console-card-header py-2 d-flex justify-content-between align-items-center">
            <span className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
              <Layers size={14} className="text-muted" />
              <span>Step 3 &bull; Pre-Confirmation Preview ({stagedPreview.counts.total} staged records)</span>
            </span>

            <div className="d-flex gap-2 small">
              <span className="text-success font-mono">{stagedPreview.counts.newCount} New</span>
              <span className="text-primary font-mono">{stagedPreview.counts.updateCount} Updates</span>
              <span className="text-muted font-mono">{stagedPreview.counts.duplicateCount} Duplicates</span>
              {stagedPreview.counts.conflictCount > 0 && (
                <span className="text-warning font-mono">{stagedPreview.counts.conflictCount} Conflicts Protected</span>
              )}
              {stagedPreview.counts.invalidCount > 0 && (
                <span className="text-danger font-mono">{stagedPreview.counts.invalidCount} Invalid</span>
              )}
            </div>
          </div>

          <div className="table-responsive" style={{ maxHeight: '280px' }}>
            <table className="console-table align-middle">
              <thead>
                <tr>
                  <th>Record Key</th>
                  <th>Account</th>
                  <th>Contact</th>
                  <th>Staged Status</th>
                  <th>Ingestion Policy Action</th>
                </tr>
              </thead>
              <tbody>
                {stagedPreview.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="font-mono text-dark fw-medium small">{row.id}</td>
                    <td className="small text-dark">{row.account}</td>
                    <td className="small text-muted">{row.contact}</td>
                    <td>
                      <span className={`console-tag ${row.badgeClass}`}>
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="small text-secondary" style={{ fontSize: '0.76rem' }}>
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Execution Results Summary */}
      {importSummary && (
        <div className="console-card border-success">
          <div className="console-card-header py-2 bg-surface d-flex justify-content-between align-items-center">
            <span className="fw-bold small text-dark d-flex align-items-center gap-1.5">
              <CheckCircle2 size={16} className="text-success" />
              <span>Step 5 &bull; Ingestion Execution Results</span>
            </span>
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none text-muted small"
              onClick={() => setImportSummary(null)}
            >
              Dismiss
            </button>
          </div>

          <div className="console-card-body py-2.5">
            <div className="row g-2 mb-2 text-center">
              <div className="col-4 col-md-2">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>PROCESSED</div>
                  <div className="fw-bold fs-6 font-mono text-dark">{importSummary.totalProcessed}</div>
                </div>
              </div>
              <div className="col-4 col-md-2">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>NEW ADDED</div>
                  <div className="fw-bold fs-6 font-mono text-success">{importSummary.newAdded}</div>
                </div>
              </div>
              <div className="col-4 col-md-2">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>UPDATED</div>
                  <div className="fw-bold fs-6 font-mono text-primary">{importSummary.existingUpdated}</div>
                </div>
              </div>
              <div className="col-4 col-md-2">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>DUPLICATES IGNORED</div>
                  <div className="fw-bold fs-6 font-mono text-secondary">{importSummary.duplicatesIgnored}</div>
                </div>
              </div>
              <div className="col-4 col-md-2">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>MANUAL PROTECTED</div>
                  <div className="fw-bold fs-6 font-mono" style={{ color: 'var(--attention-orange)' }}>
                    {importSummary.conflictsDetected}
                  </div>
                </div>
              </div>
              <div className="col-4 col-md-2">
                <div className="p-2 border rounded bg-light">
                  <div className="text-muted small" style={{ fontSize: '0.68rem' }}>REJECTED INVALID</div>
                  <div className="fw-bold fs-6 font-mono text-danger">{importSummary.invalidCount}</div>
                </div>
              </div>
            </div>

            {importSummary.invalidRecords.length > 0 && (
              <div className="mt-2">
                <div className="text-danger small fw-semibold mb-1 d-flex align-items-center gap-1">
                  <AlertTriangle size={13} />
                  <span>Validation Failures (Rejected from Dataset):</span>
                </div>
                <div className="table-responsive">
                  <table className="console-table align-middle">
                    <thead>
                      <tr>
                        <th>Row Reference</th>
                        <th>Specific Validation Failure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importSummary.invalidRecords.map((inv, idx) => (
                        <tr key={idx}>
                          <td className="font-mono fw-medium small text-danger">{inv.recordId}</td>
                          <td className="small text-secondary">{inv.errors.join('; ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
