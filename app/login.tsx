import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Botao } from '../components/Botao'; //

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Acessar conta</Text>
      
      <Image
        source={require('../src/assets/images/icon.png')}
        style={styles.logo}
      />

      <TextInput
        style={styles.input}
        placeholder="Digite seu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} 
      />

      <Botao     //
        title="Entrar" 
        onPress={() => alert("Tentativa de Login!")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 150, 
    height: 150,
    alignSelf: 'center', 
    marginBottom: 20,    
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 20,
    color: '#121212',
  },
  input: {
    marginVertical: 8,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
});