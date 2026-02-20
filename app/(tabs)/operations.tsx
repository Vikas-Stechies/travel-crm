import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/lib/data-context';
import { isPast, formatDate } from '@/lib/helpers';
import type { Task } from '@/lib/types';

type OpsTab = 'tasks' | 'vendors' | 'rooms';

const TASK_CATEGORIES = [
  { key: 'visa', label: 'Visa', icon: 'document-outline' },
  { key: 'ticket', label: 'Ticket', icon: 'airplane-outline' },
  { key: 'briefing', label: 'Briefing', icon: 'chatbubble-outline' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
] as const;

const COLUMNS = [
  { key: 'todo' as const, label: 'To Do', color: Colors.textSecondary },
  { key: 'in_progress' as const, label: 'In Progress', color: Colors.warning },
  { key: 'done' as const, label: 'Done', color: Colors.success },
];

export default function OperationsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const { tasks, updateTask, vendors, hotelRooms, bookings, isLoading } = useData();
  const [activeTab, setActiveTab] = useState<OpsTab>('tasks');
  const [selectedColumn, setSelectedColumn] = useState<'todo' | 'in_progress' | 'done'>('todo');

  const moveTask = useCallback(async (task: Task, newStatus: Task['status']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateTask({ ...task, status: newStatus });
  }, [updateTask]);

  const columnTasks = useMemo(() => {
    return tasks.filter(t => t.status === selectedColumn)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, selectedColumn]);

  if (isLoading) {
    return <View style={[styles.center, { paddingTop: insets.top + webTopInset }]}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Operations</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {activeTab === 'tasks' && (
            <Pressable onPress={() => router.push('/add-task')} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <Ionicons name="add-circle" size={26} color={Colors.accent} />
            </Pressable>
          )}
          {activeTab === 'vendors' && (
            <Pressable onPress={() => router.push('/add-vendor')} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <Ionicons name="add-circle" size={26} color={Colors.accent} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.tabRow}>
        {([
          { key: 'tasks' as const, label: 'Task Board', icon: 'checkbox-outline' },
          { key: 'vendors' as const, label: 'Vendors', icon: 'business-outline' },
          { key: 'rooms' as const, label: 'Rooms', icon: 'bed-outline' },
        ]).map(t => (
          <Pressable key={t.key} onPress={() => setActiveTab(t.key)}
            style={[styles.tabItem, activeTab === t.key && styles.tabItemActive]}>
            <Ionicons name={t.icon as any} size={16} color={activeTab === t.key ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.tabItemText, activeTab === t.key && styles.tabItemTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'tasks' && (
        <View style={{ flex: 1 }}>
          <View style={styles.columnRow}>
            {COLUMNS.map(col => {
              const count = tasks.filter(t => t.status === col.key).length;
              return (
                <Pressable key={col.key} onPress={() => setSelectedColumn(col.key)}
                  style={[styles.columnTab, selectedColumn === col.key && { backgroundColor: col.color + '20', borderColor: col.color }]}>
                  <View style={[styles.columnDot, { backgroundColor: col.color }]} />
                  <Text style={[styles.columnLabel, selectedColumn === col.key && { color: col.color }]}>{col.label}</Text>
                  <Text style={[styles.columnCount, selectedColumn === col.key && { color: col.color }]}>{count}</Text>
                </Pressable>
              );
            })}
          </View>

          <FlatList
            data={columnTasks}
            keyExtractor={item => item.id}
            scrollEnabled={!!columnTasks.length}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="checkbox-outline" size={40} color={Colors.textLight} />
                <Text style={styles.emptyText}>No tasks in this column</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const isOverdue = item.status !== 'done' && isPast(item.dueDate);
              const catInfo = TASK_CATEGORIES.find(c => c.key === item.category);
              const booking = item.bookingId ? bookings.find(b => b.id === item.bookingId) : null;
              return (
                <View style={[styles.taskCard, isOverdue && styles.taskOverdue]}>
                  <View style={styles.taskTop}>
                    <View style={[styles.taskCatBadge, { backgroundColor: item.category === 'visa' ? '#EBF5FB' : item.category === 'ticket' ? '#FEF9E7' : item.category === 'briefing' ? '#E8F8F5' : Colors.surfaceAlt }]}>
                      <Ionicons name={(catInfo?.icon || 'ellipsis-horizontal-outline') as any} size={14} color={Colors.primary} />
                      <Text style={styles.taskCatText}>{catInfo?.label || 'Other'}</Text>
                    </View>
                    {isOverdue && (
                      <View style={styles.overdueBadge}>
                        <Text style={styles.overdueText}>OVERDUE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}
                  <View style={styles.taskMeta}>
                    {item.assignee ? (
                      <View style={styles.metaChip}>
                        <Feather name="user" size={12} color={Colors.textSecondary} />
                        <Text style={styles.metaChipText}>{item.assignee}</Text>
                      </View>
                    ) : null}
                    {booking && (
                      <View style={styles.metaChip}>
                        <Feather name="briefcase" size={12} color={Colors.textSecondary} />
                        <Text style={styles.metaChipText}>{booking.tripName}</Text>
                      </View>
                    )}
                    <View style={styles.metaChip}>
                      <Feather name="calendar" size={12} color={isOverdue ? Colors.danger : Colors.textSecondary} />
                      <Text style={[styles.metaChipText, isOverdue && { color: Colors.danger }]}>{formatDate(item.dueDate)}</Text>
                    </View>
                  </View>
                  <View style={styles.taskActions}>
                    {item.status !== 'todo' && (
                      <Pressable onPress={() => moveTask(item, item.status === 'done' ? 'in_progress' : 'todo')} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
                        <Feather name="arrow-left" size={16} color={Colors.textSecondary} />
                      </Pressable>
                    )}
                    {item.status !== 'done' && (
                      <Pressable onPress={() => moveTask(item, item.status === 'todo' ? 'in_progress' : 'done')} style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, pressed && { opacity: 0.6 }]}>
                        <Feather name={item.status === 'in_progress' ? 'check' : 'arrow-right'} size={16} color="#fff" />
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}

      {activeTab === 'vendors' && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} contentInsetAdjustmentBehavior="automatic">
          {vendors.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={40} color={Colors.textLight} />
              <Text style={styles.emptyText}>No vendors added</Text>
              <Pressable onPress={() => router.push('/add-vendor')} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Add Vendor</Text>
              </Pressable>
            </View>
          ) : (
            vendors.map(v => (
              <View key={v.id} style={styles.vendorCard}>
                <View style={[styles.vendorIcon, { backgroundColor: v.type === 'hotel' ? '#EBF5FB' : v.type === 'transport' ? '#FEF9E7' : v.type === 'guide' ? '#E8F8F5' : Colors.surfaceAlt }]}>
                  <Ionicons name={v.type === 'hotel' ? 'bed-outline' : v.type === 'transport' ? 'car-outline' : v.type === 'guide' ? 'person-outline' : 'business-outline'} size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vendorName}>{v.name}</Text>
                  <Text style={styles.vendorType}>{v.type.charAt(0).toUpperCase() + v.type.slice(1)} | {v.location}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                    {v.phone ? <View style={styles.vendorContact}><Feather name="phone" size={12} color={Colors.accent} /><Text style={styles.vendorContactText}>{v.phone}</Text></View> : null}
                    {v.email ? <View style={styles.vendorContact}><Feather name="mail" size={12} color={Colors.accent} /><Text style={styles.vendorContactText}>{v.email}</Text></View> : null}
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {activeTab === 'rooms' && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} contentInsetAdjustmentBehavior="automatic">
          {hotelRooms.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bed-outline" size={40} color={Colors.textLight} />
              <Text style={styles.emptyText}>No rooms configured</Text>
              <Text style={[styles.emptyText, { fontSize: 13 }]}>Add hotels as vendors first, then manage rooms</Text>
            </View>
          ) : (
            hotelRooms.map(room => {
              const hotel = vendors.find(v => v.id === room.vendorId);
              return (
                <View key={room.id} style={styles.roomCard}>
                  <View style={styles.roomHeader}>
                    <View>
                      <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
                      <Text style={styles.roomType}>{room.type} | {hotel?.name || 'Unknown Hotel'}</Text>
                    </View>
                    <View style={[styles.roomStatus, { backgroundColor: room.allocations.length > 0 ? Colors.warningLight : Colors.successLight }]}>
                      <Text style={[styles.roomStatusText, { color: room.allocations.length > 0 ? Colors.warning : Colors.success }]}>
                        {room.allocations.length > 0 ? 'Occupied' : 'Available'}
                      </Text>
                    </View>
                  </View>
                  {room.allocations.map(a => {
                    const booking = bookings.find(b => b.id === a.bookingId);
                    return (
                      <View key={a.id} style={styles.allocationRow}>
                        <Feather name="user" size={14} color={Colors.textSecondary} />
                        <Text style={styles.allocationText}>{a.guestName}</Text>
                        <Text style={styles.allocationDate}>{formatDate(a.checkIn)} - {formatDate(a.checkOut)}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.primary },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  tabItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceAlt, gap: 6 },
  tabItemActive: { backgroundColor: Colors.primary },
  tabItemText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  tabItemTextActive: { color: '#fff' },
  columnRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  columnTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.surfaceAlt, gap: 6, borderWidth: 1, borderColor: 'transparent' },
  columnDot: { width: 8, height: 8, borderRadius: 4 },
  columnLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  columnCount: { fontSize: 12, fontFamily: 'Inter_700Bold', color: Colors.textSecondary },
  taskCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  taskOverdue: { borderLeftWidth: 3, borderLeftColor: Colors.danger },
  taskTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskCatBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  taskCatText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  overdueBadge: { backgroundColor: Colors.dangerLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  overdueText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: Colors.danger },
  taskTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  taskDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 4 },
  taskMeta: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  metaChipText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  taskActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  actionBtnPrimary: { backgroundColor: Colors.accent },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textLight },
  emptyButton: { backgroundColor: Colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  emptyButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  vendorCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, gap: 14, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  vendorIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  vendorName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  vendorType: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  vendorContact: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vendorContactText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  roomCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roomNumber: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.text },
  roomType: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  roomStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roomStatusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  allocationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  allocationText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.text, flex: 1 },
  allocationDate: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
});
