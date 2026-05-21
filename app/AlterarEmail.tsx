import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { updateNutricionista } from '../src/services/nutricionistaService_1';
import { updateUsuario } from '../src/services/usuarioService_1';

export default function AlterarEmail() {
    const [novoEmail, setNovoEmail] = useState('');
    const [senha,     setSenha]     = useState('');
    const [verSenha,  setVerSenha]  = useState(false);
    const [emailAtual, setEmailAtual] = useState('');
    const [loading,   setLoading]   = useState(false);

    useEffect(() => {
        async function carregarEmail() {
            const emailUsuario = await AsyncStorage.getItem('usuarioEmail');
            const emailNutri = await AsyncStorage.getItem('nutricionistaEmail');
            setEmailAtual(emailUsuario ?? emailNutri ?? '');
        }
        carregarEmail();
    }, []);

    async function salvar() {
        if (!novoEmail.trim() || !senha.trim()) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }
        setLoading(true);
        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');
            const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
            const emailNormalizado = novoEmail.trim().toLowerCase();

            if (usuarioId) {
                await updateUsuario(usuarioId, { email: emailNormalizado, senhaHash: senha });
                await AsyncStorage.setItem('usuarioEmail', emailNormalizado);
            } else if (nutricionistaId) {
                await updateNutricionista(nutricionistaId, { emailProfissional: emailNormalizado, senhaHash: senha });
                await AsyncStorage.setItem('nutricionistaEmail', emailNormalizado);
            } else {
                Alert.alert('Erro', 'Conta não identificada.');
                return;
            }
            Alert.alert('✅ Sucesso', 'E-mail alterado com sucesso!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            console.error('Erro ao alterar e-mail:', err);
            Alert.alert('Erro', 'Não foi possível alterar o e-mail. Verifique sua senha.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={s.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />


            <View style={s.header}>
                <TouchableOpacity style={s.btnVoltar} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Alterar E-mail</Text>
                <View style={{ width: 38 }} />
            </View>

            <View style={s.corpo}>
                <Text style={s.descricao}>
                    Atualize o endereço de e-mail associado à sua conta.
                </Text>

                <Text style={s.label}>E-mail Atual</Text>
                <View style={s.inputDesabilitado}>
                    <Text style={s.inputDesabilitadoTexto}>{emailAtual || 'Carregando...'}</Text>
                </View>

                <Text style={s.label}>Novo E-mail</Text>
                <TextInput
                    style={s.input}
                    placeholder="Digite o novo e-mail"
                    placeholderTextColor="#bbb"
                    value={novoEmail}
                    onChangeText={setNovoEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />


                <Text style={s.label}>Senha Atual</Text>
                <View style={s.senhaWrapper}>
                    <TextInput
                        style={s.senhaInput}
                        placeholder="Para sua segurança, digite a senha"
                        placeholderTextColor="#bbb"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry={!verSenha}
                    />
                    <TouchableOpacity onPress={() => setVerSenha(v => !v)}>
                        <Ionicons
                            name={verSenha ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color="#bbb"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={s.rodape}>
                <TouchableOpacity
                    style={[s.btnSalvar, loading && { opacity: 0.7 }]}
                    onPress={salvar}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <Text style={s.btnSalvarTexto}>
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root:                   { flex: 1, backgroundColor: '#F5F5F5' },

    header:                 { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 18, paddingBottom: 16 },
    btnVoltar:              { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EBEBEB', justifyContent: 'center', alignItems: 'center' },
    headerTitulo:           { fontSize: 18, fontWeight: '700', color: '#111' },

    corpo:                  { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
    descricao:              { fontSize: 15, color: '#888', lineHeight: 22, marginBottom: 28 },

    label:                  { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 8, marginTop: 18 },

    inputDesabilitado:      { backgroundColor: '#EBEBEB', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16 },
    inputDesabilitadoTexto: { fontSize: 15, color: '#888' },

    input:                  { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, color: '#111', borderWidth: 1, borderColor: '#E8E8E8' },

    senhaWrapper:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#E8E8E8' },
    senhaInput:             { flex: 1, fontSize: 15, color: '#111' },

    rodape:                 { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12 },
    btnSalvar:              { backgroundColor: '#2E7D32', borderRadius: 30, paddingVertical: 18, alignItems: 'center' },
    btnSalvarTexto:         { color: '#fff', fontSize: 16, fontWeight: '700' },
});
