import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
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

voltarBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#E8F5E9', 
    justifyContent: 'center', 
    alignItems: 'center' 
},
voltarIcone: { 
    fontSize: 22, 
    color: '#333', 
    lineHeight: 26, 
    marginTop: -2 
},

emoji: { 
    fontSize: 18, 
    color: '#2E7D32' 
},

emojiSelecionado: { 
    color: '#fff' 
},
circleInner: { 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    backgroundColor: '#A5D6A7' 
},
circleInnerSelecionado: { 
    backgroundColor: '#fff' 
},
checkCircle: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: '#2E7D32', 
    justifyContent: 'center', 
    alignItems: 'center' 
},
checkMark: { 
    color: '#fff', 
    fontSize: 13, 
    fontWeight: '700' 
},
inputRow: { 
    flexDirection: 'row', 
    gap: 10, marginBottom: 4 
},
inputWrapper: { 
    flex: 1 
},
inputLabel: { 
    fontSize: 12, 
    color: '#666', 
    fontWeight: '500', 
    marginBottom: 6 
},
inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: '#E0E0E0', 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    paddingVertical: 12, 
    backgroundColor: '#FAFAFA', 
    gap: 4 
},

input: { 
    flex: 1, 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1a1a1a', 
    padding: 0 
},
unidade: { 
    fontSize: 13, 
    color: '#999', 
    fontWeight: '500' 
},

fotoContainer: { 
    marginBottom: 16,
     position: 'relative' 
},
foto: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#ccc' 
},
checkBadge: { 
    position: 'absolute', 
    bottom: 0, right: 0, 
    backgroundColor: '#fff', 
    borderRadius: 13 
},

destaque: { 
    fontWeight: '700', 
    color: '#1a1a1a' 
},

beneficios: { 
    width: '100%', 
    gap: 20 
},

beneficioItem: { 
    flexDirection: 'row',
     alignItems: 'flex-start', 
     gap: 14 
},

beneficioIcone: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#E8F5E9', 
    justifyContent: 'center', 
    alignItems: 'center' 
},

beneficioTexto: { 
    flex: 1 
},
beneficioTitulo: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: 2 
},
beneficioDescricao: { 
    fontSize: 13, 
    color: '#777', 
    lineHeight: 18 
},
pularBtn: { 
    alignItems: 'center', 
    paddingVertical: 6 
},
pularTexto: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#333' 
},
bemVindo: { 
    fontSize: 15, 
    color: '#888', 
    fontWeight: '500', 
    marginBottom: 2 
},
tituloPagina: {
     fontSize: 34, 
     fontWeight: '800', 
     color: '#111', 
     letterSpacing: -0.5 
},
secaoTitulo: { 
    fontSize: 19,
    fontWeight: '700', 
    color: '#111', 
    paddingHorizontal: 25, 
    marginBottom: 18 
},
secaoHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginTop: 32, marginBottom: 16 },
verMais:      { fontSize: 17, color: '#2E7D32', fontWeight: '700' },
tabBar:       { position: 'absolute', bottom: 20, left: 18, right: 18, height: 68, backgroundColor: '#fff', borderRadius: 34, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 12 },
tabItem:      { padding: 10 },
tabItemAtivo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 24, gap: 6 },
tabTextoAtivo:{ color: '#2E7D32', fontWeight: '700', fontSize: 14 },
});
