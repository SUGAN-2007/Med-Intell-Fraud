import express from 'express';
import cors from 'cors';
import graphRoutes from './routes/graph.routes.js';
import fraudRoutes from './routes/fraud.routes.js';
import riskScoreRoutes from './routes/riskScore.routes.js';
import explainRoutes from './routes/explain.routes.js';
import matchRoutes from './routes/match.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Medical Fraud Intelligence Graph Engine',
    timestamp: new Date().toISOString()
  });
});

// Register Routes
app.use('/api/graph', graphRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/risk-score', riskScoreRoutes);
app.use('/api/explain', explainRoutes);
app.use('/api/match', matchRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

export default app;
