import { detectSharedBankAccounts } from '../queries/sharedBankAccount.js';
import { detectDuplicateLicenses } from '../queries/duplicateLicense.js';
import { detectCircularReferrals } from '../queries/circularReferral.js';
import { detectHighDegreeNodes } from '../queries/highDegreeNode.js';
import { getMemoryStore } from '../db/seedLoader.js';

/**
 * Compute weighted risk score (0 - 100) for a given agent.
 */
export async function calculateAgentRiskScore(agentId) {
  const { nodes } = getMemoryStore();
  const agent = nodes.find(n => n.id === agentId);

  if (!agent) {
    throw new Error(`Agent with ID '${agentId}' not found.`);
  }

  // Execute all fraud detection rules concurrently
  const [sharedAccounts, duplicateLicenses, circularReferrals, highDegreeNodes] = await Promise.all([
    detectSharedBankAccounts(),
    detectDuplicateLicenses(),
    detectCircularReferrals(),
    detectHighDegreeNodes(4)
  ]);

  let score = 0;
  const triggeredRules = [];

  // Rule 1: Shared Bank Account (+45 points)
  const sharedAccMatch = sharedAccounts.find(
    item => item.entity1.id === agentId || item.entity2.id === agentId
  );
  if (sharedAccMatch) {
    score += 45;
    triggeredRules.push({
      rule: 'SHARED_BANK_ACCOUNT',
      severity: 'CRITICAL',
      points: 45,
      description: `Shares offshore bank account ${sharedAccMatch.accountNumber} with unlinked clinic/agent (${sharedAccMatch.entity1.id === agentId ? sharedAccMatch.entity2.name : sharedAccMatch.entity1.name}).`
    });
  }

  // Rule 2: Circular Referral Loop (+35 points)
  const circularMatch = circularReferrals.find(item => item.agent.id === agentId);
  if (circularMatch) {
    score += 35;
    triggeredRules.push({
      rule: 'CIRCULAR_REFERRAL_KICKBACK',
      severity: 'HIGH',
      points: 35,
      description: `Participates in closed referral kickback ring with clinic '${circularMatch.clinic.name}' and doctor '${circularMatch.doctor.name}'.`
    });
  }

  // Rule 3: High Degree Connection Anomaly (+15 points)
  const highDegreeMatch = highDegreeNodes.find(item => item.id === agentId);
  if (highDegreeMatch) {
    score += 15;
    triggeredRules.push({
      rule: 'UNNATURAL_NODE_DEGREE',
      severity: 'MEDIUM',
      points: 15,
      description: `Holds an unusually high volume of unverified connections (${highDegreeMatch.degree} linked nodes).`
    });
  }

  // Rule 4: Trust Rating Penalty (up to +20 points)
  const trustRating = agent.properties.trustRating || 3.0;
  if (trustRating < 2.5) {
    const penalty = Math.round((2.5 - trustRating) * 15);
    score += penalty;
    triggeredRules.push({
      rule: 'LOW_PUBLIC_TRUST_RATING',
      severity: 'LOW',
      points: penalty,
      description: `Public rating of ${trustRating}/5.0 is below safety threshold.`
    });
  }

  // Cap score at 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Risk Tier
  let riskLevel = 'LOW_RISK';
  if (finalScore >= 60) {
    riskLevel = 'HIGH_RISK';
  } else if (finalScore >= 30) {
    riskLevel = 'MEDIUM_RISK';
  }

  return {
    agentId: agent.id,
    agentName: agent.properties.name,
    country: agent.properties.country,
    specialization: agent.properties.specialization,
    trustRating: agent.properties.trustRating,
    riskScore: finalScore,
    riskLevel,
    triggeredRulesCount: triggeredRules.length,
    triggeredRules
  };
}
