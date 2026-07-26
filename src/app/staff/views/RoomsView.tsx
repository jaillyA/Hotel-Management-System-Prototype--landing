import { useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

import { GOLD } from "../../theme";
import { AddBtn, RoomBadge, SHeader, roomStatusCfg } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Room, RoomStatus } from "../../lib/types";
import { RoomFormModal } from "../modals/RoomFormModal";
import { useStaffAuth } from "../AuthContext";

export function RoomsView({ query = "" }: { query?: string }) {
  const { role } = useStaffAuth();
  const canManage = role === "administrador" || role === "gerente";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<RoomStatus | "todos">("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);

  function refetch() {
    setLoading(true);
    api.rooms
      .list()
      .then(setRooms)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os quartos."))
      .finally(() => setLoading(false));
  }

  useEffect(refetch, []);

  async function handleDelete(room: Room) {
    if (!confirm(`Excluir o quarto ${room.number}?`)) return;
    try {
      await api.rooms.remove(room.id);
      refetch();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível excluir o quarto.");
    }
  }

  const byStatus = filter === "todos" ? rooms : rooms.filter((r) => r.status === filter);
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? byStatus.filter((r) => r.number.toLowerCase().includes(needle) || r.type.toLowerCase().includes(needle))
    : byStatus;

  return (
    <div>
      <SHeader title="Quartos" sub={`${rooms.length} quartos`} action={canManage ? <AddBtn label="Novo Quarto" onClick={() => { setEditing(null); setModalOpen(true); }} /> : undefined} />
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["todos", "disponivel", "ocupado", "reservado", "manutencao"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{ borderColor: filter === s ? GOLD : "#E8E4DC", backgroundColor: filter === s ? GOLD : "transparent", color: filter === s ? "white" : "#6B6655" }}>
            {s === "todos" ? "Todos" : roomStatusCfg[s].label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando quartos...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {needle ? `Nenhum quarto encontrado para "${query}".` : "Nenhum quarto encontrado."}
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((room) => (
            <div key={room.id} className="bg-card rounded-lg border border-border p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <p className="text-lg font-semibold text-foreground">{room.number}</p>
                <RoomBadge status={room.status} />
              </div>
              <p className="text-sm font-medium text-foreground">{room.type}</p>
              <p className="text-xs text-muted-foreground mb-2">Andar {room.floor} · Cap. {room.capacity}</p>
              <div className="flex flex-wrap gap-1 mb-2">{room.amenities.slice(0, 3).map((a) => <span key={a} className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">{a}</span>)}</div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-semibold text-foreground">R$ {room.price}<span className="text-xs font-normal text-muted-foreground">/n</span></span>
                {canManage && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(room); setModalOpen(true); }} className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={12} /></button>
                    <button onClick={() => handleDelete(room)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {modalOpen && (
        <RoomFormModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refetch(); }}
        />
      )}
    </div>
  );
}
