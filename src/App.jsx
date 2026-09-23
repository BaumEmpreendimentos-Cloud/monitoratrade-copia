import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { ThemeProvider } from 'next-themes';
import { lazy, Suspense } from 'react';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Operacoes = lazy(() => import('./pages/Operacoes'));
const Historico = lazy(() => import('./pages/Historico'));
const ImportarHistorico = lazy(() => import('./pages/ImportarHistorico'));
const Cotacoes = lazy(() => import('./pages/Cotacoes'));
const Assinatura = lazy(() => import('./pages/Assinatura'));
const Painel = lazy(() => import('./pages/Painel'));
const Mensagens = lazy(() => import('./pages/Mensagens'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const IRPF = lazy(() => import('./pages/IRPF'));
const Rolagem = lazy(() => import('./pages/Rolagem'));
const Opcoes = lazy(() => import('./pages/Opcoes'));
const Estrategias = lazy(() => import('./pages/Estrategias'));
const Instagram = lazy(() => import('./pages/Instagram'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/operacoes" element={<Operacoes />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/importar-historico" element={<ImportarHistorico />} />
          <Route path="/cotacoes" element={<Cotacoes />} />
          <Route path="/assinatura" element={<Assinatura />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/painel" element={<Painel />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/irpf" element={<IRPF />} />
          <Route path="/rolagem" element={<Rolagem />} />
          <Route path="/opcoes" element={<Opcoes />} />
          <Route path="/estrategias" element={<Estrategias />} />
          <Route path="/instagram" element={<Instagram />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App