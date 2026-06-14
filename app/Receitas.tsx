import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Dimensions, FlatList, Image, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { globalStyles as style } from '../props/globalStyles';
import { getReceitas } from '../src/services/receitaService_1';

const { width } = Dimensions.get('window');
const CARD_W   = width * 0.68;
const CARD_H   = 375;
const CARD_GAP = 12;

type Receita = {
    idReceita:    number;
    titulo:       string;
    calorias:     number;
    tempoPreparo: number;
    tags:         string;
    proteinas:    number;
    carbos:       number;
    gorduras:     number;
    ingredientes: string;
    observacoes:  string;
    imagemUrl:    string;
};

export default function Receitas() {
    const [receitas, setReceitas] = useState<Receita[]>([]);
    const [nome,     setNome]     = useState('Usuário');
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        async function carregar() {
            const nomeSalvo = await AsyncStorage.getItem('usuarioNome');
            if (nomeSalvo) setNome(nomeSalvo);
            try {
                const dados = await getReceitas();
                setReceitas(dados);
            } catch (e) {
                console.log('Erro ao buscar receitas:', e);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, []);

    const receitasDestaque = receitas.slice(0, 5);
    const outrasReceitas   = receitas.slice(5);

    return (
        <View style={style.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F0F7F0" />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={style.bemVindo}>Bem-vindo(a), {nome}!</Text>
                        <Text style={style.tituloPagina}>Receitas</Text>
                    </View>
                    <TouchableOpacity style={styles.buscaBtn} activeOpacity={0.8} onPress={() => router.push('./BuscaReceitas')}>
                        <Ionicons name="search" size={22} color="#333" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingBox}>
                        <Text style={styles.loadingTexto}>Carregando receitas...</Text>
                    </View>
                ) : (
                    <>
                        <Text style={style.secaoTitulo}>Recomendado para Você</Text>

                        <FlatList
                            data={receitasDestaque}
                            keyExtractor={item => item.idReceita.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.cardsDestaqueContainer}
                            snapToInterval={CARD_W + CARD_GAP}
                            decelerationRate="fast"
                            renderItem={({ item }) => {
                                const tags = item.tags ? item.tags.split(',') : [];
                                return (
                                    <TouchableOpacity
                                        style={styles.cardDestaque}
                                        activeOpacity={0.92}
                                        onPress={() => router.push({ pathname: './DetalheReceita', params: { id: item.idReceita } })}
                                    >
                                        {item.imagemUrl ? (
                                            <Image source={{ uri: item.imagemUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                                        ) : (
                                            <View style={styles.cardDestaqueBackground} />
                                        )}
                                        {tags.length > 0 && (
                                            <View style={styles.tag}>
                                                <MaterialCommunityIcons name="leaf" size={13} color="#fff" />
                                                <Text style={styles.tagTexto}>{tags[0].trim()}</Text>
                                            </View>
                                        )}
                                        <View style={styles.cardDestaqueGradient}>
                                            <Text style={styles.cardDestaqueTitulo}>{item.titulo}</Text>
                                            <View style={styles.cardDestaqueMeta}>
                                                {item.tempoPreparo > 0 && (
                                                    <>
                                                        <Ionicons name="time-outline" size={14} color="#fff" />
                                                        <Text style={styles.cardDestaqueMetaTexto}>{item.tempoPreparo} min</Text>
                                                    </>
                                                )}
                                                {item.calorias > 0 && (
                                                    <>
                                                        <View style={styles.separador} />
                                                        <MaterialCommunityIcons name="fire" size={14} color="#fff" />
                                                        <Text style={styles.cardDestaqueMetaTexto}>{item.calorias} kcal</Text>
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        {outrasReceitas.length > 0 && (
                            <>
                                <View style={style.secaoHeader}>
                                    <Text style={styles.secaoTituloExtra}>Outras Receitas</Text>
                                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => router.push('./Outrasreceitas')}>
                                        <Text style={style.verMais}>{'>>'}</Text>
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={outrasReceitas}
                                    keyExtractor={item => item.idReceita.toString()}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.cardsOutras}
                                    renderItem={({ item }) => {
                                        const tags = item.tags ? item.tags.split(',') : [];
                                        return (
                                            <TouchableOpacity
                                                style={styles.cardOutra}
                                                activeOpacity={0.88}
                                                onPress={() => router.push({ pathname: './DetalheReceita', params: { id: item.idReceita } })}
                                            >
                                                {item.imagemUrl ? (
                                                    <Image source={{ uri: item.imagemUrl }} style={styles.cardOutraImagemPlaceholder} resizeMode="cover" />
                                                ) : (
                                                    <View style={styles.cardOutraImagemPlaceholder} />
                                                )}
                                                <View style={styles.cardOutraInfo}>
                                                    <Text style={styles.cardOutraTitulo} numberOfLines={1}>{item.titulo}</Text>
                                                    <View style={styles.cardOutraMeta}>
                                                        {item.tempoPreparo > 0 && (
                                                            <>
                                                                <Ionicons name="time-outline" size={12} color="#C8E6C9" />
                                                                <Text style={styles.cardOutraMetaTexto}>{item.tempoPreparo} min</Text>
                                                            </>
                                                        )}
                                                        {tags.length > 0 && (
                                                            <>
                                                                <View style={styles.ponto} />
                                                                <MaterialCommunityIcons name="leaf" size={12} color="#C8E6C9" />
                                                                <Text style={styles.cardOutraMetaTexto}>{tags[0].trim()}</Text>
                                                            </>
                                                        )}
                                                    </View>
                                                </View>
                                                <View style={styles.cardOutraBtn}>
                                                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            </>
                        )}
                    </>
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
    scroll:                  { paddingBottom: 110 },
    header:                  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 56, marginBottom: 28 },
    buscaBtn:                { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    loadingBox:              { alignItems: 'center', paddingTop: 60 },
    loadingTexto:            { fontSize: 14, color: '#888' },
    cardsDestaqueContainer:  { paddingHorizontal: 25, gap: CARD_GAP },
    cardDestaque:            { width: CARD_W, height: CARD_H, borderRadius: 32, overflow: 'hidden', backgroundColor: '#A5D6A7' },
    cardDestaqueBackground:  { ...StyleSheet.absoluteFillObject, backgroundColor: '#4CAF50' },
    tag:                     { position: 'absolute', top: 18, left: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(46,125,50,0.88)', paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, gap: 5, zIndex: 10 },
    tagTexto:                { color: '#fff', fontSize: 13, fontWeight: '700' },
    cardDestaqueGradient:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: '52%', justifyContent: 'flex-end', paddingHorizontal: 22, paddingBottom: 26, backgroundColor: 'rgba(0,0,0,0.4)' },
    cardDestaqueTitulo:      { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 12, lineHeight: 28 },
    cardDestaqueMeta:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardDestaqueMetaTexto:   { color: '#fff', fontSize: 13, fontWeight: '600' },
    separador:               { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 2 },
    cardsOutras:             { paddingHorizontal: 25, gap: 14 },
    cardOutra:               { width: 230, height: 88, backgroundColor: '#388E3C', borderRadius: 22, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, elevation: 5 },
    cardOutraImagemPlaceholder: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#2E7D32' },
    cardOutraInfo:           { flex: 1, marginLeft: 12 },
    cardOutraTitulo:         { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 6 },
    cardOutraMeta:           { flexDirection: 'row', alignItems: 'center', gap: 5 },
    cardOutraMetaTexto:      { color: '#C8E6C9', fontSize: 12, fontWeight: '600' },
    ponto:                   { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C8E6C9', opacity: 0.6 },
    cardOutraBtn:            { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center' },
    secaoTituloExtra:        { fontSize: 19, fontWeight: '700', color: '#111' },
    tabTexto:                { fontSize: 12, color: '#999', fontWeight: '500', marginTop: 3 },
});