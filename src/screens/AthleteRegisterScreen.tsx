import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Text, View } from 'react-native';
import { useState } from 'react';
import { RootStackParamList } from '../navigation/types';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import colors from '../theme/colors';
import { useApp } from '../context/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AthleteRegister'>;
export default function AthleteRegisterScreen({ navigation }: Props) {
  const { registerAthlete } = useApp();
  const [form, setForm] = useState({ name: '', birth: '', cpf: '', gender: '', cep: '', address: '', number: '', complement: '', district: '', city: '', state: '', phone: '', email: '', sport: '', level: '', team: '', password: '' });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  function submit() {
    if (!form.name || !form.email || !form.password) return Alert.alert('Campos obrigatórios', 'Nome, e-mail e senha são obrigatórios.');
    registerAthlete({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      modality: form.sport,
      birth: form.birth,
      cpf: form.cpf,
      gender: form.gender,
      cep: form.cep,
      address: form.address,
      number: form.number,
      complement: form.complement,
      district: form.district,
      city: form.city,
      state: form.state,
      sport: form.sport,
      level: form.level,
      team: form.team,
    });
    navigation.goBack();
  }
  return (
    <Screen title="Cadastro de Atleta">
      <Text style={{ color: colors.muted, marginBottom: 18 }}>Tela nativa, sem imagem fixa, seguindo os campos do layout enviado.</Text>
      <Card><Text style={{ fontWeight: '900', fontSize: 18, marginBottom: 14 }}>Informações pessoais</Text>
        <Input label="Nome completo" value={form.name} onChangeText={(v:string)=>set('name',v)} />
        <Input label="Data de nascimento" value={form.birth} onChangeText={(v:string)=>set('birth',v)} />
        <Input label="CPF" value={form.cpf} onChangeText={(v:string)=>set('cpf',v)} />
        <Input label="Gênero" value={form.gender} onChangeText={(v:string)=>set('gender',v)} />
      </Card>
      <Card><Text style={{ fontWeight: '900', fontSize: 18, marginBottom: 14 }}>Endereço e contato</Text>
        {['cep','address','number','complement','district','city','state','phone','email'].map(k => <Input key={k} label={({cep:'CEP',address:'Endereço',number:'Número',complement:'Complemento',district:'Bairro',city:'Cidade',state:'Estado',phone:'Telefone',email:'Email'} as any)[k]} value={(form as any)[k]} onChangeText={(v:string)=>set(k,v)} />)}
      </Card>
      <Card><Text style={{ fontWeight: '900', fontSize: 18, marginBottom: 14 }}>Detalhes esportivos</Text>
        <Input label="Esporte" value={form.sport} onChangeText={(v:string)=>set('sport',v)} />
        <Input label="Nível" value={form.level} onChangeText={(v:string)=>set('level',v)} />
        <Input label="Equipe" value={form.team} onChangeText={(v:string)=>set('team',v)} />
        <Input label="Senha de acesso" value={form.password} onChangeText={(v:string)=>set('password',v)} secureTextEntry />
      </Card>
      <Button title="Finalizar Cadastro" onPress={submit} />
      <Button title="Voltar" variant="secondary" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
