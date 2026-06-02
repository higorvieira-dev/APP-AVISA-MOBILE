import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { Screen, Card, Pill } from "../components/Layout";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

type TrainingSessionRow = {
  id: string;
  user_id: string;
  location_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  status: string;
  coins_generated: number | null;
  created_at: string | null;
};

type TrainingLocationRow = {
  id: string;
  nome: string;
};

type TrainingSessionView = TrainingSessionRow & {
  locationName: string;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number | null) {
  const total = Number(minutes || 0);

  if (total <= 0) return "0 min";

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours <= 0) return `${mins} min`;
  if (mins <= 0) return `${hours}h`;

  return `${hours}h ${mins}min`;
}

function statusLabel(status: string) {
  if (status === "em_andamento") return "Em andamento";
  if (status === "finalizado") return "Finalizado";
  if (status === "finalizado_por_localizacao") return "Finalizado por localização";
  return status || "Indefinido";
}

function statusColor(status: string) {
  if (status === "em_andamento") return "#2563EB";
  if (status === "finalizado") return "#16A34A";
  if (status === "finalizado_por_localizacao") return "#F97316";
  return colors.muted;
}

export default function MyTrainingsScreen() {
  const { user } = useApp();

  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<TrainingSessionView[]>([]);

  const totals = useMemo(() => {
    const finishedSessions = sessions.filter((item) => item.status !== "em_andamento");

    return finishedSessions.reduce(
      (acc, item) => ({
        minutes: acc.minutes + Number(item.duration_minutes || 0),
        coins: acc.coins + Number(item.coins_generated || 0),
        sessions: acc.sessions + 1,
      }),
      { minutes: 0, coins: 0, sessions: 0 },
    );
  }, [sessions]);

  const activeSession = useMemo(
    () => sessions.find((item) => item.status === "em_andamento"),
    [sessions],
  );

  const loadTrainings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: sessionRows, error: sessionError } = await supabase
        .from("training_sessions")
        .select("id,user_id,location_id,started_at,ended_at,duration_minutes,status,coins_generated,created_at")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      if (sessionError) {
        console.log("[MY TRAININGS LOAD ERROR]", sessionError);
        Alert.alert("Erro", "Não foi possível carregar seus treinos.");
        return;
      }

      const rows = (sessionRows || []) as TrainingSessionRow[];

      const locationIds = Array.from(
        new Set(rows.map((item) => item.location_id).filter(Boolean)),
      ) as string[];

      let locations: TrainingLocationRow[] = [];

      if (locationIds.length > 0) {
        const { data: locationRows, error: locationError } = await supabase
          .from("training_locations")
          .select("id,nome")
          .in("id", locationIds);

        if (locationError) {
          console.log("[MY TRAININGS LOCATIONS ERROR]", locationError);
        } else {
          locations = (locationRows || []) as TrainingLocationRow[];
        }
      }

      const locationMap = Object.fromEntries(
        locations.map((location) => [location.id, location.nome]),
      );

      const mapped = rows.map((item) => ({
        ...item,
        locationName: item.location_id
          ? locationMap[item.location_id] || "Academia não identificada"
          : "Academia não identificada",
      }));

      setSessions(mapped);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTrainings();
  }, [loadTrainings]);

  return (
    <Screen title="Meus Treinos">
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroLabel}>Resumo pessoal</Text>
          <Text style={styles.heroTitle}>{formatDuration(totals.minutes)}</Text>
          <Text style={styles.heroSub}>
            {totals.sessions} treino(s) finalizado(s) • {totals.coins} coins gerados
          </Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadTrainings}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </Pressable>
      </View>

      {activeSession ? (
        <Card style={styles.activeCard}>
          <View style={styles.cardHeader}>
            <Pill color="#2563EB">EM ANDAMENTO</Pill>
            <Ionicons name="pulse" size={24} color="#2563EB" />
          </View>

          <Text style={styles.title}>{activeSession.locationName}</Text>
          <Text style={styles.description}>Entrada: {formatDateTime(activeSession.started_at)}</Text>
          <Text style={styles.warning}>
            Finalize pelo QR Code de saída ou o sistema encerrará automaticamente se você sair do raio permitido.
          </Text>
        </Card>
      ) : null}

      <Text style={styles.section}>{loading ? "Carregando..." : "Histórico"}</Text>

      {sessions.length === 0 && !loading ? (
        <Card>
          <Text style={{ color: colors.muted }}>Nenhum treino registrado ainda.</Text>
        </Card>
      ) : null}

      {sessions.map((item) => (
        <Card key={item.id}>
          <View style={styles.cardHeader}>
            <Pill color={statusColor(item.status)}>
              {statusLabel(item.status).toUpperCase()}
            </Pill>

            <Text style={styles.date}>{formatDateTime(item.created_at || item.started_at)}</Text>
          </View>

          <Text style={styles.title}>{item.locationName}</Text>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Entrada</Text>
              <Text style={styles.gridValue}>{formatDateTime(item.started_at)}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Saída</Text>
              <Text style={styles.gridValue}>{formatDateTime(item.ended_at)}</Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metricBox}>
              <Ionicons name="time" size={22} color={colors.primary} />
              <Text style={styles.metricValue}>{formatDuration(item.duration_minutes)}</Text>
              <Text style={styles.metricLabel}>Tempo</Text>
            </View>

            <View style={styles.metricBox}>
              <Ionicons name="diamond" size={22} color={colors.primary} />
              <Text style={styles.metricValue}>+{Number(item.coins_generated || 0)}</Text>
              <Text style={styles.metricLabel}>Coins</Text>
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
  heroLabel: {
    color: "#93C5FD",
    fontWeight: "900",
    fontSize: 12,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 32,
    marginTop: 6,
  },
  heroSub: {
    color: "#CBD5E1",
    marginTop: 8,
    maxWidth: 250,
    lineHeight: 20,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCard: {
    borderWidth: 2,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  section: {
    fontSize: 22,
    fontWeight: "900",
    marginVertical: 14,
    color: colors.text,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    marginTop: 14,
  },
  description: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
  },
  warning: {
    color: "#1D4ED8",
    lineHeight: 22,
    marginTop: 10,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  gridItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  gridValue: {
    color: colors.text,
    fontWeight: "900",
    marginTop: 4,
    fontSize: 13,
  },
  metrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
  },
  metricValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 20,
    marginTop: 8,
  },
  metricLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12,
    marginTop: 2,
  },
});
