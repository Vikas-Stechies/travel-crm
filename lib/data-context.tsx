import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import * as Crypto from 'expo-crypto';
import { storage } from './storage';
import type {
  Client, Booking, Expense, Invoice, Vendor,
  HotelRoom, Task, Itinerary, PricingWorksheet, BudgetItem
} from './types';

interface DataContextValue {
  clients: Client[];
  bookings: Booking[];
  expenses: Expense[];
  invoices: Invoice[];
  vendors: Vendor[];
  hotelRooms: HotelRoom[];
  tasks: Task[];
  itineraries: Itinerary[];
  pricingWorksheets: PricingWorksheet[];
  budgetItems: BudgetItem[];
  isLoading: boolean;
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (c: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addBooking: (b: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  updateBooking: (b: Booking) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  addExpense: (e: Omit<Expense, 'id'>) => Promise<Expense>;
  updateExpense: (e: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addInvoice: (i: Omit<Invoice, 'id' | 'createdAt'>) => Promise<Invoice>;
  updateInvoice: (i: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addVendor: (v: Omit<Vendor, 'id'>) => Promise<Vendor>;
  updateVendor: (v: Vendor) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addHotelRoom: (r: Omit<HotelRoom, 'id'>) => Promise<HotelRoom>;
  updateHotelRoom: (r: HotelRoom) => Promise<void>;
  deleteHotelRoom: (id: string) => Promise<void>;
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (t: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addItinerary: (i: Omit<Itinerary, 'id' | 'createdAt'>) => Promise<Itinerary>;
  updateItinerary: (i: Itinerary) => Promise<void>;
  deleteItinerary: (id: string) => Promise<void>;
  addPricingWorksheet: (p: Omit<PricingWorksheet, 'id' | 'createdAt'>) => Promise<PricingWorksheet>;
  updatePricingWorksheet: (p: PricingWorksheet) => Promise<void>;
  deletePricingWorksheet: (id: string) => Promise<void>;
  addBudgetItem: (b: Omit<BudgetItem, 'id'>) => Promise<BudgetItem>;
  updateBudgetItem: (b: BudgetItem) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [pricingWorksheets, setPricingWorksheets] = useState<PricingWorksheet[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const [c, b, e, i, v, h, t, it, p, bi] = await Promise.all([
      storage.clients.getAll(),
      storage.bookings.getAll(),
      storage.expenses.getAll(),
      storage.invoices.getAll(),
      storage.vendors.getAll(),
      storage.hotelRooms.getAll(),
      storage.tasks.getAll(),
      storage.itineraries.getAll(),
      storage.pricingWorksheets.getAll(),
      storage.budgetItems.getAll(),
    ]);
    setClients(c); setBookings(b); setExpenses(e); setInvoices(i);
    setVendors(v); setHotelRooms(h); setTasks(t); setItineraries(it);
    setPricingWorksheets(p); setBudgetItems(bi);
    setIsLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const addClient = useCallback(async (c: Omit<Client, 'id' | 'createdAt'>) => {
    const item: Client = { ...c, id: Crypto.randomUUID(), createdAt: new Date().toISOString() };
    const next = [...clients, item];
    setClients(next);
    await storage.clients.save(next);
    return item;
  }, [clients]);

  const updateClient = useCallback(async (c: Client) => {
    const next = clients.map(x => x.id === c.id ? c : x);
    setClients(next);
    await storage.clients.save(next);
  }, [clients]);

  const deleteClient = useCallback(async (id: string) => {
    const next = clients.filter(x => x.id !== id);
    setClients(next);
    await storage.clients.save(next);
  }, [clients]);

  const addBooking = useCallback(async (b: Omit<Booking, 'id' | 'createdAt'>) => {
    const item: Booking = { ...b, id: Crypto.randomUUID(), createdAt: new Date().toISOString() };
    const next = [...bookings, item];
    setBookings(next);
    await storage.bookings.save(next);
    return item;
  }, [bookings]);

  const updateBooking = useCallback(async (b: Booking) => {
    const next = bookings.map(x => x.id === b.id ? b : x);
    setBookings(next);
    await storage.bookings.save(next);
  }, [bookings]);

  const deleteBooking = useCallback(async (id: string) => {
    const next = bookings.filter(x => x.id !== id);
    setBookings(next);
    await storage.bookings.save(next);
  }, [bookings]);

  const addExpense = useCallback(async (e: Omit<Expense, 'id'>) => {
    const item: Expense = { ...e, id: Crypto.randomUUID() };
    const next = [...expenses, item];
    setExpenses(next);
    await storage.expenses.save(next);
    return item;
  }, [expenses]);

  const updateExpense = useCallback(async (e: Expense) => {
    const next = expenses.map(x => x.id === e.id ? e : x);
    setExpenses(next);
    await storage.expenses.save(next);
  }, [expenses]);

  const deleteExpense = useCallback(async (id: string) => {
    const next = expenses.filter(x => x.id !== id);
    setExpenses(next);
    await storage.expenses.save(next);
  }, [expenses]);

  const addInvoice = useCallback(async (i: Omit<Invoice, 'id' | 'createdAt'>) => {
    const item: Invoice = { ...i, id: Crypto.randomUUID(), createdAt: new Date().toISOString() };
    const next = [...invoices, item];
    setInvoices(next);
    await storage.invoices.save(next);
    return item;
  }, [invoices]);

  const updateInvoice = useCallback(async (i: Invoice) => {
    const next = invoices.map(x => x.id === i.id ? i : x);
    setInvoices(next);
    await storage.invoices.save(next);
  }, [invoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    const next = invoices.filter(x => x.id !== id);
    setInvoices(next);
    await storage.invoices.save(next);
  }, [invoices]);

  const addVendor = useCallback(async (v: Omit<Vendor, 'id'>) => {
    const item: Vendor = { ...v, id: Crypto.randomUUID() };
    const next = [...vendors, item];
    setVendors(next);
    await storage.vendors.save(next);
    return item;
  }, [vendors]);

  const updateVendor = useCallback(async (v: Vendor) => {
    const next = vendors.map(x => x.id === v.id ? v : x);
    setVendors(next);
    await storage.vendors.save(next);
  }, [vendors]);

  const deleteVendor = useCallback(async (id: string) => {
    const next = vendors.filter(x => x.id !== id);
    setVendors(next);
    await storage.vendors.save(next);
  }, [vendors]);

  const addHotelRoom = useCallback(async (r: Omit<HotelRoom, 'id'>) => {
    const item: HotelRoom = { ...r, id: Crypto.randomUUID() };
    const next = [...hotelRooms, item];
    setHotelRooms(next);
    await storage.hotelRooms.save(next);
    return item;
  }, [hotelRooms]);

  const updateHotelRoom = useCallback(async (r: HotelRoom) => {
    const next = hotelRooms.map(x => x.id === r.id ? r : x);
    setHotelRooms(next);
    await storage.hotelRooms.save(next);
  }, [hotelRooms]);

  const deleteHotelRoom = useCallback(async (id: string) => {
    const next = hotelRooms.filter(x => x.id !== id);
    setHotelRooms(next);
    await storage.hotelRooms.save(next);
  }, [hotelRooms]);

  const addTask = useCallback(async (t: Omit<Task, 'id' | 'createdAt'>) => {
    const item: Task = { ...t, id: Crypto.randomUUID(), createdAt: new Date().toISOString() };
    const next = [...tasks, item];
    setTasks(next);
    await storage.tasks.save(next);
    return item;
  }, [tasks]);

  const updateTask = useCallback(async (t: Task) => {
    const next = tasks.map(x => x.id === t.id ? t : x);
    setTasks(next);
    await storage.tasks.save(next);
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    const next = tasks.filter(x => x.id !== id);
    setTasks(next);
    await storage.tasks.save(next);
  }, [tasks]);

  const addItinerary = useCallback(async (i: Omit<Itinerary, 'id' | 'createdAt'>) => {
    const item: Itinerary = { ...i, id: Crypto.randomUUID(), createdAt: new Date().toISOString() };
    const next = [...itineraries, item];
    setItineraries(next);
    await storage.itineraries.save(next);
    return item;
  }, [itineraries]);

  const updateItinerary = useCallback(async (i: Itinerary) => {
    const next = itineraries.map(x => x.id === i.id ? i : x);
    setItineraries(next);
    await storage.itineraries.save(next);
  }, [itineraries]);

  const deleteItinerary = useCallback(async (id: string) => {
    const next = itineraries.filter(x => x.id !== id);
    setItineraries(next);
    await storage.itineraries.save(next);
  }, [itineraries]);

  const addPricingWorksheet = useCallback(async (p: Omit<PricingWorksheet, 'id' | 'createdAt'>) => {
    const item: PricingWorksheet = { ...p, id: Crypto.randomUUID(), createdAt: new Date().toISOString() };
    const next = [...pricingWorksheets, item];
    setPricingWorksheets(next);
    await storage.pricingWorksheets.save(next);
    return item;
  }, [pricingWorksheets]);

  const updatePricingWorksheet = useCallback(async (p: PricingWorksheet) => {
    const next = pricingWorksheets.map(x => x.id === p.id ? p : x);
    setPricingWorksheets(next);
    await storage.pricingWorksheets.save(next);
  }, [pricingWorksheets]);

  const deletePricingWorksheet = useCallback(async (id: string) => {
    const next = pricingWorksheets.filter(x => x.id !== id);
    setPricingWorksheets(next);
    await storage.pricingWorksheets.save(next);
  }, [pricingWorksheets]);

  const addBudgetItem = useCallback(async (b: Omit<BudgetItem, 'id'>) => {
    const item: BudgetItem = { ...b, id: Crypto.randomUUID() };
    const next = [...budgetItems, item];
    setBudgetItems(next);
    await storage.budgetItems.save(next);
    return item;
  }, [budgetItems]);

  const updateBudgetItem = useCallback(async (b: BudgetItem) => {
    const next = budgetItems.map(x => x.id === b.id ? b : x);
    setBudgetItems(next);
    await storage.budgetItems.save(next);
  }, [budgetItems]);

  const deleteBudgetItem = useCallback(async (id: string) => {
    const next = budgetItems.filter(x => x.id !== id);
    setBudgetItems(next);
    await storage.budgetItems.save(next);
  }, [budgetItems]);

  const value = useMemo(() => ({
    clients, bookings, expenses, invoices, vendors, hotelRooms, tasks,
    itineraries, pricingWorksheets, budgetItems, isLoading, reload,
    addClient, updateClient, deleteClient,
    addBooking, updateBooking, deleteBooking,
    addExpense, updateExpense, deleteExpense,
    addInvoice, updateInvoice, deleteInvoice,
    addVendor, updateVendor, deleteVendor,
    addHotelRoom, updateHotelRoom, deleteHotelRoom,
    addTask, updateTask, deleteTask,
    addItinerary, updateItinerary, deleteItinerary,
    addPricingWorksheet, updatePricingWorksheet, deletePricingWorksheet,
    addBudgetItem, updateBudgetItem, deleteBudgetItem,
  }), [clients, bookings, expenses, invoices, vendors, hotelRooms, tasks,
    itineraries, pricingWorksheets, budgetItems, isLoading, reload,
    addClient, updateClient, deleteClient,
    addBooking, updateBooking, deleteBooking,
    addExpense, updateExpense, deleteExpense,
    addInvoice, updateInvoice, deleteInvoice,
    addVendor, updateVendor, deleteVendor,
    addHotelRoom, updateHotelRoom, deleteHotelRoom,
    addTask, updateTask, deleteTask,
    addItinerary, updateItinerary, deleteItinerary,
    addPricingWorksheet, updatePricingWorksheet, deletePricingWorksheet,
    addBudgetItem, updateBudgetItem, deleteBudgetItem]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
