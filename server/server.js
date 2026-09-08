import app from './src/app.js';
import dotenv from 'dotenv';
import { initNeo4j, closeDriver } from './src/config/neo4j.js';
import { seedDatabase } from './src/db/seedLoader.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Initialize Neo4j or Fallback Graph Driver
    await initNeo4j();

    // 2. Seed Database
    await seedDatabase();

    // 3. Start Express Server
    app.listen(PORT, () => {
      console.log(`\n🚀 International Medical Fraud Intelligence Server active!`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}`);
      console.log(`📊 Graph Endpoint: http://localhost:${PORT}/api/graph\n`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server gracefully...');
  await closeDriver();
  process.exit(0);
});

startServer();
