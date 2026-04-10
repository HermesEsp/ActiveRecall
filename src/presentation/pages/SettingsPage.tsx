import React, { useState } from 'react';
import { useMasteryStore, getDefaultCards } from '../../application/store/useMasteryStore';
import { cn } from '../../lib/utils';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Globe, Smartphone, Database, Trash2, Languages, Share2, Cloud, Sun, Moon, Monitor } from 'lucide-react';

const REQUIRED_CARD_KEYS = ['id', 'front', 'back', 'category', 'masteryLevel', 'type'] as const;

function isValidCardsArray(data: unknown): data is any[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (card) =>
      typeof card === 'object' &&
      card !== null &&
      REQUIRED_CARD_KEYS.every((key) => key in card) &&
      typeof card.masteryLevel === 'number' &&
      card.masteryLevel >= 0 &&
      card.masteryLevel <= 5 &&
      ['standard', 'cloze'].includes(card.type)
  );
}

interface ModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const Modal: React.FC<ModalProps> = ({ open, title, message, confirmLabel = 'OK', cancelLabel, variant = 'info', onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className={cn("text-lg font-bold", variant === 'danger' ? "text-red-600" : "text-zinc-900 dark:text-zinc-100")}>{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end pt-2">
          {cancelLabel && (
            <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-lg transition-all",
              variant === 'danger' ? "bg-red-600 text-white hover:bg-red-700" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { cards, t, language, setLanguage, theme, setTheme, exportData, importData: importToStore } = useMasteryStore();
  const { isInstallable, install } = usePWAInstall();
  const [modal, setModal] = useState<Omit<ModalProps, 'onConfirm' | 'onCancel'> & { onConfirm: () => void } | null>(null);

  const showAlert = (title: string, message: string) => {
    setModal({ open: true, title, message, onConfirm: () => setModal(null) });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'info' = 'danger') => {
    setModal({
      open: true, title, message, variant,
      confirmLabel: language === 'pt' ? 'Confirmar' : 'Confirm',
      cancelLabel: language === 'pt' ? 'Cancelar' : 'Cancel',
      onConfirm: () => { setModal(null); onConfirm(); },
    });
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activerecall-v1-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = importToStore(event.target?.result as string);
        if (result) {
          showAlert('✓', language === 'pt' ? 'Dados restaurados com sucesso!' : 'Data restored successfully!');
        } else {
          showAlert('Erro', language === 'pt' ? 'Arquivo de backup inválido ou corrompido.' : 'Invalid or corrupted backup file.');
        }
      } catch {
        showAlert('Erro', language === 'pt' ? 'Falha ao processar o arquivo.' : 'Failed to process file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const themeOptions = [
    { value: 'system' as const, label: t.settings.themeSystem, icon: Monitor },
    { value: 'light' as const, label: t.settings.themeLight, icon: Sun },
    { value: 'dark' as const, label: t.settings.themeDark, icon: Moon },
  ];

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-12 px-4">
      {modal && <Modal {...modal} onCancel={() => setModal(null)} />}

      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1">{t.settings.title}</h2>
        <p className="text-zinc-500 text-sm">Personalize sua experiência e gerencie seus dados.</p>
      </div>
      
      <div className="space-y-6">
        {/* Tema */}
        <section className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <Sun size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t.settings.theme}</h3>
          </div>
          <div className="flex gap-2">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border text-sm",
                  theme === value
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-md"
                    : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Idioma */}
        <section className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <Languages size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t.settings.language}</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setLanguage('en')}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl font-bold transition-all border text-sm",
                language === 'en' ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-md" : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('pt')}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl font-bold transition-all border text-sm",
                language === 'pt' ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-md" : "bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
            >
              Português
            </button>
          </div>
        </section>

        {/* Gestão de Dados */}
        <section className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <Share2 size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t.settings.dataMgmt}</h3>
          </div>
          <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{t.settings.dataDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={handleExport}
              className="px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all text-center text-xs uppercase tracking-widest shadow-md active:scale-[0.98]"
            >
              {t.settings.export}
            </button>
            <label className="px-4 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-center cursor-pointer text-xs uppercase tracking-widest active:scale-[0.98]">
              {t.settings.import}
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </section>

        {/* Google Drive — Coming Soon */}
        <section className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm opacity-60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Cloud size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t.settings.googleDrive}</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-amber-500">{t.settings.comingSoon}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{t.settings.googleDriveDesc}</p>
          <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/50 text-white rounded-xl font-bold cursor-not-allowed">
            <Cloud size={18} />
            <span>{t.settings.connectDrive}</span>
          </button>
        </section>

        {/* Use em Qualquer Lugar */}
        <section className="p-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-6">{t.settings.multiTitle}</h3>
            
            {isInstallable && (
              <button 
                onClick={install}
                className="w-full mb-8 flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl font-black uppercase tracking-tighter hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-2xl active:scale-[0.95]"
              >
                <Download size={20} strokeWidth={3} />
                <span>Instalar no Celular</span>
              </button>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 dark:bg-zinc-900/10 rounded-xl flex items-center justify-center shrink-0">
                  <Globe size={20} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">{t.settings.webFirst}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">{t.settings.webFirstDesc}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 dark:bg-zinc-900/10 rounded-xl flex items-center justify-center shrink-0">
                  <Smartphone size={20} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">{t.settings.pwa}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">{t.settings.pwaDesc}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 dark:bg-zinc-900/10 rounded-xl flex items-center justify-center shrink-0">
                  <Database size={20} className="text-zinc-400 dark:text-zinc-500" />
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">{t.settings.sync}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">{t.settings.syncDesc}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 dark:bg-zinc-900/5 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Zona de Perigo */}
        <section className="p-6 border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/20 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
              <Trash2 size={18} />
            </div>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">{t.settings.danger}</h3>
          </div>
          <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{t.settings.dangerDesc}</p>
          <button 
            onClick={() => {
              showConfirm(
                t.settings.danger,
                language === 'pt'
                  ? 'Tem certeza absoluta? Todos os seus cards e progresso serão perdidos.'
                  : 'Are you absolutely sure? All your cards and progress will be lost.',
                () => useMasteryStore.setState({ cards: getDefaultCards(language), studyHistory: [], streak: 0, lastStudyDate: null }),
                'danger'
              );
            }}
            className="w-full px-4 py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-950 transition-all text-xs uppercase tracking-widest"
          >
            {t.settings.reset}
          </button>
        </section>
      </div>
    </div>
  );
};
