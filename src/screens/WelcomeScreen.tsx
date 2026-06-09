// src/screens/WelcomeScreen.tsx

import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>AvisaAPP</Text>
        <Text style={styles.subtitle}>
          Bem-estar, rotina e performance do atleta em um só lugar.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cards}
        >
          <WelcomeCard title="Athlete Training App" icon="fitness" />
          <WelcomeCard title="Train Smarter. Track Progress" icon="analytics" />
          <WelcomeCard title="Share Your Achievements. Get Motivated" icon="trophy" />
          <WelcomeCard title="Connect Your Community" icon="people" />
        </ScrollView>

        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="flash" size={22} color="#0B1220" />
          </View>
          <Text style={styles.brandText}>AvisaAPP</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.primaryText}>Entrar na plataforma</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("AthleteRegister")}
        >
          <Text style={styles.secondaryText}>Criar cadastro</Text>
        </Pressable>
      </View>
    </View>
  );
}

function WelcomeCard({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900",
      }}
      imageStyle={styles.cardImage}
      style={styles.card}
    >
      <View style={styles.overlay} />
      <Ionicons name={icon} size={34} color="#D7FF00" />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.rating}>5.0 ★★★★★</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080B10",
  },
  hero: {
    flex: 1,
    paddingTop: 72,
    paddingHorizontal: 22,
  },
  logo: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
  },
  subtitle: {
    color: "#AEB6C4",
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 310,
  },
  cards: {
    gap: 16,
    paddingTop: 36,
    paddingRight: 22,
  },
  card: {
    width: 210,
    height: 360,
    borderRadius: 28,
    overflow: "hidden",
    padding: 20,
    justifyContent: "space-between",
    backgroundColor: "#111827",
  },
  cardImage: {
    borderRadius: 28,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
  },
  rating: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  brandRow: {
    marginTop: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#D7FF00",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  footer: {
    padding: 22,
    paddingBottom: 38,
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#D7FF00",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#0B1220",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A3342",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});