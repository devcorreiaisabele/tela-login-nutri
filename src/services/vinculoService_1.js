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

export const getVinculoAtivoByUsuario = async (usuarioId) => {
  const response = await api.get(`/vinculo/usuario/${usuarioId}`);
  const vinculos = response.data;
  return vinculos.find((v) => v.status === 'Ativo') ?? null;};

  export const ativarVinculoPendente = async (usuarioId, nutricionistaId) => {
  const response = await api.get(`/vinculo/usuario/${usuarioId}`);
  const vinculos = response.data;
  const pendente = vinculos.find(
    (v) => v.status === 'Pendente' && v.fkIdNutri === Number(nutricionistaId)
  );
  if (pendente) {
    return await updateVinculo(pendente.idVinculo, { status: 'Ativo' });
  }
  return await createVinculo({
    usuarioId: Number(usuarioId),
    nutricionistaId: Number(nutricionistaId),
    dataSolicitacao: new Date().toISOString().split('T')[0],
    status: 'Ativo',
  });
  
};

export const getVinculosByNutricionista = async (nutricionistaId) => {
  const response = await api.get(`/vinculo/nutricionista/${nutricionistaId}`);
  return response.data;
};