import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TrendingUp } from 'lucide-react';

const fmt = (v) => (v === null || v === undefined || v === '' ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

export default function Cotacoes() {
  const { user } = useAuth();
  const [tickers, setTickers] = useState([]);
  const [precos, setPrecos] = useState({});

  useEffect(() => {
    const list = (user?.tracked_tickers || []).map((t) => t.symbol);
    setTickers(list);
    const stored = {};
    list.forEach((s) => { const v = localStorage.getItem(`cot_${s}`); if (v) stored[s] = Number(v); });
    setPrecos(stored);
  }, [user]);

  const setPreco = (s, v) => {
    setPrecos((p) => ({ ...p, [s]: v === '' ? undefined : Number(v) }));
    if (v === '') localStorage.removeItem(`cot_${s}`);
    else localStorage.setItem(`cot_${s}`, v);
  };

  return (
    <div className="max-w-[800px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h1 className="text-xl md:text-2xl font-heading font-bold">Cotações</h1>
      </div>
      <p className="text-sm text-muted-foreground">Informe manualmente os preços dos ativos que você acompanha. Configure seus ativos em Configurações.</p>

      {tickers.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Nenhum ativo acompanhado. Adicione ativos em Configurações.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {tickers.map((s) => (
            <Card key={s}><CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-heading font-semibold">{s}</div>
                <div className="text-xs text-muted-foreground">Preço atual</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-heading font-bold">R$ {fmt(precos[s])}</span>
                <Input type="number" step="0.01" value={precos[s] ?? ''} onChange={(e) => setPreco(s, e.target.value)} className="w-24" placeholder="—" />
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}