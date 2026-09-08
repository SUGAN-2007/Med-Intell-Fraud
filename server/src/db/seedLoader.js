import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDriver, isRealNeo4jConnected } from '../config/neo4j.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let memoryStore = {
  nodes: [],
  relationships: []
};

/**
 * Load seed dataset into Neo4j or memory store.
 */
export async function seedDatabase() {
  const seedPath = path.join(__dirname, 'seed.json');
  const rawData = fs.readFileSync(seedPath, 'utf-8');
  const data = JSON.parse(rawData);

  memoryStore = {
    nodes: data.nodes || [],
    relationships: data.relationships || []
  };

  const driver = getDriver();
  if (isRealNeo4jConnected() && driver) {
    const session = driver.session();
    try {
      console.log('🌱 Seeding Neo4j database with fraud graph dataset...');
      // Clear existing DB
      await session.run('MATCH (n) DETACH DELETE n');

      // Create nodes
      for (const node of data.nodes) {
        await session.run(
          `CREATE (n:${node.label} $props) SET n.id = $id`,
          { id: node.id, props: node.properties }
        );
      }

      // Create relationships
      for (const rel of data.relationships) {
        await session.run(
          `MATCH (a {id: $fromId}), (b {id: $toId})
           CREATE (a)-[r:${rel.type} $props]->(b)`,
          { fromId: rel.from, toId: rel.to, props: rel.properties || {} }
        );
      }

      console.log(`✅ Neo4j database seeded with ${data.nodes.length} nodes & ${data.relationships.length} relationships.`);
    } catch (error) {
      console.error('⚠️ Error seeding Neo4j DB:', error.message);
    } finally {
      await session.close();
    }
  } else {
    console.log(`✅ Loaded ${memoryStore.nodes.length} nodes & ${memoryStore.relationships.length} relationships into Graph Memory Engine.`);
  }
}

export function getMemoryStore() {
  return memoryStore;
}
