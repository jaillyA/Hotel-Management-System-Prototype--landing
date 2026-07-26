import { useState } from "react";
import { Search, User } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { GoldBtn, OutlineBtn, formatDateBR, inputClass, labelClass } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Guest, RoomCatalogEntry } from "../../lib/types";

export function CreateReservationModal({
  room,
  checkin,
  checkout,
  guests,
  onClose,
  onCreated,
}: {
  room: RoomCatalogEntry;
  checkin: string;
  checkout: string;
  guests: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [guestQuery, setGuestQuery] = useState("");
  const [guestResults, setGuestResults] = useState<Guest[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<Guest | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchGuests() {
    if (!guestQuery.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const results = await api.guests.list(guestQuery.trim());
      setGuestResults(results);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível buscar hóspedes.");
    } finally {
      setSearching(false);
    }
  }

  async function confirm() {
    if (!picked) return;
    setSaving(true);
    setError(null);
    try {
      await api.reservations.create({ guest_id: picked.id, room_id: room.id, checkin, checkout, guests });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar a reserva.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Nova reserva — Quarto {room.number}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          {formatDateBR(checkin)} → {formatDateBR(checkout)} · {guests} hóspede{guests > 1 ? "s" : ""}
        </p>

        {!picked ? (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Buscar hóspede (nome, e-mail ou CPF)</label>
              <div className="flex gap-2">
                <input
                  value={guestQuery}
                  onChange={(e) => setGuestQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchGuests()}
                  className={inputClass}
                  placeholder="Digite para buscar..."
                />
                <GoldBtn onClick={searchGuests} disabled={searching} sm>
                  <Search size={13} />
                </GoldBtn>
              </div>
            </div>
            {searching && <p className="text-sm text-muted-foreground">Buscando...</p>}
            {guestResults && guestResults.length === 0 && (
              <p className="text-sm text-muted-foreground py-2 text-center">Nenhum hóspede encontrado.</p>
            )}
            {guestResults && guestResults.length > 0 && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {guestResults.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setPicked(g)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm text-left hover:bg-muted/70 transition-colors"
                  >
                    <User size={13} className="text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 min-w-0 truncate"><strong>{g.name}</strong> · {g.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{picked.name}</p>
              <p className="text-xs text-muted-foreground">{picked.email}</p>
            </div>
            <button onClick={() => setPicked(null)} className="text-xs underline text-muted-foreground">Trocar</button>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
        <DialogFooter>
          <OutlineBtn onClick={onClose}>Cancelar</OutlineBtn>
          <GoldBtn onClick={confirm} disabled={saving || !picked}>{saving ? "Criando..." : "Confirmar reserva"}</GoldBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
