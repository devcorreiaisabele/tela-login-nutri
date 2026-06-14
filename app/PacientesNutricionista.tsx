import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { getVinculos } from '../src/services/vinculoService_1';

type Paciente = {
    id: string;
    nome: string;
    objetivo: string;
    corObj: string;
    foto: string | null;
};

export default function PacientesNutricionista() {
    const [busca,     setBusca]     = useState('');
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        async function carregarPacientes() {
            try {
                const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
                if (!nutricionistaId) return;

                const vinculos = await getVinculos();
               const ativos = vinculos.filter((v: any) =>
    (v.status ?? '').toLowerCase() === 'ativo' &&
    (
        v.nutricionista?.idNutri?.toString() === nutricionistaId ||
        v.fkIdNutri?.toString() === nutricionistaId
    )
);

                const mapeados = ativos.map((v: any) => ({
    id: (v.fkIdUser ?? v.idVinculo).toString(),
    nome: v.usuarioNome ?? 'Paciente',
    objetivo: v.usuarioObjetivo ?? 'Acompanhamento',
    corObj: '#2E7D32',
    foto: null,
}));

                console.log('VINCULO:', JSON.stringify(vinculos[0]));

                setPacientes(mapeados);

            } catch (err) {
                console.log('Erro ao carregar pacientes:', err);
            } finally {
                setLoading(false);
            }
        }

        carregarPacientes();
    }, []);
const filtrados = pacientes.filter(p =>
    (p.nome ?? '').toLowerCase().includes(busca.toLowerCase())
);

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={s.header}>
                    <Text style={s.titulo}>Meus Pacientes</Text>

                    {pacientes.length > 0 && (
                        <TouchableOpacity
                            style={s.btnAdicionar}
                            activeOpacity={0.85}
                            onPress={() => router.push('./CriarPaciente')}
                        >
                            <Ionicons name="add" size={26} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {pacientes.length > 0 && (
                    <View style={s.buscaBox}>
                        <Ionicons name="search-outline" size={18} color="#aaa" style={{ marginRight: 8 }} />
                        <TextInput
                            style={s.buscaInput}
                            placeholder="Buscar paciente..."
                            placeholderTextColor="#aaa"
                            value={busca}
                            onChangeText={setBusca}
                        />
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 32 }} />
                ) : pacientes.length === 0 ? (
                    <View style={s.rodape}>
                        <MaterialCommunityIcons name="account-search-outline" size={40} color="#ccc" />
                        <Text style={s.rodapeTexto}>Seu paciente não tem conta no aplicativo?</Text>
                        <TouchableOpacity
                            style={s.btnCriarConta}
                            activeOpacity={0.85}
                            onPress={() => router.push('./CriarPaciente')}
                        >
                            <MaterialCommunityIcons name="account-plus-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={s.btnCriarContaTexto}>Criar conta do paciente</Text>
                        </TouchableOpacity>
                    </View>
                ) : filtrados.length === 0 ? (
                    <View style={s.vazioCard}>
                        <MaterialCommunityIcons name="account-search-outline" size={40} color="#ccc" />
                        <Text style={s.vazioTexto}>Nenhum paciente encontrado</Text>
                    </View>
                ) : (
                    filtrados.map(p => (
                        <TouchableOpacity
                            key={p.id}
                            style={s.pacienteCard}
                            activeOpacity={0.8}
                            onPress={() => router.push({ pathname: './DetalhePaciente', params: { id: p.id } })}
                        >
                            {p.foto ? (
                                <Image source={{ uri: p.foto }} style={s.avatar} />
                            ) : (
                                <View style={s.avatarPlaceholder}>
                                    <Ionicons name="person" size={26} color="#bbb" />
                                </View>
                            )}

                            <View style={s.pacienteInfo}>
                                <Text style={s.pacienteNome}>{p.nome}</Text>
                                <View style={s.objRow}>
                                    <View style={[s.objDot, { backgroundColor: p.corObj }]} />
                                    <Text style={s.objTexto}>{p.objetivo}</Text>
                                </View>
                            </View>

                            <Ionicons name="chevron-forward" size={18} color="#ccc" />
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={s.tabBar}>
                <TouchableOpacity
                    style={s.tabItem}
                    onPress={() => router.push('./Dashboardnutricionista')}
                >
                    <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="#999" />
                    <Text style={s.tabTexto}>Painel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.tabItemAtivo}>
                    <MaterialCommunityIcons name="account-group" size={24} color="#2E7D32" />
                    <Text style={s.tabTextoAtivo}>Pacientes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={s.tabItem}
                    onPress={() => router.push('./PerfilNutricionista')}
                >
                    <Ionicons name="person-outline" size={24} color="#999" />
                    <Text style={s.tabTexto}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root:               { flex: 1, backgroundColor: '#F5F7F5' },
    scroll:             { paddingHorizontal: 20 },
    header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, marginBottom: 20 },
    titulo:             { fontSize: 28, fontWeight: '800', color: '#111' },
    btnAdicionar:       { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    buscaBox:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 50, marginBottom: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    buscaInput:         { flex: 1, fontSize: 15, color: '#111' },
    pacienteCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, gap: 12 },
    avatar:             { width: 52, height: 52, borderRadius: 26 },
    avatarPlaceholder:  { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    pacienteInfo:       { flex: 1 },
    pacienteNome:       { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
    objRow:             { flexDirection: 'row', alignItems: 'center', gap: 6 },
    objDot:             { width: 8, height: 8, borderRadius: 4 },
    objTexto:           { fontSize: 13, color: '#666' },
    vazioCard:          { alignItems: 'center', paddingVertical: 40, gap: 10 },
    vazioTexto:         { fontSize: 15, color: '#bbb', fontWeight: '500' },
    rodape:             { marginTop: 40, alignItems: 'center', gap: 20 },
    rodapeTexto:        { fontSize: 14, color: '#aaa', textAlign: 'center' },
    btnCriarConta:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E7D32', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 28, width: '100%', justifyContent: 'center', elevation: 3, shadowColor: '#2E7D32', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    btnCriarContaTexto: { fontSize: 16, fontWeight: '700', color: '#fff' },
    tabBar:             { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', paddingBottom: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', elevation: 10 },
    tabItem:            { flex: 1, alignItems: 'center', gap: 4 },
    tabItemAtivo:       { flex: 1, alignItems: 'center', gap: 4 },
    tabTexto:           { fontSize: 12, color: '#999', fontWeight: '500' },
    tabTextoAtivo:      { fontSize: 12, color: '#2E7D32', fontWeight: '700' },
});