import express from 'express';
import { calculateAgentRiskScore } from '../services/riskScoring.js';

const router = express.Router();

// GET /api/risk-score/:agentId
router.get('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const result = await calculateAgentRiskScore(agentId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

export default router;
