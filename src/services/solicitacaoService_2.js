import api from './api';

export const getSolicitacoes = async () => {
  const response = await api.get('/solicitacao');
  return response.data;
};

export const getSolicitacaoById = async (id) => {
  const response = await api.get(`/solicitacao/${id}`);
  return response.data;
};

export const createSolicitacao = async (dados) => {
  const response = await api.post('/solicitacao', dados);
  return response.data;
};

export const updateSolicitacao = async (id, dados) => {
  const response = await api.put(`/solicitacao/${id}`, dados);
  return response.data;
};

export const deleteSolicitacao = async (id) => {
  const response = await api.delete(`/solicitacao/${id}`);
  return response.data;
};
