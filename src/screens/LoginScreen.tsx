import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';
import { Button, Input } from '../components/Fields';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
    if (!email || !password) return Alert.alert('Campos obrigatórios', 'Digite e-mail e senha.');
    if (login(email, password)) navigation.replace('MainTabs');
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <Text style={styles.logo}>AvisaAPP</Text>
        <Text style={styles.subtitle}>Bem-estar, rotina e performance do atleta em um só lugar.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Entrar na plataforma</Text>
        <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Entrar" onPress={handleLogin} />
        <Button title="Cadastrar atleta" variant="secondary" onPress={() => navigation.navigate('AthleteRegister')} />
      </View>
      <Pressable onPress={() => navigation.navigate('AthleteRegister')}><Text style={styles.link}>Novo atleta? Criar cadastro</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 22, justifyContent: 'center' },
  hero: { marginBottom: 28 },
  logo: { fontSize: 44, fontWeight: '900', color: colors.text, letterSpacing: -1.2 },
  subtitle: { fontSize: 17, color: colors.muted, lineHeight: 25, marginTop: 10 },
  card: { backgroundColor: '#fff', borderRadius: 30, padding: 22, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: 18 },
  help: { marginTop: 16, color: colors.muted, fontSize: 12, lineHeight: 18 },
  link: { textAlign: 'center', marginTop: 20, color: colors.primary, fontWeight: '900' },
});
