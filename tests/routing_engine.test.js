import { describe, it, expect } from 'vitest';
import {
  evaluateRouting,
  applyManagerOverride,
  DEFAULT_ROUTING_RULES,
} from '../src/services/routingEngine';
import sampleData from '../data/sample_conversations.json';

describe('Deterministic Routing Engine Suite', () => {
  it('correctly triggers Enterprise Escalation Rule for escalated enterprise account', () => {
    const escalatedEnterprise = {
      id: 'TEST-ESC',
      account_name: 'Big Corp',
      account_tier: 'Enterprise',
      is_escalated: true,
      outcome: 'Escalated',
      assigned_owner: '',
    };

    const result = evaluateRouting(escalatedEnterprise, DEFAULT_ROUTING_RULES);

    expect(result.suggested_priority).toBe('Urgent');
    expect(result.suggested_owner).toBe('Alex Rivera');
    expect(result.routing_rule_triggered).toContain('Enterprise Escalation Priority');
    expect(result.routing_reason.toLowerCase()).toContain('executive handling by senior enterprise ae');
  });

  it('detects conflicts when multiple rules apply and provides explainable conflict details', () => {
    // Record REV-1012 (FinVantage Corp): Enterprise escalation but existing owner is Taylor Kim
    const rev1012 = sampleData.find((r) => r.id === 'REV-1012');
    expect(rev1012).toBeDefined();

    const result = evaluateRouting(rev1012, DEFAULT_ROUTING_RULES);

    expect(result.hasConflict).toBe(true);
    expect(result.routing_status).toBe('Pending Review');
    expect(result.routing_conflicts.length).toBeGreaterThan(0);
    expect(result.routing_conflicts[0]).toContain('Taylor Kim');
  });

  it('records manager manual overrides with previous decisions and audit justification', () => {
    const record = {
      id: 'TEST-OVR',
      account_name: 'Test Account',
      assigned_owner: 'Taylor Kim',
      priority: 'Medium',
      routing_status: 'Pending Review',
      suggested_owner: 'Alex Rivera',
      suggested_priority: 'Urgent',
      routing_rule_triggered: 'Enterprise Escalation Priority',
    };

    const overridden = applyManagerOverride(
      record,
      'Alex Rivera',
      'Urgent',
      'Manager strategic account assignment to resolve escalation',
      'Sales Manager'
    );

    expect(overridden.assigned_owner).toBe('Alex Rivera');
    expect(overridden.priority).toBe('Urgent');
    expect(overridden.routing_status).toBe('Overridden');
    expect(overridden.manual_override).toBe(true);
    expect(overridden.override_details.reason).toBe(
      'Manager strategic account assignment to resolve escalation'
    );
    expect(overridden.override_details.priorDecision.previousOwner).toBe('Taylor Kim');
    expect(overridden.audit_history.length).toBe(1);
    expect(overridden.audit_history[0].action).toBe('ROUTING_OVERRIDE');
  });

  it('provides safe fallback for non-escalated standard conversations', () => {
    const normalRecord = {
      id: 'TEST-NORM',
      account_name: 'Standard SMB',
      account_tier: 'SMB',
      assigned_owner: 'Jordan Lee',
      priority: 'Low',
      outcome: 'Qualified',
      follow_up_status: 'Completed',
    };

    const result = evaluateRouting(normalRecord, DEFAULT_ROUTING_RULES);
    expect(result.hasConflict).toBe(false);
    expect(result.suggested_owner).toBe('Jordan Lee');
  });
});
