import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend3na-production.up.railway.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
