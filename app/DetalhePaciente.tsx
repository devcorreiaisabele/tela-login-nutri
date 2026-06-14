import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Animated, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getPlanosByUsuario } from '../src/services/planoService_1';
import { getUsuarioById } from '../src/services/usuarioService_1';

function CirculoCalorias({ consumidas, meta }: { consumidas: number; meta: number }) {
    const tamanho        = 190;
    const raio           = 76;
    const cx             = tamanho / 2;
    const cy             = tamanho / 2;
    const circunferencia = 2 * Math.PI * raio;
    const [pct, setPct]  = useState(0);
    const animado        = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animado, {
            toValue: Math.min(consumidas / (meta || 1), 1),
            duration: 1200, useNativeDriver: false,
        }).start();
        const id = animado.addListener(({ value }) => setPct(value));
        return () => animado.removeListener(id);
    }, [consumidas, meta]);

    const dash = pct * circunferencia;
    const gap  = circunferencia - dash;

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', width: tamanho, height: tamanho, alignSelf: 'center', marginVertical: 8 }}>
            <Svg width={tamanho} height={tamanho} style={{ position: 'absolute' }}>
                <Circle cx={cx} cy={cy} r={raio} stroke="#E5E7EB" strokeWidth={16} fill="none" />
                <Circle cx={cx} cy={cy} r={raio} stroke="#2E7D32" strokeWidth={16} fill="none"
                    strokeDasharray={`${dash} ${gap}`} strokeLinecap="round"
                    rotation="-90" origin={`${cx}, ${cy}`} />
            </Svg>
            <Text style={s.circuloValor}>{consumidas.toLocaleString('pt-BR')}</Text>
            <Text style={s.circuloSub}>kcal consumidas</Text>
        </View>
    );
}

function CardMetaPeso({ pesoAtual, metaPeso, pesoInicial }: { pesoAtual: number; metaPeso: number; pesoInicial: number }) {
    const perdido   = parseFloat((pesoInicial - pesoAtual).toFixed(1));
    const total     = Math.abs(pesoInicial - metaPeso);
    const progresso = total === 0 ? 100 : Math.min(Math.round((Math.abs(pesoInicial - pesoAtual) / total) * 100), 100);
    const largura   = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(largura, { toValue: progresso, duration: 1000, useNativeDriver: false }).start();
    }, [progresso]);

    return (
        <View style={s.card}>
            <View style={s.cardTituloRow}>
                <Text style={s.cardTitulo}>Progresso</Text>
                <View style={[s.badgePerdido, { backgroundColor: perdido >= 0 ? '#E8F5E9' : '#FEE2E2' }]}>
                    <Text style={[s.badgePerdidoTexto, { color: perdido >= 0 ? '#2E7D32' : '#EF4444' }]}>
                        {perdido >= 0 ? '-' : '+'}{Math.abs(perdido)} kg
                    </Text>
                </View>
            </View>
            <View style={s.pesosRow}>
                <View>
                    <Text style={s.pesoLabel}>Atual</Text>
                    <Text style={s.pesoValor}>{pesoAtual} <Text style={s.pesoKg}>kg</Text></Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#aaa" />
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.pesoLabel}>Meta</Text>
                    <Text style={s.pesoValor}>{metaPeso} <Text style={s.pesoKg}>kg</Text></Text>
                </View>
            </View>
            <View style={s.progressoBg}>
                <Animated.View style={[s.progressoAtivo, {
                    width: largura.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                }]} />
            </View>
        </View>
    );
}

export default function DetalhePaciente() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [paciente,    setPaciente]    = useState<any>(null);
    const [loading,     setLoading]     = useState(true);
    const [planoExiste, setPlanoExiste] = useState(false);
    const [planoId,     setPlanoId]     = useState<string | null>(null);

    useEffect(() => {
        const carregar = async () => {
            try {
                const dados = await getUsuarioById(id);
                setPaciente(dados);

                const planos = await getPlanosByUsuario(id);
                console.log('PLANOS:', JSON.stringify(planos));
                const planoAtivo = planos.find((p: any) => p.status === 'Ativo');
                console.log('PLANO ATIVO:', JSON.stringify(planoAtivo));
                if (planoAtivo) {
                    setPlanoExiste(true);
                    setPlanoId(planoAtivo.idPlano?.toString());
                }
            } catch (e) {
                console.error('Erro ao carregar paciente:', e);
            } finally {
                setLoading(false);
            }
        };
        if (id) carregar();
    }, [id]);

    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2E7D32" />
        </View>
    );

    if (!paciente) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Paciente não encontrado.</Text>
        </View>
    );

    const pesoAtual   = parseFloat(paciente.pesoAtual   ?? 0);
    const metaPeso    = parseFloat(paciente.pesoMeta    ?? 0);
    const pesoInicial = parseFloat(paciente.pesoInicial ?? pesoAtual);

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.btnVoltar}>
                    <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Desempenho Diário</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <View style={s.pacienteRow}>
                    <View style={s.avatarPlaceholder}>
                        <Ionicons name="person" size={30} color="#bbb" />
                    </View>
                    <View>
                        <Text style={s.pacienteNome}>{paciente.nomeCompleto}</Text>
                        <View style={s.objRow}>
                            <View style={[s.objDot, { backgroundColor: '#2E7D32' }]} />
                            <Text style={s.objTexto}>{paciente.objetivoSaude ?? 'Sem objetivo definido'}</Text>
                        </View>
                    </View>
                </View>

                <View style={s.card}>
                    <View style={s.cardTituloRow}>
                        <Text style={s.cardTitulo}>Resumo de Calorias</Text>
                        <View style={s.badge}><Text style={s.badgeTexto}>Hoje</Text></View>
                    </View>
                    <CirculoCalorias consumidas={paciente.caloriasDiarias ?? 2000} meta={paciente.caloriasDiarias ?? 2000} />
<Text style={s.metaDiaria}>Meta diária: <Text style={{ fontWeight: '800', color: '#111' }}>{(paciente.caloriasDiarias ?? 2000).toLocaleString('pt-BR')} kcal</Text></Text>
                </View>

                {pesoAtual > 0 && metaPeso > 0 && (
                    <>
                        <Text style={s.secaoTitulo}>Meta de Peso</Text>
                        <CardMetaPeso pesoAtual={pesoAtual} metaPeso={metaPeso} pesoInicial={pesoInicial} />
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root:               { flex: 1, backgroundColor: '#F5F7F5' },
    header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 54, paddingBottom: 12, backgroundColor: '#F5F7F5' },
    btnVoltar:          { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EBEBEB', justifyContent: 'center', alignItems: 'center' },
    headerTitulo:       { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
    scroll:             { paddingHorizontal: 20, paddingBottom: 24 },
    pacienteRow:        { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, marginTop: 4 },
    avatarPlaceholder:  { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8E8E8', justifyContent: 'center', alignItems: 'center' },
    pacienteNome:       { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 4 },
    objRow:             { flexDirection: 'row', alignItems: 'center', gap: 6 },
    objDot:             { width: 8, height: 8, borderRadius: 4 },
    objTexto:           { fontSize: 14, color: '#555' },
    card:               { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    cardTituloRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitulo:         { fontSize: 16, fontWeight: '800', color: '#111' },
    badge:              { backgroundColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
    badgeTexto:         { fontSize: 13, color: '#777', fontWeight: '500' },
    badgePerdido:       { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    badgePerdidoTexto:  { fontSize: 13, fontWeight: '800' },
    circuloValor:       { fontSize: 38, fontWeight: '900', color: '#111', textAlign: 'center' },
    circuloSub:         { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 2 },
    metaDiaria:         { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 12 },
    pesosRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 16 },
    pesoLabel:          { fontSize: 12, color: '#aaa', marginBottom: 4 },
    pesoValor:          { fontSize: 28, fontWeight: '800', color: '#111' },
    pesoKg:             { fontSize: 14, fontWeight: '500', color: '#888' },
    progressoBg:        { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
    progressoAtivo:     { height: 8, backgroundColor: '#2E7D32', borderRadius: 4 },
    secaoTitulo:        { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 14 },
    btnPlano:           { flexDirection: 'row', backgroundColor: '#2E7D32', borderRadius: 18, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 4, shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    btnPlanoTexto:      { fontSize: 16, fontWeight: '700', color: '#fff' },
});
