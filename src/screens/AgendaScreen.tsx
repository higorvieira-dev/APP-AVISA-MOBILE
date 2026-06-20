import { Alert, Pressable, Text, View } from "react-native";
import { useEffect, useState } from "react";

import colors from "../theme/colors";
import { Screen, Card, Pill } from "../components/Layout";
import { Button, Input } from "../components/Fields";
import { useApp } from "../context/AppContext";

type AgendaType = "Treino" | "Evento" | "Reunião";

function normalizeDate(value: string) {
  const raw = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month}-${day}`;
  }

  return null;
}

function normalizeTime(value: string) {
  const raw = value.trim();

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
    return raw.length === 5 ? `${raw}:00` : raw;
  }

  return null;
}

export default function AgendaScreen() {
  const { user, agenda, instructors, loadInstructors, addAgenda } = useApp();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AgendaType>("Treino");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [professorId, setProfessorId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  const canAssignProfessor =
    !!user && ["director", "manager", "supervisor"].includes(user.role);

  async function refreshInstructors() {
    if (!canAssignProfessor) return;

    try {
      setLoadingInstructors(true);
      await loadInstructors();
    } finally {
      setLoadingInstructors(false);
    }
  }

  useEffect(() => {
    refreshInstructors();
  }, [canAssignProfessor]);

  useEffect(() => {
    if (!professorId && instructors.length === 1) {
      setProfessorId(instructors[0].id);
    }
  }, [instructors, professorId]);

  async function submit() {
    const cleanTitle = title.trim();
    const cleanLocation = location.trim();
    const normalizedDate = normalizeDate(date);
    const normalizedTime = normalizeTime(time);

    if (!cleanTitle) {
      Alert.alert("Campo obrigatório", "Preencha o título.");
      return;
    }

    if (!normalizedDate) {
      Alert.alert(
        "Data inválida",
        "Use o formato 2026-05-31 ou 31/05/2026."
      );
      return;
    }

    if (!normalizedTime) {
      Alert.alert("Horário inválido", "Use o formato 09:00.");
      return;
    }

    if (type === "Treino" && canAssignProfessor && instructors.length === 0) {
      Alert.alert(
        "Nenhum instrutor encontrado",
        "Toque em Atualizar. Se continuar vazio, cadastre um usuário com cargo professor, orientador, coordenador ou instrutor."
      );
      return;
    }

    if (type === "Treino" && canAssignProfessor && !professorId) {
      Alert.alert(
        "Professor obrigatório",
        "Selecione o professor/instrutor responsável por este treino."
      );
      return;
    }

    try {
      setSaving(true);

      await addAgenda({
        title: cleanTitle,
        type,
        date: normalizedDate,
        time: normalizedTime,
        location: cleanLocation,
        professorId: canAssignProfessor ? professorId : user?.id || null,
      });

      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setProfessorId(null);

      await refreshInstructors();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Agenda">
      <Card>
        <Text style={{ fontSize: 18, fontWeight: "900", marginBottom: 14 }}>
          Cadastrar treino ou evento
        </Text>

        <Input label="Título" value={title} onChangeText={setTitle} />

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          {(["Treino", "Evento", "Reunião"] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setType(item)}
              style={{
                padding: 12,
                borderRadius: 999,
                backgroundColor: type === item ? colors.primary : "#fff",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: type === item ? "#fff" : colors.text,
                  fontWeight: "900",
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {canAssignProfessor && type === "Treino" ? (
          <View style={{ marginBottom: 14 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: "900", color: colors.text }}>
                Professor / Instrutor responsável
              </Text>

              <Pressable onPress={refreshInstructors}>
                <Text style={{ color: colors.primary, fontWeight: "900" }}>
                  {loadingInstructors ? "Carregando..." : "Atualizar"}
                </Text>
              </Pressable>
            </View>

            {instructors.length === 0 ? (
              <Card style={{ backgroundColor: "#F8FAFC" }}>
                <Text style={{ color: colors.muted, lineHeight: 21 }}>
                  Nenhum professor encontrado. O usuário precisa estar na tabela profiles com cargo professor, orientador, coordenador ou instrutor e ativo=true.
                </Text>
              </Card>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {instructors.map((instructor) => (
                  <Pressable
                    key={instructor.id}
                    onPress={() => setProfessorId(instructor.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor:
                        professorId === instructor.id
                          ? colors.primary
                          : colors.border,
                      backgroundColor:
                        professorId === instructor.id
                          ? colors.softBlue
                          : "#fff",
                    }}
                  >
                    <Text style={{ color: colors.text, fontWeight: "900" }}>
                      {instructor.name}
                    </Text>
                    <Text
                      style={{
                        color: colors.muted,
                        fontSize: 11,
                        fontWeight: "700",
                        marginTop: 2,
                      }}
                    >
                      {instructor.role}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : null}

        <Input
          label="Data"
          placeholder="Ex.: 2026-05-31 ou 31/05/2026"
          value={date}
          onChangeText={setDate}
        />

        <Input
          label="Horário"
          placeholder="Ex.: 09:00"
          value={time}
          onChangeText={setTime}
        />

        <Input
          label="Local"
          placeholder="Ex.: Piscina Olímpica"
          value={location}
          onChangeText={setLocation}
        />

        <Button
          title={saving ? "Salvando..." : "Salvar na agenda"}
          onPress={submit}
        />
      </Card>

      <Text style={{ fontSize: 22, fontWeight: "900", marginVertical: 14 }}>
        Próximos compromissos
      </Text>

      {agenda.length === 0 ? (
        <Card>
          <Text style={{ color: colors.muted }}>
            Nenhum compromisso cadastrado ainda.
          </Text>
        </Card>
      ) : (
        agenda.map((item) => {
          const professor = instructors.find(
            (instructor) => instructor.id === item.professorId
          );

          return (
            <Card key={item.id}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Pill>{item.date}</Pill>

                  <Text style={{ fontSize: 18, fontWeight: "900", marginTop: 10 }}>
                    {item.title}
                  </Text>

                  <Text style={{ color: colors.muted, marginTop: 4 }}>
                    {(item.location || "Local não informado") + " • " + item.time}
                  </Text>

                  {professor ? (
                    <Text style={{ color: colors.primary, fontWeight: "900", marginTop: 6 }}>
                      Instrutor: {professor.name}
                    </Text>
                  ) : item.professorId ? (
                    <Text style={{ color: colors.muted, fontWeight: "800", marginTop: 6 }}>
                      Instrutor vinculado
                    </Text>
                  ) : null}
                </View>

                <Pill
                  color={
                    item.type === "Treino"
                      ? colors.primary
                      : item.type === "Evento"
                        ? colors.purple
                        : colors.orange
                  }
                >
                  {item.status === "em_andamento" ? "EM ANDAMENTO" : item.type}
                </Pill>
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
