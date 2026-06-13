import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getNutricionistas } from '../src/services/nutricionistaService_1';
import { createSolicitacao } from '../src/services/solicitacaoService_2';
import { createVinculo } from '../src/services/vinculoService_1';

type Nutricionista = {
    idNutri: number;
    nomeCompleto: string;
    especialidadePrincipal: string;
    crn: string;
    uf: string;
    biografia: string;
    avaliacaoMedia: number;
    totalPacientes: number;
};

export default function VincularNutricionista() {
    const [busca, setBusca]                       = useState('');
    const [nutricionistas, setNutricionistas]     = useState<Nutricionista[]>([]);
    const [solicitados, setSolicitados]           = useState<number[]>([]);
    const [loading, setLoading]                   = useState(true);
    const [modalVisivel, setModalVisivel]         = useState(false);
    const [nutriSelecionada, setNutriSelecionada] = useState<Nutricionista | null>(null);
    const [enviando, setEnviando]                 = useState(false);

    useEffect(() => {
        getNutricionistas()
            .then(setNutricionistas)
            .catch(() => Alert.alert('Erro', 'Não foi possível carregar os nutricionistas.'))
            .finally(() => setLoading(false));
    }, []);

    const filtrados = nutricionistas.filter(n =>
        busca.trim() === '' ||
        n.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) ||
        n.crn?.toLowerCase().includes(busca.toLowerCase()) ||
        n.especialidadePrincipal?.toLowerCase().includes(busca.toLowerCase())
    );

    function abrirModal(nutri: Nutricionista) {
        if (solicitados.includes(nutri.idNutri)) return;
        setNutriSelecionada(nutri);
        setModalVisivel(true);
    }

    function fecharModal() {
        setModalVisivel(false);
        setNutriSelecionada(null);
    }


 async function confirmarVinculo() {
        if (!nutriSelecionada) return;
        setEnviando(true);
 
        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');
 
            if (!usuarioId) {
                Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
                return;
            }
 
            const hoje = new Date().toISOString().split('T')[0];
 
            await createSolicitacao({
                usuarioId: parseInt(usuarioId),
                nutricionistaId: nutriSelecionada.idNutri,
                dataSolicitacao: hoje,
                status: 'Pendente',
            });
 
            await createVinculo({
                usuarioId: parseInt(usuarioId),
                nutricionistaId: nutriSelecionada.idNutri,
                dataSolicitacao: hoje,
                status: 'Pendente',
            });

            

            setSolicitados(prev => [...prev, nutriSelecionada.idNutri]);
            fecharModal();
 
            Alert.alert(
                'Solicitação Enviada!',
                `Sua solicitação de vínculo com ${nutriSelecionada.nomeCompleto} foi enviada com sucesso. Aguarde a confirmação.`,
                [{ text: 'OK', onPress: () => router.back() }],
            );
        } catch (error: any) {
            console.log('Erro status:', error?.response?.status);
            console.log('Erro data:', JSON.stringify(error?.response?.data));
            console.log('Erro message:', error?.message);
            Alert.alert('Erro', 'Não foi possível enviar a solicitação. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.centralizador}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingTexto}>Buscando nutricionistas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

            <Modal visible={modalVisivel} transparent animationType="fade" onRequestClose={fecharModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalAvatarWrapper}>
                            <View style={styles.modalAvatarPlaceholder}>
                                <Ionicons name="person" size={40} color="#ccc" />
                            </View>
                            <View style={styles.modalBadge}>
                                <MaterialCommunityIcons name="account-plus-outline" size={16} color="#2E7D32" />
                            </View>
                        </View>

                        <Text style={styles.modalNome}>{nutriSelecionada?.nomeCompleto}</Text>
                        <Text style={styles.modalEspecialidade}>{nutriSelecionada?.especialidadePrincipal}</Text>
                        <Text style={styles.modalCrn}>
                            CRN: {nutriSelecionada?.crn}{nutriSelecionada?.uf ? `/${nutriSelecionada.uf}` : ''}
                        </Text>

                        {nutriSelecionada?.biografia ? (
                            <Text style={styles.modalTexto} numberOfLines={3}>
                                {nutriSelecionada.biografia}
                            </Text>
                        ) : (
                            <Text style={styles.modalTexto}>
                                Tem certeza que deseja solicitar vínculo com este(a) nutricionista para compartilhar seus dados de saúde?
                            </Text>
                        )}

                        <TouchableOpacity
                            style={[styles.modalBtnConfirmar, enviando && { opacity: 0.7 }]}
                            onPress={confirmarVinculo}
                            disabled={enviando}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.modalBtnConfirmarTexto}>
                                {enviando ? 'Enviando...' : 'Sim, solicitar vínculo'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={fecharModal} activeOpacity={0.7}>
                            <Text style={styles.modalBtnCancelar}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.header}>
                <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitulo}>Adicionar Nutricionista</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#aaa" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nome, CRN ou especialidade"
                        placeholderTextColor="#aaa"
                        value={busca}
                        onChangeText={setBusca}
                        returnKeyType="search"
                    />
                    {busca.length > 0 && (
                        <TouchableOpacity onPress={() => setBusca('')}>
                            <Ionicons name="close-circle" size={18} color="#aaa" />
                        </TouchableOpacity>
                    )}
                </View>

                {filtrados.length === 0 ? (
                    <View style={styles.semResultados}>
                        <Ionicons name="search" size={40} color="#ccc" />
                        <Text style={styles.semResultadosTexto}>Nenhum profissional encontrado</Text>
                    </View>
                ) : (
                    filtrados.map(nutri => {
                        const jaSolicitado = solicitados.includes(nutri.idNutri);
                        return (
                            <View key={nutri.idNutri} style={styles.card}>
                                <View style={styles.cardTopo}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Ionicons name="person" size={32} color="#ccc" />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.nutriNome}>{nutri.nomeCompleto}</Text>
                                        {nutri.especialidadePrincipal ? (
                                            <Text style={styles.nutriEspecialidade}>{nutri.especialidadePrincipal}</Text>
                                        ) : null}
                                        <Text style={styles.nutriCrn}>
                                            CRN: {nutri.crn}{nutri.uf ? `/${nutri.uf}` : ''}
                                        </Text>
                                        {nutri.totalPacientes > 0 && (
                                            <Text style={styles.nutriInfo}>
                                                {nutri.totalPacientes} pacientes · ⭐ {Number(nutri.avaliacaoMedia).toFixed(1)}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.btnSolicitar, jaSolicitado && styles.btnSolicitarEnviado]}
                                    onPress={() => abrirModal(nutri)}
                                    disabled={jaSolicitado}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={jaSolicitado ? 'checkmark' : 'person-add-outline'}
                                        size={20}
                                        color="#fff"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.btnSolicitarTexto}>
                                        {jaSolicitado ? 'Solicitação Enviada' : 'Solicitar Vínculo'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root:                   { flex: 1, backgroundColor: '#F5F5F5' },
    centralizador:          { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingTexto:           { fontSize: 14, color: '#888', marginTop: 8 },
    modalOverlay:           { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    modalBox:               { backgroundColor: '#fff', borderRadius: 28, padding: 28, alignItems: 'center', width: '100%', elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
    modalAvatarWrapper:     { position: 'relative', marginBottom: 16 },
    modalAvatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    modalBadge:             { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: '#E8F5E9', borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    modalNome:              { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 4, textAlign: 'center' },
    modalEspecialidade:     { fontSize: 14, color: '#555', marginBottom: 2, textAlign: 'center' },
    modalCrn:               { fontSize: 13, color: '#aaa', marginBottom: 18, textAlign: 'center' },
    modalTexto:             { fontSize: 15, color: '#444', textAlign: 'center', lineHeight: 23, marginBottom: 24, paddingHorizontal: 4 },
    modalBtnConfirmar:      { width: '100%', backgroundColor: '#2E7D32', borderRadius: 18, paddingVertical: 17, alignItems: 'center', marginBottom: 16 },
    modalBtnConfirmarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
    modalBtnCancelar:       { fontSize: 15, fontWeight: '600', color: '#888', paddingVertical: 4 },
    header:                 { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 18, paddingBottom: 20, backgroundColor: '#F5F5F5' },
    btnVoltar:              { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EBEBEB', justifyContent: 'center', alignItems: 'center' },
    headerTitulo:           { fontSize: 17, fontWeight: '700', color: '#111' },
    scroll:                 { paddingHorizontal: 18, paddingBottom: 40 },
    searchBox:              { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    searchInput:            { flex: 1, fontSize: 15, color: '#111', padding: 0 },
    card:                   { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    cardTopo:               { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
    avatarPlaceholder:      { width: 66, height: 66, borderRadius: 33, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
    nutriNome:              { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 2 },
    nutriEspecialidade:     { fontSize: 13, color: '#666', marginBottom: 2 },
    nutriCrn:               { fontSize: 12, color: '#aaa' },
    nutriInfo:              { fontSize: 12, color: '#4CAF50', marginTop: 2 },
    btnSolicitar:           { backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    btnSolicitarEnviado:    { backgroundColor: '#81C784' },
    btnSolicitarTexto:      { color: '#fff', fontSize: 15, fontWeight: '700' },
    semResultados:          { alignItems: 'center', paddingVertical: 40, gap: 10 },
    semResultadosTexto:     { color: '#aaa', fontSize: 14 },
});
