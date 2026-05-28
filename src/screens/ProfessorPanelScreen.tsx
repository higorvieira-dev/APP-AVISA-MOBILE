import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen } from '../components/Layout';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';

const tools = [
  ['Aplicar\nAdvertência', 'warning', '#FFEDD5', colors.orange, 'ApplyWarning'],
  ['Reportar\nOcorrência', 'alert-circle', '#FEE2E2', colors.red, 'ReportCoach'],
  ['Solicitar\nMaterial', 'file-tray-full', '#DBEAFE', colors.blue, 'MaterialRequest'],
  ['Solicitar\nEvento', 'calendar-number', '#F3E8FF', colors.purple, 'EventRequest'],
  ['Loja\nCoins', 'bag', '#FEF9C3', '#D9A400', 'Store'],
  ['Registrar\nDoação', 'heart', '#FCE7F3', '#DB2777', 'Donations'],
  ['Portal\nTransparência', 'shield-checkmark', '#CCFBF1', '#0F766E', 'Transparency'],
  ['Galeria\nFotos', 'images', '#E0E7FF', '#4F46E5', 'Gallery'],
] as const;

export default function ProfessorPanelScreen({ navigation }: { navigation: any }) {
  const { user, agenda } = useApp();
  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.name || 'C').slice(0, 1)}</Text></View>
          <View style={styles.onlineDot} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.overline}>Painel do Professor</Text>
          <Text style={styles.name}>{user?.name || 'Coach Silva'}</Text>
        </View>
        <Pressable style={styles.headerIcon} onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="id-card" size={22} color={colors.primary} />
        </Pressable>
        <View style={styles.headerIcon}>
          <Ionicons name="notifications" size={22} color={colors.text} />
          <View style={styles.alertDot} />
        </View>
      </View>

      <View style={styles.topCards}>
        <Pressable style={[styles.statCard, { backgroundColor: '#FF9F1C' }]} onPress={() => navigation.navigate('Store')}>
          <Text style={styles.statLabel}>Saldo CoinsVirtuais</Text>
          <Text style={styles.statValue}>{user?.coins || 0}</Text>
          <View style={styles.statButton}><Text style={styles.statButtonText}>Acessar Loja →</Text></View>
          <Ionicons name="logo-usd" size={86} color="rgba(255,255,255,0.14)" style={styles.statBgIcon} />
        </Pressable>
        <Pressable style={[styles.statCard, { backgroundColor: '#2D9CFF' }]} onPress={() => navigation.navigate('History')}>
          <Text style={styles.statLabel}>Horas Orientadas</Text>
          <Text style={styles.statValue}>{user?.hours || 0}h</Text>
          <View style={styles.statButton}><Text style={styles.statButtonText}>Histórico ↻</Text></View>
          <Ionicons name="time" size={86} color="rgba(255,255,255,0.14)" style={styles.statBgIcon} />
        </Pressable>
      </View>

      <Card style={styles.notice}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Ionicons name="megaphone" size={28} color="#DC2626" />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Aviso da Diretoria</Text>
            <Text style={styles.noticeText}>Reunião geral obrigatória para todos os professores dia 28/09 às 19h no auditório.</Text>
          </View>
        </View>
      </Card>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Agenda de Treinos</Text>
        <Text style={styles.tag}>HOJE</Text>
      </View>

      {agenda.length > 0 ? agenda.slice(0, 3).map(item => (
        <Card key={item.id} style={styles.trainingCard}>
          <View style={styles.trainingHeader}>
            <View style={styles.trainingIcon}><Ionicons name={item.type === 'Treino' ? 'barbell' : 'calendar'} size={24} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.trainingTitle}>{item.title}</Text>
              <Text style={styles.trainingSub}>{item.location} · {item.date} · {item.time}</Text>
            </View>
            <View style={styles.liveTag}><Text style={styles.liveTagText}>{item.type}</Text></View>
          </View>
        </Card>
      )) : null}

      <Card style={styles.trainingActive}>
        <View style={styles.trainingHeader}>
          <View style={styles.trainingIcon}><Ionicons name="basketball" size={24} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.trainingTitle}>Sub-17 Basquete</Text>
            <Text style={styles.trainingSub}>Quadra A · 14:00 - 16:00</Text>
          </View>
          <View style={styles.liveTag}><Text style={styles.liveTagText}>EM ANDAMENTO</Text></View>
        </View>
        <View style={styles.trainingActions}>
          <Pressable style={styles.checkButton} onPress={() => navigation.navigate('CheckIn')}>
            <Ionicons name="log-in" size={22} color="#fff" />
            <Text style={styles.checkButtonText}>Check-in Auto</Text>
          </Pressable>
          <Pressable style={styles.actionMini}><Ionicons name="notifications" size={22} color={colors.text} /></Pressable>
          <Pressable style={[styles.actionMini, { backgroundColor: '#FEF2F2' }]}><Ionicons name="close-circle" size={24} color={colors.red} /></Pressable>
        </View>
      </Card>

      <Card style={styles.trainingCard}>
        <View style={styles.trainingHeader}>
          <View style={[styles.trainingIcon, { backgroundColor: '#F1F5F9' }]}><Ionicons name="football" size={24} color="#94A3B8" /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.trainingTitle, { color: '#475569' }]}>Sub-15 Vôlei</Text>
            <Text style={styles.trainingSub}>Ginásio 2 · 16:30 - 18:00</Text>
          </View>
          <Text style={styles.details}>Detalhes</Text>
        </View>
        <View style={styles.divider} />
        <Pressable style={styles.adjustButton} onPress={() => navigation.navigate('ReportCoach')}>
          <Ionicons name="calendar" size={18} color={colors.muted} />
          <Text style={styles.adjustText}>Solicitar Ajuste</Text>
        </Pressable>
      </Card>

      <Text style={styles.sectionTitle}>Ferramentas de Gestão</Text>
      <View style={styles.toolsGrid}>
        {tools.map(([label, icon, bg, color, route]) => (
          <Pressable key={label} style={styles.toolItem} onPress={() => navigation.navigate(route as never)}>
            <View style={[styles.toolCircle, { backgroundColor: bg }]}><Ionicons name={icon as any} size={25} color={color} /></View>
            <Text style={styles.toolText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.institutionAgenda} onPress={() => navigation.navigate('Agenda')}>
        <View style={styles.institutionIcon}><Ionicons name="calendar" size={20} color={colors.text} /></View>
        <Text style={styles.institutionText}>Agenda de Eventos da Instituição</Text>
        <Ionicons name="chevron-forward" size={24} color="#98A2B3" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 58, height: 58, borderRadius: 32, backgroundColor: '#EAF5FF', borderWidth: 3, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '900', color: colors.primary },
  onlineDot: { position: 'absolute', right: 0, bottom: 3, width: 15, height: 15, borderRadius: 8, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff' },
  overline: { color: colors.muted, fontSize: 16, fontWeight: '700' },
  name: { color: colors.text, fontSize: 25, fontWeight: '900' },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  alertDot: { position: 'absolute', right: 9, top: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red },
  topCards: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  statCard: { flex: 1, borderRadius: 24, padding: 18, minHeight: 136, overflow: 'hidden' },
  statLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  statValue: { color: '#fff', fontSize: 35, fontWeight: '900', marginTop: 4 },
  statButton: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginTop: 12 },
  statButtonText: { color: '#fff', fontWeight: '900' },
  statBgIcon: { position: 'absolute', right: -6, top: 0 },
  notice: { backgroundColor: '#FFF1F2', borderColor: '#FECACA', borderWidth: 1.5 },
  noticeTitle: { fontSize: 18, fontWeight: '900', color: '#B91C1C' },
  noticeText: { color: '#991B1B', fontSize: 15, lineHeight: 21, marginTop: 4 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 14 },
  tag: { color: colors.primary, backgroundColor: colors.softBlue, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, fontWeight: '900' },
  trainingActive: { borderColor: colors.primary, borderWidth: 2.5 },
  trainingHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trainingIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  trainingTitle: { fontSize: 21, fontWeight: '900', color: colors.text },
  trainingSub: { color: colors.muted, fontSize: 14, marginTop: 3 },
  liveTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  liveTagText: { color: '#15803D', fontWeight: '900', fontSize: 12 },
  trainingActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  checkButton: { flex: 1.3, backgroundColor: colors.primary, borderRadius: 18, padding: 13, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  checkButtonText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  actionMini: { flex: 0.58, borderRadius: 18, padding: 13, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  trainingCard: { backgroundColor: '#fff' },
  details: { color: '#94A3B8', fontWeight: '800', textDecorationLine: 'underline' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  adjustButton: { alignSelf: 'flex-end', flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  adjustText: { color: colors.muted, fontWeight: '800' },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  toolItem: { width: '24%', alignItems: 'center', marginBottom: 24 },
  toolCircle: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  toolText: { textAlign: 'center', color: colors.text, fontSize: 12, fontWeight: '800', lineHeight: 16 },
  institutionAgenda: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 28, padding: 18, marginBottom: 20 },
  institutionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  institutionText: { flex: 1, fontSize: 18, fontWeight: '900', color: colors.text },
});
