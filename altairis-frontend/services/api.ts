import axios from 'axios';

// Creamos una instancia centralizada de Axios
const api = axios.create({
  baseURL: 'http://localhost:5150/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('altairis_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;