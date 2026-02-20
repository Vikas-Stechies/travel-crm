import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

const VENDOR_TYPES = [
  { key: 'hotel', label: 'Hotel' },
  { key: 'transport', label: 'Transport' },
  { key: 'guide', label: 'Guide' },
  { key: 'other', label: 'Other' },
] as const;

export default function AddVendorScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { addVendor } = useData();
  const [name, setName] = useState('');
  const [type, setType] = useState<'hotel' | 'transport' | 'guide' | 'other'>('hotel');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Vendor name is required'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addVendor({ name: name.trim(), type, contact: contact.trim(), email: email.trim(), phone: phone.trim(), location: location.trim(), notes: notes.trim() });
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Vendor</Text>
        <Pressable onPress={handleSave} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="checkmark" size={26} color={Colors.accent} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Vendor Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Grand Hyatt" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          {VENDOR_TYPES.map(vt => (
            <Pressable key={vt.key} onPress={() => setType(vt.key)} style={[styles.typeBtn, type === vt.key && styles.typeBtnActive]}>
              <Text style={[styles.typeBtnText, type === vt.key && styles.typeBtnTextActive]}>{vt.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Contact Person</Text>
        <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="Contact name" placeholderTextColor={Colors.textLight} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="vendor@email.com" placeholderTextColor={Colors.textLight} keyboardType="email-address" autoCapitalize="none" />
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+1 234 567 8900" placeholderTextColor={Colors.textLight} keyboardType="phone-pad" />
        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="City, Country" placeholderTextColor={Colors.textLight} />
        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Additional notes..." placeholderTextColor={Colors.textLight} multiline numberOfLines={3} textAlignVertical="top" />
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
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.surfaceAlt, alignItems: 'center' },
  typeBtnActive: { backgroundColor: Colors.accent },
  typeBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  typeBtnTextActive: { color: '#fff' },
});
