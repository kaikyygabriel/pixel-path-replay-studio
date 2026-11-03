import { useState, type ReactNode } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronsUpDown, Lock, MapPin, X } from "lucide-react";
import { useCheckout, type Address, type Customer } from "@/lib/checkout";
import { UFS, digits, isValidCpf, isValidEmail, maskCep, maskCpf, maskPhone } from "@/lib/br";

const field = "h-[54px] w-full rounded-xl bg-field px-4 text-[16px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40";

function Shell({ title, onClose, onBack, children }: { title: string; onClose: () => void; onBack?: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay">
      <div className="flex max-h-[92dvh] w-full max-w-[480px] flex-col rounded-t-3xl bg-background">
        <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-border px-3 py-3">
          {onBack ? (
            <button aria-label="Voltar" onClick={onBack} className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><ArrowLeft className="h-5 w-5" /></button>
          ) : <span />}
          <h2 className="text-center text-[21px] font-extrabold">{title}</h2>
          <button aria-label="Fechar" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Steps({ step }: { step: 1 | 2 }) {
  const dot = (n: number, done: boolean, active: boolean) => (
    <span className={`grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold ${done ? "bg-success text-primary-foreground" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
      {done ? <Check className="h-3.5 w-3.5" /> : n}
    </span>
  );
  return (
    <div className="flex items-center gap-2 px-4 py-4 text-[14px]">
      {dot(1, step === 2, step === 1)}
      <span className={step === 2 ? "text-success" : ""}>Seus dados</span>
      <span className="h-px flex-1 bg-border" />
      {dot(2, false, step === 2)}
      <span className={step === 2 ? "" : "text-muted-foreground"}>Endereço</span>
    </div>
  );
}

export function CustomerSheet({ onClose, onNext }: { onClose: () => void; onNext: () => void }) {
  const { state, update } = useCheckout();
  const [c, setC] = useState<Customer>(state.customer ?? { name: "", phone: "", email: "" });
  const [err, setErr] = useState<Partial<Record<keyof Customer, string>>>({});
  function submit() {
    const e: typeof err = {};
    if (c.name.trim().split(/\s+/).length < 2) e.name = "Informe nome e sobrenome";
    if (digits(c.phone).length < 10) e.phone = "Telefone inválido";
    if (!isValidEmail(c.email)) e.email = "E-mail inválido";
    setErr(e);
    if (Object.keys(e).length) return;
    update({ customer: c });
    onNext();
  }
  const Err = ({ k }: { k: keyof Customer }) => (err[k] ? <p className="mt-1 text-[12px] text-primary">{err[k]}</p> : null);
  return (
    <Shell title="Seus dados" onClose={onClose}>
      <Steps step={1} />
      <div className="flex-1 space-y-3.5 overflow-y-auto px-6 py-5">
        <div>
          <input aria-label="Nome e sobrenome" className={field} placeholder="Nome e sobrenome" autoComplete="name" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
          <Err k="name" />
        </div>
        <div>
          <div className="flex h-[54px] items-center rounded-xl bg-field">
            <span className="flex items-center gap-1.5 border-r border-border px-4 text-[15px]">BR +55 <ChevronDown className="h-3.5 w-3.5" /></span>
            <input aria-label="Número de telefone" inputMode="tel" autoComplete="tel-national" className="h-full min-w-0 flex-1 bg-transparent px-4 text-[16px] outline-none placeholder:text-muted-foreground" placeholder="Número de telefone" value={c.phone} onChange={(e) => setC({ ...c, phone: maskPhone(e.target.value) })} />
          </div>
          <Err k="phone" />
        </div>
        <div>
          <input aria-label="E-mail" type="email" autoComplete="email" className={field} placeholder="E-mail" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
          <Err k="email" />
        </div>
        <p className="flex items-center justify-center gap-1.5 pt-8 text-[12px] text-muted-foreground"><Lock className="h-3.5 w-3.5 text-success" />Seus dados são usados para pagamento e entrega.</p>
      </div>
      <div className="border-t border-border px-4 pb-safe pt-3">
        <button onClick={submit} className="w-full rounded-full bg-primary py-3.5 text-[17px] font-extrabold text-primary-foreground">Continuar para o endereço</button>
      </div>
    </Shell>
  );
}

const emptyAddr: Address = { cep: "", street: "", number: "", complement: "", district: "", city: "", uf: "", cpf: "", isDefault: true };

export function AddressSheet({ onClose, onBack, onDone }: { onClose: () => void; onBack: () => void; onDone: () => void }) {
  const { state, update } = useCheckout();
  const [a, setA] = useState<Address>(state.address ?? emptyAddr);
  const [err, setErr] = useState<Record<string, string>>({});
  const [cepNote, setCepNote] = useState<string | null>(null);

  async function lookup(cep: string) {
    if (digits(cep).length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits(cep)}/json/`);
      const j = await r.json();
      if (j.erro) return setCepNote("CEP não encontrado");
      setCepNote(null);
      setA((p) => ({ ...p, street: j.logradouro || p.street, district: j.bairro || p.district, city: j.localidade || p.city, uf: j.uf || p.uf }));
    } catch {
      setCepNote("Não foi possível buscar o CEP");
    }
  }
  function submit() {
    const e: Record<string, string> = {};
    if (digits(a.cep).length !== 8) e.cep = "CEP inválido";
    if (!a.street.trim()) e.street = "Obrigatório";
    if (!a.number.trim()) e.number = "Obrigatório";
    if (!a.district.trim()) e.district = "Obrigatório";
    if (!a.city.trim()) e.city = "Obrigatório";
    if (!a.uf) e.uf = "Obrigatório";
    if (!isValidCpf(a.cpf)) e.cpf = "CPF inválido";
    setErr(e);
    if (Object.keys(e).length) return;
    update({ address: a });
    onDone();
  }
  const bad = (k: string) => (err[k] ? "ring-2 ring-primary" : "");
  return (
    <Shell title="Endereço de entrega" onClose={onClose} onBack={onBack}>
      <Steps step={2} />
      <div className="flex-1 space-y-3.5 overflow-y-auto px-6 pb-4 pt-3">
        <div className="flex items-center gap-2 text-[14px] font-bold text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />DIGITE SEU CEP — PREENCHEMOS O RESTO</div>
        <input aria-label="CEP" inputMode="numeric" autoComplete="postal-code" className={`${field} ${bad("cep")}`} placeholder="00000-000" value={a.cep} onChange={(e) => { const v = maskCep(e.target.value); setA({ ...a, cep: v }); lookup(v); }} />
        {cepNote && <p className="text-[12px] text-primary">{cepNote}</p>}
        <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer" className="block text-[14px] text-primary">Não sei meu CEP</a>
        <input aria-label="Rua" className={`${field} ${bad("street")}`} placeholder="Av. Paulista" value={a.street} onChange={(e) => setA({ ...a, street: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input aria-label="Número" className={`${field} ${bad("number")}`} placeholder="123" value={a.number} onChange={(e) => setA({ ...a, number: e.target.value })} />
          <div>
            <input aria-label="Complemento" className={field} placeholder="Apto, bloco" value={a.complement} onChange={(e) => setA({ ...a, complement: e.target.value })} />
            <span className="text-[12px] text-muted-foreground">Opcional</span>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_0.85fr_0.6fr] gap-3">
          <input aria-label="Bairro" className={`${field} ${bad("district")}`} placeholder="Bairro" value={a.district} onChange={(e) => setA({ ...a, district: e.target.value })} />
          <input aria-label="Cidade" className={`${field} ${bad("city")}`} placeholder="Cidade" value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} />
          <div className={`relative rounded-xl bg-field ${bad("uf")}`}>
            <select aria-label="UF" value={a.uf} onChange={(e) => setA({ ...a, uf: e.target.value })} className="h-[54px] w-full appearance-none bg-transparent pl-4 pr-8 text-[16px] outline-none">
              <option value="">UF</option>
              {UFS.map((u) => <option key={u}>{u}</option>)}
            </select>
            <ChevronsUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
          </div>
        </div>
        <hr />
        <div className="text-[15px] font-semibold text-muted-foreground">Informações fiscais</div>
        <input aria-label="CPF" inputMode="numeric" className={`${field} ${bad("cpf")}`} placeholder="000.000.000-00" value={a.cpf} onChange={(e) => setA({ ...a, cpf: maskCpf(e.target.value) })} />
        <p className="text-[14px] text-muted-foreground">{err.cpf ?? "O CPF será usado para emitir faturas."}</p>
        <div className="text-[15px] font-semibold text-muted-foreground">Configurações</div>
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold">Definir como padrão</span>
          <button role="switch" aria-checked={a.isDefault} aria-label="Definir como padrão" onClick={() => setA({ ...a, isDefault: !a.isDefault })} className={`relative h-[30px] w-[52px] rounded-full transition-colors ${a.isDefault ? "bg-teal" : "bg-border"}`}>
            <span className={`absolute top-[3px] h-6 w-6 rounded-full bg-background transition-all ${a.isDefault ? "left-[25px]" : "left-[3px]"}`} />
          </button>
        </div>
      </div>
      <div className="border-t border-border px-4 pb-safe pt-3">
        <button onClick={submit} className="w-full rounded-full bg-primary py-3.5 text-[17px] font-extrabold text-primary-foreground">Salvar endereço</button>
      </div>
    </Shell>
  );
}
