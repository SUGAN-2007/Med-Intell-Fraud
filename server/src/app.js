import express from 'express';
import cors from 'cors';
import graphRoutes from './routes/graph.routes.js';
import fraudRoutes from './routes/fraud.routes.js';
import riskScoreRoutes from './routes/riskScore.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/graph', graphRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/risk-score', riskScoreRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
