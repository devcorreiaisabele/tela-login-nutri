import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Params = {
    peso_atual: string;
    meta_peso:  string;
};

export default function MetaAtingida() {
    const params = useLocalSearchParams<Params>();
    const peso_atual = parseFloat(params.peso_atual ?? '0') || 0;
    const meta_peso  = parseFloat(params.meta_peso  ?? '0') || 0;

    const trofeuScale   = useRef(new Animated.Value(0)).current;
    const trofeuOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity   = useRef(new Animated.Value(0)).current;
    const cardOpacity   = useRef(new Animated.Value(0)).current;
    const cardTranslate = useRef(new Animated.Value(30)).current;
    const btnsOpacity   = useRef(new Animated.Value(0)).current;
    const barraWidth    = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(trofeuScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
                Animated.timing(trofeuOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
            Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.parallel([
                Animated.timing(cardOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.spring(cardTranslate, { toValue: 0, friction: 7, useNativeDriver: true }),
            ]),
            Animated.timing(barraWidth, { toValue: 1, duration: 700, useNativeDriver: false }),
            Animated.timing(btnsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleMudarMeta = (): void => {
        router.push({
            pathname: './Alterarmeta',
            params: { peso_atual },
        });
    };

    const handleManterPeso = (): void => {
        router.back();
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
            <Animated.View style={[styles.trofeuWrapper, { opacity: trofeuOpacity, transform: [{ scale: trofeuScale }] }]}>
                <View style={styles.trofeuCirculo}>
                    <MaterialCommunityIcons name="trophy-outline" size={52} color="rgba(255,255,255,0.85)" />
                </View>
            </Animated.View>

            <Animated.View style={[styles.textoWrapper, { opacity: textOpacity }]}>
                <Text style={styles.titulo}>Parabéns!</Text>
                <Text style={styles.subtitulo}>
                    Você atingiu a sua meta com sucesso.{'\n'}Todo o seu esforço valeu a pena!
                </Text>
            </Animated.View>

            <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <MaterialCommunityIcons name="target" size={20} color="#ffffff" />
                        <Text style={styles.cardTitulo}>Meta de Peso</Text>
                    </View>
                    <View style={styles.badge}>
                        <Ionicons name="checkmark-circle-outline" size={15} color="#A5D6A7" />
                        <Text style={styles.badgeTexto}>Concluída</Text>
                    </View>
                </View>

                <View style={styles.pesoRow}>
                    <View>
                        <Text style={styles.pesoLabel}>Atual</Text>
                        <Text style={styles.pesoValor}>{peso_atual.toFixed(0)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.pesoLabel}>Alvo</Text>
                        <Text style={styles.pesoValor}>{meta_peso.toFixed(0)}</Text>
                    </View>
                </View>

                <View style={styles.progressoBg}>
                    <Animated.View
                        style={[
                            styles.progressoAtivo,
                            {
                                width: barraWidth.interpolate({
                                    inputRange:  [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                    <Text style={styles.progressoLabelLeft}>kg</Text>
                    <Text style={styles.progressoLabelRight}>kg</Text>
                </View>

                <Text style={styles.metaTexto}>Meta atingida com sucesso!</Text>
            </Animated.View>

            <Animated.View style={[styles.bottomWrapper, { opacity: btnsOpacity }]}>
                <Text style={styles.pergunta}>Quer mudar de meta?</Text>

                <TouchableOpacity style={styles.btnMudar} activeOpacity={0.85} onPress={handleMudarMeta}>
                    <Text style={styles.btnMudarTexto}>Mudar Meta</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnManter} activeOpacity={0.85} onPress={handleManterPeso}>
                    <Text style={styles.btnManterTexto}>Manter Peso Atual</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    root:                  { flex: 1, backgroundColor: '#2E7D32', alignItems: 'center', paddingHorizontal: 24, paddingTop: 72, paddingBottom: 40 },
    trofeuWrapper:         { marginBottom: 28 },
    trofeuCirculo:         { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
    textoWrapper:          { alignItems: 'center', marginBottom: 28 },
    titulo:                { fontSize: 36, fontWeight: '900', color: '#ffffff', marginBottom: 12 },
    subtitulo:             { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24 },
    card:                  { width: '100%', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 24, padding: 20, marginBottom: 36, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    cardHeader:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    cardHeaderLeft:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitulo:            { fontSize: 16, fontWeight: '700', color: '#ffffff' },
    badge:                 { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(165,214,167,0.18)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(165,214,167,0.4)' },
    badgeTexto:            { fontSize: 13, fontWeight: '600', color: '#A5D6A7' },
    pesoRow:               { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    pesoLabel:             { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
    pesoValor:             { fontSize: 48, fontWeight: '900', color: '#ffffff', lineHeight: 54 },
    progressoBg:           { height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'visible', marginBottom: 14, position: 'relative' },
    progressoAtivo:        { height: 10, backgroundColor: '#A5D6A7', borderRadius: 5 },
    progressoLabelLeft:    { position: 'absolute', bottom: -18, left: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
    progressoLabelRight:   { position: 'absolute', bottom: -18, right: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
    metaTexto:             { fontSize: 14, color: '#A5D6A7', fontWeight: '600', textAlign: 'center', marginTop: 8 },
    bottomWrapper:         { width: '100%', alignItems: 'center', gap: 14 },
    pergunta:              { fontSize: 22, fontWeight: '800', color: '#ffffff', marginBottom: 6 },
    btnMudar:              { width: '100%', backgroundColor: '#ffffff', borderRadius: 30, paddingVertical: 18, alignItems: 'center' },
    btnMudarTexto:         { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
    btnManter:             { width: '100%', borderRadius: 30, paddingVertical: 18, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
    btnManterTexto:        { fontSize: 16, fontWeight: '700', color: '#ffffff' },
});