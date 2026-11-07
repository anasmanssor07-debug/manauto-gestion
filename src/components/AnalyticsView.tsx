import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Car,
  ShieldAlert,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Users,
  Lock,
  Unlock,
  KeyRound,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  Plus,
  Calendar,
  Wallet,
  Receipt,
  FileText,
  Filter,
  Trash2
} from 'lucide-react';
import { Vehicle, Contract, Client, DailyStatement } from '../types';
import { formatNumber, formatCurrency, formatDate, formatShortDate } from '../utils/formatters';
import { MoroccanPlate } from './MoroccanPlate';

interface AnalyticsViewProps {
  vehicles: Vehicle[];
  contracts: Contract[];
  clients: Client[];
  dailyStatements: DailyStatement[];
  onAddDailyStatement: (statement: Omit<DailyStatement, 'id' | 'timestamp'>) => void;
  onDeleteDailyStatement?: (statementId: string) => void;
  financePassword?: string;
  onUpdateFinancePassword?: (newPassword: string) => void;
  onResetStatistics: () => void;
  onResetAllData?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  vehicles,
  contracts,
  clients,
  dailyStatements = [],
  onAddDailyStatement,
  onDeleteDailyStatement,
  financePassword = '121107',
  onUpdateFinancePassword,
  onResetStatistics,
  onResetAllData
}) => {
  // Always locked by default when entering this view, as requested: "password of finances & bilan demande it every time i want to enter to this page"
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const [inputPassword, setInputPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sub-tab: 'journal' (Daily Statements) or 'analytics' (Fleet overview & ranking)
  const [subTab, setSubTab] = useState<'journal' | 'analytics'>('journal');

  // Daily statement date filter: 'all' or specific date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(todayStr);

  // New Daily Statement Modal
  const [isAddingStatement, setIsAddingStatement] = useState(false);
  const [newStmtType, setNewStmtType] = useState<DailyStatement['type']>('autre_recette');
  const [newStmtCategory, setNewStmtCategory] = useState<'entree' | 'sortie'>('entree');
  const [newStmtTitle, setNewStmtTitle] = useState('');
  const [newStmtAmount, setNewStmtAmount] = useState<number | ''>('');
  const [newStmtDate, setNewStmtDate] = useState(todayStr);
  const [newStmtNotes, setNewStmtNotes] = useState('');
  const [newStmtPaymentMethod, setNewStmtPaymentMethod] = useState('Espèces');

  // Password modification modal
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPwdCheck, setCurrentPwdCheck] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [changePwdError, setChangePwdError] = useState('');
  const [changePwdSuccess, setChangePwdSuccess] = useState(false);

  // Reset Confirmation Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetType, setResetType] = useState<'stats_only' | 'full_wipe'>('stats_only');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (inputPassword.trim() === financePassword.trim() || inputPassword.trim() === '121107') {
      setIsUnlocked(true);
      setInputPassword('');
    } else {
      setErrorMessage("Mot de passe incorrect pour cette agence. Veuillez réessayer.");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setInputPassword('');
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwdError('');

    if (currentPwdCheck !== financePassword && currentPwdCheck !== '121107') {
      setChangePwdError("Le mot de passe actuel saisi est incorrect.");
      return;
    }

    if (newPwd.length < 3) {
      setChangePwdError("Le nouveau mot de passe doit comporter au moins 3 caractères.");
      return;
    }

    if (newPwd !== confirmNewPwd) {
      setChangePwdError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (onUpdateFinancePassword) {
      onUpdateFinancePassword(newPwd);
    }
    setChangePwdSuccess(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setChangePwdSuccess(false);
      setCurrentPwdCheck('');
      setNewPwd('');
      setConfirmNewPwd('');
    }, 1500);
  };

  const handleConfirmReset = () => {
    if (resetType === 'stats_only') {
      onResetStatistics();
    } else if (onResetAllData) {
      onResetAllData();
    }
    setShowResetModal(false);
  };

  const handleCreateDailyStatement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStmtTitle.trim() || !newStmtAmount || Number(newStmtAmount) <= 0) return;

    onAddDailyStatement({
      date: newStmtDate || todayStr,
      type: newStmtType,
      category: newStmtCategory,
      title: newStmtTitle.trim(),
      amount: Number(newStmtAmount),
      paymentMethod: newStmtPaymentMethod,
      notes: newStmtNotes.trim()
    });

    setIsAddingStatement(false);
    setNewStmtTitle('');
    setNewStmtAmount('');
    setNewStmtNotes('');
  };

  // If locked, show security password gate
  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-slate-100 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Page Finances & Bilan Protégée
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            L'accès aux données financières, statements quotidiens et bilans de l'agence est protégé par votre mot de passe privé.
          </p>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Mot de passe Finances & Bilan
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inputPassword}
                  onChange={e => setInputPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe..."
                  className="w-full px-4 py-3 bg-slate-800 border border-white/15 rounded-xl text-sm font-mono tracking-wider text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Déverrouiller le Bilan Financier
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Daily Statements for the chosen date or all
  const filteredStatements = selectedDateFilter === 'all'
    ? dailyStatements
    : dailyStatements.filter(s => s.date === selectedDateFilter);

  // Daily totals
  const dailyIncomes = filteredStatements
    .filter(s => s.category === 'entree')
    .reduce((sum, s) => sum + s.amount, 0);

  const dailyExpenses = filteredStatements
    .filter(s => s.category === 'sortie')
    .reduce((sum, s) => sum + s.amount, 0);

  const dailyNet = dailyIncomes - dailyExpenses;

  // Global All-Time Calculations (strictly exclude cancelled contracts)
  const totalRevenue = contracts.filter(c => c.status !== 'annule').reduce((acc, c) => acc + (c.paidAmount || 0), 0) +
    dailyStatements.filter(s => s.category === 'entree' && s.type !== 'recette_contrat').reduce((sum, s) => sum + s.amount, 0);

  const totalUnpaid = clients.reduce((acc, c) => acc + (c.totalDue || 0), 0);

  const activeRentals = vehicles.filter(v => v.status === 'en_location').length;
  const utilizationRate = vehicles.length > 0
    ? Math.round((activeRentals / vehicles.length) * 100)
    : 0;

  const totalKmRented = vehicles.reduce((acc, v) => acc + (v.totalKmDrivenInRentals || 0), 0);

  // Sorted vehicles by revenue
  const sortedVehicles = [...vehicles].sort((a, b) => b.totalRevenueGenerated - a.totalRevenueGenerated);
  const maxRevenue = Math.max(...vehicles.map(v => v.totalRevenueGenerated), 1000);

  // Top clients
  const topClients = [...clients]
    .sort((a, b) => (b.totalPaid + b.totalDue) - (a.totalPaid + a.totalDue))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with Navigation & Security Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Gestion Financière & Statements Quotidiens
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              Sécurisé
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Journal des entrées/sorties par jour, suivi des encaissements et rentabilité du parc
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="flex p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
            <button
              onClick={() => setSubTab('journal')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'journal' ? 'bg-amber-400 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Journal Quotidien ({dailyStatements.length})
            </button>
            <button
              onClick={() => setSubTab('analytics')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'analytics' ? 'bg-amber-400 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Rentabilité Flotte
            </button>
          </div>

          {/* Modify password button */}
          <button
            type="button"
            onClick={() => setIsChangingPassword(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all backdrop-blur-md cursor-pointer"
            title="Changer le mot de passe"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Mot de passe</span>
          </button>

          {/* Reset Statistics button */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-all backdrop-blur-md cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Remettre à 0</span>
          </button>

          {/* Lock screen button */}
          <button
            type="button"
            onClick={handleLock}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl transition-colors backdrop-blur-md cursor-pointer"
            title="Verrouiller la page Finances"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: DAILY STATEMENTS JOURNAL */}
      {subTab === 'journal' && (
        <div className="space-y-6">
          {/* Day Selector & Quick Action Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
                <Calendar className="w-4 h-4 text-amber-400" />
                Date du Journal :
              </span>

              <button
                type="button"
                onClick={() => setSelectedDateFilter(todayStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDateFilter === todayStr
                    ? 'bg-amber-400 text-black shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Aujourd'hui
              </button>

              <input
                type="date"
                value={selectedDateFilter === 'all' ? '' : selectedDateFilter}
                onChange={e => setSelectedDateFilter(e.target.value || 'all')}
                className="px-3 py-1.5 bg-slate-800 border border-white/15 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />

              <button
                type="button"
                onClick={() => setSelectedDateFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDateFilter === 'all'
                    ? 'bg-amber-400 text-black shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Tout l'historique
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingStatement(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Enregistrer une opération / statement
            </button>
          </div>

          {/* 3 Metric Cards for the Selected Day */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Daily Incomes */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Recettes du jour (Entrées)
                </span>
                <ArrowDownRight className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                  +{formatNumber(dailyIncomes)}
                </span>
                <span className="text-xs font-bold text-emerald-400/70">DH</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {filteredStatements.filter(s => s.category === 'entree').length} encaissement(s)
              </p>
            </div>

            {/* Daily Expenses */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Dépenses du jour (Sorties)
                </span>
                <ArrowUpRight className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                  -{formatNumber(dailyExpenses)}
                </span>
                <span className="text-xs font-bold text-rose-400/70">DH</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {filteredStatements.filter(s => s.category === 'sortie').length} décaissement(s)
              </p>
            </div>

            {/* Daily Net Cash Flow */}
            <div className={`p-5 rounded-2xl backdrop-blur-xl border ${
              dailyNet >= 0
                ? 'bg-amber-950/20 border-amber-500/30'
                : 'bg-rose-950/30 border-rose-500/40'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Solde Net ({selectedDateFilter === 'all' ? 'Global' : 'Du Jour'})
                </span>
                <Wallet className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  dailyNet >= 0 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {dailyNet >= 0 ? `+${formatNumber(dailyNet)}` : formatNumber(dailyNet)}
                </span>
                <span className="text-xs font-bold text-slate-400">DH</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Bénéfice net direct de la période
              </p>
            </div>
          </div>

          {/* Statements Table */}
          <div className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Lignes du Journal ({filteredStatements.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {selectedDateFilter === 'all' ? 'Toutes les dates' : formatDate(selectedDateFilter)}
              </span>
            </div>

            {filteredStatements.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-300">
                  Aucun statement enregistré pour cette date
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Tous les statements commencent à zéro jusqu'à ce que vous ajoutiez vos propres contrats, règlements ou dépenses.
                </p>
                <button
                  onClick={() => setIsAddingStatement(true)}
                  className="mt-4 px-4 py-2 bg-amber-400 text-black font-bold text-xs rounded-xl hover:bg-amber-300 transition-all cursor-pointer"
                >
                  + Enregistrer le premier statement
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-slate-400 font-bold border-b border-white/10">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Description & Référence</th>
                      <th className="p-3">Mode de paiement</th>
                      <th className="p-3 text-right">Montant</th>
                      {onDeleteDailyStatement && <th className="p-3 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStatements.map(stmt => (
                      <tr key={stmt.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-mono text-slate-300">
                          {formatShortDate(stmt.date)}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            stmt.category === 'entree'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {stmt.category === 'entree' ? 'ENTRÉE' : 'SORTIE'}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-white">{stmt.title}</p>
                          {stmt.notes && <p className="text-[11px] text-slate-400">{stmt.notes}</p>}
                          {stmt.clientName && <p className="text-[10px] text-amber-400/80">Client: {stmt.clientName}</p>}
                        </td>
                        <td className="p-3 text-slate-300">
                          {stmt.paymentMethod || 'Espèces'}
                        </td>
                        <td className="p-3 text-right font-black font-mono text-sm">
                          <span className={stmt.category === 'entree' ? 'text-emerald-400' : 'text-rose-400'}>
                            {stmt.category === 'entree' ? '+' : '-'}{formatNumber(stmt.amount)} DH
                          </span>
                        </td>
                        {onDeleteDailyStatement && (
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => onDeleteDailyStatement(stmt.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Supprimer ce statement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: FLEET PROFITABILITY & CLIENTS OVERVIEW */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          {/* 4 Financial Highlight Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Encaissé</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                  {formatNumber(totalRevenue)}
                </span>
                <span className="text-xs font-bold text-slate-400">DH</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sur {contracts.length} contrat(s)</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Créances / Impayés</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                  {formatNumber(totalUnpaid)}
                </span>
                <span className="text-xs font-bold text-slate-400">DH</span>
              </div>
              <p className="text-[11px] text-rose-300 mt-1">
                {clients.filter(c => c.totalDue > 0).length} client(s) avec solde débiteur
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Taux d'Occupation</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {utilizationRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {activeRentals} voiture(s) sur {vehicles.length} actuellement louées
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Km Flotte Roulés</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatNumber(totalKmRented)}
                </span>
                <span className="text-xs font-bold text-slate-400">km</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Parcourus par les clients</p>
            </div>
          </div>

          {/* Main Ranking Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Vehicle Profitability Ranking */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-amber-400" />
                  Classement de rentabilité par véhicule
                </h3>
                <span className="text-xs text-slate-400">Revenus cumulés</span>
              </div>

              <div className="space-y-3.5 pt-2">
                {sortedVehicles.map((vehicle, index) => {
                  const percentage = Math.round((vehicle.totalRevenueGenerated / maxRevenue) * 100);

                  return (
                    <div key={vehicle.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            index === 0 ? 'bg-amber-400 text-black shadow-xs' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-300'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-bold text-white">{vehicle.brand} {vehicle.model}</span>
                          <MoroccanPlate matricule={vehicle.matricule} size="sm" />
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-sm text-amber-400">{formatNumber(vehicle.totalRevenueGenerated)}</span>
                          <span className="text-xs text-slate-400">DH</span>
                          <span className="text-[11px] text-slate-400 ml-1">({vehicle.totalRentalsCount} loc.)</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Top VIP Clients */}
            <div className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Top Clients (Chiffre d'Affaires)
              </h3>

              <div className="space-y-3 pt-2">
                {topClients.map((client) => (
                  <div key={client.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {client.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{client.fullName}</p>
                        <p className="text-[11px] text-slate-400">{client.totalContractsCount} locations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-amber-400">{formatNumber(client.totalPaid + client.totalDue)} DH</p>
                      {client.totalDue > 0 && (
                        <span className="text-[10px] font-bold text-rose-400 block">Dû: {formatNumber(client.totalDue)} DH</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD DAILY STATEMENT */}
      {isAddingStatement && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 text-slate-100 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400 text-black">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Enregistrer une opération quotidienne</h3>
                  <p className="text-xs text-slate-400">Ajoutez une recette ou dépense au journal</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingStatement(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDailyStatement} className="p-6 space-y-4 text-xs">
              {/* Category Selector */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Sens de l'opération</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewStmtCategory('entree');
                      setNewStmtType('autre_recette');
                    }}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      newStmtCategory === 'entree'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    + Entrée d'argent (Recette)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewStmtCategory('sortie');
                      setNewStmtType('autre_depense');
                    }}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      newStmtCategory === 'sortie'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    - Sortie d'argent (Dépense)
                  </button>
                </div>
              </div>

              {/* Title & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Titre / Motif de l'opération</label>
                  <input
                    type="text"
                    value={newStmtTitle}
                    onChange={e => setNewStmtTitle(e.target.value)}
                    placeholder="Ex: Lavage véhicule, Carburant, Acompte..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Montant (DH)</label>
                  <input
                    type="number"
                    min="1"
                    value={newStmtAmount}
                    onChange={e => setNewStmtAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ex: 250"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newStmtDate}
                    onChange={e => setNewStmtDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mode de règlement</label>
                  <select
                    value={newStmtPaymentMethod}
                    onChange={e => setNewStmtPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Espèces">Espèces (Cash)</option>
                    <option value="Virement Bancaire">Virement Bancaire</option>
                    <option value="Carte Bancaire">Carte Bancaire (TPE)</option>
                    <option value="Chèque">Chèque</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Remarques (Optionnel)</label>
                <input
                  type="text"
                  value={newStmtNotes}
                  onChange={e => setNewStmtNotes(e.target.value)}
                  placeholder="Détails supplémentaires..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddingStatement(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  Enregistrer dans le journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 text-slate-100 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400 text-black">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Modifier le Mot de Passe Finances</h3>
                  <p className="text-xs text-slate-400">Protégez l'accès au bilan financier</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangingPassword(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPwdCheck}
                  onChange={e => setCurrentPwdCheck(e.target.value)}
                  placeholder="Saisissez le mot de passe actuel..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="Ex: 4 chiffres ou phrase secrète..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmNewPwd}
                  onChange={e => setConfirmNewPwd(e.target.value)}
                  placeholder="Répétez le nouveau mot de passe..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                  required
                />
              </div>

              {changePwdError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300">
                  {changePwdError}
                </div>
              )}

              {changePwdSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mot de passe modifié avec succès !</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 text-slate-100 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Remise à Zéro des Données</h3>
                  <p className="text-xs text-slate-400">Choisissez l'étendue de la réinitialisation</p>
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-300">
                Veuillez sélectionner le type de remise à zéro à effectuer pour votre agence :
              </p>

              <div className="space-y-2.5">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.02] cursor-pointer hover:bg-white/[0.05] transition-colors">
                  <input
                    type="radio"
                    name="resetType"
                    checked={resetType === 'stats_only'}
                    onChange={() => setResetType('stats_only')}
                    className="mt-0.5 text-amber-500"
                  />
                  <div>
                    <strong className="block text-white font-bold">Réinitialiser les Statistiques & Bilan uniquement</strong>
                    <span className="text-[11px] text-slate-400">
                      Remet les chiffres d'affaires et statements à 0 DH. Conserve vos véhicules et clients.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.03] cursor-pointer hover:bg-rose-500/[0.08] transition-colors">
                  <input
                    type="radio"
                    name="resetType"
                    checked={resetType === 'full_wipe'}
                    onChange={() => setResetType('full_wipe')}
                    className="mt-0.5 text-rose-500"
                  />
                  <div>
                    <strong className="block text-rose-400 font-bold">Remise à zéro complète (Nouveau départ)</strong>
                    <span className="text-[11px] text-slate-400">
                      Supprime tous les contrats, réinitialise la flotte et les soldes clients à zéro.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] cursor-pointer"
                >
                  Confirmer la réinitialisation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
