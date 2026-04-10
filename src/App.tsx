import React, { Component, ReactNode, ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './presentation/layouts/MainLayout';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { StudyPage } from './presentation/pages/StudyPage';
import { LibraryPage } from './presentation/pages/LibraryPage';
import { SettingsPage } from './presentation/pages/SettingsPage';
import { useMasteryStore } from './application/store/useMasteryStore';
import { Button } from './presentation/components/ui/Button';

const ErrorView = () => {
  const { t } = useMasteryStore();
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
        >
          {t.common.reload}
        </Button>
      </div>
    </div>
  );
};

const Zap = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
  </svg>
);

// Bypassing strict TS for ErrorBoundary to ensure app runs
class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorView />;
    }

    return this.props.children;
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
