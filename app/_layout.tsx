import { Stack } from 'expo-router';

export default function LoginScreen() {
  return (
    <Stack>
      {/* Esta linha registra sua tela e remove o título do topo */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      
      {/* Esta linha registra o resto do app (as abas) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}