import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { Screen, Card, Pill } from "../components/Layout";
import { Button } from "../components/Fields";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

type MaterialStatus = "pendente" | "aprovado" | "reprovado" | string;
type EventStatus = "pendente" | "aprovado" | "reprovado" | string;

type ProfileRow = {
  id: string;
  nome: string | null;
  email: string | null;
};

type MaterialRequestRow = {
  id: string;
  professor_id: string | null;
  titulo: string;
  descricao: string;
  status: MaterialStatus;
  created_at: string | null;
};

type EventRequestRow = {
  id: string;
  professor_id: string | null;
  titulo: string;
  descricao: string | null;
  data_evento: string | null;
  status: EventStatus;
  created_at: string | null;
};

type MaterialView = MaterialRequestRow & {
  professorNome: string;
  professorEmail: string;
};

type EventView = EventRequestRow & {
  professorNome: string;
  professorEmail: string;
  horario: string;
  local: string;
  observacao: string;
};

function formatDate(value: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusColor(status: string) {
  if (status === "aprovado") return "#16A34A";
  if (status === "reprovado") return "#DC2626";
  return colors.primary;
}

function parseEventDescription(description: string | null) {
  const text = description || "";
  const lines = text.split("\n").map((line) => line.trim());

  const horario =
    lines.find((line) => line.toLowerCase().startsWith("horário:"))?.replace(/horário:/i, "").trim() ||
    lines.find((line) => line.toLowerCase().startsWith("horario:"))?.replace(/horario:/i, "").trim() ||
    "";

  const local =
    lines.find((line) => line.toLowerCase().startsWith("local:"))?.replace(/local:/i, "").trim() ||
    "";

  const observacao = lines
    .filter(
      (line) =>
        line &&
        !line.toLowerCase().startsWith("horário:") &&
        !line.toLowerCase().startsWith("horario:") &&
        !line.toLowerCase().startsWith("local:"),
    )
    .join("\n");

  return { horario, local, observacao };
}

export default function DirectorRequestsScreen() {
  const { canAccessDirectorate, user } = useApp();

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"materiais" | "eventos">("materiais");
  const [filter, setFilter] = useState<"pendente" | "aprovado" | "reprovado" | "todos">("pendente");
  const [query, setQuery] = useState("");

  const [materials, setMaterials] = useState<MaterialView[]>([]);
  const [events, setEvents] = useState<EventView[]>([]);

  const visibleMaterials = useMemo(() => {
    const q = query.trim().toLowerCase();

    return materials.filter((item) => {
      const statusOk = filter === "todos" || item.status === filter;
      const queryOk =
        !q ||
        item.titulo.toLowerCase().includes(q) ||
        item.descricao.toLowerCase().includes(q) ||
        item.professorNome.toLowerCase().includes(q) ||
        item.professorEmail.toLowerCase().includes(q);

      return statusOk && queryOk;
    });
  }, [filter, materials, query]);

  const visibleEvents = useMemo(() => {
    const q = query.trim().toLowerCase();

    return events.filter((item) => {
      const statusOk = filter === "todos" || item.status === filter;
      const queryOk =
        !q ||
        item.titulo.toLowerCase().includes(q) ||
        String(item.data_evento || "").toLowerCase().includes(q) ||
        item.descricao?.toLowerCase().includes(q) ||
        item.professorNome.toLowerCase().includes(q) ||
        item.professorEmail.toLowerCase().includes(q);

      return statusOk && queryOk;
    });
  }, [events, filter, query]);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);

      const [{ data: materialRows, error: materialError }, { data: eventRows, error: eventError }] =
        await Promise.all([
          supabase
            .from("material_requests")
            .select("id,professor_id,titulo,descricao,status,created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("event_requests")
            .select("id,professor_id,titulo,descricao,data_evento,status,created_at")
            .order("created_at", { ascending: false }),
        ]);

      if (materialError) {
        console.log("[DIRECTOR REQUESTS MATERIAL LOAD ERROR]", materialError);
        Alert.alert("Erro", "Não foi possível carregar solicitações de materiais.");
      }

      if (eventError) {
        console.log("[DIRECTOR REQUESTS EVENT LOAD ERROR]", eventError);
        Alert.alert("Erro", "Não foi possível carregar solicitações de eventos.");
      }

      const materialList = (materialRows || []) as MaterialRequestRow[];
      const eventList = (eventRows || []) as EventRequestRow[];

      const profileIds = Array.from(
        new Set([
          ...materialList.map((item) => item.professor_id).filter(Boolean),
          ...eventList.map((item) => item.professor_id).filter(Boolean),
        ]),
      ) as string[];

      let profiles: ProfileRow[] = [];

      if (profileIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id,nome,email")
          .in("id", profileIds);

        if (profileError) {
          console.log("[DIRECTOR REQUESTS PROFILES ERROR]", profileError);
        } else {
          profiles = (profileRows || []) as ProfileRow[];
        }
      }

      const profileMap = Object.fromEntries(profiles.map((profile) => [profile.id, profile]));

      const mappedMaterials = materialList.map((item) => {
        const profile = item.professor_id ? profileMap[item.professor_id] : undefined;

        return {
          ...item,
          professorNome: profile?.nome || "Orientador não identificado",
          professorEmail: profile?.email || "E-mail não informado",
        };
      });

      const mappedEvents = eventList.map((item) => {
        const profile = item.professor_id ? profileMap[item.professor_id] : undefined;
        const parsed = parseEventDescription(item.descricao);

        return {
          ...item,
          professorNome: profile?.nome || "Orientador não identificado",
          professorEmail: profile?.email || "E-mail não informado",
          horario: parsed.horario,
          local: parsed.local,
          observacao: parsed.observacao,
        };
      });

      setMaterials(mappedMaterials);
      setEvents(mappedEvents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function updateMaterialStatus(item: MaterialView, status: "aprovado" | "reprovado") {
    if (item.status !== "pendente") {
      Alert.alert("Solicitação já finalizada", "Esta solicitação não está mais pendente.");
      return;
    }

    const { error } = await supabase
      .from("material_requests")
      .update({ status })
      .eq("id", item.id);

    if (error) {
      console.log("[MATERIAL REQUEST STATUS ERROR]", error);
      Alert.alert("Erro", "Não foi possível atualizar a solicitação.");
      return;
    }

    setMaterials((prev) =>
      prev.map((request) =>
        request.id === item.id ? { ...request, status } : request,
      ),
    );

    Alert.alert(
      status === "aprovado" ? "Material aprovado" : "Material reprovado",
      `Solicitação de "${item.titulo}" atualizada.`,
    );
  }

  async function updateEventStatus(item: EventView, status: "aprovado" | "reprovado") {
    if (item.status !== "pendente") {
      Alert.alert("Solicitação já finalizada", "Esta solicitação não está mais pendente.");
      return;
    }

    const { error: updateError } = await supabase
      .from("event_requests")
      .update({ status })
      .eq("id", item.id);

    if (updateError) {
      console.log("[EVENT REQUEST STATUS ERROR]", updateError);
      Alert.alert("Erro", "Não foi possível atualizar a solicitação.");
      return;
    }

    if (status === "aprovado") {
      const { error: eventError } = await supabase.from("events").insert({
        titulo: item.titulo,
        descricao: item.observacao || "Evento aprovado pela diretoria.",
        tipo: "evento",
        local: item.local || null,
        data_evento: item.data_evento,
        hora_inicio: item.horario || null,
        hora_fim: null,
        criado_por: user?.id || item.professor_id,
        aprovado: true,
      });

      if (eventError) {
        console.log("[EVENT REQUEST CREATE APPROVED EVENT ERROR]", eventError);
        Alert.alert(
          "Aprovado parcialmente",
          "Status aprovado, mas houve erro ao criar o evento na agenda.",
        );
      }
    }

    setEvents((prev) =>
      prev.map((request) =>
        request.id === item.id ? { ...request, status } : request,
      ),
    );

    Alert.alert(
      status === "aprovado" ? "Evento aprovado" : "Evento reprovado",
      status === "aprovado"
        ? "A solicitação foi aprovada e enviada para a agenda."
        : "A solicitação foi reprovada.",
    );
  }

  if (!canAccessDirectorate) {
    return (
      <Screen title="Solicitações">
        <Card>
          <Text style={styles.blockedTitle}>Acesso restrito</Text>
          <Text style={styles.blockedText}>
            Esta tela é exclusiva da diretoria, gerência e supervisão.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Solicitações">
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerLabel}>Painel da Diretoria</Text>
          <Text style={styles.headerTitle}>Solicitações</Text>
          <Text style={styles.headerSub}>
            Aprove ou reprove pedidos de materiais e eventos enviados pelos orientadores.
          </Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadRequests}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "materiais" && styles.tabActive]}
          onPress={() => setTab("materiais")}
        >
          <Ionicons
            name="cube"
            size={18}
            color={tab === "materiais" ? "#fff" : colors.text}
          />
          <Text style={[styles.tabText, tab === "materiais" && styles.tabTextActive]}>
            Materiais
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, tab === "eventos" && styles.tabActive]}
          onPress={() => setTab("eventos")}
        >
          <Ionicons
            name="calendar"
            size={18}
            color={tab === "eventos" ? "#fff" : colors.text}
          />
          <Text style={[styles.tabText, tab === "eventos" && styles.tabTextActive]}>
            Eventos
          </Text>
        </Pressable>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        placeholder="Buscar por título, orientador ou descrição..."
        placeholderTextColor="#98A2B3"
      />

      <View style={styles.filters}>
        {(["pendente", "aprovado", "reprovado", "todos"] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.filter, filter === item && { backgroundColor: colors.text }]}
          >
            <Text
              style={{
                color: filter === item ? "#fff" : colors.text,
                fontWeight: "900",
                textTransform: "capitalize",
              }}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.count}>
        {loading
          ? "Carregando..."
          : tab === "materiais"
            ? `${visibleMaterials.length} solicitação(ões) de material`
            : `${visibleEvents.length} solicitação(ões) de evento`}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === "materiais" && (
          <>
            {visibleMaterials.length === 0 && !loading ? (
              <Card>
                <Text style={{ color: colors.muted }}>
                  Nenhuma solicitação de material encontrada.
                </Text>
              </Card>
            ) : null}

            {visibleMaterials.map((item) => (
              <Card key={item.id}>
                <View style={styles.cardHeader}>
                  <Pill color={statusColor(item.status)}>
                    {String(item.status).toUpperCase()}
                  </Pill>
                  <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                </View>

                <Text style={styles.title}>{item.titulo}</Text>
                <Text style={styles.description}>{item.descricao}</Text>

                <View style={styles.infoRow}>
                  <Ionicons name="person-circle" size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>{item.professorNome}</Text>
                    <Text style={styles.infoSub}>{item.professorEmail}</Text>
                  </View>
                </View>

                {item.status === "pendente" ? (
                  <View style={styles.actions}>
                    <Button
                      title="Aprovar material"
                      onPress={() => updateMaterialStatus(item, "aprovado")}
                    />
                    <Button
                      title="Reprovar material"
                      variant="danger"
                      onPress={() => updateMaterialStatus(item, "reprovado")}
                    />
                  </View>
                ) : (
                  <View style={styles.statusBox}>
                    <Ionicons
                      name={item.status === "aprovado" ? "checkmark-circle" : "close-circle"}
                      size={22}
                      color={statusColor(item.status)}
                    />
                    <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                      Solicitação {item.status}
                    </Text>
                  </View>
                )}
              </Card>
            ))}
          </>
        )}

        {tab === "eventos" && (
          <>
            {visibleEvents.length === 0 && !loading ? (
              <Card>
                <Text style={{ color: colors.muted }}>
                  Nenhuma solicitação de evento encontrada.
                </Text>
              </Card>
            ) : null}

            {visibleEvents.map((item) => (
              <Card key={item.id}>
                <View style={styles.cardHeader}>
                  <Pill color={statusColor(item.status)}>
                    {String(item.status).toUpperCase()}
                  </Pill>
                  <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                </View>

                <Text style={styles.title}>{item.titulo}</Text>

                <View style={styles.eventGrid}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventLabel}>Data</Text>
                    <Text style={styles.eventValue}>{item.data_evento || "Não informada"}</Text>
                  </View>

                  <View style={styles.eventInfo}>
                    <Text style={styles.eventLabel}>Horário</Text>
                    <Text style={styles.eventValue}>{item.horario || "Não informado"}</Text>
                  </View>
                </View>

                <Text style={styles.description}>
                  Local: {item.local || "Não informado"}
                  {item.observacao ? `\n\n${item.observacao}` : ""}
                </Text>

                <View style={styles.infoRow}>
                  <Ionicons name="person-circle" size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>{item.professorNome}</Text>
                    <Text style={styles.infoSub}>{item.professorEmail}</Text>
                  </View>
                </View>

                {item.status === "pendente" ? (
                  <View style={styles.actions}>
                    <Button
                      title="Aprovar evento"
                      onPress={() => updateEventStatus(item, "aprovado")}
                    />
                    <Button
                      title="Reprovar evento"
                      variant="danger"
                      onPress={() => updateEventStatus(item, "reprovado")}
                    />
                  </View>
                ) : (
                  <View style={styles.statusBox}>
                    <Ionicons
                      name={item.status === "aprovado" ? "checkmark-circle" : "close-circle"}
                      size={22}
                      color={statusColor(item.status)}
                    />
                    <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                      Solicitação {item.status}
                    </Text>
                  </View>
                )}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.text,
    borderRadius: 30,
    padding: 22,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    color: "#93C5FD",
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 6,
  },
  headerSub: {
    color: "#CBD5E1",
    marginTop: 8,
    maxWidth: 260,
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
  tabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  tabActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  tabText: {
    color: colors.text,
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#fff",
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  filter: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  count: {
    color: colors.muted,
    fontWeight: "800",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginTop: 14,
  },
  description: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontWeight: "900",
    color: colors.text,
    fontSize: 15,
  },
  infoSub: {
    color: colors.muted,
    marginTop: 2,
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
  statusBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontWeight: "900",
    fontSize: 14,
  },
  eventGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  eventInfo: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  eventValue: {
    marginTop: 4,
    color: colors.text,
    fontWeight: "900",
  },
  blockedTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },
  blockedText: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 20,
  },
});
