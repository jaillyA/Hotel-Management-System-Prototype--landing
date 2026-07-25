import { useEffect, useState } from "react";
import { DollarSign, Receipt, TrendingUp, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { GOLD } from "../../theme";
import { GoldBtn, SHeader, StatCard, inputClass, labelClass } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Invoice, Payment, PaymentMethod, RevenuePoint } from "../../lib/types";
import { useStaffAuth } from "../AuthContext";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "pix", label: "Pix" },
  { value: "transferencia", label: "Transferência" },
];

export function FinanceView() {
  const { role } = useStaffAuth();
  const canRegisterPayment = role === "administrador" || role === "gerente" || role === "recepcionista";

  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{ reservation_code: string; amount: string; payment_method: PaymentMethod | "" }>({
    reservation_code: "",
    amount: "",
    payment_method: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function refetchPayments() {
    api.finance.payments().then(setPayments).catch(() => {});
  }

  useEffect(() => {
    Promise.all([api.dashboard.revenue(), api.finance.invoices(), api.finance.payments()])
      .then(([r, inv, pay]) => {
        setRevenue(r);
        setInvoices(inv);
        setPayments(pay);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os dados financeiros."))
      .finally(() => setLoading(false));
  }, []);

  async function handleRegisterPayment() {
    const amount = Number(form.amount);
    if (!form.reservation_code.trim()) {
      setFormError("Informe o código da reserva.");
      return;
    }
    if (!form.amount || !amount || amount <= 0) {
      setFormError("O valor do pagamento deve ser positivo.");
      return;
    }
    if (!form.payment_method) {
      setFormError("Selecione a forma de pagamento.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await api.finance.registerPayment({
        reservation_code: form.reservation_code,
        amount,
        payment_method: form.payment_method,
      });
      setForm({ reservation_code: "", amount: "", payment_method: "" });
      refetchPayments();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível registrar o pagamento.");
    } finally {
      setSaving(false);
    }
  }

  const total = revenue.reduce((s, d) => s + d.receita, 0);

  if (loading) return <p className="text-sm text-muted-foreground">Carregando dados financeiros...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div>
      <SHeader title="Financeiro" sub="Receita — últimos 12 meses" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard title="Receita (12 meses)" value={`R$ ${(total / 1000).toFixed(0)}k`} icon={<TrendingUp size={16} />} />
        <StatCard title="Média mensal" value={`R$ ${(total / (revenue.length || 1) / 1000).toFixed(0)}k`} icon={<DollarSign size={16} />} />
      </div>
      <div className="bg-card rounded-lg border border-border p-4 mb-4">
        <p className="text-sm font-medium mb-3">Receita por mês</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenue} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B6655" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6B6655" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
            <Bar dataKey="receita" name="Receita" fill={GOLD} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-2 px-4 py-2.5 bg-muted border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Mês</span><span>Receita</span>
        </div>
        {revenue.map((d) => (
          <div key={d.month} className="grid grid-cols-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 text-sm items-center">
            <span className="font-medium">{d.month}</span>
            <span className="text-emerald-600">R$ {d.receita.toLocaleString("pt-BR")}</span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Receipt size={13} className="text-muted-foreground" />
          <p className="text-sm font-medium">Faturas — Sistema Financeiro (externo)</p>
        </div>
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Nenhuma fatura registrada ainda no sistema financeiro externo.</p>
          ) : (
            <>
              <div className="grid grid-cols-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Reserva</span><span>Hóspede</span><span>Tipo</span><span>Valor</span>
              </div>
              {invoices.map((inv) => (
                <div key={inv.id} className="grid grid-cols-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 text-sm items-center">
                  <span className="font-medium">{inv.reservation_code}</span>
                  <span className="text-muted-foreground truncate">{inv.guest_name}</span>
                  <span className={inv.kind === "cancelamento" ? "text-red-500" : "text-emerald-600"}>{inv.kind}</span>
                  <span>R$ {inv.amount.toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Wallet size={13} className="text-muted-foreground" />
          <p className="text-sm font-medium">Pagamentos</p>
        </div>

        {canRegisterPayment && (
          <div className="bg-card rounded-lg border border-border p-4 mb-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className={labelClass}>Código da reserva *</label>
                <input
                  value={form.reservation_code}
                  onChange={(e) => setForm({ ...form, reservation_code: e.target.value })}
                  placeholder="RES-0001"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Valor (R$) *</label>
                <input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Forma de pagamento *</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value as PaymentMethod })}
                  className={inputClass}
                >
                  <option value="">Selecione...</option>
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
            {formError && <p className="text-xs text-red-500 mt-2">{formError}</p>}
            <div className="mt-3">
              <GoldBtn onClick={handleRegisterPayment} disabled={saving} sm>
                {saving ? "Registrando..." : "Registrar Pagamento"}
              </GoldBtn>
            </div>
          </div>
        )}

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Nenhum pagamento registrado ainda.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 px-4 py-2.5 bg-muted border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span>Reserva</span><span>Forma</span><span>Valor</span>
              </div>
              {payments.map((p) => (
                <div key={p.id} className="grid grid-cols-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 text-sm items-center">
                  <span className="font-medium">{p.reservation_code}</span>
                  <span className="text-muted-foreground">{PAYMENT_METHODS.find((m) => m.value === p.payment_method)?.label ?? p.payment_method}</span>
                  <span className="text-emerald-600">R$ {p.amount.toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
