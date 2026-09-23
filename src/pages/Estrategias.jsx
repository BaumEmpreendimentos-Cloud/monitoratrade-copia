import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, TrendingUp, Shield, Target, Repeat, Coins } from 'lucide-react';

const ESTRATEGIAS = [
  {
    nome: 'Compra de Ação (Long)',
    categoria: 'Ações',
    risco: 'Baixo',
    icon: TrendingUp,
    descricao: 'Compra direta de uma ação apostando na valorização. Estratégia básica de longo prazo.',
    quando: 'Quando há perspectiva de alta do papel no médio/longo prazo.',
    risco_desc: 'Risco limitado ao capital investido; ganho teoricamente ilimitado.',
  },
  {
    nome: 'Venda Coberta (Covered Call)',
    categoria: 'Opções',
    risco: 'Baixo',
    icon: Shield,
    descricao: 'Você já possui o ativo e vende uma call para receber prêmio, gerando renda extra.',
    quando: 'Quando você tem o ativo e não espera alta expressiva no curto prazo.',
    risco_desc: 'Limita o ganho do ativo acima do strike; proteção limitada ao prêmio recebido.',
  },
  {
    nome: 'Venda de Put (Naked Put)',
    categoria: 'Opções',
    risco: 'Médio',
    icon: Coins,
    descricao: 'Vende uma put recebendo prêmio, com obrigação de comprar o ativo se exercida.',
    quando: 'Quando quer comprar o ativo a um preço menor (strike) ou apenas ganhar o prêmio.',
    risco_desc: 'Risco de queda do ativo até zero; similar a ser dono do ativo.',
  },
  {
    nome: 'Comprado de Call (Long Call)',
    categoria: 'Opções',
    risco: 'Médio',
    icon: Target,
    descricao: 'Compra de call apostando na alta do ativo com alavancagem.',
    quando: 'Quando espera alta expressiva no curto prazo.',
    risco_desc: 'Perda limitada ao prêmio pago; ganho ilimitado.',
  },
  {
    nome: 'Comprado de Put (Long Put)',
    categoria: 'Opções',
    risco: 'Médio',
    icon: Target,
    descricao: 'Compra de put apostando na baixa do ativo ou como proteção (hedge).',
    quando: 'Quando espera queda do ativo ou quer proteger uma carteira.',
    risco_desc: 'Perda limitada ao prêmio; ganho cresce com a queda do ativo.',
  },
  {
    nome: 'Rolagem de Opção',
    categoria: 'Opções',
    risco: 'Médio',
    icon: Repeat,
    descricao: 'Fecha uma posição e abre outra do mesmo tipo com strike/vencimento diferente.',
    quando: 'Para adiantar/adiar vencimento ou ajustar strike conforme a movimentação do ativo.',
    risco_desc: 'Pode gerar crédito ou débito; mantém a exposição ao mercado.',
  },
  {
    nome: 'Bull Call Spread',
    categoria: 'Opções',
    risco: 'Baixo',
    icon: Layers,
    descricao: 'Compra uma call e vende outra com strike maior, reduzindo custo e definindo risco.',
    quando: 'Quando espera alta moderada do ativo até o strike vendido.',
    risco_desc: 'Risco e ganho limitados e definidos no início.',
  },
  {
    nome: 'Bear Put Spread',
    categoria: 'Opções',
    risco: 'Baixo',
    icon: Layers,
    descricao: 'Compra uma put e vende outra com strike menor, reduzindo custo da operação.',
    quando: 'Quando espera baixa moderada do ativo até o strike vendido.',
    risco_desc: 'Risco e ganho limitados e definidos no início.',
  },
];

const riscoColor = { Baixo: 'success', Médio: 'warning', Alto: 'destructive' };

export default function Estrategias() {
  return (
    <div className="max-w-[1200px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-heading font-bold">Estratégias</h1>
        <p className="text-sm text-muted-foreground mt-1">Catálogo de estratégias para operações no mercado brasileiro.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {ESTRATEGIAS.map((e) => {
          const Icon = e.icon;
          return (
            <Card key={e.nome}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold leading-tight">{e.nome}</h3>
                      <span className="text-xs text-muted-foreground">{e.categoria}</span>
                    </div>
                  </div>
                  <Badge variant={riscoColor[e.risco] === 'success' ? 'secondary' : riscoColor[e.risco] === 'warning' ? 'outline' : 'destructive'}>Risco {e.risco}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{e.descricao}</p>
                <div className="text-xs space-y-1 pt-1 border-t">
                  <div><span className="text-muted-foreground">Quando usar: </span>{e.quando}</div>
                  <div><span className="text-muted-foreground">Risco: </span>{e.risco_desc}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}