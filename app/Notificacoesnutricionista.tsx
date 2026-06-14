import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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
import { getSolicitacoesPorNutricionista, updateSolicitacao } from '../src/services/solicitacaoService_2';
import { ativarVinculoPendente } from '../src/services/vinculoService_1';

type TipoNotificacao = 'vinculo' | 'dieta' | 'meta';

type Notificacao = {
    id: string;
    tipo: TipoNotificacao;
    pacienteNome: string;
    mensagem: string;
    tempo: string;
    lida: boolean;
    vinculoId?: string;
    solicitacaoId?: string;
    usuarioId?: string;
};


function iconeNotificacao(tipo: TipoNotificacao): { bg: string; icon: string; color: string } {
    switch (tipo) {
        case 'vinculo': return { bg: '#EDE9FE', icon: 'account-plus-outline', color: '#7C3AED' };
        case 'dieta':   return { bg: '#FFF8E1', icon: 'file-document-edit-outline', color: '#F59E0B' };
        case 'meta':    return { bg: '#FFF8E1', icon: 'file-document-edit-outline', color: '#F59E0B' };
        default:        return { bg: '#F5F5F5', icon: 'bell-outline', color: '#888' };
    }
}


export default function NotificacoesNutricionista() {
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [loading, setLoading]           = useState(true);
    const [respondidos, setRespondidos]   = useState<string[]>([]);


    useEffect(() => {
        const buscar = async () => {
            try {
                const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
const solicitacoes = await getSolicitacoesPorNutricionista(nutricionistaId);
console.warn('SOLICITACAO 33:', JSON.stringify(solicitacoes.find((s: any) => (s.idSolicitacao ?? s.id) == 33)));
const minhas = solicitacoes
    .filter((s: any) => {
    const st = s.status ?? 'Pendente';
    return st === 'Pendente';
})
                    .map((s: any) => ({
                        id: (s.idSolicitacao ?? s.id).toString(),
                        solicitacaoId: (s.idSolicitacao ?? s.id).toString(),
                        usuarioId: s.fkIdUser?.toString(),
                        tipo: 'vinculo' as TipoNotificacao,
                        pacienteNome: s.usuario?.nomeCompleto ?? 'Paciente',
                        mensagem: 'solicitou vÃ­nculo profissional.',
                        tempo: s.dataSolicitacao ?? 'Hoje',
                        lida: false,
                    }));

                    console.log('SOLICITACAO:', JSON.stringify(solicitacoes[0]));

                setNotificacoes(minhas);
            } catch (err) {
                console.error('Erro ao buscar notificações:', err);
            } finally {
                setLoading(false);
            }
        };
        buscar();
    }, []);

    async function aceitar(notif: Notificacao) {
        console.warn('ACEITANDO:', notif.id);
        console.warn('RESPONDIDOS:', respondidos);
        console.warn('USUARIO ID:', notif.usuarioId);
        try {
            if (notif.solicitacaoId) {
                await updateSolicitacao(notif.solicitacaoId, { status: 'Aceita' });
            }
            const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
            console.warn('NUTRI ID:', nutricionistaId);
            if (notif.usuarioId && nutricionistaId) {
            await ativarVinculoPendente(notif.usuarioId, nutricionistaId);
            }
            setRespondidos(prev => [...prev, notif.id]);
            Alert.alert('✅ Vínculo aceito!', `${notif.pacienteNome} agora é seu paciente.`);
        } catch {
            Alert.alert('Erro', 'Não foi possível aceitar o vínculo. Tente novamente.');
        }
    }

    async function recusar(notif: Notificacao) {
        Alert.alert(
            'Recusar vínculo',
            `Tem certeza que deseja recusar a solicitação de ${notif.pacienteNome}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Recusar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (notif.solicitacaoId) {
                                await updateSolicitacao(notif.solicitacaoId, { status: 'Recusada' });
                            }
                            setRespondidos(prev => [...prev, notif.id]);
                        } catch {
                            Alert.alert('Erro', 'Não foi possível recusar. Tente novamente.');
                        }
                    },
                },
            ],
        );
    }

    const visiveis = notificacoes.filter(n => !respondidos.includes(n.id));

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitulo}>Notificações</Text>
                <View style={{ width: 38 }} />
            </View>

            <View style={styles.headerDivisor} />

            {loading ? (
                <View style={styles.centralizador}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            ) : visiveis.length === 0 ? (
                <View style={styles.centralizador}>
                    <MaterialCommunityIcons name="bell-check-outline" size={52} color="#ccc" />
                    <Text style={styles.vazioTitulo}>Sem notificações</Text>
                    <Text style={styles.vazioDesc}>Você está em dia! Novas notificações aparecerão aqui.</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {visiveis.map((notif, index) => {
                        const icone = iconeNotificacao(notif.tipo);
                        return (
                            <View key={notif.id}>
                                <View style={[styles.item, notif.lida && styles.itemLida]}>

                                    {!notif.lida && <View style={styles.pontNaoLida} />}

                                    <View style={[styles.iconeWrapper, { backgroundColor: icone.bg }]}>
                                        <MaterialCommunityIcons
                                            name={icone.icon as any}
                                            size={24}
                                            color={icone.color}
                                        />
                                    </View>
                                    <View style={styles.conteudo}>

                                        <Text style={styles.mensagem}>
                                            <Text style={styles.pacienteNome}>{notif.pacienteNome} </Text>
                                            {notif.mensagem}
                                        </Text>

                                        <Text style={styles.tempo}>{notif.tempo}</Text>

                                        {notif.tipo === 'vinculo' && (
                                            <View style={styles.botoesRow}>
                                                <TouchableOpacity
                                                    style={styles.btnAceitar}
                                                    onPress={() => aceitar(notif)}
                                                    activeOpacity={0.85}
                                                >
                                                    <Text style={styles.btnAceitarTexto}>Aceitar</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.btnRecusar}
                                                    onPress={() => recusar(notif)}
                                                    activeOpacity={0.85}
                                                >
                                                    <Text style={styles.btnRecusarTexto}>Recusar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {(notif.tipo === 'dieta' || notif.tipo === 'meta') && (
                                            <TouchableOpacity
                                                style={styles.btnVerDieta}
                                                onPress={() => router.push('./VisualizarDieta')}
                                                activeOpacity={0.85}
                                            >
                                                <Text style={styles.btnVerDietaTexto}>Ver Dieta</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {index < visiveis.length - 1 && <View style={styles.divisor} />}
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    root:               { flex: 1, backgroundColor: '#fff' },
    header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 18, paddingBottom: 16 },
    btnVoltar:          { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    headerTitulo:       { fontSize: 18, fontWeight: '700', color: '#111' },
    headerDivisor:      { height: 1, backgroundColor: '#F0F0F0' },
    centralizador:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 },
    vazioTitulo:        { fontSize: 17, fontWeight: '700', color: '#bbb', marginTop: 4 },
    vazioDesc:          { fontSize: 14, color: '#ccc', textAlign: 'center', lineHeight: 20 },
    item:               { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 18, backgroundColor: '#F9F4FF', gap: 14, position: 'relative' },
    itemLida:           { backgroundColor: '#fff' },
    pontNaoLida:        { position: 'absolute', left: 6, top: 22, width: 9, height: 9, borderRadius: 5, backgroundColor: '#2E7D32' },
    iconeWrapper:       { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    conteudo:           { flex: 1, gap: 4 },
    mensagem:           { fontSize: 14, color: '#333', lineHeight: 21 },
    pacienteNome:       { fontWeight: '800', color: '#111' },
    tempo:              { fontSize: 12, color: '#aaa', marginTop: 2, marginBottom: 8 },
    botoesRow:          { flexDirection: 'row', gap: 10, marginTop: 4 },
    btnAceitar:         { backgroundColor: '#2E7D32', borderRadius: 10, paddingHorizontal: 28, paddingVertical: 12 },
    btnAceitarTexto:    { color: '#fff', fontWeight: '700', fontSize: 14 },
    btnRecusar:         { backgroundColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 22, paddingVertical: 12 },
    btnRecusarTexto:    { color: '#333', fontWeight: '700', fontSize: 14 },
    btnVerDieta:        { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
    btnVerDietaTexto:   { fontSize: 14, fontWeight: '700', color: '#111' },
    divisor:            { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 0 },
});