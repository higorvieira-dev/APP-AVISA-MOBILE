import { Alert, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';

import { RootStackParamList } from '../navigation/types';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'ProtectedRegister'>;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase().replace(/["']/g, '');
}

function normalizeCargo(value: string) {
  const clean = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (clean.includes('diretor') || clean.includes('diretoria')) return 'diretor';
  if (clean.includes('gerente')) return 'gerente';
  if (clean.includes('supervisor')) return 'supervisor';
  if (clean.includes('coordenador')) return 'coordenador';
  if (clean.includes('instrutor')) return 'instrutor';
  if (clean.includes('orientador')) return 'orientador';
  if (clean.includes('professor')) return 'professor';
  if (clean.includes('administrativo')) return 'administrativo';

  return clean || 'atleta';
}

export default function ProtectedRegisterScreen({ route, navigation }: Props) {
  const { canAccessDirectorate } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [saving, setSaving] = useState(false);

  const cargo = normalizeCargo(route.params.type);

  async function handleSave() {
    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, e-mail e senha.');
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert('Senha fraca', 'A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setSaving(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            name: cleanName,
            cargo,
          },
        },
      });

      if (authError || !authData.user) {
        console.log('[PROTECTED REGISTER AUTH ERROR]', authError);
        Alert.alert(
          'Erro no cadastro',
          authError?.message || 'Não foi possível criar o usuário no Supabase Auth.'
        );
        return;
      }

      const profilePayload = {
        id: authData.user.id,
        nome: cleanName,
        email: cleanEmail,
        cargo,
        ativo: true,
        coins: 0,
        horas_total: 0,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });

      console.log('[PROTECTED REGISTER PROFILE PAYLOAD]', profilePayload);
      console.log('[PROTECTED REGISTER PROFILE ERROR]', profileError);

      if (profileError) {
        Alert.alert(
          'Usuário criado parcialmente',
          'O usuário foi criado no Auth, mas o perfil não foi salvo. Verifique as policies da tabela profiles.'
        );
        return;
      }

      Alert.alert(
        'Cadastro salvo',
        `${route.params.type} cadastrado no Supabase com sucesso.`
      );

      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  if (!canAccessDirectorate) {
    return (
      <Screen title="Acesso negado">
        <Card>
          <Text style={{ color: colors.red, fontWeight: '900', fontSize: 18 }}>
            Sem permissão.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={`Cadastro ${route.params.type}`}>
      <Card>
      
        <Input
          label="Nome completo"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Senha inicial"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Input
          label="Cargo"
          value={cargo}
          onChangeText={() => {}}
        />

        <Button
          title={saving ? 'Salvando...' : 'Salvar cadastro'}
          onPress={handleSave}
        />
      </Card>
    </Screen>
  );
}
