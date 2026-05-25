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
    const [dataNascimento, setDataNascimento] = useState('');
    const [genero, setGenero] = useState<'MASCULINO' | 'FEMININO' | null>(null);
    const [loading, setLoading] = useState(false);
    const [botaoAtivo, setBotaoAtivo] = useState(false);
 
    useEffect(() => {
        setBotaoAtivo(
            nome.trim().length > 0 &&
            email.trim().length > 0 &&
            senha.length >= 6 &&
            dataNascimento.length === 10 &&
            genero !== null
        );
    }, [nome, email, senha, dataNascimento, genero]);
 
    function formatarData(text: string) {
        const numeros = text.replace(/\D/g, '');
        if (numeros.length <= 2) return numeros;
        if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
        return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
    }
 
    function converterData(dataStr: string): string | null {
        const partes = dataStr.split('/');
        if (partes.length !== 3 || partes[2].length !== 4) return null;
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
 
    async function salvar() {
        if (!nome || !email || !senha) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios!');
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
 
            const dataNascimentoConvertida = dataNascimento
                ? converterData(dataNascimento)
                : null;
 
            await createUsuario({
                nomeCompleto: nome.trim(),
                email: emailNormalizado,
                senhaHash: senha,
                ...(dataNascimentoConvertida && { dataNascimento: dataNascimentoConvertida }),
                ...(genero && { genero }),
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
            setDataNascimento('');
            setGenero(null);
 
            router.push('./Preferenciasdieta');
 
        } catch (error) {
            console.log('ERRO COMPLETO:', error);
            Alert.alert('Erro', 'Não foi possível criar a conta.');
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
 
                    <TextInput
                        style={style.input}
                        placeholder="Data de nascimento (DD/MM/AAAA)"
                        placeholderTextColor="#999"
                        value={dataNascimento}
                        onChangeText={(text) => setDataNascimento(formatarData(text))}
                        keyboardType="numeric"
                        maxLength={10}
                    />
 
                    <Text style={generoStyles.label}>Gênero</Text>
                    <View style={generoStyles.row}>
                        <TouchableOpacity
                            style={[
                                generoStyles.opcao,
                                genero === 'MASCULINO' && generoStyles.opcaoAtiva,
                            ]}
                            onPress={() => setGenero(genero === 'MASCULINO' ? null : 'MASCULINO')}
                        >
                            <Text style={[
                                generoStyles.opcaoTexto,
                                genero === 'MASCULINO' && generoStyles.opcaoTextoAtivo,
                            ]}>
                                👤 Homem
                            </Text>
                        </TouchableOpacity>
 
                        <TouchableOpacity
                            style={[
                                generoStyles.opcao,
                                genero === 'FEMININO' && generoStyles.opcaoAtiva,
                            ]}
                            onPress={() => setGenero(genero === 'FEMININO' ? null : 'FEMININO')}
                        >
                            <Text style={[
                                generoStyles.opcaoTexto,
                                genero === 'FEMININO' && generoStyles.opcaoTextoAtivo,
                            ]}>
                                👤 Mulher
                            </Text>
                        </TouchableOpacity>
                    </View>
 
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
 
const generoStyles = {
    label: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        marginTop: 4,
        fontWeight: '500' as const,
    },
    row: {
        flexDirection: 'row' as const,
        gap: 12,
        marginBottom: 12,
    },
    opcao: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
        alignItems: 'center' as const,
    },
    opcaoAtiva: {
        borderColor: '#6BBF3E',
        backgroundColor: '#f0fae8',
    },
    opcaoTexto: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500' as const,
    },
    opcaoTextoAtivo: {
        color: '#6BBF3E',
        fontWeight: '700' as const,
    },
};
