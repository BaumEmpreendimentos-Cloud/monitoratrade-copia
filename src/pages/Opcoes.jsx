import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, TrendingUp } from 'lucide-react';
import { calcIntrinseco, calcExtrinseco, calcResultadoOpcaoUnderlying, businessDaysUntil, calcMoneyness } from '@/lib/operacoes';

const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

export default function Opcoes() {
  const [categoria, setCategoria] = useState('CALL');
  const [operacao, setOperacao] = useState('COMPRA');
  const [strike, setStrike] = useState('');
  const [premio, setPremio] = useState('');
  const [quantidade, setQuantidade] = useState('100');
  const [underlying, setUnderlying] = useState('');
  const [vencimento, setVencimento] = useState('');

  const intrinseco = calcIntrinseco(categoria, Number(strike), Number(underlying));
  const extrinseco = calcExtrinseco(categoria, Number(strike), Number(premio), Number(underlying));
  const moneyness = calcMoneyness(categoria, Number(strike), Number(underlying));
  const dias = businessDaysUntil(vencimento);
  const resultado = calcResultadoOpcaoUnderlying(categoria, operacao, Number(strike), Number(premio), Number(quantidade), Number(underlying));
  const custo = (Number(premio) || 0) * (Number(quantidade) || 0);

  return (
    <div className="max-w-[900px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary" />
        <h1 className="text-xl md:text-2xl font-heading font-bold">Simulador de Opções</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Parâmetros</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Tipo</Label>
            <Select value={categoria} onValueChange={setCategoria}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="CALL">Call</SelectItem><SelectItem value="PUT">Put</SelectItem>
            </SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Operação</Label>
            <Select value={operacao} onValueChange={setOperacao}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="COMPRA">Compra</SelectItem><SelectItem value="VENDA">Venda</SelectItem>
            </SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Strike</Label><Input type="number" step="0.01" value={strike} onChange={(e) => setStrike(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Prêmio (preço)</Label><Input type="number" step="0.01" value={premio} onChange={(e) => setPremio(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Quantidade</Label><Input type="number" step="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Preço do ativo (underlying)</Label><Input type="number" step="0.01" value={underlying} onChange={(e) => setUnderlying(e.target.value)} /></div>
          <div className="space-y-1.5 md:col-span-3"><Label>Vencimento</Label><Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} /></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Valor intrínseco</div><div className="text-lg font-heading font-bold">R$ {fmt(intrinseco)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Valor extrínseco</div><div className="text-lg font-heading font-bold">R$ {fmt(extrinseco)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Moneyness</div><div className="text-lg font-heading font-bold">{moneyness || '—'}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Dias úteis ao venc.</div><div className="text-lg font-heading font-bold">{dias ?? '—'}</div></CardContent></Card>
      </div>

      <Card><CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Resultado no vencimento</div>
          <div className={`text-2xl font-heading font-bold ${resultado == null ? '' : resultado >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>R$ {fmt(resultado)}</div>
          <div className="text-xs text-muted-foreground mt-1">Custo da operação: R$ {fmt(custo)}</div>
        </div>
        <TrendingUp className="w-8 h-8 text-muted-foreground" />
      </CardContent></Card>
    </div>
  );
}