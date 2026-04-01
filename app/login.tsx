import React from 'react';
import { View, TextInput, Image, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      
      <Image
        source={require('../src/assets/images/icon.png')}
        style={styles.logo}
      />

      <TextInput
        style={styles.input}
        placeholder="Digite seu email"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282828',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },

  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});