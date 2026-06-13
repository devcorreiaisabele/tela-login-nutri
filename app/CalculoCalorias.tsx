import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet,
    Text, TouchableOpacity, View,
} from 'react-native';
import { getEvolucoesByUsuario } from '../src/services/evolucaoService_1';
import { getUsuarioById, updateUsuario } from '../src/services/usuarioService_1';

function calcularTMB(peso: number, altura: number, idade: number, genero: string) {
    if (genero.toLowerCase().includes('femin')) {
        return Math.round(10 * peso + 6.25 * altura - 5 * idade - 161);
    }
    return Math.round(10 * peso + 6.25 * altura - 5 * idade + 5);
}

function calcularIdade(dataNascimento: string): number {
    const nasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
}

export default function CalculoCalorias() {
    const [altura, setAltura] = useState(168);
    const [peso, setPeso] = useState(75);
    const [idade, setIdade] = useState(28);
    const [genero, setGenero] = useState('Feminino');
    const [caloriasPerdidasTotal, setCaloriasPerdidasTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [fatorAtiv, setFatorAtiv] = useState(0);

    useEffect(() => {
        async function carregar() {
            try {
                const usuarioId = await AsyncStorage.getItem('usuarioId');
                if (!usuarioId) return;

                const data = await getUsuarioById(usuarioId);
                const alturaUser = parseFloat(String(data.altura)) || 168;
                const pesoUser = parseFloat(String(data.pesoAtual)) || 75;
                const generoUser = String(data.genero ?? 'Feminino');
                const idadeUser = data.dataNascimento ? calcularIdade(data.dataNascimento) : 28;

                setAltura(alturaUser * 100);
                setPeso(pesoUser);
                setGenero(generoUser);
                setIdade(idadeUser);

                const evolucoes = await getEvolucoesByUsuario(usuarioId);
                if (evolucoes && evolucoes.length > 0) {
                    evolucoes.sort((a: any, b: any) =>
                        new Date(a.dataRegistro).getTime() - new Date(b.dataRegistro).getTime()
                    );
                    const dataInicio = new Date(evolucoes[0].dataRegistro);
                    const hoje = new Date();
                    const dias = Math.max(1, Math.round(
                        (hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
                    ));
                    const rotinaUser = String(data.rotinaAtividade ?? '').toLowerCase();
                    let fator = 1.375;
                    if (rotinaUser.includes('atleta')) fator = 1.9;
                    else if (rotinaUser.includes('ativ')) fator = 1.725;
                    else if (rotinaUser.includes('sedentari') || rotinaUser.includes('sedentár')) fator = 1.2;
                    setFatorAtiv(fator);

                    const deficit = 525;
                    setCaloriasPerdidasTotal(deficit * dias);
                }
            } catch (err) {
                console.warn('Erro ao carregar dados:', err);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, []);

    const tmb = calcularTMB(peso, altura, idade, genero);
    const get = Math.round(tmb * fatorAtiv);
    const deficit = 525;
    const meta = get - deficit;

    async function registrarAltura() {
        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');
            if (!usuarioId) return;
            await updateUsuario(usuarioId, { altura: altura / 100 });
            Alert.alert('Salvo!', `Altura de ${altura} cm registrada.`);
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível salvar a altura.');
        }
    }

    if (loading) {
        return (
            <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2E7D32" />
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F0F7F0" />

            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.voltarBtn}>
                    <Ionicons name="arrow-back" size={22} color="#333" />
                </TouchableOpacity>
                <Text style={styles.topTitulo}>Gasto Energético</Text>
                <View style={styles.voltarBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.cardMeta}>
                    <View style={styles.circuloDecoracao} />
                    <Text style={styles.metaKcal}>{meta.toLocaleString('pt-BR')} Kcal</Text>
                    <Text style={styles.metaLabel}>Meta Diária Recomendada</Text>
                </View>

                {caloriasPerdidasTotal !== null && (
                    <View style={styles.cardTotal}>
                        <Ionicons name="flame-outline" size={22} color="#E65100" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.cardTotalLabel}>Calorias queimadas no total</Text>
                            <Text style={styles.cardTotalValor}>
                                {caloriasPerdidasTotal.toLocaleString('pt-BR')} Kcal
                            </Text>
                        </View>
                    </View>
                )}

                <Text style={styles.secaoTitulo}>Seus Dados Corporais</Text>

                <View style={styles.dadosDuplos}>
                    <View style={styles.dadoCard}>
                        <Ionicons name="calendar-outline" size={18} color="#555" />
                        <Text style={styles.dadoLabel}>Idade</Text>
                        <Text style={styles.dadoValor}>{idade} <Text style={styles.dadoUnidade}>anos</Text></Text>
                    </View>
                    <View style={styles.dadoCard}>
                        <Ionicons name="scale-outline" size={18} color="#555" />
                        <Text style={styles.dadoLabel}>Peso</Text>
                        <Text style={styles.dadoValor}>{peso} <Text style={styles.dadoUnidade}>kg</Text></Text>
                    </View>
                </View>

                <View style={styles.dadoCardFull}>
                    <Ionicons name="person-outline" size={18} color="#555" />
                    <Text style={styles.dadoLabel}>Gênero</Text>
                    <Text style={[styles.dadoValor, { marginLeft: 'auto', fontSize: 16 }]}>{genero}</Text>
                </View>

                <View style={styles.alturaCard}>
                    <View style={styles.alturaIconeRow}>
                        <Ionicons name="resize-outline" size={16} color="#2E7D32" />
                        <Text style={styles.alturaTitulo}>Altura</Text>
                    </View>
                    <View style={styles.alturaControle}>
                        <TouchableOpacity style={styles.alturaBtn} onPress={() => setAltura(a => Math.max(100, a - 1))}>
                            <Text style={styles.alturaBtnTexto}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.alturaValor}>{altura} <Text style={styles.alturaUnidade}>cm</Text></Text>
                        <TouchableOpacity style={styles.alturaBtn} onPress={() => setAltura(a => Math.min(250, a + 1))}>
                            <Text style={styles.alturaBtnTexto}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.alturaRegistrarBtn} onPress={registrarAltura} activeOpacity={0.85}>
                        <Text style={styles.alturaRegistrarTexto}>Registrar Altura</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.secaoTitulo}>Detalhes do Cálculo</Text>

                <View style={styles.detalhesCard}>
                    <View style={styles.detalheRow}>
                        <Text style={styles.detalheLabel}>Taxa Metabólica Basal (TMB)</Text>
                        <Text style={styles.detalheValor}>{tmb.toLocaleString('pt-BR')} Kcal</Text>
                    </View>
                    <View style={styles.divisor} />
                    <View style={styles.detalheRow}>
                        <Text style={styles.detalheLabel}>Gasto Total Diário (GET)</Text>
                        <Text style={styles.detalheValor}>{get.toLocaleString('pt-BR')} Kcal</Text>
                    </View>
                    <View style={styles.divisor} />
                    <View style={styles.detalheRow}>
                        <Text style={styles.detalheLabel}>Meta: Perder Peso</Text>
                        <Text style={[styles.detalheValor, { color: '#E53935' }]}>−{deficit} Kcal</Text>
                    </View>
                </View>

                <View style={styles.avisoCard}>
                    <View style={styles.avisoIconeRow}>
                        <Ionicons name="information-circle-outline" size={18} color="#E65100" />
                        <Text style={styles.avisoTitulo}>Aviso:</Text>
                    </View>
                    <Text style={styles.avisoTexto}>
                        Este cálculo é uma estimativa baseada nas fórmulas de Mifflin-St Jeor. Ele pode não refletir com 100% de precisão o seu gasto calórico real, pois varia conforme composição corporal e metabolismo. Use como orientação, mas não como única fonte para decisões de saúde.
                    </Text>
                    <Text style={[styles.avisoTexto, { marginTop: 10 }]}>
                        Se você está em transição hormonal há mais de um ano, selecione o gênero correspondente aos seus hormônios predominantes para um cálculo mais aproximado.
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root:                 { flex: 1, backgroundColor: '#F0F7F0' },
    topBar:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
    voltarBtn:            { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    topTitulo:            { fontSize: 18, fontWeight: '700', color: '#111' },
    scroll:               { paddingHorizontal: 20, paddingBottom: 40 },
    cardMeta:             { backgroundColor: '#2E7D32', borderRadius: 24, padding: 30, alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
    circuloDecoracao:     { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' },
    metaKcal:             { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 6 },
    metaLabel:            { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
    cardTotal:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', borderRadius: 16, padding: 16, marginBottom: 24, borderLeftWidth: 3, borderLeftColor: '#E65100' },
    cardTotalLabel:       { fontSize: 12, color: '#888', marginBottom: 2 },
    cardTotalValor:       { fontSize: 22, fontWeight: '800', color: '#E65100' },
    secaoTitulo:          { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 14 },
    dadosDuplos:          { flexDirection: 'row', gap: 12, marginBottom: 12 },
    dadoCard:             { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, gap: 4 },
    dadoCardFull:         { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    dadoLabel:            { fontSize: 12, color: '#888', marginTop: 4 },
    dadoValor:            { fontSize: 26, fontWeight: '800', color: '#111' },
    dadoUnidade:          { fontSize: 14, fontWeight: '500', color: '#555' },
    alturaCard:           { backgroundColor: '#E8F5E9', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 24 },
    alturaIconeRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    alturaTitulo:         { fontSize: 15, fontWeight: '700', color: '#2E7D32' },
    alturaControle:       { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 20 },
    alturaBtn:            { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3 },
    alturaBtnTexto:       { fontSize: 22, color: '#333', fontWeight: '600' },
    alturaValor:          { fontSize: 42, fontWeight: '900', color: '#2E7D32' },
    alturaUnidade:        { fontSize: 18, fontWeight: '500', color: '#555' },
    alturaRegistrarBtn:   { backgroundColor: '#2E7D32', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40 },
    alturaRegistrarTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
    detalhesCard:         { backgroundColor: '#fff', borderRadius: 16, padding: 18, elevation: 2, marginBottom: 16 },
    detalheRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    detalheLabel:         { fontSize: 13, color: '#666', flex: 1, paddingRight: 8 },
    detalheValor:         { fontSize: 14, fontWeight: '700', color: '#111' },
    divisor:              { height: 1, backgroundColor: '#F0F0F0' },
    avisoCard:            { backgroundColor: '#FFF8E1', borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: '#F57F17', marginBottom: 10 },
    avisoIconeRow:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    avisoTitulo:          { fontSize: 13, fontWeight: '700', color: '#E65100' },
    avisoTexto:           { fontSize: 12, color: '#555', lineHeight: 18 },
});