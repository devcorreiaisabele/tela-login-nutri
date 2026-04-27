import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

  
const DIETAS = [
{ id: 'onivora', icone: 'food-drumstick', titulo: 'Onívora', descricao: 'Come de tudo, sem restrições base' },
{ id: 'vegana', icone: 'leaf', titulo: 'Vegana', descricao: 'Sem produtos de origem animal' },
{ id: 'vegetariana', icone: 'food-apple', titulo: 'Vegetariana', descricao: 'Inclui ovos e laticínios' },
{ id: 'pescetariana', icone: 'fish', titulo: 'Pescetariana', descricao: 'Vegetariano + peixes e frutos do mar' },
];

 
const PREFERENCIAS = [
{ id: 'gluten', label: 'Sem Glúten' },
{ id: 'lactose', label: 'Sem Lactose' },
{ id: 'nozes', label: 'Alergia a Nozes' },
{ id: 'regionais', label: 'Ingredientes Regionais (Norte)' },
{ id: 'lowcarb', label: 'Low Carb' },
{ id: 'proteina', label: 'Rico em Proteína' },
];
 
export default function PreferenciasDieta() {
 
const [dietaSelecionada, setDietaSelecionada] = useState('');
const [preferencias, setPreferencias] = useState([]);
 
function togglePreferencia(id: string) {
setPreferencias((prev: any) =>
    prev.includes(id) ? prev.filter((p: any) => p !== id) : [...prev, id]
);
}
 
function continuar() {
router.push('./');
}
 
return (
<View style={style.container}>
 
<View style={style.header}>
<TouchableOpacity onPress={() => router.back()}>
<Ionicons name="chevron-back" size={24} color="#333" />
</TouchableOpacity>
<Text style={style.passo}>Passo 1 de 3</Text>
<View style={{ width: 24 }} />
</View>
 
<View style={style.progressoBg}>
<View style={style.progressoAtivo} />
</View>
 
<ScrollView
contentContainerStyle={style.scroll}
showsVerticalScrollIndicator={false}
>
<Text style={style.titulo}>Qual é a sua dieta base?</Text>
<Text style={style.subtitulo}>
Isso nos ajudará a personalizar suas recomendações de refeições.
</Text>
 
{DIETAS.map((dieta) => {
const selecionada = dietaSelecionada === dieta.id;
return (
<TouchableOpacity
key={dieta.id}
style={[style.card, selecionada && style.cardSelecionado]}
onPress={() => setDietaSelecionada(dieta.id)}
activeOpacity={0.8}
>
<View style={[style.cardIcone, selecionada && style.cardIconeSelecionado]}>
<MaterialCommunityIcons
name={dieta.icone as any}
size={22}
color={selecionada ? '#fff' : '#2E7D32'}
/>
</View>
 
<View style={style.cardTexto}>
<Text style={[style.cardTitulo, selecionada && style.cardTituloSelecionado]}>
{dieta.titulo}
</Text>
<Text style={style.cardDescricao}>{dieta.descricao}</Text>
</View>
 
{selecionada && (
<Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
)}
</TouchableOpacity>
);
})}
 
<Text style={style.titulo2}>Preferências e Restrições</Text>
<Text style={style.subtitulo}>Selecione itens regionais ou alergias.</Text>
 
<View style={style.chips}>
{PREFERENCIAS.map((pref) => {
const ativo = (preferencias as any).includes(pref.id);
return (
<TouchableOpacity
key={pref.id}
style={[style.chip, ativo && style.chipAtivo]}
onPress={() => togglePreferencia(pref.id)}
activeOpacity={0.8}
>
<Text style={[style.chipTexto, ativo && style.chipTextoAtivo]}>
{pref.label}
</Text>
</TouchableOpacity>
);
})}
</View>
</ScrollView>
 
<View style={style.rodape}>
<TouchableOpacity style={style.botao} onPress={continuar}>
<Text style={style.botaoTexto}>Continuar</Text>
<Ionicons name="arrow-forward" size={18} color="#fff" />
</TouchableOpacity>
</View>
 
</View>
);
}
 
const style = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
},
header: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
paddingHorizontal: 20,
paddingTop: 55,
paddingBottom: 10,
},
passo: {
fontSize: 14,
color: '#555',
fontWeight: '500',
},
progressoBg: {
height: 4,
backgroundColor: '#E0E0E0',
marginHorizontal: 20,
borderRadius: 10,
marginBottom: 8,
},
progressoAtivo: {
height: 4,
width: '33%',
backgroundColor: '#2E7D32',
borderRadius: 10,
},
scroll: {
paddingHorizontal: 20,
paddingTop: 20,
paddingBottom: 110,
},
titulo: {
fontSize: 22,
fontWeight: '700',
color: '#1a1a1a',
marginBottom: 6,
},
titulo2: {
fontSize: 18,
fontWeight: '700',
color: '#1a1a1a',
marginTop: 24,
marginBottom: 6,
},
subtitulo: {
fontSize: 14,
color: '#666',
marginBottom: 16,
lineHeight: 20,
},
card: {
flexDirection: 'row',
alignItems: 'center',
borderWidth: 1.5,
borderColor: '#E0E0E0',
borderRadius: 12,
padding: 14,
backgroundColor: '#fff',
gap: 12,
marginBottom: 10,
},
cardSelecionado: {
borderColor: '#2E7D32',
backgroundColor: '#E8F5E9',
},
cardIcone: {
width: 42,
height: 42,
borderRadius: 21,
backgroundColor: '#E8F5E9',
justifyContent: 'center',
alignItems: 'center',
},
cardIconeSelecionado: {
backgroundColor: '#2E7D32',
},
cardTexto: {
flex: 1,
},
cardTitulo: {
fontSize: 15,
fontWeight: '600',
color: '#1a1a1a',
},
cardTituloSelecionado: {
color: '#2E7D32',
},
cardDescricao: {
fontSize: 13,
color: '#777',
marginTop: 2,
},
chips: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: 10,
marginTop: 4,
},
chip: {
paddingHorizontal: 16,
paddingVertical: 10,
borderRadius: 20,
borderWidth: 1.5,
borderColor: '#E0E0E0',
backgroundColor: '#fff',
},
chipAtivo: {
backgroundColor: '#2E7D32',
borderColor: '#2E7D32',
},
chipTexto: {
fontSize: 13,
color: '#444',
fontWeight: '500',
},
chipTextoAtivo: {
color: '#fff',
fontWeight: '600',
},
rodape: {
position: 'absolute',
bottom: 0,
left: 0,
right: 0,
padding: 20,
backgroundColor: '#fff',
borderTopWidth: 1,
borderTopColor: '#f0f0f0',
},
botao: {
backgroundColor: '#2E7D32',
borderRadius: 12,
paddingVertical: 16,
flexDirection: 'row',
justifyContent: 'center',
alignItems: 'center',
gap: 8,
},
botaoTexto: {
color: '#fff',
fontSize: 16,
fontWeight: '700',
},
});

