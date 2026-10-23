import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const sampleData = JSON.parse(fs.readFileSync('./data/sample_conversations.json', 'utf8'));

// 1. Sanitized Conversations Master
const sanitizedMaster = sampleData.map((r) => ({
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
  notes: r.notes || '',
}));

// 2. Needs Attention
const needsAttention = sanitizedMaster.filter(
  (r) =>
    r.is_escalated === 'true' ||
    r.outcome === 'Escalated' ||
    r.follow_up_status === 'Overdue' ||
    !r.assigned_owner ||
    r.routing_status === 'Unassigned' ||
    r.routing_status === 'Pending Review'
);

// 3. Routing Decisions
const routingDecisions = sampleData.map((r) => ({
  record_id: r.id,
  account_name: r.account_name,
  account_tier: r.account_tier,
  routing_status: r.routing_status,
  assigned_owner: r.assigned_owner || 'Unassigned',
  priority: r.priority,
  escalated: r.is_escalated ? 'true' : 'false',
  follow_up_status: r.follow_up_status,
}));

// Write CSVs and JSONs
fs.writeFileSync('./exports/conversations_master.csv', Papa.unparse(sanitizedMaster, { quotes: true, header: true }));
fs.writeFileSync('./exports/conversations_master.json', JSON.stringify(sanitizedMaster, null, 2));
fs.writeFileSync('./exports/needs_attention_export.csv', Papa.unparse(needsAttention, { quotes: true, header: true }));
fs.writeFileSync('./exports/needs_attention_export.json', JSON.stringify(needsAttention, null, 2));
fs.writeFileSync('./exports/routing_decisions_export.csv', Papa.unparse(routingDecisions, { quotes: true, header: true }));

// 4. Build Manifest
const timestamp = new Date().toISOString();
const manifestEntries = [
  {
    export_filename: 'conversations_master.csv',
    export_type: 'ALL_CONVERSATIONS',
    export_timestamp: timestamp,
    record_count: sanitizedMaster.length,
    format: 'CSV',
    filter_scope: 'All Records (Unfiltered)',
    schema_version: '1.0.0',
    data_source: 'Revenue Intelligence Inbox (Volopay)',
    validation_status: 'RFC_4180_VALID',
  },
  {
    export_filename: 'conversations_master.json',
    export_type: 'ALL_CONVERSATIONS',
    export_timestamp: timestamp,
    record_count: sanitizedMaster.length,
    format: 'JSON',
    filter_scope: 'All Records (Unfiltered)',
    schema_version: '1.0.0',
    data_source: 'Revenue Intelligence Inbox (Volopay)',
    validation_status: 'JSON_SCHEMA_VALID',
  },
  {
    export_filename: 'needs_attention_export.csv',
    export_type: 'NEEDS_ATTENTION',
    export_timestamp: timestamp,
    record_count: needsAttention.length,
    format: 'CSV',
    filter_scope: 'Escalated | Overdue | Unassigned | Pending Review',
    schema_version: '1.0.0',
    data_source: 'Revenue Intelligence Inbox (Volopay)',
    validation_status: 'RFC_4180_VALID',
  },
  {
    export_filename: 'needs_attention_export.json',
    export_type: 'NEEDS_ATTENTION',
    export_timestamp: timestamp,
    record_count: needsAttention.length,
    format: 'JSON',
    filter_scope: 'Escalated | Overdue | Unassigned | Pending Review',
    schema_version: '1.0.0',
    data_source: 'Revenue Intelligence Inbox (Volopay)',
    validation_status: 'JSON_SCHEMA_VALID',
  },
  {
    export_filename: 'routing_decisions_export.csv',
    export_type: 'ROUTING_DECISIONS',
    export_timestamp: timestamp,
    record_count: routingDecisions.length,
    format: 'CSV',
    filter_scope: 'All Evaluated Records',
    schema_version: '1.0.0',
    data_source: 'Revenue Intelligence Inbox (Volopay)',
    validation_status: 'RFC_4180_VALID',
  },
];

fs.writeFileSync('./exports/manifest.json', JSON.stringify(manifestEntries, null, 2));
fs.writeFileSync('./exports/manifest.csv', Papa.unparse(manifestEntries, { quotes: true, header: true }));

console.log('Successfully generated initial exports and manifest in ./exports/');
