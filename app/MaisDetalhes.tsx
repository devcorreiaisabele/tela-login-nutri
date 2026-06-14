import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { globalStyles as style } from '../props/globalStyles';
import { getUsuarioLogado, updateUsuario } from '../src/services/usuarioService_1';

type Meta = 'Perda de Peso' | 'Manutenção de Peso' | 'Ganho de Massa';
 
interface OpcaoMeta {
    valor: Meta;
    descricao: string;
}
 
const OPCOES_META: OpcaoMeta[] = [
    { valor: 'Perda de Peso',       descricao: 'Foco em déficit calórico leve' },
    { valor: 'Manutenção de Peso',  descricao: 'Equilíbrio para o dia a dia' },
    { valor: 'Ganho de Massa',      descricao: 'Aumento de calorias e proteínas' },
];
 
export default function MaisDetalhes() {
    const [metaSelecionada, setMetaSelecionada] = useState<Meta>('Perda de Peso');
    const [metaTemp,        setMetaTemp]        = useState<Meta>('Perda de Peso');
    const [modalVisivel,    setModalVisivel]     = useState(false);
    const [usuario, setUsuario] = useState<any>(null);

useEffect(() => {
    getUsuarioLogado().then((data) => {
        console.log('usuario:', data);
        setUsuario(data);

        const mapa: Record<string, Meta> = {
            'perder':  'Perda de Peso',
            'manter':  'Manutenção de Peso',
            'ganhar':  'Ganho de Massa',
        };

        const convertida = mapa[data?.objetivoSaude?.toLowerCase().trim()];
        if (convertida) {
            setMetaSelecionada(convertida);
            setMetaTemp(convertida);
        }
    });
}, []);
 
    function abrirModal() {
        setMetaTemp(metaSelecionada); 
        setModalVisivel(true);
    }
 
    function fecharModal() {
        setModalVisivel(false);
    }
 
    async function salvarAlteracao() {
        setMetaSelecionada(metaTemp);
        setModalVisivel(false);
    
    const mapaInverso: Record<string, string> = {
        'Perda de Peso':       'perder',
        'Manutenção de Peso':  'manter',
        'Ganho de Massa':      'ganhar',
    };

    const valorBanco = mapaInverso[metaTemp];
    if (valorBanco && usuario?.idUser) {
        await updateUsuario(usuario.idUser, { objetivoSaude: valorBanco });
    }
}

 
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
 
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
 

                <View style={styles.header}>
                    <TouchableOpacity style={styles.voltarBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitulo}>Mais Detalhes</Text>
                </View>
 
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <MaterialCommunityIcons name="clipboard-list-outline" size={22} color="#fff" />
                            <Text style={styles.cardTitulo}>Resumo Nutricional</Text>
                        </View>
                        <TouchableOpacity style={styles.editarBtn} onPress={() => router.push('./Preferenciasdieta?origem=edicao')}>
                        <Text style={styles.editarBtnTexto}>Editar</Text>
                        </TouchableOpacity>
                    </View>
 
                    <View style={styles.divisor} />
 
                    <View style={styles.linhaInfo}>
                        <View style={styles.linhaInfoLeft}>
                            <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.linhaInfoTexto}>Tipo de Dieta</Text>
                        </View>
                        <View style={styles.tagVerde}>
                        <Text style={styles.tagVerdeTexto}>{usuario?.tipoDieta ?? '---'}</Text>
                        </View>
                    </View>
 
                    <View style={styles.divisor} />
 
                    <View style={styles.linhaInfo}>
                        <View style={styles.linhaInfoLeft}>
                            <MaterialCommunityIcons name="star-circle-outline" size={18} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.linhaInfoTexto}>Restrição Religiosa</Text>
                        </View>
                        <View style={styles.tagVerde}>
                            <Text style={styles.tagVerdeTexto}>{usuario?.restricoesReligiosas ?? '---'}</Text>
                        </View>
                    </View>
 
                    <View style={styles.divisor} />
 
                    <View style={styles.linhaInfo}>
                        <View style={styles.linhaInfoLeft}>
                            <MaterialCommunityIcons name="shield-alert-outline" size={18} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.linhaInfoTexto}>Alergias</Text>
                        </View>
                        {usuario?.alergias
                        ? usuario.alergias.split(',').map((a: string, i: number) => (
                        <View key={i} style={styles.tagVermelho}>
                        <Text style={styles.tagVermelhoTexto}>{a.trim()}</Text>
                        </View>
                         ))
                         : <View style={styles.tagVermelho}><Text style={styles.tagVermelhoTexto}>---</Text></View>
                        }
                    </View>
                </View>
 

                <View style={styles.card}>
                    <View style={styles.cardHeaderLeft}>
                        <MaterialCommunityIcons name="bullseye-arrow" size={24} color="#4CAF50" />
                        <Text style={styles.cardTitulo}>Objetivo de Saúde</Text>
                    </View>
 
                    <Text style={styles.objetivoDesc}>
                        Seu plano atual está focado na queima de calorias. Altere sua meta a qualquer momento, ou quando atingir seu objetivo, para recalcular os macronutrientes automaticamente.
                    </Text>
 

                    <View style={styles.metaBox}>
                        <View>
                            <Text style={styles.metaBoxLabel}>Meta Selecionada</Text>
                            <Text style={styles.metaBoxValor}>{metaSelecionada}</Text>
                        </View>
                        <TouchableOpacity style={styles.alterarBtn} onPress={abrirModal} activeOpacity={0.8}>
                            <Text style={styles.alterarBtnTexto}>Alterar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.metasDiarias}>
                        <Text style={styles.metasDiariasTitle}>METAS DIÁRIAS CALCULADAS</Text>
                        <View style={styles.metaLinha}>
                            <Text style={styles.metaLinhaTexto}>Calorias Alvo</Text>
                            <Text style={styles.metaLinhaValor}>0 Kcal</Text>
                        </View>
                        <View style={styles.metaLinha}>
                            <Text style={styles.metaLinhaTexto}>Proteína</Text>
                            <Text style={styles.metaLinhaValor}>0g</Text>
                        </View>
                        <View style={styles.metaLinha}>
                            <Text style={styles.metaLinhaTexto}>Carboidratos</Text>
                            <Text style={styles.metaLinhaValor}>0g</Text>
                        </View>
                    </View>
                </View>
 
            </ScrollView>
 

            <View style={style.tabBar}>
                <TouchableOpacity style={style.tabItem} onPress={() => router.push('./Receitas')}>
                    <MaterialCommunityIcons name="food-fork-drink" size={24} color="#999" />
                    <Text style={styles.tabTexto}>Receitas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.tabItemAtivo} onPress={() => router.push('./Dashboard')}>
                    <Ionicons name="grid" size={24} color="#2E7D32" />
                    <Text style={style.tabTextoAtivo}>Painel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.tabItem} onPress={() => router.push('./Perfil')}>
                    <Ionicons name="person-outline" size={24} color="#999" />
                    <Text style={styles.tabTexto}>Perfil</Text>
                </TouchableOpacity>
            </View>
 
            <Modal
                visible={modalVisivel}
                transparent
                animationType="slide"
                onRequestClose={fecharModal}
            >

                <TouchableWithoutFeedback onPress={fecharModal}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
 

                <View style={styles.sheet}>
 

                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitulo}>Qual o seu novo objetivo?</Text>
                        <TouchableOpacity style={styles.sheetFecharBtn} onPress={fecharModal}>
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
 
                    {OPCOES_META.map(opcao => {
                        const selecionada = metaTemp === opcao.valor;
                        return (
                            <TouchableOpacity
                                key={opcao.valor}
                                style={[styles.opcaoCard, selecionada && styles.opcaoCardSelecionada]}
                                onPress={() => setMetaTemp(opcao.valor)}
                                activeOpacity={0.8}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.opcaoTitulo}>{opcao.valor}</Text>
                                    <Text style={styles.opcaoDesc}>{opcao.descricao}</Text>
                                </View>
 

                                <View style={[styles.radio, selecionada && styles.radioSelecionado]}>
                                    {selecionada && <View style={styles.radioPonto} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
 
                    <TouchableOpacity
                        style={styles.btnSalvar}
                        onPress={salvarAlteracao}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.btnSalvarTexto}>Salvar Alteração</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root:               { flex: 1, backgroundColor: '#2E7D32' },
    scroll:             { paddingBottom: 110, paddingHorizontal: 18 },
 
    header:             { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 24, gap: 16 },
    voltarBtn:          { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    headerTitulo:       { fontSize: 24, fontWeight: '800', color: '#fff' },
 
    card:               { backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 24, padding: 20, marginBottom: 18 },
 
    cardHeader:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    cardHeaderLeft:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardTitulo:         { fontSize: 17, fontWeight: '800', color: '#fff' },
 
    editarBtn:          { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
    editarBtnTexto:     { color: '#fff', fontWeight: '700', fontSize: 14 },
 
    divisor:            { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 },
 
    linhaInfo:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    linhaInfoLeft:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
    linhaInfoTexto:     { fontSize: 15, color: '#fff', fontWeight: '500' },
 
    tagsRow:            { flexDirection: 'row', gap: 8 },
    tagVerde:           { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    tagVerdeTexto:      { color: '#fff', fontWeight: '700', fontSize: 13 },
    tagVermelho:        { backgroundColor: 'rgba(220,50,50,0.35)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    tagVermelhoTexto:   { color: '#ff8a80', fontWeight: '700', fontSize: 13 },
 
    objetivoDesc:       { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22, marginTop: 14, marginBottom: 16 },
 
    metaBox:            { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    metaBoxLabel:       { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
    metaBoxValor:       { fontSize: 17, fontWeight: '800', color: '#fff' },
    alterarBtn:         { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
    alterarBtnTexto:    { color: '#fff', fontWeight: '700', fontSize: 14 },
 
    metasDiarias:       { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 18, padding: 16 },
    metasDiariasTitle:  { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 1, marginBottom: 14 },
    metaLinha:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    metaLinhaTexto:     { fontSize: 15, color: 'rgba(255,255,255,0.85)' },
    metaLinhaValor:     { fontSize: 15, fontWeight: '700', color: '#fff' },
 
    tabTexto:           { fontSize: 12, color: '#999', fontWeight: '500', marginTop: 3 },
    tabItemAtivo:       { alignItems: 'center' },
    modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
 
    sheet:              {
                            backgroundColor: '#2E7D32',
                            borderTopLeftRadius: 28,
                            borderTopRightRadius: 28,
                            paddingHorizontal: 20,
                            paddingTop: 26,
                            paddingBottom: 36,
                            gap: 12,
                        },
    sheetHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    sheetTitulo:        { fontSize: 20, fontWeight: '800', color: '#fff' },
    sheetFecharBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    opcaoCard:         {
                            backgroundColor: 'rgba(255,255,255,0.12)',
                            borderRadius: 16,
                            padding: 18,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1.5,
                            borderColor: 'transparent',
                        },
    opcaoCardSelecionada: {
                            backgroundColor: 'rgba(255,255,255,0.18)',
                            borderColor: 'rgba(255,255,255,0.5)',
                        },
    opcaoTitulo:        { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 3 },
    opcaoDesc:          { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
    radio:              {
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            borderWidth: 2,
                            borderColor: 'rgba(255,255,255,0.45)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 12,
                        },
    radioSelecionado:   { borderColor: '#A5D6A7' },
    radioPonto:         { width: 13, height: 13, borderRadius: 7, backgroundColor: '#A5D6A7' },
    btnSalvar:          {
                            backgroundColor: '#A5D6A7',
                            borderRadius: 18,
                            paddingVertical: 18,
                            alignItems: 'center',
                            marginTop: 6,
                        },
    btnSalvarTexto:     { fontSize: 16, fontWeight: '800', color: '#1B5E20' },
});