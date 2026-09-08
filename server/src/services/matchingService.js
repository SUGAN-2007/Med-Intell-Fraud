import { getMemoryStore } from '../db/seedLoader.js';
import { calculateAgentRiskScore } from './riskScoring.js';

/**
 * Filter and rank safe agents for a patient treatment request.
 */
export async function matchPatientToAgents(treatment, countryPreference, maxBudget) {
  const { nodes } = getMemoryStore();
  const agentNodes = nodes.filter(n => n.label === 'Agent');

  const evaluatedAgents = await Promise.all(
    agentNodes.map(async (agent) => {
      const riskData = await calculateAgentRiskScore(agent.id);
      return {
        ...agent.properties,
        id: agent.id,
        riskScore: riskData.riskScore,
        riskLevel: riskData.riskLevel,
        triggeredRulesCount: riskData.triggeredRulesCount,
        triggeredRules: riskData.triggeredRules
      };
    })
  );

  // Filter agents matching treatment specialization or country
  let filtered = evaluatedAgents;

  if (treatment && treatment.trim() !== '') {
    const term = treatment.toLowerCase();
    filtered = filtered.filter(a =>
      a.specialization && a.specialization.toLowerCase().includes(term)
    );
  }

  if (countryPreference && countryPreference.trim() !== '') {
    const cTerm = countryPreference.toLowerCase();
    filtered = filtered.filter(a =>
      a.country && a.country.toLowerCase().includes(cTerm)
    );
  }

  // Sort: First by risk score ascending (lowest risk first), then by trust rating descending
  filtered.sort((a, b) => {
    if (a.riskScore !== b.riskScore) {
      return a.riskScore - b.riskScore;
    }
    return (b.trustRating || 0) - (a.trustRating || 0);
  });

  return {
    query: { treatment, countryPreference, maxBudget },
    totalMatched: filtered.length,
    recommendations: filtered.map(a => ({
      agentId: a.id,
      name: a.name,
      country: a.country,
      trustRating: a.trustRating,
      specialization: a.specialization,
      contactEmail: a.contactEmail,
      riskScore: a.riskScore,
      riskLevel: a.riskLevel,
      badge: a.riskLevel === 'LOW_RISK' ? 'VERIFIED_SAFE' : a.riskLevel === 'MEDIUM_RISK' ? 'CAUTION' : 'HIGH_RISK_FLAGGED',
      safetyNote: a.riskLevel === 'LOW_RISK'
        ? 'Fully verified — no graph fraud signals detected.'
        : a.riskLevel === 'MEDIUM_RISK'
        ? 'Exercise caution — minor graph warnings flagged.'
        : 'High Risk Flagged — Not recommended for booking.'
    }))
  };
}
