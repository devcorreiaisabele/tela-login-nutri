import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator, Alert, Image, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { globalStyles as style } from '../props/globalStyles';
import { escolherEFazerUploadFoto } from '../src/services/storageService';
import { deleteUsuario, getUsuarioById, updateUsuario } from '../src/services/usuarioService_1';
import { getVinculoAtivoByUsuario } from '../src/services/vinculoService_1';

interface NutricionistaVinculada {
    id: string;
    nome: string;
    especialidade: string;
    foto?: string | null;
}

const GENEROS = ['MASCULINO', 'FEMININO', 'OUTRO'];

export default function Perfil() {
    const [usuario,        setUsuario]       = useState<any>(null);
    const [nutricionista,  setNutricionista] = useState<NutricionistaVinculada | null>(null);
    const [loading,        setLoading]       = useState(true);
    const [enviandoFoto,   setEnviandoFoto]  = useState(false);
    const [editandoGenero, setEditandoGenero] = useState(false);
    const [salvandoGenero, setSalvandoGenero] = useState(false);

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, []),
    );

    async function carregarDados() {
        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');
            if (!usuarioId) return;
            const usuarioApi = await getUsuarioById(usuarioId);
            setUsuario(usuarioApi);

            const vinculoAtivo = await getVinculoAtivoByUsuario(usuarioId);
            if (vinculoAtivo) {
                setNutricionista({
                    id: vinculoAtivo.fkIdNutri?.toString(),
                    nome: vinculoAtivo.nutricionistaNome,
                    especialidade: vinculoAtivo.nutricionistaEspecialidade,
                    foto: null,
                });
            } else {
                setNutricionista(null);
            }
        } catch (e) {
            console.log('Erro ao carregar:', e);
        } finally {
            setLoading(false);
        }
    }

    async function alterarFoto() {
        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');
            if (!usuarioId) return;
            setEnviandoFoto(true);
            const url = await escolherEFazerUploadFoto('usuarios', usuarioId);
            if (!url) { setEnviandoFoto(false); return; }
            await updateUsuario(usuarioId, { fotoUrl: url });
            setUsuario((prev: any) => ({ ...prev, fotoUrl: url }));
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível atualizar a foto. Tente novamente.');
        } finally {
            setEnviandoFoto(false);
        }
    }

    async function salvarGenero(genero: string) {
    setSalvandoGenero(true);
    try {
        const usuarioId = await AsyncStorage.getItem('usuarioId');
        if (!usuarioId) return;
        await updateUsuario(usuarioId, { genero });
        await carregarDados();
        setEditandoGenero(false);
    } catch {
        Alert.alert('Erro', 'Não foi possível salvar o gênero. Tente novamente.');
    } finally {
        setSalvandoGenero(false);
    }
}

    async function sairDaConta() {
        Alert.alert('Sair', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair', style: 'destructive', onPress: async () => {
                    await AsyncStorage.clear();
                    router.replace('./login');
                },
            },
        ]);
    }

    async function deletarConta() {
        Alert.alert('Deletar Conta', 'Tem certeza? Esta ação é irreversível!', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Deletar', style: 'destructive', onPress: async () => {
                    try {
                        const usuarioId = await AsyncStorage.getItem('usuarioId');
                        if (usuarioId) await deleteUsuario(usuarioId);
                        await AsyncStorage.clear();
                        router.replace('./login');
                    } catch {
                        Alert.alert('Erro', 'Não foi possível deletar a conta.');
                    }
                },
            },
        ]);
    }

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
        </View>
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <Text style={styles.headerTitulo}>Conta</Text>

                <View style={styles.fotoSection}>
                    <View style={styles.fotoWrapper}>
                        <View style={styles.fotoCirculo}>
                            {usuario?.fotoUrl ? (
                                <Image source={{ uri: usuario.fotoUrl }} style={styles.fotoImagem} />
                            ) : (
                                <Ionicons name="person" size={50} color="#ccc" />
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.fotoIcone}
                            onPress={alterarFoto}
                            disabled={enviandoFoto}
                            activeOpacity={0.8}
                        >
                            {enviandoFoto ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="camera" size={16} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.nomeTexto}>{usuario?.nomeCompleto ?? usuario?.nome ?? '---'}</Text>
                    <View style={styles.planoBadge}>
                        <Text style={styles.planoTexto}>Nutri+ Basic</Text>
                    </View>
                </View>

                <Text style={styles.secaoLabel}>INFORMAÇÕES PESSOAIS</Text>
                <View style={styles.card}>
                    <View style={styles.campoRow}>
                        <View>
                            <Text style={styles.campoLabel}>Nome Completo</Text>
                            <Text style={styles.campoValor}>{usuario?.nomeCompleto ?? usuario?.nome ?? '---'}</Text>
                        </View>
                    </View>

                    <View style={styles.divisor} />

                    <View style={styles.campoRow}>
                        <View>
                            <Text style={styles.campoLabel}>Data de Nascimento</Text>
                            <Text style={styles.campoValor}>{usuario?.dataNascimento ?? '---'}</Text>
                        </View>
                    </View>

                    <View style={styles.divisor} />

                    {editandoGenero ? (
                        <View style={styles.edicaoBox}>
                            <Text style={styles.campoLabel}>Gênero</Text>
                            {GENEROS.map(g => (
                                <TouchableOpacity
                                    key={g}
                                    style={[
                                        styles.generoOpcao,
                                        usuario?.genero === g && styles.generoOpcaoAtiva,
                                    ]}
                                    onPress={() => salvarGenero(g)}
                                    disabled={salvandoGenero}
                                >
                                    {salvandoGenero && usuario?.genero === g ? (
                                        <ActivityIndicator size="small" color="#2E7D32" />
                                    ) : (
                                        <Text style={[
                                            styles.generoOpcaoTexto,
                                            usuario?.genero === g && styles.generoOpcaoTextoAtivo,
                                        ]}>{g}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={styles.btnCancelar} onPress={() => setEditandoGenero(false)}>
                                <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.campoRow}>
                            <View>
                                <Text style={styles.campoLabel}>Gênero</Text>
                                <Text style={styles.campoValor}>{usuario?.genero ?? '---'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setEditandoGenero(true)}>
                                <Ionicons name="pencil-outline" size={18} color="#aaa" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.divisor} />

                    <View style={styles.campoRow}>
                        <View>
                            <Text style={styles.campoLabel}>E-mail</Text>
                            <Text style={styles.campoValor}>{usuario?.email ?? '---'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('./AlterarEmail')}>
                            <Ionicons name="pencil-outline" size={18} color="#aaa" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divisor} />

                    <View style={styles.campoRow}>
                        <View>
                            <Text style={styles.campoLabel}>Senha</Text>
                            <Text style={styles.campoValor}>••••••••</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('./RedefinirSenha')}>
                            <Ionicons name="pencil-outline" size={18} color="#aaa" />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.secaoLabel}>ACOMPANHAMENTO PROFISSIONAL</Text>

                {nutricionista ? (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.75}
                        onPress={() => router.push({
                            pathname: './DesvincularNutricionista',
                            params: {
                                nutriId:    nutricionista.id,
                                nutriNome:  nutricionista.nome,
                                nutriEspec: nutricionista.especialidade,
                                nutriCrn:   '',
                                nutriFoto:  nutricionista.foto ?? '',
                            },
                        })}
                    >
                        <View style={styles.nutriVinculadaRow}>
                            <View style={styles.avatarWrapper}>
                                {nutricionista.foto ? (
                                    <Image source={{ uri: nutricionista.foto }} style={styles.avatarImg} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Ionicons name="person" size={26} color="#2E7D32" />
                                    </View>
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.nutriVinculadaNome}>{nutricionista.nome}</Text>
                                <Text style={styles.nutriVinculadaDesc}>Nutricionista Vinculada</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#aaa" />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.card}>
                        <View style={styles.nutriRow}>
                            <View style={styles.nutriIcone}>
                                <MaterialCommunityIcons name="stethoscope" size={24} color="#2E7D32" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.nutriTitulo}>Vincular Nutricionista</Text>
                                <Text style={styles.nutriDesc}>
                                    Compartilhe seus dados para um acompanhamento guiado.
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.nutriAddBtn}
                                onPress={() => router.push('./Vincularnutricionista')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.btnSair} onPress={sairDaConta}>
                    <Ionicons name="log-out-outline" size={20} color="#E53935" />
                    <Text style={styles.btnSairTexto}>Sair da Conta</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnDeletar} onPress={deletarConta}>
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                    <Text style={styles.btnDeletarTexto}>Deletar Conta</Text>
                </TouchableOpacity>

            </ScrollView>

            <View style={style.tabBar}>
                <TouchableOpacity style={style.tabItem} onPress={() => router.push('./Receitas')}>
                    <MaterialCommunityIcons name="food-fork-drink" size={24} color="#999" />
                    <Text style={styles.tabTexto}>Receitas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.tabItem} onPress={() => router.push('./Dashboard')}>
                    <Ionicons name="grid-outline" size={24} color="#999" />
                    <Text style={styles.tabTexto}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.tabItemAtivo}>
                    <Ionicons name="person" size={24} color="#2E7D32" />
                    <Text style={style.tabTextoAtivo}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root:                  { flex: 1, backgroundColor: '#F5F5F5' },
    loadingContainer:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll:                { paddingBottom: 110 },
    headerTitulo:          { fontSize: 18, fontWeight: '700', color: '#111', textAlign: 'center', paddingTop: 56, marginBottom: 24 },
    fotoSection:           { alignItems: 'center', marginBottom: 28 },
    fotoWrapper:           { position: 'relative', marginBottom: 12 },
    fotoCirculo:           { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    fotoImagem:            { width: 90, height: 90, borderRadius: 45 },
    fotoIcone:             { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
    nomeTexto:             { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 8 },
    planoBadge:            { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
    planoTexto:            { color: '#2E7D32', fontWeight: '700', fontSize: 13 },
    secaoLabel:            { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 1, marginHorizontal: 18, marginBottom: 10, marginTop: 8 },
    card:                  { marginHorizontal: 18, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    campoRow:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
    campoLabel:            { fontSize: 12, color: '#aaa', marginBottom: 2 },
    campoValor:            { fontSize: 15, fontWeight: '600', color: '#111' },
    divisor:               { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
    edicaoBox:             { paddingVertical: 10 },
    generoOpcao:           { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8, alignItems: 'center' },
    generoOpcaoAtiva:      { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
    generoOpcaoTexto:      { fontSize: 15, fontWeight: '600', color: '#555' },
    generoOpcaoTextoAtivo: { color: '#2E7D32' },
    btnCancelar:           { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
    btnCancelarTexto:      { fontSize: 14, fontWeight: '600', color: '#888' },
    nutriRow:              { flexDirection: 'row', alignItems: 'center', gap: 12 },
    nutriIcone:            { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
    nutriTitulo:           { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
    nutriDesc:             { fontSize: 12, color: '#888', lineHeight: 17 },
    nutriAddBtn:           { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
    nutriVinculadaRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarWrapper:         { width: 52, height: 52, borderRadius: 26, overflow: 'hidden' },
    avatarImg:             { width: 52, height: 52 },
    avatarPlaceholder:     { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
    nutriVinculadaNome:    { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 3 },
    nutriVinculadaDesc:    { fontSize: 12, color: '#888' },
    btnSair:               { marginHorizontal: 18, borderWidth: 1.5, borderColor: '#E53935', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 14 },
    btnSairTexto:          { color: '#E53935', fontSize: 15, fontWeight: '700' },
    btnDeletar:            { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10 },
    btnDeletarTexto:       { color: '#E53935', fontSize: 14, fontWeight: '600' },
    tabTexto:              { fontSize: 12, color: '#999', fontWeight: '500', marginTop: 3 },
});