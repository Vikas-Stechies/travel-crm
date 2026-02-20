import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/helpers';

export default function BookingDetailScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings, clients, expenses, invoices, tasks, updateBooking, deleteBooking } = useData();

  const booking = bookings.find(b => b.id === id);
  const client = booking ? clients.find(c => c.id === booking.clientId) : null;
  const tripExpenses = useMemo(() => expenses.filter(e => e.bookingId === id), [expenses, id]);
  const tripInvoices = useMemo(() => invoices.filter(i => i.bookingId === id), [invoices, id]);
  const tripTasks = useMemo(() => tasks.filter(t => t.bookingId === id), [tasks, id]);

  if (!booking) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top + webTopInset }]}>
        <Text style={styles.emptyText}>Booking not found</Text>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.accent} />
        </Pressable>
      </View>
    );
  }

  const handleStatusChange = async (status: 'confirmed' | 'pending' | 'cancelled') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateBooking({ ...booking, status });
  };

  const handleDelete = () => {
    Alert.alert('Delete Booking', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteBooking(booking.id); router.back(); } },
    ]);
  };

  const statusColor = booking.status === 'confirmed' ? Colors.success : booking.status === 'pending' ? Colors.warning : Colors.danger;
  const totalExpenses = tripExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <Pressable onPress={handleDelete} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.topCard}>
          <Text style={styles.tripName}>{booking.tripName}</Text>
          <Text style={styles.tripDest}>{booking.destination}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{booking.status}</Text>
          </View>
        </View>

        <View style={styles.statusActions}>
          {(['pending', 'confirmed', 'cancelled'] as const).map(s => (
            <Pressable key={s} onPress={() => handleStatusChange(s)}
              style={[styles.statusBtn, booking.status === s && { backgroundColor: (s === 'confirmed' ? Colors.success : s === 'pending' ? Colors.warning : Colors.danger), borderColor: 'transparent' }]}>
              <Text style={[styles.statusBtnText, booking.status === s && { color: '#fff' }]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Feather name="user" size={16} color={Colors.accent} />
            <Text style={styles.infoLabel}>Client</Text>
            <Text style={styles.infoValue}>{client?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={16} color={Colors.accent} />
            <Text style={styles.infoLabel}>Dates</Text>
            <Text style={styles.infoValue}>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="users" size={16} color={Colors.accent} />
            <Text style={styles.infoLabel}>Travelers</Text>
            <Text style={styles.infoValue}>{booking.pax}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="dollar-sign" size={16} color={Colors.accent} />
            <Text style={styles.infoLabel}>Total Amount</Text>
            <Text style={styles.infoValue}>{formatCurrency(booking.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.financeRow}>
          <View style={[styles.financeCard, { backgroundColor: Colors.successLight }]}>
            <Text style={styles.financeLabel}>Paid</Text>
            <Text style={[styles.financeValue, { color: Colors.success }]}>{formatCurrency(booking.paidAmount)}</Text>
          </View>
          <View style={[styles.financeCard, { backgroundColor: Colors.dangerLight }]}>
            <Text style={styles.financeLabel}>Expenses</Text>
            <Text style={[styles.financeValue, { color: Colors.danger }]}>{formatCurrency(totalExpenses)}</Text>
          </View>
          <View style={[styles.financeCard, { backgroundColor: Colors.infoLight }]}>
            <Text style={styles.financeLabel}>Balance</Text>
            <Text style={[styles.financeValue, { color: Colors.info }]}>{formatCurrency(booking.totalAmount - booking.paidAmount)}</Text>
          </View>
        </View>

        {booking.requirements ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsText}>{booking.requirements}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoices ({tripInvoices.length})</Text>
          {tripInvoices.map(inv => (
            <Pressable key={inv.id} onPress={() => router.push({ pathname: '/invoice-detail', params: { id: inv.id } })}
              style={styles.listItem}>
              <View>
                <Text style={styles.listItemTitle}>INV-{inv.id.slice(0, 6).toUpperCase()}</Text>
                <Text style={styles.listItemSub}>Due: {formatDate(inv.dueDate)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.listItemAmount}>{formatCurrency(inv.amount)}</Text>
                <Text style={[styles.listItemStatus, { color: inv.status === 'paid' ? Colors.success : Colors.warning }]}>{inv.status}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks ({tripTasks.length})</Text>
          {tripTasks.map(t => (
            <View key={t.id} style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listItemTitle}>{t.title}</Text>
                <Text style={styles.listItemSub}>{t.category} | {t.assignee || 'Unassigned'}</Text>
              </View>
              <View style={[styles.taskStatusBadge, { backgroundColor: t.status === 'done' ? Colors.successLight : t.status === 'in_progress' ? Colors.warningLight : Colors.surfaceAlt }]}>
                <Text style={[styles.taskStatusText, { color: t.status === 'done' ? Colors.success : t.status === 'in_progress' ? Colors.warning : Colors.textSecondary }]}>{t.status.replace('_', ' ')}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  topCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  tripName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.primary },
  tripDest: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, gap: 6, alignSelf: 'flex-start', marginTop: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
  statusActions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statusBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.surfaceAlt, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statusBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  infoGrid: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, gap: 12, marginBottom: 16, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary, width: 80 },
  infoValue: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text, flex: 1 },
  financeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  financeCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  financeLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  financeValue: { fontSize: 16, fontFamily: 'Inter_700Bold', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 10 },
  requirementsBox: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14 },
  requirementsText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.text, lineHeight: 20 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 8 },
  listItemTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  listItemSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  listItemAmount: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  listItemStatus: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 2, textTransform: 'uppercase' },
  taskStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  taskStatusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
});
