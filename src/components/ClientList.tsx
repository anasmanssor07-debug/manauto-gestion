import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  User,
  CreditCard,
  ChevronRight,
  X,
  Trash2,
  Users,
  ArrowLeft,
  Edit3,
  Save,
  Clock,
  Car,
  Gauge,
  Fuel,
  Navigation,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Client, Contract } from '../types';
import { formatNumber, formatShortDate } from '../utils/formatters';
import { useI18n } from '../utils/i18n';

interface ClientListProps {
  clients: Client[];
  contracts: Contract[];
  onAddNewClient: () => void;
  onSettleDebt: (clientId: string, amount: number) => void;
  onSelectClientToRent?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onUpdateClient?: (updated: Client) => void;
  onDeleteContract?: (contractId: string) => void;
  onResetAllClients?: () => void;
  onDetailStateChange?: (isOpen: boolean) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  contracts,
  onAddNewClient,
  onSettleDebt,
  onSelectClientToRent,
  onDeleteClient,
  onUpdateClient,
  onDeleteContract,
  onResetAllClients,
  onDetailStateChange
}) => {
  const { t, isArabic } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebt, setFilterDebt] = useState<'all' | 'unpaid' | 'clean'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [settleAmount, setSettleAmount] = useState<number | ''>('');
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});
  const [showEmptyConfirmModal, setShowEmptyConfirmModal] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Notify parent whether detail drawer is open to hide top header
  React.useEffect(() => {
    onDetailStateChange?.(Boolean(selectedClient || showEmptyConfirmModal));
  }, [selectedClient, showEmptyConfirmModal, onDetailStateChange]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.cin.toLowerCase().includes(q);

      const matchesDebt =
        filterDebt === 'all'
          ? true
          : filterDebt === 'unpaid'
          ? (c.totalDue || 0) > 0
          : (c.totalDue || 0) === 0;

      return matchesSearch && matchesDebt;
    });
  }, [clients, searchQuery, filterDebt]);

  // Client contracts
  const activeClientContracts = useMemo(() => {
    if (!selectedClient) return [];
    return contracts.filter(c => c.clientId === selectedClient.id);
  }, [selectedClient, contracts]);

  // Calculate cumulative KM and days for the selected client
  const totalKmDrivenByClient = useMemo(() => {
    return activeClientContracts.reduce((acc, c) => {
      if (c.totalKmDriven && c.totalKmDriven > 0) return acc + c.totalKmDriven;
      if (c.endMileage && c.startMileage && c.endMileage > c.startMileage) {
        return acc + (c.endMileage - c.startMileage);
      }
      return acc;
    }, 0);
  }, [activeClientContracts]);

  const totalDaysRentedByClient = useMemo(() => {
    return activeClientContracts.reduce((acc, c) => acc + (c.durationDays || 0), 0);
  }, [activeClientContracts]);

  const handleOpenClient = (client: Client) => {
    setSelectedClient(client);
    setSettleAmount(client.totalDue || '');
    setIsEditingClient(false);
    setEditFormData({
      fullName: client.fullName,
      phone: client.phone,
      cin: client.cin,
      drivingLicenseNumber: client.drivingLicenseNumber,
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || ''
    });
  };

  const handlePayDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !settleAmount || Number(settleAmount) <= 0) return;
    const amountToSettle = Number(settleAmount);
    onSettleDebt(selectedClient.id, amountToSettle);
    
    // Update local modal state
    setSelectedClient(prev => {
      if (!prev) return null;
      return {
        ...prev,
        totalDue: Math.max(0, (prev.totalDue || 0) - amountToSettle),
        totalPaid: (prev.totalPaid || 0) + amountToSettle
      };
    });
    setSettleAmount('');
    showToast(isArabic ? `تم تسجيل أداء ${formatNumber(amountToSettle)} درهم بنجاح.` : `Règlement de ${formatNumber(amountToSettle)} DH enregistré.`);
  };

  const handleDeleteCurrentClient = () => {
    if (!selectedClient || !onDeleteClient) return;
    if (window.confirm(isArabic ? `هل أنت متأكد من حذف الزبون "${selectedClient.fullName}" نهائياً؟` : `Confirmer la suppression définitive du client "${selectedClient.fullName}" ?`)) {
      onDeleteClient(selectedClient.id);
      setSelectedClient(null);
      showToast(isArabic ? 'تم حذف الزبون بنجاح.' : 'Client supprimé avec succès.');
    }
  };

  const handleDeleteContractFromHistory = (contractId: string, vehicleName: string) => {
    if (!onDeleteContract) return;
    if (window.confirm(isArabic ? `حذف هذا العقد (${vehicleName}) من سجل الزبون؟` : `Supprimer ce contrat (${vehicleName}) de l'historique du client ?`)) {
      onDeleteContract(contractId);
      showToast(isArabic ? 'تم حذف العقد من السجل.' : 'Contrat supprimé de l\'historique.');
    }
  };

  const handleSaveClientEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !onUpdateClient) return;
    const updated: Client = {
      ...selectedClient,
      fullName: editFormData.fullName || selectedClient.fullName,
      phone: editFormData.phone || selectedClient.phone,
      cin: editFormData.cin || selectedClient.cin,
      drivingLicenseNumber: editFormData.drivingLicenseNumber || selectedClient.drivingLicenseNumber,
      email: editFormData.email,
      address: editFormData.address,
      notes: editFormData.notes
    };
    onUpdateClient(updated);
    setSelectedClient(updated);
    setIsEditingClient(false);
    showToast(isArabic ? 'تم تحديث بيانات الزبون بنجاح.' : 'Coordonnées du client mises à jour.');
  };

  const handleConfirmEmptyAll = () => {
    if (onResetAllClients) {
      onResetAllClients();
      setShowEmptyConfirmModal(false);
      setSelectedClient(null);
      showToast(isArabic ? 'تم إفراغ جميع الزبائن والسجلات.' : 'Tous les clients et l\'historique ont été vidés.');
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="search-clients-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'بحث بالاسم، الهاتف، بطاقة التعريف الوطنية...' : 'Rechercher par nom, téléphone, CIN...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterDebt('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filterDebt === 'all'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t.all} ({clients.length})
          </button>
          <button
            onClick={() => setFilterDebt('unpaid')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filterDebt === 'unpaid'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t.unpaidOnly} ({clients.filter(c => (c.totalDue || 0) > 0).length})
          </button>
          <button
            onClick={() => setFilterDebt('clean')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              filterDebt === 'clean'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t.upToDate} ({clients.filter(c => (c.totalDue || 0) === 0).length})
          </button>
        </div>

        {/* Add Client Button & Empty All */}
        <div className="flex items-center gap-2">
          {clients.length > 0 && onResetAllClients && (
            <button
              id="empty-all-clients-btn"
              onClick={() => setShowEmptyConfirmModal(true)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
              title={isArabic ? 'إفراغ جميع الزبائن' : 'Vider toute la liste des clients'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            id="add-new-client-btn"
            onClick={onAddNewClient}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newClient}</span>
          </button>
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredClients.map(client => {
            const hasDebt = (client.totalDue || 0) > 0;
            return (
              <div
                key={client.id}
                onClick={() => handleOpenClient(client)}
                className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-400/40 hover:bg-slate-900/80 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-extrabold text-base shrink-0 group-hover:scale-105 transition-transform">
                        {client.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-amber-400 transition-colors">
                          {client.fullName}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-amber-300 font-bold">
                            {client.cin}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                        hasDebt
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {hasDebt ? `${formatNumber(client.totalDue || 0)} ${t.dh}` : `✓ ${t.upToDate}`}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 gap-1.5 mt-3 pt-3 border-t border-white/5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                    {client.drivingLicenseNumber && (
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{t.drivingLicense}: <strong className="text-slate-300 font-mono">{client.drivingLicenseNumber}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer stats */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <strong>{client.totalContractsCount || 0}</strong> {isArabic ? 'عقود سابقة' : 'location(s)'}
                  </span>

                  <span className="text-amber-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {isArabic ? 'عرض الملف' : 'Détails'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-white/10 space-y-3">
          <Users className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            {searchQuery
              ? (isArabic ? 'لم يتم العثور على زبائن يطابقون البحث.' : 'Aucun client ne correspond à votre recherche.')
              : (isArabic ? 'لا يوجد زبائن مسجلون حالياً.' : 'Aucun client enregistré pour le moment.')}
          </p>
          <button
            onClick={onAddNewClient}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            + {t.newClient}
          </button>
        </div>
      )}

      {/* Confirmation Modal to Empty All Clients */}
      {showEmptyConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{isArabic ? 'تأكيد إفراغ الزبائن' : 'Vider tous les clients ?'}</h3>
                <p className="text-xs text-slate-400">{isArabic ? 'عملية غير قابلة للاسترجاع' : 'Action irréversible'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isArabic 
                ? 'هل أنت متأكد من رغبتك في حذف جميع الزبائن وسجل المعاملات بالكامل؟'
                : 'Êtes-vous sûr de vouloir supprimer tous les clients et l\'historique des locations ? Toutes les données associées seront réinitialisées.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEmptyConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmEmptyAll}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg"
              >
                {isArabic ? 'نعم، إفراغ الكل' : 'Oui, tout supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Detail Fullscreen Drawer / Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-white/10 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-extrabold text-lg shrink-0">
                  {selectedClient.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-xl font-extrabold text-white truncate">
                    {selectedClient.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 font-mono font-bold border border-amber-400/30 text-[11px]">
                      CIN: {selectedClient.cin}
                    </span>
                    <span className="font-mono text-slate-300">{selectedClient.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingClient(!isEditingClient)}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title={isArabic ? 'تعديل بيانات الزبون' : 'Modifier les données du client'}
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">{isArabic ? 'تعديل' : 'Modifier'}</span>
                </button>

                {onDeleteClient && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentClient}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title={isArabic ? 'حذف الزبون' : 'Supprimer ce client'}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{isArabic ? 'حذف' : 'Supprimer'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">

              {/* 4 Executive KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1: Chiffre d'Affaires Total */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    {isArabic ? 'إجمالي المعاملات' : 'Total Facturé'}
                  </span>
                  <p className="text-lg sm:text-xl font-extrabold text-white mt-1">
                    {formatNumber((selectedClient.totalPaid || 0) + (selectedClient.totalDue || 0))} {t.dh}
                  </p>
                  <span className="text-[10px] text-emerald-400 mt-0.5">
                    {isArabic ? 'المدفوع:' : 'Encaissé:'} {formatNumber(selectedClient.totalPaid || 0)} {t.dh}
                  </span>
                </div>

                {/* 2: Reste / Impayé */}
                <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                  (selectedClient.totalDue || 0) > 0 ? 'bg-rose-500/15 border-rose-500/30' : 'bg-white/[0.03] border-white/10'
                }`}>
                  <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                    (selectedClient.totalDue || 0) > 0 ? 'text-rose-300' : 'text-slate-400'
                  }`}>
                    <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                    {t.unpaid}
                  </span>
                  <p className={`text-lg sm:text-xl font-extrabold mt-1 ${
                    (selectedClient.totalDue || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {formatNumber(selectedClient.totalDue || 0)} {t.dh}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {(selectedClient.totalDue || 0) > 0 
                      ? (isArabic ? '⚠️ دين معلق للتحصيل' : '⚠️ Solde à encaisser') 
                      : (isArabic ? 'الحساب مسوى ✓' : 'Compte à jour ✓')}
                  </span>
                </div>

                {/* 3: Kilomètres Totaux Parcourus */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    {isArabic ? 'مجموع الكيلومترات' : 'Km Cumulés'}
                  </span>
                  <p className="text-lg sm:text-xl font-extrabold text-amber-400 mt-1 font-mono">
                    {formatNumber(totalKmDrivenByClient)} km
                  </p>
                  <span className="text-[10px] text-slate-300 mt-0.5">
                    {isArabic ? 'المسافة المقطوعة' : 'Distance totale roulée'}
                  </span>
                </div>

                {/* 4: Durée & Contrats */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    {isArabic ? 'مجموع الإيجارات' : 'Locations & Jours'}
                  </span>
                  <p className="text-lg sm:text-xl font-extrabold text-white mt-1">
                    {activeClientContracts.length} {isArabic ? 'عقد' : 'contrats'}
                  </p>
                  <span className="text-[10px] text-sky-300 mt-0.5">
                    {totalDaysRentedByClient} {t.days} {isArabic ? 'إجمالاً' : 'au total'}
                  </span>
                </div>
              </div>

              {/* Settle Debt Quick Form if client has balance due */}
              {(selectedClient.totalDue || 0) > 0 && (
                <form onSubmit={handlePayDebtSubmit} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-3">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                    <CreditCard className="w-4 h-4" />
                    <span>{isArabic ? 'استخلاص دين معلق' : 'Encaisser un règlement / régularisation'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={settleAmount}
                        onChange={e => setSettleAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        max={selectedClient.totalDue}
                        min={1}
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-rose-400/40 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-rose-500/30"
                        placeholder={isArabic ? 'المبلغ المؤدى (درهم)' : 'Montant du versement (DH)'}
                        required
                      />
                      <span className="absolute right-3 top-3 text-xs font-bold text-amber-300">{t.dh}</span>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      {isArabic ? 'تسجيل الأداء' : 'Valider l\'encaissement'}
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Mode vs Read Mode Client Coordinates */}
              {isEditingClient ? (
                <form onSubmit={handleSaveClientEdit} className="p-4 rounded-2xl bg-white/[0.04] border border-amber-400/30 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {isArabic ? 'تعديل بطاقة الزبون' : 'Modifier la fiche client'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingClient(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      {t.cancel}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">{isArabic ? 'الاسم الكامل' : 'Nom et Prénom'} *</label>
                      <input
                        type="text"
                        value={editFormData.fullName || ''}
                        onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">{t.phone} *</label>
                      <input
                        type="tel"
                        value={editFormData.phone || ''}
                        onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-amber-500/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">{t.cinPassport} *</label>
                      <input
                        type="text"
                        value={editFormData.cin || ''}
                        onChange={e => setEditFormData({ ...editFormData, cin: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs font-mono text-amber-300 focus:ring-2 focus:ring-amber-500/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">{t.drivingLicense}</label>
                      <input
                        type="text"
                        value={editFormData.drivingLicenseNumber || ''}
                        onChange={e => setEditFormData({ ...editFormData, drivingLicenseNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">{t.email}</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">{t.address}</label>
                      <input
                        type="text"
                        value={editFormData.address || ''}
                        onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">{isArabic ? 'ملاحظات' : 'Notes & Remarques'}</label>
                      <input
                        type="text"
                        value={editFormData.notes || ''}
                        onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.save}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/5 text-amber-400 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.phone}</span>
                      <p className="font-bold text-white font-mono">{selectedClient.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/5 text-amber-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.drivingLicense}</span>
                      <p className="font-bold text-white font-mono">{selectedClient.drivingLicenseNumber || 'Non renseigné'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/5 text-slate-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.email}</span>
                      <p className="font-bold text-white truncate">{selectedClient.email || 'contact@client.ma'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/5 text-slate-400 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.address}</span>
                      <p className="font-bold text-white truncate">{selectedClient.address || 'Casablanca, Maroc'}</p>
                    </div>
                  </div>

                  {selectedClient.notes && (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">{isArabic ? 'ملاحظات' : 'Notes & Remarques'}</span>
                      <p className="text-slate-300 italic text-xs">"{selectedClient.notes}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* REDESIGNED: HISTORIQUE DES LOCATIONS ET KILOMÈTRES PAR CLIENT */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-400 text-black">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                        {isArabic ? 'سجل الإيجارات والكيلومترات للمستهلك' : 'Historique des locations et Kilomètres par client'}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {activeClientContracts.length} {isArabic ? 'عقد مسجل' : 'contrat(s) enregistré(s)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-extrabold flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5" />
                      {formatNumber(totalKmDrivenByClient)} km {isArabic ? 'إجمالي' : 'au total'}
                    </span>
                  </div>
                </div>

                {activeClientContracts.length > 0 ? (
                  <div className="space-y-3">
                    {activeClientContracts.map((c, index) => {
                      const kmStart = c.startMileage || 0;
                      const kmEnd = c.endMileage;
                      const kmDiff = c.totalKmDriven || (kmEnd && kmEnd > kmStart ? kmEnd - kmStart : 0);

                      return (
                        <div
                          key={c.id}
                          className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-amber-400/40 transition-all space-y-3 group"
                        >
                          {/* Card Header: Vehicle + Matricule + Contract Ref + Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                                <Car className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5 className="font-extrabold text-sm text-white">{c.vehicleName}</h5>
                                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-400/30">
                                    {c.vehicleMatricule}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {c.contractNumber || `CTR-${c.id.slice(0, 8)}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                                c.status === 'en_cours'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}>
                                {c.status === 'en_cours' ? (isArabic ? 'قيد التنفيذ' : 'En cours') : (isArabic ? 'مكتمل' : 'Terminé')}
                              </span>

                              {onDeleteContract && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContractFromHistory(c.id, c.vehicleName)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title={isArabic ? 'حذف هذا العقد' : 'Supprimer ce contrat de l\'historique'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Card Core Content: 3 Dedicated Grid Columns */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            
                            {/* Column 1: Dates & Duration */}
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                {t.rentalPeriod}
                              </span>
                              <p className="font-semibold text-slate-200">
                                {formatShortDate(c.startDate)} <span className="text-amber-400">→</span> {formatShortDate(c.endDate)}
                              </p>
                              <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 text-amber-300 font-bold text-[11px] border border-white/10">
                                {c.durationDays} {t.days}
                              </span>
                            </div>

                            {/* Column 2: REFINED KILOMÈTRES & PARCOURS */}
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                                  <Gauge className="w-3.5 h-3.5" />
                                  {isArabic ? 'العداد والكيلومترات' : 'Compteur & Kilomètres'}
                                </span>
                                {kmDiff > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black font-mono font-extrabold text-[10px]">
                                    +{formatNumber(kmDiff)} km
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">{isArabic ? 'بداية:' : 'Départ:'}</span>
                                <span className="font-mono font-bold text-white">{formatNumber(kmStart)} km</span>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">{isArabic ? 'إرجاع:' : 'Retour:'}</span>
                                <span className="font-mono font-bold text-slate-200">
                                  {kmEnd ? `${formatNumber(kmEnd)} km` : (isArabic ? 'قيد السير...' : 'En cours...')}
                                </span>
                              </div>
                            </div>

                            {/* Column 3: Financial & Payment Status */}
                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                {isArabic ? 'الجانب المالي' : 'Finances & Caution'}
                              </span>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                                <span className="font-extrabold text-white">{formatNumber(c.totalAmount)} {t.dh}</span>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">{isArabic ? 'المدفوع:' : 'Payé:'}</span>
                                <span className="font-bold text-emerald-400">{formatNumber(c.paidAmount)} {t.dh}</span>
                              </div>

                              {c.depositAmount ? (
                                <div className="pt-1 border-t border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
                                  <span>{t.depositCaution}:</span>
                                  <span className="text-amber-300 font-mono font-bold">{formatNumber(c.depositAmount)} {t.dh}</span>
                                </div>
                              ) : null}
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <p className="text-xs text-slate-400 italic">
                      {isArabic ? 'لا توجد عقود أو رحلات سابقة لهذا الزبون.' : 'Aucun contrat ou historique de location pour ce client.'}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Bottom Footer (Responsive) */}
            <div className="p-3.5 sm:p-4 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <button
                id="client-detail-return-footer-btn"
                type="button"
                onClick={() => setSelectedClient(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-xs sm:text-sm font-bold border border-white/15 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>{isArabic ? '← العودة إلى القائمة' : '← Retour à la liste'}</span>
              </button>

              {onSelectClientToRent && (
                <button
                  type="button"
                  onClick={() => {
                    const cl = selectedClient;
                    setSelectedClient(null);
                    onSelectClientToRent(cl);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-black text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>{isArabic ? 'عقد إيجار جديد لهذا الزبون' : 'Nouveau contrat pour ce client'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
