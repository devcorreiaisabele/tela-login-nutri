import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const SUGESTOES = [
    { id: '1', titulo: 'Sopa Cremosa de Abóbora',  kcal: '250', tempo: '25', desc: 'Leve, nutritiva e perfeita para um jantar de fácil digestão.',         imagem: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&auto=format&fit=crop' },
    { id: '2', titulo: 'Salmão com Aspargos',       kcal: '410', tempo: '35', desc: 'Rico em ômega-3 e proteínas. Uma refeição deliciosa e saciante.',       imagem: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop' },
    { id: '3', titulo: 'Omelete de Espinafre',      kcal: '280', tempo: '15', desc: 'Super rápido de preparar, com bastante ferro e baixo carboidrato.',     imagem: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop' },
    { id: '4', titulo: 'Frango Grelhado com Arroz', kcal: '520', tempo: '40', desc: 'Clássico e nutritivo, ideal para repor energia após treinos.',          imagem: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=800&auto=format&fit=crop' },
    { id: '5', titulo: 'Bowl de Açaí Fit',          kcal: '320', tempo: '10', desc: 'Refrescante e cheio de antioxidantes, perfeito para o café da manhã.', imagem: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop' },
    { id: '6', titulo: 'Wrap de Atum com Salada',   kcal: '380', tempo: '20', desc: 'Leve e proteico, ótimo para o almoço ou lanche da tarde.',             imagem: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop' },
];

export default function EscolherReceita() {
    const { refeicao } = useLocalSearchParams<{ refeicao: string }>();
    const [busca, setBusca] = useState('');

    const filtradas = SUGESTOES.filter(r =>
        r.titulo.toLowerCase().includes(busca.toLowerCase())
    );

    const handleEscolher = async (item: typeof SUGESTOES[0]) => {
        await AsyncStorage.setItem('receitaEscolhida', JSON.stringify({
            refeicao: refeicao ?? 'Jantar',
            titulo: item.titulo,
            desc: item.desc,
            imagem: item.imagem,
        }));
        router.back();
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <TouchableOpacity style={styles.voltarBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitulo}>Sugestões para {refeicao ?? 'Jantar'}</Text>
                </View>

                <View style={styles.buscaWrapper}>
                    <Ionicons name="search" size={18} color="#aaa" />
                    <TextInput
                        style={styles.buscaInput}
                        placeholder={`Buscar receitas ideais para o ${(refeicao ?? 'jantar').toLowerCase()}...`}
                        placeholderTextColor="#aaa"
                        value={busca}
                        onChangeText={setBusca}
                    />
                </View>

                <Text style={styles.secaoTitulo}>Recomendadas para você</Text>

                {filtradas.map((item) => (
                    <View key={item.id} style={styles.cardReceita}>
                        <Image source={{ uri: item.imagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                        <TouchableOpacity style={styles.addBtn} onPress={() => handleEscolher(item)}>
                            <Ionicons name="add" size={26} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.badges}>
                            <View style={styles.badge}>
                                <MaterialCommunityIcons name="fire" size={13} color="#fff" />
                                <Text style={styles.badgeTexto}>{item.kcal} Kcal</Text>
                            </View>
                            <View style={styles.badge}>
                                <Ionicons name="time-outline" size={13} color="#fff" />
                                <Text style={styles.badgeTexto}>{item.tempo} min</Text>
                            </View>
                        </View>
                        <View style={styles.overlay}>
                            <Text style={styles.cardTitulo}>{item.titulo}</Text>
                            <Text style={styles.cardDesc}>{item.desc}</Text>
                        </View>
                    </View>
                ))}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root:           { flex: 1, backgroundColor: '#fff' },
    scroll:         { paddingBottom: 40 },
    header:         { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 18, paddingBottom: 20, gap: 14 },
    voltarBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    headerTitulo:   { fontSize: 20, fontWeight: '800', color: '#111' },
    buscaWrapper:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 16, marginHorizontal: 18, paddingHorizontal: 14, paddingVertical: 12, gap: 10, marginBottom: 24 },
    buscaInput:     { flex: 1, fontSize: 14, color: '#333' },
    secaoTitulo:    { fontSize: 18, fontWeight: '800', color: '#111', marginHorizontal: 18, marginBottom: 16 },
    cardReceita:    { marginHorizontal: 18, borderRadius: 22, overflow: 'hidden', height: 220, marginBottom: 18, backgroundColor: '#ccc' },
    addBtn:         { position: 'absolute', top: 14, right: 14, width: 42, height: 42, borderRadius: 21, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 4 },
    badges:         { position: 'absolute', bottom: 70, left: 16, flexDirection: 'row', gap: 10, zIndex: 10 },
    badge:          { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
    badgeTexto:     { color: '#fff', fontSize: 12, fontWeight: '600' },
    overlay:        { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.45)' },
    cardTitulo:     { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
    cardDesc:       { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
});