import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calcValorInicial } from '@/lib/operacoes';

const today = () => new Date().toISOString().split('T')[0];

export default function OperacaoForm({ open, onClose, onSubmit, grupos, simulada = false }) {
  const [identificador, setIdentificador] = useState('');
  const [ativo, setAtivo] = useState('');
  const [ativoBase, setAtivoBase] = useState('');
  const [categoria, setCategoria] = useState('ACAO');
  const [operacao, setOperacao] = useState('COMPRA');
  const [quantidade, setQuantidade] = useState('');
  const [precoEntrada, setPrecoEntrada] = useState('');
  const [dataAbertura, setDataAbertura] = useState(today());
  const [strike, setStrike] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [err, setErr] = useState('');

  const isOption = categoria === 'CALL' || categoria === 'PUT';

  useEffect(() => {
    if (open) {
      setIdentificador(''); setAtivo(''); setAtivoBase(''); setCategoria('ACAO');
      setOperacao('COMPRA'); setQuantidade(''); setPrecoEntrada('');
      setDataAbertura(today()); setStrike(''); setVencimento(''); setErr('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr('');
    if (!identificador.trim()) { setErr('Informe o identificador do grupo.'); return; }
    if (!ativo.trim() || ativo.trim().length < 4) { setErr('Ativo deve ter ao menos 4 caracteres.'); return; }
    if (!quantidade || Number(quantidade) <= 0) { setErr('Quantidade inválida.'); return; }
    if (!precoEntrada || Number(precoEntrada) <= 0) { setErr('Preço de entrada inválido.'); return; }
    if (isOption && (!strike || !vencimento)) { setErr('Opções exigem strike e vencimento.'); return; }
    onSubmit({
      identificador: identificador.trim(),
      ativo: ativo.trim().toUpperCase(),
      ativo_base: isOption ? ativoBase.trim().toUpperCase() : undefined,
      categoria, operacao,
      quantidade: Number(quantidade),
      precoEntrada: Number(precoEntrada),
      dataAbertura,
      strike: isOption ? Number(strike) : undefined,
      vencimento: isOption ? vencimento : undefined,
      simulada,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{simulada ? 'Nova operação simulada' : 'Nova operação'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="id">Identificador (grupo)</Label>
            <Input id="id" value={identificador} onChange={(e) => setIdentificador(e.target.value)} placeholder="Ex: PETR4 10/10" list="grupos-list" />
            <datalist id="grupos-list">
              {grupos.map((g) => <option key={g.id} value={g.nome} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Ativo</Label>
              <Input value={ativo} onChange={(e) => setAtivo(e.target.value)} placeholder="PETR4" maxLength={8} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACAO">Ação</SelectItem>
                  <SelectItem value="CALL">Call (Opção)</SelectItem>
                  <SelectItem value="PUT">Put (Opção)</SelectItem>
                  <SelectItem value="FII">FII</SelectItem>
                  <SelectItem value="DOLLAR">Dollar/Futuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isOption && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ativo base</Label>
                <Input value={ativoBase} onChange={(e) => setAtivoBase(e.target.value)} placeholder="PETR4" />
              </div>
              <div className="space-y-1.5">
                <Label>Strike</Label>
                <Input type="number" step="0.01" value={strike} onChange={(e) => setStrike(e.target.value)} placeholder="30.00" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Operação</Label>
              <Select value={operacao} onValueChange={setOperacao}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPRA">Compra</SelectItem>
                  <SelectItem value="VENDA">Venda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantidade</Label>
              <Input type="number" min="0" step="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Preço de entrada</Label>
              <Input type="number" step="0.01" min="0" value={precoEntrada} onChange={(e) => setPrecoEntrada(e.target.value)} placeholder="25.50" />
            </div>
            <div className="space-y-1.5">
              <Label>Data de abertura</Label>
              <Input type="date" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} />
            </div>
          </div>
          {isOption && (
            <div className="space-y-1.5">
              <Label>Vencimento</Label>
              <Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
            </div>
          )}
          {err && <p className="text-sm text-destructive">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar operação</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}