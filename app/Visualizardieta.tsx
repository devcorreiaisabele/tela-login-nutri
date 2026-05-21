import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getPlanos } from '../src/services/planoService_1';

type Receita = {
    idReceita: number;
    titulo: string;
    ingredientes: string;
    modoPreparo: string;
    calorias: number;
    proteinas: number;
    carbos: number;
    gorduras: number;
    tempoPreparo: number;
    tags: string;
    observacoes: string;
};

type PlanoReceita = {
    idPlanoReceita: number;
    dataInclusao: string;
    receita: Receita;
};

type Plano = {
    idPlano: number;
    caloriasAlvo: number;
    proteinaAlvo: number;
    gorduraAlvo: number;
    carboAlvo: number;
    status: string;
    createdAt: string;
    usuario: { nomeCompleto: string; objetivoSaude: string };
    nutricionista: { nomeCompleto: string };
    planoReceitas: PlanoReceita[];
};

export default function VisualizarDieta() {
    const [plano, setPlano]     = useState<Plano | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro]       = useState(false);

    useEffect(() => {
        async function buscar() {
            try {
                const usuarioId = await AsyncStorage.getItem('usuarioId');
                const planos = await getPlanos();
                const meuPlano = planos.find(
                    (p: any) =>
                        p.usuario?.idUser?.toString() === usuarioId &&
                        p.status === 'Ativo'
                );

                if (meuPlano) {
                    setPlano(meuPlano);
                } else {
                    setErro(true);
                }
            } catch {
                setErro(true);
            } finally {
                setLoading(false);
            }
        }
        buscar();
    }, []);

    if (loading) {
        return (
            <View style={styles.centralizador}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingTexto}>Carregando seu plano alimentar...</Text>
            </View>
        );
    }

    if (erro || !plano) {
        return (
            <View style={styles.centralizador}>
                <MaterialCommunityIcons name="alert-circle-outline" size={52} color="#ccc" />
                <Text style={styles.erroTexto}>
                    Nenhum plano alimentar ativo encontrado.{'\n'}Aguarde seu nutricionista criar um plano para você.
                </Text>
                <TouchableOpacity style={styles.btnTentar} onPress={() => router.back()}>
                    <Text style={styles.btnTentarTexto}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const receitas = plano.planoReceitas ?? [];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitulo}>Meu Plano Alimentar</Text>
                <View style={{ width: 38 }} />
            </View>

            <View style={styles.bannerLeitura}>
                <Ionicons name="information-circle-outline" size={15} color="#555" />
                <Text style={styles.bannerLeituraTexto}>Modo de visualização (Apenas Leitura)</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>


                <View style={styles.cardUsuario}>
                    <Text style={styles.cardUsuarioNome}>{plano.usuario?.nomeCompleto}</Text>
                    {plano.usuario?.objetivoSaude ? (
                        <View style={styles.objetivoBadge}>
                            <Text style={styles.objetivoTexto}>Objetivo: {plano.usuario.objetivoSaude}</Text>
                        </View>
                    ) : null}
                    <Text style={styles.nutriNome}>Nutricionista: {plano.nutricionista?.nomeCompleto}</Text>
                </View>

                <Text style={styles.secaoTitulo}>Metas Nutricionais</Text>
                <View style={styles.metasGrid}>
                    <View style={styles.metaCard}>
                        <MaterialCommunityIcons name="fire" size={22} color="#E65100" />
                        <Text style={styles.metaValor}>{plano.caloriasAlvo ?? '--'}</Text>
                        <Text style={styles.metaLabel}>kcal</Text>
                    </View>
                    <View style={styles.metaCard}>
                        <MaterialCommunityIcons name="arm-flex" size={22} color="#1565C0" />
                        <Text style={styles.metaValor}>{plano.proteinaAlvo ?? '--'}g</Text>
                        <Text style={styles.metaLabel}>Proteína</Text>
                    </View>
                    <View style={styles.metaCard}>
                        <MaterialCommunityIcons name="bread-slice" size={22} color="#F9A825" />
                        <Text style={styles.metaValor}>{plano.carboAlvo ?? '--'}g</Text>
                        <Text style={styles.metaLabel}>Carbo</Text>
                    </View>
                    <View style={styles.metaCard}>
                        <MaterialCommunityIcons name="water" size={22} color="#2E7D32" />
                        <Text style={styles.metaValor}>{plano.gorduraAlvo ?? '--'}g</Text>
                        <Text style={styles.metaLabel}>Gordura</Text>
                    </View>
                </View>

                <Text style={styles.secaoTitulo}>Receitas do Plano</Text>

                {receitas.length === 0 ? (
                    <View style={styles.semReceitas}>
                        <MaterialCommunityIcons name="food-off" size={40} color="#ccc" />
                        <Text style={styles.semReceitasTexto}>Nenhuma receita adicionada ao plano ainda.</Text>
                    </View>
                ) : (
                    receitas.map(pr => (
                        <View key={pr.idPlanoReceita} style={styles.cardReceita}>
                            <View style={styles.receitaHeader}>
                                <View style={styles.receitaIcone}>
                                    <MaterialCommunityIcons name="food-apple-outline" size={26} color="#2E7D32" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.receitaTitulo}>{pr.receita.titulo}</Text>
                                    <Text style={styles.receitaData}>Incluída em: {pr.dataInclusao}</Text>
                                </View>
                            </View>

                            <View style={styles.macrosRow}>
                                {pr.receita.calorias > 0 && (
                                    <View style={styles.macroBadge}>
                                        <Text style={styles.macroTexto}>🔥 {pr.receita.calorias} kcal</Text>
                                    </View>
                                )}
                                {pr.receita.proteinas > 0 && (
                                    <View style={styles.macroBadge}>
                                        <Text style={styles.macroTexto}>💪 {pr.receita.proteinas}g prot</Text>
                                    </View>
                                )}
                                {pr.receita.tempoPreparo > 0 && (
                                    <View style={styles.macroBadge}>
                                        <Text style={styles.macroTexto}>⏱ {pr.receita.tempoPreparo} min</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.observacaoBox}>
                                <Text style={styles.observacaoLabel}>INGREDIENTES</Text>
                                <Text style={styles.observacaoTexto}>{pr.receita.ingredientes}</Text>
                            </View>

                            {pr.receita.observacoes ? (
                                <View style={[styles.observacaoBox, { marginTop: 8 }]}>
                                    <Text style={styles.observacaoLabel}>OBSERVAÇÃO DO NUTRICIONISTA</Text>
                                    <Text style={styles.observacaoTexto}>{pr.receita.observacoes}</Text>
                                </View>
                            ) : null}
                        </View>
                    ))
                )}

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root:               { flex: 1, backgroundColor: '#F5F7F5' },
    centralizador:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, backgroundColor: '#F5F7F5', paddingHorizontal: 32 },
    loadingTexto:       { fontSize: 14, color: '#888', marginTop: 8 },
    erroTexto:          { fontSize: 15, color: '#aaa', textAlign: 'center', lineHeight: 22 },
    btnTentar:          { marginTop: 8, backgroundColor: '#2E7D32', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
    btnTentarTexto:     { color: '#fff', fontWeight: '700', fontSize: 15 },
    header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 18, paddingBottom: 12, backgroundColor: '#F5F7F5' },
    btnVoltar:          { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EBEBEB', justifyContent: 'center', alignItems: 'center' },
    headerTitulo:       { fontSize: 17, fontWeight: '700', color: '#111' },
    bannerLeitura:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0F0F0', paddingHorizontal: 18, paddingVertical: 10 },
    bannerLeituraTexto: { fontSize: 12, color: '#555', fontWeight: '500' },
    scroll:             { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40 },
    cardUsuario:        { backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    cardUsuarioNome:    { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 10 },
    objetivoBadge:      { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 8 },
    objetivoTexto:      { color: '#2E7D32', fontWeight: '700', fontSize: 13 },
    nutriNome:          { fontSize: 12, color: '#888', marginTop: 4 },
    secaoTitulo:        { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 12 },
    metasGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    metaCard:           { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    metaValor:          { fontSize: 18, fontWeight: '800', color: '#111' },
    metaLabel:          { fontSize: 12, color: '#888' },
    cardReceita:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    receitaHeader:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    receitaIcone:       { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
    receitaTitulo:      { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
    receitaData:        { fontSize: 12, color: '#aaa' },
    macrosRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    macroBadge:         { backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
    macroTexto:         { fontSize: 12, color: '#555', fontWeight: '600' },
    semReceitas:        { alignItems: 'center', paddingVertical: 30, gap: 10 },
    semReceitasTexto:   { color: '#aaa', fontSize: 14, textAlign: 'center' },
    observacaoBox:      { borderLeftWidth: 3, borderLeftColor: '#2E7D32', paddingLeft: 12, paddingVertical: 4 },
    observacaoLabel:    { fontSize: 10, fontWeight: '800', color: '#2E7D32', letterSpacing: 1, marginBottom: 6 },
    observacaoTexto:    { fontSize: 13, color: '#555', lineHeight: 20 },
});
