import { describe, it, expect } from 'vitest';
import { analyzeDataQuality } from '../src/services/dataQualityService';
import sampleData from '../data/sample_conversations.json';

describe('Data Quality Diagnostics Suite', () => {
  it('correctly audits sample data for business warnings without false critical errors', () => {
    const report = analyzeDataQuality(sampleData);

    expect(report.summary.totalRecords).toBe(25);
    expect(report.summary.criticalErrors).toBe(0);
    // There are business warnings (unassigned leads, overdue follow-ups, pending reviews)
    expect(report.summary.businessWarnings).toBeGreaterThan(0);
    expect(report.healthScore).toBeGreaterThan(70);
  });

  it('detects missing record IDs, malformed dates, and invalid priority strings as critical errors', () => {
    const dirtyRecords = [
      {
        id: '', // missing ID!
        account_name: 'No ID Corp',
        contact_name: 'John',
        date: '2026-10-20',
        priority: 'Medium',
      },
      {
        id: 'REV-BAD-DATE',
        account_name: 'Bad Date Corp',
        contact_name: 'Jane',
        date: 'INVALID_DATE_FORMAT',
        priority: 'Medium',
      },
      {
        id: 'REV-BAD-PRIO',
        account_name: 'Bad Priority Corp',
        contact_name: 'Bob',
        date: '2026-10-20',
        priority: 'SUPER_URGENT_INVALID',
      },
    ];

    const report = analyzeDataQuality(dirtyRecords);

    expect(report.summary.criticalErrors).toBe(3);
    const issueTypes = report.issues.map((i) => i.type);
    expect(issueTypes).toContain('Missing Identifier');
    expect(issueTypes).toContain('Invalid Date Format');
    expect(issueTypes).toContain('Invalid Priority Value');
  });
});
