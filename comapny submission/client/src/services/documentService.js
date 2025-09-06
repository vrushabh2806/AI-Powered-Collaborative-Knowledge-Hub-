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

export const documentService = {
  async getDocuments(page = 1, limit = 10, tag = null) {
    const params = { page, limit };
    if (tag) params.tag = tag;
    const response = await api.get('/documents', { params });
    return response.data;
  },

  async getDocument(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  async createDocument(documentData) {
    const response = await api.post('/documents', documentData);
    return response.data;
  },

  async updateDocument(id, documentData) {
    const response = await api.put(`/documents/${id}`, documentData);
    return response.data;
  },

  async deleteDocument(id) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  async generateSummary(id) {
    const response = await api.post(`/documents/${id}/summarize`);
    return response.data;
  },

  async generateTags(id) {
    const response = await api.post(`/documents/${id}/tags`);
    return response.data;
  },

  async getDocumentVersions(id) {
    const response = await api.get(`/documents/${id}/versions`);
    return response.data;
  },

  async getRecentActivity() {
    const response = await api.get('/documents/activity/recent');
    return response.data;
  }
};
