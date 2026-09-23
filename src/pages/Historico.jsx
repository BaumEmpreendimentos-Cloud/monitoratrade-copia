import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Plus, Receipt } from 'lucide-react';
import { calcResultadoValor, calcResultadoPct } from '@/lib/operacoes';

const fmt = (v) => (v === null || v === undefined || v === '' ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const color = (v) => (v === null || v === undefined ? '' : v >= 0 ? 'text-emerald-600' : 'text-red-600');

export default function Historico() {
  const [ops, setOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroGrupo, setFiltroGrupo] = useState('all');
  const [filtroAtivo, setFiltroAtivo] = useState('');
  const [grupos, setGrupos] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, g] = await Promise.all([
        base44.entities.Operacao.filter({ status: 'FECHADA' }, '-data_fechamento', 5000),
        base44.entities.GrupoOperacao.list(),
      ]);
      setOps(o || []); setGrupos(g || []);
    } catch (e) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = ops.filter((o) =>
    (filtroGrupo === 'all' || o.grupo_id === filtroGrupo) &&
    (!filtroAtivo || (o.ativo || '').toUpperCase().includes(filtroAtivo.toUpperCase()))
  );

  const total = filtered.reduce((s, o) => s + (o.resultado_valor || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-heading font-bold">Histórico</h1>
        <Link to="/importar-historico"><Button variant="outline" size="sm"><Plus className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Importar</span></Button></Link>
      </div>

      <Card><CardContent className="p-4">
        <div className="text-sm text-muted-foreground">Resultado realizado total</div>
        <div className={`text-2xl font-heading font-bold ${color(total)}`}>R$ {fmt(total)}</div>
        <div className="text-xs text-muted-foreground mt-1">{filtered.length} operações encerradas</div>
      </CardContent></Card>

      <div className="flex gap-2 flex-wrap">
        <Select value={filtroGrupo} onValueChange={setFiltroGrupo}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Grupo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os grupos</SelectItem>
            {grupos.map((g) => <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input placeholder="Filtrar por ativo…" value={filtroAtivo} onChange={(e) => setFiltroAtivo(e.target.value)} className="w-[160px]" />
      </div>

      <Card><CardContent className="p-0 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Receipt className="w-8 h-8 opacity-40" />
            Nenhuma operação encerrada.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="text-left font-medium p-2">Grupo</th>
                <th className="text-left font-medium p-2">Ativo</th>
                <th className="text-left font-medium p-2">Op</th>
                <th className="text-right font-medium p-2">Qtd</th>
                <th className="text-right font-medium p-2">Entrada</th>
                <th className="text-right font-medium p-2">Fechamento</th>
                <th className="text-left font-medium p-2">Data</th>
                <th className="text-right font-medium p-2">Resultado</th>
                <th className="text-right font-medium p-2">%</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t hover:bg-muted/30">
                  <td className="p-2 truncate max-w-[160px]">{o.grupo_nome}</td>
                  <td className="p-2 font-medium">{o.ativo}</td>
                  <td className="p-2">{o.operacao === 'COMPRA' ? 'Compra' : 'Venda'}</td>
                  <td className="p-2 text-right">{o.quantidade}</td>
                  <td className="p-2 text-right">{fmt(o.preco_entrada)}</td>
                  <td className="p-2 text-right">{fmt(o.preco_fechamento)}</td>
                  <td className="p-2 text-xs">{o.data_fechamento ? new Date(o.data_fechamento).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className={`p-2 text-right font-medium ${color(o.resultado_valor)}`}>{fmt(o.resultado_valor)}</td>
                  <td className={`p-2 text-right ${color(o.resultado_pct)}`}>{o.resultado_pct != null ? `${o.resultado_pct >= 0 ? '+' : ''}${o.resultado_pct.toFixed(2)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent></Card>
    </div>
  );
}