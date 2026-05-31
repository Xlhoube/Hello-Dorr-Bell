import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Landing } from './pages/public/Landing';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { VisitorPage } from './pages/public/VisitorPage';
import { DashboardOverview } from './pages/dashboard';
import { Properties } from './pages/dashboard/Properties';
import { Units } from './pages/dashboard/Units';
import { Invites } from './pages/dashboard/Invites';
import { Visitors } from './pages/dashboard/Visitors';
import { Residents } from './pages/dashboard/Residents';
import { Settings } from './pages/dashboard/Settings';
import { Help } from './pages/dashboard/Help';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider, useConfirm } from './components/ui/ConfirmDialog';
import { registerSW } from 'virtual:pwa-register';

function AppContent() {
  const { i18n, t } = useTranslation();
  const { confirm } = useConfirm();

  useEffect(() => {
    // PWA Update Logic
    const updateSW = registerSW({
      async onNeedRefresh() {
        const confirmed = await confirm({
          title: t('pwa.update_title', 'Nova Versão'),
          message: t('pwa.update_message', 'Uma nova versão está disponível. Deseja atualizar agora?'),
          confirmLabel: t('common.update', 'Atualizar'),
          variant: 'primary'
        });

        if (confirmed) {
          updateSW(true);
          window.location.reload();
        }
      }
    });

    // Carregar Tema - Soft Clean (Light) por defeito
    const savedTheme = localStorage.getItem('hello-theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Carregar Idioma (redundante mas seguro)
    const savedLang = localStorage.getItem('hello-language') || 'en';
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n, confirm, t]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Static / Mobile-first Visitor Page without main layouts */}
        <Route path="/visitor/:token" element={<VisitorPage />} />
        <Route path="/visitor/access/:unitId" element={<VisitorPage />} />

        {/* Dashboard protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<DashboardOverview />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:propertyId/units" element={<Units />} />
          <Route path="units/:unitId/invites" element={<Invites />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="residents" element={<Residents />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AppContent />
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
