import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LineChart, TrendingUp, Receipt, Bell, Layers, Crown, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const ctaTo = user ? '/operacoes' : '/login';
  const ctaLabel = user ? 'Abrir Operações' : 'Entrar / Criar conta';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading font-bold">
            <LineChart className="w-5 h-5 text-primary" /> Monitora Trade
          </div>
          <Link to="/login"><Button variant="outline" size="sm">Entrar</Button></Link>
        </div>
      </header>

      <section className="max-w-[1100px] mx-auto px-4 py-12 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full mb-4">
          <TrendingUp className="w-3.5 h-3.5" /> Monitor de operações do mercado brasileiro
        </div>
        <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight">
          Acompanhe suas operações de <span className="text-primary">trade</span> com clareza
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Registre operações de ações e opções, acompanhe resultados em tempo real, configure alertas,
          apure o Imposto de Renda e simule estratégias — tudo em um só lugar.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to={ctaTo}><Button size="lg">{ctaLabel}</Button></Link>
          {!user && <Link to="/register"><Button size="lg" variant="outline">Teste grátis</Button></Link>}
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-4 pb-16 grid gap-4 md:grid-cols-3">
        {[
          { icon: LineChart, title: 'Operações em tempo real', desc: 'Marque a mercado com preço manual e veja o resultado por grupo.' },
          { icon: Receipt, title: 'Apuração de IR', desc: 'Cálculo automático de imposto sobre swing trade e day trade.' },
          { icon: Layers, title: 'Simulador de opções', desc: 'Calcule valor intrínseco, extrínseco, moneyness e resultado no vencimento.' },
          { icon: Bell, title: 'Alertas', desc: 'Receba alertas de resultado e preço alvo das suas operações.' },
          { icon: TrendingUp, title: 'Dividendos', desc: 'Lance dividendos e acompanhe o total recebido por grupo.' },
          { icon: Crown, title: 'Plano Premium', desc: '15 dias grátis sem cartão. Assine quando quiser.' },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="rounded-lg border p-5 bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          );
        })}
      </section>

      <footer className="border-t">
        <div className="max-w-[1100px] mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Monitora Trade · {user ? <Link to="/operacoes" className="text-primary">Acessar app</Link> : <Link to="/login" className="text-primary">Entrar</Link>}
        </div>
      </footer>
    </div>
  );
}