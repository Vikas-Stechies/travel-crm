import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency, isToday, isPast, getDaysFromNow, formatDate, formatShortDate, getMonthRange } from '@/lib/helpers';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { bookings, invoices, expenses, tasks, clients, isLoading } = useData();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const tripsToday = bookings.filter(b => isToday(b.startDate) && b.status !== 'cancelled');
  const pendingInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue' || (i.status === 'unpaid' && isPast(i.dueDate)));

  const { start, end } = getMonthRange();
  const monthlyRevenue = invoices
    .filter(i => i.status === 'paid' && new Date(i.createdAt) >= start && new Date(i.createdAt) <= end)
    .reduce((sum, i) => sum + i.amount, 0);

  const upcomingTrips = bookings
    .filter(b => b.status !== 'cancelled' && getDaysFromNow(b.startDate) >= 0 && getDaysFromNow(b.startDate) <= 7)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const overdueTasks = tasks.filter(t => t.status !== 'done' && isPast(t.dueDate));
  const urgentItems = [...overdueInvoices.map(i => ({ type: 'invoice' as const, id: i.id, label: `Invoice #${i.id.slice(0, 6)} overdue`, dueDate: i.dueDate })),
    ...overdueTasks.map(t => ({ type: 'task' as const, id: t.id, label: `${t.title} overdue`, dueDate: t.dueDate }))
  ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} contentInsetAdjustmentBehavior="automatic">
      <View style={{ paddingTop: insets.top + webTopInset + 16, paddingHorizontal: 20 }}>
        <Text style={styles.greeting}>TourOps</Text>
        <Text style={styles.subtitle}>Operations Dashboard</Text>
      </View>

      <View style={styles.metricsRow}>
        <LinearGradient colors={['#0EA5A0', '#0B8E89']} style={styles.metricCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="airplane" size={22} color="rgba(255,255,255,0.8)" />
          <Text style={styles.metricValue}>{tripsToday.length}</Text>
          <Text style={styles.metricLabel}>Trips Today</Text>
        </LinearGradient>

        <LinearGradient colors={[overdueInvoices.length > 0 ? '#E53E3E' : '#DD6B20', overdueInvoices.length > 0 ? '#C53030' : '#C05621']} style={styles.metricCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="document-text" size={22} color="rgba(255,255,255,0.8)" />
          <Text style={styles.metricValue}>{pendingInvoices.length}</Text>
          <Text style={styles.metricLabel}>Pending Invoices</Text>
        </LinearGradient>

        <LinearGradient colors={['#0B1D3A', '#1A3A5C']} style={styles.metricCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="trending-up" size={22} color="rgba(255,255,255,0.8)" />
          <Text style={styles.metricValue}>{formatCurrency(monthlyRevenue)}</Text>
          <Text style={styles.metricLabel}>Monthly Revenue</Text>
        </LinearGradient>
      </View>

      {urgentItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color={Colors.danger} />
            <Text style={[styles.sectionTitle, { color: Colors.danger }]}>Urgent Alerts</Text>
          </View>
          {urgentItems.map(item => (
            <View key={item.id} style={styles.alertCard}>
              <View style={styles.alertDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertText}>{item.label}</Text>
                <Text style={styles.alertDate}>Due: {formatDate(item.dueDate)}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textLight} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color={Colors.accent} />
          <Text style={styles.sectionTitle}>Upcoming Trips (7 days)</Text>
        </View>
        {upcomingTrips.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="airplane-outline" size={32} color={Colors.textLight} />
            <Text style={styles.emptyText}>No upcoming trips this week</Text>
          </View>
        ) : (
          upcomingTrips.map(trip => {
            const client = clients.find(c => c.id === trip.clientId);
            const daysAway = getDaysFromNow(trip.startDate);
            return (
              <Pressable key={trip.id} style={({ pressed }) => [styles.tripCard, pressed && { opacity: 0.7 }]}
                onPress={() => router.push({ pathname: '/booking-detail', params: { id: trip.id } })}>
                <View style={styles.tripCardLeft}>
                  <Text style={styles.tripName}>{trip.tripName}</Text>
                  <Text style={styles.tripDest}>{trip.destination}</Text>
                  {client && <Text style={styles.tripClient}>{client.name}</Text>}
                </View>
                <View style={styles.tripCardRight}>
                  <Text style={[styles.tripDays, daysAway === 0 && { color: Colors.accent }]}>
                    {daysAway === 0 ? 'Today' : `${daysAway}d`}
                  </Text>
                  <Text style={styles.tripDate}>{formatShortDate(trip.startDate)}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{clients.length}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bookings.filter(b => b.status === 'confirmed').length}</Text>
            <Text style={styles.statLabel}>Active Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tasks.filter(t => t.status !== 'done').length}</Text>
            <Text style={styles.statLabel}>Open Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</Text>
            <Text style={styles.statLabel}>Total Expenses</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  greeting: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.primary },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  metricsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 10 },
  metricCard: { flex: 1, borderRadius: 16, padding: 14, minHeight: 110, justifyContent: 'space-between' },
  metricValue: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff', marginTop: 8 },
  metricLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  section: { marginTop: 28, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dangerLight, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderLeftWidth: 3, borderLeftColor: Colors.danger },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  alertText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  alertDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  emptyCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 32, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  tripCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 8, justifyContent: 'space-between', alignItems: 'center', shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  tripCardLeft: { flex: 1 },
  tripName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  tripDest: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  tripClient: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.accent, marginTop: 4 },
  tripCardRight: { alignItems: 'flex-end', marginLeft: 12 },
  tripDays: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.primary },
  tripDate: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  statItem: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, width: '48%', flexGrow: 1, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.primary },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 4 },
});
