import { Alert, Share, StyleSheet, Text } from 'react-native';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useState } from 'react';
import colors from '../theme/colors';

const FUTURE_INSTALL_LINK = 'https://appavisa.com.br/instalar';
export default function InviteScreen() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Atleta');
  const message = `Olá${name ? `, ${name}` : ''}! Você recebeu um convite para instalar o APPAVISA como ${role}. Link: ${FUTURE_INSTALL_LINK}`;
  async function send() { try { await Share.share({ message }); } catch { Alert.alert('Convite', message); } }
  return <Screen title="Convidar Usuários"><Card><Text style={styles.p}>Gere um convite com o link de instalação. Quando publicarmos o app, basta trocar o link abaixo pelo link oficial da App Store/Play Store.</Text><Input label="Nome do convidado" value={name} onChangeText={setName}/><Input label="Cargo/perfil" value={role} onChangeText={setRole}/><Text style={styles.preview}>{message}</Text><Button title="Compartilhar convite" onPress={send}/></Card></Screen>;
}
const styles = StyleSheet.create({ p:{color:colors.muted,lineHeight:22,marginBottom:12}, preview:{backgroundColor:'#F1F5F9',padding:14,borderRadius:16,color:colors.text,fontWeight:'700',marginBottom:10} });
