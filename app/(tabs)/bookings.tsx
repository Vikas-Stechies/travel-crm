import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/helpers';

type TabFilter = 'all' | 'confirmed' | 'pending' | 'cancelled';

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { bookings, clients, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filtered = useMemo(() => {
    let list = bookings;
    if (activeTab !== 'all') list = list.filter(b => b.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b => {
        const client = clients.find(c => c.id === b.clientId);
        return b.tripName.toLowerCase().includes(q) ||
          b.destination.toLowerCase().includes(q) ||
          (client && client.name.toLowerCase().includes(q));
      });
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, clients, search, activeTab]);

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  const statusColor = (s: string) => s === 'confirmed' ? Colors.success : s === 'pending' ? Colors.warning : Colors.danger;

  if (isLoading) {
    return <View style={[styles.center, { paddingTop: insets.top + webTopInset }]}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings & CRM</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => router.push('/add-client')} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Ionicons name="person-add-outline" size={24} color={Colors.primary} />
          </Pressable>
          <Pressable onPress={() => router.push('/add-booking')} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Ionicons name="add-circle" size={26} color={Colors.accent} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookings, clients..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </Pressable>
        )}
      </View>

      <View style={styles.tabRow}>
        {tabs.map(t => (
          <Pressable key={t.key} onPress={() => setActiveTab(t.key)}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            <View style={[styles.tabBadge, activeTab === t.key && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === t.key && styles.tabBadgeTextActive]}>{t.count}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        scrollEnabled={!!filtered.length}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={40} color={Colors.textLight} />
            <Text style={styles.emptyText}>No bookings found</Text>
            <Pressable onPress={() => router.push('/add-booking')} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Create Booking</Text>
            </Pressable>
          </View>
        )}
        renderItem={({ item }) => {
          const client = clients.find(c => c.id === item.clientId);
          return (
            <Pressable
              style={({ pressed }) => [styles.bookingCard, pressed && { opacity: 0.7 }]}
              onPress={() => router.push({ pathname: '/booking-detail', params: { id: item.id } })}>
              <View style={styles.bookingTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookingName}>{item.tripName}</Text>
                  <Text style={styles.bookingDest}>{item.destination}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor(item.status) }]} />
                  <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.bookingMeta}>
                {client && (
                  <View style={styles.metaItem}>
                    <Feather name="user" size={13} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{client.name}</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Feather name="calendar" size={13} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{formatDate(item.startDate)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="users" size={13} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{item.pax} pax</Text>
                </View>
              </View>
              <View style={styles.bookingBottom}>
                <Text style={styles.bookingAmount}>{formatCurrency(item.totalAmount)}</Text>
                <Text style={styles.bookingPaid}>Paid: {formatCurrency(item.paidAmount)}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.primary },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 20, marginBottom: 12, gap: 10, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.text },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.surfaceAlt, gap: 6 },
  tabActive: { backgroundColor: Colors.accent },
  tabText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  tabBadge: { backgroundColor: Colors.border, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: 'center' },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary },
  tabBadgeTextActive: { color: '#fff' },
  bookingCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  bookingDest: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
  bookingMeta: { flexDirection: 'row', marginTop: 12, gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  bookingBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  bookingAmount: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.primary },
  bookingPaid: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.success },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  emptyButton: { backgroundColor: Colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  emptyButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
