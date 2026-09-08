import express from 'express';
import { getMemoryStore } from '../db/seedLoader.js';

const router = express.Router();

/**
 * GET /api/graph
 * Returns full graph nodes and links formatted for react-force-graph
 */
router.get('/', (req, res) => {
  try {
    const { nodes, relationships } = getMemoryStore();

    const formattedNodes = nodes.map(n => ({
      id: n.id,
      name: n.properties.name || n.properties.accountNumber || n.properties.licenseNumber || n.id,
      label: n.label,
      group: n.label,
      properties: n.properties
    }));

    const formattedLinks = relationships.map((r, index) => ({
      id: `link_${index}`,
      source: r.from,
      target: r.to,
      type: r.type,
      label: r.type,
      properties: r.properties || {}
    }));

    res.json({
      success: true,
      data: {
        nodes: formattedNodes,
        links: formattedLinks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
