import { useEffect, useState } from "react";
import { Edit2, History, Search, Star, Trash2 } from "lucide-react";

import { GOLD } from "../../theme";
import { AddBtn, SHeader } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Guest } from "../../lib/types";
import { GuestFormModal } from "../modals/GuestFormModal";
import { GuestHistoryModal } from "../modals/GuestHistoryModal";
import { useStaffAuth } from "../AuthContext";

export function GuestsView() {
  const { role } = useStaffAuth();
  const canDelete = role === "administrador" || role === "gerente";

  const [guests, setGuests] = useState<Guest[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Guest | null>(null);

  function refetch() {
    setLoading(true);
    api.guests
      .list(q || undefined)
      .then(setGuests)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os hóspedes."))
      .finally(() => setLoading(false));
  }

  useEffect(refetch, [q]);

  async function handleDelete(guest: Guest) {
    if (!confirm(`Excluir o hóspede ${guest.name}?`)) return;
    try {
      await api.guests.remove(guest.id);
      refetch();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível excluir o hóspede.");
    }
  }

  return (
    <div>
      <SHeader title="Hóspedes" sub={`${guests.length} registrados`} action={<AddBtn label="Novo Hóspede" onClick={() => { setEditing(null); setModalOpen(true); }} />} />
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF..."
          className="w-full pl-8 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
      </div>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando hóspedes...</p>
      ) : guests.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {q ? `Nenhum hóspede encontrado para "${q}".` : "Nenhum hóspede cadastrado ainda."}
        </p>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Hóspede</span><span>Contato</span><span>Estadas</span><span>Última visita</span><span>Ações</span>
          </div>
          {guests.map((g) => (
            <div key={g.id} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 items-center">
              <div><p className="text-sm font-medium text-foreground">{g.name}</p><p className="text-xs text-muted-foreground">{g.city}</p></div>
              <div><p className="text-xs text-muted-foreground">{g.email}</p><p className="text-xs text-muted-foreground">{g.phone}</p></div>
              <div><p className="text-sm font-medium text-foreground">{g.stays}x</p><div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={9} fill={i < g.rating ? GOLD : "none"} stroke={i < g.rating ? GOLD : "#ccc"} />)}</div></div>
              <span className="text-xs text-muted-foreground">{g.last_stay ?? "—"}</span>
              <div className="flex gap-1">
                <button onClick={() => setViewingHistory(g)} title="Histórico de reservas" className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><History size={12} /></button>
                <button onClick={() => { setEditing(g); setModalOpen(true); }} className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={12} /></button>
                {canDelete && (
                  <button onClick={() => handleDelete(g)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {modalOpen && (
        <GuestFormModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refetch(); }}
        />
      )}
      {viewingHistory && <GuestHistoryModal guest={viewingHistory} onClose={() => setViewingHistory(null)} />}
    </div>
  );
}
