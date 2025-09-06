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

export const searchService = {
  async textSearch(query, page = 1, limit = 10) {
    const response = await api.get('/search/text', {
      params: { q: query, page, limit }
    });
    return response.data;
  },

  async semanticSearch(query, page = 1, limit = 10) {
    const response = await api.post('/search/semantic', {
      query, page, limit
    });
    return response.data;
  },

  async tagSearch(tags, page = 1, limit = 10) {
    const response = await api.get('/search/tags', {
      params: { tags: tags.join(','), page, limit }
    });
    return response.data;
  },

  async getAllTags() {
    const response = await api.get('/search/tags/all');
    return response.data;
  }
};
