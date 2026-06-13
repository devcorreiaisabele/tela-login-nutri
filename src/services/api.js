import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend3na.onrender.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
