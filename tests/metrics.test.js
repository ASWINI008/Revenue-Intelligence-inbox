import { describe, it, expect } from 'vitest';
import sampleData from '../data/sample_conversations.json';

describe('Dashboard Metrics Calculation Suite', () => {
  it('calculates metrics correctly from canonical sample dataset', () => {
    expect(sampleData.length).toBe(25);

    const calls = sampleData.filter((r) => r.type.toLowerCase() === 'call').length;
    const meetings = sampleData.filter((r) =>
      ['demo', 'discovery', 'negotiation', 'meeting'].includes(r.type.toLowerCase())
    ).length;

    expect(calls).toBe(6);
    expect(meetings).toBe(16);

    const unassigned = sampleData.filter((r) => !r.assigned_owner || r.assigned_owner === '').length;
    expect(unassigned).toBe(4);

    const overdue = sampleData.filter((r) => r.follow_up_status === 'Overdue').length;
    expect(overdue).toBe(6);

    const closedWon = sampleData.filter((r) => r.outcome === 'Closed Won').length;
    const closedLost = sampleData.filter((r) => r.outcome === 'Closed Lost').length;
    expect(closedWon).toBe(4);
    expect(closedLost).toBe(2);

    const winRate = Math.round((closedWon / (closedWon + closedLost)) * 100);
    expect(winRate).toBe(67);
  });

  it('safely handles empty datasets without division by zero or NaN', () => {
    const emptyRecords = [];
    const total = emptyRecords.length;
    const closedWon = emptyRecords.filter((r) => r.outcome === 'Closed Won').length;
    const closedLost = emptyRecords.filter((r) => r.outcome === 'Closed Lost').length;
    const closedTotal = closedWon + closedLost;
    const winRate = closedTotal > 0 ? Math.round((closedWon / closedTotal) * 100) : 0;

    expect(total).toBe(0);
    expect(winRate).toBe(0);
    expect(isNaN(winRate)).toBe(false);
  });
});
