export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  pax: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  requirements: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  bookingId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  clientId: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'hotel' | 'transport' | 'guide' | 'other';
  contact: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
}

export interface HotelRoom {
  id: string;
  vendorId: string;
  roomNumber: string;
  type: string;
  allocations: RoomAllocation[];
}

export interface RoomAllocation {
  id: string;
  roomId: string;
  bookingId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'todo' | 'in_progress' | 'done';
  category: 'visa' | 'ticket' | 'briefing' | 'other';
  bookingId?: string;
  dueDate: string;
  createdAt: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string;
  activities: ItineraryActivity[];
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  type: 'transport' | 'activity' | 'meal' | 'accommodation' | 'free';
}

export interface Itinerary {
  id: string;
  bookingId?: string;
  title: string;
  destination: string;
  days: ItineraryDay[];
  createdAt: string;
}

export interface PricingWorksheet {
  id: string;
  tripName: string;
  destination: string;
  pax: number;
  costItems: CostItem[];
  markupPercent: number;
  notes: string;
  createdAt: string;
}

export interface CostItem {
  id: string;
  category: string;
  description: string;
  unitCost: number;
  quantity: number;
}

export interface BudgetItem {
  id: string;
  bookingId: string;
  category: string;
  budgetAmount: number;
  actualAmount: number;
}
