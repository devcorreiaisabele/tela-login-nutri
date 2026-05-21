import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://backend3na-production.up.railway.app',
});