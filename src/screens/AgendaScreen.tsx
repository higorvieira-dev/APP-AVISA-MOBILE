import { Alert, Pressable, Text, View } from "react-native";
import { useState } from "react";
import colors from "../theme/colors";
import { Screen, Card, Pill } from "../components/Layout";
import { Button, Input } from "../components/Fields";
import { useApp } from "../context/AppContext";

type AgendaType = "Treino" | "Evento" | "Reunião";

function normalizeDate(value: string) {
  const raw = value.trim();

  // Formato aceito diretamente pelo Supabase/Postgres: 2026-05-31
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  // Formato brasileiro: 31/05/2026 -> 2026-05-31
  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month}-${day}`;
  }

  return null;
}

function normalizeTime(value: string) {
  const raw = value.trim();

  // Aceita 09:00 ou 09:00:00
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
    return raw.length === 5 ? `${raw}:00` : raw;
  }

  return null;
}

export default function AgendaScreen() {
  const { agenda, addAgenda } = useApp();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AgendaType>("Treino");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

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

    try {
      setSaving(true);

      await addAgenda({
        title: cleanTitle,
        type,
        date: normalizedDate,
        time: normalizedTime,
        location: cleanLocation,
      });

      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
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
          placeholder="Ex.: Pista Olímpica"
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
        agenda.map((item) => (
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
                {item.type}
              </Pill>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
