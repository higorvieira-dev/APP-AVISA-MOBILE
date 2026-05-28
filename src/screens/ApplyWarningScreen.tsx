import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';

export default function ApplyWarningScreen({ navigation }: { navigation: any }) {
  const { applyWarning } = useApp();
  const [athleteCode, setAthleteCode] = useState('');
  const [reason, setReason] = useState('');

  function submit() {
    if (!athleteCode.trim() || !reason.trim()) return Alert.alert('Campos obrigatórios', 'Leia/informe a credencial do atleta e descreva o motivo.');
    applyWarning(athleteCode.trim(), reason.trim());
    setAthleteCode(''); setReason('');
  }

  return (
    <Screen title="Aplicar Advertência">
      <Card>
        <Text style={styles.title}>Credencial do atleta</Text>
        <Text style={styles.desc}>Use o botão abaixo para abrir a câmera e ler o QR Code. Enquanto a integração final do QR não é vinculada ao banco, você também pode inserir o ID ou e-mail do atleta.</Text>
        <Pressable style={styles.scan} onPress={() => navigation.navigate('CheckIn')}>
          <Ionicons name="qr-code" size={28} color="#fff" />
          <Text style={styles.scanText}>Ler credencial por QR Code</Text>
        </Pressable>
        <Input label="ID ou e-mail do atleta" value={athleteCode} onChangeText={setAthleteCode} placeholder="Ex: 1 ou atleta@appavisa.com" />
        <Input label="Motivo da advertência" value={reason} onChangeText={setReason} placeholder="Explique o ocorrido" />
        <Button title="Registrar advertência" variant="danger" onPress={submit} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '900', color: colors.text, marginBottom: 8 },
  desc: { color: colors.muted, lineHeight: 22, marginBottom: 14 },
  scan: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, padding: 15, borderRadius: 18, marginBottom: 16 },
  scanText: { color: '#fff', fontWeight: '900' },
});
