import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
 
const BENEFICIOS = [
    {
        id: '1',
        icone: 'calendar-check-outline',
        titulo: 'Acompanhamento diário',
        descricao: 'Seu nutricionista visualiza seu diário e histórico alimentar de perto.',
    },
    {
        id: '2',
        icone: 'food-apple-outline',
        titulo: 'Dieta flexível',
        descricao: 'Seu plano alimentar pode ser criado e ajustado a qualquer momento pelo profissional.',
    },
    {
        id: '3',
        icone: 'trending-up',
        titulo: 'Foco nos resultados',
        descricao: 'Seu progresso e metas são monitorados continuamente para garantir seu sucesso.',
    },
];
 
export default function NutricionistaUpsell() {
 
    function confirmar() {
        router.push('./Vincularnutricionista');
    }
 
    function pularEtapa() {
        router.push('./Receitas');
    }
 
    return (
        <View style={style.container}>
            <View style={style.header}>
                <TouchableOpacity style={style.voltarBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#333" />
                </TouchableOpacity>
                <Text style={style.passo}>Passo final</Text>
                <View style={{ width: 36 }} />
            </View>
 
            <View style={style.progressoBg}>
                <View style={style.progressoAtivo} />
            </View>
 
            <ScrollView
                contentContainerStyle={style.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Text style={style.titulo}>Quer adicionar um nutricionista?</Text>
                <Text style={style.subtitulo}>
                    Um acompanhamento profissional potencializa seus resultados e adapta a dieta perfeitamente à sua rotina.
                </Text>
 
                <View style={style.card}>

                    <View style={style.fotoContainer}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200' }}
                            style={style.foto}
                        />
                        <View style={style.checkBadge}>
                            <Ionicons name="checkmark-circle" size={26} color="#2E7D32" />
                        </View>
                    </View>

                    <Text style={style.cardTitulo}>Acelere seus resultados</Text>
                    <Text style={style.cardSubtitulo}>
                        Quem tem acompanhamento profissional tem até{' '}
                        <Text style={style.destaque}>3x mais chances</Text>
                        {' '}de alcançar sua meta sem frustrações.
                    </Text>

                    <View style={style.beneficios}>
                        {BENEFICIOS.map((item) => (
                            <View key={item.id} style={style.beneficioItem}>
                                <View style={style.beneficioIcone}>
                                    <MaterialCommunityIcons
                                        name={item.icone as any}
                                        size={20}
                                        color="#2E7D32"
                                    />
                                </View>
                                <View style={style.beneficioTexto}>
                                    <Text style={style.beneficioTitulo}>{item.titulo}</Text>
                                    <Text style={style.beneficioDescricao}>{item.descricao}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
 
                </View>
            </ScrollView>
 

            <View style={style.rodape}>
                <TouchableOpacity style={style.botao} onPress={confirmar}>
                    <Text style={style.botaoTexto}>Sim! Quero um nutricionista</Text>
                </TouchableOpacity>
 
                <TouchableOpacity onPress={pularEtapa} style={style.pularBtn}>
                    <Text style={style.pularTexto}>Talvez mais tarde</Text>
                </TouchableOpacity>
            </View>
 
        </View>
    );
}
 

 
const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F8F1',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 55,
        paddingBottom: 10,
    },
    voltarBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    passo: {
        fontSize: 14,
        color: '#555',
        fontWeight: '500',
    },
    progressoBg: {
        height: 4,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 20,
        borderRadius: 10,
        marginBottom: 8,
    },
    progressoAtivo: {
        height: 4,
        width: '100%',
        backgroundColor: '#2E7D32',
        borderRadius: 10,
    },
    scroll: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 160,
    },
    titulo: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 12,
        lineHeight: 34,
    },
    subtitulo: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 28,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
        borderTopWidth: 4,
        borderTopColor: '#2E7D32',
    },
    fotoContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    foto: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#ccc',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 13,
    },
    cardTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 10,
        textAlign: 'center',
    },
    cardSubtitulo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    destaque: {
        fontWeight: '700',
        color: '#1a1a1a',
    },
    beneficios: {
        width: '100%',
        gap: 20,
    },
    beneficioItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    beneficioIcone: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    beneficioTexto: {
        flex: 1,
    },
    beneficioTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    beneficioDescricao: {
        fontSize: 13,
        color: '#777',
        lineHeight: 18,
    },
    rodape: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#F1F8F1',
        gap: 12,
    },
    botao: {
        backgroundColor: '#2E7D32',
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
    },
    botaoTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    pularBtn: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    pularTexto: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
});

