import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

export default function AddBookingScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { addBooking, addInvoice, clients } = useData();
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pax, setPax] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [requirements, setRequirements] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showClients, setShowClients] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tripName.trim() || !destination.trim() || !startDate.trim() || !endDate.trim()) {
      Alert.alert('Required', 'Please fill in trip name, destination, and dates');
      return;
    }
    if (!selectedClientId) { Alert.alert('Required', 'Please select a client'); return; }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const amount = parseFloat(totalAmount) || 0;
    const booking = await addBooking({
      clientId: selectedClientId,
      tripName: tripName.trim(),
      destination: destination.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      pax: parseInt(pax) || 1,
      status: 'pending',
      totalAmount: amount,
      paidAmount: 0,
      requirements: requirements.trim(),
    });
    if (amount > 0) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      await addInvoice({
        bookingId: booking.id,
        clientId: selectedClientId,
        amount: amount,
        status: 'unpaid',
        dueDate: dueDate.toISOString(),
      });
    }
    setSaving(false);
    router.back();
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>New Booking</Text>
        <Pressable onPress={handleSave} disabled={saving} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="checkmark" size={26} color={Colors.accent} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Client *</Text>
        <Pressable onPress={() => setShowClients(!showClients)} style={styles.selectBtn}>
          <Text style={selectedClient ? styles.selectText : styles.selectPlaceholder}>
            {selectedClient ? selectedClient.name : 'Select a client'}
          </Text>
          <Feather name="chevron-down" size={18} color={Colors.textLight} />
        </Pressable>
        {showClients && (
          <View style={styles.dropdown}>
            {clients.length === 0 ? (
              <Text style={styles.dropdownEmpty}>No clients. Add a client first.</Text>
            ) : (
              clients.map(c => (
                <Pressable key={c.id} onPress={() => { setSelectedClientId(c.id); setShowClients(false); }} style={styles.dropdownItem}>
                  <Text style={[styles.dropdownText, c.id === selectedClientId && { color: Colors.accent }]}>{c.name}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}

        <Text style={styles.label}>Trip Name *</Text>
        <TextInput style={styles.input} value={tripName} onChangeText={setTripName} placeholder="e.g. Bali Adventure" placeholderTextColor={Colors.textLight} />
        <Text style={styles.label}>Destination *</Text>
        <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="e.g. Bali, Indonesia" placeholderTextColor={Colors.textLight} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Start Date *</Text>
            <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>End Date *</Text>
            <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textLight} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Travelers</Text>
            <TextInput style={styles.input} value={pax} onChangeText={setPax} placeholder="1" placeholderTextColor={Colors.textLight} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Total Amount</Text>
            <TextInput style={styles.input} value={totalAmount} onChangeText={setTotalAmount} placeholder="0.00" placeholderTextColor={Colors.textLight} keyboardType="decimal-pad" />
          </View>
        </View>

        <Text style={styles.label}>Requirements / Notes</Text>
        <TextInput style={[styles.input, styles.textArea]} value={requirements} onChangeText={setRequirements} placeholder="Special requirements, dietary needs..." placeholderTextColor={Colors.textLight} multiline numberOfLines={4} textAlignVertical="top" />
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
  textArea: { minHeight: 100 },
  row: { flexDirection: 'row', gap: 12 },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  selectText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.text },
  selectPlaceholder: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  dropdown: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropdownText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.text },
  dropdownEmpty: { padding: 14, fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textLight, textAlign: 'center' },
});
