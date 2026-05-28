import { Alert } from 'react-native';
import { useState } from 'react';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';

export default function MaterialRequestScreen() {
  const { requestMaterial } = useApp();
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [justification, setJustification] = useState('');
  function submit() {
    if (!material || !quantity || !justification) return Alert.alert('Campos obrigatórios', 'Preencha material, quantidade e justificativa.');
    requestMaterial(material, quantity, justification);
    setMaterial(''); setQuantity(''); setJustification('');
  }
  return (
    <Screen title="Solicitar Material">
      <Card>
        <Input label="Material necessário" value={material} onChangeText={setMaterial} placeholder="Bolas, cones, coletes, kit primeiros socorros..." />
        <Input label="Quantidade" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
        <Input label="Justificativa" value={justification} onChangeText={setJustification} placeholder="Explique para qual treino/evento será usado" />
        <Button title="Enviar solicitação" onPress={submit} />
      </Card>
    </Screen>
  );
}
