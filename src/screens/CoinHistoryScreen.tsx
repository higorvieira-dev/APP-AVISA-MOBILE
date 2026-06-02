import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Card, Pill } from "../components/Layout";
import colors from "../theme/colors";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

type TransactionRow = {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CoinHistoryScreen() {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);

  const loadTransactions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("coin_transactions")
        .select("id,user_id,amount,type,description,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("[COIN HISTORY LOAD ERROR]", error);
        Alert.alert("Erro", "Não foi possível carregar o histórico de coins.");
        return;
      }

      setTransactions((data || []) as TransactionRow[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <Screen title="Minhas Coins">
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroLabel}>Saldo atual</Text>
          <Text style={styles.heroTitle}>{user?.coins || 0} Coins</Text>
          <Text style={styles.heroSub}>Histórico financeiro da sua conta.</Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadTransactions}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </Pressable>
      </View>

      <Text style={styles.section}>{loading ? "Carregando..." : "Movimentações"}</Text>

      {transactions.length === 0 && !loading ? (
        <Card>
          <Text style={{ color: colors.muted }}>Nenhuma movimentação encontrada.</Text>
        </Card>
      ) : null}

      {transactions.map((item) => {
        const positive = Number(item.amount) >= 0;

        return (
          <Card key={item.id}>
            <View style={styles.row}>
              <View style={[styles.icon, { backgroundColor: positive ? "#DCFCE7" : "#FEE2E2" }]}>
                <Ionicons name={positive ? "arrow-up" : "arrow-down"} size={22} color={positive ? "#16A34A" : "#DC2626"} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.description || item.type}</Text>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                <View style={{ marginTop: 8 }}>
                  <Pill>{item.type}</Pill>
                </View>
              </View>

              <Text style={[styles.amount, { color: positive ? "#16A34A" : "#DC2626" }]}>
                {positive ? "+" : ""}{Number(item.amount)}
              </Text>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 22,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: { color: "#DCEEFF", fontWeight: "900", fontSize: 12 },
  heroTitle: { color: "#fff", fontWeight: "900", fontSize: 32, marginTop: 6 },
  heroSub: { color: "#DCEEFF", marginTop: 8 },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { fontSize: 22, fontWeight: "900", marginBottom: 14 },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  icon: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: 16, fontWeight: "900" },
  date: { color: colors.muted, marginTop: 3 },
  amount: { fontSize: 22, fontWeight: "900" },
});
