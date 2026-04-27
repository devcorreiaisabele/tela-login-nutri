import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    ImageBackground,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authStyles as style } from '../props/authStyles';

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
                        style={style.linkTexto}
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