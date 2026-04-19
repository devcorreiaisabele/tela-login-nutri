import axios from 'axios';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Cadastro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const salvar = async () => {
        if (!nome || !email || !senha) {
            alert("Preencha todos os campos!");
            return;
        }

        const data = {
            nome: nome,
            email: email,
            senha: senha,
        };

        setLoading(true);

        try {
            const response = await axios.post('https://69e4d882cfa9394db8da703c.mockapi.io/usuarios', data);
            console.log("Sucesso:", response.data);
            alert("Salvo com sucesso!");
            setNome('');
            setEmail('');
            setSenha('');
        } catch (error) {
            console.log("Erro:", error);
            alert("Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Cadastro de Usuário</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            {loading ? (
                <Text style={styles.loadingText}>Carregando...</Text>
            ) : (
                <View style={styles.buttonContainer}>
                    <Button title="Salvar" onPress={salvar} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#40312A',
        justifyContent: 'center',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#121212',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#FFF',
    },
    buttonContainer: {
        marginTop: 10,
    },
    loadingText: {
        textAlign: 'center',
        color: '#FFF',
        fontSize: 16,
    }
});