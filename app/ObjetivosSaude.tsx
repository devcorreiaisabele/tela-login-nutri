import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { globalStyles as style } from '../props/globalStyles';
import { updateUsuario } from '../src/services/usuarioService_1';

const OBJETIVOS = [
  { id: 'perder', emoji: '↘', titulo: 'Perder Peso',  descricao: 'Reduzir medidas e queimar gordura' },
  { id: 'manter', emoji: '⚖', titulo: 'Manter Peso',  descricao: 'Focar em alimentação saudável e energia' },
  { id: 'ganhar', emoji: '↗', titulo: 'Ganhar Massa', descricao: 'Foco em hipertrofia e força muscular' },
];

const ROTINAS = [
  { id: 'ativo',      icone: 'run',            titulo: 'Pratico atividade física', descricao: 'Treino 3 a 5 vezes por semana' },
  { id: 'atleta',     icone: 'dumbbell',       titulo: 'Sou atleta',               descricao: 'Treinos intensos, performance e recuperação' },
  { id: 'sedentario', icone: 'sofa-single',    titulo: 'Rotina mais sedentária',   descricao: 'Passo boa parte do dia sentado(a)' },
];

export default function ObjetivosSaude() {
  const [objetivoSelecionado, setObjetivoSelecionado] = useState('');
  const [rotinaSelecionada, setRotinaSelecionada]     = useState('');
  const [pesoAtual, setPesoAtual]                     = useState('');
  const [meta, setMeta]                               = useState('');
  const [altura, setAltura]                           = useState('');
  const [loading, setLoading]                         = useState(false);
  const [genero, setGenero]                           = useState('');
  const [diaNascimento, setDiaNascimento]             = useState('');
  const [mesNascimento, setMesNascimento]             = useState('');
  const [anoNascimento, setAnoNascimento]             = useState('');


  async function handleContinuar() {
    console.warn('DADOS:', JSON.stringify({
    objetivoSaude: objetivoSelecionado,
    rotinaAtividade: rotinaSelecionada,
    pesoAtual,
    pesoMeta: meta,
    altura,
}));
    setLoading(true);

    let dataNascimento: string | null = null;
    if (diaNascimento && mesNascimento && anoNascimento) {
      const dia = diaNascimento.padStart(2, '0');
      const mes = mesNascimento.padStart(2, '0');
      dataNascimento = `${anoNascimento}-${mes}-${dia}`;
    }

    try {
      const usuarioId = await AsyncStorage.getItem('usuarioId');
      console.warn('ID DO USUARIO: ' + usuarioId);
      console.warn('DATA NASCIMENTO:', dataNascimento);
      console.warn('DIA:', diaNascimento, 'MES:', mesNascimento, 'ANO:', anoNascimento);
      if (usuarioId) await updateUsuario(usuarioId, {
        objetivoSaude: objetivoSelecionado,
        rotinaAtividade: rotinaSelecionada,
        pesoAtual: pesoAtual ? Number(pesoAtual) : null,
        pesoInicial: pesoAtual ? Number(pesoAtual) : null,
        pesoMeta: meta ? Number(meta) : null,
        altura: altura ? Number(altura) / 100 : null,
        genero: genero || null,
        dataNascimento,
      });
    } catch (e) {
      console.log('Erro ao salvar objetivos:', e);
    }
    setLoading(false);
    router.push('./Nutricionistaupsell');
  }

  return (
    <KeyboardAvoidingView style={style.container} behavior="padding">

      <View style={style.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={style.voltarIcone}>‹</Text>
        </TouchableOpacity>
        <Text style={style.passo}>Passo 3 de 3</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={style.progressoBg}>
        <View style={{ height: 4, width: '100%', backgroundColor: '#2E7D32', borderRadius: 10 }} />
      </View>

      <ScrollView contentContainerStyle={style.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <Text style={style.titulo}>Objetivos de Saúde</Text>
        <Text style={style.subtitulo}>
          Para finalizar, qual o seu objetivo principal com a dieta?
        </Text>

        {OBJETIVOS.map((obj) => {
          const selecionado = objetivoSelecionado === obj.id;
          return (
            <TouchableOpacity
              key={obj.id}
              style={[style.card, selecionado && style.cardSelecionado]}
              onPress={() => setObjetivoSelecionado(obj.id)}
              activeOpacity={0.8}
            >
              <View style={[style.cardIcone, selecionado && style.cardIconeSelecionado]}>
                <Text style={[style.emoji, selecionado && style.emojiSelecionado]}>{obj.emoji}</Text>
              </View>
              <View style={style.cardTexto}>
                <Text style={[style.cardTitulo, selecionado && style.cardTituloSelecionado]}>{obj.titulo}</Text>
                <Text style={style.cardDescricao}>{obj.descricao}</Text>
              </View>
              {selecionado && (
                <View style={style.checkCircle}>
                  <Text style={style.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <Text style={style.titulo2}>Medidas e Metas</Text>
        <Text style={style.subtitulo}>Insira seu peso atual, sua meta e sua altura.</Text>

        <View style={style.inputRow}>
          {[
            { label: 'Peso Atual', value: pesoAtual, onChange: setPesoAtual },
            { label: 'Sua Meta',   value: meta,      onChange: setMeta },
            { label: 'Altura',     value: altura,    onChange: setAltura },
          ].map(({ label, value, onChange }) => (
            <View style={style.inputWrapper} key={label}>
              <Text style={style.inputLabel}>{label}</Text>
              <View style={style.inputBox}>
                <TextInput
                  style={style.input}
                  placeholder="--"
                  placeholderTextColor="#BDBDBD"
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                />
                <Text style={style.unidade}>{label === 'Altura' ? 'm' : 'kg'}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={style.titulo2}>Data de Nascimento</Text>
        <Text style={style.subtitulo}>Insira o dia, mês e ano em que você nasceu.</Text>
        <View style={style.inputRow}>
          {[
            { label: 'Dia',  value: diaNascimento, onChange: setDiaNascimento, maxLength: 2, placeholder: 'DD' },
            { label: 'Mês',  value: mesNascimento, onChange: setMesNascimento, maxLength: 2, placeholder: 'MM' },
            { label: 'Ano',  value: anoNascimento, onChange: setAnoNascimento, maxLength: 4, placeholder: 'AAAA' },
          ].map(({ label, value, onChange, maxLength, placeholder }) => (
            <View style={style.inputWrapper} key={label}>
              <Text style={style.inputLabel}>{label}</Text>
              <View style={style.inputBox}>
                <TextInput
                  style={style.input}
                  placeholder={placeholder}
                  placeholderTextColor="#BDBDBD"
                  keyboardType="numeric"
                  maxLength={maxLength}
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            </View>
          ))}
        </View>

       <Text style={style.titulo2}>Gênero</Text>
       <Text style={style.subtitulo}>
       Se você está em transição hormonal há mais de um ano, selecione o gênero correspondente
       aos seus hormônios predominantes para um cálculo mais aproximado.
       </Text>
       <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
       {[
       { id: 'MASCULINO', label: 'Homem', emoji: '👤' },
       { id: 'FEMININO',  label: 'Mulher', emoji: '👤' },
       ].map((g) => {
      const sel = genero === g.id;
      return (
      <TouchableOpacity
        key={g.id}
        onPress={() => setGenero(g.id)}
        activeOpacity={0.8}
        style={[style.card, sel && style.cardSelecionado, { flex: 1, justifyContent: 'center' }]}
      >
        <View style={[style.cardIcone, sel && style.cardIconeSelecionado]}>
          <Text style={[style.emoji, sel && style.emojiSelecionado]}>{g.emoji}</Text>
        </View>
        <Text style={[style.cardTitulo, sel && style.cardTituloSelecionado]}>{g.label}</Text>
        {sel && (
          <View style={style.checkCircle}>
            <Text style={style.checkMark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  })}
  </View>

        <Text style={style.titulo2}>Perfil e rotina</Text>
        <Text style={style.subtitulo}>Essas informações ajudam a ajustar calorias e proteína do dia.</Text>

        {ROTINAS.map((rotina) => {
          const selecionada = rotinaSelecionada === rotina.id;
          return (
            <TouchableOpacity
              key={rotina.id}
              style={[style.card, selecionada && style.cardSelecionado]}
              onPress={() => setRotinaSelecionada(rotina.id)}
              activeOpacity={0.8}
            >
              <View style={[style.cardIcone, selecionada && style.cardIconeSelecionado]}>
                <View style={[style.circleInner, selecionada && style.circleInnerSelecionado]} />
              </View>
              <View style={style.cardTexto}>
                <Text style={[style.cardTitulo, selecionada && style.cardTituloSelecionado]}>{rotina.titulo}</Text>
                <Text style={style.cardDescricao}>{rotina.descricao}</Text>
              </View>
              {selecionada && (
                <View style={style.checkCircle}>
                  <Text style={style.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

      </ScrollView>

{loading
  ? <ActivityIndicator size="large" color="#2E7D32" style={{ margin: 20 }} />
  : <TouchableOpacity onPress={handleContinuar} style={{ margin: 20, backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Continuar</Text>
    </TouchableOpacity>
}

    </KeyboardAvoidingView>
  );
}
