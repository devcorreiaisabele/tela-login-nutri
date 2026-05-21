import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getReceitas } from '../src/services/receitaService_1';

type Receita = {
    idReceita: number;
    titulo: string;
    calorias: number;
    tempoPreparo: number;
    ingredientes: string;
    modoPreparo: string;
    tags: string;
    observacoes: string;
    proteinas: number;
    carbos: number;
    gorduras: number;
    imagemUrl: string;
};

export default function SugestoesReceitas() {
    const [receitas, setReceitas] = useState<Receita[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReceitas()
            .then(setReceitas)
            .catch(() => Alert.alert('Erro', 'Não foi possível carregar as receitas.'))
            .finally(() => setLoading(false));
    }, []);

    function sugerirPaciente(titulo: string) {
        Alert.alert(
            'Sugerir Receita',
            `Deseja sugerir "${titulo}" a um paciente?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sugerir',
                    onPress: () => router.push('./PacientesNutricionista'),
                },
            ],
        );
    }

    if (loading) {
        return (
            <View style={s.centralizador}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={s.loadingTexto}>Carregando receitas...</Text>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            <View style={s.header}>
                <TouchableOpacity style={s.btnVoltar} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Sugestões de Receitas</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                {receitas.length === 0 ? (
                    <View style={s.centralizador}>
                        <MaterialCommunityIcons name="food-off" size={48} color="#ccc" />
                        <Text style={s.semDados}>Nenhuma receita cadastrada ainda.</Text>
                    </View>
                ) : (
                    receitas.map(r => {
                        const tags = r.tags ? r.tags.split(',').map(t => t.trim()) : [];
                        return (
                            <View key={r.idReceita} style={s.card}>
                                <View style={s.imgBox}>
                                    {r.imagemUrl ? (
                                        <Image source={{ uri: r.imagemUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                                    ) : (
                                        <View style={s.imgPlaceholder} />
                                    )}
                                    {tags.length > 0 && (
                                        <View style={s.tagsRow}>
                                            {tags.slice(0, 2).map(t => (
                                                <View key={t} style={s.tag}>
                                                    <Text style={s.tagTexto}>{t}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <View style={s.imgOverlay}>
                                        <Text style={s.receitaTitulo}>{r.titulo}</Text>
                                        <View style={s.infoRow}>
                                            {r.tempoPreparo > 0 && (
                                                <>
                                                    <Ionicons name="time-outline" size={14} color="#fff" />
                                                    <Text style={s.infoTexto}>{r.tempoPreparo} min</Text>
                                                </>
                                            )}
                                            {r.calorias > 0 && (
                                                <>
                                                    <MaterialCommunityIcons name="fire" size={14} color="#fff" style={{ marginLeft: 10 }} />
                                                    <Text style={s.infoTexto}>{r.calorias} kcal</Text>
                                                </>
                                            )}
                                        </View>
                                        {r.observacoes ? (
                                            <Text style={s.receitaDesc} numberOfLines={2}>{r.observacoes}</Text>
                                        ) : (
                                            <Text style={s.receitaDesc} numberOfLines={2}>{r.ingredientes}</Text>
                                        )}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={s.btnSugerir}
                                    activeOpacity={0.85}
                                    onPress={() => sugerirPaciente(r.titulo)}
                                >
                                    <Text style={s.btnSugerirTexto}>Sugerir a Paciente</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root:           { flex: 1, backgroundColor: '#F5F7F5' },
    centralizador:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 60 },
    loadingTexto:   { fontSize: 14, color: '#888', marginTop: 8 },
    semDados:       { fontSize: 14, color: '#aaa', marginTop: 8 },
    header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 18, paddingBottom: 16 },
    btnVoltar:      { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    headerTitulo:   { fontSize: 18, fontWeight: '700', color: '#111' },
    scroll:         { paddingHorizontal: 18, paddingTop: 4 },
    card:           { backgroundColor: '#fff', borderRadius: 22, marginBottom: 20, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
    imgBox:         { height: 220, backgroundColor: '#C8E6C9', justifyContent: 'flex-end' },
    imgPlaceholder: { ...StyleSheet.absoluteFillObject, backgroundColor: '#A5D6A7' },
    tagsRow:        { position: 'absolute', top: 14, left: 14, flexDirection: 'row', gap: 8 },
    tag:            { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    tagTexto:       { color: '#fff', fontSize: 12, fontWeight: '600' },
    imgOverlay:     { padding: 16, backgroundColor: 'rgba(0,0,0,0.35)' },
    receitaTitulo:  { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 },
    infoRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    infoTexto:      { fontSize: 13, color: '#fff', marginLeft: 4 },
    receitaDesc:    { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
    btnSugerir:     { backgroundColor: '#2E7D32', margin: 14, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
    btnSugerirTexto:{ color: '#fff', fontSize: 15, fontWeight: '700' },
});
