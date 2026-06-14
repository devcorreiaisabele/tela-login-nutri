import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet,
    Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { deleteNutricionista, getNutricionistaById, updateNutricionista } from '../src/services/nutricionistaService_1';
import { escolherEFazerUploadFoto } from '../src/services/storageService';

type Perfil = {
    nomeCompleto: string;
    emailProfissional: string;
    crn: string;
    uf: string;
    especialidadePrincipal: string;
    biografia: string;
    fotoUrl: string | null;
};

export default function PerfilNutricionista() {
    const [perfil, setPerfil] = useState<Perfil>({
        nomeCompleto: '',
        emailProfissional: '',
        crn: '',
        uf: '',
        especialidadePrincipal: '',
        biografia: '',
        fotoUrl: null,
    });
    const [editandoCampo, setEditandoCampo] = useState<'nome' | 'biografia' | null>(null);
    const [valorEditando, setValorEditando] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [enviandoFoto, setEnviandoFoto] = useState(false);

    useFocusEffect(
        useCallback(() => {
            async function carregar() {
                try {
                    const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
                    if (!nutricionistaId) return;
                    const p = await getNutricionistaById(nutricionistaId);
                    setPerfil({
                        nomeCompleto:           p.nomeCompleto          ?? '',
                        emailProfissional:      p.emailProfissional     ?? '',
                        crn:                    p.crn                   ?? '',
                        uf:                     p.uf                    ?? '',
                        especialidadePrincipal: p.especialidadePrincipal ?? '',
                        biografia:              p.biografia             ?? '',
                        fotoUrl:                p.fotoUrl               ?? null,
                    });
                    await AsyncStorage.setItem('nutricionistaPerfil', JSON.stringify(p));
                } catch {
                    const raw = await AsyncStorage.getItem('nutricionistaPerfil');
                    if (raw) {
                        const p = JSON.parse(raw);
                        setPerfil({
                            nomeCompleto:           p.nomeCompleto          ?? '',
                            emailProfissional:      p.emailProfissional     ?? '',
                            crn:                    p.crn                   ?? '',
                            uf:                     p.uf                    ?? '',
                            especialidadePrincipal: p.especialidadePrincipal ?? '',
                            biografia:              p.biografia             ?? '',
                            fotoUrl:                p.fotoUrl               ?? null,
                        });
                    }
                }
            }
            carregar();
        }, []),
    );

    function abrirEdicao(campo: 'nome' | 'biografia') {
        setValorEditando(campo === 'nome' ? perfil.nomeCompleto : perfil.biografia);
        setEditandoCampo(campo);
    }

    function cancelarEdicao() {
        setEditandoCampo(null);
        setValorEditando('');
    }

    async function salvarEdicao() {
        if (!valorEditando.trim()) {
            Alert.alert('Atenção', 'O campo não pode ficar vazio.');
            return;
        }
        setSalvando(true);
        try {
            const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
            if (!nutricionistaId) return;
            const dados = editandoCampo === 'nome'
                ? { nomeCompleto: valorEditando.trim() }
                : { biografia: valorEditando.trim() };
            await updateNutricionista(nutricionistaId, dados);
            setPerfil(prev => ({
                ...prev,
                ...(editandoCampo === 'nome'
                    ? { nomeCompleto: valorEditando.trim() }
                    : { biografia: valorEditando.trim() }),
            }));
            setEditandoCampo(null);
            setValorEditando('');
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    }

    async function alterarFoto() {
        try {
            const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
            if (!nutricionistaId) return;

            setEnviandoFoto(true);
            const url = await escolherEFazerUploadFoto('nutricionistas', nutricionistaId);
            if (!url) {
                setEnviandoFoto(false);
                return;
            }

            await updateNutricionista(nutricionistaId, { fotoUrl: url });
            setPerfil(prev => ({ ...prev, fotoUrl: url }));

            const raw = await AsyncStorage.getItem('nutricionistaPerfil');
            if (raw) {
                const p = JSON.parse(raw);
                p.fotoUrl = url;
                await AsyncStorage.setItem('nutricionistaPerfil', JSON.stringify(p));
            }
        } catch {
            Alert.alert('Erro', 'Não foi possível atualizar a foto. Tente novamente.');
        } finally {
            setEnviandoFoto(false);
        }
    }

    const nomeUF: Record<string, string> = {
        AC:'Acre', AL:'Alagoas', AP:'Amapá', AM:'Amazonas', BA:'Bahia',
        CE:'Ceará', DF:'Distrito Federal', ES:'Espírito Santo', GO:'Goiás',
        MA:'Maranhão', MT:'Mato Grosso', MS:'Mato Grosso do Sul',
        MG:'Minas Gerais', PA:'Pará', PB:'Paraíba', PR:'Paraná',
        PE:'Pernambuco', PI:'Piauí', RJ:'Rio de Janeiro',
        RN:'Rio Grande do Norte', RS:'Rio Grande do Sul', RO:'Rondônia',
        RR:'Roraima', SC:'Santa Catarina', SP:'São Paulo',
        SE:'Sergipe', TO:'Tocantins',
    };

    const ufLabel = perfil.uf ? `${nomeUF[perfil.uf] ?? perfil.uf} (${perfil.uf})` : '—';
    const crnCompleto = perfil.crn ? `${perfil.crn}${perfil.uf ? `/${perfil.uf}` : ''}` : '—';

    async function confirmarSaida() {
        Alert.alert('Sair da Conta', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair', style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.multiRemove(['nutricionistaId', 'nutricionistaNome', 'nutricionistaPerfil']);
                    router.replace('./login');
                },
            },
        ]);
    }

    async function confirmarDelecao() {
        Alert.alert('Deletar Conta', 'Esta ação é irreversível. Deseja continuar?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Deletar', style: 'destructive',
                onPress: async () => {
                    try {
                        const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
                        if (nutricionistaId) await deleteNutricionista(nutricionistaId);
                        await AsyncStorage.clear();
                        router.replace('./login');
                    } catch {
                        Alert.alert('Erro', 'Não foi possível deletar a conta.');
                    }
                },
            },
        ]);
    }

    const Campo = ({ label, valor, onEdit }: { label: string; valor: string; onEdit?: () => void }) => (
        <View style={s.campoRow}>
            <View style={{ flex: 1 }}>
                <Text style={s.campoLabel}>{label}</Text>
                <Text style={s.campoValor}>{valor || '—'}</Text>
            </View>
            {onEdit && (
                <TouchableOpacity style={s.editBtn} onPress={onEdit} activeOpacity={0.7}>
                    <Ionicons name="pencil-outline" size={16} color="#888" />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.headerTitulo}>Meu Perfil</Text>

                <View style={s.avatarArea}>
                    <View style={s.avatarCirculo}>
                        {perfil.fotoUrl ? (
                            <Image source={{ uri: perfil.fotoUrl }} style={s.avatarImagem} />
                        ) : (
                            <Ionicons name="person" size={54} color="#ccc" />
                        )}
                    </View>
                    <TouchableOpacity
                        style={s.cameraBtn}
                        activeOpacity={0.8}
                        onPress={alterarFoto}
                        disabled={enviandoFoto}
                    >
                        {enviandoFoto ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="camera" size={16} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={s.nomeGrande}>{perfil.nomeCompleto || 'Nutricionista'}</Text>
                <Text style={s.subtitulo}>Nutricionista</Text>

                <Text style={s.secaoTitulo}>INFORMAÇÕES PESSOAIS E CONTA</Text>
                <View style={s.secaoCard}>
                    {editandoCampo === 'nome' ? (
                        <View style={s.edicaoBox}>
                            <Text style={s.campoLabel}>Nome Completo</Text>
                            <TextInput
                                style={s.input}
                                value={valorEditando}
                                onChangeText={setValorEditando}
                                autoFocus
                                placeholderTextColor="#aaa"
                            />
                            <View style={s.edicaoBotoes}>
                                <TouchableOpacity style={s.btnCancelar} onPress={cancelarEdicao}>
                                    <Text style={s.btnCancelarTexto}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.btnSalvar} onPress={salvarEdicao} disabled={salvando}>
                                    <Text style={s.btnSalvarTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Campo label="Nome Completo" valor={perfil.nomeCompleto} onEdit={() => abrirEdicao('nome')} />
                    )}
                    <View style={s.divisor} />
                    <Campo label="E-mail Profissional" valor={perfil.emailProfissional} onEdit={() => router.push('./AlterarEmail')} />
                    <View style={s.divisor} />
                    <Campo label="Senha" valor="••••••" onEdit={() => router.push('./RedefinirSenha')} />
                </View>

                <Text style={s.secaoTitulo}>DADOS PROFISSIONAIS</Text>
                <View style={s.secaoCard}>
                    <Campo label="CRN" valor={crnCompleto} />
                    <View style={s.divisor} />
                    <Campo label="UF do CRN" valor={ufLabel} />
                    <View style={s.divisor} />
                    <Campo label="Especialidade Principal" valor={perfil.especialidadePrincipal} />
                    <View style={s.divisor} />
                    {editandoCampo === 'biografia' ? (
                        <View style={s.edicaoBox}>
                            <Text style={s.campoLabel}>Biografia</Text>
                            <TextInput
                                style={[s.input, { minHeight: 80 }]}
                                value={valorEditando}
                                onChangeText={setValorEditando}
                                multiline
                                autoFocus
                                placeholderTextColor="#aaa"
                            />
                            <View style={s.edicaoBotoes}>
                                <TouchableOpacity style={s.btnCancelar} onPress={cancelarEdicao}>
                                    <Text style={s.btnCancelarTexto}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.btnSalvar} onPress={salvarEdicao} disabled={salvando}>
                                    <Text style={s.btnSalvarTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Campo label="Biografia" valor={perfil.biografia} onEdit={() => abrirEdicao('biografia')} />
                    )}
                </View>

                <TouchableOpacity style={s.btnSair} onPress={confirmarSaida} activeOpacity={0.85}>
                    <MaterialCommunityIcons name="logout" size={20} color="#E53935" />
                    <Text style={s.btnSairTexto}>Sair da Conta</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.btnDeletar} onPress={confirmarDelecao} activeOpacity={0.85}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#E53935" />
                    <Text style={s.btnDeletarTexto}>Deletar Conta</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={s.tabBar}>
                <TouchableOpacity style={s.tabItem} onPress={() => router.push('./Dashboardnutricionista')}>
                    <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="#999" />
                    <Text style={s.tabTexto}>Painel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.tabItem} onPress={() => router.push('./PacientesNutricionista')}>
                    <MaterialCommunityIcons name="account-group-outline" size={24} color="#999" />
                    <Text style={s.tabTexto}>Pacientes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.tabItemAtivo}>
                    <Ionicons name="person" size={24} color="#2E7D32" />
                    <Text style={s.tabTextoAtivo}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root:            { flex: 1, backgroundColor: '#F5F7F5' },
    scroll:          { paddingHorizontal: 20 },
    headerTitulo:    { fontSize: 20, fontWeight: '800', color: '#111', textAlign: 'center', paddingTop: 56, marginBottom: 28 },
    avatarArea:      { alignSelf: 'center', marginBottom: 16 },
    avatarCirculo:   { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8E8E8', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImagem:    { width: 100, height: 100, borderRadius: 50 },
    cameraBtn:       { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F5F7F5' },
    nomeGrande:      { fontSize: 22, fontWeight: '800', color: '#111', textAlign: 'center', marginBottom: 4 },
    subtitulo:       { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 28 },
    secaoTitulo:     { fontSize: 12, fontWeight: '700', color: '#aaa', letterSpacing: 0.8, marginBottom: 10, marginTop: 20 },
    secaoCard:       { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    divisor:         { height: 1, backgroundColor: '#F0F0F0' },
    campoRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
    campoLabel:      { fontSize: 12, color: '#999', marginBottom: 3 },
    campoValor:      { fontSize: 15, fontWeight: '600', color: '#111' },
    editBtn:         { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
    edicaoBox:       { paddingVertical: 14 },
    input:           { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#111', backgroundColor: '#FAFAFA', marginTop: 6 },
    edicaoBotoes:    { flexDirection: 'row', gap: 10, marginTop: 10 },
    btnCancelar:     { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    btnCancelarTexto:{ fontSize: 14, fontWeight: '600', color: '#888' },
    btnSalvar:       { flex: 1, backgroundColor: '#2E7D32', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    btnSalvarTexto:  { fontSize: 14, fontWeight: '700', color: '#fff' },
    btnSair:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28, borderWidth: 1.5, borderColor: '#E53935', borderRadius: 14, paddingVertical: 16 },
    btnSairTexto:    { fontSize: 15, fontWeight: '700', color: '#E53935' },
    btnDeletar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
    btnDeletarTexto: { fontSize: 14, fontWeight: '700', color: '#E53935', textAlign: 'center' },
    tabBar:          { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', paddingBottom: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', elevation: 10 },
    tabItem:         { flex: 1, alignItems: 'center', gap: 4 },
    tabItemAtivo:    { flex: 1, alignItems: 'center', gap: 4 },
    tabTexto:        { fontSize: 12, color: '#999', fontWeight: '500' },
    tabTextoAtivo:   { fontSize: 12, color: '#2E7D32', fontWeight: '700' },
});
