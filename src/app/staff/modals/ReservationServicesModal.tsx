import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { GoldBtn, OutlineBtn, inputClass, labelClass } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Consumption, Reservation, Service } from "../../lib/types";
import { useStaffAuth } from "../AuthContext";

export function ReservationServicesModal({
  reservation,
  onClose,
}: {
  reservation: Reservation;
  onClose: () => void;
}) {
  const { role } = useStaffAuth();
  const isTerminal = reservation.status === "cancelada" || reservation.status === "checkout";
  const canManage = (role === "administrador" || role === "gerente" || role === "recepcionista") && !isTerminal;

  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  function refetch() {
    setLoading(true);
    Promise.all([api.reservations.services.list(reservation.id), api.services.list()])
      .then(([cons, svc]) => {
        setConsumptions(cons);
        setServices(svc.filter((s) => s.available));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os serviços consumidos."))
      .finally(() => setLoading(false));
  }

  useEffect(refetch, [reservation.id]);

  async function handleAdd() {
    if (!selectedService) return;
    setSaving(true);
    setError(null);
    try {
      await api.reservations.services.add(reservation.id, { service_id: selectedService, quantity });
      setSelectedService("");
      setQuantity(1);
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível adicionar o serviço.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(consumptionId: number) {
    try {
      await api.reservations.services.remove(reservation.id, consumptionId);
      refetch();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível remover o serviço.");
    }
  }

  const incidentalsTotal = consumptions.reduce((sum, c) => sum + c.total, 0);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Serviços consumidos — {reservation.code}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <>
            {consumptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum serviço adicional lançado nesta reserva ainda.</p>
            ) : (
              <div className="space-y-1.5">
                {consumptions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg text-sm">
                    <div>
                      <span className="font-medium">{c.service_name}</span>
                      <span className="text-muted-foreground"> × {c.quantity}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>R$ {c.total.toLocaleString("pt-BR")}</span>
                      {canManage && (
                        <button onClick={() => handleRemove(c.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between px-3 pt-2 text-sm font-semibold">
                  <span>Total de incidentais</span>
                  <span>R$ {incidentalsTotal.toLocaleString("pt-BR")}</span>
                </div>
              </div>
            )}

            {canManage && (
              <div className="flex items-end gap-2 pt-2 border-t border-border">
                <div className="flex-1">
                  <label className={labelClass}>Serviço</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : "")}
                    className={inputClass}
                  >
                    <option value="">Selecione...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} — R$ {s.price}</option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className={labelClass}>Qtd.</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className={inputClass}
                  />
                </div>
                <GoldBtn onClick={handleAdd} disabled={!selectedService || saving} sm>
                  {saving ? "..." : "Adicionar"}
                </GoldBtn>
              </div>
            )}
            {isTerminal && (
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Esta reserva está {reservation.status === "cancelada" ? "cancelada" : "encerrada"} — não é possível lançar novos serviços.
              </p>
            )}
          </>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
        <DialogFooter>
          <OutlineBtn onClick={onClose}>Fechar</OutlineBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
