import { useEffect, useState } from "react";
import {
  Building2, ChevronLeft, ChevronRight, CheckCheck, Search, BedDouble, Shield,
} from "lucide-react";

import { CREAM, GOLD, NAVY, mono, sans, serif } from "../theme";
import { GoldBtn, OutlineBtn, formatDateBR, inputClass, labelClass } from "../components/shared";
import { ApiError, api } from "../lib/api";
import type { Reservation, Room, RoomCatalogEntry, RoomType } from "../lib/types";
import type { BookingSearchParams } from "./LandingPage";

type Step = "search" | "select" | "form" | "done";

export function GuestBooking({
  initial,
  onBack,
  onDone,
}: {
  initial?: BookingSearchParams;
  onBack: () => void;
  onDone: () => void;
}) {
  const hasInitialSearch = Boolean(initial?.checkin && initial?.checkout);
  const [step, setStep] = useState<Step>(hasInitialSearch ? "select" : "search");
  const [checkin, setCI] = useState(initial?.checkin ?? "");
  const [checkout, setCO] = useState(initial?.checkout ?? "");
  const [pax, setPax] = useState(initial?.pax ?? 2);
  const [typeF, setTypeF] = useState<RoomType | "Todos">("Todos");
  const [picked, setPicked] = useState<Room | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", cpf: "", notes: "" });

  const [available, setAvailable] = useState<RoomCatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const nights =
    checkin && checkout ? Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000)) : 1;

  useEffect(() => {
    if (step !== "select") return;
    setLoading(true);
    setError(null);
    api.rooms
      .catalog(checkin, checkout, pax, typeF === "Todos" ? undefined : typeF)
      .then(setAvailable)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível buscar os quartos."))
      .finally(() => setLoading(false));
  }, [step, checkin, checkout, pax, typeF]);

  const SubHeader = () => (
    <div style={{ backgroundColor: NAVY }} className="px-6 py-4 mb-0">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors"><ChevronLeft size={15} />Voltar</button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: GOLD }}><Building2 size={13} className="text-white" /></div>
          <span className="text-white font-bold text-sm" style={{ fontFamily: serif }}>Grand Palácio</span>
        </div>
        <button onClick={onDone} className="text-sm text-white/55 hover:text-white transition-colors">Minhas Reservas</button>
      </div>
    </div>
  );

  async function confirmBooking() {
    if (!picked) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.guestPortal.createBooking({
        room_id: picked.id,
        checkin,
        checkout,
        guests: pax,
        guest_name: form.name,
        guest_email: form.email,
        guest_phone: form.phone,
        guest_cpf: form.cpf,
      });
      setReservation(res);
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível concluir a reserva.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done" && picked && reservation) {
    return (
      <div style={{ backgroundColor: CREAM, fontFamily: sans }} className="min-h-screen">
        <SubHeader />
        <div className="flex items-center justify-center px-6 py-16">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "#e8f5ee" }}>
              <CheckCheck size={38} style={{ color: "#3d8c6e" }} />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: serif, color: NAVY }}>Reserva Confirmada!</h2>
            <p className="text-sm text-muted-foreground mb-6">Obrigado, <strong>{form.name.split(" ")[0]}</strong>. Sua reserva foi recebida.</p>
            <div className="bg-card rounded-xl border border-border p-5 mb-6 text-left space-y-2.5">
              {[
                { l: "Nº da Reserva", v: <span style={{ fontFamily: mono }}>{reservation.code}</span> },
                { l: "Quarto", v: `${picked.number} — ${picked.type}` },
                { l: "Check-in", v: checkin },
                { l: "Check-out", v: checkout },
                { l: "Hóspedes", v: `${pax}` },
              ].map((row) => (
                <div key={row.l} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.l}</span>
                  <span className="font-semibold">{row.v}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2.5 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold" style={{ color: GOLD, fontFamily: serif }}>R$ {reservation.total.toLocaleString("pt-BR")}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Confirmação enviada para <strong>{form.email}</strong></p>
            <div className="flex gap-3 justify-center">
              <GoldBtn onClick={onDone}>Ver Minhas Reservas</GoldBtn>
              <OutlineBtn onClick={onBack}>Voltar ao Início</OutlineBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const steps = ["Busca", "Escolha", "Dados"];
  const stepIdx = ["search", "select", "form"].indexOf(step);

  return (
    <div style={{ backgroundColor: CREAM, fontFamily: sans }} className="min-h-screen">
      <SubHeader />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i < stepIdx ? "opacity-60" : ""}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: i === stepIdx ? GOLD : i < stepIdx ? "#3d8c6e" : "#E8E4DC", color: i <= stepIdx ? "white" : "#6B6655" }}>
                  {i < stepIdx ? <CheckCheck size={12} /> : i + 1}
                </div>
                <span className="text-sm font-medium" style={{ color: i === stepIdx ? NAVY : "#6B6655" }}>{s}</span>
              </div>
              {i < 2 && <ChevronRight size={13} className="text-muted-foreground" />}
            </div>
          ))}
        </div>

        {step === "search" && (
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: serif, color: NAVY }}>Verificar Disponibilidade</h2>
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Check-in</label>
                  <input type="date" value={checkin} onChange={(e) => setCI(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Check-out</label>
                  <input type="date" value={checkout} onChange={(e) => setCO(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Número de Hóspedes</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button key={n} onClick={() => setPax(n)}
                      className="w-10 h-10 rounded-lg text-sm font-medium border transition-colors"
                      style={{ borderColor: pax === n ? GOLD : "#E8E4DC", backgroundColor: pax === n ? GOLD : "transparent", color: pax === n ? "white" : "#6B6655" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <GoldBtn
                onClick={() => {
                  if (!checkin || !checkout) { setError("Selecione as datas de check-in e check-out."); return; }
                  setError(null);
                  setStep("select");
                }}
                full
              >
                <Search size={15} />Buscar Quartos
              </GoldBtn>
            </div>
          </div>
        )}

        {step === "select" && (
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: serif, color: NAVY }}>Quartos</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{checkin} → {checkout} · {pax} hóspede{pax > 1 ? "s" : ""} · {nights} noite{nights > 1 ? "s" : ""}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["Todos", "Standard", "Luxo", "Suite", "Presidencial"] as const).map((f) => (
                  <button key={f} onClick={() => setTypeF(f)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                    style={{ borderColor: typeF === f ? GOLD : "#E8E4DC", backgroundColor: typeF === f ? GOLD : "transparent", color: typeF === f ? "white" : "#6B6655" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            {loading ? (
              <p className="text-center py-16 text-sm text-muted-foreground">Buscando quartos...</p>
            ) : available.length === 0 ? (
              <div className="text-center py-16">
                <BedDouble size={40} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-lg font-medium text-muted-foreground">Nenhum quarto encontrado para os critérios.</p>
                <button onClick={() => setStep("search")} className="mt-3 text-sm underline" style={{ color: GOLD }}>Alterar busca</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {available.map((room) => (
                  <div key={room.id} onClick={() => { if (room.available) { setPicked(room); setStep("form"); } }}
                    className={`bg-card rounded-xl border border-border overflow-hidden transition-all group ${room.available ? "hover:shadow-lg cursor-pointer" : "opacity-60"}`}>
                    <div className="relative h-44 bg-neutral-200 overflow-hidden">
                      <img src={room.img ?? ""} alt={`Quarto ${room.type}`} className={`w-full h-full object-cover transition-transform duration-500 ${room.available ? "group-hover:scale-105" : "grayscale"}`} />
                      {!room.available && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-semibold text-white" style={{ backgroundColor: "#B83232" }}>
                          Indisponível
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg" style={{ fontFamily: serif }}>{room.type} — {room.number}</h3>
                          <p className="text-xs text-muted-foreground">Andar {room.floor} · Cap. {room.capacity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold" style={{ color: GOLD }}>R$ {room.price}</p>
                          <p className="text-xs text-muted-foreground">/noite</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {room.amenities.slice(0, 4).map((a) => <span key={a} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{a}</span>)}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        {room.available ? (
                          <>
                            <span className="text-sm text-muted-foreground">Total: <strong className="text-foreground">R$ {(room.price * nights).toLocaleString("pt-BR")}</strong></span>
                            <GoldBtn sm>Selecionar</GoldBtn>
                          </>
                        ) : (
                          <span className="text-sm font-medium" style={{ color: "#B83232" }}>
                            {room.available_from ? `Disponível a partir de ${formatDateBR(room.available_from)}` : "Em manutenção"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "form" && picked && (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: serif, color: NAVY }}>Dados do Hóspede</h2>
            <p className="text-sm text-muted-foreground mb-5">Preencha seus dados. Informações protegidas conforme a LGPD.</p>
            <div className="bg-card rounded-xl border border-border p-4 mb-4 flex gap-4 items-center">
              <div className="w-20 h-16 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                <img src={picked.img ?? ""} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold" style={{ fontFamily: serif }}>{picked.type} — Quarto {picked.number}</p>
                <p className="text-xs text-muted-foreground">{checkin} → {checkout} · {nights} noite{nights > 1 ? "s" : ""}</p>
                <p className="text-base font-bold mt-1" style={{ color: GOLD }}>R$ {(picked.price * nights).toLocaleString("pt-BR")}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome Completo *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome completo" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>E-mail *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Telefone *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>CPF *</label>
                  <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Pedidos Especiais</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                    placeholder="Alergias, preferências de andar, cama extra..."
                    className={`${inputClass} resize-none`} />
                </div>
              </div>
              <div className="p-3 rounded-lg text-xs text-muted-foreground" style={{ backgroundColor: "rgba(184,145,74,0.06)", border: "1px solid rgba(184,145,74,0.2)" }}>
                <Shield size={11} className="inline mr-1" style={{ color: GOLD }} />
                Dados criptografados e protegidos pela <strong>Lei 13.709/2018 (LGPD)</strong>. Cancelamento gratuito em até 48h antes do check-in.
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-3">
                <OutlineBtn onClick={() => setStep("select")}>Voltar</OutlineBtn>
                <button
                  disabled={loading}
                  onClick={() => { if (form.name && form.email && form.phone && form.cpf) confirmBooking(); else setError("Preencha todos os campos obrigatórios."); }}
                  className="flex-1 py-3 rounded font-semibold text-sm text-white transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: GOLD, fontFamily: sans }}>
                  {loading ? "Confirmando..." : `Confirmar — R$ ${(picked.price * nights).toLocaleString("pt-BR")}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
