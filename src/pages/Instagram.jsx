import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Instagram as InstagramIcon, ExternalLink } from 'lucide-react';

const POSTS = [
  { id: 1, titulo: 'Estratégia Covered Call', desc: 'Aprenda a gerar renda extra vendendo call sobre ações que você já possui.' },
  { id: 2, titulo: 'Análise de PETR4', desc: 'Principais níveis de suporte e resistência para a semana.' },
  { id: 3, titulo: 'Rolagem de Opções', desc: 'Quando e como realizar a rolagem para maximizar o resultado.' },
];

export default function Instagram() {
  return (
    <div className="max-w-[800px] mx-auto p-3 md:p-6 space-y-4 pb-20 md:pb-6">
      <div className="flex items-center gap-2">
        <InstagramIcon className="w-5 h-5 text-primary" />
        <h1 className="text-xl md:text-2xl font-heading font-bold">Instagram</h1>
      </div>
      <p className="text-sm text-muted-foreground">Conteúdos e análises do Monitora Trade nas redes sociais.</p>

      <div className="grid gap-3 md:grid-cols-3">
        {POSTS.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 space-y-2">
              <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <InstagramIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-sm">{p.titulo}</h3>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1">Ver no Instagram <ExternalLink className="w-3 h-3" /></a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}