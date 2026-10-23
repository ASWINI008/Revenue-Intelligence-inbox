import { describe, it, expect } from 'vitest';
import {
  processImport,
  getRecordKey,
  validateRecord,
} from '../src/services/importService';
import sampleData from '../data/sample_conversations.json';

describe('Import & Idempotency Suite', () => {
  it('generates consistent primary and composite record keys', () => {
    const withId = { id: 'REV-1001', account_name: 'Acme', contact_name: 'Sarah', date: '2026-10-20' };
    expect(getRecordKey(withId)).toBe('REV-1001');

    const withoutId = { account_name: 'Acme', contact_name: 'Sarah', date: '2026-10-20' };
    expect(getRecordKey(withoutId)).toBe('COMPOSITE:acme|sarah|2026-10-20');
  });

  it('rejects invalid records with malformed dates and invalid priorities', () => {
    const malformed = {
      id: 'REV-BAD',
      account_name: 'Bad Corp',
      contact_name: 'Bad Guy',
      date: 'NOT_A_VALID_DATE',
      priority: 'INVALID_PRIORITY_STRING',
    };

    const val = validateRecord(malformed, 0);
    expect(val.isValid).toBe(false);
    expect(val.errors.length).toBe(2);
    expect(val.errors[0]).toContain('Invalid date format');
    expect(val.errors[1]).toContain('Invalid priority');
  });

  it('is 100% idempotent: importing the same records twice creates 0 duplicates', () => {
    const existing = [...sampleData];
    const duplicatesToImport = sampleData.slice(0, 5);

    const result = processImport(duplicatesToImport, existing);

    expect(result.summary.totalProcessed).toBe(5);
    expect(result.summary.newAdded).toBe(0);
    expect(result.summary.existingUpdated).toBe(0);
    expect(result.summary.duplicatesIgnored).toBe(5);
    expect(result.records.length).toBe(existing.length);
  });

  it('correctly handles record updates when attributes change', () => {
    const existing = [...sampleData];
    const updatedBatch = [
      {
        ...sampleData[0],
        duration_minutes: 90,
        notes: 'Updated meeting notes post call.',
      },
      {
        id: 'REV-NEW-999',
        account_name: 'Brand New Account',
        contact_name: 'Alice Wonder',
        account_tier: 'Enterprise',
        type: 'Discovery',
        date: '2026-10-22',
        outcome: 'Qualified',
        priority: 'High',
      },
    ];

    const result = processImport(updatedBatch, existing);

    expect(result.summary.totalProcessed).toBe(2);
    expect(result.summary.existingUpdated).toBe(1);
    expect(result.summary.newAdded).toBe(1);
    expect(result.summary.duplicatesIgnored).toBe(0);

    const updatedRec = result.records.find((r) => r.id === sampleData[0].id);
    expect(updatedRec.duration_minutes).toBe(90);
    expect(updatedRec.notes).toBe('Updated meeting notes post call.');
  });

  it('preserves manual manager corrections during subsequent imports (Precedence Policy)', () => {
    // Simulate a record that was manually overridden by the sales manager
    const existingManuallyEdited = [
      {
        ...sampleData[0],
        assigned_owner: 'Manually Assigned Owner',
        priority: 'Urgent',
        manual_override: true,
        audit_history: [
          {
            timestamp: '2026-10-22T10:00:00Z',
            user: 'Sales Manager',
            action: 'MANUAL_EDIT',
            field: 'assigned_owner',
            oldValue: 'Alex Rivera',
            newValue: 'Manually Assigned Owner',
            reason: 'Strategic account reassignment',
          },
        ],
      },
    ];

    // Incoming file has stale owner 'Alex Rivera' but newer duration
    const incomingStaleImport = [
      {
        id: sampleData[0].id,
        account_name: sampleData[0].account_name,
        contact_name: sampleData[0].contact_name,
        assigned_owner: 'Alex Rivera', // stale!
        priority: 'Medium',           // stale!
        duration_minutes: 55,         // new field!
      },
    ];

    const result = processImport(incomingStaleImport, existingManuallyEdited);

    expect(result.summary.existingUpdated).toBe(1);
    expect(result.summary.conflictsDetected).toBe(1);

    const saved = result.records[0];
    // Manual edits must NOT be clobbered
    expect(saved.assigned_owner).toBe('Manually Assigned Owner');
    expect(saved.priority).toBe('Urgent');
    // Non-conflicting newer field was merged
    expect(saved.duration_minutes).toBe(55);
    // Audit notice was appended
    expect(saved.audit_history.length).toBe(2);
    expect(saved.audit_history[0].action).toBe('IMPORT_UPDATE_MERGE');
  });
});
