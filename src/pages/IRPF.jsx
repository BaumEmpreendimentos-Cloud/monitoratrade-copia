import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt, FileText } from 'lucide-react';
import { apurarImpostoRenda, mesLabel, CATEGORIAS_FISCAIS } from '@/lib/imposto';
import { useToast } from '@/components/ui/use-toast';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function IRPF() {
  const { toast } = useToast();
  const [ops, setOps] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mesInicio, setMesInicio] = useState('');
  const [prejuizoSwing, setPrejuizoSwing] = useState('');
  const [prejuizoDt, setPrejuizoDt] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, cfgs] = await Promise.all([
        base44.entities.Operacao.filter({ status: 'FECHADA' }, '-data_fechamento', 5000),
        base44.entities.ConfiguracaoFiscal.list('-created_date', 10),
      ]);
      setOps(o || []);
      const cfg = (cfgs && cfgs[0]) || null;
      setConfig(cfg);
      if (cfg) {
        setMesInicio(cfg.mes_inicio || '');
        setPrejuizoSwing(cfg.prejuizo_swing ?? '');
        setPrejuizoDt(cfg.prejuizo_dt ?? '');
      }
    } catch (e) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const data = {
        mes_inicio: mesInicio,
        prejuizo_swing: Number(prejuizoSwing) || 0,
        prejuizo_dt: Number(prejuizoDt) || 0,
        onboarding_completo: true,
      };
      if (config?.id) {
        await base44.entities.ConfiguracaoFiscal.update(config.id, data);
      } else {
        const created = await base44.entities.ConfiguracaoFiscal.create(data);
        setConfig(created);
      }
      toast({ title: 'Configuração fiscal salva' });
      await load();
    } catch (e) { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const apuracoes = config?.mes_inicio ? apurarImpostoRenda(ops, config) : [];
  const totalAPagar = apuracoes.reduce((s, a) => s + (a.impostoAPagar || 0), 0);

  return (
    <div className="max-w-[1000px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center gap-2">
        <Receipt className="w-5 h-5 text-primary" />
        <h1 className="text-xl md:text-2xl font-heading font-bold">Imposto de Renda</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Configuração fiscal</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label htmlFor="mesInicio">Mês inicial (YYYY-MM)</Label><Input id="mesInicio" value={mesInicio} onChange={(e) => setMesInicio(e.target.value)} placeholder="2026-01" /></div>
            <div className="space-y-1.5"><Label htmlFor="pjSwing">Prejuízo acum. (swing)</Label><Input id="pjSwing" type="number" step="0.01" value={prejuizoSwing} onChange={(e) => setPrejuizoSwing(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="pjDt">Prejuízo acum. (day trade)</Label><Input id="pjDt" type="number" step="0.01" value={prejuizoDt} onChange={(e) => setPrejuizoDt(e.target.value)} /></div>
          </div>
          <Button size="sm" onClick={saveConfig} disabled={saving || !mesInicio}>{saving ? 'Salvando…' : 'Salvar configuração'}</Button>
        </CardContent>
      </Card>

      <Card><CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Total de imposto a pagar</div>
          <div className="text-2xl font-heading font-bold">R$ {fmt(totalAPagar)}</div>
        </div>
        <FileText className="w-8 h-8 text-muted-foreground" />
      </CardContent></Card>

      {!config?.mes_inicio ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Defina o mês inicial de apuração para calcular o imposto.</CardContent></Card>
      ) : apuracoes.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">Nenhuma apuração no período. Encerre operações para gerar apuração de IR.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {apuracoes.map((a, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-heading font-semibold">{mesLabel(a.mes)} · {a.tipo}</div>
                  <span className="text-xs text-muted-foreground">{a.totalOperacoes} operações</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Resultado: </span><span className={a.resultadoBruto >= 0 ? 'text-emerald-600' : 'text-red-600'}>R$ {fmt(a.resultadoBruto)}</span></div>
                  <div><span className="text-muted-foreground">IRRF: </span>R$ {fmt(a.irrf)}</div>
                  <div><span className="text-muted-foreground">Prejuízo comp.: </span>R$ {fmt(a.prejuizoCompensado)}</div>
                  <div><span className="text-muted-foreground">Alíquota: </span>{(a.aliquota * 100).toFixed(0)}%</div>
                  <div><span className="text-muted-foreground">Imposto devido: </span>R$ {fmt(a.impostoDevido)}</div>
                  <div className="md:col-span-3"><span className="text-muted-foreground">Imposto a pagar: </span><span className="font-semibold">R$ {fmt(a.impostoAPagar)}</span></div>
                </div>
                {Object.keys(a.breakdown).length > 0 && (
                  <div className="text-xs text-muted-foreground pt-1 border-t">
                    {Object.entries(a.breakdown).map(([k, v]) => (
                      <span key={k} className="mr-3">{CATEGORIAS_FISCAIS[k]?.label || k}: <span className={v >= 0 ? 'text-emerald-600' : 'text-red-600'}>R$ {fmt(v)}</span></span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}