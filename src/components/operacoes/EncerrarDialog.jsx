import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calcResultadoValor, calcResultadoPct } from '@/lib/operacoes';

export default function EncerrarDialog({ operacao, onClose, onConfirm }) {
  const [preco, setPreco] = useState('');
  const [irrf, setIrrf] = useState('');

  useEffect(() => {
    if (operacao) { setPreco(''); setIrrf(''); }
  }, [operacao]);

  if (!operacao) return null;
  const p = Number(preco);
  const resultado = preco !== '' ? calcResultadoValor(operacao.operacao, operacao.quantidade, operacao.preco_entrada, p) : null;
  const pct = preco !== '' ? calcResultadoPct(operacao.operacao, operacao.preco_entrada, p) : null;

  return (
    <Dialog open={!!operacao} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encerrar operação</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {operacao.ativo} · {operacao.operacao === 'COMPRA' ? 'Compra' : 'Venda'} · {operacao.quantidade} @ {operacao.preco_entrada?.toFixed(2)}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preco">Preço de fechamento</Label>
            <Input id="preco" type="number" step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0.00" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="irrf">IRRF retido (opcional)</Label>
            <Input id="irrf" type="number" step="0.01" min="0" value={irrf} onChange={(e) => setIrrf(e.target.value)} placeholder="0.00" />
          </div>
          {resultado !== null && (
            <div className="rounded-md border p-3 text-sm">
              <div className="flex justify-between"><span>Resultado</span><span className={resultado >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              {pct !== null && <div className="flex justify-between mt-1"><span>Retorno</span><span className={pct >= 0 ? 'text-emerald-600' : 'text-red-600'}>{pct >= 0 ? '+' : ''}{pct.toFixed(2)}%</span></div>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(p, Number(irrf) || 0)} disabled={preco === '' || Number(preco) <= 0}>Confirmar encerramento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}