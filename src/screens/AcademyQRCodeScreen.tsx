import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { Screen, Card, Pill } from "../components/Layout";
import { Button, Input } from "../components/Fields";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

type TrainingLocation = {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  raio_metros: number;
  qr_entrada: string;
  qr_saida: string;
  ativo: boolean;
};

function randomToken(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
}

export default function AcademyQRCodeScreen() {
  const { canAccessDirectorate } = useApp();

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<TrainingLocation[]>([]);
  const [nome, setNome] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [raio, setRaio] = useState("100");

  const loadLocations = useCallback(async () => {
    const { data, error } = await supabase
      .from("training_locations")
      .select("id,nome,latitude,longitude,raio_metros,qr_entrada,qr_saida,ativo")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("[ACADEMY QR LOAD ERROR]", error);
      Alert.alert("Erro", "Não foi possível carregar academias.");
      return;
    }

    setLocations((data || []) as TrainingLocation[]);
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  async function createLocation() {
    if (!canAccessDirectorate) {
      Alert.alert("Acesso negado", "Somente diretoria pode criar QR Codes.");
      return;
    }

    const lat = Number(latitude.replace(",", "."));
    const lng = Number(longitude.replace(",", "."));
    const radius = Number(raio || 100);

    if (!nome.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      Alert.alert("Campos obrigatórios", "Informe nome, latitude e longitude válidos.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("training_locations")
        .insert({
          nome: nome.trim(),
          latitude: lat,
          longitude: lng,
          raio_metros: radius,
          qr_entrada: randomToken("APPAVISA-ENTRADA"),
          qr_saida: randomToken("APPAVISA-SAIDA"),
          ativo: true,
        })
        .select("id,nome,latitude,longitude,raio_metros,qr_entrada,qr_saida,ativo")
        .single();

      if (error) {
        console.log("[ACADEMY QR CREATE ERROR]", error);
        Alert.alert("Erro", "Não foi possível criar academia.");
        return;
      }

      setLocations((prev) => [data as TrainingLocation, ...prev]);
      setNome("");
      setLatitude("");
      setLongitude("");
      setRaio("100");

      Alert.alert("QR Codes gerados", "Academia cadastrada com QR de entrada e saída.");
    } finally {
      setLoading(false);
    }
  }

  async function regenerateQr(location: TrainingLocation) {
    Alert.alert(
      "Regenerar QR Codes",
      "Os QR Codes antigos deixarão de funcionar. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Regenerar",
          style: "destructive",
          onPress: async () => {
            const { data, error } = await supabase
              .from("training_locations")
              .update({
                qr_entrada: randomToken("APPAVISA-ENTRADA"),
                qr_saida: randomToken("APPAVISA-SAIDA"),
              })
              .eq("id", location.id)
              .select("id,nome,latitude,longitude,raio_metros,qr_entrada,qr_saida,ativo")
              .single();

            if (error) {
              console.log("[ACADEMY QR REGENERATE ERROR]", error);
              Alert.alert("Erro", "Não foi possível regenerar os QR Codes.");
              return;
            }

            setLocations((prev) =>
              prev.map((item) => (item.id === location.id ? (data as TrainingLocation) : item)),
            );
          },
        },
      ],
    );
  }

  if (!canAccessDirectorate) {
    return (
      <Screen title="QR Codes">
        <Card>
          <Text style={styles.blockedTitle}>Acesso restrito</Text>
          <Text style={styles.blockedText}>Esta tela é exclusiva da diretoria, gerência e supervisão.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="QR Codes da Academia">
      <Card>
        <Text style={styles.formTitle}>Cadastrar local de treino</Text>

        <Input label="Nome da academia/local" value={nome} onChangeText={setNome} />
        <Input label="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" />
        <Input label="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" />
        <Input label="Raio permitido em metros" value={raio} onChangeText={setRaio} keyboardType="numeric" />

        <Button title={loading ? "Gerando..." : "Gerar QR Codes"} onPress={createLocation} />
      </Card>

      <Text style={styles.section}>Locais cadastrados</Text>

      {locations.length === 0 ? (
        <Card>
          <Text style={{ color: colors.muted }}>Nenhum local cadastrado ainda.</Text>
        </Card>
      ) : null}

      {locations.map((location) => (
        <Card key={location.id}>
          <View style={styles.locationHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationName}>{location.nome}</Text>
              <Text style={styles.locationMeta}>Raio: {location.raio_metros}m • {location.latitude}, {location.longitude}</Text>
            </View>

            <Pill color={location.ativo ? "#16A34A" : "#DC2626"}>{location.ativo ? "ATIVO" : "INATIVO"}</Pill>
          </View>

          <View style={styles.qrGrid}>
            <View style={styles.qrBox}>
              <Text style={styles.qrTitle}>Entrada</Text>
              <QRCode value={location.qr_entrada} size={150} />
              <Text style={styles.qrCode}>{location.qr_entrada}</Text>
            </View>

            <View style={styles.qrBox}>
              <Text style={styles.qrTitle}>Saída</Text>
              <QRCode value={location.qr_saida} size={150} />
              <Text style={styles.qrCode}>{location.qr_saida}</Text>
            </View>
          </View>

          <Pressable style={styles.regenerateButton} onPress={() => regenerateQr(location)}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.regenerateText}>Regenerar QR Codes</Text>
          </Pressable>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  formTitle: { fontSize: 18, fontWeight: "900", color: colors.text, marginBottom: 12 },
  section: { fontSize: 22, fontWeight: "900", marginVertical: 14 },
  locationHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  locationName: { fontSize: 20, fontWeight: "900", color: colors.text },
  locationMeta: { color: colors.muted, marginTop: 4 },
  qrGrid: { gap: 14 },
  qrBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    alignItems: "center",
  },
  qrTitle: { fontSize: 18, fontWeight: "900", marginBottom: 12, color: colors.text },
  qrCode: { color: colors.muted, fontSize: 11, marginTop: 10, textAlign: "center" },
  regenerateButton: {
    marginTop: 14,
    backgroundColor: colors.text,
    padding: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  regenerateText: { color: "#fff", fontWeight: "900" },
  blockedTitle: { fontSize: 20, fontWeight: "900", color: colors.text },
  blockedText: { marginTop: 8, color: colors.muted, lineHeight: 20 },
});
