import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/colors";
import { Screen, Card, Pill } from "../components/Layout";
import { Button } from "../components/Fields";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

type VoucherStatus = "pendente" | "retirado" | "cancelado" | string;

type VoucherRow = {
  id: string;
  user_id: string | null;
  product_id: string | null;
  codigo: string;
  status: VoucherStatus;
  created_at: string | null;
};

type ProductRow = {
  id: string;
  nome: string;
  preco_coins: number | null;
  estoque: number | null;
};

type ProfileRow = {
  id: string;
  nome: string | null;
  email: string | null;
  coins: number | null;
};

type VoucherView = VoucherRow & {
  atletaNome: string;
  atletaEmail: string;
  produtoNome: string;
  precoCoins: number;
};

function statusColor(status: VoucherStatus) {
  if (status === "retirado") return "#16A34A";
  if (status === "cancelado") return "#DC2626";
  return colors.primary;
}

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

export default function DirectorVouchersScreen() {
  const { canAccessDirectorate } = useApp();

  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherView[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "pendente" | "retirado" | "cancelado">("pendente");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return vouchers.filter((voucher) => {
      const matchesStatus = statusFilter === "todos" || voucher.status === statusFilter;
      const matchesQuery =
        !q ||
        voucher.codigo.toLowerCase().includes(q) ||
        voucher.atletaNome.toLowerCase().includes(q) ||
        voucher.atletaEmail.toLowerCase().includes(q) ||
        voucher.produtoNome.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, vouchers]);

  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true);

      const { data: voucherRows, error: voucherError } = await supabase
        .from("vouchers")
        .select("id,user_id,product_id,codigo,status,created_at")
        .order("created_at", { ascending: false });

      if (voucherError) {
        console.log("[DIRECTOR VOUCHERS LOAD ERROR]", voucherError);
        Alert.alert("Erro", "Não foi possível carregar os vouchers.");
        return;
      }

      const rows = (voucherRows || []) as VoucherRow[];

      if (rows.length === 0) {
        setVouchers([]);
        return;
      }

      const userIds = Array.from(new Set(rows.map((v) => v.user_id).filter(Boolean))) as string[];
      const productIds = Array.from(new Set(rows.map((v) => v.product_id).filter(Boolean))) as string[];

      let profiles: ProfileRow[] = [];
      let products: ProductRow[] = [];

      if (userIds.length > 0) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id,nome,email,coins")
          .in("id", userIds);

        if (error) {
          console.log("[DIRECTOR VOUCHERS PROFILES ERROR]", error);
        } else {
          profiles = (data || []) as ProfileRow[];
        }
      }

      if (productIds.length > 0) {
        const { data, error } = await supabase
          .from("store_products")
          .select("id,nome,preco_coins,estoque")
          .in("id", productIds);

        if (error) {
          console.log("[DIRECTOR VOUCHERS PRODUCTS ERROR]", error);
        } else {
          products = (data || []) as ProductRow[];
        }
      }

      const profileMap = Object.fromEntries(profiles.map((profile) => [profile.id, profile]));
      const productMap = Object.fromEntries(products.map((product) => [product.id, product]));

      const mapped: VoucherView[] = rows.map((voucher) => {
        const profile = voucher.user_id ? profileMap[voucher.user_id] : undefined;
        const product = voucher.product_id ? productMap[voucher.product_id] : undefined;

        return {
          ...voucher,
          atletaNome: profile?.nome || "Atleta não identificado",
          atletaEmail: profile?.email || "E-mail não informado",
          produtoNome: product?.nome || "Produto não identificado",
          precoCoins: Number(product?.preco_coins || 0),
        };
      });

      setVouchers(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  async function markAsWithdrawn(voucher: VoucherView) {
    if (voucher.status === "retirado") {
      Alert.alert("Voucher já retirado", "Este voucher já foi marcado como retirado.");
      return;
    }

    if (voucher.status === "cancelado") {
      Alert.alert("Voucher cancelado", "Não é possível retirar um voucher cancelado.");
      return;
    }

    Alert.alert(
      "Confirmar retirada",
      `Confirmar entrega do produto "${voucher.produtoNome}" para ${voucher.atletaNome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            const { error } = await supabase
              .from("vouchers")
              .update({ status: "retirado" })
              .eq("id", voucher.id);

            if (error) {
              console.log("[DIRECTOR VOUCHER WITHDRAW ERROR]", error);
              Alert.alert("Erro", "Não foi possível marcar como retirado.");
              return;
            }

            setVouchers((prev) =>
              prev.map((item) =>
                item.id === voucher.id ? { ...item, status: "retirado" } : item,
              ),
            );

            Alert.alert("Retirada confirmada", "Voucher marcado como retirado.");
          },
        },
      ],
    );
  }

  async function cancelVoucher(voucher: VoucherView) {
    if (voucher.status === "retirado") {
      Alert.alert("Voucher já retirado", "Não é possível cancelar um voucher já retirado.");
      return;
    }

    if (voucher.status === "cancelado") {
      Alert.alert("Voucher já cancelado", "Este voucher já foi cancelado.");
      return;
    }

    Alert.alert(
      "Cancelar voucher",
      `Cancelar o voucher ${voucher.codigo}?\n\nO estoque será devolvido e os coins serão estornados.`,
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar voucher",
          style: "destructive",
          onPress: async () => {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("coins")
              .eq("id", voucher.user_id)
              .maybeSingle();

            if (profileError) {
              console.log("[DIRECTOR VOUCHER CANCEL PROFILE ERROR]", profileError);
              Alert.alert("Erro", "Não foi possível consultar o saldo do atleta.");
              return;
            }

            const { data: product, error: productError } = await supabase
              .from("store_products")
              .select("estoque,preco_coins")
              .eq("id", voucher.product_id)
              .maybeSingle();

            if (productError) {
              console.log("[DIRECTOR VOUCHER CANCEL PRODUCT ERROR]", productError);
              Alert.alert("Erro", "Não foi possível consultar o produto.");
              return;
            }

            const refundCoins = Number(product?.preco_coins || voucher.precoCoins || 0);
            const currentCoins = Number(profile?.coins || 0);
            const currentStock = Number(product?.estoque || 0);

            const { error: voucherError } = await supabase
              .from("vouchers")
              .update({ status: "cancelado" })
              .eq("id", voucher.id);

            if (voucherError) {
              console.log("[DIRECTOR VOUCHER CANCEL ERROR]", voucherError);
              Alert.alert("Erro", "Não foi possível cancelar o voucher.");
              return;
            }

            if (voucher.user_id) {
              const { error: coinsError } = await supabase
                .from("profiles")
                .update({ coins: currentCoins + refundCoins })
                .eq("id", voucher.user_id);

              if (coinsError) console.log("[DIRECTOR VOUCHER REFUND ERROR]", coinsError);
            }

            if (voucher.product_id) {
              const { error: stockError } = await supabase
                .from("store_products")
                .update({ estoque: currentStock + 1 })
                .eq("id", voucher.product_id);

              if (stockError) console.log("[DIRECTOR VOUCHER STOCK RETURN ERROR]", stockError);
            }

            Alert.alert("Voucher cancelado", "Coins estornados e estoque devolvido.");
            loadVouchers();
          },
        },
      ],
    );
  }

  if (!canAccessDirectorate) {
    return (
      <Screen title="Vouchers">
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
    <Screen title="Vouchers Pendentes">
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerLabel}>Painel da Diretoria</Text>
          <Text style={styles.headerTitle}>Controle de Vouchers</Text>
          <Text style={styles.headerSub}>
            Valide entregas, cancele resgates e acompanhe os vouchers da loja.
          </Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadVouchers}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Buscar por código, atleta ou produto..."
        value={query}
        onChangeText={setQuery}
        placeholderTextColor="#98A2B3"
      />

      <View style={styles.filters}>
        {(["pendente", "retirado", "cancelado", "todos"] as const).map((status) => (
          <Pressable
            key={status}
            onPress={() => setStatusFilter(status)}
            style={[
              styles.filter,
              statusFilter === status && { backgroundColor: colors.text },
            ]}
          >
            <Text
              style={{
                color: statusFilter === status ? "#fff" : colors.text,
                fontWeight: "900",
                textTransform: "capitalize",
              }}
            >
              {status}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.count}>
        {loading ? "Carregando..." : `${filtered.length} voucher(s) encontrado(s)`}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && !loading ? (
          <Card>
            <Text style={{ color: colors.muted }}>Nenhum voucher encontrado.</Text>
          </Card>
        ) : null}

        {filtered.map((voucher) => (
          <Card key={voucher.id}>
            <View style={styles.cardHeader}>
              <Pill color={statusColor(voucher.status)}>
                {String(voucher.status).toUpperCase()}
              </Pill>

              <Text style={styles.date}>{formatDate(voucher.created_at)}</Text>
            </View>

            <Text style={styles.code}>{voucher.codigo}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>{voucher.atletaNome}</Text>
                <Text style={styles.infoSub}>{voucher.atletaEmail}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="bag" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>{voucher.produtoNome}</Text>
                <Text style={styles.infoSub}>{voucher.precoCoins} coins</Text>
              </View>
            </View>

            {voucher.status === "pendente" ? (
              <View style={styles.actions}>
                <Button
                  title="Confirmar retirada"
                  onPress={() => markAsWithdrawn(voucher)}
                />

                <Button
                  title="Cancelar voucher"
                  variant="danger"
                  onPress={() => cancelVoucher(voucher)}
                />
              </View>
            ) : (
              <View style={styles.statusBox}>
                <Ionicons
                  name={voucher.status === "retirado" ? "checkmark-circle" : "close-circle"}
                  size={22}
                  color={statusColor(voucher.status)}
                />

                <Text style={[styles.statusText, { color: statusColor(voucher.status) }]}>
                  {voucher.status === "retirado"
                    ? "Voucher já retirado"
                    : "Voucher cancelado"}
                </Text>
              </View>
            )}
          </Card>
        ))}
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
  code: {
    fontSize: 24,
    color: "#10B981",
    fontWeight: "900",
    marginVertical: 14,
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
