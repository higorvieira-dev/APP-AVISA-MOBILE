import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import colors from "../theme/colors";
import { Screen, Card, Pill } from "../components/Layout";
import { Button } from "../components/Fields";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

const CHECKIN_BASE_REWARD = 10;
const COINS_PER_FULL_HOUR = 10;

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

type TrainingSession = {
  id: string;
  user_id: string;
  location_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  status: string;
  coins_generated: number;
};

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const earthRadius = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) *
      Math.cos(toRad(bLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return earthRadius * y;
}

function minutesBetween(startIso: string, endDate: Date) {
  const start = new Date(startIso);
  const diffMs = endDate.getTime() - start.getTime();

  return Math.max(0, Math.floor(diffMs / 60000));
}

function calculateCoins(durationMinutes: number) {
  if (durationMinutes < 10) {
    return 0;
  }

  const fullHours = Math.floor(durationMinutes / 60);

  return CHECKIN_BASE_REWARD + fullHours * COINS_PER_FULL_HOUR;
}

export default function CheckInScreen() {
  const { user } = useApp();

  const [permission, requestPermission] = useCameraPermissions();
  const [scannerActive, setScannerActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [activeLocation, setActiveLocation] = useState<TrainingLocation | null>(null);

  const elapsedMinutes = useMemo(() => {
    if (!activeSession) return 0;
    return minutesBetween(activeSession.started_at, new Date());
  }, [activeSession]);

  const loadActiveSession = useCallback(async () => {
    if (!user) return;

    const { data: session, error } = await supabase
      .from("training_sessions")
      .select("id,user_id,location_id,started_at,ended_at,duration_minutes,status,coins_generated")
      .eq("user_id", user.id)
      .eq("status", "em_andamento")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.log("[TRAINING LOAD ACTIVE SESSION ERROR]", error);
      return;
    }

    if (!session) {
      setActiveSession(null);
      setActiveLocation(null);
      return;
    }

    setActiveSession(session as TrainingSession);

    const { data: location, error: locationError } = await supabase
      .from("training_locations")
      .select("id,nome,latitude,longitude,raio_metros,qr_entrada,qr_saida,ativo")
      .eq("id", session.location_id)
      .maybeSingle();

    if (locationError) {
      console.log("[TRAINING LOAD SESSION LOCATION ERROR]", locationError);
      return;
    }

    setActiveLocation(location as TrainingLocation);
  }, [user]);

  useEffect(() => {
    loadActiveSession();
  }, [loadActiveSession]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    async function watchPosition() {
      if (!user || !activeSession || !activeLocation) return;

      const permissionResult = await Location.requestForegroundPermissionsAsync();

      if (permissionResult.status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 30,
          timeInterval: 30000,
        },
        async (position) => {
          const distance = distanceMeters(
            position.coords.latitude,
            position.coords.longitude,
            Number(activeLocation.latitude),
            Number(activeLocation.longitude),
          );

          if (distance > Number(activeLocation.raio_metros || 100)) {
            await finishSession("auto_location");
          }
        },
      );
    }

    watchPosition();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [activeSession, activeLocation, user]);

  async function requestLocationPermission() {
    const result = await Location.requestForegroundPermissionsAsync();

    if (result.status !== "granted") {
      Alert.alert(
        "Localização necessária",
        "Precisamos da sua localização para validar se você está dentro do raio da academia.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir configurações", onPress: () => Linking.openSettings() },
        ],
      );

      return false;
    }

    return true;
  }

  async function getCurrentPosition() {
    const ok = await requestLocationPermission();
    if (!ok) return null;

    return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  }

  async function validateLocation(location: TrainingLocation) {
    const position = await getCurrentPosition();
    if (!position) return false;

    const distance = distanceMeters(
      position.coords.latitude,
      position.coords.longitude,
      Number(location.latitude),
      Number(location.longitude),
    );

    if (distance > Number(location.raio_metros || 100)) {
      Alert.alert(
        "Fora do raio permitido",
        `Você está a aproximadamente ${Math.round(distance)}m da academia. O limite é ${location.raio_metros}m.`,
      );

      return false;
    }

    return true;
  }

  async function startSession(location: TrainingLocation) {
    if (!user) return;

    const isInside = await validateLocation(location);
    if (!isInside) return;

    const { data: existingSession, error: existingError } = await supabase
      .from("training_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "em_andamento")
      .limit(1);

    if (existingError) {
      console.log("[TRAINING EXISTING SESSION ERROR]", existingError);
      Alert.alert("Erro", "Não foi possível verificar sessão ativa.");
      return;
    }

    if (existingSession && existingSession.length > 0) {
      Alert.alert("Sessão já ativa", "Você já possui uma sessão de treino em andamento.");
      await loadActiveSession();
      return;
    }

    const { data, error } = await supabase
      .from("training_sessions")
      .insert({
        user_id: user.id,
        location_id: location.id,
        status: "em_andamento",
        duration_minutes: 0,
        coins_generated: 0,
      })
      .select("id,user_id,location_id,started_at,ended_at,duration_minutes,status,coins_generated")
      .single();

    if (error) {
      console.log("[TRAINING START ERROR]", error);
      Alert.alert("Erro", "Não foi possível iniciar o treino.");
      return;
    }

    setActiveSession(data as TrainingSession);
    setActiveLocation(location);

    Alert.alert("Treino iniciado", `Sessão iniciada em ${location.nome}.`);
  }

  async function finishSession(reason: "qr_exit" | "auto_location") {
    if (!user || !activeSession) return;

    const endedAt = new Date();
    const duration = minutesBetween(activeSession.started_at, endedAt);
    const coins = calculateCoins(duration);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("coins,horas_total")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.log("[TRAINING PROFILE LOAD ERROR]", profileError);
      Alert.alert("Erro", "Não foi possível carregar perfil para finalizar treino.");
      return;
    }

    const currentCoins = Number(profile.coins || 0);
    const currentHours = Number(profile.horas_total || 0);
    const additionalHours = duration / 60;

    const { error: sessionError } = await supabase
      .from("training_sessions")
      .update({
        ended_at: endedAt.toISOString(),
        duration_minutes: duration,
        coins_generated: coins,
        status: reason === "auto_location" ? "finalizado_por_localizacao" : "finalizado",
      })
      .eq("id", activeSession.id);

    if (sessionError) {
      console.log("[TRAINING FINISH SESSION ERROR]", sessionError);
      Alert.alert("Erro", "Não foi possível finalizar a sessão.");
      return;
    }

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        coins: currentCoins + coins,
        horas_total: currentHours + additionalHours,
      })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.log("[TRAINING PROFILE UPDATE ERROR]", profileUpdateError);
      Alert.alert("Erro", "Não foi possível atualizar coins e horas.");
      return;
    }

    const { error: transactionError } = await supabase
      .from("coin_transactions")
      .insert({
        user_id: user.id,
        amount: coins,
        type: "training_session",
        description:
          reason === "auto_location"
            ? `Treino finalizado automaticamente por saída do raio. ${duration} minuto(s).`
            : `Treino finalizado por QR Code de saída. ${duration} minuto(s).`,
      });

    if (transactionError) console.log("[TRAINING COIN TRANSACTION ERROR]", transactionError);

    setActiveSession(null);
    setActiveLocation(null);

    Alert.alert(
      reason === "auto_location"
        ? "Treino pausado automaticamente"
        : "Treino finalizado",
      coins > 0
        ? `Tempo registrado: ${duration} minuto(s).\nCoins gerados: +${coins}.`
        : `Tempo registrado: ${duration} minuto(s).\nNenhum coin gerado. O tempo mínimo para pontuar é 10 minutos.`,
    );
  }

  async function registerClassAttendance(eventId: string) {
    if (!user) {
      Alert.alert("Login necessário", "Entre no app para registrar presença.");
      return;
    }

    const { error } = await supabase
      .from("attendance")
      .insert({
        event_id: eventId,
        athlete_id: user.id,
      });

    if (error && error.code === "23505") {
      Alert.alert("Presença já registrada", "Você já realizou check-in nesta aula.");
      return;
    }

    if (error) {
      console.log("[ATTENDANCE INSERT ERROR]", error);
      Alert.alert("Erro", "Não foi possível registrar presença.");
      return;
    }

    Alert.alert("Presença confirmada", "Sua presença foi registrada com sucesso.");
  }

  async function handleQrValue(rawValue: string) {
    if (processing) return;

    setProcessing(true);
    setScannerActive(false);

    try {
      const value = rawValue.trim();

      try {
        const payload = JSON.parse(value);

        if (payload?.eventId) {
          await registerClassAttendance(String(payload.eventId));
          return;
        }
      } catch {
        // Não é QR de aula. Continua para o fluxo de academia.
      }

      const { data: locations, error } = await supabase
        .from("training_locations")
        .select("id,nome,latitude,longitude,raio_metros,qr_entrada,qr_saida,ativo")
        .eq("ativo", true)
        .or(`qr_entrada.eq.${value},qr_saida.eq.${value}`)
        .limit(1);

      if (error) {
        console.log("[TRAINING QR LOCATION ERROR]", error);
        Alert.alert("Erro", "Não foi possível validar QR Code.");
        return;
      }

      const location = locations?.[0] as TrainingLocation | undefined;

      if (!location) {
        Alert.alert("QR Code inválido", "Este QR Code não pertence a uma academia ativa.");
        return;
      }

      if (value === location.qr_entrada) {
        await startSession(location);
        return;
      }

      if (value === location.qr_saida) {
        await loadActiveSession();
        await finishSession("qr_exit");
        return;
      }

      Alert.alert("QR Code inválido", "Não foi possível identificar entrada ou saída.");
    } finally {
      setProcessing(false);
    }
  }

  async function openScanner() {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert("Câmera necessária", "Autorize a câmera para ler o QR Code.");
        return;
      }
    }

    await requestLocationPermission();
    setScannerActive(true);
  }

  if (scannerActive) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => handleQrValue(data)}
        />

        <View style={styles.scannerOverlay}>
          <Text style={styles.scannerTitle}>Leia o QR Code</Text>
          <Text style={styles.scannerText}>
            Use o QR Code da aula para registrar presença ou o QR Code da academia para iniciar/finalizar treino.
          </Text>

          <Pressable style={styles.closeScanner} onPress={() => setScannerActive(false)}>
            <Text style={styles.closeScannerText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Screen title="Check-in">
      <Card style={styles.hero}>
        <View style={styles.iconWrap}>
          <Ionicons name="qr-code" size={44} color="#fff" />
        </View>

        <Text style={styles.title}>Check-in por QR Code</Text>

        <Text style={styles.subtitle}>
          Leia o QR Code da aula para registrar presença ou o QR Code da academia para controlar sua sessão de treino.
        </Text>

        {activeSession ? (
          <View style={styles.activeBox}>
            <Pill color="#16A34A">TREINO EM ANDAMENTO</Pill>
            <Text style={styles.activeTitle}>{activeLocation?.nome || "Academia"}</Text>
            <Text style={styles.activeText}>Tempo aproximado: {elapsedMinutes} minuto(s)</Text>
            <Text style={styles.activeText}>Saída automática se você sair do raio permitido.</Text>
          </View>
        ) : (
          <View style={styles.rewardBox}>
            <Text style={styles.rewardLabel}>Recompensa</Text>
            <Text style={styles.rewardValue}>+10 base</Text>
            <Text style={styles.rewardSub}>+10 coins por hora completa</Text>
          </View>
        )}

        <Button title={processing ? "Processando..." : "Ler QR Code"} onPress={openScanner} />
      </Card>

      <Card>
        <Text style={styles.infoTitle}>Como funciona</Text>
        <Text style={styles.infoText}>1. Leia o QR Code da aula para confirmar presença.</Text>
        <Text style={styles.infoText}>2. Leia o QR Code de entrada da academia para iniciar uma sessão de treino.</Text>
        <Text style={styles.infoText}>3. Leia o QR Code de saída ao terminar.</Text>
        <Text style={styles.infoText}>4. Se sair do raio sem ler a saída, a sessão é finalizada automaticamente.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scannerContainer: { flex: 1, backgroundColor: "#000" },
  scannerOverlay: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 40,
    backgroundColor: "rgba(15,23,42,0.92)",
    borderRadius: 28,
    padding: 22,
  },
  scannerTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  scannerText: { color: "#CBD5E1", marginTop: 8, lineHeight: 22 },
  closeScanner: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
  },
  closeScannerText: { color: colors.text, fontWeight: "900" },
  hero: { alignItems: "center", paddingVertical: 30 },
  iconWrap: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { fontSize: 28, fontWeight: "900", color: colors.text, textAlign: "center" },
  subtitle: { color: colors.muted, textAlign: "center", marginTop: 8, lineHeight: 22 },
  rewardBox: {
    marginVertical: 22,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 18,
    width: "100%",
    alignItems: "center",
  },
  rewardLabel: { color: colors.muted, fontWeight: "800" },
  rewardValue: { color: colors.primary, fontSize: 34, fontWeight: "900", marginTop: 4 },
  rewardSub: { color: colors.muted, marginTop: 4, fontWeight: "800" },
  activeBox: {
    marginVertical: 22,
    backgroundColor: "#F0FDF4",
    borderRadius: 24,
    padding: 18,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  activeTitle: { marginTop: 10, fontSize: 20, fontWeight: "900", color: colors.text },
  activeText: { marginTop: 6, color: colors.muted, textAlign: "center" },
  infoTitle: { fontSize: 18, fontWeight: "900", color: colors.text },
  infoText: { color: colors.muted, lineHeight: 22, marginTop: 8 },
});
