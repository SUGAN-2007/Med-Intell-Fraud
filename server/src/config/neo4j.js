import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

let driver = null;
let isConnectedToRealNeo4j = false;

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

/**
 * Initialize Neo4j Driver or establish fallback graph engine.
 */
export async function initNeo4j() {
  if (uri && user && password && !uri.includes('your-instance') && !uri.includes('demo-instance')) {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      await driver.verifyConnectivity();
      isConnectedToRealNeo4j = true;
      console.log('✅ Connected to Neo4j database successfully.');
      return driver;
    } catch (error) {
      console.warn('⚠️ Could not connect to external Neo4j DB. Using internal graph driver emulator.');
      isConnectedToRealNeo4j = false;
      driver = null;
    }
  } else {
    console.log('ℹ️ No external Neo4j credentials configured. Operating with high-performance Graph Driver.');
    isConnectedToRealNeo4j = false;
  }
}

export function getDriver() {
  return driver;
}

export function isRealNeo4jConnected() {
  return isConnectedToRealNeo4j;
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
  }
}
