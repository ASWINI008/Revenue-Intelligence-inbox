import React, { useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { analyzeDataQuality } from '../services/dataQualityService';

export default function DataQualityView({
  records = [],
  onSelectRecord,
}) {
  const analysis = useMemo(() => analyzeDataQuality(records), [records]);

  // Combine critical issues and business warnings into structured quality table
  const qualityTableItems = useMemo(() => {
    const list = [];

    // Critical schema issues
    analysis.issues.forEach((err) => {
      let suggestedCorrection = 'Populate missing required schema attribute.';
      if (err.type === 'Missing Identifier') {
        suggestedCorrection = 'Assign stable record ID or rely on composite signature.';
      } else if (err.type === 'Invalid Date Format') {
        suggestedCorrection = 'Format date string strictly as YYYY-MM-DD.';
      } else if (err.type === 'Invalid Priority Value') {
        suggestedCorrection = 'Select one of: Urgent, High, Medium, Low.';
      }

      list.push({
        id: err.id,
        recordId: err.recordId,
        record: err.record,
        issueType: err.type,
        explanation: err.message,
        severity: err.severity || 'CRITICAL',
        suggestedCorrection,
        resolutionStatus: 'Action Required',
      });
    });

    // Business policy warnings
    analysis.warnings.forEach((warn) => {
      let suggestedCorrection = 'Review operational status.';
      if (warn.type === 'Missing Account Ownership') {
        suggestedCorrection = 'Assign account owner or route by tier.';
      } else if (warn.type === 'Overdue Follow-up Commitment') {
        suggestedCorrection = 'Reschedule follow-up or complete pending deliverable.';
      } else if (warn.type === 'Unresolved Routing Ambiguity') {
        suggestedCorrection = 'Execute manager override to resolve rule conflict.';
      }

      list.push({
        id: warn.id,
        recordId: warn.recordId,
        record: warn.record,
        issueType: warn.type,
        explanation: warn.message,
        severity: warn.severity || 'MEDIUM',
        suggestedCorrection,
        resolutionStatus: warn.severity === 'HIGH' ? 'Action Required' : 'Pending Review',
      });
    });

    return list;
  }, [analysis]);

  return (
    <div className="data-quality-view">
      {/* Top Health Overview Strip */}
      <div className="console-card mb-3">
        <div className="console-card-body py-2.5 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 className="console-card-title mb-1">
              <ShieldCheck size={16} style={{ color: 'var(--accent-forest)' }} />
              <span>Data Quality Diagnostics &amp; Integrity Health</span>
            </h6>
            <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
              Continuous evaluation separating hard technical schema errors from operational business policy warnings.
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="text-muted small" style={{ fontSize: '0.7rem' }}>DATASET HEALTH SCORE</div>
              <div
                className="fw-bold font-mono fs-6"
                style={{ color: analysis.healthScore >= 80 ? 'var(--accent-forest)' : 'var(--attention-orange)' }}
              >
                {analysis.healthScore}% Compliant
              </div>
            </div>
            <div
              className="p-1 rounded bg-light border text-muted font-mono small"
              style={{ fontSize: '0.74rem' }}
            >
              {analysis.summary.criticalErrors} Errors &bull; {analysis.summary.businessWarnings} Warnings
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data Quality Table */}
      <div className="console-card">
        <div className="console-card-header py-2 d-flex justify-content-between align-items-center">
          <span className="fw-semibold small text-dark">
            Data Quality Diagnostic Ledger ({qualityTableItems.length} findings)
          </span>
          <span className="font-mono text-muted small" style={{ fontSize: '0.72rem' }}>
            Audited against 7 schema &amp; business constraints
          </span>
        </div>

        <div className="table-responsive">
          <table className="console-table align-middle">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Issue Type</th>
                <th>Diagnostic Explanation</th>
                <th>Severity</th>
                <th>Suggested Correction</th>
                <th>Resolution Status</th>
                <th className="text-end">Triage</th>
              </tr>
            </thead>
            <tbody>
              {qualityTableItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <CheckCircle size={28} className="text-success mb-1" />
                    <div className="fw-medium small">All records compliant!</div>
                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                      No critical schema errors or operational warnings identified.
                    </div>
                  </td>
                </tr>
              ) : (
                qualityTableItems.map((item, idx) => (
                  <tr key={idx}>
                    {/* Record ID */}
                    <td className="font-mono text-dark fw-medium small">
                      {item.recordId}
                    </td>

                    {/* Issue Type */}
                    <td>
                      <span className="fw-medium small text-dark">
                        {item.issueType}
                      </span>
                    </td>

                    {/* Explanation */}
                    <td style={{ maxWidth: '280px' }} className="small text-secondary">
                      {item.explanation}
                    </td>

                    {/* Severity */}
                    <td>
                      <span
                        className={`console-tag ${
                          item.severity === 'CRITICAL'
                            ? 'tag-urgent'
                            : item.severity === 'HIGH'
                            ? 'tag-high'
                            : 'tag-medium'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>

                    {/* Suggested Correction */}
                    <td style={{ maxWidth: '260px' }} className="small text-muted fst-italic">
                      {item.suggestedCorrection}
                    </td>

                    {/* Resolution Status */}
                    <td>
                      <span
                        className={`console-tag ${
                          item.resolutionStatus === 'Action Required'
                            ? 'tag-action'
                            : 'tag-medium'
                        }`}
                      >
                        {item.resolutionStatus}
                      </span>
                    </td>

                    {/* Triage Action */}
                    <td className="text-end">
                      {item.record ? (
                        <button
                          type="button"
                          className="btn btn-editorial-outline btn-sm py-0 px-2"
                          style={{ fontSize: '0.76rem' }}
                          onClick={() => onSelectRecord(item.record)}
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-muted small font-mono">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
