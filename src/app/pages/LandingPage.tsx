import { useEffect, useState } from "react";
import {
  Building2, Search, ChevronDown, CheckCheck,
  Instagram, Facebook, Twitter, Lock, Phone, Mail, MapPin, Menu, X,
  Waves, Dumbbell, UtensilsCrossed, Car, Coffee, Wind, Quote, Star,
} from "lucide-react";

import { CREAM, GOLD, NAVY, sans, serif } from "../theme";
import { GoldBtn, OutlineBtn } from "../components/shared";
import type { RoomType } from "../lib/types";

const roomShowcase: {
  type: RoomType;
  tagline: string;
  price: number;
  capacity: number;
  highlights: string[];
  img: string;
}[] = [
  { type: "Standard", tagline: "Conforto Refinado", price: 280, capacity: 2, highlights: ["26 m²", "Cama Queen", "Wi-Fi Fibra", "Frigobar"], img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&h=500&fit=crop&auto=format" },
  { type: "Luxo", tagline: "Elegância com Vista", price: 480, capacity: 3, highlights: ["38 m²", "Cama King", "Varanda Privativa", "Banheira"], img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&h=500&fit=crop&auto=format" },
  { type: "Suite", tagline: "Espaço & Exclusividade", price: 780, capacity: 4, highlights: ["62 m²", "Sala Separada", "Butler 24h", "Vista Panorâmica"], img: "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=700&h=500&fit=crop&auto=format" },
  { type: "Presidencial", tagline: "O Ápice da Hospitalidade", price: 1850, capacity: 6, highlights: ["120 m²", "Cozinha Gourmet", "Adega Privativa", "Concierge Exclusivo"], img: "https://images.unsplash.com/photo-1711059985570-4c32ed12a12c?w=700&h=500&fit=crop&auto=format" },
];

const testimonials = [
  { name: "Beatriz Carvalho", city: "São Paulo, SP", init: "BC", stars: 5, text: "Uma experiência incomparável. O atendimento é de excelência e os quartos transmitem um conforto que faz você não querer ir embora. Já é minha segunda vez e certamente voltarei." },
  { name: "Gustavo Marinho", city: "Brasília, DF", init: "GM", stars: 5, text: "Me hospedei na Suite e foi simplesmente magnífico. A vista da varanda ao amanhecer é inesquecível. O staff é atencioso e o café da manhã está entre os melhores que já tive." },
  { name: "Isabela Teixeira", city: "Florianópolis, SC", init: "IT", stars: 5, text: "Hotel impecável. Ambiente sofisticado, limpeza primorosa e localização perfeita. O serviço de concierge resolveu todos os meus compromissos com agilidade e profissionalismo." },
];

export interface BookingSearchParams {
  checkin: string;
  checkout: string;
  pax: number;
}

export function LandingPage({
  onBook,
  onPortal,
  onStaff,
}: {
  onBook: (params?: BookingSearchParams) => void;
  onPortal: () => void;
  onStaff: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [pax, setPax] = useState(2);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ backgroundColor: CREAM, fontFamily: sans, color: NAVY }}>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/96 backdrop-blur-sm shadow-sm" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: GOLD }}>
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold leading-none" style={{ fontFamily: serif, color: scrolled ? NAVY : "white" }}>Grand Palácio</p>
              <p className="text-[10px] tracking-[0.18em] uppercase mt-0.5" style={{ color: scrolled ? GOLD : "rgba(255,255,255,0.6)" }}>Hotel &amp; Resorts</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {["Quartos", "Experiências", "Gastronomia", "Localização"].map((l) => (
              <a key={l} href="#" className="text-sm font-medium transition-opacity hover:opacity-60" style={{ color: scrolled ? NAVY : "white" }}>{l}</a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button onClick={onPortal} className="text-sm font-medium hover:opacity-60 transition-opacity" style={{ color: scrolled ? NAVY : "white" }}>
              Minhas Reservas
            </button>
            <GoldBtn onClick={() => onBook()} sm>Reservar Agora</GoldBtn>
            <button onClick={onStaff} className="text-xs font-medium opacity-40 hover:opacity-70 transition-opacity" style={{ color: scrolled ? NAVY : "white" }}>
              Staff
            </button>
          </div>

          <button className="lg:hidden p-2 rounded" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X size={22} style={{ color: scrolled ? NAVY : "white" }} /> : <Menu size={22} style={{ color: scrolled ? NAVY : "white" }} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-border px-6 py-4 space-y-3">
            {["Quartos", "Experiências", "Gastronomia", "Localização"].map((l) => (
              <a key={l} href="#" className="block text-sm font-medium py-1" style={{ color: NAVY }}>{l}</a>
            ))}
            <div className="pt-3 border-t border-border space-y-2">
              <button onClick={onPortal} className="block text-sm text-muted-foreground py-1">Minhas Reservas</button>
              <GoldBtn onClick={() => onBook()} full>Reservar Agora</GoldBtn>
              <button onClick={onStaff} className="block text-xs text-muted-foreground py-1">Acesso Staff</button>
            </div>
          </div>
        )}
      </nav>

      <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-neutral-800">
          <img src="https://images.unsplash.com/photo-1646991761123-d83ce47c30c9?w=1800&h=1000&fit=crop&auto=format" alt="Lobby elegante do Grand Palácio Hotel" className="w-full h-full object-cover opacity-55" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(22,32,54,0.25) 0%, rgba(22,32,54,0.70) 100%)" }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.35em] uppercase mb-5 font-medium" style={{ color: GOLD }}>São Paulo · Brasil · Desde 1987</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6" style={{ fontFamily: serif }}>
            Onde o Luxo<br />
            <em className="not-italic" style={{ color: GOLD }}>Encontra</em> o Lar
          </h1>
          <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
            Experiencie o mais alto padrão de hospitalidade no coração de São Paulo. Quartos exclusivos, gastronomia premiada e serviço impecável.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 inline-block w-full max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: "Check-in", val: checkin, set: setCheckin },
                { label: "Check-out", val: checkout, set: setCheckout },
              ].map((f) => (
                <div key={f.label} className="text-left">
                  <label className="text-xs text-white/55 block mb-1.5 uppercase tracking-widest">{f.label}</label>
                  <input type="date" value={f.val} onChange={(e) => f.set(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    style={{ colorScheme: "dark" }} />
                </div>
              ))}
              <div className="text-left">
                <label className="text-xs text-white/55 block mb-1.5 uppercase tracking-widest">Hóspedes</label>
                <select value={pax} onChange={(e) => setPax(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/50">
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n} className="text-foreground bg-white">{`${n} ${n === 1 ? "hóspede" : "hóspedes"}`}</option>)}
                </select>
              </div>
            </div>
            <GoldBtn onClick={() => onBook({ checkin, checkout, pax })} full lg>
              <Search size={17} />Verificar Disponibilidade
            </GoldBtn>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
          <span className="text-xs text-white tracking-[0.2em] uppercase">Explore</span>
          <ChevronDown size={15} className="text-white animate-bounce" />
        </div>
      </section>

      <div style={{ backgroundColor: NAVY }} className="py-9">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { val: "37", label: "Anos de Tradição" },
            { val: "12", label: "Quartos Exclusivos" },
            { val: "98%", label: "Taxa de Satisfação" },
            { val: "24h", label: "Concierge Dedicado" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold mb-1" style={{ color: GOLD, fontFamily: serif }}>{s.val}</p>
              <p className="text-xs text-white/50 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: GOLD }}>Acomodações</p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: serif }}>Quartos &amp; Suítes</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">Cada acomodação foi desenhada para oferecer o máximo em conforto, privacidade e estética, com materiais selecionados e atenção ao detalhe.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roomShowcase.map((r) => (
            <div key={r.type} className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
              <div className="relative h-52 bg-neutral-200 overflow-hidden">
                <img src={r.img} alt={`Quarto ${r.type}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(22,32,54,0.55) 0%, transparent 55%)" }} />
                <p className="absolute bottom-3 left-3 text-xs font-medium text-white/70 uppercase tracking-wider">{r.tagline}</p>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold" style={{ fontFamily: serif }}>{r.type}</h3>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: GOLD }}>R$ {r.price}</p>
                    <p className="text-xs text-muted-foreground">/noite</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Até {r.capacity} {r.capacity > 1 ? "pessoas" : "pessoa"}</p>
                <div className="grid grid-cols-2 gap-1 mb-4">
                  {r.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCheck size={10} style={{ color: GOLD }} />{h}
                    </div>
                  ))}
                </div>
                <button onClick={() => onBook()}
                  className="w-full py-2 rounded border text-xs font-semibold transition-all"
                  style={{ borderColor: GOLD, color: GOLD }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = GOLD; (e.currentTarget as HTMLElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = GOLD; }}>
                  Reservar este quarto
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6" style={{ backgroundColor: "#EDE9E1" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: GOLD }}>Experiências</p>
            <h2 className="text-4xl lg:text-5xl font-bold mb-5" style={{ fontFamily: serif }}>Muito Além do Quarto</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">No Grand Palácio, cada detalhe é pensado para transformar sua estadia em uma experiência sensorial completa — do amanhecer ao entardecer.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <UtensilsCrossed size={19} />, label: "Restaurante Gourmet", desc: "Chef premiado, menu sazonal" },
                { icon: <Waves size={19} />, label: "Spa & Piscina", desc: "Relax e bem-estar exclusivo" },
                { icon: <Dumbbell size={19} />, label: "Fitness 24h", desc: "Equipamentos de última geração" },
                { icon: <Car size={19} />, label: "Transfer & Valet", desc: "Mobilidade sem preocupação" },
                { icon: <Coffee size={19} />, label: "Café da Manhã", desc: "Mesa farta e regional" },
                { icon: <Wind size={19} />, label: "Concierge 24h", desc: "Seu assistente pessoal" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl hover:bg-white transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EFEBE3", color: GOLD }}>{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src="https://images.unsplash.com/photo-1758448756167-88dc934c58e4?w=500&h=620&fit=crop&auto=format" alt="Piscina infinita ao entardecer" className="rounded-xl w-full h-80 object-cover" />
            <div className="space-y-3 mt-10">
              <img src="https://images.unsplash.com/photo-1643101570532-88c8ecc07c1f?w=400&h=300&fit=crop&auto=format" alt="Restaurante gourmet do hotel" className="rounded-xl w-full h-36 object-cover" />
              <img src="https://images.unsplash.com/photo-1774281340465-01b55378587f?w=400&h=300&fit=crop&auto=format" alt="Rooftop lounge ao pôr do sol" className="rounded-xl w-full h-36 object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: GOLD }}>Depoimentos</p>
          <h2 className="text-4xl font-bold" style={{ fontFamily: serif }}>O que Nossos Hóspedes Dizem</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
              <Quote size={26} style={{ color: GOLD, opacity: 0.35 }} className="mb-4" />
              <p className="text-sm leading-relaxed text-muted-foreground mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: NAVY }}>{t.init}</div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill={GOLD} stroke={GOLD} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-4 sm:mx-6 mb-16 rounded-2xl overflow-hidden relative" style={{ backgroundColor: NAVY }}>
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1637730827702-de34e9ae4ede?w=1400&h=500&fit=crop&auto=format" alt="" className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="relative z-10 py-16 px-8 text-center">
          <p className="text-xs tracking-[0.28em] uppercase mb-3 font-medium" style={{ color: GOLD }}>Reserve Agora</p>
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: serif }}>Sua Próxima Estadia Inesquecível</h2>
          <p className="text-white/60 mb-9 max-w-md mx-auto text-sm leading-relaxed">Disponibilidade limitada. Reserve hoje e garanta a melhor tarifa com cancelamento gratuito em até 48h antes do check-in.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <GoldBtn onClick={() => onBook()} lg>Verificar Disponibilidade</GoldBtn>
            <OutlineBtn onClick={onPortal} dark>Já tenho uma reserva</OutlineBtn>
          </div>
        </div>
      </section>

      <footer style={{ backgroundColor: NAVY }} className="px-6 pt-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: GOLD }}><Building2 size={13} className="text-white" /></div>
                <span className="text-white font-bold" style={{ fontFamily: serif }}>Grand Palácio</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">Hospitalidade de excelência no coração de São Paulo desde 1987.</p>
              <div className="flex gap-2">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Icon size={13} className="text-white/60" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color: GOLD }}>Hotel</p>
              {["Sobre nós", "Quartos & Suítes", "Experiências", "Gastronomia", "Eventos"].map((l) => (
                <a key={l} href="#" className="block text-xs text-white/40 hover:text-white/70 mb-2 transition-colors">{l}</a>
              ))}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color: GOLD }}>Suporte</p>
              {["Central de Reservas", "Cancelamentos", "Política de Privacidade", "LGPD", "Termos de Uso"].map((l) => (
                <a key={l} href="#" className="block text-xs text-white/40 hover:text-white/70 mb-2 transition-colors">{l}</a>
              ))}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color: GOLD }}>Contato</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/40"><Phone size={11} />(11) 3344-5500</div>
                <div className="flex items-center gap-2 text-xs text-white/40"><Mail size={11} />contato@grandpalacio.com.br</div>
                <div className="flex items-start gap-2 text-xs text-white/40"><MapPin size={11} className="mt-0.5 flex-shrink-0" />Av. Paulista, 1000<br />São Paulo, SP</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-white/25">© 2025 Grand Palácio Hotel. Todos os direitos reservados.</p>
            <button onClick={onStaff} className="text-xs text-white/20 hover:text-white/40 flex items-center gap-1 transition-colors">
              <Lock size={10} />Acesso para funcionários
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
