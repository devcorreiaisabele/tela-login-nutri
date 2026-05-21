import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    ImageBackground,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { authStyles as style } from '../props/authStyles';
 

const OPCOES = [
    {
        id: 'paciente',
        titulo: 'Sou Paciente',
        descricao: 'Quero acompanhar minha dieta, metas e ver minhas refeições.',
        icone: 'person-outline' as const,
        lib: 'ionicons' as const,
    },
    {
        id: 'nutricionista',
        titulo: 'Sou Nutricionista',
        descricao: 'Quero gerenciar meus pacientes, montar dietas e monitorar o progresso.',
        icone: 'stethoscope' as const,
        lib: 'material' as const,
    },
];
 
 
export default function TipoDeConta() {
    const [selecionado, setSelecionado] = useState<string | null>(null);
 
    async function handleContinuar() {
        if (!selecionado) return;
 
        await AsyncStorage.setItem('tipoConta', selecionado);
 
        if (selecionado === 'paciente') {
            router.push('./Cadastro');
        } else {
            router.push('./Cadastronutricionista');
        }
    }
 
    const botaoAtivo = selecionado !== null;
 
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

                <TouchableOpacity
                    style={localStyles.btnVoltar}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={20} color="#333" />
                </TouchableOpacity>
 
                <Text style={style.title}>Qual é o seu perfil?</Text>
                <Text style={style.subtitle}>
                    Selecione como você deseja utilizar o aplicativo para direcionarmos você ao cadastro correto.
                </Text>
 
                <View style={localStyles.opcoes}>
                    {OPCOES.map((opcao) => {
                        const ativo = selecionado === opcao.id;
                        return (
                            <TouchableOpacity
                                key={opcao.id}
                                style={[localStyles.opcaoCard, ativo && localStyles.opcaoCardAtivo]}
                                onPress={() => setSelecionado(opcao.id)}
                                activeOpacity={0.8}
                            >

                                <View style={[localStyles.opcaoIcone, ativo && localStyles.opcaoIconeAtivo]}>
                                    {opcao.lib === 'ionicons' ? (
                                        <Ionicons
                                            name={opcao.icone as any}
                                            size={26}
                                            color={ativo ? '#fff' : '#555'}
                                        />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name={opcao.icone as any}
                                            size={26}
                                            color={ativo ? '#fff' : '#555'}
                                        />
                                    )}
                                </View>

                                <View style={localStyles.opcaoTexto}>
                                    <Text style={[localStyles.opcaoTitulo, ativo && localStyles.opcaoTituloAtivo]}>
                                        {opcao.titulo}
                                    </Text>
                                    <Text style={localStyles.opcaoDesc}>{opcao.descricao}</Text>
                                </View>

                                <View style={[localStyles.radio, ativo && localStyles.radioAtivo]}>
                                    {ativo && <View style={localStyles.radioPonto} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
 
                <TouchableOpacity
                    style={[style.botao, !botaoAtivo && style.botaoDesabilitado]}
                    onPress={handleContinuar}
                    disabled={!botaoAtivo}
                    activeOpacity={0.85}
                >
                    <Text style={style.botaoTexto}>Continuar</Text>
                </TouchableOpacity>
 
            </View>
        </ImageBackground>
    );
}
 

 
import { StyleSheet } from 'react-native';
 
const localStyles = StyleSheet.create({
    btnVoltar:          {
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: '#F0F0F0',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 14,
                        },
 
    opcoes:             { marginTop: 20, gap: 12, marginBottom: 20 },
 
    opcaoCard:          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1.5,
                            borderColor: '#ddd',
                            borderRadius: 12,
                            padding: 14,
                            gap: 12,
                            backgroundColor: '#fafafa',
                        },
    opcaoCardAtivo:     {
                            borderColor: '#4CAF50',
                            backgroundColor: '#F1FBF1',
                        },
 
    opcaoIcone:         {
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            backgroundColor: '#F0F0F0',
                            justifyContent: 'center',
                            alignItems: 'center',
                        },
    opcaoIconeAtivo:    { backgroundColor: '#4CAF50' },
 
    opcaoTexto:         { flex: 1 },
    opcaoTitulo:        { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 3 },
    opcaoTituloAtivo:   { color: '#2E7D32' },
    opcaoDesc:          { fontSize: 12, color: '#777', lineHeight: 18 },
 
    radio:              {
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            borderWidth: 2,
                            borderColor: '#ccc',
                            justifyContent: 'center',
                            alignItems: 'center',
                        },
    radioAtivo:         { borderColor: '#4CAF50' },
    radioPonto:         {
                            width: 11,
                            height: 11,
                            borderRadius: 6,
                            backgroundColor: '#4CAF50',
                        },
});