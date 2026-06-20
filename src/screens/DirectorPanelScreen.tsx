import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Pill, Screen } from '../components/Layout';
import colors from '../theme/colors';
import { useApp } from '../context/AppContext';

const strategyActions = [
  ['Sugerir\nPauta', 'list', '#EAF5FF', colors.primary, 'MeetingSuggestion'],
  ['Reportar', 'shield', '#FEE2E2', colors.red, 'ReportCoach'],
  ['Arquivos', 'folder', '#DCFCE7', colors.green, 'AdminFiles'],
  ['Convidar', 'person-add', '#F3E8FF', colors.purple, 'Invite'],
  ['Transparência', 'shield-checkmark', '#FFEDD5', colors.orange, 'Transparency'],
  ['Galeria', 'images', '#CCFBF1', '#0F766E', 'Gallery'],
  ['Cupons\nLoja', 'pricetag', '#FEF3C7', '#D97706', 'CouponManager'],
  ['Voucher', 'ticket', '#E0F2FE', colors.primary, 'DirectorVouchers'],
  ['Gerar\nQR', 'qr-code', '#ECFDF5', colors.green, 'AcademyQRCode'],
  ['Aprovar\nMateriais', 'clipboard', '#FFF7ED', colors.orange, 'DirectorRequests'],
  ['Agenda\nProfessor', 'calendar', '#EEF2FF', colors.purple, 'Agenda'],
] as const;

export default function DirectorPanelScreen({ navigation }: { navigation: any }) {
  const { user, reports, transparencies, canAccessDirectorate } = useApp();
  const protectedRegisters = [
    ['Cadastro Diretoria', 'Diretoria'],
    ['Cadastro Administrativo', 'Administrativo'],
    ['Cadastro Orientador', 'Orientador'],
  ] as const;

  if (!canAccessDirectorate) {
    return (
      <Screen title="Acesso restrito">
        <Card><Text style={styles.restricted}>Somente diretor, gerente e supervisor podem acessar esta área.</Text></Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.name || 'D').slice(0, 1)}</Text></View>
        <Text style={styles.headerTitle}>Painel da Diretoria</Text>
        <View style={styles.bell}><Ionicons name="notifications" size={23} color={colors.text} /></View>
      </View>

      <View style={styles.executiveCard}>
        <View style={styles.verified}><Text style={styles.verifiedText}>VERIFICADO</Text></View>
        <Ionicons name="shield" size={72} color="rgba(255,255,255,0.15)" style={styles.shield} />
        <Text style={styles.execRole}>DIRETORIA EXECUTIVA</Text>
        <Text style={styles.execName}>{user?.name || 'Carlos Mendes'}</Text>
        <Text style={styles.execSub}>{user?.role === 'manager' ? 'Gerente' : user?.role === 'supervisor' ? 'Supervisor' : 'Diretor'} APPAVISA</Text>
        <Pressable style={styles.qrButton} onPress={() => navigation.navigate('CheckIn')}>
          <Ionicons name="qr-code" size={36} color="#111827" />
          <Text style={styles.qrText}>Check-in</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Desempenho & Saldo</Text>
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <Ionicons name="calendar" size={22} color={colors.primary} />
          <Text style={styles.metricLabel}>PLANEJAMENTO</Text>
          <Text style={styles.metricValue}>0h <Text style={styles.delta}>QR</Text></Text>
          <View style={styles.progress}><View style={[styles.progressFill, { backgroundColor: colors.primary, width: '0%' }]} /></View>
        </Card>
        <Card style={styles.metricCard}>
          <Ionicons name="people" size={22} color={colors.purple} />
          <Text style={styles.metricLabel}>REUNIÕES</Text>
          <Text style={styles.metricValue}>0h <Text style={styles.neutral}>--</Text></Text>
          <View style={styles.progress}><View style={[styles.progressFill, { backgroundColor: colors.purple, width: '0%' }]} /></View>
        </Card>
        <Card style={styles.metricCard}>
          <Ionicons name="shield-checkmark" size={22} color={colors.orange} />
          <Text style={styles.metricLabel}>ADMIN</Text>
          <Text style={styles.metricValue}>0h</Text>
          <View style={styles.progress}><View style={[styles.progressFill, { backgroundColor: colors.orange, width: '0%' }]} /></View>
        </Card>
        <Card style={[styles.metricCard, styles.darkMetric]}>
          <Ionicons name="wallet" size={22} color="#FACC15" />
          <Text style={[styles.metricLabel, { color: '#CBD5E1' }]}>SALDO VC</Text>
          <Text style={[styles.metricValue, { color: '#fff' }]}>{user?.coins || 0}</Text>
          <Pressable onPress={() => navigation.navigate('History')}><Text style={styles.statement}>Ver extrato ›</Text></Pressable>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Cadastros Protegidos</Text>
      <View style={styles.registerGrid}>
        {protectedRegisters.map(([label, type]) => (
          <Pressable
            key={label}
            style={styles.registerCard}
            onPress={() => navigation.navigate('ProtectedRegister', { type })}
          >
            <View style={styles.registerIcon}>
              <Ionicons name="person-add" size={25} color={colors.primary} />
            </View>
            <Text style={styles.registerText}>{label}</Text>
            <Text style={styles.registerSub}>Criar acesso</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Gestão Estratégica</Text>
      <View style={styles.actionsGrid}>
        {strategyActions.map(([label, icon, bg, color, route]) => (
          <Pressable key={label} style={styles.actionBox} onPress={() => navigation.navigate(route as never)}>
            <View style={[styles.actionIcon, { backgroundColor: bg }]}><Ionicons name={icon as any} size={27} color={color} /></View>
            <Text style={styles.actionText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Avisos & Notificações</Text>
      <Card style={styles.infoNotice}>
        <Ionicons name="information-circle" size={24} color={colors.primary} />
        <View style={{ flex: 1 }}><Text style={styles.noticeTitle}>Novo documento disponível</Text><Text style={styles.noticeSub}>O relatório mensal foi compartilhado pelo administrativo.</Text></View>
      </Card>

      <Text style={styles.sectionTitle}>Reportes Recebidos</Text>
      {reports.length === 0 ? (
        <Card><Text style={styles.empty}>Nenhum reporte enviado por atletas ou orientadores ainda.</Text></Card>
      ) : reports.map(r => (
        <Card key={r.id}>
          <Pill color={colors.orange}>{r.status}</Pill>
          <Text style={styles.reportAuthor}>{r.author}</Text>
          <Text style={styles.reportMessage}>{r.message}</Text>
        </Card>
      ))}

      <View style={styles.benefitHeader}><Text style={styles.sectionTitle}>Benefícios Diretores</Text><Pressable onPress={() => navigation.navigate('Store')}><Text style={styles.seeStore}>Ver Loja</Text></Pressable></View>
      <View style={styles.benefitsRow}>
        <Card style={styles.discountCard}><Text style={styles.discountTitle}>30% OFF</Text><Text style={styles.discountSub}>Loja de Equipamentos</Text><Pressable style={styles.coupon}><Text style={styles.couponText}>Resgatar Cupom</Text></Pressable></Card>
        <Card style={styles.vcCard}><Text style={styles.discountTitle}>1.000 VC</Text><Text style={styles.discountSub}>Na compra de materiais</Text><Pressable style={styles.coupon}><Text style={styles.couponText}>Ativar Oferta</Text></Pressable></Card>
      </View>

      <Text style={styles.sectionTitle}>Transparência</Text>
      {transparencies.map(t => <Card key={t.id}><Text style={styles.noticeTitle}>{t.title}</Text><Text style={styles.reportMessage}>{t.body}</Text></Card>)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  restricted: { fontSize: 18, fontWeight: '900', color: colors.red, lineHeight: 25 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#EAF5FF', borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 23, color: colors.primary, fontWeight: '900' },
  headerTitle: { flex: 1, fontSize: 23, fontWeight: '900', color: colors.text },
  bell: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E9EEF5', alignItems: 'center', justifyContent: 'center' },
  executiveCard: { height: 310, borderRadius: 22, backgroundColor: '#0B2034', padding: 22, marginBottom: 24, overflow: 'hidden', justifyContent: 'flex-end' },
  verified: { alignSelf: 'flex-start', backgroundColor: 'rgba(30,155,240,0.25)', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 6, marginBottom: 12 },
  verifiedText: { color: colors.primary, fontWeight: '900', fontSize: 12 },
  shield: { position: 'absolute', right: 28, top: 26 },
  execRole: { color: '#E2E8F0', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  execName: { color: '#fff', fontSize: 31, fontWeight: '900', marginTop: 6 },
  execSub: { color: colors.primary, fontSize: 16, fontWeight: '700', marginTop: 4 },
  qrButton: { position: 'absolute', right: 22, bottom: 22, width: 70, height: 70, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  qrText: { fontSize: 10, fontWeight: '800', color: colors.text },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 12, letterSpacing: -0.4 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  metricCard: { width: '48%', minHeight: 140 },
  metricLabel: { color: colors.muted, fontSize: 13, fontWeight: '800', letterSpacing: 1, marginTop: 8 },
  metricValue: { color: colors.text, fontSize: 29, fontWeight: '900', marginTop: 12 },
  delta: { fontSize: 15, color: colors.green },
  neutral: { fontSize: 15, color: '#98A2B3' },
  progress: { height: 5, backgroundColor: '#E5E7EB', borderRadius: 999, marginTop: 17, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  darkMetric: { backgroundColor: '#0B1320', borderColor: '#0B1320' },
  statement: { color: colors.primary, fontWeight: '800', marginTop: 8 },
  registerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  registerCard: { width: '31%', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 14, minHeight: 132, alignItems: 'center', justifyContent: 'center' },
  registerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  registerText: { textAlign: 'center', color: colors.text, fontSize: 12, fontWeight: '900', lineHeight: 16 },
  registerSub: { textAlign: 'center', color: colors.primary, fontSize: 10, fontWeight: '800', marginTop: 5 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  actionBox: { width: '31%', minHeight: 116, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', padding: 10 },
  actionIcon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionText: { textAlign: 'center', fontWeight: '800', color: colors.text, fontSize: 13, lineHeight: 17 },
  urgentNotice: { flexDirection: 'row', gap: 14, alignItems: 'center', borderLeftWidth: 4, borderLeftColor: colors.red, backgroundColor: '#FFF1F2' },
  infoNotice: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  noticeTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  noticeSub: { color: colors.muted, marginTop: 4, lineHeight: 20 },
  empty: { color: colors.muted, lineHeight: 22 },
  reportAuthor: { color: colors.text, fontWeight: '900', marginTop: 10 },
  reportMessage: { color: colors.muted, lineHeight: 22, marginTop: 6 },
  benefitHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  seeStore: { color: colors.primary, fontWeight: '900' },
  benefitsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  discountCard: { flex: 1, backgroundColor: '#142B63', borderColor: '#142B63' },
  vcCard: { flex: 1, backgroundColor: '#581C87', borderColor: '#581C87' },
  discountTitle: { color: '#fff', fontSize: 23, fontWeight: '900' },
  discountSub: { color: '#E2E8F0', marginTop: 6 },
  coupon: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, alignSelf: 'flex-start', marginTop: 16 },
  couponText: { color: '#fff', fontWeight: '800' },
});
