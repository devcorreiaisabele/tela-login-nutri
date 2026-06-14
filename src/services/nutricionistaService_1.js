import api from './api';

export const getNutricionistas = async () => {
  const response = await api.get('/nutricionista');
  return response.data;
};

export const getNutricionistaById = async (id) => {
  const response = await api.get(`/nutricionista/${id}`);
  return response.data;
};

export const createNutricionista = async (dados) => {
  const response = await api.post('/nutricionista', dados);
  return response.data;
};

export const updateNutricionista = async (id, dados) => {
  const atual = await getNutricionistaById(id);
  const response = await api.put(`/nutricionista/${id}`, {
    idNutri: atual.idNutri,
    nomeCompleto: dados.nomeCompleto ?? atual.nomeCompleto,
    emailProfissional: dados.emailProfissional ?? atual.emailProfissional,
    senhaHash: dados.senhaHash ?? atual.senhaHash,
    crn: dados.crn ?? atual.crn,
    uf: dados.uf ?? atual.uf,
    especialidadePrincipal: dados.especialidadePrincipal ?? atual.especialidadePrincipal,
    biografia: dados.biografia ?? atual.biografia,
    avaliacaoMedia: dados.avaliacaoMedia ?? atual.avaliacaoMedia,
    totalPacientes: dados.totalPacientes ?? atual.totalPacientes,
    fotoUrl: dados.fotoUrl ?? atual.fotoUrl,
  });
  return response.data;
};

export const deleteNutricionista = async (id) => {
  const response = await api.delete(`/nutricionista/${id}`);
  return response.data;
};