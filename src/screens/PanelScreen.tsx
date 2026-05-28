import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps as StackProps } from '@react-navigation/native-stack';
import { Screen, Card, Pill } from '../components/Layout';
import { useApp } from '../context/AppContext';
import ProfessorPanelScreen from './ProfessorPanelScreen';
import DirectorPanelScreen from './DirectorPanelScreen';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Painel'>, StackProps<RootStackParamList>>;

const quick = [
  ['Check-in','qr-code','CheckIn'], ['Agenda','calendar','Agenda'], ['Loja Coins','bag','Store'], ['Galeria','images','Gallery'],
  ['Histórico','time','History'], ['Transparência','shield-checkmark','Transparency'], ['Advertência','warning','Warnings'], ['Doações','heart','Donations'],
] as const;

export default function PanelScreen({ navigation }: Props) {
  const { user } = useApp();
  if (user?.role === 'coach') return <ProfessorPanelScreen navigation={navigation} />;
  if (user && ['director', 'manager', 'supervisor'].includes(user.role)) return <DirectorPanelScreen navigation={navigation} />;
  return (
    <Screen>
      <View style={styles.header}><View><Text style={styles.hello}>Bem-vindo,</Text><Text style={styles.name}>{user?.name || 'Atleta'}</Text></View><Ionicons name="notifications" size={24} color={colors.text} /></View>
      <View style={styles.badge}><Text style={styles.badgeLabel}>CARTEIRINHA VIRTUAL</Text><Text style={styles.badgeName}>{user?.name || 'João da Silva'}</Text><Text style={styles.badgeSub}>Natação • Elite</Text><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 28 }}><Text style={styles.badgeMat}>MATRÍCULA\n12345 - AB</Text><Ionicons name="qr-code" size={64} color="#fff" /></View></View>
      <Card><Text style={{ fontWeight:'900', color: colors.text }}>ORIENTADOR RESPONSÁVEL</Text><Text style={{ fontSize:18, fontWeight:'900', marginTop:6 }}>Carlos Mendes</Text></Card>
      <Card style={{ backgroundColor: colors.softYellow, borderColor:'#FCE68B' }}><Text style={{ fontSize:18, fontWeight:'900', color:'#7A4B00' }}>Aviso Importante</Text><Text style={{ color:'#7A4B00', lineHeight:22, marginTop:8 }}>A piscina olímpica estará em manutenção na próxima sexta-feira. Os treinos serão remanejados.</Text></Card>
      <View style={styles.metrics}><Card style={styles.metric}><Text style={styles.metricLabel}>HORAS TOTAIS</Text><Text style={styles.metricValue}>{user?.hours || 0}h</Text></Card><Card style={styles.metric}><Text style={[styles.metricLabel,{color:'#D9A400'}]}>SALDO COINS</Text><Text style={styles.metricValue}>{user?.coins || 0} C$</Text></Card></View>
      <Text style={styles.section}>ACESSO RÁPIDO</Text>
      <View style={styles.grid}>{quick.map(([title, icon, route]) => <Pressable key={title} onPress={() => navigation.navigate(route as any)} style={styles.quick}><View><Ionicons name={icon as any} size={28} color={colors.primary} />{title==='Advertência' && (user?.warnings || 0)>0 ? <View style={styles.dot}><Text style={styles.dotText}>{user?.warnings}</Text></View> : null}</View><Text style={styles.quickText}>{title}</Text></Pressable>)}</View>
      <Text style={styles.section}>REPORTAR / DENÚNCIA</Text>
      <View style={{ flexDirection:'row', gap:12 }}><Pressable style={styles.report} onPress={() => navigation.navigate('ReportCoach')}><Text style={styles.reportText}>Ao Orientador</Text></Pressable><Pressable style={styles.report} onPress={() => navigation.navigate('ReportCoach')}><Text style={styles.reportText}>À Diretoria</Text></Pressable></View>
    </Screen>
  );
}
const styles = StyleSheet.create({ header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18}, hello:{color:colors.muted,fontSize:14}, name:{fontSize:24,fontWeight:'900',color:colors.text}, badge:{borderRadius:30,padding:24,backgroundColor:colors.primary,marginBottom:18}, badgeLabel:{color:'#DDEEFF',fontWeight:'900',letterSpacing:1}, badgeName:{color:'#fff',fontSize:30,fontWeight:'900',marginTop:12}, badgeSub:{color:'#EAF5FF',fontSize:16}, badgeMat:{color:'#fff',fontSize:16,fontWeight:'800'}, metrics:{flexDirection:'row',gap:14}, metric:{flex:1}, metricLabel:{color:colors.primary,fontWeight:'900',fontSize:13}, metricValue:{fontSize:28,fontWeight:'900',marginTop:10}, section:{fontWeight:'900',fontSize:18,letterSpacing:.8,color:colors.muted,marginVertical:18}, grid:{flexDirection:'row',flexWrap:'wrap',gap:14}, quick:{width:'21.8%',alignItems:'center',marginBottom:16}, quickText:{fontSize:12,color:colors.muted,textAlign:'center',marginTop:8,fontWeight:'700'}, dot:{position:'absolute',right:-10,top:-10,backgroundColor:colors.red,width:20,height:20,borderRadius:10,alignItems:'center',justifyContent:'center'}, dotText:{color:'#fff',fontSize:11,fontWeight:'900'}, report:{flex:1,backgroundColor:'#fff',borderRadius:999,padding:16,alignItems:'center',borderWidth:1,borderColor:colors.border}, reportText:{fontWeight:'900',fontSize:16} });
