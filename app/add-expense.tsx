import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

const CATEGORIES = ['Transport', 'Accommodation', 'Food', 'Activities', 'Insurance', 'Visa', 'Miscellaneous'];

export default function AddExpenseScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { addExpense, bookings } = useData();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCategories, setShowCategories] = useState(false);
  const [showBookings, setShowBookings] = useState(false);

  const handleSave = async () => {
    if (!description.trim() || !amount || !category) {
      Alert.alert('Required', 'Please fill in description, amount, and category');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addExpense({
      bookingId,
      category,
      description: description.trim(),
      amount: parseFloat(amount) || 0,
      date: new Date(date).toISOString(),
    });
    router.back();
  };

  const activeBookings = bookings.filter(b => b.status !== 'cancelled');

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Log Expense</Text>
        <Pressable onPress={handleSave} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="checkmark" size={26} color={Colors.accent} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Description *</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="e.g. Airport transfer" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Amount *</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="0.00" placeholderTextColor={Colors.textLight} keyboardType="decimal-pad" />

        <Text style={styles.label}>Category *</Text>
        <Pressable onPress={() => setShowCategories(!showCategories)} style={styles.selectBtn}>
          <Text style={category ? styles.selectText : styles.selectPlaceholder}>{category || 'Select category'}</Text>
          <Feather name="chevron-down" size={18} color={Colors.textLight} />
        </Pressable>
        {showCategories && (
          <View style={styles.dropdown}>
            {CATEGORIES.map(c => (
              <Pressable key={c} onPress={() => { setCategory(c); setShowCategories(false); }} style={styles.dropdownItem}>
                <Text style={[styles.dropdownText, c === category && { color: Colors.accent }]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.label}>Trip (Optional)</Text>
        <Pressable onPress={() => setShowBookings(!showBookings)} style={styles.selectBtn}>
          <Text style={bookingId ? styles.selectText : styles.selectPlaceholder}>
            {bookingId ? activeBookings.find(b => b.id === bookingId)?.tripName : 'Link to trip'}
          </Text>
          <Feather name="chevron-down" size={18} color={Colors.textLight} />
        </Pressable>
        {showBookings && (
          <View style={styles.dropdown}>
            <Pressable onPress={() => { setBookingId(''); setShowBookings(false); }} style={styles.dropdownItem}>
              <Text style={styles.dropdownText}>None</Text>
            </Pressable>
            {activeBookings.map(b => (
              <Pressable key={b.id} onPress={() => { setBookingId(b.id); setShowBookings(false); }} style={styles.dropdownItem}>
                <Text style={[styles.dropdownText, b.id === bookingId && { color: Colors.accent }]}>{b.tripName}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.label}>Date</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textLight} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  form: { padding: 20, gap: 4, paddingBottom: 40 },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary, marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  selectText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.text },
  selectPlaceholder: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  dropdown: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropdownText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.text },
});
