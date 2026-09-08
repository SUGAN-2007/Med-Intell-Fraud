import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Get full graph data
  getGraphData: async () => {
    const response = await axios.get(`${API_BASE_URL}/graph`);
    return response.data;
  },

  // Fraud Ring Queries
  getSharedAccounts: async () => {
    const response = await axios.get(`${API_BASE_URL}/fraud/shared-accounts`);
    return response.data;
  },

  getDuplicateLicenses: async () => {
    const response = await axios.get(`${API_BASE_URL}/fraud/duplicate-licenses`);
    return response.data;
  },

  getCircularReferrals: async () => {
    const response = await axios.get(`${API_BASE_URL}/fraud/circular-referrals`);
    return response.data;
  },

  getHighDegreeNodes: async (threshold = 4) => {
    const response = await axios.get(`${API_BASE_URL}/fraud/high-degree?threshold=${threshold}`);
    return response.data;
  },

  // Risk Score & AI Explanation
  getRiskScore: async (agentId) => {
    const response = await axios.get(`${API_BASE_URL}/risk-score/${agentId}`);
    return response.data;
  },

  getAiExplanation: async (agentId) => {
    const response = await axios.get(`${API_BASE_URL}/explain/${agentId}`);
    return response.data;
  },

  // Patient Matching
  matchAgents: async (treatment, country, maxBudget) => {
    const response = await axios.post(`${API_BASE_URL}/match`, {
      treatment,
      country,
      maxBudget
    });
    return response.data;
  }
};
