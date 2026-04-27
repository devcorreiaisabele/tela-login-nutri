import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
                        style={style.linkTexto}
                        onPress={() => router.back()}
                    >
                        Já tem conta? <Text style={style.linkDestaque}>Entrar</Text>
                    </Text>
                </View>
            </View>
        </ImageBackground>
    );
}