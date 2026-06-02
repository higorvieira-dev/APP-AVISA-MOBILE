import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Card, Pill } from "../components/Layout";
import colors from "../theme/colors";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

type RankingRow = {
  id: string;
  nome: string | null;
  email: string | null;
  cargo: string | null;
  coins: number | null;
  horas_total: number | null;
};

function medal(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `${index + 1}º`;
}

export default function RankingScreen() {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState<RankingRow[]>([]);

  const myPosition = useMemo(() => {
    if (!user) return null;
    const index = ranking.findIndex((item) => item.id === user.id);
    return index >= 0 ? index + 1 : null;
  }, [ranking, user]);

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id,nome,email,cargo,coins,horas_total")
        .eq("ativo", true)
        .order("coins", { ascending: false })
        .limit(50);

      if (error) {
        console.log("[RANKING LOAD ERROR]", error);
        Alert.alert("Erro", "Não foi possível carregar o ranking.");
        return;
      }

      setRanking((data || []) as RankingRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  return (
    <Screen title="Ranking">
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroLabel}>APPAVISA</Text>
          <Text style={styles.heroTitle}>Ranking de Coins</Text>
          <Text style={styles.heroSub}>Atletas com maior pontuação acumulada.</Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadRanking}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </Pressable>
      </View>

      <Card>
        <Text style={styles.myPositionTitle}>Sua posição</Text>
        <Text style={styles.myPositionValue}>
          {myPosition ? `${myPosition}º lugar` : "Ainda sem posição"}
        </Text>
        <Text style={styles.myPositionSub}>{user?.coins || 0} coins acumulados</Text>
      </Card>

      <Text style={styles.section}>{loading ? "Carregando..." : "Top atletas"}</Text>

      {ranking.length === 0 && !loading ? (
        <Card>
          <Text style={{ color: colors.muted }}>Nenhum atleta encontrado no ranking.</Text>
        </Card>
      ) : null}

      {ranking.map((item, index) => (
        <Card key={item.id} style={item.id === user?.id ? styles.myCard : undefined}>
          <View style={styles.row}>
            <Text style={styles.medal}>{medal(index)}</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.nome || item.email || "Usuário APPAVISA"}</Text>
              <Text style={styles.email}>{item.email}</Text>

              <View style={styles.meta}>
                <Pill>{item.cargo || "atleta"}</Pill>
                <Pill color={colors.primary}>{Number(item.horas_total || 0)}h</Pill>
              </View>
            </View>

            <View style={styles.scoreBox}>
              <Text style={styles.score}>{Number(item.coins || 0)}</Text>
              <Text style={styles.scoreLabel}>coins</Text>
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.text,
    borderRadius: 30,
    padding: 22,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: { color: "#93C5FD", fontWeight: "900", fontSize: 12 },
  heroTitle: { color: "#fff", fontWeight: "900", fontSize: 28, marginTop: 6 },
  heroSub: { color: "#CBD5E1", marginTop: 8 },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  myPositionTitle: { color: colors.muted, fontWeight: "900" },
  myPositionValue: { fontSize: 28, fontWeight: "900", color: colors.primary, marginTop: 4 },
  myPositionSub: { color: colors.muted, marginTop: 4 },
  section: { fontSize: 22, fontWeight: "900", marginVertical: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  medal: { width: 46, fontSize: 26, fontWeight: "900", textAlign: "center" },
  name: { fontSize: 17, fontWeight: "900", color: colors.text },
  email: { color: colors.muted, marginTop: 2 },
  meta: { flexDirection: "row", gap: 8, marginTop: 8 },
  scoreBox: { alignItems: "center", minWidth: 70 },
  score: { color: colors.primary, fontSize: 22, fontWeight: "900" },
  scoreLabel: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  myCard: { borderWidth: 2, borderColor: colors.primary },
});
