import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import { updateUsuario } from '../src/services/usuarioService_1';

type OpcaoLib = 'ionicons' | 'material';

interface Opcao {
    id: string;
    titulo: string;
    desc: string;
    icone: string;
    lib: OpcaoLib;
}

const OPCOES: Opcao[] = [
    {
        id: 'perder',
        titulo: 'Perder Peso',
        desc: 'Reduzir o percentual de gordura e medidas corporais.',
        icone: 'trending-down',
        lib: 'ionicons',
    },
    {
        id: 'manter',
        titulo: 'Manter o Peso',
        desc: 'Manter o peso atual focando em hábitos saudáveis.',
        icone: 'scale-balance',
        lib: 'material',
    },
    {
        id: 'ganhar',
        titulo: 'Ganhar Massa',
        desc: 'Aumentar volume muscular e melhorar a força.',
        icone: 'barbell-outline',
        lib: 'ionicons',
    },
];

export default function AlterarMeta() {
    const params = useLocalSearchParams<{ peso_atual?: string }>();
    const peso_atual = parseFloat(params.peso_atual ?? '0') || 0;

    const [selecionado, setSelecionado] = useState<string | null>(null);
    const [salvando, setSalvando]       = useState<boolean>(false);
    const [pesoMeta, setPesoMeta]       = useState<number>(peso_atual || 68);

    const handleSalvar = async (): Promise<void> => {
        if (!selecionado) {
            Alert.alert('Atenção', 'Selecione uma meta antes de continuar.');
            return;
        }

        setSalvando(true);
        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');
            if (usuarioId) {
                await updateUsuario(usuarioId, { 
                objetivoSaude: selecionado, 
                pesoMeta: Number(pesoMeta), 
                });
            }

            Alert.alert('Meta atualizada!', 'Seu plano alimentar será atualizado.', [
                {
                    text: 'OK',
                    onPress: () =>
                        router.replace({ pathname: './Dashboard', params: { refresh: Date.now() } }),
                },
            ]);
        } catch (err) {
            console.error('Erro ao salvar meta:', err);
            Alert.alert('Erro', 'Não foi possível salvar a meta. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#f0f2ee" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
                    <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitulo}>Mudar Meta</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <Text style={styles.titulo}>Qual é a sua{'\n'}nova meta?</Text>
                <Text style={styles.subtitulo}>
                    Escolha o seu próximo objetivo para{'\n'}atualizarmos o seu plano alimentar.
                </Text>

                <View style={styles.opcoes}>
                    {OPCOES.map((op) => {
                        const ativo = selecionado === op.id;
                        return (
                            <TouchableOpacity
                                key={op.id}
                                style={[styles.cardOpcao, ativo && styles.cardOpcaoAtivo]}
                                activeOpacity={0.8}
                                onPress={() => setSelecionado(op.id)}
                            >
                                <View style={[styles.iconeWrapper, ativo && styles.iconeWrapperAtivo]}>
                                    {op.lib === 'material' ? (
                                        <MaterialCommunityIcons
                                            name={op.icone as any}
                                            size={26}
                                            color={ativo ? '#fff' : '#2E7D32'}
                                        />
                                    ) : (
                                        <Ionicons
                                            name={op.icone as any}
                                            size={26}
                                            color={ativo ? '#fff' : '#2E7D32'}
                                        />
                                    )}
                                </View>

                                <View style={styles.cardOpcaoTexto}>
                                    <Text style={styles.cardOpcaoTitulo}>{op.titulo}</Text>
                                    <Text style={styles.cardOpcaoDesc}>{op.desc}</Text>
                                </View>

                                <View style={[styles.radio, ativo && styles.radioAtivo]}>
                                    {ativo && <Ionicons name="checkmark" size={14} color="#fff" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.pesoCard}>
                    <Text style={styles.pesoLabel}>QUAL PESO VOCÊ QUER ATINGIR?</Text>
                    <View style={styles.pesoControle}>
                        <TouchableOpacity
                            style={styles.pesoBotao}
                            onPress={() => setPesoMeta(p => Math.max(30, p - 1))}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="remove" size={22} color="#2E7D32" />
                        </TouchableOpacity>
                        <View style={styles.pesoValorWrapper}>
                            <Text style={styles.pesoValor}>{pesoMeta}</Text>
                            <Text style={styles.pesoUnidade}>kg</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.pesoBotao}
                            onPress={() => setPesoMeta(p => Math.min(300, p + 1))}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={22} color="#2E7D32" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.pesoHint}>Use os botões para ajustar o seu peso alvo</Text>
                </View>
                </ScrollView>

            <View style={styles.rodape}>
                <TouchableOpacity
                    style={[styles.btnSalvar, salvando && { opacity: 0.6 }]}
                    onPress={handleSalvar}
                    disabled={salvando}
                    activeOpacity={0.85}
                >
                    {salvando
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.btnSalvarTexto}>Salvar Nova Meta</Text>
                    }
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root:               { flex: 1, backgroundColor: '#f0f2ee' },
    header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 54, paddingBottom: 12, backgroundColor: '#f0f2ee' },
    btnVoltar:          { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    headerTitulo:       { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
    scroll:             { paddingHorizontal: 22, paddingBottom: 120 },
    titulo:             { fontSize: 34, fontWeight: '900', color: '#1a1a1a', lineHeight: 40, marginTop: 24, marginBottom: 12 },
    subtitulo:          { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 36 },
    opcoes:             { gap: 14 },
    cardOpcao:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: 'transparent', gap: 14 },
    cardOpcaoAtivo:     { backgroundColor: '#EEF5EC', borderColor: '#2E7D32' },
    iconeWrapper:       { width: 52, height: 52, borderRadius: 14, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
    iconeWrapperAtivo:  { backgroundColor: '#2E7D32' },
    cardOpcaoTexto:     { flex: 1 },
    cardOpcaoTitulo:    { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
    cardOpcaoDesc:      { fontSize: 13, color: '#666', lineHeight: 18 },
    radio:              { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    radioAtivo:         { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    rodape:             { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: '#f0f2ee' },
    btnSalvar:          { backgroundColor: '#2E7D32', borderRadius: 30, paddingVertical: 18, alignItems: 'center' },
    btnSalvarTexto:     { fontSize: 16, fontWeight: '700', color: '#fff' },
    pesoCard:           { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 14, gap: 16 },
    pesoLabel:          { fontSize: 12, fontWeight: '700', color: '#555', letterSpacing: 1 },
    pesoControle:       { flexDirection: 'row', alignItems: 'center', gap: 32 },
    pesoBotao:          { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
    pesoValorWrapper:   { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    pesoValor:          { fontSize: 72, fontWeight: '900', color: '#1a1a1a', lineHeight: 80 },
    pesoUnidade:        { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
    pesoHint:           { fontSize: 13, color: '#999' },
});
