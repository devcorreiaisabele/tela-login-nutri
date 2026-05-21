import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
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

export default function RedefinirSenha() {
    const [novaSenha,    setNovaSenha]    = useState('');
    const [confirmar,    setConfirmar]    = useState('');
    const [verNova,      setVerNova]      = useState(false);
    const [verConfirmar, setVerConfirmar] = useState(false);
    const [loading,      setLoading]      = useState(false);

    async function redefinir() {
        if (novaSenha.length < 6) {
            Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (novaSenha !== confirmar) {
            Alert.alert('Atenção', 'As senhas não coincidem.');
            return;
        }
        setLoading(true);
        try {
            const usuarioId = await AsyncStorage.getItem('usuarioId');
            const nutricionistaId = await AsyncStorage.getItem('nutricionistaId');
            if (usuarioId) {
                await updateUsuario(usuarioId, { senhaHash: novaSenha });
            } else if (nutricionistaId) {
                await updateNutricionista(nutricionistaId, { senhaHash: novaSenha });
            } else {
                Alert.alert('Erro', 'Conta não identificada.');
                return;
            }

            Alert.alert('✅ Sucesso', 'Senha redefinida com sucesso!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            console.error('Erro ao redefinir senha:', err);
            Alert.alert('Erro', 'Não foi possível redefinir a senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={s.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#EFF4EF" />

            <View style={s.header}>
                <TouchableOpacity style={s.btnVoltar} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Redefinir Senha</Text>
                <View style={{ width: 38 }} />
            </View>

            <View style={s.corpo}>
                <View style={s.iconeBox}>
                    <Ionicons name="lock-closed" size={42} color="#2E7D32" />
                </View>

                <Text style={s.titulo}>Criar nova senha</Text>
                <Text style={s.descricao}>
                    Sua nova senha deve ser diferente das senhas anteriores e ter no mínimo 6 caracteres.
                </Text>

                <Text style={s.label}>Nova Senha</Text>
                <View style={s.senhaWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color="#bbb" style={{ marginRight: 10 }} />
                    <TextInput
                        style={s.senhaInput}
                        placeholder="••••••"
                        placeholderTextColor="#bbb"
                        value={novaSenha}
                        onChangeText={setNovaSenha}
                        secureTextEntry={!verNova}
                    />
                    <TouchableOpacity onPress={() => setVerNova(v => !v)}>
                        <Ionicons name={verNova ? 'eye-outline' : 'eye-off-outline'} size={20} color="#bbb" />
                    </TouchableOpacity>
                </View>

                <Text style={s.label}>Confirmar Nova Senha</Text>
                <View style={s.senhaWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color="#bbb" style={{ marginRight: 10 }} />
                    <TextInput
                        style={s.senhaInput}
                        placeholder="••••••"
                        placeholderTextColor="#bbb"
                        value={confirmar}
                        onChangeText={setConfirmar}
                        secureTextEntry={!verConfirmar}
                    />
                    <TouchableOpacity onPress={() => setVerConfirmar(v => !v)}>
                        <Ionicons name={verConfirmar ? 'eye-outline' : 'eye-off-outline'} size={20} color="#bbb" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={s.rodape}>
                <TouchableOpacity
                    style={[s.btnRedefinir, loading && { opacity: 0.7 }]}
                    onPress={redefinir}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <Text style={s.btnRedefinirTexto}>
                        {loading ? 'Salvando...' : 'Redefinir Senha'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root:              { flex: 1, backgroundColor: '#EFF4EF' },
    header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 18, paddingBottom: 8 },
    btnVoltar:         { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    headerTitulo:      { fontSize: 18, fontWeight: '700', color: '#111' },
    corpo:             { flex: 1, paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
    iconeBox:          { width: 90, height: 90, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    titulo:            { fontSize: 26, fontWeight: '800', color: '#111', textAlign: 'center', marginBottom: 12 },
    descricao:         { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    label:             { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 8, marginTop: 4, alignSelf: 'flex-start', width: '100%' },
    senhaWrapper:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: '#E8E8E8' },
    senhaInput:        { flex: 1, fontSize: 15, color: '#111' },
    rodape:            { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12 },
    btnRedefinir:      { backgroundColor: '#2E7D32', borderRadius: 30, paddingVertical: 18, alignItems: 'center' },
    btnRedefinirTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
