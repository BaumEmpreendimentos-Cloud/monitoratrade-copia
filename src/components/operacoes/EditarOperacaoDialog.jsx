import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditarOperacaoDialog({ operacao, onClose, onConfirm }) {
  const [ativo, setAtivo] = useState('');
  const [ativoBase, setAtivoBase] = useState('');
  const [categoria, setCategoria] = useState('ACAO');
  const [tipoOp, setTipoOp] = useState('COMPRA');
  const [quantidade, setQuantidade] = useState('');
  const [precoEntrada, setPrecoEntrada] = useState('');
  const [dataAbertura, setDataAbertura] = useState('');
  const [strike, setStrike] = useState('');
  const [vencimento, setVencimento] = useState('');

  useEffect(() => {
    if (operacao) {
      setAtivo(operacao.ativo || '');
      setAtivoBase(operacao.ativo_base || '');
      setCategoria(operacao.categoria || 'ACAO');
      setTipoOp(operacao.operacao || 'COMPRA');
      setQuantidade(operacao.quantidade ?? '');
      setPrecoEntrada(operacao.preco_entrada ?? '');
      setDataAbertura(operacao.data_abertura || '');
      setStrike(operacao.strike ?? '');
      setVencimento(operacao.vencimento || '');
    }
  }, [operacao]);

  if (!operacao) return null;
  const isOption = categoria === 'CALL' || categoria === 'PUT';

  const handleConfirm = () => {
    onConfirm({
      ativo: ativo.trim().toUpperCase(),
      ativo_base: isOption ? ativoBase.trim().toUpperCase() : undefined,
      categoria, operacao: tipoOp,
      quantidade: Number(quantidade),
      precoEntrada: Number(precoEntrada),
      dataAbertura,
      strike: isOption ? Number(strike) : undefined,
      vencimento: isOption ? vencimento : undefined,
    });
  };

  return (
    <Dialog open={!!operacao} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Editar operação</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Ativo</Label><Input value={ativo} onChange={(e) => setAtivo(e.target.value)} maxLength={8} /></div>
            <div className="space-y-1.5"><Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="ACAO">Ação</SelectItem><SelectItem value="CALL">Call</SelectItem><SelectItem value="PUT">Put</SelectItem><SelectItem value="FII">FII</SelectItem><SelectItem value="DOLLAR">Dollar/Futuro</SelectItem>
              </SelectContent></Select>
            </div>
          </div>
          {isOption && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Ativo base</Label><Input value={ativoBase} onChange={(e) => setAtivoBase(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Strike</Label><Input type="number" step="0.01" value={strike} onChange={(e) => setStrike(e.target.value)} /></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Operação</Label>
              <Select value={tipoOp} onValueChange={setTipoOp}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="COMPRA">Compra</SelectItem><SelectItem value="VENDA">Venda</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>Quantidade</Label><Input type="number" min="0" step="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Preço de entrada</Label><Input type="number" step="0.01" min="0" value={precoEntrada} onChange={(e) => setPrecoEntrada(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Data de abertura</Label><Input type="date" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} /></div>
          </div>
          {isOption && <div className="space-y-1.5"><Label>Vencimento</Label><Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} /></div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}