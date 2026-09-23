import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Repeat } from 'lucide-react';

const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

export default function Rolagem() {
  const [operacao, setOperacao] = useState('VENDA');
  const [quantidade, setQuantidade] = useState('100');
  const [precoAtual, setPrecoAtual] = useState('');   // preço da posição atual (prêmio recebido/pago)
  const [precoNova, setPrecoNova] = useState('');     // preço da nova posição
  const [strikeAtual, setStrikeAtual] = useState('');
  const [strikeNova, setStrikeNova] = useState('');

  const credito = useMemo(() => {
    const q = Number(quantidade) || 0;
    // Para venda: rolagem = (prêmio atual recomprado) - (prêmio novo recebido)
    // crédito positivo = entra dinheiro
    const pa = Number(precoAtual) || 0;
    const pn = Number(precoNova) || 0;
    return operacao === 'VENDA' ? (pn - pa) * q : (pa - pn) * q;
  }, [operacao, quantidade, precoAtual, precoNova]);

  const strikeDiff = useMemo(() => {
    const a = Number(strikeAtual) || 0;
    const n = Number(strikeNova) || 0;
    return n - a;
  }, [strikeAtual, strikeNova]);

  return (
    <div className="max-w-[800px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center gap-2">
        <Repeat className="w-5 h-5 text-primary" />
        <h1 className="text-xl md:text-2xl font-heading font-bold">Painel de Rolagem</h1>
      </div>
      <p className="text-sm text-muted-foreground">Calcule o crédito/débito de uma rolagem de opções entre strikes e prêmios.</p>

      <Card>
        <CardHeader><CardTitle className="text-base">Posição atual</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Operação</Label>
            <Select value={operacao} onValueChange={setOperacao}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
              <SelectItem value="VENDA">Venda</SelectItem><SelectItem value="COMPRA">Compra</SelectItem>
            </SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>Quantidade</Label><Input type="number" step="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Strike atual</Label><Input type="number" step="0.01" value={strikeAtual} onChange={(e) => setStrikeAtual(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Prêmio atual</Label><Input type="number" step="0.01" value={precoAtual} onChange={(e) => setPrecoAtual(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Nova posição</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Strike novo</Label><Input type="number" step="0.01" value={strikeNova} onChange={(e) => setStrikeNova(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Prêmio novo</Label><Input type="number" step="0.01" value={precoNova} onChange={(e) => setPrecoNova(e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card><CardContent className="p-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Crédito / Débito da rolagem</div>
          <div className={`text-2xl font-heading font-bold ${credito >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>R$ {fmt(credito)}</div>
          <div className="text-xs text-muted-foreground mt-1">{credito >= 0 ? 'Crédito (entra dinheiro)' : 'Débito (sai dinheiro)'}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Diferença de strike</div>
          <div className="text-2xl font-heading font-bold">{strikeDiff >= 0 ? '+' : ''}{fmt(strikeDiff)}</div>
          <div className="text-xs text-muted-foreground mt-1">{strikeDiff > 0 ? 'Rolagem para cima' : strikeDiff < 0 ? 'Rolagem para baixo' : 'Mesmo strike'}</div>
        </div>
      </CardContent></Card>
    </div>
  );
}