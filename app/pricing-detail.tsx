import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency } from '@/lib/helpers';

export default function PricingDetailScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pricingWorksheets, deletePricingWorksheet } = useData();
  const ws = pricingWorksheets.find(p => p.id === id);

  if (!ws) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top + webTopInset }]}>
        <Text style={styles.emptyText}>Worksheet not found</Text>
      </View>
    );
  }

  const totalCost = ws.costItems.reduce((s, ci) => s + ci.unitCost * ci.quantity, 0);
  const costPerPax = ws.pax > 0 ? totalCost / ws.pax : 0;
  const pricePerPax = costPerPax * (1 + ws.markupPercent / 100);
  const totalRevenue = pricePerPax * ws.pax;
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const handleDelete = () => {
    Alert.alert('Delete Worksheet', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePricingWorksheet(ws.id); router.back(); } },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Pricing Detail</Text>
        <Pressable onPress={handleDelete} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.topCard}>
          <Text style={styles.wsTitle}>{ws.tripName}</Text>
          <Text style={styles.wsDest}>{ws.destination}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="people-outline" size={14} color={Colors.accent} />
              <Text style={styles.metaText}>{ws.pax} travelers</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="trending-up-outline" size={14} color={Colors.accent} />
              <Text style={styles.metaText}>{ws.markupPercent}% markup</Text>
            </View>
          </View>
        </View>

        <View style={styles.profitCard}>
          <View style={styles.profitRow}>
            <View style={styles.profitItem}>
              <Text style={styles.profitLabel}>Total Revenue</Text>
              <Text style={[styles.profitValue, { color: Colors.accent }]}>{formatCurrency(totalRevenue)}</Text>
            </View>
            <View style={styles.profitItem}>
              <Text style={styles.profitLabel}>Total Cost</Text>
              <Text style={[styles.profitValue, { color: Colors.danger }]}>{formatCurrency(totalCost)}</Text>
            </View>
          </View>
          <View style={styles.profitRow}>
            <View style={styles.profitItem}>
              <Text style={styles.profitLabel}>Profit</Text>
              <Text style={[styles.profitValue, { color: profit >= 0 ? Colors.success : Colors.danger }]}>{formatCurrency(profit)}</Text>
            </View>
            <View style={styles.profitItem}>
              <Text style={styles.profitLabel}>Margin</Text>
              <Text style={[styles.profitValue, { color: margin >= 20 ? Colors.success : margin >= 10 ? Colors.warning : Colors.danger }]}>{margin.toFixed(1)}%</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.perPaxRow}>
            <Text style={styles.perPaxLabel}>Price per Traveler</Text>
            <Text style={styles.perPaxValue}>{formatCurrency(pricePerPax)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Cost Breakdown</Text>
        {ws.costItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBoxText}>No cost items added</Text>
          </View>
        ) : (
          ws.costItems.map(ci => (
            <View key={ci.id} style={styles.costRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.costCategory}>{ci.category || 'Uncategorized'}</Text>
                <Text style={styles.costDesc}>{ci.description || '-'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.costAmount}>{formatCurrency(ci.unitCost * ci.quantity)}</Text>
                <Text style={styles.costQty}>{ci.quantity} x {formatCurrency(ci.unitCost)}</Text>
              </View>
            </View>
          ))
        )}

        {ws.notes ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Strategy Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{ws.notes}</Text>
            </View>
          </>
        ) : null}
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
  topCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  wsTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.primary },
  wsDest: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  metaText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  profitCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 18, marginBottom: 20, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  profitRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  profitItem: { flex: 1 },
  profitLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  profitValue: { fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 8 },
  perPaxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  perPaxLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  perPaxValue: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.primary },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.text, marginBottom: 12 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 14, marginBottom: 6 },
  costCategory: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  costDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  costAmount: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  costQty: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  emptyBox: { backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 20, alignItems: 'center' },
  emptyBoxText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  notesBox: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14 },
  notesText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.text, lineHeight: 20 },
});
