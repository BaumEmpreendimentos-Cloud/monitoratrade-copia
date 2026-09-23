import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { calcValorInicial, calcResultadoValor, calcResultadoPct } from '@/lib/operacoes';

// Parsing simples de CSV para texto -> array de objetos
const parseCSV = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const delim = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delim).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(delim);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] || '').trim(); });
    return obj;
  });
};

const normalize = (rows) => rows.map((r) => ({
  ativo: (r.ativo || r.ticker || r.symbol || '').toUpperCase(),
  categoria: (r.categoria || r.tipo || 'ACAO').toUpperCase(),
  operacao: (r.operacao || r.oper || r.side || 'COMPRA').toUpperCase().includes('VEND') ? 'VENDA' : 'COMPRA',
  quantidade: Number(r.quantidade || r.qty || r.quant || 0),
  preco_entrada: Number(String(r.preco_entrada || r.entrada || r.preco || '').replace(',', '.')),
  preco_fechamento: Number(String(r.preco_fechamento || r.fechamento || r.saida || '').replace(',', '.')),
  data_abertura: r.data_abertura || r.data || '',
  data_fechamento: r.data_fechamento || r.data_fech || r.data,
})).filter((o) => o.ativo && o.quantidade > 0);

export default function ImportarHistorico() {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState([]);

  const handleFile = async (f) => {
    setFile(f);
    if (!f) { setPreview([]); return; }
    try {
      const text = await f.text();
      let rows = [];
      if (f.name.endsWith('.json')) {
        const json = JSON.parse(text);
        rows = normalize(Array.isArray(json) ? json : (json.operacoes || json.data || []));
      } else {
        rows = normalize(parseCSV(text));
      }
      setPreview(rows);
      if (!rows.length) toast({ title: 'Nenhum registro válido encontrado no arquivo.' });
    } catch (e) {
      toast({ title: 'Erro ao ler arquivo', description: e.message, variant: 'destructive' });
    }
  };

  const importar = async () => {
    if (!preview.length) return;
    setImporting(true);
    try {
      const grupo = await base44.entities.GrupoOperacao.create({ nome: 'Importado ' + new Date().toLocaleDateString('pt-BR') });
      const records = preview.map((o) => {
        const resultado = calcResultadoValor(o.operacao, o.quantidade, o.preco_entrada, o.preco_fechamento);
        const pct = calcResultadoPct(o.operacao, o.preco_entrada, o.preco_fechamento);
        return {
          grupo_id: grupo.id, grupo_nome: grupo.nome,
          ativo: o.ativo, categoria: o.categoria, operacao: o.operacao,
          quantidade: o.quantidade, preco_entrada: o.preco_entrada,
          valor_inicial: calcValorInicial(o.operacao, o.quantidade, o.preco_entrada),
          data_abertura: o.data_abertura, status: 'FECHADA',
          preco_fechamento: o.preco_fechamento,
          resultado_valor: resultado, resultado_pct: pct,
          data_fechamento: o.data_fechamento || new Date().toISOString(),
        };
      });
      await base44.entities.Operacao.bulkCreate(records);
      toast({ title: 'Importação concluída', description: `${records.length} operações importadas` });
      setPreview([]); setFile(null);
    } catch (e) {
      toast({ title: 'Erro ao importar', description: e.message, variant: 'destructive' });
    } finally { setImporting(false); }
  };

  return (
    <div className="max-w-[800px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        <h1 className="text-xl md:text-2xl font-heading font-bold">Importar Histórico</h1>
      </div>
      <p className="text-sm text-muted-foreground">Envie uma planilha CSV ou JSON com suas operações encerradas. Colunas esperadas: ativo, operacao, quantidade, preco_entrada, preco_fechamento, data_abertura, data_fechamento.</p>

      <Card>
        <CardHeader><CardTitle className="text-base">Arquivo</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5"><Label htmlFor="file">Planilha (CSV ou JSON)</Label>
            <Input id="file" type="file" accept=".csv,.json,.txt" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>
          {file && <div className="text-sm text-muted-foreground flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> {file.name}</div>}
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card><CardContent className="p-0 overflow-x-auto">
          <div className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{preview.length} operações detectadas</span>
            <Button size="sm" onClick={importar} disabled={importing}>{importing ? 'Importando…' : 'Confirmar importação'}</Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground"><tr>
              <th className="text-left p-2">Ativo</th><th className="text-left p-2">Op</th><th className="text-right p-2">Qtd</th>
              <th className="text-right p-2">Entrada</th><th className="text-right p-2">Fechamento</th>
            </tr></thead>
            <tbody>
              {preview.slice(0, 50).map((o, i) => (
                <tr key={i} className="border-t"><td className="p-2">{o.ativo}</td><td className="p-2">{o.operacao}</td><td className="p-2 text-right">{o.quantidade}</td><td className="p-2 text-right">{o.preco_entrada}</td><td className="p-2 text-right">{o.preco_fechamento}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  );
}