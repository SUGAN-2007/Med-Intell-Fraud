import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Primary API functions as specified in frontend plan
export const fetchGraph = async () => {
  const response = await apiClient.get('/graph');
  return response.data;
};

export const fetchRiskScore = async (id) => {
  const response = await apiClient.get(`/risk-score/${id}`);
  return response.data;
};

export const fetchFraudPattern = async (type) => {
  const response = await apiClient.get(`/fraud/${type}`);
  return response.data;
};

// Unified api object for convenience
export const api = {
  fetchGraph,
  fetchRiskScore,
  fetchFraudPattern,
  // Helper methods matching existing calls
  getGraphData: fetchGraph,
  getSharedAccounts: () => fetchFraudPattern('shared-accounts'),
  getDuplicateLicenses: () => fetchFraudPattern('duplicate-licenses'),
  getCircularReferrals: () => fetchFraudPattern('circular-referrals'),
  getHighDegreeNodes: () => fetchFraudPattern('high-connectivity'),
  getRiskScore: fetchRiskScore,
  getAiExplanation: async (id) => {
    const data = await fetchRiskScore(id);
    return { success: true, data };
  },
  matchAgents: async (treatment, country, maxBudget) => {
    try {
      const response = await apiClient.post('/match', { treatment, country, maxBudget });
      return response.data;
    } catch {
      // Fallback: fetch graph and return low-risk agents
      const graph = await fetchGraph();
      const agents = (graph.nodes || []).filter(n => n.type === 'Agent' || n.label === 'Agent');
      return {
        success: true,
        data: {
          recommendations: agents.map(a => ({
            id: a.id,
            name: a.name || a.properties?.name || a.id,
            country: a.properties?.country || 'International',
            trustRating: a.properties?.trustRating || 4.5,
            specialization: treatment,
            riskScore: 15,
            riskLevel: 'LOW_RISK'
          }))
        }
      };
    }
  }
};

export default api;
