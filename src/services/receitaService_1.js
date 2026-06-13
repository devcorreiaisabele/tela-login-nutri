import api from './api';

export const getReceitas = async () => {
  const response = await api.get('/receita');
  console.log('status:', response.status);
  console.log('data:', response.data);
  return response.data;
};

export const getReceitaById = async (id) => {
  const response = await api.get(`/receita/${id}`);
  return response.data;
};

export const getReceitasByNutricionista = async (idNutri) => {
  const response = await api.get(`/receita/nutricionista/${idNutri}`);
  return response.data;
};

export const createReceita = async (dados) => {

  const response = await api.post('/receita', dados);
  return response.data;
};

export const updateReceita = async (id, dados) => {
  const response = await api.put(`/receita/${id}`, dados);
  return response.data;
};

export const deleteReceita = async (id) => {
  const response = await api.delete(`/receita/${id}`);
  return response.data;
};
