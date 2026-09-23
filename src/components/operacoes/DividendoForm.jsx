import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DividendoForm({ grupo, onClose, onConfirm }) {
  const [ativo, setAtivo] = useState('');
  const [dataPagamento, setDataPagamento] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorPorAcao, setValorPorAcao] = useState('');

  useEffect(() => {
    if (grupo) { setAtivo(''); setDataPagamento(''); setQuantidade(''); setValorPorAcao(''); }
  }, [grupo]);

  if (!grupo) return null;
  const total = (Number(quantidade) || 0) * (Number(valorPorAcao) || 0);

  return (
    <Dialog open={!!grupo} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Lançar dividendo · {grupo.nome}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Ativo</Label><Input value={ativo} onChange={(e) => setAtivo(e.target.value.toUpperCase())} placeholder="PETR4" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Data de pagamento</Label><Input type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Quantidade</Label><Input type="number" min="0" step="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Valor por ação (R$)</Label><Input type="number" step="0.01" min="0" value={valorPorAcao} onChange={(e) => setValorPorAcao(e.target.value)} placeholder="0.00" /></div>
          <div className="text-sm text-muted-foreground">Total: <span className="font-medium text-foreground">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm({ ativo: ativo.trim().toUpperCase(), data_pagamento: dataPagamento, quantidade: Number(quantidade), valor_por_acao: Number(valorPorAcao), valor_total: total })} disabled={!ativo || !dataPagamento || !quantidade || !valorPorAcao}>Lançar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}