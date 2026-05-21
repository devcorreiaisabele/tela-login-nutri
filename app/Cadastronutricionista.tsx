import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { authStyles as style } from '../props/authStyles';
import { createNutricionista, getNutricionistas } from '../src/services/nutricionistaService_1';


const UFS = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
    'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
    'RS','RO','RR','SC','SP','SE','TO',
];

const ESPECIALIDADES = [
    'Nutrição Clínica',
    'Nutrição Esportiva',
    'Nutrição Pediátrica',
    'Nutrição Oncológica',
    'Comportamento Alimentar',
    'Nutrição Funcional',
    'Nutrição Materno-Infantil',
    'Nutrição Geriátrica',
];


export default function CadastroNutricionista() {

    const [nome,     setNome]     = useState('');
    const [email,    setEmail]    = useState('');
    const [senha,    setSenha]    = useState('');
    const [verSenha, setVerSenha] = useState(false);

    const [crn,            setCrn]            = useState('');
    const [ufSelecionada,  setUfSelecionada]  = useState('SP');
    const [especialidade,  setEspecialidade]  = useState('');
    const [termos,         setTermos]         = useState(false);


    const [modalUf,            setModalUf]            = useState(false);
    const [modalEspecialidade, setModalEspecialidade] = useState(false);
    const [loading,    setLoading]    = useState(false);
    const [botaoAtivo, setBotaoAtivo] = useState(false);

    useEffect(() => {
        setBotaoAtivo(
            nome.trim().length > 0 &&
            email.trim().length > 0 &&
            senha.length >= 8 &&
            crn.trim().length > 0 &&
            especialidade.length > 0 &&
            termos
        );
    }, [nome, email, senha, crn, especialidade, termos]);

    async function finalizar() {
        if (!botaoAtivo) return;
        setLoading(true);

        try {
            const emailNormalizado = email.trim().toLowerCase();
            const nutricionistas = await getNutricionistas();
            const emailExiste = nutricionistas.some(
                (n: any) => n.emailProfissional?.toLowerCase() === emailNormalizado
            );

            if (emailExiste) {
                Alert.alert('Erro', 'Este e-mail profissional jÃ¡ estÃ¡ cadastrado.');
                return;
            }

            const nutricionista = await createNutricionista({
                nomeCompleto: nome.trim(),
                emailProfissional: emailNormalizado,
                senhaHash: senha,
                crn: crn.trim(),
                uf: ufSelecionada,
                especialidadePrincipal: especialidade,
            });

            await AsyncStorage.setItem('nutricionistaId',   (nutricionista.idNutri ?? nutricionista.id).toString());
            await AsyncStorage.setItem('nutricionistaNome', nutricionista.nomeCompleto);
            await AsyncStorage.setItem('nutricionistaEmail', nutricionista.emailProfissional);
            await AsyncStorage.setItem('nutricionistaPerfil', JSON.stringify(nutricionista));

            Alert.alert(
                '✅ Cadastro realizado!',
                'Sua conta profissional foi criada com sucesso.',
                [{ text: 'Entrar', onPress: () => router.push('./Dashboardnutricionista')}],
            );
        } catch (err) {
            console.error('Erro no cadastro:', err);
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
            <Modal visible={modalUf} transparent animationType="slide">
                <View style={local.modalOverlay}>
                    <View style={local.modalBox}>
                        <Text style={local.modalTitulo}>Selecione a UF</Text>
                        <ScrollView>
                            {UFS.map(uf => (
                                <TouchableOpacity
                                    key={uf}
                                    style={[local.modalItem, ufSelecionada === uf && local.modalItemAtivo]}
                                    onPress={() => { setUfSelecionada(uf); setModalUf(false); }}
                                >
                                    <Text style={[local.modalItemTexto, ufSelecionada === uf && local.modalItemTextoAtivo]}>
                                        {uf}
                                    </Text>
                                    {ufSelecionada === uf && (
                                        <Ionicons name="checkmark" size={18} color="#4CAF50" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={local.modalBtnFechar} onPress={() => setModalUf(false)}>
                            <Text style={local.modalBtnFecharTexto}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalEspecialidade} transparent animationType="slide">
                <View style={local.modalOverlay}>
                    <View style={local.modalBox}>
                        <Text style={local.modalTitulo}>Especialidade Principal</Text>
                        <ScrollView>
                            {ESPECIALIDADES.map(esp => (
                                <TouchableOpacity
                                    key={esp}
                                    style={[local.modalItem, especialidade === esp && local.modalItemAtivo]}
                                    onPress={() => { setEspecialidade(esp); setModalEspecialidade(false); }}
                                >
                                    <Text style={[local.modalItemTexto, especialidade === esp && local.modalItemTextoAtivo]}>
                                        {esp}
                                    </Text>
                                    {especialidade === esp && (
                                        <Ionicons name="checkmark" size={18} color="#4CAF50" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={local.modalBtnFechar} onPress={() => setModalEspecialidade(false)}>
                            <Text style={local.modalBtnFecharTexto}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={style.logoContainer}>
                <Image
                    source={require('../src/assets/images/icon.png')}
                    style={style.logo}
                />
                <Text style={style.appNome}>Nutri+</Text>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[style.card, { flex: 1 }]}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        <TouchableOpacity style={local.btnVoltar} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={20} color="#333" />
                        </TouchableOpacity>

                        <Text style={style.title}>Junte-se ao Nutri+</Text>
                        <Text style={style.subtitle}>
                            Crie sua conta profissional para acompanhar seus pacientes e gerenciar dietas de forma eficiente.
                        </Text>

                        <Text style={local.secaoTitulo}>Dados Pessoais</Text>
                        <View style={local.divisor} />

                        <Text style={local.label}>Nome Completo</Text>
                        <TextInput
                            style={style.input}
                            placeholder="Ex: Dra. Camila Fernandes"
                            placeholderTextColor="#999"
                            value={nome}
                            onChangeText={setNome}
                        />

                        <Text style={local.label}>E-mail Profissional</Text>
                        <TextInput
                            style={style.input}
                            placeholder="contato@nutricionista.com"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={local.label}>Senha</Text>
                        <View style={local.senhaWrapper}>
                            <TextInput
                                style={local.senhaInput}
                                placeholder="Mínimo de 8 caracteres"
                                placeholderTextColor="#999"
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry={!verSenha}
                            />
                            <TouchableOpacity onPress={() => setVerSenha(v => !v)} style={local.senhaOlho}>
                                <Ionicons
                                    name={verSenha ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color="#aaa"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={local.secaoTitulo}>Dados Profissionais</Text>
                        <View style={local.divisor} />

                        <View style={local.linhaRow}>
                            <View style={{ flex: 1.6 }}>
                                <Text style={local.label}>Número do CRN</Text>
                                <TextInput
                                    style={style.input}
                                    placeholder="Ex: 12345"
                                    placeholderTextColor="#999"
                                    value={crn}
                                    onChangeText={setCrn}
                                    keyboardType="number-pad"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={local.label}>UF</Text>
                                <TouchableOpacity
                                    style={local.dropdown}
                                    onPress={() => setModalUf(true)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={local.dropdownTexto}>{ufSelecionada}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#555" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={local.label}>Especialidade Principal</Text>
                        <TouchableOpacity
                            style={local.dropdown}
                            onPress={() => setModalEspecialidade(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={[local.dropdownTexto, !especialidade && { color: '#999' }]}>
                                {especialidade || 'Selecione uma especialidade'}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#555" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={local.termosRow}
                            onPress={() => setTermos(t => !t)}
                            activeOpacity={0.8}
                        >
                            <View style={[local.checkbox, termos && local.checkboxAtivo]}>
                                {termos && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </View>
                            <Text style={local.termosTexto}>
                                Declaro que as informações acima são verdadeiras e concordo com os{' '}
                                <Text style={local.termosLink}>Termos de Uso</Text>
                                {' '}e a{' '}
                                <Text style={local.termosLink}>Política de Privacidade</Text>
                                {' '}para profissionais.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[style.botao, (!botaoAtivo || loading) && style.botaoDesabilitado, { marginTop: 10, marginBottom: 8 }]}
                            onPress={finalizar}
                            disabled={!botaoAtivo || loading}
                            activeOpacity={0.85}
                        >
                            <Text style={style.botaoTexto}>
                                {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
                            </Text>
                        </TouchableOpacity>

                        <Text style={style.linkTexto} onPress={() => router.back()}>
                            Já tem conta? <Text style={style.linkDestaque}>Entrar</Text>
                        </Text>

                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}


const local = StyleSheet.create({
    btnVoltar:           { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },

    secaoTitulo:         { fontSize: 16, fontWeight: '700', color: '#111', marginTop: 20, marginBottom: 6 },
    divisor:             { height: 1, backgroundColor: '#eee', marginBottom: 14 },
    label:               { fontSize: 13, color: '#555', marginBottom: 6, marginTop: 10 },

    senhaWrapper:        { flexDirection: 'row', alignItems: 'center', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9', paddingHorizontal: 15 },
    senhaInput:          { flex: 1, fontSize: 15, color: '#121212' },
    senhaOlho:           { paddingLeft: 8 },

    linhaRow:            { flexDirection: 'row', gap: 10 },

    dropdown:            { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9', paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dropdownTexto:       { fontSize: 15, color: '#121212' },

    termosRow:           { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 18, marginBottom: 4 },
    checkbox:            { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
    checkboxAtivo:       { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
    termosTexto:         { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },
    termosLink:          { color: '#4CAF50', fontWeight: '700' },

    modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalBox:            { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
    modalTitulo:         { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 16 },
    modalItem:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalItemAtivo:      { backgroundColor: '#F1FBF1', borderRadius: 8, paddingHorizontal: 8 },
    modalItemTexto:      { fontSize: 15, color: '#333' },
    modalItemTextoAtivo: { color: '#2E7D32', fontWeight: '700' },
    modalBtnFechar:      { marginTop: 16, backgroundColor: '#F0F0F0', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    modalBtnFecharTexto: { fontSize: 15, fontWeight: '700', color: '#333' },
});
