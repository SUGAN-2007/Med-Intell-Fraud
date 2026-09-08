import express from 'express';
import { calculateRiskScore } from '../services/riskScoring.js';
import { generateExplanation } from '../services/openrouterExplain.js';

const router = express.Router();

/**
 * GET /api/risk-score/:id
 * Calculates risk score and returns AI explanation for entity
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scoreData = await calculateRiskScore(id);
    const explanation = await generateExplanation(scoreData.triggeredPatterns);

    res.json({
      id: scoreData.id,
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
