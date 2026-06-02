import { Pressable, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Card, Pill } from "../components/Layout";
import { RootStackParamList } from "../navigation/types";
import { useApp } from "../context/AppContext";
import colors from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Directorate">;

export default function DirectorateScreen({ navigation }: Props) {
  const { canAccessDirectorate, reports, transparencies } = useApp();

  if (!canAccessDirectorate) {
    return (
      <Screen title="Acesso restrito">
        <Card>
          <Text style={{ fontSize: 20, fontWeight: "900", color: colors.red }}>
            Você não tem permissão para acessar a diretoria.
          </Text>

          <Text style={{ color: colors.muted, lineHeight: 24, marginTop: 10 }}>
            Somente diretor, gerente e supervisor podem acessar esta área.
          </Text>
        </Card>
      </Screen>
    );
  }

  const actions = [
    ["Cadastro Diretoria", "Diretoria"],
    ["Cadastro Administrativo", "Administrativo"],
    ["Cadastro Orientador", "Orientador"],
  ] as const;

  return (
    <Screen title="Painel da Diretoria">
      <Card style={{ backgroundColor: colors.primaryDark }}>
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900" }}>
          Gestão Estratégica
        </Text>

        <Text style={{ color: "#CFE8FF", marginTop: 8 }}>
          Área protegida para diretoria, gerência e supervisão.
        </Text>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {actions.map(([label, type]) => (
          <Pressable
            key={label}
            onPress={() => navigation.navigate("ProtectedRegister", { type })}
            style={{
              width: "47%",
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="person-add" size={28} color={colors.primary} />
            <Text style={{ fontWeight: "900", marginTop: 10 }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Card>
        <Pressable
          onPress={() => navigation.navigate("DirectorVouchers")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Ionicons name="ticket" size={32} color={colors.primary} />

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "900" }}>
              Gerenciar Vouchers
            </Text>

            <Text style={{ color: colors.muted, marginTop: 4 }}>
              Aprovar retiradas e cancelar vouchers
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.primary}
          />
        </Pressable>
      </Card>

      <Card>
        <Pressable
          onPress={() => navigation.navigate("AcademyQRCode")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Ionicons
            name="qr-code"
            size={32}
            color={colors.primary}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "900",
              }}
            >
              QR Codes da Academia
            </Text>

            <Text
              style={{
                color: colors.muted,
                marginTop: 4,
              }}
            >
              Gerar QR de entrada e saída
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.primary}
          />
        </Pressable>
      </Card>
      <Card>
        <Pressable
          onPress={() => navigation.navigate("DirectorRequests")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Ionicons name="clipboard" size={32} color={colors.primary} />

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "900" }}>
              Solicitações
            </Text>

            <Text style={{ color: colors.muted, marginTop: 4 }}>
              Aprovar materiais e eventos
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.primary}
          />
        </Pressable>
      </Card>

      <Text style={{ fontSize: 22, fontWeight: "900", marginVertical: 16 }}>
        Reportes Recebidos
      </Text>

      {reports.length === 0 ? (
        <Card>
          <Text style={{ color: colors.muted }}>
            Nenhum reporte enviado ainda.
          </Text>
        </Card>
      ) : (
        reports.map((r) => (
          <Card key={r.id}>
            <Pill color={colors.orange}>{r.status}</Pill>

            <Text style={{ fontWeight: "900", marginTop: 8 }}>{r.author}</Text>

            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 22 }}>
              {r.message}
            </Text>
          </Card>
        ))
      )}

      <Text style={{ fontSize: 22, fontWeight: "900", marginVertical: 16 }}>
        Transparência
      </Text>

      {transparencies.map((t) => (
        <Card key={t.id}>
          <Text style={{ fontWeight: "900" }}>{t.title}</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>{t.body}</Text>
        </Card>
      ))}
    </Screen>
  );
}