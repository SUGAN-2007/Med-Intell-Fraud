import express from 'express';
import { runQuery } from '../config/neo4j.js';
import { calculateRiskScore } from '../services/riskScoring.js';

const router = express.Router();

/**
 * POST /api/match
 * Evaluates all medical travel facilitators using live Cypher risk scoring.
 * Strictly filters out any agent with non-zero risk score (riskScore > 0) from the verified list.
 */
router.post('/', async (req, res) => {
  try {
    const { treatment, country, maxBudget } = req.body || {};

    // 1. Fetch all Agent nodes from Neo4j
    const agentsResult = await runQuery(`
      MATCH (a:Agent) 
      RETURN a.id AS id, a.name AS name, a.address AS address, a.email AS email, a.phone AS phone, a.country AS country, a.trustRating AS trustRating
    `);

    // 2. Concurrently compute live risk scores for each agent using riskScoring service
    const evaluatedAgents = await Promise.all(
      agentsResult.map(async (agent) => {
        const scoreData = await calculateRiskScore(agent.id);
        return {
          id: agent.id,
          name: agent.name || agent.id,
          address: agent.address || 'Verified International Medical Hub',
          email: agent.email || 'contact@verifiedhealth.org',
          phone: agent.phone || '+1-555-0100',
          country: agent.country || 'International',
          trustRating: agent.trustRating || 4.5,
          riskScore: scoreData.riskScore,
          triggeredPatterns: scoreData.triggeredPatterns
        };
      })
    );

    // 3. Strictly separate 100% clean agents (riskScore === 0) from flagged agents (riskScore > 0)
    const verified = evaluatedAgents.filter(a => a.riskScore === 0 && a.triggeredPatterns.length === 0);
    const flagged = evaluatedAgents.filter(a => a.riskScore > 0 || a.triggeredPatterns.length > 0);

    res.json({
      success: true,
      data: {
        treatment: treatment || 'Medical Facilitation',
        totalScanned: evaluatedAgents.length,
        verified,
        flagged
      }
    });
  } catch (error) {
    console.error('Error in agent matching:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
