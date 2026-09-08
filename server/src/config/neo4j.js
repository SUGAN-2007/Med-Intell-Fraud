import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

let driver = null;

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;
const database = process.env.NEO4J_DATABASE;

/**
 * Initialize Neo4j Driver
 */
export async function initNeo4j() {
  if (driver) return driver;

  if (uri && user && password) {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      await driver.verifyConnectivity();
      console.log('✅ Connected to Neo4j database successfully.');
      return driver;
    } catch (error) {
      console.error('❌ Failed to connect to Neo4j database:', error);
      throw error;
    }
  } else {
    throw new Error('Missing Neo4j configuration credentials in .env');
  }
}

export function getDriver() {
  if (!driver && uri && user && password) {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

export { driver };

/**
 * Convert Neo4j record data types (Integers, Nodes, Relationships) to plain JS objects.
 */
function formatValue(val) {
  if (val === null || val === undefined) return val;
  if (neo4j.isInt(val)) return val.toNumber();
  if (Array.isArray(val)) return val.map(formatValue);

  if (typeof val === 'object') {
    // Neo4j Node
    if (val.labels && val.properties) {
      return {
        id: val.properties.id || val.elementId || val.identity?.toString(),
        labels: val.labels,
        properties: formatValue(val.properties)
      };
    }
    // Neo4j Relationship
    if (val.type && val.properties) {
      return {
        id: val.elementId || val.identity?.toString(),
        type: val.type,
        start: val.startNodeElementId || val.start?.toString(),
        end: val.endNodeElementId || val.end?.toString(),
        properties: formatValue(val.properties)
      };
    }
    // Generic object
    const formatted = {};
    for (const key of Object.keys(val)) {
      formatted[key] = formatValue(val[key]);
    }
    return formatted;
  }
  return val;
}

/**
 * Execute a Cypher query using a managed session and return plain JS records.
 */
export async function runQuery(cypher, params = {}) {
  const currentDriver = getDriver();
  if (!currentDriver) {
    await initNeo4j();
  }

  const sessionOptions = database ? { database } : {};
  const session = getDriver().session(sessionOptions);

  try {
    const result = await session.run(cypher, params);
    return result.records.map(record => {
      const row = {};
      record.keys.forEach(key => {
        row[key] = formatValue(record.get(key));
      });
      return row;
    });
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
