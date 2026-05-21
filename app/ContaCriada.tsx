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

export default function ContaCriadaSucesso() {
    const { nome, email } = useLocalSearchParams<{ nome: string; email: string }>();
    const escalaCheck  = useRef(new Animated.Value(0)).current;
    const opacidadeAro = useRef(new Animated.Value(0)).current;
    const opacidadeTexto = useRef(new Animated.Value(0)).current;
    const opacidadeBotao = useRef(new Animated.Value(0)).current;

    const bolinha1 = useRef(new Animated.Value(0)).current;
    const bolinha2 = useRef(new Animated.Value(0)).current;
    const bolinha3 = useRef(new Animated.Value(0)).current;
    const bolinha4 = useRef(new Animated.Value(0)).current;
    const bolinha5 = useRef(new Animated.Value(0)).current;
    const bolinha6 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(opacidadeAro, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(escalaCheck, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
            Animated.stagger(60, [bolinha1, bolinha2, bolinha3, bolinha4, bolinha5, bolinha6].map(b =>
                Animated.spring(b, { toValue: 1, friction: 6, useNativeDriver: true })
            )),

            Animated.parallel([
                Animated.timing(opacidadeTexto, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(opacidadeBotao, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const bolinhas = [
        { anim: bolinha1, top: -80,  left: -60,  size: 14, opacity: 1   },
        { anim: bolinha2, top: -100, left:  40,  size: 8,  opacity: 0.5 },
        { anim: bolinha3, top: -60,  left:  90,  size: 18, opacity: 1   },
        { anim: bolinha4, top:  40,  left: -90,  size: 10, opacity: 0.4 },
        { anim: bolinha5, top:  70,  left:  20,  size: 14, opacity: 1   },
        { anim: bolinha6, top:  20,  left:  80,  size: 8,  opacity: 0.5 },
    ];

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F0F7F0" />

            <View style={s.corpo}>

                <View style={s.iconArea}>

                    {bolinhas.map((b, i) => (
                        <Animated.View
                            key={i}
                            style={[
                                s.bolinha,
                                {
                                    width:   b.size,
                                    height:  b.size,
                                    borderRadius: b.size / 2,
                                    top:  b.top  + 90,
                                    left: b.left + 90,
                                    opacity: Animated.multiply(b.anim, b.opacity),
                                    transform: [{ scale: b.anim }],
                                },
                            ]}
                        />
                    ))}

                    <Animated.View style={[s.aroExterno, { opacity: opacidadeAro }]}>
                        <View style={s.aroInterno}>
                            <Animated.View style={[s.checkCirculo, { transform: [{ scale: escalaCheck }] }]}>
                                <Text style={s.checkMark}>✓</Text>
                            </Animated.View>
                        </View>
                    </Animated.View>
                </View>
                <Animated.View style={{ opacity: opacidadeTexto, alignItems: 'center' }}>
                    <Text style={s.titulo}>Conta do paciente{'\n'}criada!</Text>
                    <Text style={s.descricao}>
                        O paciente já pode acessar o{'\n'}
                        aplicativo utilizando o e-mail{'\n'}
                        cadastrado e a senha definida.
                    </Text>
                    {email ? (
                        <View style={s.emailBox}>
                            <Text style={s.emailTexto}>{email}</Text>
                        </View>
                    ) : null}
                </Animated.View>
            </View>

            <Animated.View style={[s.rodape, { opacity: opacidadeBotao }]}>
                <TouchableOpacity
                    style={s.btnConcluir}
                    onPress={() => router.replace('./PacientesNutricionista')}
                    activeOpacity={0.85}
                >
                    <Text style={s.btnConcluirTexto}>Concluir</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    root:         { flex: 1, backgroundColor: '#F0F7F0' },

    corpo:        { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    iconArea:     { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 48 },
    aroExterno:   { width: 160, height: 160, borderRadius: 80, backgroundColor: '#C8E6C9', justifyContent: 'center', alignItems: 'center' },
    aroInterno:   { width: 120, height: 120, borderRadius: 60, backgroundColor: '#A5D6A7', justifyContent: 'center', alignItems: 'center' },
    checkCirculo: { width: 80,  height: 80,  borderRadius: 40, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
    checkMark:    { fontSize: 36, color: '#fff', fontWeight: '800' },
    bolinha:      { position: 'absolute', backgroundColor: '#4CAF50' },
    titulo:       { fontSize: 32, fontWeight: '900', color: '#111', textAlign: 'center', lineHeight: 40, marginBottom: 16 },
    descricao:    { fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 26 },
    emailBox:     { marginTop: 16, backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
    emailTexto:   { fontSize: 14, color: '#2E7D32', fontWeight: '600' },
    rodape:       { paddingHorizontal: 24, paddingBottom: 40 },
    btnConcluir:  { backgroundColor: '#2E7D32', borderRadius: 18, paddingVertical: 18, alignItems: 'center', elevation: 4, shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    btnConcluirTexto: { fontSize: 17, fontWeight: '800', color: '#fff' },
});