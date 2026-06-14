import api from './api';

export const getOuCriarPlanoUsuario = async (usuarioId) => {
  const response = await api.get(`/plano/ativo/usuario/${usuarioId}`);
  return response.data;
};

export const upsertReceitaNoPlano = async (planoId, receitaId, tipoRefeicao) => {
  const response = await api.post('/planoreceita/upsert', {
    planoId,
    receitaId,
    tipoRefeicao,
  });
  return response.data;
};

export const getReceitasDoPlano = async (planoId) => {
  const response = await api.get(`/planoreceita/plano/${planoId}`);
  return response.data;
};

export const removerReceitaDoPlano = async (idPlanoReceita) => {
  const response = await api.delete(`/planoreceita/${idPlanoReceita}`);
  return response.data;
};