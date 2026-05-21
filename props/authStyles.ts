import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
    bg: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#030f25',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 160,
        height: 160,
        resizeMode: 'contain',
        borderRadius: 20,
    },
    appNome: {
        fontSize: 42,
        fontWeight: '800',
        color: '#4CAF50',
        marginTop: 10,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 50,
    },
    title: {
        fontSize: 25,
        fontWeight: '700',
        color: '#121212',
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    form: {
        marginTop: 20,
        gap: 10,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#f9f9f9',
        fontSize: 15,
        color: '#121212',
    },
    botao: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 5,
    },
    botaoDesabilitado: {
        backgroundColor: '#aaa',
    },
    botaoTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    linkTexto: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 14,
        color: '#555',
    },
    linkDestaque: {
        color: '#4CAF50',
        fontWeight: '700',
    },
});