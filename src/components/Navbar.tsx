import React from 'react';
import { 
  Car, FileText, Users, Wrench, BarChart3, Plus, LayoutDashboard, Bell, 
  Settings, LogOut, User, RefreshCw, Languages, Globe, CalendarCheck, 
  Calendar, ExternalLink, Sparkles, Share2
} from 'lucide-react';
import { formatFullHeaderDate } from '../utils/formatters';
import { useI18n } from '../utils/i18n';
import { ManautoLogo } from './ManautoLogo';

export type TabType = 'dashboard' | 'fleet' | 'contracts' | 'clients' | 'maintenance' | 'analytics';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  agencyName: string;
  agencyLogoUrl?: string;
  userName?: string;
  onOpenNewContract: () => void;
  onOpenSettings: () => void;
  onOpenNewVehicle: () => void;
  onLogout?: () => void;
  alertCount: number;
  unpaidCount: number;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  agencyName,
  agencyLogoUrl,
  userName,
  onOpenNewContract,
  onOpenSettings,
  onOpenNewVehicle,
  onLogout,
  alertCount,
  unpaidCount,
  isSyncing = false,
  onManualSync
}) => {
  const { language, setLanguage, t, isArabic } = useI18n();
  const currentDateStr = formatFullHeaderDate();
  const displayName = userName || agencyName;

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-lg">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              id="navbar-logo-home-btn"
              type="button"
              onClick={() => {
                onTabChange('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Retour au Tableau de Bord"
              className="hover:scale-102 transition-transform cursor-pointer text-left"
            >
              <ManautoLogo variant="compact" theme="dark" showSubtitle={true} />
            </button>

            <div className="hidden sm:block h-8 w-[1px] bg-white/10 mx-1" />

            <div>
              <div className="flex items-center gap-2">
                <h1 id="agency-greeting" className="text-sm sm:text-base font-bold tracking-tight text-white">
                  {isArabic ? 'مرحباً، ' : 'Agence : '}
                  <span className="text-amber-400 font-extrabold">{displayName}</span>
                </h1>
                <button
                  id="open-agency-settings-btn"
                  onClick={onOpenSettings}
                  title="Paramètres de l'agence (Logo, ICE, RC, Coordonnées)"
                  className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p id="current-header-date" className="text-[11px] sm:text-xs font-medium text-slate-400 capitalize">
                  {currentDateStr}
                </p>

                {/* Live multi-device sync badge */}
                {onManualSync && (
                  <button
                    onClick={onManualSync}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-[10px] font-semibold transition-all cursor-pointer"
                    title="Cliquer pour synchroniser immédiatement entre Mobile et PC"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isSyncing ? 'Sync...' : t.directSync}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top Quick Actions & Language Switcher & User Session */}
          <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
            
            {/* Language Switcher Button (Français / العربية) */}
            <button
              id="language-switch-btn"
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              title={isArabic ? 'Passer en Français' : 'التحويل إلى اللغة العربية'}
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
            </button>

            <button
              id="new-vehicle-top-btn"
              onClick={onOpenNewVehicle}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all active:scale-95 backdrop-blur-md cursor-pointer"
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span>{t.addVehicle}</span>
            </button>

            <button
              id="new-contract-top-btn"
              onClick={onOpenNewContract}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 group font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black group-hover:rotate-90 transition-transform duration-200" />
              <span>{t.newContract}</span>
            </button>

            {onLogout && (
              <button
                id="logout-btn"
                onClick={onLogout}
                title="Changer d'agence / Déconnexion"
                className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 rounded-xl transition-colors backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">{t.logout}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          <button
            id="nav-tab-dashboard"
            onClick={() => onTabChange('dashboard')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t.dashboard}</span>
          </button>

          <button
            id="nav-tab-fleet"
            onClick={() => onTabChange('fleet')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-white/15 text-white border border-white/20 shadow-md backdrop-blur-md font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Car className="w-4 h-4 text-amber-400" />
            <span>{t.vehicles}</span>
          </button>

          <button
            id="nav-tab-contracts"
            onClick={() => onTabChange('contracts')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'contracts'
                ? 'bg-white/15 text-white border border-white/20 shadow-md backdrop-blur-md font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span>{t.contracts}</span>
          </button>

          <button
            id="nav-tab-clients"
            onClick={() => onTabChange('clients')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-white/15 text-white border border-white/20 shadow-md backdrop-blur-md font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>{t.clients}</span>
            {unpaidCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {unpaidCount} {t.unpaid}
              </span>
            )}
          </button>

          <button
            id="nav-tab-maintenance"
            onClick={() => onTabChange('maintenance')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-white/15 text-white border border-white/20 shadow-md backdrop-blur-md font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>{t.maintenance}</span>
            {alertCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                <Bell className="w-2.5 h-2.5" />
                {alertCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => onTabChange('analytics')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white/15 text-white border border-white/20 shadow-md backdrop-blur-md font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>{t.dailyCash}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
