import { getDriver, isRealNeo4jConnected } from '../config/neo4j.js';
import { getMemoryStore } from '../db/seedLoader.js';

export async function detectHighDegreeNodes(threshold = 4) {
  const driver = getDriver();

  if (isRealNeo4jConnected() && driver) {
    const session = driver.session();
    try {
      const cypherQuery = `
        MATCH (n)
        WITH n, SIZE([(n)--() | 1]) AS degree
        WHERE degree >= $threshold
        RETURN n.id AS id, n.name AS name, labels(n)[0] AS type, degree
        ORDER BY degree DESC
      `;
      const result = await session.run(cypherQuery, { threshold: neo4j.int(threshold) });
      return result.records.map(record => ({
        id: record.get('id'),
        name: record.get('name'),
        type: record.get('type'),
        degree: record.get('degree').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  // Fallback Graph Engine Execution
  const { nodes, relationships } = getMemoryStore();
  const degreeMap = {};

  nodes.forEach(n => { degreeMap[n.id] = 0; });

  relationships.forEach(rel => {
    if (degreeMap[rel.from] !== undefined) degreeMap[rel.from]++;
    if (degreeMap[rel.to] !== undefined) degreeMap[rel.to]++;
  });

  const highDegree = [];
  Object.keys(degreeMap).forEach(nodeId => {
    if (degreeMap[nodeId] >= threshold) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        highDegree.push({
          id: node.id,
          name: node.properties.name,
          type: node.label,
          degree: degreeMap[nodeId],
          country: node.properties.country || 'N/A'
        });
      }
    }
  });

  return highDegree.sort((a, b) => b.degree - a.degree);
}
