import React from 'react';
import { Wallet, Car, Users, FileText, AlertTriangle, ArrowUpRight, CheckCircle2, Clock, Plus, Sparkles, Building2, CalendarCheck, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber, formatShortDate } from '../utils/formatters';
import { Vehicle, Contract, Client } from '../types';
import { MoroccanPlate } from './MoroccanPlate';

interface DashboardOverviewProps {
  vehicles: Vehicle[];
  contracts: Contract[];
  clients: Client[];
  userName?: string;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onRentVehicle: (vehicle: Vehicle) => void;
  onNavigateToTab: (tab: 'fleet' | 'contracts' | 'clients' | 'maintenance' | 'analytics') => void;
  onAddNewVehicle?: () => void;
  onOpenNewContract?: () => void;
  alertCount: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  vehicles,
  contracts,
  clients,
  userName = 'Agence',
  onNavigateToTab,
  onAddNewVehicle,
  onOpenNewContract,
  alertCount
}) => {
  // Aggregate stats: strictly exclude cancelled contracts from revenue total
  const totalRevenue = contracts
    .filter(c => c.status !== 'annule')
    .reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  const totalVehiclesCount = vehicles.length;
  const availableCount = vehicles.filter(v => v.status === 'disponible').length;
  const rentedCount = vehicles.filter(v => v.status === 'en_location').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;
  const totalClientsCount = clients.length;
  const totalContractsCount = contracts.length;
  const reservationsCount = contracts.filter(c => c.status === 'reserve').length;
  const activeContractsCount = contracts.filter(c => c.status === 'en_cours').length;
  const totalUnpaidAmount = clients.reduce((sum, c) => sum + (c.totalDue || 0), 0);

  const recentItems = contracts.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card: Bonjour, UserName */}
      <div
        id="dashboard-welcome-banner"
        className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Espace Agence MANAUTO GESTION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bonjour, <span className="text-amber-400 font-black">{userName}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Bienvenue sur votre système de gestion. Flotte ({totalVehiclesCount} véhicules), réservations à venir ({reservationsCount}), locations en cours ({activeContractsCount}) et règlements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onAddNewVehicle && (
              <button
                id="hero-add-vehicle-btn"
                onClick={onAddNewVehicle}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-all backdrop-blur-md active:scale-95 cursor-pointer"
              >
                <Car className="w-4 h-4 text-amber-400" />
                <span>+ Ajouter une voiture</span>
              </button>
            )}

            {onOpenNewContract && (
              <button
                id="hero-new-contract-btn"
                onClick={onOpenNewContract}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nouvelle Réservation / Contrat</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient glow inside banner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Banner if there are maintenance alerts */}
      {alertCount > 0 && (
        <div
          id="maintenance-alert-banner"
          onClick={() => onNavigateToTab('maintenance')}
          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 cursor-pointer hover:bg-amber-500/15 backdrop-blur-xl transition-all shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-100">
                {alertCount} alerte{alertCount > 1 ? 's' : ''} d'entretien ou d'assurance à vérifier
              </p>
              <p className="text-xs text-amber-300/80">
                Assurances expirant bientôt ou vidanges nécessaires sur votre flotte.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-300 underline flex items-center gap-1">
            Voir alertes <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* 4 Main Summary Cards in Frosted Glass */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Aperçu de l'Activité
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Revenus totaux */}
          <div
            id="stat-card-revenus"
            onClick={() => onNavigateToTab('analytics')}
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg hover:border-white/20 hover:bg-white/[0.07] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs sm:text-sm font-medium">Revenus encaissés</span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {formatNumber(totalRevenue)}
              </span>
              <span className="text-xs font-bold text-slate-400">DH</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Encaissé
              </span>
              {totalUnpaidAmount > 0 && (
                <span className="text-rose-400 font-semibold">
                  Impayés: {formatNumber(totalUnpaidAmount)} DH
                </span>
              )}
            </div>
          </div>

          {/* 2. Total voitures */}
          <div
            id="stat-card-voitures"
            onClick={() => onNavigateToTab('fleet')}
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg hover:border-white/20 hover:bg-white/[0.07] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs sm:text-sm font-medium">Parc Automobile</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {totalVehiclesCount}
              </span>
              <span className="text-xs text-slate-400">véhicules</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-medium">{availableCount} dispo</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{rentedCount} louées</span>
              {maintenanceCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-rose-400 font-medium">{maintenanceCount} garage</span>
                </>
              )}
            </div>
          </div>

          {/* 3. Réservations & Contrats */}
          <div
            id="stat-card-contrats"
            onClick={() => onNavigateToTab('contracts')}
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg hover:border-white/20 hover:bg-white/[0.07] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs sm:text-sm font-medium">Réservations / Contrats</span>
              <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {totalContractsCount}
              </span>
              <span className="text-xs text-slate-400">total</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-sky-400 font-medium">{reservationsCount} réservés</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{activeContractsCount} en cours</span>
            </div>
          </div>

          {/* 4. Total clients */}
          <div
            id="stat-card-clients"
            onClick={() => onNavigateToTab('clients')}
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg hover:border-white/20 hover:bg-white/[0.07] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs sm:text-sm font-medium">Clients & Répertoire</span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {totalClientsCount}
              </span>
              <span className="text-xs text-slate-400">clients</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Fiches enregistrées</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations & Contracts Section */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              Dernières Réservations & Contrats Récents
            </h3>
            <p className="text-[11px] text-slate-400">Les 5 dernières opérations enregistrées</p>
          </div>
          <button
            onClick={() => onNavigateToTab('contracts')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Voir tous</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentItems.length > 0 ? (
          <div className="space-y-2">
            {recentItems.map(c => {
              const isReservation = c.status === 'reserve' || c.contractNumber.startsWith('RES-');
              return (
                <div
                  key={c.id}
                  onClick={() => onNavigateToTab('contracts')}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs font-bold px-2 py-1 rounded-lg border ${
                      isReservation
                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {c.contractNumber}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{c.clientName}</p>
                      <p className="text-[10px] text-slate-400">{c.vehicleName} • {c.durationDays}j</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {formatShortDate(c.startDate)} → {formatShortDate(c.endDate)}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isReservation
                        ? 'bg-sky-500/20 text-sky-300'
                        : c.status === 'en_cours'
                        ? 'bg-amber-500/20 text-amber-300'
                        : c.status === 'termine'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isReservation ? '📅 Réservation' : c.status === 'en_cours' ? '🚗 En location' : c.status === 'termine' ? '✅ Terminé' : '❌ Annulé'}
                    </span>

                    <span className="font-bold text-white font-mono">{formatNumber(c.totalAmount)} DH</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">
            Aucun contrat ou réservation enregistré pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};
