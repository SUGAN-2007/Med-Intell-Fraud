import express from 'express';
import { runQuery } from '../config/neo4j.js';
import {
  getSharedBankAccounts,
  getDuplicateLicenses,
  getCircularReferrals,
  getHighConnectivityNodes
} from '../queries/fraudQueries.js';

const router = express.Router();

// GET /api/fraud/shared-accounts
router.get('/shared-accounts', async (req, res) => {
  try {
    const data = await runQuery(getSharedBankAccounts());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fraud/duplicate-licenses
router.get('/duplicate-licenses', async (req, res) => {
  try {
    const data = await runQuery(getDuplicateLicenses());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fraud/circular-referrals
router.get('/circular-referrals', async (req, res) => {
  try {
    const data = await runQuery(getCircularReferrals());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fraud/high-connectivity
router.get('/high-connectivity', async (req, res) => {
  try {
    const data = await runQuery(getHighConnectivityNodes());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
