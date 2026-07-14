import { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { Shell } from './components/Shell';
import { ToastStack } from './components/ToastStack';
import { ChatTestPage } from './pages/ChatTestPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';

type Toast = { id: number; message: string; tone?: 'success' | 'error' | 'info' };

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="login-page">
        <div className="card" style={{ width: 280 }}>
          <div className="skeleton" />
          <div className="skeleton" style={{ marginTop: 12 }} />
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone?: Toast['tone']) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <Shell />
            </Protected>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="documentos" element={<DocumentsPage notify={notify} />} />
          <Route path="configuracion" element={<SettingsPage notify={notify} />} />
          <Route path="chat" element={<ChatTestPage notify={notify} />} />
          <Route path="usuarios" element={<UsersPage notify={notify} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
