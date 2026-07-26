import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { GoldBtn, OutlineBtn, formatCPF, formatPhoneBR, inputClass, labelClass } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Staff, StaffRole, StaffStatus } from "../../lib/types";
import { useStaffAuth } from "../AuthContext";

const ROLES: StaffRole[] = ["administrador", "gerente", "recepcionista", "governanta"];
const STATUSES: StaffStatus[] = ["ativo", "inativo"];

export function StaffFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Staff | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { role: currentRole } = useStaffAuth();
  const isAdmin = currentRole === "administrador";

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    cpf: initial?.cpf ?? "",
    phone: initial?.phone ?? "",
    role: initial?.role ?? ("" as StaffRole | ""),
    department: initial?.department ?? "",
    since: initial?.since ?? new Date().toISOString().slice(0, 10),
    status: initial?.status ?? "ativo",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCpf, setShowCpf] = useState(false);

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || !form.cpf.trim() || !form.role) {
      setError("Preencha todos os campos obrigatórios: nome, e-mail, CPF e papel.");
      return;
    }
    if (!initial && !form.password.trim()) {
      setError("Defina uma senha para o novo funcionário.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (initial) {
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          cpf: form.cpf,
          phone: form.phone || null,
          role: form.role,
          department: form.department || null,
          status: form.status,
        };
        if (form.password) payload.password = form.password;
        await api.staff.update(initial.id, payload);
      } else {
        await api.staff.create({
          name: form.name,
          email: form.email,
          cpf: form.cpf,
          phone: form.phone || null,
          role: form.role as StaffRole,
          department: form.department || null,
          since: form.since,
          password: form.password,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o funcionário.");
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Acesso restrito</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Apenas administradores podem criar ou editar funcionários.</p>
          <DialogFooter><OutlineBtn onClick={onClose}>Fechar</OutlineBtn></DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initial ? `Editar ${initial.name}` : "Novo funcionário"}</DialogTitle>
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
            <label className={labelClass}>Telefone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhoneBR(e.target.value) })} placeholder="(11) 99999-9999" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Papel *</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })} className={inputClass}>
              <option value="">Selecione...</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Departamento</label>
            <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} />
          </div>
          {initial ? (
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StaffStatus })} className={inputClass}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className={labelClass}>Desde</label>
              <input type="date" value={form.since} onChange={(e) => setForm({ ...form, since: e.target.value })} className={inputClass} />
            </div>
          )}
          <div className="col-span-2">
            <label className={labelClass}>{initial ? "Nova senha (deixe em branco para manter)" : "Senha *"}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <DialogFooter>
          <OutlineBtn onClick={onClose}>Cancelar</OutlineBtn>
          <GoldBtn onClick={submit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </GoldBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
