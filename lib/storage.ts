import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Client, Booking, Expense, Invoice, Vendor,
  HotelRoom, Task, Itinerary, PricingWorksheet, BudgetItem
} from './types';

const KEYS = {
  clients: '@tourops_clients',
  bookings: '@tourops_bookings',
  expenses: '@tourops_expenses',
  invoices: '@tourops_invoices',
  vendors: '@tourops_vendors',
  hotelRooms: '@tourops_hotel_rooms',
  tasks: '@tourops_tasks',
  itineraries: '@tourops_itineraries',
  pricingWorksheets: '@tourops_pricing_worksheets',
  budgetItems: '@tourops_budget_items',
};

async function getItems<T>(key: string): Promise<T[]> {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

async function setItems<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

export const storage = {
  clients: {
    getAll: () => getItems<Client>(KEYS.clients),
    save: (items: Client[]) => setItems(KEYS.clients, items),
  },
  bookings: {
    getAll: () => getItems<Booking>(KEYS.bookings),
    save: (items: Booking[]) => setItems(KEYS.bookings, items),
  },
  expenses: {
    getAll: () => getItems<Expense>(KEYS.expenses),
    save: (items: Expense[]) => setItems(KEYS.expenses, items),
  },
  invoices: {
    getAll: () => getItems<Invoice>(KEYS.invoices),
    save: (items: Invoice[]) => setItems(KEYS.invoices, items),
  },
  vendors: {
    getAll: () => getItems<Vendor>(KEYS.vendors),
    save: (items: Vendor[]) => setItems(KEYS.vendors, items),
  },
  hotelRooms: {
    getAll: () => getItems<HotelRoom>(KEYS.hotelRooms),
    save: (items: HotelRoom[]) => setItems(KEYS.hotelRooms, items),
  },
  tasks: {
    getAll: () => getItems<Task>(KEYS.tasks),
    save: (items: Task[]) => setItems(KEYS.tasks, items),
  },
  itineraries: {
    getAll: () => getItems<Itinerary>(KEYS.itineraries),
    save: (items: Itinerary[]) => setItems(KEYS.itineraries, items),
  },
  pricingWorksheets: {
    getAll: () => getItems<PricingWorksheet>(KEYS.pricingWorksheets),
    save: (items: PricingWorksheet[]) => setItems(KEYS.pricingWorksheets, items),
  },
  budgetItems: {
    getAll: () => getItems<BudgetItem>(KEYS.budgetItems),
    save: (items: BudgetItem[]) => setItems(KEYS.budgetItems, items),
  },
};
