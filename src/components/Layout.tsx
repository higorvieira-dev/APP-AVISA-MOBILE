import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';

export function Screen({ children, title, scroll = true }: { children: React.ReactNode; title?: string; scroll?: boolean }) {
  const content = (
    <View style={styles.inner}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{content}</ScrollView> : content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ children, color = colors.primary }: { children: React.ReactNode; color?: string }) {
  return <View style={[styles.pill, { backgroundColor: `${color}18` }]}><Text style={[styles.pillText, { color }]}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { width: '100%', paddingHorizontal: 20, paddingBottom: 120, paddingTop: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 18, letterSpacing: -0.6 },
  card: { backgroundColor: colors.surface, borderRadius: 26, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.border, shadowColor: '#344054', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, elevation: 2 },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontWeight: '800', fontSize: 12 },
});
