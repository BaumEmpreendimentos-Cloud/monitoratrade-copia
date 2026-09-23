import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditarIdentificadorDialog({ grupo, onClose, onConfirm }) {
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (grupo) setNome(grupo.nome || '');
  }, [grupo]);

  if (!grupo) return null;

  return (
    <Dialog open={!!grupo} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Editar identificador</DialogTitle></DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="nome">Identificador</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(nome.trim())} disabled={!nome.trim()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}