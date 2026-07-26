import { useState } from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { GoldBtn, OutlineBtn, inputClass, labelClass } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Room, RoomStatus, RoomType } from "../../lib/types";

const ROOM_TYPES: RoomType[] = ["Standard", "Luxo", "Suite", "Presidencial"];
const ROOM_STATUSES: RoomStatus[] = ["disponivel", "ocupado", "manutencao", "reservado"];

export function RoomFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Room | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    number: initial?.number ?? "",
    floor: initial?.floor ?? 1,
    type: initial?.type ?? ("" as RoomType | ""),
    status: initial?.status ?? ("" as RoomStatus | ""),
    capacity: initial?.capacity ?? 2,
    price: initial?.price ?? 0,
    amenities: initial?.amenities.join(", ") ?? "",
    img: initial?.img ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!form.number.trim()) {
      setError("O número do quarto é obrigatório.");
      return;
    }
    if (!form.type || !form.status) {
      setError("Selecione o tipo e o status do quarto.");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError("O preço por noite deve ser maior que zero.");
      return;
    }
    if (!form.capacity || Number(form.capacity) <= 0) {
      setError("A capacidade deve ser maior que zero.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      number: form.number,
      floor: Number(form.floor),
      type: form.type as RoomType,
      status: form.status as RoomStatus,
      capacity: Number(form.capacity),
      price: Number(form.price),
      amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      img: form.img || null,
    };
    try {
      if (initial) await api.rooms.update(initial.id, payload);
      else await api.rooms.create(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Número de quarto já existe.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initial ? `Editar quarto ${initial.number}` : "Novo quarto"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Número *</label>
            <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Andar</label>
            <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as RoomType })} className={inputClass}>
              <option value="">Selecione...</option>
              {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RoomStatus })} className={inputClass}>
              <option value="">Selecione...</option>
              {ROOM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Capacidade</label>
            <input type="number" min={1} max={20} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Math.max(1, Math.min(20, Number(e.target.value))) })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Preço/noite (R$)</label>
            <input type="number" min={0.01} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Math.max(0, Number(e.target.value)) })} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Comodidades (separadas por vírgula)</label>
            <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Wi-Fi, TV, AC, Frigobar" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>URL da imagem</label>
            <input value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} className={inputClass} />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <DialogFooter>
          <OutlineBtn onClick={onClose}>Cancelar</OutlineBtn>
          <GoldBtn onClick={submit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</GoldBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
