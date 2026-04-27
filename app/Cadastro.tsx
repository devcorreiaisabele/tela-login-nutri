import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

export default function Cadastro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [botaoAtivo, setBotaoAtivo] = useState(false);

    useEffect(() => {
        setBotaoAtivo(
            nome.trim().length > 0 &&
            email.trim().length > 0 &&
            senha.length > 0
        );
    }, [nome, email, senha]);

    async function salvar() {
        if (!nome || !email || !senha) {
            Alert.alert('Atenção', 'Preencha todos os campos!');
            return;
        }

        setLoading(true);

        try {
            const { data: usuariosExistentes } = await axios.get(
                `https://69e4d882cfa9394db8da703c.mockapi.io/usuarios?email=${email}`
            );

            if (usuariosExistentes.length > 0) {
                Alert.alert('Atenção', 'Este e-mail já está cadastrado!');
                return;
            }

            const response = await axios.post(
                'https://69e4d882cfa9394db8da703c.mockapi.io/usuarios',
                { nome, email, senha }
            );

            console.log('Sucesso:', response.data);
            Alert.alert('Sucesso!', 'Conta criada com sucesso!');
            setNome('');
            setEmail('');
            setSenha('');
            router.back();
        } catch (error) {
            console.log('Erro:', error);
            Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
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
                <Text style={style.title}>Cadastro</Text>
                <Text style={style.subtitle}>Crie sua conta para começar</Text>

                <View style={style.form}>
                    <TextInput
                        style={style.input}
                        placeholder="Nome completo"
                        placeholderTextColor="#999"
                        value={nome}
                        onChangeText={setNome}
                    />

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
                        style={[
                            style.botao,
                            (!botaoAtivo || loading) && style.botaoDesabilitado,
                        ]}
                        onPress={salvar}
                        disabled={!botaoAtivo || loading}
                    >
                        <Text style={style.botaoTexto}>
                            {loading ? 'Carregando...' : 'Criar Conta'}
                        </Text>
                    </TouchableOpacity>

                    <Text
                        style={style.linkVoltar}
                        onPress={() => router.back()}
                    >
                        Já tem conta? <Text style={style.linkDestaque}>Entrar</Text>
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
    linkVoltar: {
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