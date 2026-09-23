import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Plus, Pencil, ChevronDown, ChevronRight, Trash2, Bell, BellRing, Coins, Repeat, Receipt, Layers } from 'lucide-react';
import OperacaoForm from '@/components/operacoes/OperacaoForm';
import EncerrarDialog from '@/components/operacoes/EncerrarDialog';
import EditarOperacaoDialog from '@/components/operacoes/EditarOperacaoDialog';
import EditarIdentificadorDialog from '@/components/operacoes/EditarIdentificadorDialog';
import DividendoForm from '@/components/operacoes/DividendoForm';
import AlertaForm from '@/components/operacoes/AlertaForm';
import DashboardOperacoes from '@/components/operacoes/DashboardOperacoes';
import { calcValorInicial, calcResultadoValor, calcResultadoPct, calcExtrinseco, businessDaysUntil, moneynessRowClass, calcMoneyness } from '@/lib/operacoes';
import { Link } from 'react-router-dom';

const fmt = (v) => (v === null || v === undefined || v === '' ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const fmtPct = (v) => (v === null || v === undefined || v === '' ? '—' : `${Number(v) >= 0 ? '+' : ''}${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`);
const color = (v) => (v === null || v === undefined ? '' : v >= 0 ? 'text-emerald-600' : 'text-red-600');
const isOption = (c) => c === 'CALL' || c === 'PUT';

export default function Operacoes() {
  const [grupos, setGrupos] = useState([]);
  const [ops, setOps] = useState([]);
  const [manualPrices, setManualPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [simFormOpen, setSimFormOpen] = useState(false);
  const [encerrar, setEncerrar] = useState(null);
  const [editarOp, setEditarOp] = useState(null);
  const [editarGrupo, setEditarGrupo] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [dividendoGrupo, setDividendoGrupo] = useState(null);
  const [alertaGrupo, setAlertaGrupo] = useState(null);
  const [alertaOp, setAlertaOp] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [dividendos, setDividendos] = useState([]);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [g, o, d, a] = await Promise.all([
        base44.entities.GrupoOperacao.list(),
        base44.entities.Operacao.list('-created_date', 5000),
        base44.entities.Dividendo.list('-created_date', 5000),
        base44.entities.Alerta.filter({ status: 'ATIVO' }),
      ]);
      setGrupos(g || []); setOps(o || []); setDividendos(d || []); setAlertas(a || []);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openOps = ops.filter((o) => o.status === 'ABERTA');
  const closedOps = ops.filter((o) => o.status === 'FECHADA');
  const groupsWithOpen = grupos.filter((g) => openOps.some((o) => o.grupo_id === g.id));

  const currentPrice = (o) => manualPrices[o.ativo] ?? null;
  const groupAberto = (id) => openOps.filter((o) => o.grupo_id === id).reduce((s, o) => {
    const r = calcResultadoValor(o.operacao, o.quantidade, o.preco_entrada, currentPrice(o));
    return s + (r || 0);
  }, 0);
  const groupHistorico = (id) => closedOps.filter((o) => o.grupo_id === id).reduce((s, o) => s + (o.resultado_valor || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const isDivPendente = (d) => d.data_pagamento > todayStr;
  const groupDivPendente = (id) => dividendos.filter((d) => d.grupo_id === id && isDivPendente(d)).reduce((s, d) => s + (d.valor_total || 0), 0);
  const groupDivPago = (id) => dividendos.filter((d) => d.grupo_id === id && !isDivPendente(d)).reduce((s, d) => s + (d.valor_total || 0), 0);
  const totalDivPendente = dividendos.filter(isDivPendente).reduce((s, d) => s + (d.valor_total || 0), 0);
  const totalDivPago = dividendos.filter((d) => !isDivPendente(d)).reduce((s, d) => s + (d.valor_total || 0), 0);

  const totalHist = closedOps.reduce((s, o) => s + (o.resultado_valor || 0), 0);
  const totalAberto = openOps.reduce((s, o) => s + (calcResultadoValor(o.operacao, o.quantidade, o.preco_entrada, currentPrice(o)) || 0), 0);
  const totalEncerradas = totalHist + totalDivPago;
  const totalTotal = totalEncerradas + totalAberto + totalDivPendente;

  const hasAlertaGrupo = (gid) => alertas.some((a) => a.grupo_id === gid);
  const hasAlertaOp = (oid) => alertas.some((a) => a.operacao_id === oid);
  const refreshAlertas = () => base44.entities.Alerta.filter({ status: 'ATIVO' }).then(setAlertas).catch(() => {});

  const handleCreate = async (dados) => {
    setError('');
    try {
      let grupo = grupos.find((g) => g.nome.toLowerCase() === dados.identificador.toLowerCase());
      if (!grupo) {
        grupo = await base44.entities.GrupoOperacao.create({ nome: dados.identificador });
        setGrupos((p) => [...p, grupo]);
      }
      const valorInicial = calcValorInicial(dados.operacao, dados.quantidade, dados.precoEntrada);
      const nova = await base44.entities.Operacao.create({
        grupo_id: grupo.id, grupo_nome: grupo.nome, ativo: dados.ativo, ativo_base: dados.ativo_base,
        categoria: dados.categoria, operacao: dados.operacao, quantidade: dados.quantidade,
        preco_entrada: dados.precoEntrada, valor_inicial: valorInicial, data_abertura: dados.dataAbertura,
        strike: dados.strike, vencimento: dados.vencimento, status: 'ABERTA', simulada: dados.simulada || false,
      });
      setOps((p) => [...p, nova]);
      setFormOpen(false); setSimFormOpen(false);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  const handleEncerrar = async (preco, irrf) => {
    const o = encerrar;
    if (!o) return;
    try {
      const updated = await base44.entities.Operacao.update(o.id, {
        status: 'FECHADA', preco_fechamento: preco, irrf: irrf || 0,
        resultado_valor: calcResultadoValor(o.operacao, o.quantidade, o.preco_entrada, preco),
        resultado_pct: calcResultadoPct(o.operacao, o.preco_entrada, preco),
        data_fechamento: new Date().toISOString(),
      });
      setOps((p) => p.map((x) => (x.id === o.id ? updated : x)));
      setEncerrar(null);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  const handleEditarOperacao = async (dados) => {
    const o = editarOp;
    if (!o) return;
    setError('');
    try {
      const valorInicial = calcValorInicial(dados.operacao, dados.quantidade, dados.precoEntrada);
      const updated = await base44.entities.Operacao.update(o.id, {
        ativo: dados.ativo, ativo_base: dados.ativo_base, categoria: dados.categoria, operacao: dados.operacao,
        quantidade: dados.quantidade, preco_entrada: dados.precoEntrada, valor_inicial: valorInicial,
        data_abertura: dados.dataAbertura, strike: dados.strike, vencimento: dados.vencimento,
      });
      setOps((p) => p.map((x) => (x.id === o.id ? updated : x)));
      setEditarOp(null);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  const handleEditarIdentificador = async (novoNome) => {
    const g = editarGrupo;
    if (!g) return;
    setError('');
    try {
      await base44.entities.GrupoOperacao.update(g.id, { nome: novoNome });
      setGrupos((p) => p.map((x) => (x.id === g.id ? { ...x, nome: novoNome } : x)));
      await base44.entities.Operacao.updateMany({ grupo_id: g.id }, { $set: { grupo_nome: novoNome } });
      setOps((p) => p.map((x) => (x.grupo_id === g.id ? { ...x, grupo_nome: novoNome } : x)));
      setEditarGrupo(null);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  const handleDeleteOp = async (o) => {
    if (!confirm(`Excluir operação ${o.ativo}?`)) return;
    try {
      await base44.entities.Operacao.delete(o.id);
      setOps((p) => p.filter((x) => x.id !== o.id));
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  const handleDividendo = async (dados) => {
    const g = dividendoGrupo;
    if (!g) return;
    try {
      const novo = await base44.entities.Dividendo.create({ grupo_id: g.id, grupo_nome: g.nome, ...dados });
      setDividendos((p) => [...p, novo]);
      setDividendoGrupo(null);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  const handleAlerta = async (dados) => {
    try {
      await base44.entities.Alerta.create(dados);
      await refreshAlertas();
      setAlertaGrupo(null); setAlertaOp(null);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-heading font-bold">Operações</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSimFormOpen(true)}><Layers className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Simular</span></Button>
          <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Nova</span></Button>
        </div>
      </div>

      <DashboardOperacoes totalDia={0} totalAberto={totalAberto} totalHist={totalEncerradas} totalDiv={totalDivPago + totalDivPendente} total={totalTotal} />

      {error && <div className="text-sm text-destructive bg-destructive/10 rounded-md p-2">{error}</div>}

      {groupsWithOpen.length === 0 && !loading && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          Nenhuma operação aberta. Clique em <strong>Nova</strong> para registrar sua primeira operação.
        </CardContent></Card>
      )}

      <div className="space-y-3">
        {groupsWithOpen.map((g) => {
          const gOps = openOps.filter((o) => o.grupo_id === g.id);
          const aberto = groupAberto(g.id);
          const hist = groupHistorico(g.id);
          const divPend = groupDivPendente(g.id);
          const divPago = groupDivPago(g.id);
          const exp = expanded[g.id];
          return (
            <Card key={g.id}>
              <CardContent className="p-0">
                <div className="flex items-center gap-2 p-3">
                  <button onClick={() => toggleExpand(g.id)} className="p-1">
                    {exp ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-semibold truncate">{g.nome}</span>
                      {hasAlertaGrupo(g.id) && <BellRing className="w-3.5 h-3.5 text-amber-500" />}
                      <span className="text-xs text-muted-foreground">{gOps.length} {gOps.length === 1 ? 'operação' : 'operações'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${color(aberto)}`}>R$ {fmt(aberto)}</div>
                    <div className="text-xs text-muted-foreground">Hist: <span className={color(hist)}>R$ {fmt(hist)}</span></div>
                  </div>
                </div>

                {exp && (
                  <div className="border-t overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-xs text-muted-foreground">
                        <tr>
                          <th className="text-left font-medium p-2">Ativo</th>
                          <th className="text-left font-medium p-2">Op</th>
                          <th className="text-right font-medium p-2">Qtd</th>
                          <th className="text-right font-medium p-2">Entrada</th>
                          <th className="text-right font-medium p-2">Atual</th>
                          <th className="text-right font-medium p-2">Resultado</th>
                          <th className="text-right font-medium p-2">%</th>
                          <th className="text-right font-medium p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gOps.map((o) => {
                          const cur = currentPrice(o);
                          const res = calcResultadoValor(o.operacao, o.quantidade, o.preco_entrada, cur);
                          const pct = calcResultadoPct(o.operacao, o.preco_entrada, cur);
                          const mn = isOption(o.categoria) && o.ativo_base ? calcMoneyness(o.categoria, o.strike, manualPrices[o.ativo_base]) : null;
                          return (
                            <tr key={o.id} className={`border-t ${moneynessRowClass(o.categoria, o.strike, manualPrices[o.ativo_base])}`}>
                              <td className="p-2">
                                <div className="font-medium">{o.ativo}</div>
                                {isOption(o.categoria) && <div className="text-xs text-muted-foreground">{o.categoria} K{o.strike} · {o.vencimento}{mn ? ` · ${mn}` : ''}</div>}
                              </td>
                              <td className="p-2">{o.operacao === 'COMPRA' ? 'C' : 'V'}</td>
                              <td className="p-2 text-right">{o.quantidade}</td>
                              <td className="p-2 text-right">{fmt(o.preco_entrada)}</td>
                              <td className="p-2 text-right">
                                <input
                                  type="number" step="0.01" min="0"
                                  value={manualPrices[o.ativo] ?? ''}
                                  onChange={(e) => setManualPrices((p) => ({ ...p, [o.ativo]: e.target.value === '' ? null : Number(e.target.value) }))}
                                  className="w-20 text-right bg-transparent border rounded px-1 py-0.5 text-sm"
                                  placeholder="—"
                                />
                              </td>
                              <td className={`p-2 text-right font-medium ${color(res)}`}>{fmt(res)}</td>
                              <td className={`p-2 text-right ${color(pct)}`}>{fmtPct(pct)}</td>
                              <td className="p-2 text-right">
                                <div className="flex justify-end gap-1">
                                  <button onClick={() => setAlertaOp(o)} className="p-1 hover:bg-accent rounded" title="Alerta"><Bell className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => setEditarOp(o)} className="p-1 hover:bg-accent rounded" title="Editar"><Pencil className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => setEncerrar(o)} className="p-1 hover:bg-accent rounded text-emerald-600" title="Encerrar"><Repeat className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeleteOp(o)} className="p-1 hover:bg-accent rounded text-red-600" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="flex flex-wrap gap-2 p-2 border-t bg-muted/30">
                      <Button variant="ghost" size="sm" onClick={() => setEditarGrupo(g)}><Pencil className="w-3.5 h-3.5 mr-1" /> Renomear</Button>
                      <Button variant="ghost" size="sm" onClick={() => setDividendoGrupo(g)}><Coins className="w-3.5 h-3.5 mr-1" /> Dividendo</Button>
                      <Button variant="ghost" size="sm" onClick={() => setAlertaGrupo(g)}><Bell className="w-3.5 h-3.5 mr-1" /> Alerta</Button>
                      <Link to="/historico"><Button variant="ghost" size="sm"><Receipt className="w-3.5 h-3.5 mr-1" /> Histórico</Button></Link>
                      <Link to="/rolagem"><Button variant="ghost" size="sm"><Repeat className="w-3.5 h-3.5 mr-1" /> Rolagem</Button></Link>
                      <Link to="/irpf"><Button variant="ghost" size="sm">IRPF</Button></Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <OperacaoForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} grupos={grupos} />
      <OperacaoForm open={simFormOpen} onClose={() => setSimFormOpen(false)} onSubmit={handleCreate} grupos={grupos} simulada />
      <EncerrarDialog operacao={encerrar} onClose={() => setEncerrar(null)} onConfirm={handleEncerrar} />
      <EditarOperacaoDialog operacao={editarOp} onClose={() => setEditarOp(null)} onConfirm={handleEditarOperacao} />
      <EditarIdentificadorDialog grupo={editarGrupo} onClose={() => setEditarGrupo(null)} onConfirm={handleEditarIdentificador} />
      <DividendoForm grupo={dividendoGrupo} onClose={() => setDividendoGrupo(null)} onConfirm={handleDividendo} />
      <AlertaForm open={!!alertaGrupo || !!alertaOp} onClose={() => { setAlertaGrupo(null); setAlertaOp(null); }} onConfirm={handleAlerta} grupo={alertaGrupo} operacao={alertaOp} />
    </div>
  );
}