/**
 * Data Quality Service for Revenue Intelligence Inbox
 * Scans active dataset to identify critical data integrity errors vs soft business warnings.
 */

export const analyzeDataQuality = (records = []) => {
  const issues = [];
  const warnings = [];

  const seenIds = new Map();
  const validPriorities = ['Urgent', 'High', 'Medium', 'Low'];
  const validOutcomes = [
    'Closed Won',
    'Closed Lost',
    'Qualified',
    'Meeting Scheduled',
    'Action Required',
    'Needs Nurturing',
    'Escalated',
  ];

  records.forEach((rec, idx) => {
    const rowRef = rec.id || `Index #${idx + 1}`;

    // 1. Missing Identifiers (Critical Error)
    if (!rec.id || String(rec.id).trim() === '') {
      issues.push({
        id: `ERR-ID-${idx}`,
        recordId: rowRef,
        severity: 'CRITICAL',
        type: 'Missing Identifier',
        message: 'Record lacks a primary ID. System relies on fallback composite matching.',
        record: rec,
      });
    } else {
      // Duplicate ID in current dataset
      if (seenIds.has(rec.id)) {
        issues.push({
          id: `ERR-DUP-${rec.id}`,
          recordId: rec.id,
          severity: 'CRITICAL',
          type: 'Duplicate Primary Key',
          message: `Primary key ${rec.id} appears more than once in the active dataset.`,
          record: rec,
        });
      }
      seenIds.set(rec.id, true);
    }

    // 2. Missing Required Contact / Account (Critical Error)
    if (!rec.account_name && !rec.contact_name) {
      issues.push({
        id: `ERR-REQ-${rowRef}`,
        recordId: rowRef,
        severity: 'CRITICAL',
        type: 'Missing Required Entity',
        message: 'Both account name and contact name are missing.',
        record: rec,
      });
    }

    // 3. Invalid Date (Critical Error)
    if (rec.date && isNaN(Date.parse(rec.date))) {
      issues.push({
        id: `ERR-DATE-${rowRef}`,
        recordId: rowRef,
        severity: 'CRITICAL',
        type: 'Invalid Date Format',
        message: `Date string "${rec.date}" is unparseable. Expected YYYY-MM-DD.`,
        record: rec,
      });
    }

    // 4. Invalid Priority Value (Critical Error)
    if (rec.priority && !validPriorities.includes(rec.priority)) {
      issues.push({
        id: `ERR-PRIO-${rowRef}`,
        recordId: rowRef,
        severity: 'HIGH',
        type: 'Invalid Priority Value',
        message: `Priority "${rec.priority}" is not among valid schema levels (${validPriorities.join(', ')}).`,
        record: rec,
      });
    }

    // 5. Missing Owner / Sales Rep (Business Warning)
    if (!rec.assigned_owner || rec.assigned_owner.trim() === '' || rec.assigned_owner.toLowerCase() === 'unassigned') {
      warnings.push({
        id: `WARN-OWNER-${rowRef}`,
        recordId: rowRef,
        severity: 'MEDIUM',
        type: 'Missing Account Ownership',
        message: 'Conversation has no assigned sales representative or owner.',
        record: rec,
      });
    }

    // 6. Overdue Follow-up (Business Warning)
    if (rec.follow_up_status === 'Overdue') {
      warnings.push({
        id: `WARN-OVERDUE-${rowRef}`,
        recordId: rowRef,
        severity: 'HIGH',
        type: 'Overdue Follow-up Commitment',
        message: `Follow-up commitment (due ${rec.follow_up_due_date || 'N/A'}) is overdue and requires sales manager intervention.`,
        record: rec,
      });
    }

    // 7. Unresolved Routing Conflicts (Business Warning)
    if (rec.routing_status === 'Pending Review' || (rec.routing_conflicts && rec.routing_conflicts.length > 0)) {
      warnings.push({
        id: `WARN-CONFLICT-${rowRef}`,
        recordId: rowRef,
        severity: 'MEDIUM',
        type: 'Unresolved Routing Ambiguity',
        message: `Multiple routing rules conflicted or suggested differing owners. Manual review recommended.`,
        record: rec,
      });
    }
  });

  const totalChecks = records.length * 7;
  const errorCount = issues.length;
  const warningCount = warnings.length;
  const healthScore = records.length === 0 ? 100 : Math.max(0, Math.round(100 - (errorCount * 15 + warningCount * 3) / (records.length / 5)));

  return {
    healthScore: Math.min(100, Math.max(0, healthScore)),
    issues,
    warnings,
    summary: {
      totalRecords: records.length,
      criticalErrors: errorCount,
      businessWarnings: warningCount,
      healthyRecords: records.length - (new Set([...issues.map((i) => i.recordId), ...warnings.map((w) => w.recordId)])).size,
    },
  };
};
