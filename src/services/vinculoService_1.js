import api from './api';

export const getVinculos = async () => {
  const response = await api.get('/vinculo');
  return response.data;
};

export const getVinculoById = async (id) => {
  const response = await api.get(`/vinculo/${id}`);
  return response.data;
};

export const createVinculo = async (dados) => {
  const response = await api.post('/vinculo', dados);
  return response.data;
};

export const updateVinculo = async (id, dados) => {
  const response = await api.put(`/vinculo/${id}`, dados);
  return response.data;
};

export const deleteVinculo = async (id) => {
  const response = await api.delete(`/vinculo/${id}`);
  return response.data;
};
