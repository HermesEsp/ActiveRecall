import React, { useState } from 'react';
import { 
  User, 
  Palette,
  Database,
  Download,
  Upload,
  Sparkles,
  Smartphone,
  ShieldAlert,
  RotateCcw,
  Languages,
  Monitor,
  Sun,
  Moon,
  Cloud,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { useMasteryStore } from '../../application/store/useMasteryStore';
import { Label, PageTitle } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export const SettingsPage: React.FC = () => {
  const { user, setUser, resetAllData, t, setLanguage, setTheme, exportData, importData, restoreTutorial } = useMasteryStore();
  const [newName, setNewName] = useState(user.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    setUser({ ...user, name: newName });
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importData(content)) {
          alert(t.settings.importSuccess);
        } else {
          alert(t.settings.importError);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-24 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="relative mb-24">
        <div className="absolute -left-8 top-0 w-1 h-20 bg-zinc-900 dark:bg-white rounded-full hidden md:block" />
        <PageTitle className="text-5xl md:text-6xl tracking-tightest">{t.settings.title}</PageTitle>
        <p className="text-zinc-500 font-bold text-lg mt-4 max-w-xl leading-relaxed">
          {t.settings.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Profile & Appearance Area */}
        <div className="lg:col-span-12 space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Card */}
            <section className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl p-10 shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-900 shadow-2xl group-hover:rotate-6 transition-transform">
                    <User size={28} />
                  </div>
                  <div>
                    <Label className="text-zinc-400 mb-0.5">{t.settings.profile}</Label>
                    <h3 className="text-2xl font-black tracking-tight">{user.name}</h3>
                  </div>
                </div>

                <div className="space-y-8">
                  <Input 
                    label={t.settings.name}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 px-1">
                      <Languages size={14} className="text-zinc-400" />
                      {t.settings.language}
                    </Label>
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      {(['en', 'pt'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                            user.language === lang 
                              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-600' 
                              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                          }`}
                        >
                          {lang === 'en' ? 'English' : 'Português'}
                          {user.language === lang && <CheckCircle2 size={12} className="text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-zinc-50 dark:border-zinc-800 flex justify-end">
                  <Button onClick={handleSave} size="lg">{t.settings.save}</Button>
                </div>
              </div>
            </section>

            {/* Appearance Card */}
            <section className="bg-zinc-900 dark:bg-white rounded-xl p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10 text-white/50 dark:text-zinc-400">
                  <Palette size={20} />
                  <Label className="text-white/50 dark:text-zinc-400">{t.settings.theme}</Label>
                </div>
                
                <div className="space-y-4">
                  {(['light', 'dark', 'system'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTheme(mode)}
                      className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                        user.theme === mode 
                          ? 'bg-white dark:bg-zinc-900 border-white dark:border-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xl scale-[1.02]' 
                          : 'border-white/10 dark:border-zinc-100 text-white/60 dark:text-zinc-400 hover:border-white/30 dark:hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {mode === 'light' ? <Sun size={20} /> : mode === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
                        <span className="font-black uppercase tracking-widest text-xs">
                          {mode === 'light' ? t.settings.themeLight : mode === 'dark' ? t.settings.themeDark : t.settings.themeSystem}
                        </span>
                      </div>
                      {user.theme === mode && <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 ring-4 ring-zinc-500/20" />}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Use Everywhere Section - RESTORED & ENHANCED */}
          <section className="bg-zinc-100 dark:bg-zinc-800/30 rounded-xl p-1 shadow-sm overflow-hidden">
             <div className="bg-white dark:bg-zinc-900 rounded-lg p-10 md:p-14">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                   <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-2 block animate-pulse">Available Everywhere</span>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{t.settings.pwa}</h2>
                   </div>
                   <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 px-6 py-3 rounded-xl border border-zinc-100 dark:border-zinc-700">
                      <Globe size={18} className="text-emerald-500" />
                      <span className="text-xs font-black uppercase tracking-widest">Web First Access</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   {/* Point 1: Always Free */}
                   <div className="space-y-4 group">
                      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-blue-100 dark:border-blue-900/10">
                         <Zap size={24} fill="currentColor" />
                      </div>
                      <h4 className="text-lg font-black tracking-tight">{t.settings.alwaysFree}</h4>
                      <p className="text-xs text-zinc-500 font-bold leading-relaxed">{t.settings.alwaysFreeDesc}</p>
                   </div>

                   {/* Point 2: Install as App */}
                   <div className="space-y-4 group">
                      <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-purple-100 dark:border-purple-900/10">
                         <Smartphone size={24} />
                      </div>
                      <h4 className="text-lg font-black tracking-tight">{t.settings.installApp}</h4>
                      <p className="text-xs text-zinc-500 font-bold leading-relaxed">{t.settings.pwaDesc}</p>
                   </div>

                   {/* Point 3: Local Storage */}
                   <div className="space-y-4 group">
                      <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-emerald-100 dark:border-emerald-900/10">
                         <ShieldCheck size={24} />
                      </div>
                      <h4 className="text-lg font-black tracking-tight">{t.settings.localStorage}</h4>
                      <p className="text-xs text-zinc-500 font-bold leading-relaxed">{t.settings.storageDesc}</p>
                   </div>
                </div>
             </div>
          </section>

          {/* Data Management Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
               <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
                 <div className="grid grid-cols-1 sm:grid-cols-2">
                   <div className="p-10 border-b sm:border-b-0 sm:border-r border-zinc-50 dark:border-zinc-800">
                     <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center mb-6"><Download size={24} /></div>
                     <h4 className="text-sm font-black uppercase tracking-widest mb-2">{t.settings.export}</h4>
                     <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-8">{t.settings.dataDesc}</p>
                     <Button variant="secondary" fullWidth onClick={() => {
                        const data = exportData();
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url;
                        a.download = `activerecall-backup-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}>{t.settings.export}</Button>
                   </div>
                   <div className="p-10">
                     <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg flex items-center justify-center mb-6"><Upload size={24} /></div>
                     <h4 className="text-sm font-black uppercase tracking-widest mb-2">{t.settings.import}</h4>
                     <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-8">{t.settings.importSuccess ? 'Upload backup to restore data.' : ''}</p>
                     <input type="file" id="import-file" className="hidden" accept=".json" onChange={handleImport} />
                     <Button variant="secondary" fullWidth onClick={() => document.getElementById('import-file')?.click()}>{t.settings.import}</Button>
                   </div>
                 </div>
               </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-8">
              <div className="bg-orange-50/30 dark:bg-orange-950/5 border-2 border-orange-100/50 dark:border-orange-900/20 rounded-xl p-10 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 bg-white dark:bg-orange-900/20 rounded-full flex items-center justify-center border border-orange-100 shadow-sm mb-6"><Sparkles className="text-orange-500" size={28} /></div>
                <h4 className="text-sm font-black uppercase tracking-widest mb-4">{t.settings.restoreTutorial}</h4>
                <p className="text-xs text-zinc-500 font-medium mb-8 leading-relaxed italic">{t.settings.restoreTutorialDesc}</p>
                <button onClick={() => { restoreTutorial(); alert(t.settings.tutorialRestored); }}
                  className="w-full mt-auto py-4 bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all">
                  {t.settings.restoreTutorial}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <section className="bg-red-50/30 dark:bg-red-950/10 border-2 border-dashed border-red-200 dark:border-red-900/50 rounded-xl p-10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-xl shadow-red-500/30 animate-pulse"><ShieldAlert size={28} /></div>
                <div><h3 className="text-2xl font-black text-red-600 dark:text-red-500 tracking-tight">{t.settings.dangerZone}</h3><p className="text-zinc-500 font-bold max-w-sm mt-1">{t.settings.resetDesc}</p></div>
              </div>
              <Button variant="danger" size="lg" className="min-w-[240px]" onClick={() => setShowResetConfirm(true)}>{t.settings.resetButton}</Button>
            </div>
          </section>
        </div>
      </div>

      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title={t.settings.resetConfirmTitle}>
        <div className="flex flex-col items-center py-6 px-4">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600 mb-10 border-4 border-red-100 dark:border-red-800 shadow-xl scale-110">
            <RotateCcw size={36} className="animate-spin-slow" />
          </div>
          <p className="text-lg font-bold text-zinc-500 text-center mb-12 leading-relaxed">{t.settings.resetConfirmDesc}</p>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="secondary" size="lg" onClick={() => setShowResetConfirm(false)}>{t.common.cancel}</Button>
            <Button variant="danger" size="lg" onClick={handleReset}>{t.settings.resetButton}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
