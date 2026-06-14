import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { globalStyles as style } from '../props/globalStyles';
import { getOuCriarPlanoUsuario, getReceitasDoPlano, removerReceitaDoPlano } from '../src/services/planoReceitaService';
import { getUsuarioById, updateUsuario } from '../src/services/usuarioService_1';

type Refeicao = {
    id: string;
    tipo: string;
    titulo: string | null;
    desc: string | null;
    imagem: string | null;
    idPlanoReceita?: number;
    receitaId?: number;
};

type Perfil = {
    id: number | null;
    peso_atual: number;
    meta_peso: number;
    peso_inicial: number;
    objetivo: string;
};

type Nutri = {
    proteina: number;
    ferro: number;
    vitB12: number;
    kcalGasto: number;
};

type UsuarioApi = {
    idUser?: number;
    id?: number;
    pesoAtual?: string | number;
    peso_atual?: string | number;
    pesoMeta?: string | number;
    metaPeso?: string | number;
    meta_peso?: string | number;
    pesoInicial?: string | number;
    peso_inicial?: string | number;
    objetivoSaude?: string;
    altura?: string | number;
    genero?: string;
    dataNascimento?: string;
    rotinaAtividade?: string;
};

const REFEICOES_INICIAL: Refeicao[] = [
    { id: '1', tipo: 'Café da Manhã', titulo: null, desc: null, imagem: null },
    { id: '2', tipo: 'Lanche',        titulo: null, desc: null, imagem: null },
    { id: '3', tipo: 'Almoço',        titulo: null, desc: null, imagem: null },
    { id: '4', tipo: 'Jantar',        titulo: null, desc: null, imagem: null },
];

function calcularProgresso(pesoAtual: number, metaPeso: number, pesoInicial: number): number {
    if (!pesoInicial || pesoInicial === metaPeso) return 0;
    const totalParaPerder = Math.abs(pesoInicial - metaPeso);
    const jaPercorrido    = Math.abs(pesoInicial - pesoAtual);
    return Math.min(Math.round((jaPercorrido / totalParaPerder) * 100), 100);
}

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

function fatorAtividade(rotina: string): number {
    const r = rotina.toLowerCase();
    if (r.includes('muito ativ') || r.includes('extrema')) return 1.9;
    if (r.includes('ativ')) return 1.725;
    if (r.includes('moderad')) return 1.55;
    if (r.includes('leve')) return 1.375;
    if (r.includes('sedentari') || r.includes('sedentár')) return 1.2;
    return 1.375;
}

function estimativaGasto(tmb: number, rotina: string): number {
    const r = rotina.toLowerCase();
    if (r.includes('atleta')) return Math.round(tmb * 0.7);
    if (r.includes('ativ'))   return Math.round(tmb * 0.5);
    return Math.round(tmb * 0.3);
}

type CirculoGastoProps = {
    valor: number;
    meta?: number;
};

function CirculoGasto({ valor, meta = 600 }: CirculoGastoProps) {
    const tamanho        = 74;
    const raio           = 30;
    const cx             = tamanho / 2;
    const cy             = tamanho / 2;
    const circunferencia = 2 * Math.PI * raio;

    const animado = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animado, {
            toValue: Math.min(valor / meta, 1),
            duration: 1200,
            useNativeDriver: false,
        }).start();
    }, [valor, meta]);

    const [pct, setPct] = useState(0);

    useEffect(() => {
        const id = animado.addListener(({ value }) => setPct(value));
        return () => animado.removeListener(id);
    }, [animado]);

    const dash = pct * circunferencia;
    const gap  = circunferencia - dash;

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', width: tamanho, height: tamanho, marginTop: 8 }}>
            <Svg width={tamanho} height={tamanho} style={{ position: 'absolute' }}>
                <Circle cx={cx} cy={cy} r={raio} stroke="rgba(255,255,255,0.2)" strokeWidth={6} fill="none" />
                <Circle
                    cx={cx} cy={cy} r={raio}
                    stroke="#A5D6A7" strokeWidth={6} fill="none"
                    strokeDasharray={`${dash} ${gap}`}
                    strokeLinecap="round" rotation="-90" origin={`${cx}, ${cy}`}
                />
            </Svg>
            <Text style={styles.circuloValor}>{valor}</Text>
            <Text style={styles.circuloUnidade}>Kcal</Text>
        </View>
    );
}

type BarraNutriProps = {
    label: string;
    valor: number;
    unidade: string;
    meta: number;
    cor: string;
    delay?: number;
};

function BarraNutri({ label, valor, unidade, meta, cor, delay = 0 }: BarraNutriProps) {
    const largura = useRef(new Animated.Value(0)).current;
    const opacidade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const pct = Math.min((valor / meta) * 100, 100);
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacidade, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.timing(largura, { toValue: pct, duration: 900, useNativeDriver: false }),
            ]),
        ]).start();
    }, [valor, meta]);

    return (
        <Animated.View style={[styles.nutriItem, { opacity: opacidade }]}>
            <Text style={styles.nutriTexto}>{valor}{unidade} {label}</Text>
            <View style={styles.barrinhaFundo}>
                <Animated.View
                    style={[styles.barrinhaAtiva, {
                        backgroundColor: cor,
                        width: largura.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                    }]}
                />
            </View>
        </Animated.View>
    );
}

export default function Dashboard() {
    const [selectedDate, setSelectedDate] = useState('Hoje, 15 Agosto');
    const [refeicoes, setRefeicoes]       = useState<Refeicao[]>(REFEICOES_INICIAL);
    const [modalRemover, setModalRemover] = useState<string | null>(null);
    const [kcalGasto, setKcalGasto]       = useState<number>(0);
    const [loadingPerfil, setLoadingPerfil] = useState(true);

    const [perfil, setPerfil] = useState<Perfil>({
        id: null, peso_atual: 0, meta_peso: 0, peso_inicial: 0, objetivo: '',
    });

    const [nutri] = useState<Nutri>({
        proteina: 45, ferro: 12, vitB12: 2.4, kcalGasto: 245,
    });

    const [metaKcal,  setMetaKcal]  = useState<number>(0);
    const [metaGasto, setMetaGasto] = useState<number>(600);

    useFocusEffect(
        useCallback(() => {
            const carregar = async () => {
                try {
                    const usuarioId = await AsyncStorage.getItem('usuarioId');
                    if (!usuarioId) return;

                    
                    try {
                        const plano = await getOuCriarPlanoUsuario(usuarioId);
                        const receitasDoPlano = await getReceitasDoPlano(plano.idPlano);

                        const refAtualizadas = REFEICOES_INICIAL.map(r => {
                            const encontrada = receitasDoPlano.find(
                                (pr: any) => pr.tipoRefeicao === r.tipo
                            );
                            if (encontrada) {
                                return {
                                    ...r,
                                    idPlanoReceita: encontrada.idPlanoReceita,
                                    receitaId: encontrada.fkIdReceita,
                                    titulo: encontrada.receitaTitulo,
                                    desc:   encontrada.receitaIngredientes,
                                    imagem: encontrada.receitaImagemUrl ?? null,
                                };
                            }
                            return r;
                        });
                        setRefeicoes(refAtualizadas);
                    } catch (e) {
                        console.log('Erro ao carregar receitas do plano:', e);
                    }

                  
                    const data: UsuarioApi = await getUsuarioById(usuarioId);
                    setPerfil({
                        id:           data.idUser ?? data.id ?? null,
                        peso_atual:   parseFloat(String(data.pesoAtual ?? data.peso_atual))   || 0,
                        meta_peso:    parseFloat(String(data.pesoMeta ?? data.metaPeso ?? data.meta_peso)) || 0,
                        peso_inicial: parseFloat(String(data.pesoInicial ?? data.peso_inicial)) || parseFloat(String(data.pesoAtual ?? data.peso_atual)) || 0,
                        objetivo:     String(data.objetivoSaude ?? '').toLowerCase(),
                    });

                    const pesoUser   = parseFloat(String(data.pesoAtual ?? data.peso_atual)) || 75;
                    const alturaUser = (parseFloat(String(data.altura)) || 1.68) * 100;
                    const generoUser = String(data.genero ?? 'Feminino');
                    const idadeUser  = data.dataNascimento ? calcularIdade(data.dataNascimento) : 28;
                    const rotinaUser = String(data.rotinaAtividade ?? '');

                    const tmb   = calcularTMB(pesoUser, alturaUser, idadeUser, generoUser);
                    const fator = fatorAtividade(rotinaUser);
                    const get   = Math.round(tmb * fator);
                    setMetaKcal(get);
                    setMetaGasto(get);
                    setKcalGasto(estimativaGasto(tmb, rotinaUser));
                    const idUser = perfil.id ?? parseInt(usuarioId!);
                    await updateUsuario(String(idUser), { caloriasDiarias: get });
                } catch (err) {
                    console.error('Erro ao buscar perfil:', err);
                    Alert.alert('Atenção', 'Não foi possível carregar seus dados de peso.');
                } finally {
                    setLoadingPerfil(false);
                }
            };

            setLoadingPerfil(true);
            carregar();
        }, [])
    );

    const { peso_atual, meta_peso, peso_inicial, objetivo } = perfil;
    const mantendo   = objetivo.includes('manter');
    const querPerder = meta_peso < peso_atual;
    const faltam     = Math.max(0, parseFloat((querPerder ? peso_atual - meta_peso : meta_peso - peso_atual).toFixed(1)));
    const progresso  = calcularProgresso(peso_atual, meta_peso, peso_atual);
    const metaAtingida = mantendo ? false : querPerder ? peso_atual <= meta_peso : peso_atual >= meta_peso;

    const handleChangeDate = () => {
        Alert.alert('Alterar Data', 'Selecione uma nova data', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Hoje',  onPress: () => setSelectedDate('Hoje, 15 Agosto') },
            { text: 'Ontem', onPress: () => setSelectedDate('Ontem, 14 Agosto') },
        ]);
    };

    const handleRemover = async (id: string) => {
        const refeicao = refeicoes.find(r => r.id === id);
        if (refeicao?.idPlanoReceita) {
            try {
                await removerReceitaDoPlano(refeicao.idPlanoReceita);
            } catch (e) {
                console.log('Erro ao remover receita do plano:', e);
            }
        }
        setRefeicoes(prev => prev.map(r =>
            r.id === id ? { ...r, titulo: null, desc: null, imagem: null, idPlanoReceita: undefined } : r
        ));
        setModalRemover(null);
    };

    const irParaRegistroPeso = () => {
        if (metaAtingida) {
            router.push({ pathname: './Metaatingida', params: { peso_atual: String(peso_atual), meta_peso: String(meta_peso), peso_inicial: String(peso_inicial), objetivo: String(objetivo) } });
        } else {
            router.push({ pathname: './RegistroPeso', params: { peso_atual: String(peso_atual), meta_peso: String(meta_peso), peso_inicial: String(peso_inicial), objetivo: String(objetivo) } });
        }
    };

    const nutrientes = [
        { label: 'Proteína', valor: nutri.proteina, unidade: 'g',  meta: 80, cor: '#7B1FA2', delay: 0   },
        { label: 'Ferro',    valor: nutri.ferro,    unidade: 'mg', meta: 18, cor: '#E53935', delay: 150 },
        { label: 'Vit B12',  valor: nutri.vitB12,   unidade: 'μg', meta: 4,  cor: '#FDD835', delay: 300 },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
            <Modal visible={modalRemover !== null} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalIcone}>
                            <Ionicons name="trash-outline" size={30} color="#E53935" />
                        </View>
                        <Text style={styles.modalTitulo}>Remover Receita?</Text>
                        <Text style={styles.modalDesc}>
                            Tem certeza que deseja remover esta receita do seu plano alimentar? Você poderá adicioná-la novamente depois.
                        </Text>
                        <TouchableOpacity style={styles.modalBtnRemover} onPress={() => modalRemover && handleRemover(modalRemover)}>
                            <Text style={styles.modalBtnRemoverTexto}>Sim, remover</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalRemover(null)}>
                            <Text style={styles.modalBtnCancelar}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerData}>{selectedDate}</Text>
                    <TouchableOpacity onPress={handleChangeDate}>
                        <Text style={styles.headerAlterar}>Alterar data</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cardCalorias} activeOpacity={0.85} onPress={() => router.push('./CalculoCalorias')}>
                    <View style={styles.cardCaloriasRow}>
                        <MaterialCommunityIcons name="fire" size={28} color="#ffffff" />
                        {loadingPerfil ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.cardCaloriasValor}>
                                {metaKcal.toLocaleString('pt-BR')} <Text style={styles.cardCaloriasUnidade}>Kcal</Text>
                            </Text>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#aaa" />
                </TouchableOpacity>

                <View style={styles.cardDuplo}>
                    <View style={styles.cardConsumo}>
                        <Text style={styles.cardConsumoTitulo}>Consumo</Text>
                        <Text style={styles.cardConsumoSub}>Foco nutricional{'\n'}diário</Text>
                        {nutrientes.map((n) => (
                            <BarraNutri key={n.label} label={n.label} valor={n.valor} unidade={n.unidade} meta={n.meta} cor={n.cor} delay={n.delay} />
                        ))}
                    </View>
                    <View style={styles.colunaGasto}>
                        <View style={styles.cardGasto}>
                            <Text style={styles.cardGastoTitulo}>Gasto</Text>
                            <CirculoGasto valor={kcalGasto} meta={metaGasto} />
                        </View>
                        <TouchableOpacity style={styles.cardMais} activeOpacity={0.8} onPress={() => router.push('./MaisDetalhes')}>
                            <Text style={styles.maisBtnTexto}>Mais</Text>
                            <Ionicons name="chevron-forward" size={14} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={irParaRegistroPeso}>
                    {loadingPerfil ? (
                        <ActivityIndicator color="#fff" style={{ paddingVertical: 20 }} />
                    ) : (
                        <>
                            <View style={styles.metaRow}>
                                <MaterialCommunityIcons name="target" size={20} color="#ffffff" />
                                <Text style={styles.cardTitulo}>Meta de Peso</Text>
                                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" style={{ marginLeft: 'auto' }} />
                            </View>
                            <View style={styles.metaValores}>
                                <View>
                                    <Text style={styles.metaLabel}>Atual</Text>
                                    <Text style={styles.metaValor}>{peso_atual.toFixed(1)}<Text style={styles.metaKg}> kg</Text></Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.metaLabel}>Alvo</Text>
                                    <Text style={styles.metaValor}>{meta_peso.toFixed(1)}<Text style={styles.metaKg}> kg</Text></Text>
                                </View>
                            </View>
                            <View style={styles.progressoBg}>
                                <View style={[styles.progressoAtivo, { width: `${progresso}%` }]} />
                            </View>
                            <Text style={styles.metaHint}>
                                {mantendo ? '⚖️ Mantendo peso' : metaAtingida ? '🎉 Você atingiu sua meta!' : `Faltam ${faltam} kg para atingir sua meta`}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.secaoTitulo}>Pratos Escolhidos (Receitas)</Text>

               {refeicoes.map((r) => (
    <View key={r.id}>
        <Text style={styles.refeicaoTipo}>{r.tipo}</Text>
        {r.titulo ? (
    <View style={styles.cardRefeicaoWrapper}>
        <TouchableOpacity
            style={styles.cardRefeicao}
            activeOpacity={0.9}
            onPress={() => r.receitaId && router.push({ pathname: './DetalheReceita', params: { id: String(r.receitaId) } })}
        >
            <Image source={{ uri: r.imagem ?? undefined }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <TouchableOpacity style={styles.refeicaoIconeRefresh} onPress={() => router.push({ pathname: './EscolherReceita', params: { refeicao: r.tipo } })}>
                <Ionicons name="refresh" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.refeicaoIconeLixo} onPress={() => setModalRemover(r.id)}>
                <Ionicons name="trash-outline" size={16} color="#fff" />
            </TouchableOpacity>
            <View style={styles.cardRefeicaoOverlay}>
                <Text style={styles.cardRefeicaoTitulo}>{r.titulo}</Text>
                <Text style={styles.cardRefeicaoDesc}>{r.desc}</Text>
            </View>
        </TouchableOpacity>
    </View>
) : (
                            <TouchableOpacity style={styles.cardVazio} activeOpacity={0.7} onPress={() => router.push({ pathname: './EscolherReceita', params: { refeicao: r.tipo } })}>
                                <View style={styles.cardVazioIcone}>
                                    <Ionicons name="add" size={30} color="#ffffff" />
                                </View>
                                <Text style={styles.cardVazioTexto}>Adicionar sugestão de receita</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </ScrollView>

            <View style={style.tabBar}>
                <TouchableOpacity style={style.tabItem} onPress={() => router.push('./Receitas')}>
                    <MaterialCommunityIcons name="food-fork-drink" size={24} color="#999" />
                    <Text style={styles.tabTexto}>Receitas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.tabItemAtivo}>
                    <Ionicons name="grid" size={24} color="#2E7D32" />
                    <Text style={style.tabTextoAtivo}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.tabItem} onPress={() => router.push('./Perfil')}>
                    <Ionicons name="person-outline" size={24} color="#999" />
                    <Text style={styles.tabTexto}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root:                  { flex: 1, backgroundColor: '#2E7D32' },
    scroll:                { paddingBottom: 110 },
    header:                { alignItems: 'center', paddingTop: 56, paddingBottom: 20 },
    headerData:            { fontSize: 22, fontWeight: '800', color: '#fff' },
    headerAlterar:         { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    cardCalorias:          { marginHorizontal: 18, backgroundColor: '#3E854D', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, elevation: 3 },
    cardCaloriasRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardCaloriasValor:     { fontSize: 28, fontWeight: '800', color: '#ffffff' },
    cardCaloriasUnidade:   { fontSize: 16, fontWeight: '500', color: '#ffffff' },
    cardDuplo:             { flexDirection: 'row', marginHorizontal: 18, gap: 12, marginBottom: 14 },
    cardConsumo:           { flex: 1.1, backgroundColor: '#3E854D', borderRadius: 20, padding: 16, elevation: 3 },
    cardConsumoTitulo:     { fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
    cardConsumoSub:        { fontSize: 11, color: '#ffffff', marginBottom: 12, lineHeight: 15 },
    nutriItem:             { marginBottom: 10 },
    nutriTexto:            { fontSize: 12, color: '#ffffff', fontWeight: '600', marginBottom: 4 },
    barrinhaFundo:         { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
    barrinhaAtiva:         { height: 5, borderRadius: 3 },
    colunaGasto:           { flex: 1, gap: 12 },
    cardGasto:             { flex: 1, backgroundColor: '#3E854D', borderRadius: 20, padding: 14, alignItems: 'center', justifyContent: 'space-between', elevation: 3 },
    cardGastoTitulo:       { fontSize: 14, fontWeight: '700', color: '#ffffff', alignSelf: 'flex-start' },
    circuloValor:          { fontSize: 20, fontWeight: '800', color: '#ffffff' },
    circuloUnidade:        { fontSize: 10, color: '#ffffff' },
    cardMais:              { backgroundColor: '#3E854D', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 3 },
    maisBtnTexto:          { fontSize: 14, fontWeight: '600', color: '#ffffff' },
    card:                  { marginHorizontal: 18, backgroundColor: '#3E854D', borderRadius: 20, padding: 18, marginBottom: 14, elevation: 3 },
    cardTitulo:            { fontSize: 15, fontWeight: '700', color: '#ffffff', marginLeft: 6 },
    metaRow:               { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    metaValores:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    metaLabel:             { fontSize: 12, color: '#ffffff', marginBottom: 2 },
    metaValor:             { fontSize: 30, fontWeight: '800', color: '#ffffff' },
    metaKg:                { fontSize: 14, color: '#ffffff', fontWeight: '500' },
    progressoBg:           { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
    progressoAtivo:        { height: 8, backgroundColor: '#A5D6A7', borderRadius: 4 },
    metaHint:              { fontSize: 12, color: '#ffffff', textAlign: 'center' },
    secaoTitulo:           { fontSize: 19, fontWeight: '800', color: '#fff', marginHorizontal: 18, marginTop: 8, marginBottom: 16 },
    refeicaoTipo:          { fontSize: 14, fontWeight: '700', color: '#fff', marginHorizontal: 18, marginBottom: 10 },
    cardRefeicao:           { flex: 1 },
    cardRefeicaoWrapper: { marginHorizontal: 18, borderRadius: 20, overflow: 'hidden', height: 160, marginBottom: 20 },
    refeicaoIconeRefresh:  { position: 'absolute', top: 12, right: 54, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgb(0,0,0)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    refeicaoIconeLixo:     { position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(220,50,50,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    cardRefeicaoOverlay:   { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.38)' },
    cardRefeicaoTitulo:    { fontSize: 17, fontWeight: '800', color: '#fff' },
    cardRefeicaoDesc:      { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
    cardVazio:             { marginHorizontal: 18, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', borderStyle: 'dashed', height: 110, justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 },
    cardVazioIcone:        { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
    cardVazioTexto:        { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
    tabTexto:              { fontSize: 12, color: '#999', fontWeight: '500', marginTop: 3 },
    modalOverlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    modalBox:              { backgroundColor: '#fff', borderRadius: 28, padding: 28, alignItems: 'center', width: '100%' },
    modalIcone:            { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    modalTitulo:           { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 12 },
    modalDesc:             { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    modalBtnRemover:       { width: '100%', backgroundColor: '#E53935', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 14 },
    modalBtnRemoverTexto:  { color: '#fff', fontSize: 16, fontWeight: '700' },
    modalBtnCancelar:      { fontSize: 15, fontWeight: '600', color: '#555' },
});