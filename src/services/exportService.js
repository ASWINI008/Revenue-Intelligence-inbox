/**
 * Export Service for Revenue Intelligence Inbox
 * Formats data cleanly to CSV and JSON with proper RFC 4180 escaping.
 * Builds and maintains the export manifest.
 */

import Papa from 'papaparse';

export const SCHEMA_VERSION = '1.0.0';

/**
 * Escapes text for RFC 4180 CSV compliance
 */
export const toCSVString = (dataArray) => {
  return Papa.unparse(dataArray, {
    quotes: true,
    header: true,
  });
};

/**
 * Converts array of records to pretty-printed JSON
 */
export const toJSONString = (dataArray) => {
  return JSON.stringify(dataArray, null, 2);
};

/**
 * Triggers a real browser file download
 */
export const triggerBrowserDownload = (content, filename, mimeType = 'text/plain;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Creates a manifest entry for an exported file
 */
export const createManifestEntry = ({
  filename,
  exportType,
  recordCount,
  format,
  filterScope,
  validationStatus = 'VALID',
}) => {
  return {
    export_filename: filename,
    export_type: exportType,
    export_timestamp: new Date().toISOString(),
    record_count: recordCount,
    format: format.toUpperCase(),
    filter_scope: filterScope,
    schema_version: SCHEMA_VERSION,
    data_source: 'Revenue Intelligence Inbox (Volopay)',
    validation_status: validationStatus,
  };
};

/**
 * Prepares conversations dataset for clean export
 */
export const sanitizeForExport = (records) => {
  return records.map((r) => ({
    id: r.id,
    contact_name: r.contact_name,
    contact_email: r.contact_email,
    account_name: r.account_name,
    account_tier: r.account_tier,
    rep_name: r.rep_name,
    assigned_owner: r.assigned_owner,
    type: r.type,
    date: r.date,
    time: r.time,
    duration_minutes: r.duration_minutes,
    outcome: r.outcome,
    priority: r.priority,
    follow_up_status: r.follow_up_status,
    follow_up_due_date: r.follow_up_due_date,
    is_escalated: r.is_escalated ? 'true' : 'false',
    urgency_reason: r.urgency_reason || '',
    routing_status: r.routing_status,
    routing_rule_triggered: r.routing_rule_triggered || '',
    routing_reason: r.routing_reason || '',
    manual_override: r.manual_override ? 'true' : 'false',
    notes: r.notes || '',
  }));
};

/**
 * Prepares routing decisions log for export
 */
export const prepareRoutingDecisionsExport = (records) => {
  return records.map((r) => ({
    record_id: r.id,
    account_name: r.account_name,
    account_tier: r.account_tier,
    routing_status: r.routing_status,
    assigned_owner: r.assigned_owner || 'Unassigned',
    suggested_owner: r.suggested_owner || 'N/A',
    priority: r.priority,
    suggested_priority: r.suggested_priority || r.priority,
    rule_triggered: r.routing_rule_triggered || 'None',
    routing_reason: r.routing_reason || 'Default assignment',
    has_conflicts: r.routing_conflicts && r.routing_conflicts.length > 0 ? 'true' : 'false',
    conflicts_summary: (r.routing_conflicts || []).join('; '),
    manual_override: r.manual_override ? 'true' : 'false',
    override_reason: r.override_details?.reason || '',
    overridden_by: r.override_details?.overriddenBy || '',
  }));
};

/**
 * Prepares Needs Attention records for export
 */
export const prepareNeedsAttentionExport = (records) => {
  const needsAttention = records.filter(
    (r) =>
      r.is_escalated ||
      r.outcome === 'Escalated' ||
      r.follow_up_status === 'Overdue' ||
      !r.assigned_owner ||
      r.routing_status === 'Unassigned' ||
      r.routing_status === 'Pending Review'
  );

  return sanitizeForExport(needsAttention);
};
