import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

const TASK_CATEGORIES = [
  { key: 'visa', label: 'Visa Processing' },
  { key: 'ticket', label: 'Ticket Issuance' },
  { key: 'briefing', label: 'Client Briefing' },
  { key: 'other', label: 'Other' },
] as const;

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { addTask, bookings } = useData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [category, setCategory] = useState<'visa' | 'ticket' | 'briefing' | 'other'>('other');
  const [bookingId, setBookingId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showBookings, setShowBookings] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !dueDate.trim()) {
      Alert.alert('Required', 'Please fill in title and due date');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addTask({
      title: title.trim(),
      description: description.trim(),
      assignee: assignee.trim(),
      status: 'todo',
      category,
      bookingId: bookingId || undefined,
      dueDate: new Date(dueDate).toISOString(),
    });
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>New Task</Text>
        <Pressable onPress={handleSave} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="checkmark" size={26} color={Colors.accent} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Process visa for client" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Category</Text>
        <View style={styles.catRow}>
          {TASK_CATEGORIES.map(tc => (
            <Pressable key={tc.key} onPress={() => setCategory(tc.key)} style={[styles.catBtn, category === tc.key && styles.catBtnActive]}>
              <Text style={[styles.catBtnText, category === tc.key && styles.catBtnTextActive]}>{tc.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Task details..." placeholderTextColor={Colors.textLight} multiline numberOfLines={3} textAlignVertical="top" />

        <Text style={styles.label}>Assignee</Text>
        <TextInput style={styles.input} value={assignee} onChangeText={setAssignee} placeholder="Team member name" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Due Date *</Text>
        <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Link to Trip (Optional)</Text>
        <Pressable onPress={() => setShowBookings(!showBookings)} style={styles.selectBtn}>
          <Text style={bookingId ? styles.selectText : styles.selectPlaceholder}>
            {bookingId ? bookings.find(b => b.id === bookingId)?.tripName : 'Select trip'}
          </Text>
          <Feather name="chevron-down" size={18} color={Colors.textLight} />
        </Pressable>
        {showBookings && (
          <View style={styles.dropdown}>
            <Pressable onPress={() => { setBookingId(''); setShowBookings(false); }} style={styles.dropdownItem}>
              <Text style={styles.dropdownText}>None</Text>
            </Pressable>
            {bookings.filter(b => b.status !== 'cancelled').map(b => (
              <Pressable key={b.id} onPress={() => { setBookingId(b.id); setShowBookings(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownText}>{b.tripName}</Text>
              </Pressable>
            ))}
          </View>
        )}
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
  textArea: { minHeight: 80 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.surfaceAlt },
  catBtnActive: { backgroundColor: Colors.accent },
  catBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  catBtnTextActive: { color: '#fff' },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  selectText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.text },
  selectPlaceholder: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  dropdown: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropdownText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.text },
});
