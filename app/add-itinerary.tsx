import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import type { ItineraryDay, ItineraryActivity } from '@/lib/types';

const ACTIVITY_TYPES = ['transport', 'activity', 'meal', 'accommodation', 'free'] as const;

export default function AddItineraryScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { addItinerary, bookings } = useData();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [showBookings, setShowBookings] = useState(false);
  const [days, setDays] = useState<ItineraryDay[]>([{
    id: Crypto.randomUUID(),
    dayNumber: 1,
    date: new Date().toISOString().split('T')[0],
    activities: [],
  }]);
  const [expandedDay, setExpandedDay] = useState<string | null>(days[0].id);

  const addDay = () => {
    const newDay: ItineraryDay = {
      id: Crypto.randomUUID(),
      dayNumber: days.length + 1,
      date: '',
      activities: [],
    };
    setDays([...days, newDay]);
    setExpandedDay(newDay.id);
  };

  const addActivity = (dayId: string) => {
    const newActivity: ItineraryActivity = {
      id: Crypto.randomUUID(),
      time: '09:00',
      title: '',
      description: '',
      location: '',
      type: 'activity',
    };
    setDays(days.map(d => d.id === dayId ? { ...d, activities: [...d.activities, newActivity] } : d));
  };

  const updateActivity = (dayId: string, actId: string, updates: Partial<ItineraryActivity>) => {
    setDays(days.map(d => d.id === dayId ? {
      ...d,
      activities: d.activities.map(a => a.id === actId ? { ...a, ...updates } : a),
    } : d));
  };

  const removeActivity = (dayId: string, actId: string) => {
    setDays(days.map(d => d.id === dayId ? {
      ...d,
      activities: d.activities.filter(a => a.id !== actId),
    } : d));
  };

  const removeDay = (dayId: string) => {
    if (days.length <= 1) return;
    setDays(days.filter(d => d.id !== dayId).map((d, i) => ({ ...d, dayNumber: i + 1 })));
  };

  const handleSave = async () => {
    if (!title.trim() || !destination.trim()) {
      Alert.alert('Required', 'Please fill in title and destination');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addItinerary({
      bookingId: bookingId || undefined,
      title: title.trim(),
      destination: destination.trim(),
      days,
    });
    router.back();
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case 'transport': return 'car-outline';
      case 'meal': return 'restaurant-outline';
      case 'accommodation': return 'bed-outline';
      case 'free': return 'time-outline';
      default: return 'flag-outline';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Itinerary</Text>
        <Pressable onPress={handleSave} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="checkmark" size={26} color={Colors.accent} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Bali 7-Day Adventure" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Destination *</Text>
        <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="e.g. Bali, Indonesia" placeholderTextColor={Colors.textLight} />

        <Text style={styles.label}>Link to Booking</Text>
        <Pressable onPress={() => setShowBookings(!showBookings)} style={styles.selectBtn}>
          <Text style={bookingId ? styles.selectText : styles.selectPlaceholder}>
            {bookingId ? bookings.find(b => b.id === bookingId)?.tripName : 'Optional'}
          </Text>
          <Feather name="chevron-down" size={18} color={Colors.textLight} />
        </Pressable>
        {showBookings && (
          <View style={styles.dropdown}>
            <Pressable onPress={() => { setBookingId(''); setShowBookings(false); }} style={styles.dropdownItem}>
              <Text style={styles.dropdownText}>None</Text>
            </Pressable>
            {bookings.filter(b => b.status !== 'cancelled').map(b => (
              <Pressable key={b.id} onPress={() => { setBookingId(b.id); setShowBookings(false); }} style={styles.dropdownItem}>
                <Text style={styles.dropdownText}>{b.tripName}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <View style={styles.dayHeader}>
            <Text style={styles.sectionTitle}>Daily Schedule</Text>
            <Pressable onPress={addDay} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <Ionicons name="add-circle" size={24} color={Colors.accent} />
            </Pressable>
          </View>

          {days.map(day => (
            <View key={day.id} style={styles.dayCard}>
              <Pressable onPress={() => setExpandedDay(expandedDay === day.id ? null : day.id)} style={styles.dayTitleRow}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>Day {day.dayNumber}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.dayActCount}>{day.activities.length} activities</Text>
                  {days.length > 1 && (
                    <Pressable onPress={() => removeDay(day.id)}>
                      <Ionicons name="close-circle" size={20} color={Colors.danger} />
                    </Pressable>
                  )}
                  <Feather name={expandedDay === day.id ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textLight} />
                </View>
              </Pressable>

              {expandedDay === day.id && (
                <View style={styles.dayContent}>
                  {day.activities.map((act, idx) => (
                    <View key={act.id} style={styles.activityItem}>
                      <View style={styles.timelineConnector}>
                        <View style={styles.timelineDot}>
                          <Ionicons name={activityIcon(act.type) as any} size={14} color={Colors.accent} />
                        </View>
                        {idx < day.activities.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.activityContent}>
                        <View style={styles.activityRow}>
                          <TextInput
                            style={[styles.smallInput, { width: 60 }]}
                            value={act.time}
                            onChangeText={v => updateActivity(day.id, act.id, { time: v })}
                            placeholder="09:00"
                            placeholderTextColor={Colors.textLight}
                          />
                          <TextInput
                            style={[styles.smallInput, { flex: 1 }]}
                            value={act.title}
                            onChangeText={v => updateActivity(day.id, act.id, { title: v })}
                            placeholder="Activity title"
                            placeholderTextColor={Colors.textLight}
                          />
                          <Pressable onPress={() => removeActivity(day.id, act.id)}>
                            <Ionicons name="close" size={18} color={Colors.textLight} />
                          </Pressable>
                        </View>
                        <TextInput
                          style={styles.smallInput}
                          value={act.location}
                          onChangeText={v => updateActivity(day.id, act.id, { location: v })}
                          placeholder="Location"
                          placeholderTextColor={Colors.textLight}
                        />
                        <View style={styles.typeRow}>
                          {ACTIVITY_TYPES.map(at => (
                            <Pressable key={at} onPress={() => updateActivity(day.id, act.id, { type: at })}
                              style={[styles.typeChip, act.type === at && styles.typeChipActive]}>
                              <Text style={[styles.typeChipText, act.type === at && styles.typeChipTextActive]}>{at}</Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                  <Pressable onPress={() => addActivity(day.id)} style={styles.addActBtn}>
                    <Ionicons name="add" size={18} color={Colors.accent} />
                    <Text style={styles.addActText}>Add Activity</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>
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
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  selectText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.text },
  selectPlaceholder: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  dropdown: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropdownText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.text },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayCard: { backgroundColor: Colors.surface, borderRadius: 14, marginBottom: 10, overflow: 'hidden', shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  dayTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  dayBadge: { backgroundColor: Colors.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  dayBadgeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  dayActCount: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  dayContent: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  activityItem: { flexDirection: 'row', marginTop: 12 },
  timelineConnector: { width: 30, alignItems: 'center' },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.borderLight, marginTop: 4 },
  activityContent: { flex: 1, marginLeft: 10, gap: 6 },
  activityRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  smallInput: { backgroundColor: Colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.text },
  typeRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  typeChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.surfaceAlt },
  typeChipActive: { backgroundColor: Colors.accent },
  typeChipText: { fontSize: 10, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  typeChipTextActive: { color: '#fff' },
  addActBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, marginTop: 8, gap: 6, borderWidth: 1, borderColor: Colors.accent, borderRadius: 10, borderStyle: 'dashed' },
  addActText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.accent },
});
