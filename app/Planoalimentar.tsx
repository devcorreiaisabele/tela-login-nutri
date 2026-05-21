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
    usuario: { nomeCompleto: string; objetivoSaude: string };
    nutricionista: { nomeCompleto: string };
    planoReceitas: PlanoReceita[];
};

export default function PlanoAlimentar() {
    const [plano, setPlano]     = useState<Plano | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro]       = useState(false);

    useEffect(() => {
        async function buscar() {
            try {
                const usuarioId = await AsyncStorage.getItem('usuarioId');
                const planos    = await getPlanos();

                const meuPlano = planos.find(
                    (p: any) =>
                        p.usuario?.idUser?.toString() === usuarioId &&
                        p.status === 'Ativo'
                );

                if (meuPlano) setPlano(meuPlano);
                else setErro(true);
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
            <View style={s.centralizador}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={s.loadingTexto}>Carregando plano alimentar...</Text>
            </View>
        );
    }

    if (erro || !plano) {
        return (
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
    }

    const receitas = plano.planoReceitas ?? [];

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
                    <Text style={s.resumoNome}>{plano.usuario?.nomeCompleto}</Text>
                    {plano.usuario?.objetivoSaude ? (
                        <View style={s.objetivoBadge}>
                            <Text style={s.objetivoTexto}>🎯 {plano.usuario.objetivoSaude}</Text>
                        </View>
                    ) : null}
                    <Text style={s.nutriNome}>Nutricionista: {plano.nutricionista?.nomeCompleto}</Text>
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
                    receitas.map((pr, index) => (
                        <View key={pr.idPlanoReceita} style={s.dietaCard}>
                            <View style={s.dietaHeader}>
                                <View style={s.dietaIconeWrap}>
                                    <MaterialCommunityIcons
                                        name={index === 0 ? 'coffee-outline' : index === receitas.length - 1 ? 'moon-waning-crescent' : 'food-fork-drink'}
                                        size={20}
                                        color="#2E7D32"
                                    />
                                </View>
                                <Text style={s.dietaRefeicao}>{pr.receita.titulo}</Text>
                            </View>

                            <View style={s.macrosRow}>
                                {pr.receita.calorias > 0 && <Text style={s.macroBadge}>🔥 {pr.receita.calorias} kcal</Text>}
                                {pr.receita.proteinas > 0 && <Text style={s.macroBadge}>💪 {pr.receita.proteinas}g prot</Text>}
                                {pr.receita.tempoPreparo > 0 && <Text style={s.macroBadge}>⏱ {pr.receita.tempoPreparo} min</Text>}
                            </View>


                            {pr.receita.ingredientes.split('\n').map((item, i) => (
                                <Text key={i} style={s.dietaItem}>• {item}</Text>
                            ))}

 
                            {pr.receita.observacoes ? (
                                <View style={s.obsBox}>
                                    <Text style={s.obsLabel}>OBSERVAÇÃO DO NUTRICIONISTA</Text>
                                    <Text style={s.obsTexto}>{pr.receita.observacoes}</Text>
                                </View>
                            ) : null}
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
    header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 54, paddingBottom: 12, backgroundColor: '#F5F7F5' },
    btnVoltar:       { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    headerTitulo:    { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
    scroll:          { paddingHorizontal: 20, paddingBottom: 24 },
    resumoCard:      { backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    resumoNome:      { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 8 },
    objetivoBadge:   { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 6 },
    objetivoTexto:   { color: '#2E7D32', fontWeight: '700', fontSize: 13 },
    nutriNome:       { fontSize: 12, color: '#888' },
    secaoTitulo:     { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 14 },
    metasRow:        { flexDirection: 'row', gap: 10, marginBottom: 24 },
    metaCard:        { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    metaValor:       { fontSize: 16, fontWeight: '800', color: '#111' },
    metaLabel:       { fontSize: 11, color: '#888' },
    dietaCard:       { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    dietaHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    dietaIconeWrap:  { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F0F7F0', justifyContent: 'center', alignItems: 'center' },
    dietaRefeicao:   { flex: 1, fontSize: 16, fontWeight: '700', color: '#111' },
    macrosRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    macroBadge:      { backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, color: '#555', fontWeight: '600' },
    dietaItem:       { fontSize: 14, color: '#555', lineHeight: 22 },
    semReceitas:     { alignItems: 'center', paddingVertical: 30, gap: 10 },
    semReceitasTexto:{ color: '#aaa', fontSize: 14, textAlign: 'center' },
    obsBox:          { marginTop: 10, borderLeftWidth: 3, borderLeftColor: '#2E7D32', paddingLeft: 12, paddingVertical: 4 },
    obsLabel:        { fontSize: 10, fontWeight: '800', color: '#2E7D32', letterSpacing: 1, marginBottom: 4 },
    obsTexto:        { fontSize: 13, color: '#555', lineHeight: 20 },
});
