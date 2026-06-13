import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import api from '../src/services/api';
import { getPlanosByUsuario } from '../src/services/planoService_1';

export default function PlanoAlimentar() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [plano,   setPlano]   = useState<any>(null);
    const [receitas, setReceitas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro,    setErro]    = useState(false);

    useEffect(() => {
        async function buscar() {
            try {
                let planoAtivo: any = null;

                if (id) {
                    const resp = await api.get(`/plano/${id}`);
                    planoAtivo = resp.data;
                } else {
                    const usuarioId = await AsyncStorage.getItem('usuarioId');
                    const planos = await getPlanosByUsuario(usuarioId);
                    planoAtivo = planos.find((p: any) => p.status === 'Ativo');
                }

                if (!planoAtivo) { setErro(true); return; }
                setPlano(planoAtivo);


                const respReceitas = await api.get(`/planoreceita/plano/${planoAtivo.idPlano}`);
                setReceitas(respReceitas.data ?? []);
            } catch {
                setErro(true);
            } finally {
                setLoading(false);
            }
        }
        buscar();
    }, []);

    if (loading) return (
        <View style={s.centralizador}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={s.loadingTexto}>Carregando plano alimentar...</Text>
        </View>
    );

    if (erro || !plano) return (
        <View style={s.centralizador}>
            <MaterialCommunityIcons name="food-off" size={52} color="#ccc" />
            <Text style={s.erroTexto}>
                Nenhum plano alimentar ativo.{'\n'}Aguarde seu nutricionista criar um para você.
            </Text>
            <TouchableOpacity style={s.btnVoltar2} onPress={() => router.back()}>
                <Text style={s.btnVoltarTexto}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.btnVoltar}>
                    <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Plano Alimentar</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                <View style={s.resumoCard}>
                    <Text style={s.resumoNome}>{plano.usuarioNome ?? 'Paciente'}</Text>
                    <Text style={s.nutriNome}>Nutricionista: {plano.nutricionistaNome ?? '--'}</Text>
                </View>

                <Text style={s.secaoTitulo}>Metas Nutricionais Diárias</Text>
                <View style={s.metasRow}>
                    <View style={s.metaCard}>
                        <MaterialCommunityIcons name="fire" size={20} color="#E65100" />
                        <Text style={s.metaValor}>{plano.caloriasAlvo ?? '--'}</Text>
                        <Text style={s.metaLabel}>kcal</Text>
                    </View>
                    <View style={s.metaCard}>
                        <MaterialCommunityIcons name="arm-flex" size={20} color="#1565C0" />
                        <Text style={s.metaValor}>{plano.proteinaAlvo ?? '--'}g</Text>
                        <Text style={s.metaLabel}>Proteína</Text>
                    </View>
                    <View style={s.metaCard}>
                        <MaterialCommunityIcons name="bread-slice" size={20} color="#F9A825" />
                        <Text style={s.metaValor}>{plano.carboAlvo ?? '--'}g</Text>
                        <Text style={s.metaLabel}>Carbo</Text>
                    </View>
                    <View style={s.metaCard}>
                        <MaterialCommunityIcons name="water" size={20} color="#2E7D32" />
                        <Text style={s.metaValor}>{plano.gorduraAlvo ?? '--'}g</Text>
                        <Text style={s.metaLabel}>Gordura</Text>
                    </View>
                </View>

                <Text style={s.secaoTitulo}>Refeições do Plano</Text>

                {receitas.length === 0 ? (
                    <View style={s.semReceitas}>
                        <MaterialCommunityIcons name="food-off" size={40} color="#ccc" />
                        <Text style={s.semReceitasTexto}>Nenhuma refeição adicionada ainda.</Text>
                    </View>
                ) : (
                    receitas.map((pr: any, index: number) => (
                        <View key={pr.idPlanoReceita} style={s.dietaCard}>
                            <View style={s.dietaHeader}>
                                <View style={s.dietaIconeWrap}>
                                    <MaterialCommunityIcons
                                        name={index === 0 ? 'coffee-outline' : index === receitas.length - 1 ? 'moon-waning-crescent' : 'food-fork-drink'}
                                        size={20} color="#2E7D32"
                                    />
                                </View>
                                <Text style={s.dietaRefeicao}>{pr.receitaTitulo ?? 'Receita'}</Text>
                            </View>

                            {pr.receitaCalorias && (
                                <View style={s.macrosRow}>
                                    <Text style={s.macroBadge}>🔥 {pr.receitaCalorias} kcal</Text>
                                </View>
                            )}

                            {pr.receitaIngredientes?.split('\n').map((item: string, i: number) => (
                                <Text key={i} style={s.dietaItem}>• {item}</Text>
                            ))}
                        </View>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root:            { flex: 1, backgroundColor: '#F5F7F5' },
    centralizador:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, backgroundColor: '#F5F7F5', paddingHorizontal: 32 },
    loadingTexto:    { fontSize: 14, color: '#888', marginTop: 8 },
    erroTexto:       { fontSize: 15, color: '#aaa', textAlign: 'center', lineHeight: 22 },
    btnVoltar2:      { marginTop: 8, backgroundColor: '#2E7D32', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
    btnVoltarTexto:  { color: '#fff', fontWeight: '700', fontSize: 15 },
    header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 54, paddingBottom: 12 },
    btnVoltar:       { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    headerTitulo:    { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
    scroll:          { paddingHorizontal: 20, paddingBottom: 24 },
    resumoCard:      { backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 20, elevation: 2 },
    resumoNome:      { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 8 },
    nutriNome:       { fontSize: 12, color: '#888' },
    secaoTitulo:     { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 14 },
    metasRow:        { flexDirection: 'row', gap: 10, marginBottom: 24 },
    metaCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, elevation: 1 },
    metaValor:       { fontSize: 16, fontWeight: '800', color: '#111' },
    metaLabel:       { fontSize: 11, color: '#888' },
    dietaCard:       { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 1 },
    dietaHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    dietaIconeWrap:  { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F0F7F0', justifyContent: 'center', alignItems: 'center' },
    dietaRefeicao:   { flex: 1, fontSize: 16, fontWeight: '700', color: '#111' },
    macrosRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    macroBadge:      { backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, color: '#555', fontWeight: '600' },
    dietaItem:       { fontSize: 14, color: '#555', lineHeight: 22 },
    semReceitas:     { alignItems: 'center', paddingVertical: 30, gap: 10 },
    semReceitasTexto:{ color: '#aaa', fontSize: 14, textAlign: 'center' },
});
