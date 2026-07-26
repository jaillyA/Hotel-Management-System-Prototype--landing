import { useEffect, useState } from "react";
import { BedDouble, CalendarPlus, CalendarSearch, CheckCircle2, ChevronRight, Eye, LogOut, Search, X } from "lucide-react";

import { NAVY, serif } from "../../theme";
import { GoldBtn, ResBadge, SHeader, formatDateBR, inputClass, labelClass, resStatusCfg } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Reservation, ReservationStatus, RoomCatalogEntry } from "../../lib/types";
import { CreateReservationModal } from "../modals/CreateReservationModal";
import { ReservationServicesModal } from "../modals/ReservationServicesModal";
import { useStaffAuth } from "../AuthContext";

export function ReservationsView() {
  const { role } = useStaffAuth();
  const canManage = role === "administrador" || role === "gerente" || role === "recepcionista";

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tab, setTab] = useState<ReservationStatus | "todas">("todas");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Reservation | null>(null);

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availCheckin, setAvailCheckin] = useState("");
  const [availCheckout, setAvailCheckout] = useState("");
  const [availPax, setAvailPax] = useState(1);
  const [availResults, setAvailResults] = useState<RoomCatalogEntry[] | null>(null);
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);
  const [bookingRoom, setBookingRoom] = useState<RoomCatalogEntry | null>(null);

  function refetch() {
    setLoading(true);
    api.reservations
      .list(tab === "todas" ? undefined : tab)
      .then(setReservations)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar as reservas."))
      .finally(() => setLoading(false));
  }

  useEffect(refetch, [tab]);

  async function handleStatusChange(reservation: Reservation, status: ReservationStatus, confirmMsg: string) {
    if (!confirm(confirmMsg)) return;
    try {
      await api.reservations.update(reservation.id, { status });
      refetch();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível atualizar a reserva.");
    }
  }

  async function handleSearchAvailability() {
    if (!availCheckin || !availCheckout) {
      setAvailError("Selecione as datas de check-in e check-out.");
      return;
    }
    if (availCheckout <= availCheckin) {
      setAvailError("O check-out deve ser depois do check-in.");
      return;
    }
    setAvailLoading(true);
    setAvailError(null);
    try {
      const results = await api.rooms.catalog(availCheckin, availCheckout, availPax);
      setAvailResults(results);
    } catch (err) {
      setAvailError(err instanceof ApiError ? err.message : "Não foi possível consultar a disponibilidade.");
    } finally {
      setAvailLoading(false);
    }
  }

  const filtered = reservations.filter((r) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    const needleDigits = q.replace(/\D/g, "");
    return (
      r.guest_name.toLowerCase().includes(needle) ||
      r.code.toLowerCase().includes(needle) ||
      r.room_number.toLowerCase().includes(needle) ||
      (needleDigits.length > 0 && r.guest_cpf.replace(/\D/g, "").includes(needleDigits))
    );
  });

  return (
    <div>
      <SHeader
        title="Reservas"
        sub="Gestão completa"
        action={
          <button
            onClick={() => setAvailabilityOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-muted transition-colors"
          >
            <CalendarSearch size={13} />
            {availabilityOpen ? "Fechar busca" : "Verificar Disponibilidade"}
          </button>
        }
      />

      {availabilityOpen && (
        <div className="bg-card rounded-lg border border-border p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className={labelClass}>Check-in</label>
              <input type="date" value={availCheckin} onChange={(e) => setAvailCheckin(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Check-out</label>
              <input type="date" value={availCheckout} onChange={(e) => setAvailCheckout(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hóspedes</label>
              <input type="number" min={1} value={availPax} onChange={(e) => setAvailPax(Math.max(1, Number(e.target.value)))} className={inputClass} />
            </div>
            <GoldBtn onClick={handleSearchAvailability} disabled={availLoading} sm>
              <Search size={13} />
              {availLoading ? "Buscando..." : "Buscar"}
            </GoldBtn>
          </div>
          {availError && <p className="text-xs text-red-500 mt-2">{availError}</p>}

          {availResults && (
            <div className="mt-4 space-y-1.5 max-h-72 overflow-y-auto">
              {availResults.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhum quarto encontrado para esses critérios.</p>
              ) : (
                availResults.map((room) => (
                  <div key={room.id} className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <BedDouble size={13} className="text-muted-foreground" />
                      <span className="font-medium">{room.type} — {room.number}</span>
                      <span className="text-xs text-muted-foreground">Cap. {room.capacity}</span>
                    </div>
                    {room.available ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium" style={{ color: "#3d8c6e" }}>Disponível · R$ {room.price}/noite</span>
                        {canManage && (
                          <button
                            onClick={() => setBookingRoom(room)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-white hover:brightness-110 transition-all"
                            style={{ backgroundColor: NAVY }}
                          >
                            <CalendarPlus size={12} />Reservar
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-medium" style={{ color: "#B83232" }}>
                        {room.available_from ? `Indisponível — a partir de ${formatDateBR(room.available_from)}` : "Em manutenção"}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit flex-wrap">
          {(["todas", "confirmada", "pendente", "cancelada", "checkout"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "todas" ? "Todas" : resStatusCfg[t].label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por hóspede, CPF, código ou quarto..."
            className="w-full pl-8 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
      </div>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando reservas...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma reserva encontrada.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const isTerminal = r.status === "cancelada" || r.status === "checkout";
            return (
              <div key={r.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: NAVY }}>{r.room_number}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap"><p className="font-medium text-foreground text-sm">{r.guest_name}</p><span className="text-xs text-muted-foreground">{r.code}</span><ResBadge status={r.status} /></div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.room_type} · {r.guests} hóspede{r.guests > 1 ? "s" : ""} · {r.nights} noites</p>
                      <div className="flex items-center gap-2 mt-1"><span className="text-xs text-muted-foreground">In: <strong className="text-foreground">{r.checkin}</strong></span><ChevronRight size={11} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">Out: <strong className="text-foreground">{r.checkout}</strong></span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right"><p className="text-base font-bold text-foreground" style={{ fontFamily: serif }}>R$ {r.total.toLocaleString("pt-BR")}</p></div>
                    <div className="flex gap-1">
                      <button onClick={() => setViewing(r)} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors" title="Serviços consumidos"><Eye size={13} /></button>
                      {canManage && !isTerminal && (
                        <>
                          {r.status === "pendente" && (
                            <button
                              onClick={() => handleStatusChange(r, "confirmada", `Ativar a reserva ${r.code}?`)}
                              title="Ativar reserva"
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors">
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(r, "checkout", `Encerrar a reserva ${r.code}?`)}
                            title="Encerrar reserva"
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <LogOut size={13} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(r, "cancelada", `Cancelar a reserva ${r.code}?`)}
                            title="Cancelar reserva"
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors">
                            <X size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {viewing && <ReservationServicesModal reservation={viewing} onClose={() => setViewing(null)} />}
      {bookingRoom && (
        <CreateReservationModal
          room={bookingRoom}
          checkin={availCheckin}
          checkout={availCheckout}
          guests={availPax}
          onClose={() => setBookingRoom(null)}
          onCreated={() => {
            setBookingRoom(null);
            refetch();
            handleSearchAvailability();
          }}
        />
      )}
    </div>
  );
}
