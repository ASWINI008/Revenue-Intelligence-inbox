import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  toCSVString,
  toJSONString,
  createManifestEntry,
  sanitizeForExport,
} from '../src/services/exportService';
import sampleData from '../data/sample_conversations.json';

describe('Exports & Manifest Validation Suite', () => {
  it('correctly escapes quotes and commas in RFC 4180 CSV output', () => {
    const complexData = [
      {
        id: 'REV-QUOTES',
        account_name: 'Acme, Global & "Associates"',
        notes: 'Discussion included: "Price, tier discount", and custom SLA.',
      },
    ];

    const csv = toCSVString(complexData);
    expect(csv).toContain('"Acme, Global & ""Associates"""');
    expect(csv).toContain('"Discussion included: ""Price, tier discount"", and custom SLA."');
  });

  it('produces valid parseable JSON output', () => {
    const sanitized = sanitizeForExport(sampleData);
    const jsonStr = toJSONString(sanitized);

    const parsed = JSON.parse(jsonStr);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(sampleData.length);
    expect(parsed[0].id).toBe(sampleData[0].id);
  });

  it('creates manifest entries with compliant schema fields', () => {
    const manifestEntry = createManifestEntry({
      filename: 'test_export.csv',
      exportType: 'ALL_CONVERSATIONS',
      recordCount: 25,
      format: 'csv',
      filterScope: 'All Records',
    });

    expect(manifestEntry.export_filename).toBe('test_export.csv');
    expect(manifestEntry.record_count).toBe(25);
    expect(manifestEntry.format).toBe('CSV');
    expect(manifestEntry.schema_version).toBe('1.0.0');
    expect(manifestEntry.validation_status).toBe('VALID');
    expect(manifestEntry.export_timestamp).toBeDefined();
  });

  it('verifies that physical generated files in ./exports match manifest definitions', () => {
    const manifestPath = path.resolve('./exports/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.length).toBeGreaterThan(0);

    for (const entry of manifest) {
      const filePath = path.resolve('./exports', entry.export_filename);
      expect(fs.existsSync(filePath)).toBe(true);
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    }
  });
});
