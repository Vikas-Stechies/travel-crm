import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate, isPast } from '@/lib/helpers';

export default function InvoiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, bookings, clients, updateInvoice, updateBooking } = useData();

  const invoice = invoices.find(i => i.id === id);
  const booking = invoice ? bookings.find(b => b.id === invoice.bookingId) : null;
  const client = invoice ? clients.find(c => c.id === invoice.clientId) : null;

  if (!invoice) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top + webTopInset }]}>
        <Text style={styles.emptyText}>Invoice not found</Text>
      </View>
    );
  }

  const isOverdue = invoice.status === 'unpaid' && isPast(invoice.dueDate);

  const handleMarkPaid = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateInvoice({ ...invoice, status: 'paid' });
    if (booking) {
      await updateBooking({ ...booking, paidAmount: booking.paidAmount + invoice.amount });
    }
  };

  const handleMarkUnpaid = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateInvoice({ ...invoice, status: 'unpaid' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Invoice</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} contentInsetAdjustmentBehavior="automatic">
        <View style={[styles.invoiceCard, isOverdue && { borderColor: Colors.danger, borderWidth: 2 }]}>
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={styles.invoiceLabel}>INVOICE</Text>
              <Text style={styles.invoiceId}>INV-{invoice.id.slice(0, 6).toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: invoice.status === 'paid' ? Colors.successLight : isOverdue ? Colors.dangerLight : Colors.warningLight }]}>
              <Text style={[styles.statusText, { color: invoice.status === 'paid' ? Colors.success : isOverdue ? Colors.danger : Colors.warning }]}>
                {isOverdue ? 'OVERDUE' : invoice.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Bill To</Text>
              <Text style={styles.detailValue}>{client?.name || 'Unknown'}</Text>
              {client?.email ? <Text style={styles.detailSub}>{client.email}</Text> : null}
              {client?.phone ? <Text style={styles.detailSub}>{client.phone}</Text> : null}
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Trip</Text>
              <Text style={styles.detailValue}>{booking?.tripName || 'N/A'}</Text>
              {booking && <Text style={styles.detailSub}>{booking.destination}</Text>}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.dateRow}>
            <View>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{formatDate(invoice.createdAt)}</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={[styles.detailValue, isOverdue && { color: Colors.danger }]}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>{formatCurrency(invoice.amount)}</Text>
          </View>
        </View>

        {isOverdue && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color={Colors.danger} />
            <Text style={styles.warningText}>This invoice is past due. Payment was expected by {formatDate(invoice.dueDate)}.</Text>
          </View>
        )}

        <View style={styles.actions}>
          {invoice.status !== 'paid' ? (
            <Pressable onPress={handleMarkPaid} style={({ pressed }) => [styles.actionBtn, styles.actionPrimary, pressed && { opacity: 0.8 }]}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.actionPrimaryText}>Mark as Paid</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleMarkUnpaid} style={({ pressed }) => [styles.actionBtn, styles.actionSecondary, pressed && { opacity: 0.8 }]}>
              <Ionicons name="close-circle" size={20} color={Colors.warning} />
              <Text style={styles.actionSecondaryText}>Mark as Unpaid</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  invoiceCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 24, marginBottom: 16, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  invoiceLabel: { fontSize: 11, fontFamily: 'Inter_700Bold', color: Colors.textLight, letterSpacing: 1.5 },
  invoiceId: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.primary, marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 16 },
  detailRow: { flexDirection: 'row', gap: 20 },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginTop: 4 },
  detailSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountSection: { alignItems: 'center', paddingVertical: 8 },
  amountLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  amountValue: { fontSize: 32, fontFamily: 'Inter_700Bold', color: Colors.primary, marginTop: 8 },
  warningBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dangerLight, borderRadius: 12, padding: 14, gap: 10, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: Colors.danger },
  warningText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.danger, flex: 1 },
  actions: { gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  actionPrimary: { backgroundColor: Colors.success },
  actionPrimaryText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  actionSecondary: { backgroundColor: Colors.warningLight, borderWidth: 1, borderColor: Colors.warning },
  actionSecondaryText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.warning },
});
