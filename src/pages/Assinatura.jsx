import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { isPremium, isGestor, trialDaysLeft } from '@/lib/access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Gift, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANOS = [
  { id: 'mensal', nome: 'Mensal', preco: 'R$ 49,90', periodo: '/mês', destaque: false, beneficios: ['Operações ilimitadas', 'Apuração de IR', 'Alertas de preço e resultado', 'Suporte por mensagem'] },
  { id: 'anual', nome: 'Anual', preco: 'R$ 499,00', periodo: '/ano', destaque: true, beneficios: ['Tudo do plano mensal', '2 meses grátis', 'Simulador de opções', 'Painel de rolagem', 'Prioridade no suporte'] },
];

export default function Assinatura() {
  const { user } = useAuth();
  const premium = isPremium(user);
  const admin = isGestor(user);
  const daysLeft = trialDaysLeft(user);

  return (
    <div className="max-w-[800px] mx-auto p-3 md:p-6 space-y-5 pb-20 md:pb-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50">
          <Crown className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-2xl font-heading font-bold">Monitora Trade Premium</h1>
        <p className="text-sm text-muted-foreground">Desbloqueie todos os recursos e acompanhe suas operações sem limites.</p>
      </div>

      {admin ? (
        <Card><CardContent className="p-6 text-center">
          <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="font-heading font-semibold">Conta Gestor</p>
          <p className="text-sm text-muted-foreground">Você tem acesso a todos os recursos como administrador.</p>
        </CardContent></Card>
      ) : premium ? (
        <Card><CardContent className="p-6 text-center">
          <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-heading font-semibold">Assinatura ativa</p>
          <p className="text-sm text-muted-foreground">Obrigado por ser Premium! Aproveite todos os recursos.</p>
        </CardContent></Card>
      ) : (
        <>
          {daysLeft !== null && daysLeft > 0 && (
            <Card><CardContent className="p-4 flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40">
              <Gift className="w-5 h-5 text-amber-600" />
              <div className="text-sm">
                <span className="font-medium">Período de teste grátis</span> — restam {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}.
              </div>
            </CardContent></Card>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {PLANOS.map((p) => (
              <Card key={p.id} className={p.destaque ? 'border-primary shadow-md' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{p.nome}</CardTitle>
                    {p.destaque && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Mais popular</span>}
                  </div>
                  <div className="text-2xl font-heading font-bold">{p.preco}<span className="text-sm font-normal text-muted-foreground">{p.periodo}</span></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm">
                    {p.beneficios.map((b) => (
                      <li key={b} className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {b}</li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={p.destaque ? 'default' : 'outline'}>Assinar {p.nome}</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              Indique amigos e ganhe dias grátis.{' '}
              <Link to="/configuracoes" className="text-primary underline">Ver detalhes</Link>
            </div>
          </CardContent></Card>
        </>
      )}
    </div>
  );
}