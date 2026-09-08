import express from 'express';
import { runQuery } from '../config/neo4j.js';
import { getFullGraph } from '../queries/fraudQueries.js';

const router = express.Router();

/**
 * GET /api/graph
 * Runs getFullGraph() and returns nodes + edges formatted for react-force-graph
 */
router.get('/', async (req, res) => {
  try {
    const records = await runQuery(getFullGraph());

    const nodesMap = new Map();
    const links = [];

    records.forEach(row => {
      const { n, r, m } = row;

      if (n && n.id) {
        if (!nodesMap.has(n.id)) {
          nodesMap.set(n.id, {
            id: n.id,
            name: n.properties?.name || n.properties?.accountNumber || n.properties?.licenseNumber || n.id,
            label: n.labels ? n.labels[0] : 'Node',
            type: n.labels ? n.labels[0] : 'Node',
            properties: n.properties || {}
          });
        }
      }

      if (m && m.id) {
        if (!nodesMap.has(m.id)) {
          nodesMap.set(m.id, {
            id: m.id,
            name: m.properties?.name || m.properties?.accountNumber || m.properties?.licenseNumber || m.id,
            label: m.labels ? m.labels[0] : 'Node',
            type: m.labels ? m.labels[0] : 'Node',
            properties: m.properties || {}
          });
        }
      }

      if (r && n && m) {
        links.push({
          id: r.id || `link_${links.length}`,
          source: n.id,
          target: m.id,
          type: r.type || 'RELATIONSHIP',
          label: r.type || 'RELATIONSHIP',
          properties: r.properties || {}
        });
      }
    });

    res.json({
      nodes: Array.from(nodesMap.values()),
      links
    });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
