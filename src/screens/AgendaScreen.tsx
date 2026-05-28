import { Alert, Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import colors from '../theme/colors';
import { Screen, Card, Pill } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';

export default function AgendaScreen() {
  const { agenda, addAgenda } = useApp();
  const [title, setTitle] = useState(''); const [type, setType] = useState<'Treino'|'Evento'|'Reunião'>('Treino'); const [date, setDate] = useState(''); const [time, setTime] = useState(''); const [location, setLocation] = useState('');
  function submit(){ if(!title||!date||!time) return Alert.alert('Campos obrigatórios','Preencha título, data e horário.'); addAgenda({title,type,date,time,location}); setTitle(''); setDate(''); setTime(''); setLocation(''); }
  return <Screen title="Agenda"><Card><Text style={{fontSize:18,fontWeight:'900',marginBottom:14}}>Cadastrar treino ou evento</Text><Input label="Título" value={title} onChangeText={setTitle}/><View style={{flexDirection:'row',gap:8,marginBottom:14}}>{(['Treino','Evento','Reunião'] as const).map(t=><Pressable key={t} onPress={()=>setType(t)} style={{padding:12,borderRadius:999,backgroundColor:type===t?colors.primary:'#fff',borderWidth:1,borderColor:colors.border}}><Text style={{color:type===t?'#fff':colors.text,fontWeight:'900'}}>{t}</Text></Pressable>)}</View><Input label="Data" placeholder="Ex.: 20 NOV" value={date} onChangeText={setDate}/><Input label="Horário" placeholder="Ex.: 09:00" value={time} onChangeText={setTime}/><Input label="Local" value={location} onChangeText={setLocation}/><Button title="Salvar na agenda" onPress={submit}/></Card><Text style={{fontSize:22,fontWeight:'900',marginVertical:14}}>Próximos compromissos</Text>{agenda.map(a=><Card key={a.id}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><View><Pill>{a.date}</Pill><Text style={{fontSize:18,fontWeight:'900',marginTop:10}}>{a.title}</Text><Text style={{color:colors.muted,marginTop:4}}>{a.location} • {a.time}</Text></View><Pill color={a.type==='Treino'?colors.primary:a.type==='Evento'?colors.purple:colors.orange}>{a.type}</Pill></View></Card>)}</Screen>;
}
