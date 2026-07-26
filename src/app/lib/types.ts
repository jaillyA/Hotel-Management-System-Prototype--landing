export type RoomType = "Standard" | "Luxo" | "Suite" | "Presidencial";
export type RoomStatus = "disponivel" | "ocupado" | "manutencao" | "reservado";

export interface Room {
  id: number;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  price: number;
  amenities: string[];
  img: string | null;
}

export interface RoomInput {
  number: string;
  floor: number;
  type: RoomType;
  status?: RoomStatus;
  capacity: number;
  price: number;
  amenities: string[];
  img?: string | null;
}

export interface RoomCatalogEntry extends Room {
  available: boolean;
  available_from: string | null;
}

export interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  city: string | null;
  rating: number;
  stays: number;
  last_stay: string | null;
}

export interface GuestInput {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  city?: string | null;
  rating?: number;
}

export type ReservationStatus = "confirmada" | "pendente" | "cancelada" | "checkout";

export interface Reservation {
  id: number;
  code: string;
  guest_id: number;
  room_id: number;
  guest_name: string;
  guest_cpf: string;
  room_number: string;
  room_type: RoomType;
  checkin: string;
  checkout: string;
  guests: number;
  status: ReservationStatus;
  total: number;
  nights: number;
}

export type StaffRole = "administrador" | "gerente" | "recepcionista" | "governanta";
export type StaffStatus = "ativo" | "inativo";

export interface Staff {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string | null;
  role: StaffRole;
  department: string | null;
  status: StaffStatus;
  since: string;
}

export interface StaffInput {
  name: string;
  email: string;
  cpf: string;
  phone?: string | null;
  role: StaffRole;
  department?: string | null;
  since: string;
  password?: string;
  status?: StaffStatus;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  available: boolean;
  used: number;
}

export interface ServiceInput {
  name: string;
  category: string;
  price: number;
  unit: string;
  available?: boolean;
}

export interface DashboardStats {
  occupancy_rate: number;
  occupied_rooms: number;
  total_rooms: number;
  revenue_month: number;
  reservations_count: number;
  guests_count: number;
}

export interface RevenuePoint {
  month: string;
  receita: number;
}

export interface OccupancyPoint {
  day: string;
  occupancy_rate: number;
}

export interface Invoice {
  id: number;
  reservation_code: string;
  guest_name: string;
  amount: number;
  kind: "reserva" | "cancelamento";
  status: string;
  created_at: string;
}

export interface Consumption {
  id: number;
  service_id: number;
  service_name: string;
  unit_price: number;
  quantity: number;
  total: number;
  created_at: string;
}

export interface BackupFile {
  filename: string;
  size_bytes: number;
  created_at: string;
}

export type ReportType = "rooms" | "guests" | "reservations" | "financial" | "services" | "staff";
export const PERIOD_REPORTS: ReportType[] = ["reservations", "financial", "services"];

export type PaymentMethod = "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | "transferencia";

export interface Payment {
  id: number;
  reservation_code: string;
  amount: number;
  payment_method: PaymentMethod;
  status: string;
  created_at: string;
}
