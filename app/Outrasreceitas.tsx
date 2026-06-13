import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Image, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { globalStyles as style } from '../props/globalStyles';
import { getReceitas } from '../src/services/receitaService_1';

const CATEGORIAS = ['Todos', 'Café da Manhã', 'Lanche', 'Almoço', 'Jantar'];

function normalizarTags(tags: unknown): string[] {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) return parsed;
        } catch {}
        return tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
}

function mapearReceita(r: any) {
    return {
        id:     String(r.idReceita ?? ''),
        titulo: r.titulo ?? '',
        tempo:  r.tempoPreparo != null ? `${r.tempoPreparo} min` : '',
        kcal:   r.calorias ?? 0,
        tags:   normalizarTags(r.tags),
        imagem: r.imagemUrl ?? '',
    };
}

export default function OutrasReceitas() {
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
    const [receitas,       setReceitas]       = useState<any[]>([]);
    const [carregando,     setCarregando]     = useState(true);
    const [erro,           setErro]           = useState<string | null>(null);

    useEffect(() => { carregarReceitas(); }, []);

    async function carregarReceitas() {
        try {
            setCarregando(true);
            setErro(null);
            const data = await getReceitas();
            setReceitas((Array.isArray(data) ? data : []).map(mapearReceita));
        } catch (e: any) {
            setErro('Não foi possível carregar as receitas.');
        } finally {
            setCarregando(false);
        }
    }

    const filtradas = categoriaAtiva === 'Todos'
        ? receitas
        : receitas.filter(r => r.tags.includes(categoriaAtiva));

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F2" />

            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.btnIcone}>
                    <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Outras Receitas</Text>
                <TouchableOpacity style={s.btnIcone} onPress={() => router.push('./BuscaReceitas')}>
                    <Ionicons name="search" size={22} color="#1a1a1a" />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filtrosContainer} style={s.filtrosScroll}>
                {CATEGORIAS.map(cat => (
                    <TouchableOpacity key={cat}
                        style={[s.filtroPill, categoriaAtiva === cat && s.filtroPillAtivo]}
                        onPress={() => setCategoriaAtiva(cat)} activeOpacity={0.8}>
                        <Text style={[s.filtroTexto, categoriaAtiva === cat && s.filtroTextoAtivo]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {carregando ? (
                <View style={s.centro}><ActivityIndicator size="large" color="#2E7D32" /></View>
            ) : erro ? (
                <View style={s.centro}>
                    <Text style={s.erroTexto}>{erro}</Text>
                    <TouchableOpacity onPress={carregarReceitas} style={s.btnTentar}>
                        <Text style={s.btnTentarTexto}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={s.lista} showsVerticalScrollIndicator={false}>
                    {filtradas.length === 0 ? (
                        <Text style={s.vazioTexto}>Nenhuma receita encontrada.</Text>
                    ) : (
                        filtradas.map(r => (
                            <TouchableOpacity key={r.id} style={s.card} activeOpacity={0.85}
                                onPress={() => router.push({ pathname: './DetalheReceita', params: { id: r.id } })}>
                                <Image source={{ uri: r.imagem }} style={s.cardImagem} resizeMode="cover" />
                                <View style={s.cardInfo}>
                                    <Text style={s.cardTitulo} numberOfLines={1}>{r.titulo}</Text>
                                    <View style={s.tagsRow}>
                                        {r.tags.map((tag: string) => (
                                            <View key={tag} style={s.tag}>
                                                <Text style={s.tagTexto}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={s.metaRow}>
                                        <Ionicons name="time-outline" size={13} color="#888" />
                                        <Text style={s.metaTexto}>{r.tempo}</Text>
                                        <MaterialCommunityIcons name="fire" size={13} color="#888" style={{ marginLeft: 10 }} />
                                        <Text style={s.metaTexto}>{r.kcal} kcal</Text>
                                    </View>
                                </View>
                                <View style={s.btnSeta}>
                                    <Ionicons name="chevron-forward" size={16} color="#2E7D32" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}

            <View style={style.tabBar}>
                <TouchableOpacity style={style.tabItemAtivo} onPress={() => router.push('./Receitas')}>
                    <MaterialCommunityIcons name="food-fork-drink" size={24} color="#2E7D32" />
                    <Text style={style.tabTextoAtivo}>Receitas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.tabItem} onPress={() => router.push('./Dashboard')}>
                    <Ionicons name="grid-outline" size={24} color="#999" />
                    <Text style={s.tabTexto}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.tabItem} onPress={() => router.push('./Perfil')}>
                    <Ionicons name="person-outline" size={24} color="#999" />
                    <Text style={s.tabTexto}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root:             { flex: 1, backgroundColor: '#F5F7F2' },
    header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16 },
    btnIcone:         { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    headerTitulo:     { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
    filtrosScroll:    { maxHeight: 52, marginBottom: 16 },
    filtrosContainer: { paddingHorizontal: 20, gap: 10, alignItems: 'center' },
    filtroPill:       { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0' },
    filtroPillAtivo:  { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    filtroTexto:      { fontSize: 14, fontWeight: '600', color: '#888' },
    filtroTextoAtivo: { color: '#fff' },
    lista:            { paddingHorizontal: 20, gap: 12 },
    card:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 12, gap: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    cardImagem:       { width: 90, height: 90, borderRadius: 14 },
    cardInfo:         { flex: 1, gap: 6 },
    cardTitulo:       { fontSize: 16, fontWeight: '800', color: '#111' },
    tagsRow:          { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    tag:              { backgroundColor: '#EEF5EC', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    tagTexto:         { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
    metaRow:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaTexto:        { fontSize: 12, color: '#888', fontWeight: '500' },
    btnSeta:          { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EEF5EC', justifyContent: 'center', alignItems: 'center' },
    tabTexto:         { fontSize: 12, color: '#999', fontWeight: '500', marginTop: 3 },
    centro:           { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    erroTexto:        { fontSize: 14, color: '#c0392b', textAlign: 'center', marginBottom: 12 },
    btnTentar:        { backgroundColor: '#2E7D32', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    btnTentarTexto:   { color: '#fff', fontWeight: '700' },
    vazioTexto:       { textAlign: 'center', color: '#888', marginTop: 40 },
});
