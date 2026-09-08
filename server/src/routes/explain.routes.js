import express from 'express';
import { generateRiskExplanation } from '../services/openrouterExplain.js';

const router = express.Router();

// GET /api/explain/:agentId
router.get('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const explanationData = await generateRiskExplanation(agentId);
    res.json({ success: true, data: explanationData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
