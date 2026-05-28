import { Alert } from 'react-native';
import { useState } from 'react';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';

export default function MeetingSuggestionScreen() {
  const { suggestMeeting } = useApp();
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [agenda, setAgenda] = useState('');
  const [participants, setParticipants] = useState('');
  const [priority, setPriority] = useState('Normal');
  function submit() {
    if (!title || !objective || !agenda) return Alert.alert('Campos obrigatórios', 'Preencha pauta, objetivo e assuntos da reunião.');
    suggestMeeting({ title, objective, agenda, participants, priority });
    setTitle(''); setObjective(''); setAgenda(''); setParticipants(''); setPriority('Normal');
  }
  return (
    <Screen title="Sugerir Pauta">
      <Card>
        <Input label="Título da pauta" value={title} onChangeText={setTitle} />
        <Input label="Objetivo da reunião" value={objective} onChangeText={setObjective} />
        <Input label="Assuntos a discutir" value={agenda} onChangeText={setAgenda} placeholder="Liste os tópicos principais" />
        <Input label="Participantes necessários" value={participants} onChangeText={setParticipants} placeholder="Diretoria, professores, administrativo..." />
        <Input label="Prioridade" value={priority} onChangeText={setPriority} placeholder="Baixa, Normal, Alta" />
        <Button title="Enviar sugestão de pauta" onPress={submit} />
      </Card>
    </Screen>
  );
}
