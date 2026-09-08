import app from './src/app.js';
import dotenv from 'dotenv';
import { initNeo4j, closeDriver } from './src/config/neo4j.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize Neo4j Driver Connection
    await initNeo4j();

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`\n🚀 Express + Neo4j Server running on port ${PORT}!`);
      console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 Graph API: http://localhost:${PORT}/api/graph\n`);
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
