import express from 'express';
import { matchPatientToAgents } from '../services/matchingService.js';

const router = express.Router();

// POST /api/match
router.post('/', async (req, res) => {
  try {
    const { treatment, country, maxBudget } = req.body;
    const matchResults = await matchPatientToAgents(treatment, country, maxBudget);
    res.json({ success: true, data: matchResults });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
