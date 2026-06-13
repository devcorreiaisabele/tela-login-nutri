import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { createUsuario, getUsuarios } from '../src/services/usuarioService_1';

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
            senha.length >= 6       
        );
    }, [nome, email, senha]);

    async function salvar() {
    if (!nome || !email || !senha) {
        Alert.alert('Atenção', 'Preencha todos os campos!');
        return;
    }

    if (senha.length < 6) {
        Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres!');
        return;
    }

    setLoading(true);

    try {


        const usuarios = await getUsuarios();
        const emailNormalizado = email.trim().toLowerCase();

        const emailExiste = usuarios.some(
            (usuario: any) => usuario.email?.toLowerCase() === emailNormalizado
        );

        if (emailExiste) {
            Alert.alert('Erro', 'Este e-mail já está cadastrado!');
            setLoading(false);
            return;
        }

        await createUsuario({
    nomeCompleto: nome.trim(),
    email: emailNormalizado,
    senhaHash: senha
});

const todosUsuarios = await getUsuarios();
const usuarioCriado = todosUsuarios.find(
    (u: any) => u.email?.toLowerCase() === emailNormalizado
);

await AsyncStorage.setItem('usuarioId', (usuarioCriado.idUser ?? usuarioCriado.id).toString());
await AsyncStorage.setItem('usuarioNome', usuarioCriado.nomeCompleto);
await AsyncStorage.setItem('usuarioEmail', usuarioCriado.email);

Alert.alert('Sucesso', 'Conta criada com sucesso!');

setNome('');
setEmail('');
setSenha('');

router.push('./Preferenciasdieta');

    } catch (error) {

        console.log('ERRO COMPLETO:', error);

        Alert.alert(
            'Erro',
            'Não foi possível criar a conta.'
        );

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
                        placeholder="Senha (mínimo 6 caracteres)"
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
                        onPress={() => router.replace('./login')}
                    >
                        Já tem conta? <Text style={style.linkDestaque}>Entrar</Text>
                    </Text>
                </View>
            </View>
        </ImageBackground>
    );
}