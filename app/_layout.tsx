import { Stack } from 'expo-router';

export default function LoginScreen() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="AlterarEmail" options={{ headerShown: false }} />
      <Stack.Screen name="Alterarmeta" options={{ headerShown: false }} />
      <Stack.Screen name="AlterarNome" options={{ headerShown: false }} />
      <Stack.Screen name="BuscaReceitas" options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" options={{ headerShown: false }} />
      <Stack.Screen name="Cadastronutricionista" options={{ headerShown: false }} />
      <Stack.Screen name="CalculoCalorias" options={{ headerShown: false }} />
      <Stack.Screen name="ContaCriada" options={{ headerShown: false }} />
      <Stack.Screen name="CriarPaciente" options={{ headerShown: false }} />
      <Stack.Screen name="Dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="Dashboardnutricionista" options={{ headerShown: false }} />
      <Stack.Screen name="DesvincularNutricionista" options={{ headerShown: false }} />
      <Stack.Screen name="DetalhePaciente" options={{ headerShown: false }} />
      <Stack.Screen name="DetalheReceita" options={{ headerShown: false }} />
      <Stack.Screen name="EscolherReceita" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="MaisDetalhes" options={{ headerShown: false }} />
      <Stack.Screen name="Metaatingida" options={{ headerShown: false }} />
      <Stack.Screen name="Notificacoesnutricionista" options={{ headerShown: false }} />
      <Stack.Screen name="Nutricionistaupsell" options={{ headerShown: false }} />
      <Stack.Screen name="ObjetivosSaude" options={{ headerShown: false }} />
      <Stack.Screen name="Outrasreceitas" options={{ headerShown: false }} />
      <Stack.Screen name="PacientesNutricionista" options={{ headerShown: false }} />
      <Stack.Screen name="Perfil" options={{ headerShown: false }} />
      <Stack.Screen name="PerfilNutricionista" options={{ headerShown: false }} />
      <Stack.Screen name="Planoalimentar" options={{ headerShown: false }} />
      <Stack.Screen name="Preferenciasdieta" options={{ headerShown: false }} />
      <Stack.Screen name="Receitas" options={{ headerShown: false }} />
      <Stack.Screen name="RedefinirSenha" options={{ headerShown: false }} />
      <Stack.Screen name="RegistroPeso" options={{ headerShown: false }} />
      <Stack.Screen name="Restricoesadicionais" options={{ headerShown: false }} />
      <Stack.Screen name="SugestoesReceitas" options={{ headerShown: false }} />
      <Stack.Screen name="TipoDeConta" options={{ headerShown: false }} />
      <Stack.Screen name="Todasconquistas" options={{ headerShown: false }} />
      <Stack.Screen name="Vincularnutricionista" options={{ headerShown: false }} />
      <Stack.Screen name="Splashscreen" options={{ headerShown: false }} />
    </Stack>
  );
}