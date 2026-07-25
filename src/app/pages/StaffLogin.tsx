import { useState } from "react";
import { Building2, ChevronLeft, Shield } from "lucide-react";

import { CREAM, GOLD, NAVY, sans, serif } from "../theme";
import { GoldBtn } from "../components/shared";
import { ApiError, api } from "../lib/api";
import { saveSession } from "../lib/auth";
import type { StaffRole } from "../lib/types";

export function StaffLogin({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !pass) {
      setError("Preencha todos os campos para continuar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.login(email, pass);
      saveSession({ token: res.access_token, role: res.role as StaffRole });
      onLogin();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: sans }}>
      <div className="hidden lg:flex flex-1 relative bg-neutral-900">
        <img src="https://images.unsplash.com/photo-1730367019960-9906d9cbbf05?w=1000&h=1200&fit=crop&auto=format"
          alt="Grand Palácio Hotel" className="w-full h-full object-cover opacity-65" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(22,32,54,0.88) 0%, rgba(22,32,54,0.4) 100%)" }} />
        <div className="absolute inset-0 flex flex-col justify-between p-14">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor: GOLD }}><Building2 size={18} className="text-white" /></div>
            <div>
              <p className="text-xl font-bold text-white" style={{ fontFamily: serif }}>Grand Palácio</p>
              <p className="text-xs text-white/45 tracking-widest uppercase">Hotel &amp; Resorts</p>
            </div>
          </div>
          <div>
            <p className="text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: serif }}>
              Sistema de<br /><span style={{ color: GOLD }}>Gestão</span><br />Hoteleira
            </p>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Plataforma completa para recepcionistas, gerentes e toda a equipe do Grand Palácio.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-12 max-w-md" style={{ backgroundColor: CREAM }}>
        <div className="w-full max-w-sm">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ChevronLeft size={14} />Voltar ao site
          </button>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: serif, color: NAVY }}>Acesso da Equipe</h2>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais institucionais.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} placeholder="usuario@grandpalacio.com.br"
                className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Senha</label>
              <input type="password" value={pass} onChange={(e) => { setPass(e.target.value); setError(null); }} placeholder="••••••••"
                className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <GoldBtn onClick={submit} full disabled={loading}>{loading ? "Entrando..." : "Entrar no Sistema"}</GoldBtn>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield size={11} /><span>Acesso criptografado. Conformidade LGPD.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
