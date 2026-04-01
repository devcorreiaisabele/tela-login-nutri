import React from 'react';
import { KeyboardAvoidingView, View, Image, TextInput, StyleSheet } from 'react-native';

export default function App() {
  return (
    <KeyboardAvoidingView style={styles.login}>
      <View>
        <Image 
          source={require('../assets/images/icon.png')}
          style={{ width: 100, height: 100 }} 
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput 
          placeholder='email'
          autoCorrect={false}
          style={styles.input}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ 
  login: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF', 
  },
  inputContainer: {
    width: '80%',
    marginTop: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 10,
  }
});