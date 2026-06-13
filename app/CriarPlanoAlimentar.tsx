import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, ScrollView, StatusBar,
    StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { createPlano, createPlanoReceita } from '../src/services/planoService_1';
import { getReceitasByNutricionista } from '../src/services/receitaService_1';

export default function CriarPlanoAlimentar() {
    const { pacienteId, pacienteNome } = useLocalSearchParams<{ pacienteId: string; pacienteNome: string }>();

    const [calorias,   setCalorias]   = useState('');
    const [proteina,   setProteina]   = useState('');
    const [carbo,      setCarbo]      = useState('');
    const [gordura,    setGordura]    = useState('');
    const [receitas,   setReceitas]   = useState<any[]>([]);
    const [selecionadas, setSelecionadas] = useState<number[]>([]);
    const [loading,    setLoading]    = useState(true);
    const [salvando,   setSalvando]   = useState(false);

    useEffect(() => {
        async function carregar() {
            try {
                const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
                if (!nutricionistaId) return;
                const lista = await getReceitasByNutricionista(nutricionistaId);
                setReceitas(lista);
            } catch (e) {
                console.error('Erro ao carregar receitas:', e);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, []);

    function toggleReceita(id: number) {
        setSelecionadas(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    }

    async function salvar() {
        if (!calorias || !proteina || !carbo || !gordura) {
            Alert.alert('Atenção', 'Preencha todas as metas nutricionais.');
            return;
        }
        setSalvando(true);
        try {
            const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');

            const planoBody = {
                usuario: { idUser: Number(pacienteId) },
                nutricionista: { idNutri: Number(nutricionistaId) },
                caloriasAlvo: Number(calorias),
                proteinaAlvo: Number(proteina),
                carboAlvo: Number(carbo),
                gorduraAlvo: Number(gordura),
                status: 'Ativo',
            };

            const planoResposta = await createPlano(planoBody);


            for (const receitaId of selecionadas) {
                await createPlanoReceita({ planoId: planoResposta.idPlano, receitaId });
            }

            Alert.alert('✅ Plano criado!', `Plano alimentar de ${pacienteNome} criado com sucesso.`, [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (e) {
            console.error('Erro ao salvar plano:', e);
            Alert.alert('Erro', 'Não foi possível criar o plano. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.btnVoltar}>
                    <Ionicons name="chevron-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Criar Plano Alimentar</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.pacienteNome}>Paciente: {pacienteNome}</Text>

                <Text style={s.secao}>Metas Nutricionais Diárias</Text>
                <View style={s.card}>
                    <View style={s.inputRow}>
                        <MaterialCommunityIcons name="fire" size={20} color="#E65100" />
                        <TextInput style={s.input} placeholder="Calorias (kcal)" keyboardType="numeric"
                            value={calorias} onChangeText={setCalorias} placeholderTextColor="#aaa" />
                    </View>
                    <View style={s.divisor} />
                    <View style={s.inputRow}>
                        <MaterialCommunityIcons name="arm-flex" size={20} color="#1565C0" />
                        <TextInput style={s.input} placeholder="Proteína (g)" keyboardType="numeric"
                            value={proteina} onChangeText={setProteina} placeholderTextColor="#aaa" />
                    </View>
                    <View style={s.divisor} />
                    <View style={s.inputRow}>
                        <MaterialCommunityIcons name="bread-slice" size={20} color="#F9A825" />
                        <TextInput style={s.input} placeholder="Carboidrato (g)" keyboardType="numeric"
                            value={carbo} onChangeText={setCarbo} placeholderTextColor="#aaa" />
                    </View>
                    <View style={s.divisor} />
                    <View style={s.inputRow}>
                        <MaterialCommunityIcons name="water" size={20} color="#2E7D32" />
                        <TextInput style={s.input} placeholder="Gordura (g)" keyboardType="numeric"
                            value={gordura} onChangeText={setGordura} placeholderTextColor="#aaa" />
                    </View>
                </View>

                <Text style={s.secao}>Selecionar Receitas</Text>

                {loading ? (
                    <ActivityIndicator color="#2E7D32" />
                ) : receitas.length === 0 ? (
                    <View style={s.vazio}>
                        <MaterialCommunityIcons name="food-off" size={36} color="#ccc" />
                        <Text style={s.vazioTexto}>Nenhuma receita cadastrada.</Text>
                        <TouchableOpacity onPress={() => router.push('./CriarReceita')}>
                            <Text style={s.linkReceita}>Criar receita</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    receitas.map((r: any) => {
                        const sel = selecionadas.includes(r.idReceita);
                        return (
                            <TouchableOpacity
                                key={r.idReceita}
                                style={[s.receitaCard, sel && s.receitaSel]}
                                onPress={() => toggleReceita(r.idReceita)}
                                activeOpacity={0.8}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={s.receitaTitulo}>{r.titulo}</Text>
                                    {r.calorias && <Text style={s.receitaInfo}>🔥 {r.calorias} kcal</Text>}
                                </View>
                                {sel && <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />}
                            </TouchableOpacity>
                        );
                    })
                )}

                <TouchableOpacity
                    style={[s.btnSalvar, salvando && { opacity: 0.7 }]}
                    onPress={salvar}
                    disabled={salvando}
                    activeOpacity={0.85}
                >
                    <Text style={s.btnSalvarTexto}>
                        {salvando ? 'Salvando...' : 'Criar Plano Alimentar'}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root:         { flex: 1, backgroundColor: '#F5F7F5' },
    header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 54, paddingBottom: 12 },
    btnVoltar:    { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EBEBEB', justifyContent: 'center', alignItems: 'center' },
    headerTitulo: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
    scroll:       { paddingHorizontal: 20, paddingBottom: 24 },
    pacienteNome: { fontSize: 16, color: '#888', marginBottom: 20, fontWeight: '600' },
    secao:        { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 14 },
    card:         { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24, elevation: 2 },
    inputRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    input:        { flex: 1, fontSize: 15, color: '#111' },
    divisor:      { height: 1, backgroundColor: '#F0F0F0' },
    vazio:        { alignItems: 'center', paddingVertical: 24, gap: 8 },
    vazioTexto:   { color: '#aaa', fontSize: 14 },
    linkReceita:  { color: '#2E7D32', fontWeight: '700', fontSize: 14 },
    receitaCard:  { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
    receitaSel:   { borderWidth: 2, borderColor: '#2E7D32', backgroundColor: '#F0F7F0' },
    receitaTitulo:{ fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
    receitaInfo:  { fontSize: 12, color: '#888' },
    btnSalvar:    { backgroundColor: '#2E7D32', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 16 },
    btnSalvarTexto:{ color: '#fff', fontSize: 16, fontWeight: '700' },
});