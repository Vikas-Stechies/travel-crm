import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { formatCurrency } from '@/lib/helpers';
import type { CostItem } from '@/lib/types';

export default function AddPricingScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { addPricingWorksheet } = useData();
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [pax, setPax] = useState('');
  const [markupPercent, setMarkupPercent] = useState('20');
  const [notes, setNotes] = useState('');
  const [costItems, setCostItems] = useState<CostItem[]>([]);

  const addCostItem = () => {
    setCostItems([...costItems, {
      id: Crypto.randomUUID(),
      category: '',
      description: '',
      unitCost: 0,
      quantity: 1,
    }]);
  };

  const updateCostItem = (id: string, updates: Partial<CostItem>) => {
    setCostItems(costItems.map(ci => ci.id === id ? { ...ci, ...updates } : ci));
  };

  const removeCostItem = (id: string) => {
    setCostItems(costItems.filter(ci => ci.id !== id));
  };

  const totalCost = costItems.reduce((s, ci) => s + ci.unitCost * ci.quantity, 0);
  const paxNum = parseInt(pax) || 1;
  const markup = parseFloat(markupPercent) || 0;
  const costPerPax = paxNum > 0 ? totalCost / paxNum : 0;
  const pricePerPax = costPerPax * (1 + markup / 100);
  const totalRevenue = pricePerPax * paxNum;
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const handleSave = async () => {
    if (!tripName.trim() || !destination.trim()) {
      Alert.alert('Required', 'Please fill in trip name and destination');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addPricingWorksheet({
      tripName: tripName.trim(),
      destination: destination.trim(),
      pax: paxNum,
      costItems,
      markupPercent: markup,
      notes: notes.trim(),
    });
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Pricing Worksheet</Text>
        <Pressable onPress={handleSave} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="checkmark" size={26} color={Colors.accent} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Trip Name *</Text>
        <TextInput style={styles.input} value={tripName} onChangeText={setTripName} placeholder="e.g. Thailand Explorer" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Destination *</Text>
        <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="e.g. Bangkok, Thailand" placeholderTextColor={Colors.textLight} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Travelers</Text>
            <TextInput style={styles.input} value={pax} onChangeText={setPax} placeholder="1" placeholderTextColor={Colors.textLight} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Markup %</Text>
            <TextInput style={styles.input} value={markupPercent} onChangeText={setMarkupPercent} placeholder="20" placeholderTextColor={Colors.textLight} keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.costHeader}>
          <Text style={styles.sectionTitle}>Cost Items</Text>
          <Pressable onPress={addCostItem} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Ionicons name="add-circle" size={24} color={Colors.accent} />
          </Pressable>
        </View>

        {costItems.map(ci => (
          <View key={ci.id} style={styles.costCard}>
            <View style={styles.costRow}>
              <TextInput
                style={[styles.smallInput, { flex: 1 }]}
                value={ci.category}
                onChangeText={v => updateCostItem(ci.id, { category: v })}
                placeholder="Category"
                placeholderTextColor={Colors.textLight}
              />
              <Pressable onPress={() => removeCostItem(ci.id)}>
                <Ionicons name="close" size={18} color={Colors.textLight} />
              </Pressable>
            </View>
            <TextInput
              style={styles.smallInput}
              value={ci.description}
              onChangeText={v => updateCostItem(ci.id, { description: v })}
              placeholder="Description"
              placeholderTextColor={Colors.textLight}
            />
            <View style={styles.costRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tinyLabel}>Unit Cost</Text>
                <TextInput
                  style={styles.smallInput}
                  value={ci.unitCost ? String(ci.unitCost) : ''}
                  onChangeText={v => updateCostItem(ci.id, { unitCost: parseFloat(v) || 0 })}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tinyLabel}>Qty</Text>
                <TextInput
                  style={styles.smallInput}
                  value={ci.quantity ? String(ci.quantity) : ''}
                  onChangeText={v => updateCostItem(ci.id, { quantity: parseInt(v) || 0 })}
                  placeholder="1"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.tinyLabel}>Total</Text>
                <Text style={styles.costTotal}>{formatCurrency(ci.unitCost * ci.quantity)}</Text>
              </View>
            </View>
          </View>
        ))}

        {costItems.length === 0 && (
          <Pressable onPress={addCostItem} style={styles.addCostBtn}>
            <Ionicons name="add" size={18} color={Colors.accent} />
            <Text style={styles.addCostText}>Add cost item</Text>
          </Pressable>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Pricing Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total Cost</Text><Text style={styles.summaryValue}>{formatCurrency(totalCost)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Cost per Traveler</Text><Text style={styles.summaryValue}>{formatCurrency(costPerPax)}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Markup ({markup}%)</Text><Text style={styles.summaryValue}>{formatCurrency(pricePerPax - costPerPax)}</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { fontFamily: 'Inter_600SemiBold' }]}>Price per Traveler</Text><Text style={[styles.summaryValue, { fontFamily: 'Inter_700Bold' }]}>{formatCurrency(pricePerPax)}</Text></View>
          <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { fontFamily: 'Inter_600SemiBold' }]}>Total Revenue</Text><Text style={[styles.summaryValue, { fontFamily: 'Inter_700Bold', color: Colors.accent }]}>{formatCurrency(totalRevenue)}</Text></View>
          <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { fontFamily: 'Inter_600SemiBold' }]}>Profit</Text><Text style={[styles.summaryValue, { fontFamily: 'Inter_700Bold', color: profit >= 0 ? Colors.success : Colors.danger }]}>{formatCurrency(profit)}</Text></View>
          <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { fontFamily: 'Inter_600SemiBold' }]}>Margin</Text><Text style={[styles.summaryValue, { fontFamily: 'Inter_700Bold', color: margin >= 20 ? Colors.success : margin >= 10 ? Colors.warning : Colors.danger }]}>{margin.toFixed(1)}%</Text></View>
        </View>

        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Market strategy notes..." placeholderTextColor={Colors.textLight} multiline numberOfLines={3} textAlignVertical="top" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.textSecondary, marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  textArea: { minHeight: 80 },
  row: { flexDirection: 'row', gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  costHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  costCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, gap: 8, borderWidth: 1, borderColor: Colors.border },
  costRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  smallInput: { backgroundColor: Colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.text },
  tinyLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: Colors.textLight, marginBottom: 2 },
  costTotal: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primary, paddingVertical: 8 },
  addCostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1, borderColor: Colors.accent, borderRadius: 12, borderStyle: 'dashed', gap: 6 },
  addCostText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.accent },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 18, marginTop: 16, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  summaryTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.primary, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  summaryValue: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 8 },
});
