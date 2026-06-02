import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';
import { useState } from 'react';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Perfil'>, NativeStackScreenProps<RootStackParamList>>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout, canAccessDirectorate, updateProfile, posts } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: user?.password || '',
    phone: user?.phone || '',
    modality: user?.modality || '',
    birth: user?.birth || '',
    cpf: user?.cpf || '',
    gender: user?.gender || '',
    cep: user?.cep || '',
    address: user?.address || '',
    number: user?.number || '',
    complement: user?.complement || '',
    district: user?.district || '',
    city: user?.city || '',
    state: user?.state || '',
    sport: user?.sport || '',
    level: user?.level || '',
    team: user?.team || '',
  });

  const myPosts = posts.filter(p => p.userId === user?.id);
  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permissão necessária', 'Autorize acesso à galeria para alterar sua foto.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!res.canceled) updateProfile({ profileImage: res.assets[0].uri });
  }

  async function save() {
    if (!form.name || !form.email || !form.password) return Alert.alert('Campos obrigatórios', 'Nome, e-mail e senha são obrigatórios.');
      await updateProfile({
        ...form,
        modality: form.modality || form.sport,
      });
    setEditing(false);
  }

  return (
    <Screen title="Perfil do Atleta">
      <Card style={{ alignItems: 'center' }}>
        <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
          {user?.profileImage ? <Image source={{ uri: user.profileImage }} style={styles.avatar} /> : <Text style={styles.avatarText}>{user?.name?.slice(0, 1) || 'A'}</Text>}
        </Pressable>
        <Text style={styles.changePhoto}>Toque para alterar foto</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Cargo: {user?.role}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statNumber}>{user?.hours || 0}h</Text><Text style={styles.statLabel}>Horas</Text></View>
          <View style={styles.stat}><Text style={styles.statNumber}>{user?.coins || 0}</Text><Text style={styles.statLabel}>Coins</Text></View>
          <View style={styles.stat}><Text style={styles.statNumber}>{myPosts.length}</Text><Text style={styles.statLabel}>Fotos</Text></View>
        </View>
      </Card>

      <View style={styles.quickActions}>
        <Button title="Meus Treinos" variant="secondary" onPress={() => navigation.navigate('MyTrainings')} />
        <Button title="Ranking" variant="secondary" onPress={() => navigation.navigate('Ranking')} />
        <Button title="Minhas Coins" variant="secondary" onPress={() => navigation.navigate('CoinHistory')} />
      </View>
      <Button title={editing ? 'Cancelar edição' : 'Editar perfil'} variant="secondary" onPress={() => setEditing(v => !v)} />
      {editing ? (
        <Card>
          <Text style={styles.formTitle}>Dados de acesso</Text>
          <Input label="Nome completo" value={form.name} onChangeText={(v: string) => set('name', v)} />
          <Input label="E-mail" value={form.email} onChangeText={(v: string) => set('email', v)} keyboardType="email-address" />
          <Input label="Senha" value={form.password} onChangeText={(v: string) => set('password', v)} secureTextEntry />
          <Input label="Telefone" value={form.phone} onChangeText={(v: string) => set('phone', v)} keyboardType="phone-pad" />

          <Text style={styles.formTitle}>Informações pessoais</Text>
          <Input label="Data de nascimento" value={form.birth} onChangeText={(v: string) => set('birth', v)} />
          <Input label="CPF" value={form.cpf} onChangeText={(v: string) => set('cpf', v)} />
          <Input label="Gênero" value={form.gender} onChangeText={(v: string) => set('gender', v)} />

          <Text style={styles.formTitle}>Endereço</Text>
          <Input label="CEP" value={form.cep} onChangeText={(v: string) => set('cep', v)} />
          <Input label="Endereço" value={form.address} onChangeText={(v: string) => set('address', v)} />
          <Input label="Número" value={form.number} onChangeText={(v: string) => set('number', v)} />
          <Input label="Complemento" value={form.complement} onChangeText={(v: string) => set('complement', v)} />
          <Input label="Bairro" value={form.district} onChangeText={(v: string) => set('district', v)} />
          <Input label="Cidade" value={form.city} onChangeText={(v: string) => set('city', v)} />
          <Input label="Estado" value={form.state} onChangeText={(v: string) => set('state', v)} />

          <Text style={styles.formTitle}>Dados esportivos</Text>
          <Input label="Modalidade" value={form.modality} onChangeText={(v: string) => set('modality', v)} />
          <Input label="Esporte" value={form.sport} onChangeText={(v: string) => set('sport', v)} />
          <Input label="Nível" value={form.level} onChangeText={(v: string) => set('level', v)} />
          <Input label="Equipe" value={form.team} onChangeText={(v: string) => set('team', v)} />
          <Button title="Salvar alterações" onPress={save} />
        </Card>
      ) : null}

      <Text style={styles.section}>Minha galeria</Text>
      {myPosts.length === 0 ? (
        <Card><Text style={{ color: colors.muted }}>Você ainda não publicou fotos.</Text></Card>
      ) : (
        <View style={styles.galleryGrid}>{myPosts.map(p => (
          <View key={p.id} style={styles.galleryItem}>{p.image ? <Image source={{ uri: p.image }} style={styles.galleryImage} /> : <Text style={styles.galleryPlaceholder}>Post</Text>}</View>
        ))}</View>
      )}

      {canAccessDirectorate ? <Button title="Abrir Diretoria" onPress={() => navigation.navigate('Directorate')} /> : null}
      <Button title="Galeria geral" variant="secondary" onPress={() => navigation.navigate('Gallery')} />
      <Button title="Transparência" variant="secondary" onPress={() => navigation.navigate('Transparency')} />
      <Button title="Sair" variant="danger" onPress={() => { logout(); navigation.replace('Login'); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 4, borderColor: '#fff' },
  avatar: { width: '100%', height: '100%' },
  avatarText: { fontSize: 44, fontWeight: '900', color: colors.primary },
  changePhoto: { color: colors.primary, fontWeight: '900', marginTop: 10 },
  name: { fontSize: 24, fontWeight: '900', marginTop: 14 },
  email: { color: colors.muted, marginTop: 4 },
  role: { color: colors.primary, fontWeight: '900', marginTop: 10 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 18 },
  stat: { backgroundColor: colors.background, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '900', color: colors.text },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  quickActions: { gap: 10, marginBottom: 8 },
  section: { fontSize: 20, fontWeight: '900', marginVertical: 16 },
  formTitle: { fontSize: 16, fontWeight: '900', color: colors.text, marginTop: 10, marginBottom: 10 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  galleryItem: { width: '31%', aspectRatio: 1, borderRadius: 18, backgroundColor: colors.softBlue, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  galleryImage: { width: '100%', height: '100%' },
  galleryPlaceholder: { color: colors.primary, fontWeight: '900' },
});
