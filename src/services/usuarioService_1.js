import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const getUsuarios = async () => {
  const response = await api.get('/usuario');
  return response.data;
};

export const getUsuarioById = async (id) => {
  const response = await api.get(`/usuario/${id}`);
  return response.data;
};

export const createUsuario = async (dados) => {
  const response = await api.post('/usuario', dados);
  return response.data;
};

const montarUsuarioPayload = (atual, dados) => {
  const novosDados = {
    ...dados,
    pesoMeta: dados.pesoMeta ?? dados.metaPeso,
    rotinaAtividade: dados.rotinaAtividade ?? dados.rotina,
    restricoesReligiosas: dados.restricoesReligiosas ?? dados.restricaoAlimentar,
  };

  return {
    idUser: atual.idUser,
    nomeCompleto: novosDados.nomeCompleto ?? atual.nomeCompleto,
    email: novosDados.email ?? atual.email,
    senhaHash: novosDados.senhaHash ?? atual.senhaHash,
    dataNascimento: novosDados.dataNascimento ?? atual.dataNascimento,
    genero: novosDados.genero ?? atual.genero,
    caloriasDiarias: novosDados.caloriasDiarias ?? atual.caloriasDiarias,
    status: novosDados.status ?? atual.status,
    tipoDieta: novosDados.tipoDieta ?? atual.tipoDieta,
    alergias: novosDados.alergias ?? atual.alergias,
    restricoesReligiosas: novosDados.restricoesReligiosas ?? atual.restricoesReligiosas,
    objetivoSaude: novosDados.objetivoSaude ?? atual.objetivoSaude,
    rotinaAtividade: novosDados.rotinaAtividade ?? atual.rotinaAtividade,
    pesoAtual: novosDados.pesoAtual ?? atual.pesoAtual,
    pesoInicial: novosDados.pesoInicial ?? atual.pesoInicial,
    pesoMeta: novosDados.pesoMeta ?? atual.pesoMeta,
    altura: novosDados.altura ?? atual.altura,
    fotoUrl: novosDados.fotoUrl ?? atual.fotoUrl,
  };
};

export const updateUsuario = async (id, dados) => {
  const atual = await getUsuarioById(id);
  const payload = montarUsuarioPayload(atual, dados);
  console.warn('PAYLOAD PUT:', JSON.stringify(payload));
  const response = await api.put(`/usuario/${id}`, payload);
  console.warn('RESPOSTA PUT:', JSON.stringify(response.data));
  return response.data;
};

export const deleteUsuario = async (id) => {
  const response = await api.delete(`/usuario/${id}`);
  return response.data;
};

export const getUsuarioLogado = async () => {
  const id = await AsyncStorage.getItem('usuarioId');
  return await getUsuarioById(id);
};