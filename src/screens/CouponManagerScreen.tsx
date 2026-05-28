import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useState } from 'react';
import { Screen, Card } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';

export default function CouponManagerScreen() {
  const { products, createCoupon } = useApp();
  const [selected, setSelected] = useState(products[0]?.id || '');
  const [discount, setDiscount] = useState('');
  function submit() { const n = Number(discount); if (!selected || !n) return Alert.alert('Campos obrigatórios', 'Selecione um produto e informe o desconto.'); createCoupon(selected, n); setDiscount(''); }
  return <Screen title="Cupons da Loja">
    <Card><Text style={styles.p}>Selecione um produto, defina o percentual e o desconto aparecerá automaticamente para todos os usuários na loja.</Text><Input label="Percentual de desconto" value={discount} onChangeText={setDiscount} keyboardType="numeric" placeholder="Ex: 30" />{products.map(p => <Pressable key={p.id} onPress={() => setSelected(p.id)} style={[styles.product, selected===p.id && styles.selected]}><Text style={styles.name}>{p.title}</Text><Text style={styles.meta}>Preço: {p.price} coins · Desconto atual: {p.discountPercent || 0}%</Text></Pressable>)}<Button title="Aplicar cupom" onPress={submit}/></Card>
  </Screen>;
}
const styles = StyleSheet.create({ p:{color:colors.muted,lineHeight:22,marginBottom:12}, product:{borderWidth:1,borderColor:colors.border,borderRadius:16,padding:13,marginBottom:8,backgroundColor:'#fff'}, selected:{borderColor:colors.primary,backgroundColor:colors.softBlue}, name:{fontWeight:'900',color:colors.text}, meta:{color:colors.muted,marginTop:3} });
