import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView, StatusBar, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';
import { globalStyles as style } from '../props/globalStyles';

const RECEITAS_MOCK = [
    { id: 1, titulo: 'Panqueca de Aveia',      tempo: 15, calorias: 250, tags: ['Rico em Proteína'],                cor: '#5D8A4E' },
    { id: 2, titulo: 'Salada de Lentilha',     tempo: 20, calorias: 320, tags: ['Rico em Ferro', 'Rico em Proteína'], cor: '#3E7D5A' },
    { id: 3, titulo: 'Quinoa e Cogumelos',     tempo: 25, calorias: 410, tags: ['Rico em B12'],                     cor: '#4A7C59' },
    { id: 4, titulo: 'Bowl de Frutas',         tempo: 10, calorias: 180, tags: ['Vegano'],                          cor: '#6B9E6B' },
    { id: 5, titulo: 'Frango Grelhado',        tempo: 30, calorias: 380, tags: ['Rico em Proteína', 'Pós-treino'],  cor: '#3A6B45' },
    { id: 6, titulo: 'Omelete de Legumes',     tempo: 12, calorias: 210, tags: ['Café da Manhã'],                   cor: '#5C8C6E' },
];

const BUSCAS_RECENTES = ['Rápido e Fácil', 'Vegano', 'Café da Manhã', 'Pós-treino'];

const TAG_CORES: Record<string, string> = {
    'Rico em Proteína': '#1565C0',
    'Rico em Ferro':    '#B71C1C',
    'Rico em B12':      '#E65100',
    'Vegano':           '#2E7D32',
    'Café da Manhã':    '#6A1B9A',
    'Pós-treino':       '#00695C',
};

export default function BuscaReceitas() {
    const [busca, setBusca] = useState('');

    const receitasFiltradas = RECEITAS_MOCK.filter(r =>
        r.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(busca.toLowerCase()))
    );

    return (
        <View style={style.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F0F7F0" />

            <View style={styles.topBar}>
                <TouchableOpacity style={styles.voltarBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#333" />
                </TouchableOpacity>
                <View style={styles.inputWrapper}>
                    <Ionicons name="search" size={18} color="#aaa" />
                    <TextInput
                        style={styles.input}
                        placeholder="Buscar receitas saudáveis..."
                        placeholderTextColor="#aaa"
                        value={busca}
                        onChangeText={setBusca}
                        autoFocus
                    />
                    {busca.length > 0 && (
                        <TouchableOpacity onPress={() => setBusca('')}>
                            <Ionicons name="close-circle" size={18} color="#aaa" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {busca.length === 0 && (
                    <>
                        <Text style={styles.secaoTitulo}>Buscas Recentes</Text>
                        <View style={styles.chipsRow}>
                            {BUSCAS_RECENTES.map(c => (
                                <TouchableOpacity key={c} style={styles.chip} onPress={() => setBusca(c)}>
                                    {c === 'Rápido e Fácil' && <Ionicons name="time-outline" size={14} color="#333" />}
                                    {c === 'Vegano' && <MaterialCommunityIcons name="leaf" size={14} color="#333" />}
                                    <Text style={styles.chipTexto}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <Text style={styles.secaoTitulo}>
                    {busca.length > 0 ? `Resultados para "${busca}"` : 'Sugeridos para Você'}
                </Text>

                {receitasFiltradas.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.cardReceita, { backgroundColor: item.cor }]}
                        activeOpacity={0.88}
                        onPress={() => router.push({ pathname: './DetalheReceita', params: { id: item.id } })}
                    >
                        <View style={styles.cardOverlay}>
                            <Text style={styles.cardTitulo}>{item.titulo}</Text>
                            <View style={styles.cardMeta}>
                                <Ionicons name="time-outline" size={13} color="#fff" />
                                <Text style={styles.cardMetaTexto}>{item.tempo} min</Text>
                                <View style={styles.ponto} />
                                <MaterialCommunityIcons name="fire" size={13} color="#fff" />
                                <Text style={styles.cardMetaTexto}>{item.calorias} kcal</Text>
                            </View>
                            <View style={styles.tagsRow}>
                                {item.tags.map(t => (
                                    <View key={t} style={[styles.tagBadge, { backgroundColor: TAG_CORES[t] ?? '#333' }]}>
                                        <Text style={styles.tagTexto}>{t}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {receitasFiltradas.length === 0 && (
                    <View style={styles.vazioBox}>
                        <Ionicons name="search-outline" size={40} color="#ccc" />
                        <Text style={styles.vazioTexto}>Nenhuma receita encontrada</Text>
                    </View>
                )}

            </ScrollView>

            <View style={style.tabBar}>
                <TouchableOpacity style={style.tabItemAtivo} onPress={() => router.push('./Receitas')}>
                    <MaterialCommunityIcons name="food-fork-drink" size={20} color="#2E7D32" />
                    <Text style={style.tabTextoAtivo}>Receitas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.tabItem} onPress={() => router.push('./Dashboard')}>
                    <Ionicons name="grid-outline" size={24} color="#999" />
                    <Text style={styles.tabTexto}>Dashboard</Text>
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
    topBar:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 10 },
    voltarBtn:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3 },
    inputWrapper:  { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 22, paddingHorizontal: 14, height: 44, elevation: 3, gap: 8 },
    input:         { flex: 1, fontSize: 14, color: '#333' },
    scroll:        { paddingHorizontal: 20, paddingBottom: 110 },
    secaoTitulo:   { fontSize: 18, fontWeight: '800', color: '#111', marginTop: 20, marginBottom: 14 },
    chipsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
    chip:          { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
    chipTexto:     { fontSize: 13, fontWeight: '600', color: '#333' },
    cardReceita:   { borderRadius: 20, overflow: 'hidden', marginBottom: 16, height: 200 },
    cardOverlay:   { flex: 1, justifyContent: 'flex-end', padding: 18, backgroundColor: 'rgba(0,0,0,0.28)' },
    cardTitulo:    { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 },
    cardMeta:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    cardMetaTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
    ponto:         { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.6)' },
    tagsRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    tagBadge:      { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
    tagTexto:      { color: '#fff', fontSize: 12, fontWeight: '700' },
    vazioBox:      { alignItems: 'center', paddingTop: 60, gap: 12 },
    vazioTexto:    { fontSize: 14, color: '#aaa' },
    tabTexto:      { fontSize: 12, color: '#999', fontWeight: '500', marginTop: 3 },
});