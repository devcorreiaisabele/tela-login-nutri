import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { createUsuario, getUsuarios } from '../src/services/usuarioService_1';
import { createVinculo } from '../src/services/vinculoService_1';

export default function CriarPaciente() {
    const [nome,         setNome]         = useState('');
    const [email,        setEmail]        = useState('');
    const [senha,        setSenha]        = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [salvando,     setSalvando]     = useState(false);

    const handleCriar = async () => {
        if (!nome.trim() || !email.trim() || !senha.trim()) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }
        if (senha.length < 6) {
            Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setSalvando(true);

        try {
    const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');


    const usuarios = await getUsuarios();
    const emailJaExiste = usuarios.some(
        (u: any) => u.email === email.trim().toLowerCase()
    );
    if (emailJaExiste) {
        Alert.alert('Atenção', 'Este e-mail já está cadastrado.');
        return;
    }


    await createUsuario({
        nomeCompleto: nome.trim(),
        email: email.trim().toLowerCase(),
        senhaHash: senha,
    });


    const todosUsuarios = await getUsuarios();
    const usuarioCriado = todosUsuarios.find(
        (u: any) => u.email === email.trim().toLowerCase()
    );

    if (nutricionistaId && usuarioCriado) {
        await createVinculo({
            usuarioId: usuarioCriado.idUser,
            nutricionistaId: Number(nutricionistaId),
            dataSolicitacao: new Date().toISOString().split('T')[0],
            status: 'Ativo',
        });
    }

    router.replace({
        pathname: './ContaCriada',
        params: {
            nome:  nome.trim(),
            email: email.trim().toLowerCase(),
        },
    });
        } catch (err) {
            console.log('Erro ao criar paciente:', err);
            Alert.alert('Erro', 'não foi possi­vel criar a conta do paciente.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={s.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.btnVoltar}>
                    <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Criar Conta</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView
                contentContainerStyle={s.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={s.titulo}>Dados do Paciente</Text>
                <Text style={s.subtitulo}>
                    Preencha as informações básicas abaixo para criar uma nova conta de acesso para o seu paciente.
                </Text>

                <View style={s.avisoBox}>
                    <Ionicons name="information-circle-outline" size={18} color="#2E7D32" />
                    <Text style={s.avisoTexto}>
                        O paciente já será vinculado à sua conta automaticamente após o cadastro.
                    </Text>
                </View>

                <Text style={s.label}>Nome Completo</Text>
                <View style={s.inputBox}>
                    <TextInput
                        style={s.input}
                        placeholder="Ex: João da Silva"
                        placeholderTextColor="#bbb"
                        value={nome}
                        onChangeText={setNome}
                        autoCapitalize="words"
                    />
                </View>

                <Text style={s.label}>E-mail</Text>
                <View style={s.inputBox}>
                    <TextInput
                        style={s.input}
                        placeholder="exemplo@email.com"
                        placeholderTextColor="#bbb"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <Text style={s.label}>Senha Temporária</Text>
                <View style={s.inputBox}>
                    <TextInput
                        style={[s.input, { flex: 1 }]}
                        placeholder="Mínimo de 6 caracteres"
                        placeholderTextColor="#bbb"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry={!mostrarSenha}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setMostrarSenha(v => !v)} style={s.olhoBtn}>
                        <Ionicons
                            name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[s.btnCriar, salvando && { opacity: 0.6 }]}
                    onPress={handleCriar}
                    disabled={salvando}
                    activeOpacity={0.85}
                >
                    {salvando
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={s.btnCriarTexto}>Criar Conta do Paciente</Text>
                    }
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root:          { flex: 1, backgroundColor: '#F5F7F5' },
    header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 54, paddingBottom: 12 },
    btnVoltar:     { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    headerTitulo:  { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
    scroll:        { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12 },
    titulo:        { fontSize: 26, fontWeight: '900', color: '#111', marginBottom: 12 },
    subtitulo:     { fontSize: 15, color: '#888', lineHeight: 22, marginBottom: 20 },
    avisoBox:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#E8F5E9', borderRadius: 12, padding: 14, marginBottom: 28 },
    avisoTexto:    { flex: 1, fontSize: 13, color: '#2E7D32', lineHeight: 19 },
    label:         { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 10 },
    inputBox:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 58, marginBottom: 20, borderWidth: 1, borderColor: '#E8E8E8' },
    input:         { fontSize: 15, color: '#111', flex: 1 },
    olhoBtn:       { paddingLeft: 8 },
    btnCriar:      { backgroundColor: '#2E7D32', borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginTop: 12, elevation: 4, shadowColor: '#2E7D32', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    btnCriarTexto: { fontSize: 16, fontWeight: '800', color: '#fff' },
});