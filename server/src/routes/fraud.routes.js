import express from 'express';
import { detectSharedBankAccounts } from '../queries/sharedBankAccount.js';
import { detectDuplicateLicenses } from '../queries/duplicateLicense.js';
import { detectCircularReferrals } from '../queries/circularReferral.js';
import { detectHighDegreeNodes } from '../queries/highDegreeNode.js';

const router = express.Router();

// GET /api/fraud/shared-accounts
router.get('/shared-accounts', async (req, res) => {
  try {
    const results = await detectSharedBankAccounts();
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/fraud/duplicate-licenses
router.get('/duplicate-licenses', async (req, res) => {
  try {
    const results = await detectDuplicateLicenses();
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/fraud/circular-referrals
router.get('/circular-referrals', async (req, res) => {
  try {
    const results = await detectCircularReferrals();
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/fraud/high-degree
router.get('/high-degree', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 4;
    const results = await detectHighDegreeNodes(threshold);
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
