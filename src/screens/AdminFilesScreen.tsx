import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card } from '../components/Layout';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';

export default function AdminFilesScreen({ navigation }: { navigation: any }) {
  const { users, reports, materialRequests, eventRequests, meetingSuggestions, approveEvent } = useApp();
  return (
    <Screen title="Arquivos Administrativos">
      <Card><Text style={styles.h}>Base administrativa</Text><Text style={styles.p}>Central de informações: cadastros, solicitações, reportes, eventos e documentos internos do APPAVISA.</Text></Card>
      <Text style={styles.section}>Cadastros</Text>
      <View style={styles.grid}>
        <Pressable style={styles.box} onPress={() => navigation.navigate('ProtectedRegister', { type: 'Diretoria' })}><Ionicons name="person-add" size={24} color={colors.primary}/><Text style={styles.boxText}>Nova Diretoria</Text></Pressable>
        <Pressable style={styles.box} onPress={() => navigation.navigate('ProtectedRegister', { type: 'Administrativo' })}><Ionicons name="briefcase" size={24} color={colors.primary}/><Text style={styles.boxText}>Novo Admin</Text></Pressable>
        <Pressable style={styles.box} onPress={() => navigation.navigate('ProtectedRegister', { type: 'Orientador' })}><Ionicons name="school" size={24} color={colors.primary}/><Text style={styles.boxText}>Novo Professor</Text></Pressable>
      </View>
      <Text style={styles.section}>Usuários cadastrados: {users.length}</Text>
      {users.map(u => <Card key={u.id}><Text style={styles.h}>{u.name}</Text><Text style={styles.p}>{u.email} · {u.role} · Advertências: {u.warnings}</Text></Card>)}
      <Text style={styles.section}>Solicitações de material</Text>
      {materialRequests.length === 0 ? <Card><Text style={styles.p}>Nenhuma solicitação de material.</Text></Card> : materialRequests.map(m => <Card key={m.id}><Text style={styles.h}>{m.material} · {m.quantity}</Text><Text style={styles.p}>{m.justification}</Text><Text style={styles.status}>{m.status}</Text></Card>)}
      <Text style={styles.section}>Eventos pendentes</Text>
      {eventRequests.length === 0 ? <Card><Text style={styles.p}>Nenhum evento pendente.</Text></Card> : eventRequests.map(e => <Card key={e.id}><Text style={styles.h}>{e.title}</Text><Text style={styles.p}>{e.date} · {e.time} · {e.location}</Text><Text style={styles.status}>{e.status}</Text><Pressable style={styles.approve} onPress={() => approveEvent(e.id)}><Text style={styles.approveText}>Aprovar e publicar na agenda</Text></Pressable></Card>)}
      <Text style={styles.section}>Pautas sugeridas</Text>
      {meetingSuggestions.length === 0 ? <Card><Text style={styles.p}>Nenhuma pauta sugerida.</Text></Card> : meetingSuggestions.map(s => <Card key={s.id}><Text style={styles.h}>{s.title}</Text><Text style={styles.p}>{s.objective}</Text><Text style={styles.p}>Tópicos: {s.agenda}</Text></Card>)}
      <Text style={styles.section}>Reportes</Text>
      {reports.map(r => <Card key={r.id}><Text style={styles.h}>{r.author}</Text><Text style={styles.p}>{r.message}</Text><Text style={styles.status}>{r.status}</Text></Card>)}
    </Screen>
  );
}
const styles = StyleSheet.create({ h:{fontSize:16,fontWeight:'900',color:colors.text}, p:{color:colors.muted,lineHeight:22,marginTop:4}, section:{fontSize:21,fontWeight:'900',color:colors.text,marginTop:12,marginBottom:10}, grid:{flexDirection:'row',gap:10,marginBottom:10}, box:{flex:1,backgroundColor:'#fff',borderWidth:1,borderColor:colors.border,borderRadius:18,padding:14,alignItems:'center',gap:8}, boxText:{fontWeight:'900',textAlign:'center',fontSize:12}, status:{color:colors.primary,fontWeight:'900',marginTop:8}, approve:{backgroundColor:colors.primary,borderRadius:14,padding:12,alignItems:'center',marginTop:10}, approveText:{color:'#fff',fontWeight:'900'} });
