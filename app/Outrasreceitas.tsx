import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { globalStyles as style } from '../props/globalStyles';

type Receita = {
    id: string;
    titulo: string;
    tempo: string;
    kcal: number;
    tags: string[];
    categoria: string;
    imagem: string;
};

const RECEITAS: Receita[] = [
    {
        id: '1',
        titulo: 'Smoothie Verde',
        tempo: '10 min',
        kcal: 180,
        tags: ['Vegano', 'Detox'],
        categoria: 'Café da Manhã',
        imagem: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
    },
    {
        id: '2',
        titulo: 'Avocado Toast',
        tempo: '15 min',
        kcal: 240,
        tags: ['Veg', 'Fibras'],
        categoria: 'Café da Manhã',
        imagem: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400',
    },
    {
        id: '3',
        titulo: 'Salada Tropical',
        tempo: '12 min',
        kcal: 120,
        tags: ['Vegano', 'Doce'],
        categoria: 'Almoço',
        imagem: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    },
    {
        id: '4',
        titulo: 'Wrap de Frango',
        tempo: '20 min',
        kcal: 320,
        tags: ['Proteína', 'Completo'],
        categoria: 'Almoço',
        imagem: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400',
    },
    {
        id: '5',
        titulo: 'Bowl de Quinoa',
        tempo: '25 min',
        kcal: 280,
        tags: ['Vegano', 'Saudável'],
        categoria: 'Almoço',
        imagem: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    },
    {
        id: '6',
        titulo: 'Omelete de Espinafre',
        tempo: '10 min',
        kcal: 190,
        tags: ['Low Carb', 'Proteína'],
        categoria: 'Café da Manhã',
        imagem: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400',
    },
];

const CATEGORIAS = ['Todos', 'Café da Manhã', 'Lanche', 'Almoço', 'Jantar'];

export default function OutrasReceitas() {
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

    const filtradas = categoriaAtiva === 'Todos'
        ? RECEITAS
        : RECEITAS.filter(r => r.categoria === categoriaAtiva);

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F2" />


            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.btnIcone}>
                    <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Outras Receitas</Text>
                <TouchableOpacity style={s.btnIcone}>
                    <Ionicons name="search" size={22} color="#1a1a1a" />
                </TouchableOpacity>
            </View>


            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filtrosContainer}
                style={s.filtrosScroll}
            >
                {CATEGORIAS.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[s.filtroPill, categoriaAtiva === cat && s.filtroPillAtivo]}
                        onPress={() => setCategoriaAtiva(cat)}
                        activeOpacity={0.8}
                    >
                        <Text style={[s.filtroTexto, categoriaAtiva === cat && s.filtroTextoAtivo]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>


            <ScrollView
                contentContainerStyle={s.lista}
                showsVerticalScrollIndicator={false}
            >
                {filtradas.map(r => (
                    <TouchableOpacity key={r.id} style={s.card} activeOpacity={0.85}>
                        <Image source={{ uri: r.imagem }} style={s.cardImagem} resizeMode="cover" />
                        <View style={s.cardInfo}>
                            <Text style={s.cardTitulo} numberOfLines={1}>{r.titulo}</Text>
                            <View style={s.tagsRow}>
                                {r.tags.map(tag => (
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
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>


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
});
