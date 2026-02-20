import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';

export default function ItineraryDetailScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { itineraries, deleteItinerary, bookings } = useData();
  const itinerary = itineraries.find(i => i.id === id);

  if (!itinerary) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top + webTopInset }]}>
        <Text style={styles.emptyText}>Itinerary not found</Text>
      </View>
    );
  }

  const booking = itinerary.bookingId ? bookings.find(b => b.id === itinerary.bookingId) : null;

  const handleDelete = () => {
    Alert.alert('Delete Itinerary', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteItinerary(itinerary.id); router.back(); } },
    ]);
  };

  const activityIcon = (type: string) => {
    switch (type) {
      case 'transport': return 'car';
      case 'meal': return 'restaurant';
      case 'accommodation': return 'bed';
      case 'free': return 'time';
      default: return 'flag';
    }
  };

  const activityColor = (type: string) => {
    switch (type) {
      case 'transport': return '#3182CE';
      case 'meal': return '#DD6B20';
      case 'accommodation': return '#805AD5';
      case 'free': return '#38A169';
      default: return Colors.accent;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Itinerary</Text>
        <Pressable onPress={handleDelete} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.topCard}>
          <Text style={styles.itTitle}>{itinerary.title}</Text>
          <Text style={styles.itDest}>{itinerary.destination}</Text>
          {booking && <Text style={styles.itBooking}>Trip: {booking.tripName}</Text>}
          <View style={styles.itMeta}>
            <View style={styles.metaChip}>
              <Ionicons name="layers-outline" size={14} color={Colors.accent} />
              <Text style={styles.metaText}>{itinerary.days.length} days</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="flag-outline" size={14} color={Colors.accent} />
              <Text style={styles.metaText}>
                {itinerary.days.reduce((s, d) => s + d.activities.length, 0)} activities
              </Text>
            </View>
          </View>
        </View>

        {itinerary.days.map(day => (
          <View key={day.id} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>Day {day.dayNumber}</Text>
              </View>
              {day.date ? <Text style={styles.dayDate}>{day.date}</Text> : null}
            </View>

            {day.activities.length === 0 ? (
              <View style={styles.noActivities}>
                <Text style={styles.noActText}>No activities planned</Text>
              </View>
            ) : (
              day.activities.sort((a, b) => a.time.localeCompare(b.time)).map((act, idx) => (
                <View key={act.id} style={styles.activityRow}>
                  <View style={styles.timelineCol}>
                    <View style={[styles.timelineDot, { backgroundColor: activityColor(act.type) + '20' }]}>
                      <Ionicons name={activityIcon(act.type) as any} size={16} color={activityColor(act.type)} />
                    </View>
                    {idx < day.activities.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTime}>{act.time}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: activityColor(act.type) + '15' }]}>
                        <Text style={[styles.typeText, { color: activityColor(act.type) }]}>{act.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.activityTitle}>{act.title || 'Untitled'}</Text>
                    {act.location ? (
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                        <Text style={styles.locationText}>{act.location}</Text>
                      </View>
                    ) : null}
                    {act.description ? <Text style={styles.activityDesc}>{act.description}</Text> : null}
                  </View>
                </View>
              ))
            )}
          </View>
        ))}
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
  topCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  itTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.primary },
  itDest: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 4 },
  itBooking: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.accent, marginTop: 6 },
  itMeta: { flexDirection: 'row', gap: 12, marginTop: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  metaText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  daySection: { marginBottom: 24 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  dayBadge: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  dayBadgeText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  dayDate: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  noActivities: { backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 20, alignItems: 'center' },
  noActText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  activityRow: { flexDirection: 'row' },
  timelineCol: { width: 40, alignItems: 'center' },
  timelineDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.borderLight, marginVertical: 4 },
  activityCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginLeft: 10, marginBottom: 8, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  activityTime: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.primary },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
  activityTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  activityDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
});
