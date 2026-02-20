import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/helpers';

type MoreTab = 'itineraries' | 'planning';

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { itineraries, pricingWorksheets, bookings, isLoading } = useData();
  const [activeTab, setActiveTab] = useState<MoreTab>('itineraries');

  if (isLoading) {
    return <View style={[styles.center, { paddingTop: insets.top + webTopInset }]}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
        {activeTab === 'itineraries' && (
          <Pressable onPress={() => router.push('/add-itinerary')} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Ionicons name="add-circle" size={26} color={Colors.accent} />
          </Pressable>
        )}
        {activeTab === 'planning' && (
          <Pressable onPress={() => router.push('/add-pricing')} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Ionicons name="add-circle" size={26} color={Colors.accent} />
          </Pressable>
        )}
      </View>

      <View style={styles.tabRow}>
        <Pressable onPress={() => setActiveTab('itineraries')}
          style={[styles.tabBtn, activeTab === 'itineraries' && styles.tabBtnActive]}>
          <Ionicons name="map-outline" size={16} color={activeTab === 'itineraries' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'itineraries' && styles.tabBtnTextActive]}>Itineraries</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('planning')}
          style={[styles.tabBtn, activeTab === 'planning' && styles.tabBtnActive]}>
          <Ionicons name="calculator-outline" size={16} color={activeTab === 'planning' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabBtnText, activeTab === 'planning' && styles.tabBtnTextActive]}>Business Planning</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} contentInsetAdjustmentBehavior="automatic">
        {activeTab === 'itineraries' && (
          <>
            {itineraries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="map-outline" size={40} color={Colors.textLight} />
                <Text style={styles.emptyText}>No itineraries created</Text>
                <Pressable onPress={() => router.push('/add-itinerary')} style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Create Itinerary</Text>
                </Pressable>
              </View>
            ) : (
              itineraries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(it => {
                const booking = it.bookingId ? bookings.find(b => b.id === it.bookingId) : null;
                return (
                  <Pressable key={it.id} style={({ pressed }) => [styles.itineraryCard, pressed && { opacity: 0.7 }]}
                    onPress={() => router.push({ pathname: '/itinerary-detail', params: { id: it.id } })}>
                    <View style={styles.itineraryIcon}>
                      <Ionicons name="map" size={24} color={Colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itineraryTitle}>{it.title}</Text>
                      <Text style={styles.itineraryDest}>{it.destination}</Text>
                      <View style={styles.itineraryMeta}>
                        <View style={styles.metaChip}>
                          <Feather name="layers" size={12} color={Colors.textSecondary} />
                          <Text style={styles.metaChipText}>{it.days.length} days</Text>
                        </View>
                        {booking && (
                          <View style={styles.metaChip}>
                            <Feather name="briefcase" size={12} color={Colors.textSecondary} />
                            <Text style={styles.metaChipText}>{booking.tripName}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Feather name="chevron-right" size={20} color={Colors.textLight} />
                  </Pressable>
                );
              })
            )}
          </>
        )}

        {activeTab === 'planning' && (
          <>
            {pricingWorksheets.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calculator-outline" size={40} color={Colors.textLight} />
                <Text style={styles.emptyText}>No pricing worksheets</Text>
                <Pressable onPress={() => router.push('/add-pricing')} style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Create Worksheet</Text>
                </Pressable>
              </View>
            ) : (
              pricingWorksheets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(ws => {
                const totalCost = ws.costItems.reduce((s, ci) => s + ci.unitCost * ci.quantity, 0);
                const pricePerPax = ws.pax > 0 ? (totalCost / ws.pax) * (1 + ws.markupPercent / 100) : 0;
                const totalRevenue = pricePerPax * ws.pax;
                const profit = totalRevenue - totalCost;
                const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

                return (
                  <Pressable key={ws.id} style={({ pressed }) => [styles.pricingCard, pressed && { opacity: 0.7 }]}
                    onPress={() => router.push({ pathname: '/pricing-detail', params: { id: ws.id } })}>
                    <View style={styles.pricingHeader}>
                      <View>
                        <Text style={styles.pricingName}>{ws.tripName}</Text>
                        <Text style={styles.pricingDest}>{ws.destination} | {ws.pax} pax</Text>
                      </View>
                      <View style={[styles.marginBadge, { backgroundColor: margin >= 20 ? Colors.successLight : margin >= 10 ? Colors.warningLight : Colors.dangerLight }]}>
                        <Text style={[styles.marginText, { color: margin >= 20 ? Colors.success : margin >= 10 ? Colors.warning : Colors.danger }]}>{margin.toFixed(1)}%</Text>
                      </View>
                    </View>
                    <View style={styles.pricingRow}>
                      <View>
                        <Text style={styles.pricingLabel}>Total Cost</Text>
                        <Text style={styles.pricingValue}>{formatCurrency(totalCost)}</Text>
                      </View>
                      <View>
                        <Text style={styles.pricingLabel}>Per Traveler</Text>
                        <Text style={styles.pricingValue}>{formatCurrency(pricePerPax)}</Text>
                      </View>
                      <View>
                        <Text style={styles.pricingLabel}>Profit</Text>
                        <Text style={[styles.pricingValue, { color: profit >= 0 ? Colors.success : Colors.danger }]}>{formatCurrency(profit)}</Text>
                      </View>
                    </View>
                  </Pressable>
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
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.surfaceAlt, gap: 6 },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  tabBtnTextActive: { color: '#fff' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  emptyButton: { backgroundColor: Colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  emptyButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  itineraryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, gap: 14, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  itineraryIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E8F8F5', alignItems: 'center', justifyContent: 'center' },
  itineraryTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  itineraryDest: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  itineraryMeta: { flexDirection: 'row', marginTop: 8, gap: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  metaChipText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  pricingCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  pricingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  pricingName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  pricingDest: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  marginBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  marginText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pricingLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  pricingValue: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.primary, marginTop: 2 },
});
