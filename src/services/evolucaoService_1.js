import api from './api';

export const getEvolucoes = async () => {
  const response = await api.get('/evolucao');
  return response.data;
};

export const getEvolucaoById = async (id) => {
  const response = await api.get(`/evolucao/${id}`);
  return response.data;
};

export const getEvolucoesByUsuario = async (idUser) => {
  const response = await api.get(`/evolucao/usuario/${idUser}`);
  return response.data;
};

export const createEvolucao = async (dados) => {
  const response = await api.post('/evolucao', dados);
  return response.data;
};

export const updateEvolucao = async (id, dados) => {
  const response = await api.put(`/evolucao/${id}`, dados);
  return response.data;
};

export const deleteEvolucao = async (id) => {
  const response = await api.delete(`/evolucao/${id}`);
  return response.data;
};
