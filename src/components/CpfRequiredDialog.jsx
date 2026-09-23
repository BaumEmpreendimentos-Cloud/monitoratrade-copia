import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

// Máscara simples de CPF: 000.000.000-00
const maskCpf = (v) => {
  const d = (v || '').replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const isValidCpf = (cpf) => {
  const d = (cpf || '').replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i], 10) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(d[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i], 10) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(d[10], 10);
};

export default function CpfRequiredDialog({ user, onSaved }) {
  const [cpf, setCpf] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    setErr('');
    if (!isValidCpf(cpf)) { setErr('CPF inválido.'); return; }
    setSaving(true);
    try {
      const trialStart = user?.trial_start || new Date().toISOString();
      await base44.auth.updateMe({ cpf, trial_start: trialStart });
      await onSaved?.();
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'Erro ao salvar CPF.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete seu cadastro</DialogTitle>
          <DialogDescription>
            Informe seu CPF para ativar o período de teste grátis de 15 dias no Monitora Trade.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving || cpf.replace(/\D/g, '').length !== 11}>
            {saving ? 'Salvando…' : 'Ativar teste grátis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}