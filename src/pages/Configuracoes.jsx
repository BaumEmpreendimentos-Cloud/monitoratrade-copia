import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { isPremium, isGestor, trialDaysLeft } from '@/lib/access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, LogOut, Crown, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Configuracoes() {
  const { user, logout, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [tracked, setTracked] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.tracked_tickers?.length) {
      setTracked(user.tracked_tickers.map((t) => t.symbol).join(', '));
    }
  }, [user]);

  const handleSaveTracked = async () => {
    setSaving(true);
    try {
      const tickers = tracked.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean).map((symbol) => ({ symbol, name: symbol }));
      await base44.auth.updateMe({ tracked_tickers: tickers });
      await checkUserAuth?.();
      toast({ title: 'Ativos salvos' });
    } catch (e) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const toggleNotif = async (key) => {
    try {
      await base44.auth.updateMe({ [key]: !user[key] });
      await checkUserAuth?.();
    } catch (e) { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); }
  };

  const daysLeft = trialDaysLeft(user);
  const premium = isPremium(user);
  const admin = isGestor(user);

  return (
    <div className="max-w-[700px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <h1 className="text-xl md:text-2xl font-heading font-bold">Configurações</h1>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Conta</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Nome</span><span className="font-medium">{user?.full_name || '—'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">E-mail</span><span className="font-medium">{user?.email || '—'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">CPF</span><span className="font-medium">{user?.cpf || '—'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Plano</span>
            <span className="font-medium flex items-center gap-1">
              {premium ? <><Crown className="w-3.5 h-3.5 text-amber-500" /> Premium</> : admin ? 'Gestor' : 'Grátis'}
            </span>
          </div>
          {!premium && !admin && daysLeft !== null && daysLeft > 0 && (
            <div className="text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/40 rounded-md p-2">
              Período de teste: restam {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}.
            </div>
          )}
          <Button variant="outline" size="sm" onClick={() => logout()}><LogOut className="w-4 h-4 mr-1" /> Sair da conta</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" /> Notificações</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between"><Label htmlFor="np">Notificações Push</Label><Switch id="np" checked={!!user?.notif_push} onCheckedChange={() => toggleNotif('notif_push')} /></div>
          <div className="flex items-center justify-between"><Label htmlFor="ne">Notificações por E-mail</Label><Switch id="ne" checked={!!user?.notif_email} onCheckedChange={() => toggleNotif('notif_email')} /></div>
          <div className="flex items-center justify-between"><Label htmlFor="ni">Notificações no App</Label><Switch id="ni" checked={!!user?.notif_inapp} onCheckedChange={() => toggleNotif('notif_inapp')} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Ativos acompanhados</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="tracked">Lista de ativos (separados por vírgula)</Label>
          <Input id="tracked" value={tracked} onChange={(e) => setTracked(e.target.value)} placeholder="PETR4, VALE3, ITUB4" />
          <Button size="sm" onClick={handleSaveTracked} disabled={saving}>{saving ? 'Salvando…' : 'Salvar ativos'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}