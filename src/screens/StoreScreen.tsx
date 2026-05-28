import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { Screen, Card, Pill } from '../components/Layout';
import { Button, Input } from '../components/Fields';
import { useApp } from '../context/AppContext';

const cats = ['Todos', 'Nutrição', 'Vestuário', 'Equipamentos', 'Premium'];
const icons = ['fast-food', 'water', 'shirt', 'fitness', 'barbell', 'medal', 'gift'] as const;

export default function StoreScreen() {
  const { user, redeemItem, products, addProduct, canAccessDirectorate } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Nutrição');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('gift');

  const filtered = useMemo(
    () => products.filter(i => (cat === 'Todos' || i.category === cat) && i.title.toLowerCase().includes(q.toLowerCase())),
    [q, cat, products]
  );

  function saveProduct() {
    if (!title || !price || !stock) return Alert.alert('Campos obrigatórios', 'Informe nome, valor em coins e estoque.');
    addProduct({
      title,
      category,
      price: Number(price),
      stock: Number(stock),
      description: description || 'Retirada no balcão da loja mediante voucher.',
      icon,
    });
    setTitle(''); setPrice(''); setStock(''); setDescription(''); setIcon('gift'); setShowForm(false);
  }

  return (
    <Screen title="Loja Coins">
      <View style={styles.balance}>
        <Text style={{ color: '#DCEEFF', fontWeight: '800' }}>Seu saldo disponível</Text>
        <Text style={styles.coins}>{user?.coins || 0} Coins</Text>
        <Text style={{ color: '#DCEEFF', marginTop: 8 }}>O saldo é o mesmo exibido no painel.</Text>
      </View>

      {canAccessDirectorate ? (
        <Card>
          <Button title={showForm ? 'Fechar cadastro de produto' : 'Cadastrar produto na loja'} variant="dark" onPress={() => setShowForm(v => !v)} />
          {showForm ? (
            <View style={{ marginTop: 14 }}>
              <Input label="Nome do produto" value={title} onChangeText={setTitle} />
              <Input label="Categoria" value={category} onChangeText={setCategory} />
              <Input label="Valor em coins" value={price} onChangeText={setPrice} keyboardType="numeric" />
              <Input label="Estoque" value={stock} onChangeText={setStock} keyboardType="numeric" />
              <Input label="Descrição para retirada" value={description} onChangeText={setDescription} />
              <Text style={styles.formLabel}>Ícone</Text>
              <View style={styles.iconPicker}>
                {icons.map(ic => (
                  <Pressable key={ic} onPress={() => setIcon(ic)} style={[styles.iconOption, icon === ic && { backgroundColor: colors.primary }]}> 
                    <Ionicons name={ic as any} size={22} color={icon === ic ? '#fff' : colors.primary} />
                  </Pressable>
                ))}
              </View>
              <Button title="Salvar produto" onPress={saveProduct} />
            </View>
          ) : null}
        </Card>
      ) : null}

      <TextInput style={styles.search} placeholder="Pesquisar itens..." value={q} onChangeText={setQ} placeholderTextColor="#98A2B3" />
      <View style={styles.catWrap}>
        {cats.map(c => (
          <Pressable key={c} onPress={() => setCat(c)} style={[styles.cat, cat === c && { backgroundColor: colors.text }]}>
            <Text style={{ color: cat === c ? '#fff' : colors.text, fontWeight: '900' }}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>Recompensas disponíveis</Text>
      {filtered.length === 0 ? <Card><Text style={{ color: colors.muted }}>Nenhum item encontrado.</Text></Card> : null}
      {filtered.map(i => (
        <Card key={i.id}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={styles.icon}><Ionicons name={i.icon as any} size={30} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Pill>{i.category}</Pill>
              <Text style={styles.itemTitle}>{i.title}</Text>
              <Text style={styles.desc}>{i.description}</Text>
              {i.discountPercent ? <Text style={styles.discount}>{i.discountPercent}% OFF aplicado pela diretoria</Text> : null}
              {i.discountPercent ? <Text style={styles.oldPrice}>De C$ {i.price}</Text> : null}
              <Text style={styles.price}>C$ {Math.max(0, Math.round(i.price * (1 - ((i.discountPercent || 0) / 100))))}</Text>
              <Text style={styles.stock}>Estoque: {i.stock}</Text>
            </View>
          </View>
          <Button title="Resgatar e gerar voucher" onPress={() => redeemItem(i.id)} />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  balance: { borderRadius: 34, padding: 24, backgroundColor: colors.primary, marginBottom: 18 },
  coins: { fontSize: 38, color: '#fff', fontWeight: '900', marginTop: 6 },
  search: { backgroundColor: '#fff', borderRadius: 20, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  catWrap: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  cat: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  section: { fontSize: 22, fontWeight: '900', marginBottom: 14 },
  icon: { width: 64, height: 64, borderRadius: 24, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 18, fontWeight: '900', marginTop: 8 },
  desc: { color: colors.muted, lineHeight: 20, marginTop: 4 },
  discount: { color: '#15803D', fontWeight: '900', marginTop: 6 },
  oldPrice: { color: colors.muted, textDecorationLine: 'line-through', marginTop: 4 },
  price: { fontSize: 18, fontWeight: '900', color: colors.primary, marginTop: 6 },
  stock: { color: colors.muted, fontWeight: '800', marginTop: 2 },
  formLabel: { color: colors.text, fontWeight: '700', marginBottom: 8, fontSize: 14 },
  iconPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  iconOption: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.softBlue, alignItems: 'center', justifyContent: 'center' },
});
