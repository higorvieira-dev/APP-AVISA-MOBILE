import { Text, View } from 'react-native';
import { Screen, Card, Pill } from '../components/Layout';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';

export default function HistoryScreen() {
  const { history } = useApp();
  return (
    <Screen title="Histórico do Atleta">
      {history.length === 0 ? (
        <Card>
          <Text style={{ fontSize: 20, fontWeight: '900', lineHeight: 28 }}>Seu histórico ainda está vazio.</Text>
          <Text style={{ color: colors.muted, lineHeight: 24, marginTop: 10 }}>Comece hoje. Cada treino concluído é um passo a mais para a sua melhor versão.</Text>
        </Card>
      ) : history.map(h => (
        <Card key={h.id} style={h.type === 'voucher' ? { borderColor: colors.green, borderWidth: 2 } : undefined}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <Pill color={h.type === 'voucher' ? colors.green : colors.primary}>{h.type.toUpperCase()}</Pill>
            <Text style={{ color: colors.muted, fontWeight: '800' }}>{h.date}</Text>
          </View>
          <Text style={{ fontSize: 19, fontWeight: '900', marginTop: 12 }}>{h.title}</Text>
          <Text style={{ color: colors.muted, lineHeight: 23, marginTop: 8 }}>{h.description}</Text>
          {h.code ? <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '900', color: colors.green }}>Código: {h.code}</Text> : null}
          {h.status ? <Text style={{ marginTop: 6, color: colors.primary, fontWeight: '900' }}>Status: {h.status}</Text> : null}
        </Card>
      ))}
    </Screen>
  );
}
