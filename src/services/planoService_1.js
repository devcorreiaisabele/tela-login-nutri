import api from './api';

export const getPlanos = async () => {
  const response = await api.get('/plano');
  return response.data;
};

export const getPlanoById = async (id) => {
  const response = await api.get(`/plano/${id}`);
  return response.data;
};

export const getPlanosByUsuario = async (usuarioId) => {
  const response = await api.get(`/plano/usuario/${usuarioId}`);
  return response.data;
};

export const createPlanoReceita = async (dados) => {
  const response = await api.post('/planoreceita', dados);
  return response.data;
};

export const createPlano = async (dados) => {
  const response = await api.post('/plano', dados);
  return response.data;
};

export const updatePlano = async (id, dados) => {
  const response = await api.put(`/plano/${id}`, dados);
  return response.data;
};

export const deletePlano = async (id) => {
  const response = await api.delete(`/plano/${id}`);
  return response.data;
};

export const getPlanoReceitas = async () => {
  const response = await api.get('/plano/receita');
  return response.data;
};

export const addReceitaAoPlano = async (dados) => {
  const response = await api.post('/plano/receita', dados);
  return response.data;
};

export const removeReceitaDoPPlano = async (id) => {
  const response = await api.delete(`/plano/receita/${id}`);
  return response.data;
};
