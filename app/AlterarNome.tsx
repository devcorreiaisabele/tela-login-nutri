import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert, StatusBar, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';

export default function AlterarNome() {
    const [nome, setNome] = useState('');

    useEffect(() => {
        async function carregar() {
            const nomeSalvo = await AsyncStorage.getItem('usuarioNome');
            if (nomeSalvo) setNome(nomeSalvo);
        }
        carregar();
    }, []);

    async function salvar() {
        if (!nome.trim()) {
            Alert.alert('Atenção', 'O nome não pode ser vazio.');
            return;
        }
        await AsyncStorage.setItem('usuarioNome', nome.trim());
        Alert.alert('Sucesso', 'Nome alterado com sucesso!', [
            { text: 'OK', onPress: () => router.back() },
        ]);
    }

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.voltarBtn}>
                    <Ionicons name="arrow-back" size={22} color="#333" />
                </TouchableOpacity>
                <Text style={styles.topTitulo}>Alterar Nome</Text>
                <View style={styles.voltarBtn} />
            </View>

            <View style={styles.corpo}>
                <Text style={styles.label}>Nome Completo</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#aaa" />
                    <TextInput
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Seu nome completo"
                        placeholderTextColor="#bbb"
                        autoFocus
                    />
                </View>
                <Text style={styles.hint}>
                    Este é o nome que os nutricionistas e o aplicativo usarão para se referir a você.
                </Text>

                <TouchableOpacity style={styles.btnSalvar} onPress={salvar} activeOpacity={0.85}>
                    <Text style={styles.btnSalvarTexto}>Salvar Alterações</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root:           { flex: 1, backgroundColor: '#F5F5F5' },
    topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16 },
    voltarBtn:      { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    topTitulo:      { fontSize: 18, fontWeight: '700', color: '#111' },
    corpo:          { paddingHorizontal: 24, paddingTop: 32 },
    label:          { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 12 },
    inputWrapper:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 54, gap: 10, elevation: 2, marginBottom: 10 },
    input:          { flex: 1, fontSize: 15, color: '#111' },
    hint:           { fontSize: 13, color: '#888', lineHeight: 19, marginBottom: 32 },
    btnSalvar:      { backgroundColor: '#2E7D32', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    btnSalvarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});