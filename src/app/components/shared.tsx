import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { GOLD, sans, serif } from "../theme";
import type { ReservationStatus, RoomStatus } from "../lib/types";

export const roomStatusCfg: Record<RoomStatus, { label: string; color: string; bg: string }> = {
  disponivel: { label: "Disponível", color: "#3d8c6e", bg: "#e8f5ee" },
  ocupado: { label: "Ocupado", color: "#B83232", bg: "#fdecea" },
  manutencao: { label: "Manutenção", color: "#e67e22", bg: "#fef3e2" },
  reservado: { label: "Reservado", color: "#2D5F8A", bg: "#e3f0f8" },
};

export const resStatusCfg: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  confirmada: { label: "Confirmada", color: "#3d8c6e", bg: "#e8f5ee" },
  pendente: { label: "Pendente", color: "#e67e22", bg: "#fef3e2" },
  cancelada: { label: "Cancelada", color: "#B83232", bg: "#fdecea" },
  checkout: { label: "Encerrada", color: "#6B6655", bg: "#f0ede7" },
};

export function RoomBadge({ status }: { status: RoomStatus }) {
  const c = roomStatusCfg[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: c.color, backgroundColor: c.bg }}
    >
      {c.label}
    </span>
  );
}

export function ResBadge({ status }: { status: ReservationStatus }) {
  const c = resStatusCfg[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: c.color, backgroundColor: c.bg }}
    >
      {c.label}
    </span>
  );
}

export function GoldBtn({
  children,
  onClick,
  full,
  lg,
  sm,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  full?: boolean;
  lg?: boolean;
  sm?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const pad = lg ? "px-8 py-4 text-base" : sm ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ backgroundColor: GOLD, fontFamily: sans }}
      className={`${pad} ${full ? "w-full" : ""} rounded font-semibold text-white tracking-wide hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none`}
    >
      {children}
    </button>
  );
}

export function OutlineBtn({
  children,
  onClick,
  dark,
  full,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  dark?: boolean;
  full?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ fontFamily: sans, borderColor: dark ? "rgba(255,255,255,0.35)" : "#162036", color: dark ? "white" : "#162036" }}
      className={`${full ? "w-full" : ""} px-6 py-3 rounded text-sm font-semibold border hover:bg-white/10 transition-all flex items-center justify-center gap-2`}
    >
      {children}
    </button>
  );
}

export function StatCard({
  title,
  value,
  sub,
  icon,
  trend,
  up,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  trend?: string;
  up?: boolean;
}) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#EFEBE3", color: GOLD }}
        >
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xl font-semibold text-foreground" style={{ fontFamily: serif }}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export function AddBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
      style={{ backgroundColor: GOLD, fontFamily: sans }}
    >
      <Plus size={13} />
      {label}
    </button>
  );
}

export function SHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: serif }}>
          {title}
        </h2>
        {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export const inputClass =
  "w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30";

export const labelClass = "text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5";

export function formatDateBR(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
