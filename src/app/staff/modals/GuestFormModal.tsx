import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { GoldBtn, OutlineBtn, formatCPF, formatPhoneBR, inputClass, labelClass } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Guest } from "../../lib/types";

export function GuestFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Guest | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    cpf: initial?.cpf ?? "",
    city: initial?.city ?? "",
    rating: initial?.rating ?? 5,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCpf, setShowCpf] = useState(false);

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.cpf.trim()) {
      setError("Preencha todos os campos obrigatórios: nome, e-mail, telefone e CPF.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = { ...form, city: form.city || null, rating: Number(form.rating) };
    try {
      if (initial) await api.guests.update(initial.id, payload);
      else await api.guests.create(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o hóspede.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initial ? `Editar ${initial.name}` : "Novo hóspede"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Nome *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>E-mail *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefone *</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhoneBR(e.target.value) })} placeholder="(11) 99999-9999" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>CPF *</label>
            <div className="relative">
              <input
                type={showCpf ? "text" : "password"}
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
                placeholder="000.000.000-00"
                className={`${inputClass} pr-9`}
              />
              <button
                type="button"
                onClick={() => setShowCpf((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showCpf ? "Ocultar CPF" : "Mostrar CPF"}
              >
                {showCpf ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Avaliação (1-5)</label>
            <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputClass} />
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
