/**
 * Routing Engine for Revenue Intelligence Inbox
 * Deterministic, rule-based routing evaluation and conflict explanation.
 */

export const DEFAULT_ROUTING_RULES = [
  {
    id: 'RULE_ENTERPRISE_ESCALATION',
    name: 'Enterprise Escalation Priority',
    description: 'Elevate priority to Urgent and route Enterprise escalations to Senior Enterprise AE (Alex Rivera)',
    enabled: true,
    condition: (rec) =>
      rec.account_tier === 'Enterprise' &&
      (rec.is_escalated === true || rec.is_escalated === 'true' || rec.outcome === 'Escalated'),
    recommendation: {
      priority: 'Urgent',
      suggested_owner: 'Alex Rivera',
      reason: 'Enterprise tier customer escalated; requires executive handling by Senior Enterprise AE Alex Rivera.',
    },
  },
  {
    id: 'RULE_OVERDUE_STALLED_FOLLOWUP',
    name: 'Stalled Overdue Follow-up Intervention',
    description: 'Elevate priority to Urgent when Action Required follow-up is past due',
    enabled: true,
    condition: (rec) =>
      rec.follow_up_status === 'Overdue' &&
      (rec.outcome === 'Action Required' || rec.outcome === 'Escalated'),
    recommendation: {
      priority: 'Urgent',
      suggested_owner: null, // Keep existing owner or flag if unassigned
      reason: 'Follow-up commitment is overdue with pending action items. Urgent manager intervention required.',
    },
  },
  {
    id: 'RULE_UNASSIGNED_INBOUND_TIER',
    name: 'Unassigned Inbound Tier Matching',
    description: 'Match unassigned incoming leads to designated tier specialists',
    enabled: true,
    condition: (rec) => !rec.assigned_owner || rec.assigned_owner.trim() === '' || rec.routing_status === 'Unassigned',
    recommendation: (rec) => {
      if (rec.account_tier === 'Enterprise') {
        return {
          priority: rec.priority || 'High',
          suggested_owner: 'Alex Rivera',
          reason: 'Unassigned Enterprise lead automatically matched to Senior AE Alex Rivera.',
        };
      } else if (rec.account_tier === 'Mid-Market') {
        return {
          priority: rec.priority || 'Medium',
          suggested_owner: 'Taylor Kim',
          reason: 'Unassigned Mid-Market opportunity matched to Mid-Market AE Taylor Kim.',
        };
      } else {
        return {
          priority: rec.priority || 'Medium',
          suggested_owner: 'Jordan Lee',
          reason: 'Unassigned SMB account matched to Commercial AE Jordan Lee.',
        };
      }
    },
  },
  {
    id: 'RULE_COMPETITIVE_THREAT',
    name: 'Competitive Threat Acceleration',
    description: 'Elevate priority to Urgent if notes or urgency reason mentions competitor or RFP threat',
    enabled: true,
    condition: (rec) => {
      const text = `${rec.urgency_reason || ''} ${rec.notes || ''}`.toLowerCase();
      return text.includes('competitor') || text.includes('rfp') || text.includes('churn') || text.includes('threat');
    },
    recommendation: {
      priority: 'Urgent',
      suggested_owner: null,
      reason: 'Competitive threat or churn risk identified in conversation intelligence.',
    },
  },
  {
    id: 'RULE_CLOSED_WON_HANDOFF',
    name: 'Closed Won Customer Success Handoff',
    description: 'Route Closed Won opportunities to Customer Success for kickoff onboarding',
    enabled: true,
    condition: (rec) => rec.outcome === 'Closed Won',
    recommendation: {
      priority: 'Medium',
      suggested_owner: 'Customer Success Team',
      reason: 'Deal closed won; route to Customer Success team for implementation kickoff.',
    },
  },
];

/**
 * Evaluates a single conversation record against routing rules.
 * Detects conflicts when multiple rules provide differing recommendations.
 */
export const evaluateRouting = (record, rules = DEFAULT_ROUTING_RULES) => {
  const activeRules = rules.filter((r) => r.enabled !== false);
  const matchedRules = [];

  for (const rule of activeRules) {
    try {
      if (rule.condition(record)) {
        const recOutput = typeof rule.recommendation === 'function'
          ? rule.recommendation(record)
          : rule.recommendation;
        matchedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          priority: recOutput.priority,
          suggested_owner: recOutput.suggested_owner,
          reason: recOutput.reason,
        });
      }
    } catch (err) {
      console.warn(`Error evaluating rule ${rule.id} on record ${record.id}:`, err);
    }
  }

  if (matchedRules.length === 0) {
    return {
      routing_status: record.assigned_owner ? 'Routed' : 'Unassigned',
      suggested_priority: record.priority || 'Medium',
      suggested_owner: record.assigned_owner || 'Unassigned',
      routing_rule_triggered: 'Default Fallback (No custom rule matched)',
      routing_reason: record.assigned_owner
        ? `Preserved current assigned owner (${record.assigned_owner}) as no escalation or redistribution rules matched.`
        : 'No specific rule matched and no owner assigned. Retained as Unassigned.',
      routing_conflicts: [],
      hasConflict: false,
    };
  }

  // Check for conflicts between matched rules
  const owners = matchedRules.map((m) => m.suggested_owner).filter(Boolean);
  const priorities = matchedRules.map((m) => m.priority).filter(Boolean);

  const uniqueOwners = Array.from(new Set(owners));
  const uniquePriorities = Array.from(new Set(priorities));

  // Also check if current assigned owner differs from recommended owner
  const existingOwnerConflict =
    record.assigned_owner &&
    uniqueOwners.length > 0 &&
    !uniqueOwners.includes(record.assigned_owner);

  const hasConflict = uniqueOwners.length > 1 || existingOwnerConflict;

  // Primary decision: top priority rule is first matched
  const primaryMatch = matchedRules[0];

  const suggestedOwner =
    primaryMatch.suggested_owner || record.assigned_owner || 'Unassigned';

  const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
  const highestPriority = matchedRules.reduce((prev, curr) => {
    const prevWeight = priorityOrder[prev] || 0;
    const currWeight = priorityOrder[curr.priority] || 0;
    return currWeight > prevWeight ? curr.priority : prev;
  }, record.priority || 'Medium');

  let conflictExplanation = [];
  if (hasConflict) {
    if (uniqueOwners.length > 1) {
      conflictExplanation.push(
        `Multiple rules suggested different owners: ${matchedRules.map((m) => `${m.ruleName} -> ${m.suggested_owner}`).join(', ')}`
      );
    }
    if (existingOwnerConflict) {
      conflictExplanation.push(
        `Existing assigned owner (${record.assigned_owner}) conflicts with rule suggestion (${primaryMatch.suggested_owner}) from ${primaryMatch.ruleName}.`
      );
    }
  }

  return {
    routing_status: hasConflict ? 'Pending Review' : (record.assigned_owner ? 'Routed' : 'Unassigned'),
    suggested_priority: highestPriority,
    suggested_owner: suggestedOwner,
    routing_rule_triggered: matchedRules.map((m) => m.ruleName).join(' + '),
    routing_reason: primaryMatch.reason,
    routing_conflicts: conflictExplanation,
    hasConflict,
    matchedRules,
  };
};

/**
 * Apply routing override by manager
 */
export const applyManagerOverride = (record, newOwner, newPriority, reason, managerName = 'Sales Manager') => {
  const timestamp = new Date().toISOString();
  const priorDecision = {
    previousOwner: record.assigned_owner,
    previousPriority: record.priority,
    previousRoutingStatus: record.routing_status,
    suggested_owner: record.suggested_owner,
    suggested_priority: record.suggested_priority,
    ruleTriggered: record.routing_rule_triggered,
  };

  const auditEntry = {
    timestamp,
    user: managerName,
    action: 'ROUTING_OVERRIDE',
    field: 'assigned_owner & priority',
    oldValue: `Owner: ${record.assigned_owner || 'None'}, Priority: ${record.priority}`,
    newValue: `Owner: ${newOwner}, Priority: ${newPriority}`,
    reason: reason || 'Manager manual routing override',
    priorDecision,
  };

  return {
    ...record,
    assigned_owner: newOwner,
    rep_name: newOwner,
    priority: newPriority,
    routing_status: 'Overridden',
    manual_override: true,
    override_details: {
      overriddenBy: managerName,
      overriddenAt: timestamp,
      reason,
      priorDecision,
    },
    audit_history: [auditEntry, ...(record.audit_history || [])],
  };
};
