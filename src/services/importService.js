/**
 * Import Service for Revenue Intelligence Inbox
 * Features:
 * - Robust CSV (PapaParse) & JSON parsing
 * - Schema normalization and column mapping
 * - Required field & data format validation
 * - Stable identifier & composite key matching
 * - 100% Idempotent duplicate detection
 * - Update handling with Manual Correction Precedence policy
 * - Detailed import audit summary
 */

import Papa from 'papaparse';
import { evaluateRouting } from './routingEngine';

const VALID_PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'];
const VALID_OUTCOMES = [
  'Closed Won',
  'Closed Lost',
  'Qualified',
  'Meeting Scheduled',
  'Action Required',
  'Needs Nurturing',
  'Escalated',
];
const VALID_TYPES = ['Call', 'Demo', 'Discovery', 'Follow-up', 'Negotiation'];

/**
 * Generates a stable key for a record.
 * Uses primary record ID if present; otherwise uses documented composite signature:
 * account_name | contact_name | date
 */
export const getRecordKey = (record) => {
  if (record.id && String(record.id).trim() !== '') {
    return String(record.id).trim();
  }
  const acc = (record.account_name || '').trim().toLowerCase();
  const con = (record.contact_name || '').trim().toLowerCase();
  const dt = (record.date || '').trim();
  if (acc && con && dt) {
    return `COMPOSITE:${acc}|${con}|${dt}`;
  }
  return null;
};

/**
 * Validates a single incoming record.
 * Returns { isValid: boolean, errors: string[] }
 */
export const validateRecord = (record, rowIndex) => {
  const errors = [];
  const rowId = record.id || `Row #${rowIndex + 1}`;

  // Required: Account name or Contact name
  if (!record.account_name && !record.contact_name) {
    errors.push(`Row ${rowId}: Both account_name and contact_name are missing.`);
  }

  // Validate Date format if present (YYYY-MM-DD or standard ISO)
  if (record.date) {
    const parsedDate = Date.parse(record.date);
    if (isNaN(parsedDate)) {
      errors.push(`Row ${rowId}: Invalid date format "${record.date}". Expected YYYY-MM-DD.`);
    }
  }

  // Validate Priority if provided
  if (record.priority && !VALID_PRIORITIES.includes(record.priority)) {
    errors.push(
      `Row ${rowId}: Invalid priority "${record.priority}". Must be one of: ${VALID_PRIORITIES.join(', ')}.`
    );
  }

  // Validate Outcome if provided
  if (record.outcome && !VALID_OUTCOMES.includes(record.outcome)) {
    errors.push(
      `Row ${rowId}: Non-standard outcome "${record.outcome}". Standard values: ${VALID_OUTCOMES.join(', ')}.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Normalizes incoming object keys to standard schema
 */
export const normalizeRecord = (raw) => {
  const norm = {};
  for (const [key, val] of Object.entries(raw)) {
    const k = key.trim().toLowerCase().replace(/[\s-_]+/g, '_');
    norm[k] = typeof val === 'string' ? val.trim() : val;
  }

  return {
    id: norm.id || norm.conversation_id || norm.record_id || '',
    contact_name: norm.contact_name || norm.contact || norm.customer_name || '',
    contact_email: norm.contact_email || norm.email || '',
    account_name: norm.account_name || norm.account || norm.company || '',
    account_tier: norm.account_tier || norm.tier || 'Mid-Market',
    rep_name: norm.rep_name || norm.sales_rep || norm.rep || norm.owner || '',
    type: norm.type || norm.call_type || norm.meeting_type || 'Call',
    date: norm.date || norm.conversation_date || new Date().toISOString().split('T')[0],
    time: norm.time || norm.conversation_time || '12:00',
    duration_minutes: Number(norm.duration_minutes || norm.duration || 30),
    outcome: norm.outcome || norm.status || 'Action Required',
    priority: norm.priority || 'Medium',
    follow_up_status: norm.follow_up_status || norm.followup || 'None',
    follow_up_due_date: norm.follow_up_due_date || norm.due_date || '',
    is_escalated: norm.is_escalated === true || norm.is_escalated === 'true' || norm.escalated === true,
    urgency_reason: norm.urgency_reason || norm.reason || '',
    notes: norm.notes || norm.summary || norm.transcript || '',
    routing_status: norm.routing_status || 'Pending Review',
    assigned_owner: norm.assigned_owner || norm.rep_name || norm.owner || '',
    audit_history: raw.audit_history || [],
    manual_override: raw.manual_override || false,
    override_details: raw.override_details || null,
  };
};

/**
 * Checks if two records are identical (deep property comparison of data fields)
 */
export const areRecordsIdentical = (recA, recB) => {
  const fieldsToCheck = [
    'contact_name',
    'contact_email',
    'account_name',
    'account_tier',
    'rep_name',
    'type',
    'date',
    'time',
    'duration_minutes',
    'outcome',
    'priority',
    'follow_up_status',
    'follow_up_due_date',
    'is_escalated',
    'urgency_reason',
    'notes',
    'assigned_owner',
  ];

  return fieldsToCheck.every((f) => String(recA[f] || '') === String(recB[f] || ''));
};

/**
 * Idempotently imports incoming records against existing dataset.
 *
 * Precedence Policy:
 * 1. Exact Duplicate: Record already exists and all data fields match -> IGNORED (0 double counting)
 * 2. Record Update: Record key matches existing record:
 *    - If existing record was manually edited (manual_override === true or audit_history > 0):
 *      Manual corrections (e.g. assigned_owner, priority, outcome) are PRESERVED.
 *      Non-manually modified fields (e.g. newer notes, duration) are merged.
 *      Logged as an UPDATE with manual preservation noted.
 *    - If no manual edits: incoming record fields overwrite existing.
 * 3. New Record: Key does not exist in dataset -> Added and evaluated against routing rules.
 * 4. Invalid Record: Validation fails -> Recorded in invalidRecords list with row reasons.
 */
export const processImport = (incomingRawRecords, existingRecords = []) => {
  const summary = {
    totalProcessed: 0,
    newAdded: 0,
    existingUpdated: 0,
    duplicatesIgnored: 0,
    invalidCount: 0,
    conflictsDetected: 0,
    invalidRecords: [],
    details: [],
  };

  const existingMap = new Map();
  for (const rec of existingRecords) {
    const key = getRecordKey(rec);
    if (key) {
      existingMap.set(key, rec);
    }
  }

  const updatedRecordsMap = new Map(existingMap);

  incomingRawRecords.forEach((raw, idx) => {
    summary.totalProcessed++;
    const normalized = normalizeRecord(raw);

    // Validation
    const validation = validateRecord(normalized, idx);
    if (!validation.isValid) {
      summary.invalidCount++;
      summary.invalidRecords.push({
        rowIndex: idx + 1,
        recordId: normalized.id || `Row ${idx + 1}`,
        errors: validation.errors,
        raw,
      });
      return;
    }

    const key = getRecordKey(normalized);
    if (!key) {
      summary.invalidCount++;
      summary.invalidRecords.push({
        rowIndex: idx + 1,
        recordId: `Row ${idx + 1}`,
        errors: ['Unable to determine a stable identifier or composite key for record.'],
        raw,
      });
      return;
    }

    // Check if record exists
    if (existingMap.has(key)) {
      const existing = existingMap.get(key);

      // Check for exact duplicate
      if (areRecordsIdentical(existing, normalized)) {
        summary.duplicatesIgnored++;
        summary.details.push({
          key,
          action: 'DUPLICATE_IGNORED',
          message: `Record ${key} is identical to existing record; ignored without duplicating.`,
        });
        return;
      }

      // Record has updates. Apply Precedence Policy.
      const hasManualEdits = existing.manual_override === true || (existing.audit_history && existing.audit_history.length > 0);

      let mergedRecord;
      if (hasManualEdits) {
        summary.conflictsDetected++;
        // Preserve manual manager corrections
        mergedRecord = {
          ...normalized,
          ...existing, // keeps manually overridden owner, priority, status, audit trail
          notes: normalized.notes || existing.notes,
          duration_minutes: normalized.duration_minutes || existing.duration_minutes,
          time: normalized.time || existing.time,
        };

        const auditNotice = {
          timestamp: new Date().toISOString(),
          user: 'System (Import Merge)',
          action: 'IMPORT_UPDATE_MERGE',
          field: 'External Import',
          oldValue: 'Pre-existing Manual Override',
          newValue: 'Preserved Manual Edits, Merged Non-Conflicting Import Fields',
          reason: 'Documented Precedence Policy: Manual manager edits protected against overwrite.',
        };
        mergedRecord.audit_history = [auditNotice, ...(mergedRecord.audit_history || [])];

        summary.details.push({
          key,
          action: 'UPDATED_PRESERVED_MANUAL',
          message: `Record ${key} updated from import; manual corrections preserved.`,
        });
      } else {
        // Evaluate routing for newly updated record
        const routing = evaluateRouting(normalized);
        mergedRecord = {
          ...normalized,
          routing_status: routing.routing_status,
          suggested_priority: routing.suggested_priority,
          suggested_owner: routing.suggested_owner,
          routing_rule_triggered: routing.routing_rule_triggered,
          routing_reason: routing.routing_reason,
          routing_conflicts: routing.routing_conflicts,
        };

        summary.details.push({
          key,
          action: 'UPDATED',
          message: `Record ${key} updated with new incoming attributes.`,
        });
      }

      summary.existingUpdated++;
      updatedRecordsMap.set(key, mergedRecord);
    } else {
      // New record
      const routing = evaluateRouting(normalized);
      const newRecord = {
        ...normalized,
        routing_status: routing.routing_status,
        suggested_priority: routing.suggested_priority,
        suggested_owner: routing.suggested_owner,
        routing_rule_triggered: routing.routing_rule_triggered,
        routing_reason: routing.routing_reason,
        routing_conflicts: routing.routing_conflicts,
        audit_history: [
          {
            timestamp: new Date().toISOString(),
            user: 'System (Import)',
            action: 'CREATED',
            field: 'All',
            oldValue: null,
            newValue: 'Imported Record',
            reason: 'Initial dataset import',
          },
        ],
      };

      summary.newAdded++;
      updatedRecordsMap.set(key, newRecord);
      summary.details.push({
        key,
        action: 'ADDED',
        message: `New record ${key} added and evaluated against routing rules.`,
      });
    }
  });

  return {
    summary,
    records: Array.from(updatedRecordsMap.values()),
  };
};

/**
 * Parses raw text input (CSV string or JSON string) and processes import
 */
export const parseAndImportData = (fileContent, fileType, existingRecords = []) => {
  return new Promise((resolve, reject) => {
    try {
      if (fileType === 'json' || fileType === 'application/json') {
        const parsed = JSON.parse(fileContent);
        const recordsArray = Array.isArray(parsed) ? parsed : [parsed];
        const result = processImport(recordsArray, existingRecords);
        resolve(result);
      } else {
        // Assume CSV
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              console.warn('PapaParse encountered warnings/errors:', results.errors);
            }
            const result = processImport(results.data, existingRecords);
            resolve(result);
          },
          error: (err) => {
            reject(new Error(`Failed to parse CSV: ${err.message}`));
          },
        });
      }
    } catch (err) {
      reject(new Error(`Data parsing error: ${err.message}`));
    }
  });
};
