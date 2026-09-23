import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { isGestor } from '@/lib/access';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare } from 'lucide-react';

export default function Mensagens() {
  const { user } = useAuth();
  const admin = isGestor(user);
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Mensagem.list('-created_date', 200);
      setMensagens(list || []);
    } catch (e) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const nova = await base44.entities.Mensagem.create({
        para_id: admin ? 'ALL' : 'GESTOR',
        para_nome: admin ? 'Todos' : 'Gestor',
        texto: texto.trim(),
      });
      setMensagens((p) => [nova, ...p]);
      setTexto('');
    } catch (err) {} finally { setEnviando(false); }
  };

  return (
    <div className="max-w-[800px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <h1 className="text-xl md:text-2xl font-heading font-bold">Mensagens</h1>
      <p className="text-sm text-muted-foreground">
        {admin ? 'Envie comunicados para todos os usuários.' : 'Envie mensagens ao Gestor de Suporte.'}
      </p>

      <form onSubmit={enviar} className="flex gap-2">
        <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={admin ? 'Comunicado para todos…' : 'Mensagem para o gestor…'} />
        <Button type="submit" disabled={enviando || !texto.trim()}><Send className="w-4 h-4 md:mr-1" /><span className="hidden md:inline">Enviar</span></Button>
      </form>

      <div className="space-y-2">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Carregando…</div>
        ) : mensagens.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <MessageSquare className="w-8 h-8 opacity-40" /> Nenhuma mensagem.
          </CardContent></Card>
        ) : mensagens.map((m) => {
          const mine = m.created_by_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${mine ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                <div className="text-sm">{m.texto}</div>
                <div className={`text-[10px] mt-1 ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {mine ? 'Você' : (m.para_nome || '—')} · {new Date(m.created_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}