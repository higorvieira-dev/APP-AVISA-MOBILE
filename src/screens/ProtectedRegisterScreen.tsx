import { Alert, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { RootStackParamList } from '../navigation/types';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';

type Props=NativeStackScreenProps<RootStackParamList,'ProtectedRegister'>;
export default function ProtectedRegisterScreen({route,navigation}:Props){ const {canAccessDirectorate}=useApp(); const [name,setName]=useState(''); const [email,setEmail]=useState(''); if(!canAccessDirectorate) return <Screen title="Acesso negado"><Text>Sem permissão.</Text></Screen>; return <Screen title={`Cadastro ${route.params.type}`}><Card><Text style={{color:colors.muted,lineHeight:24,marginBottom:12}}>Esta tela só aparece para diretor, gerente e supervisor.</Text><Input label="Nome completo" value={name} onChangeText={setName}/><Input label="E-mail" value={email} onChangeText={setEmail}/><Input label="Cargo" value={route.params.type} onChangeText={()=>{}}/><Button title="Salvar cadastro" onPress={()=>{Alert.alert('Cadastro salvo',`${route.params.type} cadastrado em modo protótipo.`); navigation.goBack();}}/></Card></Screen> }
