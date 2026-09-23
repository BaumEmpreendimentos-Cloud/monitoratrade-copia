import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, ShieldAlert, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Painel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.User.list('-created_date', 500);
      setUsers(list || []);
    } catch (e) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = async (u) => {
    try {
      await base44.entities.User.update(u.id, { blocked: !u.blocked });
      setUsers((p) => p.map((x) => (x.id === u.id ? { ...x, blocked: !u.blocked } : x)));
      toast({ title: u.blocked ? 'Usuário desbloqueado' : 'Usuário bloqueado' });
    } catch (e) { toast({ title: 'Erro', description: e.message, variant: 'destructive' }); }
  };

  const invite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await base44.users.inviteUser(inviteEmail.trim(), 'user');
      toast({ title: 'Convite enviado', description: inviteEmail });
      setInviteEmail('');
    } catch (err) { toast({ title: 'Erro ao convidar', description: err.message, variant: 'destructive' }); }
  };

  const filtered = users.filter((u) => !q || (u.email || '').toLowerCase().includes(q.toLowerCase()) || (u.full_name || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-[1200px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h1 className="text-xl md:text-2xl font-heading font-bold">Painel do Gestor</h1>
      </div>

      <Card><CardContent className="p-4">
        <form onSubmit={invite} className="flex gap-2">
          <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="E-mail do novo usuário…" />
          <Button type="submit"><Mail className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Convidar</span></Button>
        </form>
      </CardContent></Card>

      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar usuário…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>

      <Card><CardContent className="p-0 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Carregando…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="text-left font-medium p-2">Nome</th>
                <th className="text-left font-medium p-2">E-mail</th>
                <th className="text-left font-medium p-2">Plano</th>
                <th className="text-left font-medium p-2">Status</th>
                <th className="text-right font-medium p-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/30">
                  <td className="p-2 font-medium">{u.full_name || '—'}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role === 'admin' ? 'Gestor' : u.subscription_status === 'active' ? 'Premium' : 'Grátis'}</td>
                  <td className="p-2">{u.blocked ? <span className="text-red-600">Bloqueado</span> : <span className="text-emerald-600">Ativo</span>}</td>
                  <td className="p-2 text-right">
                    {u.id !== user?.id && (
                      <Button variant="ghost" size="sm" onClick={() => toggleBlock(u)}>
                        <ShieldAlert className="w-4 h-4 mr-1" /> {u.blocked ? 'Desbloquear' : 'Bloquear'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent></Card>
    </div>
  );
}