import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate, isPast } from '@/lib/helpers';

type FinanceTab = 'overview' | 'invoices' | 'expenses' | 'budget';

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { bookings, invoices, expenses, budgetItems, clients, isLoading } = useData();
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'unpaid' && isPast(i.dueDate));

  const tabItems: { key: FinanceTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'pie-chart-outline' },
    { key: 'invoices', label: 'Invoices', icon: 'document-text-outline' },
    { key: 'expenses', label: 'Expenses', icon: 'receipt-outline' },
    { key: 'budget', label: 'Budget', icon: 'analytics-outline' },
  ];

  if (isLoading) {
    return <View style={[styles.center, { paddingTop: insets.top + webTopInset }]}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Suite</Text>
        <Pressable onPress={() => router.push('/add-expense')} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="add-circle" size={26} color={Colors.accent} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
        {tabItems.map(t => (
          <Pressable key={t.key} onPress={() => setActiveTab(t.key)}
            style={[styles.tabPill, activeTab === t.key && styles.tabPillActive]}>
            <Ionicons name={t.icon as any} size={16} color={activeTab === t.key ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.tabPillText, activeTab === t.key && styles.tabPillTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }} contentInsetAdjustmentBehavior="automatic">
        {activeTab === 'overview' && (
          <>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: '#E8F8F5' }]}>
                <Ionicons name="arrow-up-circle" size={24} color={Colors.success} />
                <Text style={styles.summaryLabel}>Revenue</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>{formatCurrency(totalRevenue)}</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#FDF2F2' }]}>
                <Ionicons name="arrow-down-circle" size={24} color={Colors.danger} />
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={[styles.summaryValue, { color: Colors.danger }]}>{formatCurrency(totalExpenses)}</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: '#FEF9E7' }]}>
                <Ionicons name="time" size={24} color={Colors.warning} />
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={[styles.summaryValue, { color: Colors.warning }]}>{formatCurrency(totalPending)}</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#EBF5FB' }]}>
                <Ionicons name="wallet" size={24} color={Colors.info} />
                <Text style={styles.summaryLabel}>Profit</Text>
                <Text style={[styles.summaryValue, { color: Colors.info }]}>{formatCurrency(totalRevenue - totalExpenses)}</Text>
              </View>
            </View>

            {overdueInvoices.length > 0 && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={20} color={Colors.danger} />
                <Text style={styles.warningText}>{overdueInvoices.length} overdue invoice(s) totaling {formatCurrency(overdueInvoices.reduce((s, i) => s + i.amount, 0))}</Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recent Transactions</Text>
            {expenses.slice(-5).reverse().map(e => {
              const booking = bookings.find(b => b.id === e.bookingId);
              return (
                <View key={e.id} style={styles.transactionRow}>
                  <View style={styles.transactionIcon}>
                    <Feather name="minus-circle" size={18} color={Colors.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.transactionDesc}>{e.description}</Text>
                    <Text style={styles.transactionMeta}>{e.category} {booking ? `- ${booking.tripName}` : ''}</Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: Colors.danger }]}>-{formatCurrency(e.amount)}</Text>
                </View>
              );
            })}
          </>
        )}

        {activeTab === 'invoices' && (
          <>
            {invoices.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={40} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>No invoices yet</Text>
              </View>
            ) : (
              invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(inv => {
                const client = clients.find(c => c.id === inv.clientId);
                const booking = bookings.find(b => b.id === inv.bookingId);
                const isOverdue = inv.status === 'unpaid' && isPast(inv.dueDate);
                return (
                  <Pressable key={inv.id} style={({ pressed }) => [styles.invoiceCard, isOverdue && styles.invoiceOverdue, pressed && { opacity: 0.7 }]}
                    onPress={() => router.push({ pathname: '/invoice-detail', params: { id: inv.id } })}>
                    <View style={styles.invoiceTop}>
                      <View>
                        <Text style={styles.invoiceId}>INV-{inv.id.slice(0, 6).toUpperCase()}</Text>
                        <Text style={styles.invoiceClient}>{client?.name || 'Unknown'}</Text>
                        {booking && <Text style={styles.invoiceTrip}>{booking.tripName}</Text>}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.invoiceAmount}>{formatCurrency(inv.amount)}</Text>
                        <View style={[styles.invoiceStatus, { backgroundColor: inv.status === 'paid' ? Colors.successLight : isOverdue ? Colors.dangerLight : Colors.warningLight }]}>
                          <Text style={[styles.invoiceStatusText, { color: inv.status === 'paid' ? Colors.success : isOverdue ? Colors.danger : Colors.warning }]}>
                            {isOverdue ? 'OVERDUE' : inv.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.invoiceBottom}>
                      <Text style={styles.invoiceMeta}>Due: {formatDate(inv.dueDate)}</Text>
                      <Text style={styles.invoiceMeta}>Created: {formatDate(inv.createdAt)}</Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </>
        )}

        {activeTab === 'expenses' && (
          <>
            {expenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={40} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>No expenses logged</Text>
                <Pressable onPress={() => router.push('/add-expense')} style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Log Expense</Text>
                </Pressable>
              </View>
            ) : (
              expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => {
                const booking = bookings.find(b => b.id === e.bookingId);
                return (
                  <View key={e.id} style={styles.expenseCard}>
                    <View style={styles.expenseCat}>
                      <Ionicons name={e.category === 'Transport' ? 'car-outline' : e.category === 'Accommodation' ? 'bed-outline' : e.category === 'Food' ? 'restaurant-outline' : 'receipt-outline'} size={20} color={Colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.expenseDesc}>{e.description}</Text>
                      <Text style={styles.expenseMeta}>{e.category} {booking ? `| ${booking.tripName}` : ''}</Text>
                      <Text style={styles.expenseDate}>{formatDate(e.date)}</Text>
                    </View>
                    <Text style={styles.expenseAmount}>{formatCurrency(e.amount)}</Text>
                  </View>
                );
              })
            )}
          </>
        )}

        {activeTab === 'budget' && (
          <>
            {bookings.filter(b => b.status !== 'cancelled').length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={40} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>No active trips for budget tracking</Text>
              </View>
            ) : (
              bookings.filter(b => b.status !== 'cancelled').map(booking => {
                const tripExpenses = expenses.filter(e => e.bookingId === booking.id);
                const tripBudget = budgetItems.filter(bi => bi.bookingId === booking.id);
                const totalBudget = tripBudget.reduce((s, b) => s + b.budgetAmount, 0);
                const totalActual = tripExpenses.reduce((s, e) => s + e.amount, 0);
                const budgetUsed = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
                const overBudget = budgetUsed > 100;

                return (
                  <View key={booking.id} style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                      <View>
                        <Text style={styles.budgetTrip}>{booking.tripName}</Text>
                        <Text style={styles.budgetDest}>{booking.destination}</Text>
                      </View>
                      {overBudget && <Ionicons name="alert-circle" size={20} color={Colors.danger} />}
                    </View>
                    <View style={styles.budgetBar}>
                      <View style={[styles.budgetBarFill, { width: `${Math.min(budgetUsed, 100)}%`, backgroundColor: overBudget ? Colors.danger : budgetUsed > 80 ? Colors.warning : Colors.accent }]} />
                    </View>
                    <View style={styles.budgetRow}>
                      <View>
                        <Text style={styles.budgetLabel}>Budget</Text>
                        <Text style={styles.budgetValue}>{formatCurrency(totalBudget)}</Text>
                      </View>
                      <View>
                        <Text style={styles.budgetLabel}>Actual</Text>
                        <Text style={[styles.budgetValue, overBudget && { color: Colors.danger }]}>{formatCurrency(totalActual)}</Text>
                      </View>
                      <View>
                        <Text style={styles.budgetLabel}>Variance</Text>
                        <Text style={[styles.budgetValue, { color: totalBudget - totalActual >= 0 ? Colors.success : Colors.danger }]}>
                          {formatCurrency(Math.abs(totalBudget - totalActual))}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.primary },
  tabScroll: { paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tabPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceAlt, gap: 6 },
  tabPillActive: { backgroundColor: Colors.primary },
  tabPillText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  tabPillTextActive: { color: '#fff' },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 16, gap: 6 },
  summaryLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  summaryValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dangerLight, borderRadius: 12, padding: 14, gap: 10, borderLeftWidth: 3, borderLeftColor: Colors.danger, marginTop: 4 },
  warningText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.danger, flex: 1 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 12 },
  transactionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: 12 },
  transactionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center' },
  transactionDesc: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  transactionMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  transactionAmount: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  invoiceCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  invoiceOverdue: { borderLeftWidth: 3, borderLeftColor: Colors.danger },
  invoiceTop: { flexDirection: 'row', justifyContent: 'space-between' },
  invoiceId: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.primary },
  invoiceClient: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text, marginTop: 2 },
  invoiceTrip: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  invoiceAmount: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.primary },
  invoiceStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  invoiceStatusText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  invoiceBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  invoiceMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  expenseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1 },
  expenseCat: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  expenseDesc: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  expenseMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  expenseDate: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textLight, marginTop: 2 },
  expenseAmount: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.danger },
  budgetCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  budgetTrip: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  budgetDest: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  budgetBar: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, marginBottom: 12 },
  budgetBarFill: { height: 6, borderRadius: 3 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  budgetValue: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.primary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyStateText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  emptyButton: { backgroundColor: Colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  emptyButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
