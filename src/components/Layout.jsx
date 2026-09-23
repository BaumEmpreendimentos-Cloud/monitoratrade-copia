import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Crown, LogOut, MessageSquare, Users, ShieldAlert, Settings, ArrowLeft, Instagram as InstagramIcon, Layers } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { hasAccess, isPremium, isGestor, trialDaysLeft } from '@/lib/access';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import CpfRequiredDialog from '@/components/CpfRequiredDialog';

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`;

const mobileLinkClass = ({ isActive }) =>
  `flex flex-col items-center justify-center gap-0.5 min-h-[44px] flex-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

const PAGE_TITLES = {
  '/operacoes': 'Operações',
  '/historico': 'Histórico',
  '/importar-historico': 'Importar Histórico',
  '/cotacoes': 'Cotações',
  '/mensagens': 'Mensagens',
  '/painel': 'Painel',
  '/assinatura': 'Premium',
  '/configuracoes': 'Configurações',
  '/irpf': 'Imposto de Renda',
  '/rolagem': 'Painel de Rolagem',
  '/opcoes': 'Simulador',
  '/estrategias': 'Estratégias',
  '/instagram': 'Instagram',
};

const MAIN_TABS = ['/operacoes', '/estrategias', '/mensagens', '/instagram', '/configuracoes'];

export default function Layout() {
  const { user, checkUserAuth, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const admin = isGestor(user);
  const pageTitle = PAGE_TITLES[location.pathname] || '';
  const showBack = !MAIN_TABS.includes(location.pathname);

  const handleTabClick = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!user) return;
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch (e) { /* ignore */ }
  }, [user]);

  if (user?.blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-xl font-heading font-bold">Conta bloqueada</h1>
          <p className="text-sm text-muted-foreground">Seu acesso foi bloqueado pelo Gestor de Suporte. Entre em contato para mais informações.</p>
          <Button variant="outline" onClick={() => logout()}>Sair</Button>
        </div>
      </div>
    );
  }

  if (user && !user.cpf && !admin) {
    return <CpfRequiredDialog user={user} onSaved={checkUserAuth} />;
  }

  if (user && !hasAccess(user) && location.pathname !== '/assinatura') {
    return <Navigate to="/assinatura" replace />;
  }

  const daysLeft = user ? trialDaysLeft(user) : null;
  const premium = isPremium(user);

  return (
    <div className="min-h-screen bg-background pb-safe">
      <header className="md:hidden sticky top-0 z-20 bg-card border-b" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-12 flex items-center justify-center px-3 relative">
          {showBack && (
            <button onClick={() => navigate(-1)} className="absolute left-1 p-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="font-heading font-bold text-sm">{pageTitle}</span>
          <div className="absolute right-1"><ThemeToggle /></div>
        </div>
      </header>
      <header className="border-b bg-card sticky top-0 z-10 hidden md:block">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading font-bold">
            <LineChart className="w-5 h-5 text-primary" /> Monitora Trade
          </div>
          <nav className="flex gap-1 items-center">
            <NavLink to="/operacoes" className={linkClass}>Operações</NavLink>
            <NavLink to="/mensagens" className={linkClass}><MessageSquare className="w-4 h-4 inline -mt-0.5" /> Mensagens</NavLink>
            <NavLink to="/estrategias" className={linkClass}><Layers className="w-4 h-4 inline -mt-0.5" /> Estratégias</NavLink>
            <NavLink to="/instagram" className={linkClass}><InstagramIcon className="w-4 h-4 inline -mt-0.5" /> Instagram</NavLink>
            {admin && <NavLink to="/painel" className={linkClass}><Users className="w-4 h-4 inline -mt-0.5" /> Painel</NavLink>}
            <NavLink to="/assinatura" className={linkClass}><Crown className="w-4 h-4 inline -mt-0.5" /> Premium</NavLink>
            <NavLink to="/configuracoes" className={linkClass}><Settings className="w-4 h-4 inline -mt-0.5" /> Config</NavLink>
            <ThemeToggle />
            <button onClick={() => logout()} className="px-2 py-1.5 rounded-md text-sm hover:bg-accent text-muted-foreground inline-flex items-center">
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>
      {!premium && !admin && daysLeft !== null && daysLeft > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs text-center py-1.5 px-2">
          Período grátis: restam {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}.{' '}
          <NavLink to="/assinatura" className="underline font-medium">Assine agora</NavLink>
        </div>
      )}
      {isMobile ? (
        <motion.div key={location.pathname} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <Outlet />
        </motion.div>
      ) : (
        <Outlet />
      )}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t bg-card" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-14">
          <NavLink to="/operacoes" className={mobileLinkClass} end onClick={(e) => handleTabClick(e, '/operacoes')}><LineChart className="w-5 h-5" /><span className="text-[10px]">Operações</span></NavLink>
          <NavLink to="/estrategias" className={mobileLinkClass} onClick={(e) => handleTabClick(e, '/estrategias')}><Layers className="w-5 h-5" /><span className="text-[10px]">Estratégias</span></NavLink>
          <NavLink to="/mensagens" className={mobileLinkClass} onClick={(e) => handleTabClick(e, '/mensagens')}><MessageSquare className="w-5 h-5" /><span className="text-[10px]">Mensagens</span></NavLink>
          <NavLink to="/instagram" className={mobileLinkClass} onClick={(e) => handleTabClick(e, '/instagram')}><InstagramIcon className="w-5 h-5" /><span className="text-[10px]">Instagram</span></NavLink>
          <NavLink to="/configuracoes" className={mobileLinkClass} onClick={(e) => handleTabClick(e, '/configuracoes')}><Settings className="w-5 h-5" /><span className="text-[10px]">Config</span></NavLink>
        </div>
      </nav>
    </div>
  );
}