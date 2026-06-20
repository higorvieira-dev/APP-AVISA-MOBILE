import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { RootStackParamList } from '../navigation/types';
import colors from '../theme/colors';
import { Button } from '../components/Fields';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function cleanEmail(value: string) {
    return value.trim().toLowerCase().replace(/["']/g, '');
  }

  async function handleLogin() {
    const emailSanitized = cleanEmail(email);

    if (!emailSanitized || !password) {
      Alert.alert('Campos obrigatórios', 'Digite e-mail e senha.');
      return;
    }

    const ok = await login(emailSanitized, password);

    if (ok) {
      navigation.replace('MainTabs');
    }
  }

  async function handleForgotPassword() {
    const emailSanitized = cleanEmail(email);

    if (!emailSanitized) {
      Alert.alert('Atenção', 'Digite seu e-mail primeiro.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailSanitized, {
      redirectTo: 'avisaappmobile://reset-password',
    });

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    Alert.alert(
      'Verifique seu e-mail',
      'Enviamos um link para redefinir sua senha.'
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.hero}>
        <Text style={styles.logo}>AvisaAPP</Text>
        <Text style={styles.subtitle}>
          Bem-estar, rotina e performance do atleta em um só lugar.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Entrar na plataforma</Text>

        <Text style={styles.inputLabel}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Digite seu e-mail"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.inputLabel}>Senha</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Digite sua senha"
          placeholderTextColor={colors.muted}
        />

        <Button title="Entrar" onPress={handleLogin} />

        <Pressable onPress={handleForgotPassword}>
          <Text style={styles.forgot}>Esqueci minha senha</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate('AthleteRegister')}>
        <Text style={styles.link}>Novo atleta? Criar cadastro</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 22,
    justifyContent: 'center',
  },
  hero: {
    marginBottom: 28,
  },
  logo: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1.2,
  },
  subtitle: {
    fontSize: 17,
    color: colors.muted,
    lineHeight: 25,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    color: colors.text,
    marginBottom: 10,
  },
  forgot: {
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 14,
    color: colors.primary,
    fontWeight: '800',
  },
  link: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.primary,
    fontWeight: '900',
  },
});