import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getEvolucoes } from '../src/services/evolucaoService_1';
import { getNutricionistaById } from '../src/services/nutricionistaService_1';
import { getVinculosByNutricionista } from '../src/services/vinculoService_1';


type Stats = {
    pacientesAtivos: number;
    metasAtingidas: number;
};

type Conquista = {
    id: string;
    pacienteNome: string;
    pacienteFoto: string | null;
    data: string;
    titulo: string;
    descricao: string;
    cor: string;
};

type Lembrete = {
    id: string;
    tipo: 'dieta' | 'vinculo' | 'consulta';
    titulo: string;
    descricao: string;
    acaoBotao: string;
};



const CORES_CONQUISTA = ['#2E7D32', '#1565C0', '#6A1B9A', '#E65100', '#00695C'];


function corIconeLembrete(tipo: string): { bg: string; icon: string; color: string } {
    switch (tipo) {
        case 'dieta':    return { bg: '#FFF8E1', icon: 'file-document-edit-outline', color: '#F59E0B' };
        case 'vinculo':  return { bg: '#EDE9FE', icon: 'account-plus-outline',       color: '#7C3AED' };
        case 'consulta': return { bg: '#E8F5E9', icon: 'calendar-check-outline',     color: '#2E7D32' };
        default:         return { bg: '#F5F5F5', icon: 'bell-outline',               color: '#888'    };
    }
}

function formatarData(dataStr: string): string {
    if (!dataStr) return '';
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}


export default function DashboardNutricionista() {
    const [nome,       setNome]       = useState('');
    const [stats,      setStats]      = useState<Stats>({ pacientesAtivos: 0, metasAtingidas: 0 });
    const [conquistas, setConquistas] = useState<Conquista[]>([]);
    const [lembretes,  setLembretes]  = useState<Lembrete[]>([]);
    const [loading,    setLoading]    = useState(true);

    useFocusEffect(
        useCallback(() => {
            const carregar = async () => {
                setLoading(true);
                try {
                    const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');

                    if (!nutricionistaId) return;

                    const [nutri, evolucoes, vinculos] = await Promise.all([
                    getNutricionistaById(nutricionistaId),
                    getEvolucoes(),
                    getVinculosByNutricionista(nutricionistaId),
                    ]);

                    const meusVinculos = vinculos.filter((v: any) =>
                        v.nutricionista?.idNutri?.toString() === nutricionistaId ||
                        v.fkIdNutri?.toString() === nutricionistaId
                    );
                    const ativos = meusVinculos.filter((v: any) => (v.status ?? '').toLowerCase() === 'ativo');
                    const pendentes = meusVinculos.filter((v: any) => (v.status ?? '').toLowerCase() === 'pendente');

                    const idsAtivos = new Set(ativos.map((v: any) =>
                        (v.usuario?.idUser ?? v.fkIdUser)?.toString()
                    ));

                    const conquistasMapeadas: Conquista[] = evolucoes
                        .filter((e: any) =>
                            e.metaProgresso != null &&
                            e.pesoRegistrado != null &&
                            Number(e.pesoRegistrado) <= Number(e.metaProgresso) &&
                            idsAtivos.has((e.usuario?.idUser ?? e.fkIdUser)?.toString())
                        )
                        .slice(0, 5)
                        .map((e: any, idx: number) => ({
                            id: (e.idEvolucao ?? e.id ?? idx).toString(),
                            pacienteNome: e.usuario?.nomeCompleto ?? 'Paciente',
                            pacienteFoto: null,
                            data: formatarData(e.dataRegistro ?? e.data ?? ''),
                            titulo: 'Meta Atingida! 🎯',
                            descricao: `${e.usuario?.nomeCompleto ?? 'Paciente'} atingiu o peso de ${e.pesoRegistrado}kg.`,
                            cor: CORES_CONQUISTA[idx % CORES_CONQUISTA.length],
                        }));

                    const metasAtingidas = conquistasMapeadas.length;

                    setNome(nutri.nomeCompleto ?? '');
                    setStats({ pacientesAtivos: ativos.length, metasAtingidas });
                    setConquistas(conquistasMapeadas);
                    setLembretes(pendentes.slice(0, 3).map((v: any) => ({
    id: (v.idVinculo ?? v.id).toString(),
    tipo: 'vinculo' as const,
    titulo: 'Solicitação de vínculo',
    descricao: `${v.usuario?.nomeCompleto ?? v.usuarioNome ?? 'Paciente'} aguarda aprovação.`,
    acaoBotao: 'Ver',
})));
                } catch (err) {
                    console.error('Erro ao carregar dashboard:', err);
                } finally {
                    setLoading(false);
                }
            };
            carregar();
        }, []),
    );

    const primeiroNome = nome.split(' ').slice(0, 2).join(' ');

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitulo}>Visão Geral</Text>
                        <TouchableOpacity
                            style={styles.sinoBadge}
                            onPress={() => router.push('./Notificacoesnutricionista')}
                        >
                            <Ionicons name="notifications-outline" size={24} color="#111" />
                            {lembretes.length > 0 && <View style={styles.badgeVermelho} />}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.bemVinda}>Bem-vinda de volta,</Text>
                    <Text style={styles.nomeNutri}>{primeiroNome || 'Nutricionista'}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcone, { backgroundColor: '#E8F5E9' }]}>
                                <MaterialCommunityIcons name="account-group-outline" size={26} color="#2E7D32" />
                            </View>
                            <Text style={styles.statValor}>{stats.pacientesAtivos}</Text>
                            <Text style={styles.statLabel}>Pacientes Ativos</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcone, { backgroundColor: '#EEF2FF' }]}>
                                <MaterialCommunityIcons name="bullseye-arrow" size={26} color="#4F46E5" />
                            </View>
                            <Text style={styles.statValor}>{stats.metasAtingidas}</Text>
                            <Text style={styles.statLabel}>Metas Atingidas</Text>
                        </View>
                    </View>

                    <View style={styles.secaoHeader}>
                        <Text style={styles.secaoTitulo}>Conquistas Recentes</Text>
                        <TouchableOpacity onPress={() => router.push('./Todasconquistas')}>
                            <Text style={styles.verTodas}>Ver todas</Text>
                        </TouchableOpacity>
                    </View>

                    {conquistas.length === 0 ? (
                        <View style={[styles.vazioCard, { marginBottom: 28 }]}>
                            <MaterialCommunityIcons name="trophy-outline" size={36} color="#ccc" />
                            <Text style={styles.vazioTitulo}>Nenhuma conquista ainda</Text>
                            <Text style={styles.vazioDesc}>As metas atingidas pelos seus pacientes aparecerão aqui.</Text>
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.conquistasLista}
                            style={{ marginBottom: 28 }}
                        >
                            {conquistas.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.conquistaCard, { backgroundColor: c.cor }]}
                                    activeOpacity={0.88}
                                    onPress={() => router.push('./TodasConquistas')}
                                >
                                    <View style={styles.conquistaTop}>
                                        {c.pacienteFoto ? (
                                            <Image source={{ uri: c.pacienteFoto }} style={styles.conquistaAvatar} />
                                        ) : (
                                            <View style={styles.conquistaAvatarPlaceholder}>
                                                <Ionicons name="person" size={18} color="rgba(255,255,255,0.7)" />
                                            </View>
                                        )}
                                        <View>
                                            <Text style={styles.conquistaPaciente}>{c.pacienteNome}</Text>
                                            <Text style={styles.conquistaData}>{c.data}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.conquistaTitulo}>{c.titulo}</Text>
                                    <Text style={styles.conquistaDesc} numberOfLines={2}>{c.descricao}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    <Text style={[styles.secaoTitulo, { marginBottom: 14 }]}>
                        Lembretes Pendentes
                    </Text>

                    {lembretes.length === 0 ? (
                        <View style={styles.vazioCard}>
                            <MaterialCommunityIcons name="bell-check-outline" size={36} color="#ccc" />
                            <Text style={styles.vazioTitulo}>Tudo em dia!</Text>
                            <Text style={styles.vazioDesc}>
                                Você não tem lembretes pendentes. Vincule seus primeiros pacientes para começar.
                            </Text>
                            <TouchableOpacity
                                style={styles.vazioBotao}
                                onPress={() => router.push('./PacientesNutricionista')}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.vazioBotaoTexto}>Adicionar Paciente</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        lembretes.map(item => {
                            const icone = corIconeLembrete(item.tipo);
                            return (
                                <View key={item.id} style={styles.lembreteCard}>
                                    <View style={[styles.lembreteIcone, { backgroundColor: icone.bg }]}>
                                        <MaterialCommunityIcons name={icone.icon as any} size={22} color={icone.color} />
                                    </View>
                                    <View style={styles.lembreteInfo}>
                                        <Text style={styles.lembreteTitulo}>{item.titulo}</Text>
                                        <Text style={styles.lembreteDesc}>{item.descricao}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.lembreteBotao} activeOpacity={0.8}>
                                        <Text style={styles.lembreteBotaoTexto}>{item.acaoBotao}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    )}

                    <View style={{ height: 30 }} />
                </ScrollView>
            )}

            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItemAtivo}>
                    <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="#2E7D32" />
                    <Text style={styles.tabTextoAtivo}>Painel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => router.push('./PacientesNutricionista')}
                >
                    <MaterialCommunityIcons name="account-group-outline" size={24} color="#999" />
                    <Text style={styles.tabTexto}>Pacientes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => router.push('./PerfilNutricionista')}
                >
                    <Ionicons name="person-outline" size={24} color="#999" />
                    <Text style={styles.tabTexto}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    root:                       { flex: 1, backgroundColor: '#F5F7F5' },
    loadingBox:                 { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll:                     { paddingHorizontal: 20, paddingBottom: 100 },

    header:                     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, marginBottom: 16 },
    headerTitulo:               { fontSize: 26, fontWeight: '800', color: '#111' },
    sinoBadge:                  { position: 'relative', width: 42, height: 42, justifyContent: 'center', alignItems: 'center' },
    badgeVermelho:              { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E53935', borderWidth: 1.5, borderColor: '#F5F7F5' },

    bemVinda:                   { fontSize: 15, color: '#888', marginBottom: 4 },
    nomeNutri:                  { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 24 },

    statsRow:                   { flexDirection: 'row', gap: 14, marginBottom: 28 },
    statCard:                   { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    statIcone:                  { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statValor:                  { fontSize: 32, fontWeight: '800', color: '#111', marginBottom: 4 },
    statLabel:                  { fontSize: 13, color: '#888', fontWeight: '500' },

    secaoHeader:                { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    secaoTitulo:                { fontSize: 18, fontWeight: '800', color: '#111' },
    verTodas:                   { fontSize: 14, fontWeight: '700', color: '#2E7D32' },
    sugestoesLista:             { gap: 14, paddingRight: 4 },
    sugestaoCard:               { width: 190, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    sugestaoImgBox:             { height: 110 },
    sugestaoInfo:               { padding: 12 },
    sugestaoTitulo:             { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 6 },
    sugestaoMetaRow:            { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    sugestaoMeta:               { fontSize: 12, color: '#888', marginLeft: 3 },
    btnSugerirPequeno:          { backgroundColor: '#E8F5E9', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
    btnSugerirPequenoTexto:     { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
    conquistasLista:            { gap: 12, paddingRight: 4 },
    conquistaCard:              { width: 220, borderRadius: 20, padding: 18 },
    conquistaTop:               { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    conquistaAvatar:            { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
    conquistaAvatarPlaceholder: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    conquistaPaciente:          { fontSize: 14, fontWeight: '700', color: '#fff' },
    conquistaData:              { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
    conquistaTitulo:            { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 6 },
    conquistaDesc:              { fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 18 },

    lembreteCard:               { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, gap: 12 },
    lembreteIcone:              { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    lembreteInfo:               { flex: 1 },
    lembreteTitulo:             { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
    lembreteDesc:               { fontSize: 12, color: '#888', lineHeight: 17 },
    lembreteBotao:              { backgroundColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    lembreteBotaoTexto:         { fontSize: 13, fontWeight: '700', color: '#333' },

    vazioCard:                  { backgroundColor: '#fff', borderRadius: 18, padding: 28, alignItems: 'center', gap: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    vazioTitulo:                { fontSize: 16, fontWeight: '700', color: '#aaa', marginTop: 4 },
    vazioDesc:                  { fontSize: 13, color: '#bbb', textAlign: 'center', lineHeight: 20 },
    vazioBotao:                 { marginTop: 12, backgroundColor: '#2E7D32', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
    vazioBotaoTexto:            { color: '#fff', fontWeight: '700', fontSize: 14 },

    tabBar:                     { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', paddingBottom: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', elevation: 10 },
    tabItem:                    { flex: 1, alignItems: 'center', gap: 4 },
    tabItemAtivo:               { flex: 1, alignItems: 'center', gap: 4 },
    tabTexto:                   { fontSize: 12, color: '#999', fontWeight: '500' },
    tabTextoAtivo:              { fontSize: 12, color: '#2E7D32', fontWeight: '700' },
});
