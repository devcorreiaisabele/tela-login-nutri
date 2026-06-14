import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image, ScrollView, StatusBar, StyleSheet,
    Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { getOuCriarPlanoUsuario, upsertReceitaNoPlano } from '../src/services/planoReceitaService';
import { getReceitas } from '../src/services/receitaService_1';

function normalizar(texto: string) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parecido(a: string, b: string) {
    if (a === b) return true;
    if (b.includes(a) || a.includes(b)) return true;
    let erros = 0;
    const tamanho = Math.max(a.length, b.length);
    for (let i = 0; i < tamanho; i++) {
        if (a[i] !== b[i]) erros++;
        if (erros > 2) return false;
    }
    return true;
}

export default function EscolherReceita() {
    const { refeicao } = useLocalSearchParams<{ refeicao: string }>();
    const [busca,     setBusca]     = useState('');
    const [sugestoes, setSugestoes] = useState<any[]>([]);
    const [salvando,  setSalvando]  = useState(false);

    useEffect(() => {
        async function carregarReceitas() {
            try {
                const dados = await getReceitas();
                const receitasFormatadas = dados.map((r: any) => ({
                    id:     String(r.idReceita),
                    titulo: r.titulo,
                    kcal:   String(r.calorias),
                    tempo:  String(r.tempoPreparo),
                    desc:   r.observacoes || r.ingredientes || '',
                    imagem: r.imagemUrl,
                    tags:   r.tags || '',
                }));
                setSugestoes(receitasFormatadas);
            } catch (error) {
                console.log('Erro ao buscar receitas:', error);
            }
        }
        carregarReceitas();
    }, []);

    const filtradas = sugestoes.filter(r => {
        if (!busca.trim()) return true;
        const termo = normalizar(busca);
        const texto = normalizar(`${r.titulo || ''} ${r.desc || ''} ${r.tags || ''}`);
        const palavras = termo.split(' ').filter(Boolean);
        const palavrasTexto = texto.split(/\s+/).filter(Boolean);
        return palavras.every(palavra => palavrasTexto.some(p => parecido(palavra, p)));
    });

    const handleEscolher = async (item: any) => {
    if (salvando) return;
    setSalvando(true);
    try {
        const usuarioId = await AsyncStorage.getItem('usuarioId');
        console.log('USUARIO ID:', usuarioId); 
        if (!usuarioId) return;

        const refeicaoTipo = Array.isArray(refeicao) ? refeicao[0] : (refeicao ?? 'Jantar');

        const plano = await getOuCriarPlanoUsuario(usuarioId);
        console.log('PLANO:', JSON.stringify(plano)); 

        await upsertReceitaNoPlano(plano.idPlano, Number(item.id), refeicaoTipo);

            router.back();
        } catch (e) {
            console.log('Erro ao salvar receita:', e);
        } finally {
            setSalvando(false);
        }
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

                {filtradas.map(item => (
                    <View key={item.id} style={styles.cardReceita}>
                        <Image source={{ uri: item.imagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                        <TouchableOpacity
                            style={[styles.addBtn, salvando && { opacity: 0.6 }]}
                            onPress={() => handleEscolher(item)}
                            disabled={salvando}
                        >
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
    root:         { flex: 1, backgroundColor: '#fff' },
    scroll:       { paddingBottom: 40 },
    header:       { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 18, paddingBottom: 20, gap: 14 },
    voltarBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    headerTitulo: { fontSize: 20, fontWeight: '800', color: '#111' },
    buscaWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 16, marginHorizontal: 18, paddingHorizontal: 14, paddingVertical: 12, gap: 10, marginBottom: 24 },
    buscaInput:   { flex: 1, fontSize: 14, color: '#333' },
    secaoTitulo:  { fontSize: 18, fontWeight: '800', color: '#111', marginHorizontal: 18, marginBottom: 16 },
    cardReceita:  { marginHorizontal: 18, borderRadius: 22, overflow: 'hidden', height: 220, marginBottom: 18, backgroundColor: '#ccc' },
    addBtn:       { position: 'absolute', top: 14, right: 14, width: 42, height: 42, borderRadius: 21, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 4 },
    badges:       { position: 'absolute', bottom: 70, left: 16, flexDirection: 'row', gap: 10, zIndex: 10 },
    badge:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
    badgeTexto:   { color: '#fff', fontSize: 12, fontWeight: '600' },
    overlay:      { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.45)' },
    cardTitulo:   { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
    cardDesc:     { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
});