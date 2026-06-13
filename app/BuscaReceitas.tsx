import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { globalStyles as style } from "../props/globalStyles";
import { getReceitas } from "../src/services/receitaService_1";

const BUSCAS_RECENTES = [
  "Rápido e Fácil",
  "Vegano",
  "Café da Manhã",
  "Pós-treino",
];

const TAG_CORES: Record<string, string> = {
  "Rico em Proteína": "#1565C0",
  "Rico em Ferro": "#B71C1C",
  "Rico em B12": "#E65100",
  Vegano: "#2E7D32",
  "Café da Manhã": "#6A1B9A",
  "Pós-treino": "#00695C",
};

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parecido(a: string, b: string) {
  if (a === b) return true;
  if (b.includes(a) || a.includes(b)) return true;

  let erros = 0;
  const tamanho = Math.max(a.length, b.length);

  for (let i = 0; i < tamanho; i++) {
    if (a[i] !== b[i]) erros++;
    if (erros > 2) return false;
  }

  return true;
}

export default function BuscaReceitas() {
  const [busca, setBusca] = useState("");
  const [receitas, setReceitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarReceitas() {
      try {
        const dados = await getReceitas();
        setReceitas(Array.isArray(dados) ? dados : []);
      } catch (error) {
        console.log("Erro ao buscar receitas:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarReceitas();
  }, []);

  const receitasFiltradas = receitas.filter((r) => {
    if (!busca.trim()) return true;

    const termo = normalizar(busca);

    const texto = normalizar(`
    ${r.titulo || ""}
    ${r.observacoes || ""}
    ${r.ingredientes || ""}
    ${r.tags || ""}
  `);

    if (
      termo.includes("cafe") &&
      termo.includes("manha") &&
      termo.includes("saudavel") &&
      texto.includes("cafe da manha")
    ) {
      return true;
    }

    const palavras = termo.split(" ").filter(Boolean);
    if (termo.includes("jantar")) {
      return texto.includes("jantar");
    }

    if (termo.includes("almoco")) {
      return texto.includes("almoco");
    }

    if (termo.includes("cafe") && termo.includes("manha")) {
      return texto.includes("cafe da manha");
    }

    if (termo.includes("lanche")) {
      return texto.includes("lanche");
    }
    const palavrasTexto = texto.split(/\s+/).filter(Boolean);

    return palavras.every((palavra) =>
      palavrasTexto.some((p) => parecido(palavra, p)),
    );
  });

  return (
    <View style={style.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7F0" />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.voltarBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={18} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Buscar receitas saudáveis..."
            placeholderTextColor="#aaa"
            value={busca}
            onChangeText={setBusca}
            autoFocus
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca("")}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {busca.length === 0 && (
          <>
            <Text style={styles.secaoTitulo}>Buscas Recentes</Text>
            <View style={styles.chipsRow}>
              {BUSCAS_RECENTES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={styles.chip}
                  onPress={() => setBusca(c)}
                >
                  {c === "Rápido e Fácil" && (
                    <Ionicons name="time-outline" size={14} color="#333" />
                  )}
                  {c === "Vegano" && (
                    <MaterialCommunityIcons
                      name="leaf"
                      size={14}
                      color="#333"
                    />
                  )}
                  <Text style={styles.chipTexto}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.secaoTitulo}>
          {busca.length > 0
            ? `Resultados para "${busca}"`
            : "Sugeridos para Você"}
        </Text>

        {loading ? (
          <View style={styles.vazioBox}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.vazioTexto}>Carregando receitas...</Text>
          </View>
        ) : (
          receitasFiltradas.map((item) => {
            const tags = item.tags ? String(item.tags).split(",") : [];

            return (
              <TouchableOpacity
                key={String(item.idReceita)}
                style={[styles.cardReceita, { backgroundColor: "#3E7D5A" }]}
                activeOpacity={0.88}
                onPress={() =>
                  router.push({
                    pathname: "./DetalheReceita",
                    params: { id: item.idReceita },
                  })
                }
              >
                {item.imagemUrl && (
                  <Image
                    source={{ uri: item.imagemUrl }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.cardOverlay}>
                  <Text style={styles.cardTitulo}>{item.titulo}</Text>

                  <View style={styles.cardMeta}>
                    <Ionicons name="time-outline" size={13} color="#fff" />
                    <Text style={styles.cardMetaTexto}>
                      {item.tempoPreparo} min
                    </Text>

                    <View style={styles.ponto} />

                    <MaterialCommunityIcons
                      name="fire"
                      size={13}
                      color="#fff"
                    />
                    <Text style={styles.cardMetaTexto}>
                      {item.calorias} kcal
                    </Text>
                  </View>

                  <View style={styles.tagsRow}>
                    {tags.map((t) => (
                      <View
                        key={t}
                        style={[
                          styles.tagBadge,
                          { backgroundColor: TAG_CORES[t.trim()] ?? "#333" },
                        ]}
                      >
                        <Text style={styles.tagTexto}>{t.trim()}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {!loading && receitasFiltradas.length === 0 && (
          <View style={styles.vazioBox}>
            <Ionicons name="search-outline" size={40} color="#ccc" />
            <Text style={styles.vazioTexto}>Nenhuma receita encontrada</Text>
          </View>
        )}
      </ScrollView>

      <View style={style.tabBar}>
        <TouchableOpacity
          style={style.tabItemAtivo}
          onPress={() => router.push("./Receitas")}
        >
          <MaterialCommunityIcons
            name="food-fork-drink"
            size={20}
            color="#2E7D32"
          />
          <Text style={style.tabTextoAtivo}>Receitas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={style.tabItem}
          onPress={() => router.push("./Dashboard")}
        >
          <Ionicons name="grid-outline" size={24} color="#999" />
          <Text style={styles.tabTexto}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={style.tabItem}
          onPress={() => router.push("./Perfil")}
        >
          <Ionicons name="person-outline" size={24} color="#999" />
          <Text style={styles.tabTexto}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    gap: 10,
  },
  voltarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    elevation: 3,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: "#333" },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginTop: 20,
    marginBottom: 14,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipTexto: { fontSize: 13, fontWeight: "600", color: "#333" },
  cardReceita: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    height: 200,
  },
  cardOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  cardMetaTexto: { color: "#fff", fontSize: 13, fontWeight: "600" },
  ponto: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  tagsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tagBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  tagTexto: { color: "#fff", fontSize: 12, fontWeight: "700" },
  vazioBox: { alignItems: "center", paddingTop: 60, gap: 12 },
  vazioTexto: { fontSize: 14, color: "#aaa" },
  tabTexto: { fontSize: 12, color: "#999", fontWeight: "500", marginTop: 3 },
});