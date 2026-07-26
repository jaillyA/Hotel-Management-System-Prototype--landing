import { loadSession } from "./auth";
import type {
  BackupFile,
  Consumption,
  DashboardStats,
  Guest,
  GuestInput,
  Invoice,
  OccupancyPoint,
  Payment,
  PaymentMethod,
  ReportType,
  Reservation,
  ReservationStatus,
  RevenuePoint,
  Room,
  RoomCatalogEntry,
  RoomInput,
  RoomStatus,
  RoomType,
  Service,
  ServiceInput,
  Staff,
  StaffInput,
} from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(fn: UnauthorizedHandler | null): void {
  unauthorizedHandler = fn;
}

async function extractDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join("; ");
    }
  } catch {
    // sem corpo JSON, usa o texto de status abaixo
  }
  return res.statusText || `Erro ${res.status}`;
}

function authHeaders(): Record<string, string> {
  const session = loadSession();
  return session ? { Authorization: `Bearer ${session.token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    },
  });

  if (res.status === 401) {
    unauthorizedHandler?.();
  }

  if (!res.ok) {
    throw new ApiError(await extractDetail(res), res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const usable = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (usable.length === 0) return "";
  const search = new URLSearchParams();
  usable.forEach(([key, value]) => search.set(key, String(value)));
  return `?${search.toString()}`;
}

async function downloadFile(path: string, filename: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (res.status === 401) unauthorizedHandler?.();
  if (!res.ok) throw new ApiError(await extractDetail(res), res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const REPORT_PATHS: Record<ReportType, { path: string; filename: string }> = {
  rooms: { path: "/reports/rooms", filename: "relatorio-quartos.csv" },
  guests: { path: "/reports/guests", filename: "relatorio-hospedes.csv" },
  reservations: { path: "/reports/reservations", filename: "relatorio-reservas.csv" },
  financial: { path: "/reports/financial", filename: "relatorio-financeiro.csv" },
  services: { path: "/reports/services", filename: "relatorio-servicos.csv" },
  staff: { path: "/reports/staff", filename: "relatorio-equipe.csv" },
};

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },

  rooms: {
    list: (status?: RoomStatus) => request<Room[]>(`/rooms${qs({ status_filter: status })}`),
    availability: (checkin: string, checkout: string, pax: number, type?: RoomType) =>
      request<Room[]>(`/rooms/availability${qs({ checkin, checkout, pax, type })}`),
    catalog: (checkin: string, checkout: string, pax: number, type?: RoomType) =>
      request<RoomCatalogEntry[]>(`/rooms/catalog${qs({ checkin, checkout, pax, type })}`),
    create: (data: RoomInput) => request<Room>("/rooms", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<RoomInput>) =>
      request<Room>(`/rooms/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/rooms/${id}`, { method: "DELETE" }),
  },

  guests: {
    list: (q?: string) => request<Guest[]>(`/guests${qs({ q })}`),
    create: (data: GuestInput) => request<Guest>("/guests", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<GuestInput>) =>
      request<Guest>(`/guests/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/guests/${id}`, { method: "DELETE" }),
    reservations: (id: number) => request<Reservation[]>(`/guests/${id}/reservations`),
  },

  reservations: {
    list: (status?: ReservationStatus) =>
      request<Reservation[]>(`/reservations${qs({ status_filter: status })}`),
    create: (data: { guest_id: number; room_id: number; checkin: string; checkout: string; guests: number }) =>
      request<Reservation>("/reservations", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { status?: ReservationStatus; checkin?: string; checkout?: string; guests?: number }) =>
      request<Reservation>(`/reservations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    services: {
      list: (reservationId: number) =>
        request<Consumption[]>(`/reservations/${reservationId}/services`),
      add: (reservationId: number, data: { service_id: number; quantity: number }) =>
        request<Consumption>(`/reservations/${reservationId}/services`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      remove: (reservationId: number, consumptionId: number) =>
        request<void>(`/reservations/${reservationId}/services/${consumptionId}`, { method: "DELETE" }),
    },
  },

  staff: {
    list: () => request<Staff[]>("/staff"),
    create: (data: StaffInput) => request<Staff>("/staff", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<StaffInput>) =>
      request<Staff>(`/staff/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/staff/${id}`, { method: "DELETE" }),
  },

  services: {
    list: () => request<Service[]>("/services"),
    create: (data: ServiceInput) => request<Service>("/services", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<ServiceInput>) =>
      request<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/services/${id}`, { method: "DELETE" }),
  },

  dashboard: {
    stats: () => request<DashboardStats>("/dashboard/stats"),
    revenue: () => request<RevenuePoint[]>("/dashboard/revenue"),
    occupancy: () => request<OccupancyPoint[]>("/dashboard/occupancy"),
  },

  finance: {
    invoices: () => request<Invoice[]>("/finance/invoices"),
    payments: () => request<Payment[]>("/finance/payments"),
    registerPayment: (data: { reservation_code: string; amount: number; payment_method: PaymentMethod }) =>
      request<Payment>("/finance/payments", { method: "POST", body: JSON.stringify(data) }),
  },

  system: {
    backups: () => request<BackupFile[]>("/system/backups"),
  },

  reports: {
    download: (type: ReportType, period?: { start: string; end: string }) => {
      const { path, filename } = REPORT_PATHS[type];
      return downloadFile(`${path}${qs({ start: period?.start, end: period?.end })}`, filename);
    },
  },

  guestPortal: {
    myReservations: (email: string) =>
      request<Reservation[]>(`/guest-portal/reservations${qs({ email })}`),
    createBooking: (data: {
      room_id: number;
      checkin: string;
      checkout: string;
      guests: number;
      guest_name: string;
      guest_email: string;
      guest_phone: string;
      guest_cpf: string;
    }) => request<Reservation>("/guest-portal/bookings", { method: "POST", body: JSON.stringify(data) }),
    cancel: (id: number, guestEmail: string) =>
      request<Reservation>(`/guest-portal/reservations/${id}/cancel${qs({ guest_email: guestEmail })}`, {
        method: "POST",
      }),
  },
};
