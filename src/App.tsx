import React, { Component, ReactNode, ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './presentation/layouts/MainLayout';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { StudyPage } from './presentation/pages/StudyPage';
import { LibraryPage } from './presentation/pages/LibraryPage';
import { SettingsPage } from './presentation/pages/SettingsPage';
import { useMasteryStore } from './application/store/useMasteryStore';
import { Button } from './presentation/components/ui/Button';

import { Zap } from 'lucide-react';

import { useTranslation } from './presentation/hooks/useTranslation';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const ErrorView = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-100 dark:border-red-900/50">
           <Zap size={32} />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
          {t.common.errorTitle}
        </h1>
        <p className="text-zinc-500 mb-8 font-medium">
          {t.common.errorDesc}
        </p>
        <Button
          onClick={() => window.location.reload()}
          size="lg"
          fullWidth
          aria-label={t.common.reload}
        >
          {t.common.reload}
        </Button>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<React.PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorView />;
    }

    return (this as any).props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="study" element={<StudyPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
