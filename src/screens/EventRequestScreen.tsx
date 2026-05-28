import { Alert } from 'react-native';
import { useState } from 'react';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';

export default function EventRequestScreen() {
  const { requestEvent } = useApp();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  function submit() {
    if (!title || !date || !time || !location) return Alert.alert('Campos obrigatórios', 'Informe título, data, horário e local.');
    requestEvent({ title, date, time, location, description });
    setTitle(''); setDate(''); setTime(''); setLocation(''); setDescription('');
  }
  return (
    <Screen title="Solicitar Evento">
      <Card>
        <Input label="Nome do evento" value={title} onChangeText={setTitle} />
        <Input label="Data" value={date} onChangeText={setDate} placeholder="Ex: 28/09/2026" />
        <Input label="Horário" value={time} onChangeText={setTime} placeholder="Ex: 19:00" />
        <Input label="Local" value={location} onChangeText={setLocation} />
        <Input label="Descrição" value={description} onChangeText={setDescription} placeholder="Objetivo, público, estrutura necessária..." />
        <Button title="Enviar para aprovação" onPress={submit} />
      </Card>
    </Screen>
  );
}
