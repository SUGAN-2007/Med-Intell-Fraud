import axios from 'axios';
import dotenv from 'dotenv';
import { calculateAgentRiskScore } from './riskScoring.js';

dotenv.config();

/**
 * Generate plain-English AI risk explanation for an agent using OpenRouter API or smart fallback.
 */
export async function generateRiskExplanation(agentId) {
  const riskAssessment = await calculateAgentRiskScore(agentId);
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your-openrouter')) {
    try {
      const prompt = `
You are a senior medical fraud intelligence analyst. Explain the risk profile of medical facilitator "${riskAssessment.agentName}" (ID: ${riskAssessment.agentId}) in clear, objective plain English.

Assessment Data:
- Risk Score: ${riskAssessment.riskScore}/100 (${riskAssessment.riskLevel})
- Trust Rating: ${riskAssessment.trustRating}/5.0
- Country: ${riskAssessment.country}
- Specialization: ${riskAssessment.specialization}
- Triggered Fraud Flags: ${JSON.stringify(riskAssessment.triggeredRules)}

Write a concise 3-paragraph summary:
1. Executive Risk Summary (State the overall risk verdict and score).
2. Key Red Flags Detected (Explain specific graph anomalies like shared accounts or referral loops).
3. Recommendation for Patients & Regulators (Clear actionable guidance).
`;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert fraud graph investigator for an international healthcare platform.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Med-Fraud-Intelligence-Graph',
            'Content-Type': 'application/json'
          }
        }
      );

      const explanation = response.data?.choices?.[0]?.message?.content;
      if (explanation) {
        return {
          agentId,
          agentName: riskAssessment.agentName,
          riskScore: riskAssessment.riskScore,
          riskLevel: riskAssessment.riskLevel,
          source: `OpenRouter AI (${model})`,
          explanation
        };
      }
    } catch (err) {
      console.warn('⚠️ OpenRouter API call failed or unconfigured, falling back to smart explanation engine:', err.message);
    }
  }

  // Smart Local Fallback Explanation Engine
  return {
    agentId,
    agentName: riskAssessment.agentName,
    riskScore: riskAssessment.riskScore,
    riskLevel: riskAssessment.riskLevel,
    source: 'Medical Fraud Intelligence Rule Engine',
    explanation: buildLocalExplanation(riskAssessment)
  };
}

function buildLocalExplanation(risk) {
  if (risk.riskLevel === 'HIGH_RISK') {
    const flagsSummary = risk.triggeredRules.map(r => `• ${r.description}`).join('\n');
    return `EXECUTIVE SUMMARY:
${risk.agentName} has been assigned a HIGH RISK rating (${risk.riskScore}/100) due to severe financial and relational graph anomalies detected across international registries.

KEY RED FLAGS DETECTED:
${flagsSummary || 'Multiple unverified relationships and low trust scores.'}

RECOMMENDATION:
We advise patients against booking treatments through this facilitator until independent compliance verification is completed by medical regulators.`;
  }

  if (risk.riskLevel === 'MEDIUM_RISK') {
    const flagsSummary = risk.triggeredRules.map(r => `• ${r.description}`).join('\n');
    return `EXECUTIVE SUMMARY:
${risk.agentName} shows MODERATE RISK (${risk.riskScore}/100). While operational in ${risk.country}, graph analysis flagged potential irregularities that warrant patient caution.

KEY WARNING SIGNS:
${flagsSummary || 'Minor trust rating penalties or connection density warnings.'}

RECOMMENDATION:
Patients proceeding with ${risk.agentName} should verify clinic accreditations directly and avoid upfront wire payments to third-party bank accounts.`;
  }

  return `EXECUTIVE SUMMARY:
${risk.agentName} holds a VERIFIED / LOW RISK classification (${risk.riskScore}/100). Graph analysis shows clean ownership lines, validated banking credentials, and positive public trust metrics (${risk.trustRating}/5.0).

GRAPH STATUS:
No shared accounts, duplicate licenses, or circular referral rings were detected.

RECOMMENDATION:
Cleared for patient matching and booking assistance in ${risk.country}.`;
}
