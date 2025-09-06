import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const qaService = {
  async askQuestion(question) {
    const response = await api.post('/qa/ask', { question });
    return response.data;
  },

  async getHistory() {
    const response = await api.get('/qa/history');
    return response.data;
  }
};
