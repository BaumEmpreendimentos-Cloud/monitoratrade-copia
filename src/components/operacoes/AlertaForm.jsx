import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AlertaForm({ open, onClose, onConfirm, grupo, operacao }) {
  const [tipo, setTipo] = useState('RESULTADO');
  const [metrica, setMetrica] = useState('VALOR');
  const [condicao, setCondicao] = useState('MAIOR_IGUAL');
  const [valorAlvo, setValorAlvo] = useState('');

  useEffect(() => {
    if (open) { setTipo('RESULTADO'); setMetrica('VALOR'); setCondicao('MAIOR_IGUAL'); setValorAlvo(''); }
  }, [open]);

  const handleConfirm = () => {
    onConfirm({
      tipo,
      metrica,
      condicao,
      valor_alvo: Number(valorAlvo),
      grupo_id: grupo?.id,
      grupo_nome: grupo?.nome,
      operacao_id: operacao?.id,
      ativo: operacao?.ativo || grupo?.nome,
      status: 'ATIVO',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Novo alerta</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {operacao ? `Operação: ${operacao.ativo}` : grupo ? `Grupo: ${grupo.nome}` : ''}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="RESULTADO">Resultado</SelectItem><SelectItem value="PRECO">Preço do ativo</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>Métrica</Label>
              <Select value={metrica} onValueChange={setMetrica}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="VALOR">Valor (R$)</SelectItem><SelectItem value="PERCENTUAL">Percentual (%)</SelectItem>
              </SelectContent></Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Condição</Label>
              <Select value={condicao} onValueChange={setCondicao}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="MAIOR_IGUAL">Maior ou igual</SelectItem><SelectItem value="MENOR_IGUAL">Menor ou igual</SelectItem><SelectItem value="EXATO">Exato</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>Valor alvo</Label><Input type="number" step="0.01" value={valorAlvo} onChange={(e) => setValorAlvo(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={valorAlvo === ''}>Criar alerta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}