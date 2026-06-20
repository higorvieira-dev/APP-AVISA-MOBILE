import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps as StackProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../theme/colors';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Screen, Card } from '../components/Layout';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import ProfessorPanelScreen from './ProfessorPanelScreen';
import DirectorPanelScreen from './DirectorPanelScreen';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Painel'>,
  StackProps<RootStackParamList>
>;

type QuickItem = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
};

type ReportItem = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
};

type Coordinator = {
  id: string;
  nome: string | null;
  email: string | null;
  cargo: string | null;
};

const quick: QuickItem[] = [
  { title: 'Transparência', icon: 'shield-checkmark', route: 'Transparency' },
  { title: 'Agenda', icon: 'calendar', route: 'Agenda' },
  { title: 'Loja Coins', icon: 'bag', route: 'Store' },
  { title: 'Galeria', icon: 'images', route: 'Gallery' },
  { title: 'Doações', icon: 'heart', route: 'Donations' },
  { title: 'Sugestões', icon: 'bulb', route: 'MeetingSuggestion' },
  { title: 'Reuniões', icon: 'people', route: 'MeetingSuggestion' },
  { title: 'Compartilhar', icon: 'share-social', route: 'Invite' },
];

const reportItems: ReportItem[] = [
  { title: 'Atletas', icon: 'accessibility', route: 'ReportCoach' },
  { title: 'Orientadores', icon: 'school', route: 'ReportCoach' },
  { title: 'Diretoria', icon: 'megaphone', route: 'ReportCoach' },
  { title: 'Administrativos', icon: 'briefcase', route: 'ReportCoach' },
];

function formatCoins(value?: number) {
  return Number(value || 0).toLocaleString('pt-BR');
}

function splitDate(date?: string) {
  if (!date) return null;

  const parts = date.includes('-') ? date.split('-') : date.split('/');

  if (parts.length !== 3) return null;

  if (parts[0].length === 4) {
    return {
      day: parts[2],
      month: parts[1],
    };
  }

  return {
    day: parts[0],
    month: parts[1],
  };
}

export default function PanelScreen({ navigation }: Props) {
  const { user, agenda } = useApp();
  const [coordinatorsOpen, setCoordinatorsOpen] = useState(false);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loadingCoordinators, setLoadingCoordinators] = useState(false);

  async function loadCoordinators() {
    setLoadingCoordinators(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('id,nome,email,cargo')
      .eq('cargo', 'coordenador')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      console.log('[PANEL COORDINATORS ERROR]', error);
      setCoordinators([]);
      setLoadingCoordinators(false);
      return;
    }

    setCoordinators(data || []);
    setLoadingCoordinators(false);
  }

  useEffect(() => {
    loadCoordinators();
  }, []);

  if (user?.role === 'coach') {
    return <ProfessorPanelScreen navigation={navigation} />;
  }

  if (user && ['director', 'manager', 'supervisor'].includes(user.role)) {
    return <DirectorPanelScreen navigation={navigation} />;
  }

  const nextEvents = agenda.slice(0, 3);
  const hasAgendaEvents = nextEvents.length > 0;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Bem-vindo,</Text>
          <Text style={styles.name}>{user?.name || 'Atleta'}</Text>
        </View>

        <Pressable style={styles.notificationButton}>
          <Ionicons name="notifications" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.badge}>
        <View style={styles.badgeTopRow}>
          <View>
            <Text style={styles.badgeStatus}>VERIFICADO</Text>
            <Text style={styles.badgeLabel}>CARTEIRINHA VIRTUAL</Text>
          </View>
          <Ionicons name="shield" size={42} color="rgba(255,255,255,0.22)" />
        </View>

        <Text style={styles.badgeName}>{user?.name || 'João da Silva'}</Text>
        <Text style={styles.badgeSub}>{user?.sport || user?.modality || 'Atleta'} • APPAVISA</Text>

        <View style={styles.badgeBottomRow}>
          <Text style={styles.badgeMat}>MATRÍCULA {user?.id?.slice(0, 8).toUpperCase() || '12345-AB'}</Text>
          <View style={styles.qrBox}>
            <Ionicons name="qr-code" size={44} color={colors.text} />
            <Text style={styles.qrText}>Check-in</Text>
          </View>
        </View>
      </View>

      <Card style={styles.coordinatorCard}>
        <Pressable
          style={styles.coordinatorHeader}
          onPress={() => setCoordinatorsOpen((current) => !current)}
        >
          <View style={styles.coordinatorIcon}>
            <Ionicons name="people" size={23} color="#8B35D6" />
          </View>

          <View style={styles.coordinatorInfo}>
            <Text style={styles.coordinatorLabel}>COORDENADOR RESPONSÁVEL</Text>
            <Text style={styles.coordinatorName}>
              {loadingCoordinators
                ? 'Carregando coordenadores...'
                : coordinators.length > 0
                  ? `${coordinators.length} coordenador(es) cadastrado(s)`
                  : 'Nenhum orientador cadastrado'}
            </Text>
          </View>

          <Ionicons
            name={coordinatorsOpen ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={colors.primary}
          />
        </Pressable>

        {coordinatorsOpen ? (
          <View style={styles.coordinatorList}>
            {coordinators.length > 0 ? (
              coordinators.map((coordinator) => (
                <View key={coordinator.id} style={styles.coordinatorItem}>
                  <View style={styles.coordinatorAvatar}>
                    <Text style={styles.coordinatorAvatarText}>
                      {(coordinator.nome || coordinator.email || 'C').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.coordinatorItemName}>
                      {coordinator.nome || 'Coordenador APPAVISA'}
                    </Text>
                    <Text style={styles.coordinatorItemEmail}>
                      {coordinator.email || 'E-mail não informado'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.coordinatorEmpty}>
                Nenhum usuário com cargo de orientador.
              </Text>
            )}
          </View>
        ) : null}
      </Card>

      <View style={styles.metrics}>
        <Card style={styles.metric}>
          <View style={styles.metricHeader}>
            <Ionicons name="stopwatch" size={20} color={colors.primary} />
            <Text style={styles.metricLabel}>HORAS{"\n"}REALIZADAS</Text>
          </View>
          <Text style={styles.metricValue}>{user?.hours || 0}<Text style={styles.metricUnit}> h</Text></Text>
        </Card>

        <Card style={styles.metric}>
          <View style={styles.metricHeader}>
            <Ionicons name="logo-bitcoin" size={20} color="#D9A400" />
            <Text style={[styles.metricLabel, { color: '#D9A400' }]}>SALDO COINS</Text>
          </View>
          <Text style={styles.metricValue}>{formatCoins(user?.coins)}<Text style={styles.metricUnit}> C$</Text></Text>
        </Card>
      </View>

      <Text style={styles.section}>ACESSO RÁPIDO</Text>

      <View style={styles.grid}>
        {quick.map((item) => (
          <Pressable
            key={item.title}
            onPress={() => navigation.navigate(item.route as never)}
            style={styles.quick}
          >
            <View style={styles.quickIconBox}>
              <Ionicons name={item.icon} size={25} color={colors.primary} />
            </View>
            <Text style={styles.quickText}>{item.title}</Text>
          </Pressable>
        ))}
      </View>

      <Card style={styles.volunteerCard}>
        <View style={styles.volunteerContent}>
          <Text style={styles.volunteerTitle}>PROGRAMA{"\n"}VOLUNTARIADO</Text>
          <Text style={styles.volunteerText}>
            Deseja ampliar sua atuação? Junte-se ao time de voluntários!
          </Text>
        </View>

        <Pressable style={styles.volunteerButton} onPress={() => navigation.navigate('EventRequest')}>
          <Text style={styles.volunteerButtonText}>Seja Voluntário</Text>
        </Pressable>
      </Card>

      <Text style={styles.section}>REPORTAR CONDUTA / DENÚNCIA</Text>

      <View style={styles.reportGrid}>
        {reportItems.map((item) => (
          <Pressable
            key={item.title}
            style={styles.report}
            onPress={() => navigation.navigate(item.route as never)}
          >
            <Ionicons name={item.icon} size={24} color={colors.primary} />
            <Text style={styles.reportText}>{item.title}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.eventsHeader}>
        <Text style={styles.eventsTitle}>Agenda & Próximos{"\n"}Eventos</Text>
        <Pressable onPress={() => navigation.navigate('Agenda')}>
          <Text style={styles.eventsLink}>Ver agenda{"\n"}completa</Text>
        </Pressable>
      </View>

      {hasAgendaEvents ? (
        nextEvents.map((event) => {
          const date = splitDate(event.date);

          return (
            <Pressable key={event.id} style={styles.eventCard} onPress={() => navigation.navigate('Agenda')}>
              <View style={styles.eventDateBox}>
                <Text style={styles.eventMonth}>{date?.month || 'APP'}</Text>
                <Text style={styles.eventDay}>{date?.day || '—'}</Text>
              </View>

              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDescription}>
                  {event.location || event.type} • {event.time || 'Horário não informado'}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={22} color={colors.muted} />
            </Pressable>
          );
        })
      ) : (
        <Card style={styles.emptyAgendaCard}>
          <Ionicons name="calendar-outline" size={26} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyAgendaTitle}>Nenhum evento cadastrado</Text>
            <Text style={styles.emptyAgendaText}>
              Quando você cadastrar eventos na Agenda, eles aparecerão automaticamente aqui.
            </Text>
          </View>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  hello: { color: colors.muted, fontSize: 14 },
  name: { fontSize: 24, fontWeight: '900', color: colors.text },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  badge: { borderRadius: 30, padding: 24, backgroundColor: '#08253D', marginBottom: 16 },
  badgeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badgeStatus: { alignSelf: 'flex-start', backgroundColor: colors.primary, color: '#fff', fontSize: 10, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 12 },
  badgeLabel: { color: '#DDEEFF', fontWeight: '900', letterSpacing: 1, fontSize: 12 },
  badgeName: { color: '#fff', fontSize: 29, fontWeight: '900', marginTop: 12 },
  badgeSub: { color: '#55B8FF', fontSize: 15, fontWeight: '800', marginTop: 2 },
  badgeBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24 },
  badgeMat: { color: '#fff', fontSize: 14, fontWeight: '800', lineHeight: 20 },
  qrBox: { backgroundColor: '#fff', borderRadius: 12, padding: 8, alignItems: 'center' },
  qrText: { fontSize: 9, fontWeight: '900', color: colors.text, marginTop: 2 },
  coordinatorCard: { gap: 12 },
  coordinatorHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  coordinatorIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1E7FF', alignItems: 'center', justifyContent: 'center' },
  coordinatorInfo: { flex: 1 },
  coordinatorLabel: { fontSize: 11, fontWeight: '900', color: colors.muted, letterSpacing: 0.8 },
  coordinatorName: { fontSize: 18, fontWeight: '900', color: colors.text, marginTop: 3 },
  coordinatorList: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 10 },
  coordinatorItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.background, borderRadius: 18, padding: 12 },
  coordinatorAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F1E7FF', alignItems: 'center', justifyContent: 'center' },
  coordinatorAvatarText: { color: '#8B35D6', fontWeight: '900', fontSize: 16 },
  coordinatorItemName: { color: colors.text, fontWeight: '900', fontSize: 15 },
  coordinatorItemEmail: { color: colors.muted, fontWeight: '700', fontSize: 12, marginTop: 2 },
  coordinatorEmpty: { color: colors.muted, fontWeight: '700', lineHeight: 20 },
  metrics: { flexDirection: 'row', gap: 14 },
  metric: { flex: 1, minHeight: 112 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricLabel: { color: colors.primary, fontWeight: '900', fontSize: 13, letterSpacing: 0.7 },
  metricValue: { fontSize: 29, fontWeight: '900', marginTop: 14, color: colors.text },
  metricUnit: { fontSize: 18, color: colors.muted, fontWeight: '700' },
  section: { fontWeight: '900', fontSize: 17, letterSpacing: 0.8, color: colors.muted, marginTop: 22, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quick: { width: '23%', alignItems: 'center', marginBottom: 18 },
  quickIconBox: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  quickText: { fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 8, fontWeight: '800' },
  volunteerCard: { marginTop: 4, backgroundColor: '#16BFA3', borderColor: '#16BFA3', borderRadius: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  volunteerContent: { flex: 1, paddingRight: 10 },
  volunteerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', lineHeight: 23 },
  volunteerText: { color: '#E9FFFA', marginTop: 8, lineHeight: 20, fontWeight: '600' },
  volunteerButton: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  volunteerButtonText: { color: '#148F7B', fontWeight: '900' },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  report: { width: '48%', backgroundColor: '#fff', borderRadius: 999, paddingVertical: 15, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: colors.border },
  reportText: { fontWeight: '900', fontSize: 14, color: colors.text },
  eventsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 24, marginBottom: 14 },
  eventsTitle: { fontSize: 22, fontWeight: '900', color: colors.text, lineHeight: 27 },
  eventsLink: { color: colors.primary, fontWeight: '900', textAlign: 'right', fontSize: 15, lineHeight: 19 },
  eventCard: { backgroundColor: '#fff', borderRadius: 24, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  eventDateBox: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#EEF7FF', alignItems: 'center', justifyContent: 'center' },
  eventMonth: { color: colors.primary, fontWeight: '900', fontSize: 11 },
  eventDay: { color: colors.primary, fontWeight: '900', fontSize: 23, marginTop: -2 },
  eventInfo: { flex: 1 },
  eventTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  eventDescription: { color: colors.muted, marginTop: 4, fontWeight: '700' },
  emptyAgendaCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff' },
  emptyAgendaTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  emptyAgendaText: { color: colors.muted, marginTop: 4, fontWeight: '700', lineHeight: 19 },
});
