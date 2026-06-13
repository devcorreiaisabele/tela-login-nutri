import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { createEvolucao, getEvolucoesByUsuario } from '../src/services/evolucaoService_1';
import { updateUsuario } from '../src/services/usuarioService_1';

function formatarData(isoString: string) {
    const data = new Date(isoString);
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    if (data.toDateString() === hoje.toDateString()) return `Hoje, ${dia} ${mes}`;
    if (data.toDateString() === ontem.toDateString()) return `Ontem, ${dia} ${mes}`;
    return `${dia < 10 ? '0' + dia : dia} ${mes}`;
}

function calcularProgresso(pesoAtual: number, metaPeso: number, pesoInicial: number) {
    if (pesoInicial === metaPeso) return 100;
    const total = Math.abs(pesoInicial - metaPeso);
    const percorrido = Math.abs(pesoInicial - pesoAtual);
    return Math.min((percorrido / total) * 100, 100);
}

export default function RegistroPeso() {
    const params            = useLocalSearchParams();
    const pesoAtualInicial  = parseFloat(params.peso_atual as string)  || 0;
    const metaPeso          = parseFloat(params.meta_peso as string)   || 0;
    const objetivo         = String(params.objetivo ?? '').toLowerCase(); 
const mantendo         = objetivo.includes('manter');

    const [pesoSelecionado, setPesoSelecionado] = useState(pesoAtualInicial);
    const [historico, setHistorico]             = useState<any[]>([]);
    const [loadingHist, setLoadingHist]         = useState(true);
    const [salvando, setSalvando]               = useState(false);

    useEffect(() => {
        async function buscarHistorico() {
            try {
                const usuarioId = await AsyncStorage.getItem('usuarioId');
                if (!usuarioId) return;
                const evolucoes = await getEvolucoesByUsuario(usuarioId);
                const minhas = evolucoes.filter((e: any) => e.pesoRegistrado != null);
                minhas.sort((a: any, b: any) =>
                    new Date(b.dataRegistro).getTime() - new Date(a.dataRegistro).getTime()
                );
                setHistorico(minhas);
            } catch (err) {
                console.warn('Erro ao buscar histórico:', err);
            } finally {
                setLoadingHist(false);
            }
        }
        buscarHistorico();
    }, []);

    const incrementar  = () => setPesoSelecionado(p => parseFloat((p + 0.5).toFixed(1)));
    const decrementar  = () => setPesoSelecionado(p => Math.max(0, parseFloat((p - 0.5).toFixed(1))));
    const querPerder   = metaPeso < pesoAtualInicial;
    const faltam       = Math.max(0, parseFloat((querPerder ? pesoSelecionado - metaPeso : metaPeso - pesoSelecionado).toFixed(1)));
    const progresso = calcularProgresso(pesoSelecionado, metaPeso, pesoAtualInicial);
    const metaAtingida = querPerder ? pesoSelecionado <= metaPeso : pesoSelecionado >= metaPeso;

    async function handleSalvar() {
        setSalvando(true);
        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');
            if (!usuarioId) {
                Alert.alert('Erro', 'Usuário não identificado.');
                return;
            }

            const hoje = new Date().toISOString().split('T')[0]; 


            await updateUsuario(usuarioId, {
                pesoAtual: pesoSelecionado,
            });

            await createEvolucao({
                fkIdUser: parseInt(usuarioId),
                dataRegistro: hoje,
                pesoRegistrado: pesoSelecionado,
                metaProgresso: metaPeso,
            });

            Alert.alert('✅ Peso registrado!', `Seu peso de ${pesoSelecionado} kg foi salvo.`, [
                {
                    text: 'OK',
                    onPress: () => router.replace({
                        pathname: './Dashboard',
                        params: { refresh: Date.now() },
                    }),
                },
            ]);
        } catch (err) {
            console.error('Erro ao salvar peso:', err);
            Alert.alert('Erro', 'Não foi possível salvar o peso. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
                    <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitulo}>Registro de Peso</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.cardMeta}>
                    <View style={styles.cardMetaRow}>
                        <MaterialCommunityIcons name="target" size={20} color="#fff" />
                        <Text style={styles.cardMetaTitulo}>Meta de Peso</Text>
                    </View>
                    <View style={styles.cardMetaValores}>
                        <View>
                            <Text style={styles.cardMetaLabel}>Atual</Text>
                            <Text style={styles.cardMetaValor}>{pesoSelecionado}<Text style={styles.cardMetaKg}> kg</Text></Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.cardMetaLabel}>Alvo</Text>
                            <Text style={styles.cardMetaValor}>{metaPeso}<Text style={styles.cardMetaKg}> kg</Text></Text>
                        </View>
                    </View>
                    <View style={styles.progressoBg}>
                        <View style={[styles.progressoAtivo, { width: `${progresso}%` }]} />
                    </View>
                    <Text style={styles.cardMetaHint}>
                        {mantendo
    ? `⚖️ Mantendo peso: ${pesoSelecionado.toFixed(1)} kg`
    : metaAtingida
        ? '🎉 Você atingiu sua meta! Parabéns!'
        : `Faltam ${faltam} kg para atingir sua meta`}
                    </Text>
                </View>


                <Text style={styles.pergunta}>Qual é o seu peso hoje?</Text>
                <View style={styles.seletorRow}>
                    <TouchableOpacity style={styles.btnAjuste} onPress={decrementar} activeOpacity={0.7}>
                        <Text style={styles.btnAjusteTexto}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.pesoDisplay}>
                        <Text style={styles.pesoValor}>{pesoSelecionado.toFixed(1)}</Text>
                        <Text style={styles.pesoUnidade}>kg</Text>
                    </View>
                    <TouchableOpacity style={styles.btnAjuste} onPress={incrementar} activeOpacity={0.7}>
                        <Text style={styles.btnAjusteTexto}>+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.btnRegistrar, salvando && styles.btnRegistrarDisabled]}
                    onPress={handleSalvar}
                    disabled={salvando}
                    activeOpacity={0.85}
                >
                    {salvando
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.btnRegistrarTexto}>Registrar Peso</Text>
                    }
                </TouchableOpacity>

                <Text style={styles.secaoTitulo}>Histórico Recente</Text>
                {loadingHist ? (
                    <ActivityIndicator color="#2E7D32" style={{ marginTop: 20 }} />
                ) : historico.length === 0 ? (
                    <Text style={styles.semHistorico}>Nenhum registro encontrado.</Text>
                ) : (
                    historico.slice(0, 10).map((item, index) => {
                        const ehInicial = index === historico.length - 1;
                        const ultimo    = historico[historico.length - 1]?.pesoRegistrado ?? item.pesoRegistrado;
                        const diff      = item.pesoRegistrado - ultimo;
                        const subtext   = ehInicial
                            ? 'Peso inicial'
                            : diff === 0 ? 'Sem alteração'
                            : `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg desde o início`;

                        return (
                            <View key={item.idEvolucao} style={styles.cardHistorico}>
                                <View style={styles.cardHistoricoIcone}>
                                    <MaterialCommunityIcons name="calendar-clock" size={22} color="#2E7D32" />
                                </View>
                                <View style={styles.cardHistoricoInfo}>
                                    <Text style={styles.cardHistoricoData}>
                                        {formatarData(item.dataRegistro)}
                                    </Text>
                                    <Text style={[
                                        styles.cardHistoricoSub,
                                        !ehInicial && diff < 0 ? styles.subPositivo
                                            : !ehInicial && diff > 0 ? styles.subNegativo
                                            : styles.subNeutro,
                                    ]}>
                                        {subtext}
                                    </Text>
                                </View>
                                <Text style={styles.cardHistoricoPeso}>
                                    {parseFloat(item.pesoRegistrado).toFixed(1)} kg
                                </Text>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const VERDE      = '#2E7D32';
const VERDE_CLARO = '#A5D6A7';
const FUNDO      = '#f5f5f5';

const styles = StyleSheet.create({
    root:                 { flex: 1, backgroundColor: FUNDO },
    header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 54, paddingBottom: 16, backgroundColor: FUNDO },
    btnVoltar:            { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center' },
    headerTitulo:         { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
    scroll:               { paddingHorizontal: 20, paddingBottom: 40 },
    cardMeta:             { backgroundColor: VERDE, borderRadius: 22, padding: 20, marginBottom: 28, elevation: 4, shadowColor: VERDE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
    cardMetaRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
    cardMetaTitulo:       { fontSize: 16, fontWeight: '700', color: '#fff' },
    cardMetaValores:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    cardMetaLabel:        { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
    cardMetaValor:        { fontSize: 32, fontWeight: '800', color: '#fff' },
    cardMetaKg:           { fontSize: 14, fontWeight: '500', color: '#fff' },
    progressoBg:          { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    progressoAtivo:       { height: 8, backgroundColor: VERDE_CLARO, borderRadius: 4 },
    cardMetaHint:         { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: '500' },
    pergunta:             { fontSize: 20, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 24 },
    seletorRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 32 },
    btnAjuste:            { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center', elevation: 2 },
    btnAjusteTexto:       { fontSize: 28, fontWeight: '300', color: VERDE, lineHeight: 34 },
    pesoDisplay:          { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    pesoValor:            { fontSize: 68, fontWeight: '800', color: '#1a1a1a', lineHeight: 74 },
    pesoUnidade:          { fontSize: 22, fontWeight: '500', color: '#555', marginBottom: 10 },
    btnRegistrar:         { backgroundColor: VERDE, borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 36, elevation: 4, shadowColor: VERDE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    btnRegistrarDisabled: { opacity: 0.6 },
    btnRegistrarTexto:    { fontSize: 16, fontWeight: '700', color: '#fff' },
    secaoTitulo:          { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 14 },
    semHistorico:         { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 10 },
    cardHistorico:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
    cardHistoricoIcone:   { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    cardHistoricoInfo:    { flex: 1 },
    cardHistoricoData:    { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
    cardHistoricoSub:     { fontSize: 12, fontWeight: '500' },
    cardHistoricoPeso:    { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
    subPositivo:          { color: '#2E7D32' },
    subNegativo:          { color: '#E53935' },
    subNeutro:            { color: '#999' },
});