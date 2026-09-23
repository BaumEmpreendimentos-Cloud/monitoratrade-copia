import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, History } from 'lucide-react';

const fmt = (v) => (v === null || v === undefined || v === '' ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

function Stat({ label, value, sub, icon: Icon, tone }) {
  const color = tone === 'pos' ? 'text-emerald-600' : tone === 'neg' ? 'text-red-600' : 'text-foreground';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className={`mt-1 text-xl font-heading font-bold ${color}`}>R$ {fmt(value)}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function DashboardOperacoes({ totalDia, totalAberto, totalHist, totalDiv, total }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Stat label="Variação do dia" value={totalDia} tone={totalDia >= 0 ? 'pos' : 'neg'} icon={totalDia >= 0 ? TrendingUp : TrendingDown} />
      <Stat label="Resultado aberto" value={totalAberto} tone={totalAberto >= 0 ? 'pos' : 'neg'} icon={Wallet} />
      <Stat label="Realizado (histórico)" value={totalHist} tone={totalHist >= 0 ? 'pos' : 'neg'} icon={History} />
      <Stat label="Dividendos" value={totalDiv} tone="pos" icon={TrendingUp} />
      <Stat label="Total geral" value={total} tone={total >= 0 ? 'pos' : 'neg'} icon={Wallet} />
    </div>
  );
}