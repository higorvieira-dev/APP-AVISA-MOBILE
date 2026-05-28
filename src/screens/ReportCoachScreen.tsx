import { Alert, Text } from 'react-native';
import { useState } from 'react';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';
export default function ReportCoachScreen(){ const {addReport}=useApp(); const [msg,setMsg]=useState(''); function submit(){ if(!msg)return Alert.alert('Digite o ocorrido'); addReport(msg); setMsg(''); } return <Screen title="Reportar / Denúncia"><Card><Text style={{fontSize:18,fontWeight:'900'}}>Reporte ao orientador e à diretoria</Text><Text style={{color:colors.muted,lineHeight:24,marginVertical:10}}>Use este canal para erros no treino, problema com agenda, conduta inadequada, ausência de material ou qualquer ocorrência.</Text><Input label="Descreva o ocorrido" value={msg} onChangeText={setMsg}/><Button title="Enviar reporte" onPress={submit}/></Card></Screen> }
