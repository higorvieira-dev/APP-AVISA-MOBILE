import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../theme/colors';

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default' }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder || label} placeholderTextColor="#98A2B3" secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize="none" />
    </View>
  );
}

export function Button({ title, onPress, variant = 'primary', style }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'dark'; style?: any }) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.red : variant === 'dark' ? colors.primaryDark : colors.surface;
  const color = variant === 'secondary' ? colors.text : '#fff';
  return <Pressable onPress={onPress} style={[styles.button, { backgroundColor: bg }, variant === 'secondary' && styles.secondary, style]}><Text style={[styles.buttonText, { color }]}>{title}</Text></Pressable>;
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '700', marginBottom: 8, fontSize: 14 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.text },
  button: { borderRadius: 18, paddingVertical: 15, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  secondary: { borderWidth: 1, borderColor: colors.border },
  buttonText: { fontWeight: '900', fontSize: 15 },
});
