import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, FileText, CheckCircle2, Clock, Printer, RotateCcw, 
  ArrowRight, X, AlertCircle, Edit2, Ban, Check, ChevronDown, CalendarCheck, 
  Calendar, KeyRound, ArrowUpRight, CheckSquare
} from 'lucide-react';
import { Contract, Vehicle, ContractStatus } from '../types';
import { formatNumber, formatShortDate, formatDate } from '../utils/formatters';
import { MoroccanPlate } from './MoroccanPlate';

interface ContractListProps {
  contracts: Contract[];
  vehicles: Vehicle[];
  onOpenNewContract: () => void;
  onViewContractPrint: (contract: Contract) => void;
  onReturnVehicle: (contractId: string, returnData: {
    endMileage: number;
    fuelLevelEnd: string;
    paidAmountDelta: number;
    returnedAt: string;
  }) => void;
  onUpdateContractStatus: (contractId: string, newStatus: ContractStatus, notes?: string) => void;
  onDetailStateChange?: (isOpen: boolean) => void;
}

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  vehicles,
  onOpenNewContract,
  onViewContractPrint,
  onReturnVehicle,
  onUpdateContractStatus,
  onDetailStateChange
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'reserve' | 'en_cours' | 'termine' | 'annule'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Return Vehicle Modal State
  const [returningContract, setReturningContract] = useState<Contract | null>(null);
  const [returnMileage, setReturnMileage] = useState<number | ''>(0);
  const [returnFuel, setReturnFuel] = useState<string>('Plein');
  const [extraPayment, setExtraPayment] = useState<number | ''>(0);

  // Status Modification Modal State
  const [statusModalContract, setStatusModalContract] = useState<Contract | null>(null);
  const [targetStatus, setTargetStatus] = useState<ContractStatus>('en_cours');
  const [statusChangeNote, setStatusChangeNote] = useState('');

  // Notify parent if any contract modal/detail is open
  React.useEffect(() => {
    onDetailStateChange?.(Boolean(returningContract || statusModalContract));
  }, [returningContract, statusModalContract, onDetailStateChange]);

  const reservationsCount = useMemo(() => contracts.filter(c => c.status === 'reserve').length, [contracts]);
  const activeRentalsCount = useMemo(() => contracts.filter(c => c.status === 'en_cours').length, [contracts]);
  const completedCount = useMemo(() => contracts.filter(c => c.status === 'termine').length, [contracts]);
  const cancelledCount = useMemo(() => contracts.filter(c => c.status === 'annule').length, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.contractNumber.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.vehicleName.toLowerCase().includes(q) ||
        c.vehicleMatricule.toLowerCase().includes(q);

      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, filterStatus]);

  const handleOpenReturnModal = (c: Contract) => {
    setReturningContract(c);
    setReturnMileage(c.startMileage + (c.durationDays * 150)); // reasonable estimate
    setReturnFuel('Plein');
    setExtraPayment(c.remainingAmount);
  };

  const handleOpenStatusModal = (c: Contract) => {
    setStatusModalContract(c);
    setTargetStatus(c.status);
    setStatusChangeNote('');
  };

  const handleConfirmStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalContract) return;

    onUpdateContractStatus(statusModalContract.id, targetStatus, statusChangeNote);
    setStatusModalContract(null);
  };

  const handleQuickValidateDeparture = (c: Contract) => {
    onUpdateContractStatus(c.id, 'en_cours', 'Départ validé - Véhicule remis au client');
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningContract) return;

    const finalReturnKm = returnMileage === '' ? returningContract.startMileage : Number(returnMileage);
    if (finalReturnKm < returningContract.startMileage) {
      alert('Le kilométrage de retour ne peut pas être inférieur au kilométrage de départ.');
      return;
    }

    onReturnVehicle(returningContract.id, {
      endMileage: finalReturnKm,
      fuelLevelEnd: returnFuel,
      paidAmountDelta: extraPayment === '' ? 0 : Number(extraPayment),
      returnedAt: new Date().toISOString()
    });

    setReturningContract(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="contracts-page-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-400" />
            Réservations & Contrats <span className="text-slate-400 font-medium text-lg">({contracts.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestion complète des réservations planifiées, contrats de location en cours, retours et règlements
          </p>
        </div>

        <button
          id="add-contract-btn-page"
          onClick={onOpenNewContract}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>+ Nouvelle Réservation / Contrat</span>
        </button>
      </div>

      {/* Quick Summary Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div 
          onClick={() => setFilterStatus('reserve')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'reserve'
              ? 'bg-sky-500/20 border-sky-400/50 shadow-md'
              : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Réservations
            </span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
              {reservationsCount}
            </span>
          </div>
          <p className="text-lg font-black text-white mt-1">{reservationsCount} <span className="text-[11px] font-normal text-slate-400">à venir</span></p>
        </div>

        <div 
          onClick={() => setFilterStatus('en_cours')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'en_cours'
              ? 'bg-amber-500/20 border-amber-400/50 shadow-md'
              : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> En Location
            </span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              {activeRentalsCount}
            </span>
          </div>
          <p className="text-lg font-black text-white mt-1">{activeRentalsCount} <span className="text-[11px] font-normal text-slate-400">sur route</span></p>
        </div>

        <div 
          onClick={() => setFilterStatus('termine')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'termine'
              ? 'bg-emerald-500/20 border-emerald-400/50 shadow-md'
              : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Clôturés
            </span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              {completedCount}
            </span>
          </div>
          <p className="text-lg font-black text-white mt-1">{completedCount} <span className="text-[11px] font-normal text-slate-400">terminés</span></p>
        </div>

        <div 
          onClick={() => setFilterStatus('annule')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'annule'
              ? 'bg-rose-500/20 border-rose-400/50 shadow-md'
              : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
              <Ban className="w-3.5 h-3.5" /> Annulés
            </span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
              {cancelledCount}
            </span>
          </div>
          <p className="text-lg font-black text-white mt-1">{cancelledCount} <span className="text-[11px] font-normal text-slate-400">annulations</span></p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-amber-400 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            Tous ({contracts.length})
          </button>

          <button
            onClick={() => setFilterStatus('reserve')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'reserve'
                ? 'bg-sky-500 text-black font-bold shadow-[0_0_15px_rgba(14,165,233,0.25)]'
                : 'bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Réservations ({reservationsCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('en_cours')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'en_cours'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/15'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En Location ({activeRentalsCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('termine')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'termine'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/15'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terminés ({completedCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('annule')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'annule'
                ? 'bg-rose-500 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/15'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Annulés ({cancelledCount})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-contracts-input"
            type="text"
            placeholder="N° contrat, client, matricule..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 backdrop-blur-md"
          />
        </div>
      </div>

      {/* Contracts & Reservations Table in Frosted Glass */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table id="contracts-table" className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Type & Référence</th>
                <th className="py-3.5 px-4 sm:px-6">Client</th>
                <th className="py-3.5 px-4 sm:px-6">Véhicule</th>
                <th className="py-3.5 px-4 sm:px-6">Dates & Durée</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Montant / Reste</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Statut (Interactif)</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredContracts.map(c => {
                const isReservation = c.status === 'reserve' || c.contractNumber.startsWith('RES-');
                const isCurrent = c.status === 'en_cours';
                const isTerminated = c.status === 'termine';
                const isCancelled = c.status === 'annule';

                return (
                  <tr key={c.id} className="hover:bg-white/[0.04] transition-colors">
                    {/* N° Contrat / Réservation */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`font-mono font-bold px-2.5 py-1 rounded-lg text-xs border ${
                          isReservation
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}>
                          {c.contractNumber}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {isReservation ? '📅 Réservation' : '📋 Contrat Location'}
                        </span>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-4 px-4 sm:px-6">
                      <p className="font-bold text-white">{c.clientName}</p>
                      <p className="text-xs text-slate-400 font-mono">{c.clientPhone}</p>
                      {c.clientCin && <p className="text-[10px] text-slate-500 font-mono">CIN: {c.clientCin}</p>}
                    </td>

                    {/* Véhicule */}
                    <td className="py-4 px-4 sm:px-6">
                      <p className="font-bold text-slate-200">{c.vehicleName}</p>
                      <div className="mt-1">
                        <MoroccanPlate matricule={c.vehicleMatricule} size="sm" />
                      </div>
                    </td>

                    {/* Période */}
                    <td className="py-4 px-4 sm:px-6 text-slate-300">
                      <div className="font-semibold text-white">
                        {formatShortDate(c.startDate)} → {formatShortDate(c.endDate)}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {c.durationDays} jours • {c.dailyRate} DH/j
                      </span>
                    </td>

                    {/* Montant / Solde */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <p className="font-extrabold text-white">{formatNumber(c.totalAmount)} DH</p>
                      {c.paidAmount > 0 && (
                        <p className="text-[10px] text-slate-400">
                          Avance/Payé: <span className="text-emerald-400 font-semibold">{formatNumber(c.paidAmount)} DH</span>
                        </p>
                      )}
                      {c.remainingAmount > 0 ? (
                        <span className="text-xs font-bold text-rose-400">
                          Reste: {formatNumber(c.remainingAmount)} DH
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400">Solder (Payé)</span>
                      )}
                    </td>

                    {/* Statut with interactive modal button */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(c)}
                        title="Cliquez pour changer le statut (Réservation, En cours, Terminé, Annulé)"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 cursor-pointer ${
                          isReservation
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                            : isCurrent
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : isTerminated
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        }`}
                      >
                        {isReservation && <Calendar className="w-3.5 h-3.5 text-sky-400" />}
                        {isCurrent && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                        {isTerminated && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {isCancelled && <Ban className="w-3.5 h-3.5 text-rose-400" />}
                        <span>
                          {isReservation ? 'Réservé' : isCurrent ? 'En cours' : isTerminated ? 'Terminé' : 'Annulé'}
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* If reservation: Quick Start Departure button */}
                        {isReservation && (
                          <button
                            onClick={() => handleQuickValidateDeparture(c)}
                            title="Remettre la voiture au client et démarrer la location"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-black font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Départ (Louer)</span>
                          </button>
                        )}

                        {/* Print PDF */}
                        <button
                          onClick={() => onViewContractPrint(c)}
                          title="Imprimer le document officiel PDF (Contrat / Bon de Réservation)"
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition-colors backdrop-blur-md cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* If active rental: Return car button */}
                        {isCurrent && (
                          <button
                            onClick={() => handleOpenReturnModal(c)}
                            title="Clôturer le contrat et restituer le véhicule"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restituer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="p-10 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-300 text-sm">Aucun enregistrement trouvé</p>
            <p className="mt-1">Créez une nouvelle réservation ou un nouveau contrat en cliquant sur le bouton ci-dessus.</p>
          </div>
        )}
      </div>

      {/* STATUS MODIFICATION MODAL */}
      {statusModalContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 text-slate-100 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-400" />
                  Modifier le Statut
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {statusModalContract.contractNumber} • {statusModalContract.clientName} ({statusModalContract.vehicleName})
                </p>
              </div>
              <button
                onClick={() => setStatusModalContract(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmStatusChange} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-2.5">Choisir le nouveau statut :</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetStatus('reserve')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      targetStatus === 'reserve'
                        ? 'bg-sky-500 text-black font-extrabold border-sky-500 shadow-lg'
                        : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Réservation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetStatus('en_cours')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      targetStatus === 'en_cours'
                        ? 'bg-amber-400 text-black font-extrabold border-amber-400 shadow-lg'
                        : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    <span>En cours</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetStatus('termine')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      targetStatus === 'termine'
                        ? 'bg-emerald-500 text-black font-extrabold border-emerald-500 shadow-lg'
                        : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Terminé</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetStatus('annule')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      targetStatus === 'annule'
                        ? 'bg-rose-600 text-white font-extrabold border-rose-600 shadow-lg'
                        : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    <Ban className="w-5 h-5" />
                    <span>Annulé</span>
                  </button>
                </div>
              </div>

              {/* Status Explanation Banner */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300 space-y-1">
                {targetStatus === 'reserve' && (
                  <p className="text-[11px] text-sky-300">
                    🔵 <strong>Réservation :</strong> Le véhicule est réservé pour des dates ultérieures. Il reste disponible jusqu'au départ.
                  </p>
                )}
                {targetStatus === 'en_cours' && (
                  <p className="text-[11px] text-amber-300">
                    🟡 <strong>En cours :</strong> Le véhicule ({statusModalContract.vehicleName}) est actuellement loué sur route ("En location").
                  </p>
                )}
                {targetStatus === 'termine' && (
                  <p className="text-[11px] text-emerald-300">
                    🟢 <strong>Terminé :</strong> La location est clôturée. Le véhicule ({statusModalContract.vehicleName}) est libéré ("Disponible").
                  </p>
                )}
                {targetStatus === 'annule' && (
                  <p className="text-[11px] text-rose-300">
                    🔴 <strong>Annulé :</strong> La réservation ou contrat est annulé. Le véhicule est immédiatement libéré ("Disponible").
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Motif ou note de modification (optionnel)
                </label>
                <input
                  type="text"
                  value={statusChangeNote}
                  onChange={e => setStatusChangeNote(e.target.value)}
                  placeholder="Ex: Confirmation départ, prolongation, annulation client..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStatusModalContract(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Appliquer le Statut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Vehicle Modal with Frosted Glass */}
      {returningContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 text-slate-100">
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Restitution du Véhicule</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clôture du contrat {returningContract.contractNumber} • {returningContract.vehicleName}
                </p>
              </div>
              <button
                onClick={() => setReturningContract(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Kilométrage départ
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${formatNumber(returningContract.startMileage)} km`}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Kilométrage retour (km)
                  </label>
                  <input
                    type="number"
                    required
                    value={returnMileage}
                    onChange={e => setReturnMileage(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Niveau de Carburant au Retour
                </label>
                <select
                  value={returnFuel}
                  onChange={e => setReturnFuel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white text-sm"
                >
                  <option value="Plein">Plein (100%)</option>
                  <option value="3/4">3/4</option>
                  <option value="1/2">1/2</option>
                  <option value="1/4">1/4</option>
                  <option value="Réserve">Réserve</option>
                </select>
              </div>

              {returningContract.remainingAmount > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-300 font-semibold">Solde restant à régler :</span>
                    <span className="text-sm font-bold text-white font-mono">{formatNumber(returningContract.remainingAmount)} DH</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Montant encaissé lors du retour (DH) :</label>
                    <input
                      type="number"
                      value={extraPayment}
                      onChange={e => setExtraPayment(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">Restitution de la Caution</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {formatNumber(returningContract.depositAmount)} DH ({returningContract.depositType})
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[11px]">
                  À restituer
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReturningContract(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Valider le Retour et Libérer la Voiture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
