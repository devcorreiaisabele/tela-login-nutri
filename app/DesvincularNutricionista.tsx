
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import api from '../src/services/api';
import { updateVinculo } from '../src/services/vinculoService_1';

export default function DesvincularNutricionista() {
    const params = useLocalSearchParams<{
        nutriId:       string;
        nutriNome:     string;
        nutriEspec:    string;
        nutriCrn:      string;
        nutriFoto:     string;
    }>();

    const [loading, setLoading] = useState(false);

    const primeiroNome = (params.nutriNome ?? '').split(' ')[0];

async function desvincular() {
    setLoading(true);
    try {
        const usuarioId = await AsyncStorage.getItem('usuarioId');
        const response = await api.get(`/vinculo/usuario/${usuarioId}`);
        const vinculos = response.data;
        const vinculo = vinculos.find((v: any) => v.status === 'Ativo');
        if (vinculo) {
            await updateVinculo(vinculo.idVinculo ?? vinculo.id, { ...vinculo, status: 'Encerrado' });
        }
        await AsyncStorage.removeItem('nutricionistaVinculada');
        Alert.alert(
            'Desvinculado!',
            `${params.nutriNome} não tem mais acesso ao seu diário alimentar.`,
            [{ text: 'OK', onPress: () => router.replace('./Perfil') }],
        );
    } catch (err) {
        console.error('Erro ao desvincular:', err);
        Alert.alert('Erro', 'Não foi possível desvincular. Tente novamente.');
    } finally {
        setLoading(false);
    }
}

    function vincularOutro() {
        router.replace('./VincularNutricionista');
    }

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

            <View style={s.header}>
                <TouchableOpacity style={s.btnVoltar} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={s.headerTitulo}>Nutricionista</Text>
                <View style={{ width: 38 }} />
            </View>

            <View style={s.corpo}>
                <View style={s.avatarArea}>
                    {params.nutriFoto ? (
                        <Image source={{ uri: params.nutriFoto }} style={s.avatar} />
                    ) : (
                        <View style={s.avatarPlaceholder}>
                            <Ionicons name="person" size={52} color="#ccc" />
                        </View>
                    )}
                </View>

                <Text style={s.nome}>{params.nutriNome || 'Nutricionista'}</Text>
                <Text style={s.espec}>{params.nutriEspec || 'Nutricionista'}</Text>
                {params.nutriCrn ? (
                    <Text style={s.crn}>{params.nutriCrn}</Text>
                ) : null}

                <View style={s.avisoCard}>
                    <View style={s.avisoIconeBox}>
                        <MaterialCommunityIcons name="account-minus" size={28} color="#E53935" />
                    </View>
                    <Text style={s.avisoTitulo}>Deseja desvincular?</Text>
                    <Text style={s.avisoDesc}>
                        Ao desvincular este profissional, {primeiroNome} não terá mais acesso ao seu diário
                        alimentar e plano de metas. Você poderá adicionar um novo nutricionista a
                        qualquer momento na aba de Perfil.
                    </Text>
                </View>
            </View>

            <View style={s.rodape}>
                <TouchableOpacity
                    style={[s.btnDesvincular, loading && { opacity: 0.7 }]}
                    onPress={desvincular}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <Text style={s.btnDesvincularTexto}>
                        {loading ? 'Desvinculando...' : 'Desvincular Nutricionista'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={s.btnManter}
                    onPress={() => router.back()}
                    activeOpacity={0.85}
                >
                    <Text style={s.btnManterTexto}>Manter Vínculo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={s.btnTrocar}
                    onPress={vincularOutro}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="swap-horizontal" size={16} color="#2E7D32" />
                    <Text style={s.btnTrocarTexto}>Vincular outra nutricionista</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root:               { flex: 1, backgroundColor: '#F5F5F5' },
    header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 18, paddingBottom: 12 },
    btnVoltar:          { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    headerTitulo:       { fontSize: 18, fontWeight: '700', color: '#111' },
    corpo:              { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20 },
    avatarArea:         { marginBottom: 16 },
    avatar:             { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder:  { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8E8E8', justifyContent: 'center', alignItems: 'center' },
    nome:               { fontSize: 24, fontWeight: '800', color: '#111', textAlign: 'center', marginBottom: 6 },
    espec:              { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 4 },
    crn:                { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 24 },
    avisoCard:          { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', width: '100%', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    avisoIconeBox:      { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    avisoTitulo:        { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 12 },
    avisoDesc:          { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
    rodape:             { paddingHorizontal: 24, paddingBottom: 36, gap: 12 },
    btnDesvincular:     { backgroundColor: '#E53935', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
    btnDesvincularTexto:{ color: '#fff', fontSize: 16, fontWeight: '700' },
    btnManter:          { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
    btnManterTexto:     { fontSize: 16, fontWeight: '700', color: '#333' },
    btnTrocar:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
    btnTrocarTexto:     { fontSize: 14, fontWeight: '600', color: '#2E7D32' },
});