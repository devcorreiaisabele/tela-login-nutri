import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BotaoContinuar } from '../components/BotaoContinuar';
import { globalStyles as g } from '../props/globalStyles';
import { updateUsuario } from '../src/services/usuarioService_1';

const RESTRICOES = [
  { id: 'nenhuma',   icone: 'food-fork-drink',     titulo: 'Nenhuma',          descricao: 'Sem restrições religiosas base' },
  { id: 'halal',     icone: 'moon-waning-crescent', titulo: 'Halal (Islâmica)', descricao: 'Sem carne de porco ou álcool' },
  { id: 'kosher',    icone: 'star-david',           titulo: 'Kosher (Judaica)', descricao: 'Separação de carnes e laticínios' },
  { id: 'cristao',   icone: 'cross-outline',        titulo: 'Cristianismo',     descricao: 'Pode incluir períodos de jejum ou abstinência' },
  { id: 'hinduismo', icone: 'white-balance-sunny',  titulo: 'Hinduísmo',        descricao: 'Sem carne bovina, opções mais vegetais' },
];

const ALERGIAS = [
  { id: 'gluten',     label: 'Sem Glúten' },
  { id: 'lactose',    label: 'Sem Lactose' },
  { id: 'amendoim',   label: 'Amendoim' },
  { id: 'nozes',      label: 'Nozes' },
  { id: 'crustaceos', label: 'Crustáceos' },
  { id: 'ovos',       label: 'Ovos' },
];

export default function RestricoesAdicionais() {
  const [restricao, setRestricao] = useState('nenhuma');
  const [alergias, setAlergias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { origem } = useLocalSearchParams();

  function toggleAlergia(id: string) {
    setAlergias((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleContinuar() {
    setLoading(true);
    try {
      const usuarioId = await AsyncStorage.getItem('usuarioId');
      if (usuarioId) {
        await updateUsuario(usuarioId, {
          restricoesReligiosas: restricao,
          alergias: alergias.join(','),
        });
      }
      if (origem === 'edicao') {
  router.replace('/MaisDetalhes');
} else {
  router.push('./ObjetivosSaude');
}
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={g.container}>
      <View style={g.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={g.passo}>Passo 2 de 3</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={g.progressoBg}>
        <View style={{ height: 4, width: '66%', backgroundColor: '#2E7D32', borderRadius: 10 }} />
      </View>

      <ScrollView contentContainerStyle={g.scroll} showsVerticalScrollIndicator={false}>
        <Text style={g.titulo}>Restrições Adicionais</Text>
        <Text style={g.subtitulo}>Você escolheu a dieta Onívora. Deseja adicionar alguma diretriz religiosa?</Text>

        {RESTRICOES.map((item) => {
          const selecionado = restricao === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[g.card, selecionado && g.cardSelecionado]}
              onPress={() => setRestricao(item.id)}
              activeOpacity={0.8}
            >
              <View style={[g.cardIcone, selecionado && g.cardIconeSelecionado]}>
                <MaterialCommunityIcons name={item.icone as any} size={22} color={selecionado ? '#fff' : '#2E7D32'} />
              </View>
              <View style={g.cardTexto}>
                <Text style={[g.cardTitulo, selecionado && g.cardTituloSelecionado]}>{item.titulo}</Text>
                <Text style={g.cardDescricao}>{item.descricao}</Text>
              </View>
              {selecionado && <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />}
            </TouchableOpacity>
          );
        })}

        <Text style={g.titulo2}>Alergias e Intolerâncias</Text>
        <Text style={g.subtitulo}>Selecione ingredientes que devemos evitar.</Text>

        <View style={g.chips}>
          {ALERGIAS.map((item) => {
            const ativo = alergias.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[g.chip, ativo && g.chipAtivo]}
                onPress={() => toggleAlergia(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[g.chipTexto, ativo && g.chipTextoAtivo]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {loading
        ? <ActivityIndicator size="large" color="#2E7D32" style={{ margin: 20 }} />
        : <BotaoContinuar onPress={handleContinuar} texto={origem === 'edicao' ? 'Salvar' : 'Continuar'} />
      }
    </View>
  );
}