import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    async function entrar() {
        if (!email || !senha) {
            Alert.alert('Atenção', 'Preencha todos os campos!');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.get(
                'https://69e4d882cfa9394db8da703c.mockapi.io/usuarios'
            );

            const usuarios = response.data;

            const usuario = usuarios.find(
                (u: any) =>
                    u.email.toLowerCase() === email.trim().toLowerCase() &&
                    u.senha === senha
            );

            if (!usuario) {
                Alert.alert('Erro', 'Usuário não encontrado ou senha incorreta!');
                return;
            }

            Alert.alert('Bem-vindo!', `Olá, ${usuario.nome}!`);
            router.push('./(tabs)');
        } catch (error) {
            console.log('Erro:', error);
            Alert.alert('Erro', 'Não foi possível fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <ImageBackground
            style={style.bg}
            source={require('../src/assets/images/bg-vegetables.jpg')}
        >

            <View style={style.logoContainer}>
                <Image
                    source={require('../src/assets/images/icon.png')}
                    style={style.logo}
                />
                <Text style={style.appNome}>Nutri+</Text>
            </View>

            <View style={style.card}>
                <Text style={style.title}>Entrar</Text>
                <Text style={style.subtitle}>Acesse com seu e-mail e senha</Text>

                <View style={style.form}>
                    <TextInput
                        style={style.input}
                        placeholder="E-mail"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={style.input}
                        placeholder="Senha"
                        placeholderTextColor="#999"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[style.botao, loading && style.botaoDesabilitado]}
                        onPress={entrar}
                        disabled={loading}
                    >
                        <Text style={style.botaoTexto}>
                            {loading ? 'Carregando...' : 'Entrar'}
                        </Text>
                    </TouchableOpacity>

                    <Text
                        style={style.linkCadastro}
                        onPress={() => router.push('./Cadastro')}
                    >
                        Não tem conta?{' '}
                        <Text style={style.linkDestaque}>Cadastre-se</Text>
                    </Text>
                </View>
            </View>
        </ImageBackground>
    );
}

const style = StyleSheet.create({
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
    linkCadastro: {
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