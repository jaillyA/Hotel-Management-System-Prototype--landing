import { useEffect, useState } from "react";
import {
  LayoutDashboard, BedDouble, Users, CalendarCheck, UserCog, DollarSign,
  BarChart3, Wrench, Settings, LogOut, Bell, Search, Menu,
} from "lucide-react";

import { GOLD, NAVY, sans, serif } from "../theme";
import { setUnauthorizedHandler } from "../lib/api";
import type { StaffRole } from "../lib/types";
import { StaffAuthProvider } from "./AuthContext";
import { DashboardView } from "./views/DashboardView";
import { RoomsView } from "./views/RoomsView";
import { GuestsView } from "./views/GuestsView";
import { ReservationsView } from "./views/ReservationsView";
import { StaffView } from "./views/StaffView";
import { FinanceView } from "./views/FinanceView";
import { ReportsView } from "./views/ReportsView";
import { ServicesView } from "./views/ServicesView";
import { ConfigView } from "./views/ConfigView";

type StaffPage = "dashboard" | "quartos" | "hospedes" | "reservas" | "funcionarios" | "financeiro" | "relatorios" | "servicos" | "configuracoes";

const sideNav: { id: StaffPage; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
  { id: "quartos", label: "Quartos", icon: <BedDouble size={15} /> },
  { id: "hospedes", label: "Hóspedes", icon: <Users size={15} /> },
  { id: "reservas", label: "Reservas", icon: <CalendarCheck size={15} /> },
  { id: "funcionarios", label: "Funcionários", icon: <UserCog size={15} /> },
  { id: "financeiro", label: "Financeiro", icon: <DollarSign size={15} /> },
  { id: "relatorios", label: "Relatórios", icon: <BarChart3 size={15} /> },
  { id: "servicos", label: "Serviços", icon: <Wrench size={15} /> },
  { id: "configuracoes", label: "Config.", icon: <Settings size={15} /> },
];

export function StaffPortal({ role, onLogout }: { role: StaffRole; onLogout: () => void }) {
  const [view, setView] = useState<StaffPage>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setUnauthorizedHandler(onLogout);
    return () => setUnauthorizedHandler(null);
  }, [onLogout]);

  const renderView = () => {
    switch (view) {
      case "dashboard": return <DashboardView />;
      case "quartos": return <RoomsView query={query} />;
      case "hospedes": return <GuestsView />;
      case "reservas": return <ReservationsView />;
      case "funcionarios": return <StaffView />;
      case "financeiro": return <FinanceView />;
      case "relatorios": return <ReportsView />;
      case "servicos": return <ServicesView />;
      case "configuracoes": return <ConfigView />;
    }
  };

  return (
    <StaffAuthProvider value={{ role, logout: onLogout }}>
      <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: sans }}>
        <aside className={`flex flex-col w-52 flex-shrink-0 z-20 fixed inset-y-0 left-0 lg:relative transition-transform duration-300 ${sideOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
          style={{ backgroundColor: NAVY }}>
          <div className="px-4 py-4 border-b border-white/5 flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: GOLD }}>
              <LayoutDashboard size={13} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white" style={{ fontFamily: serif }}>Grand Palácio</p>
              <p className="text-[10px] text-white/35 uppercase tracking-widest">Staff</p>
            </div>
          </div>
          <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
            {sideNav.map((item) => (
              <button key={item.id} onClick={() => { setView(item.id); setSideOpen(false); setQuery(""); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: view === item.id ? "#1E2D4A" : "transparent", color: view === item.id ? "white" : "rgba(200,194,180,0.65)" }}>
                <span style={{ color: view === item.id ? GOLD : undefined }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="px-2 py-3 border-t border-white/5">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: GOLD }}>
                {role.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate capitalize">{role}</p>
              </div>
              <button onClick={onLogout} className="p-1 rounded hover:bg-white/10 text-white/35 hover:text-white transition-colors"><LogOut size={13} /></button>
            </div>
          </div>
        </aside>

        {sideOpen && <div className="fixed inset-0 bg-black/40 z-10 lg:hidden" onClick={() => setSideOpen(false)} />}

        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between px-5 py-3 bg-card border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-1.5 rounded hover:bg-muted transition-colors" onClick={() => setSideOpen(true)}><Menu size={16} className="text-foreground" /></button>
              <div className="relative hidden sm:block">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={view === "quartos" ? "Buscar por número ou tipo..." : "Buscar..."}
                  disabled={view !== "quartos"}
                  title={view !== "quartos" ? "Disponível na tela de Quartos" : undefined}
                  className="pl-8 pr-4 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-48 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell size={15} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: GOLD }}>
                {role.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-5">{renderView()}</main>
        </div>
      </div>
    </StaffAuthProvider>
  );
}
