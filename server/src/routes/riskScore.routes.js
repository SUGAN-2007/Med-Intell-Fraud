import express from 'express';
import { calculateRiskScore } from '../services/riskScoring.js';
import { generateExplanation } from '../services/aiExplain.js';

const router = express.Router();

/**
 * GET /api/risk-score/:id
 * Calculates Cypher-based risk score and returns 1-sentence AI explanation
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scoreData = await calculateRiskScore(id);
    const explanation = await generateExplanation(
      scoreData.id,
      scoreData.name,
      scoreData.triggeredPatterns
    );

    res.json({
      id: scoreData.id,
      name: scoreData.name,
      type: scoreData.type,
      riskScore: scoreData.riskScore,
      triggeredPatterns: scoreData.triggeredPatterns,
      explanation
    });
  } catch (error) {
    console.error('Error calculating risk score:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
