import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BotaoContinuar } from '../components/BotaoContinuar';
import { globalStyles as g } from '../props/globalStyles';
import { updateUsuario } from '../src/services/usuarioService_1';

const DIETAS = [
  { id: 'Onívora',      icone: 'food-drumstick', titulo: 'Onívora',      descricao: 'Come de tudo, sem restrições base' },
  { id: 'Vegana',       icone: 'leaf',            titulo: 'Vegana',       descricao: 'Sem produtos de origem animal' },
  { id: 'Vegetariana',  icone: 'food-apple',      titulo: 'Vegetariana',  descricao: 'Inclui ovos e laticínios' },
  { id: 'Pescetariana', icone: 'fish',             titulo: 'Pescetariana', descricao: 'Vegetariano + peixes e frutos do mar' },
];

const PREFERENCIAS = [
  { id: 'Sem Glúten',                   label: 'Sem Glúten' },
  { id: 'Sem Lactose',                  label: 'Sem Lactose' },
  { id: 'Alergia a Nozes',              label: 'Alergia a Nozes' },
  { id: 'Ingredientes Regionais Norte', label: 'Ingredientes Regionais (Norte)' },
  { id: 'Low Carb',                     label: 'Low Carb' },
  { id: 'Rico em Proteína',             label: 'Rico em Proteína' },
];

export default function PreferenciasDieta() {
  const [dietaSelecionada, setDietaSelecionada] = useState('');
  const [preferencias, setPreferencias]         = useState<string[]>([]);
  const [loading, setLoading]                   = useState(false);
  const { origem } = useLocalSearchParams();

  function togglePreferencia(id: string) {
    setPreferencias(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  async function handleContinuar() {
    if (!dietaSelecionada) return;
    setLoading(true);
    try {
      const usuarioId = await AsyncStorage.getItem('usuarioId');
      if (usuarioId) {

        await updateUsuario(usuarioId, {
          tipoDieta: dietaSelecionada,
          alergias: preferencias.join(', '),
        });
        await AsyncStorage.setItem('tipoDieta', dietaSelecionada);
      }
    } catch (e) {
      console.log('Erro ao salvar preferências:', e);

    } finally {
      setLoading(false);
    }
    if (origem === 'edicao') {
  router.replace('/Restricoesadicionais?origem=edicao');
} else {
  router.push('./Restricoesadicionais');
}
  }

  return (
    <View style={g.container}>
      <View style={g.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={g.passo}>Passo 1 de 3</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={g.progressoBg}>
        <View style={{ height: 4, width: '33%', backgroundColor: '#2E7D32', borderRadius: 10 }} />
      </View>

      <ScrollView contentContainerStyle={g.scroll} showsVerticalScrollIndicator={false}>
        <Text style={g.titulo}>Qual é a sua dieta base?</Text>
        <Text style={g.subtitulo}>Isso nos ajudará a personalizar suas recomendações de refeições.</Text>

        {DIETAS.map(dieta => {
          const selecionada = dietaSelecionada === dieta.id;
          return (
            <TouchableOpacity
              key={dieta.id}
              style={[g.card, selecionada && g.cardSelecionado]}
              onPress={() => setDietaSelecionada(dieta.id)}
              activeOpacity={0.8}
            >
              <View style={[g.cardIcone, selecionada && g.cardIconeSelecionado]}>
                <MaterialCommunityIcons name={dieta.icone as any} size={22} color={selecionada ? '#fff' : '#2E7D32'} />
              </View>
              <View style={g.cardTexto}>
                <Text style={[g.cardTitulo, selecionada && g.cardTituloSelecionado]}>{dieta.titulo}</Text>
                <Text style={g.cardDescricao}>{dieta.descricao}</Text>
              </View>
              {selecionada && <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />}
            </TouchableOpacity>
          );
        })}

        <Text style={g.titulo2}>Preferências e Restrições</Text>
        <Text style={g.subtitulo}>Selecione itens regionais ou alergias.</Text>

        <View style={g.chips}>
          {PREFERENCIAS.map(pref => {
            const ativo = preferencias.includes(pref.id);
            return (
              <TouchableOpacity
                key={pref.id}
                style={[g.chip, ativo && g.chipAtivo]}
                onPress={() => togglePreferencia(pref.id)}
                activeOpacity={0.8}
              >
                <Text style={[g.chipTexto, ativo && g.chipTextoAtivo]}>{pref.label}</Text>
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
