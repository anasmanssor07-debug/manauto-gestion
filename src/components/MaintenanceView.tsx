import React, { useState } from 'react';
import { Wrench, Shield, AlertTriangle, CheckCircle2, Plus, Calendar, DollarSign, Car, Filter, Clock, Sparkles, Check } from 'lucide-react';
import { Vehicle, MaintenanceRecord } from '../types';
import { formatNumber, formatDate, getDaysUntil, getKmUntilOilChange, formatShortDate } from '../utils/formatters';
import { MoroccanPlate } from './MoroccanPlate';

interface MaintenanceViewProps {
  vehicles: Vehicle[];
  maintenanceRecords: MaintenanceRecord[];
  onAddMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  onQuickRenewInsurance: (vehicleId: string, newExpiryDate: string, cost: number, company?: string) => void;
  onQuickLogOilChange: (vehicleId: string, newMileage: number, cost: number) => void;
  onQuickRenewTechVisit?: (vehicleId: string, newExpiryDate: string, cost: number) => void;
  onDetailStateChange?: (isOpen: boolean) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  vehicles,
  maintenanceRecords,
  onAddMaintenanceRecord,
  onQuickRenewInsurance,
  onQuickLogOilChange,
  onQuickRenewTechVisit,
  onDetailStateChange
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [quickInsuranceVehicle, setQuickInsuranceVehicle] = useState<Vehicle | null>(null);

  // Notify parent if maintenance modal/drawer is open
  React.useEffect(() => {
    onDetailStateChange?.(Boolean(showLogModal || quickInsuranceVehicle));
  }, [showLogModal, quickInsuranceVehicle, onDetailStateChange]);
  
  // Quick insurance form state
  const [quickInsuranceDuration, setQuickInsuranceDuration] = useState<'1year' | '6months' | 'custom'>('1year');
  const [quickInsuranceDate, setQuickInsuranceDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [quickInsuranceCost, setQuickInsuranceCost] = useState<number | ''>(4200);
  const [quickInsuranceCompany, setQuickInsuranceCompany] = useState('Sanlam Assurance');

  // Form State for general new log
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [serviceType, setServiceType] = useState<'vidange' | 'assurance' | 'visite_technique' | 'vignette' | 'pneus' | 'freins' | 'autre'>('assurance');
  const [serviceTitle, setServiceTitle] = useState('Renouvellement Police Assurance Tous Risques');
  const [serviceCost, setServiceCost] = useState<number | ''>(4200);
  const [serviceDate, setServiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newExpiryDate, setNewExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [insuranceCompany, setInsuranceCompany] = useState('Sanlam Assurance');
  const [notes, setNotes] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Collect all alerts across vehicles
  const alerts = vehicles.map(v => {
    const daysInsurance = getDaysUntil(v.insuranceExpiryDate);
    const kmOil = getKmUntilOilChange(v.mileage, v.lastOilChangeMileage, v.oilChangeIntervalKm);
    const daysTech = getDaysUntil(v.technicalVisitExpiryDate);

    const isInsuranceUrgent = daysInsurance <= 15;
    const isOilUrgent = kmOil <= 1500;
    const isTechUrgent = daysTech <= 30;

    return {
      vehicle: v,
      daysInsurance,
      kmOil,
      daysTech,
      isInsuranceUrgent,
      isOilUrgent,
      isTechUrgent,
      hasAnyUrgent: isInsuranceUrgent || isOilUrgent || isTechUrgent
    };
  });

  const handleOpenQuickInsurance = (v: Vehicle) => {
    setQuickInsuranceVehicle(v);
    const currentExp = new Date(v.insuranceExpiryDate);
    const baseDate = isNaN(currentExp.getTime()) || currentExp < new Date() ? new Date() : currentExp;
    const oneYearLater = new Date(baseDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    setQuickInsuranceDate(oneYearLater.toISOString().split('T')[0]);
    setQuickInsuranceDuration('1year');
    setQuickInsuranceCost(4200);
    setQuickInsuranceCompany('Sanlam Assurance');
  };

  const handleApplyQuickInsurance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInsuranceVehicle) return;

    onQuickRenewInsurance(
      quickInsuranceVehicle.id,
      quickInsuranceDate,
      Number(quickInsuranceCost),
      quickInsuranceCompany
    );

    triggerToast(`Assurance renouvelée avec succès pour ${quickInsuranceVehicle.brand} ${quickInsuranceVehicle.model} jusqu'au ${formatDate(quickInsuranceDate)} !`);
    setQuickInsuranceVehicle(null);
  };

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle) return;

    onAddMaintenanceRecord({
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      vehicleMatricule: vehicle.matricule,
      type: serviceType,
      title: serviceTitle,
      date: serviceDate,
      cost: Number(serviceCost),
      mileageAtService: vehicle.mileage,
      nextDueDate: (serviceType === 'assurance' || serviceType === 'visite_technique') ? newExpiryDate : undefined,
      notes: notes + (serviceType === 'assurance' ? ` (${insuranceCompany})` : '')
    });

    if (serviceType === 'assurance') {
      onQuickRenewInsurance(vehicle.id, newExpiryDate, Number(serviceCost), insuranceCompany);
      triggerToast(`Assurance enregistrée et mise à jour pour ${vehicle.brand} ${vehicle.model} !`);
    } else if (serviceType === 'vidange') {
      onQuickLogOilChange(vehicle.id, vehicle.mileage, Number(serviceCost));
      triggerToast(`Vidange enregistrée avec succès pour ${vehicle.brand} ${vehicle.model} !`);
    } else if (serviceType === 'visite_technique' && onQuickRenewTechVisit) {
      onQuickRenewTechVisit(vehicle.id, newExpiryDate, Number(serviceCost));
      triggerToast(`Visite technique mise à jour pour ${vehicle.brand} ${vehicle.model} !`);
    }

    setShowLogModal(false);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="maintenance-page-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Entretiens, Assurances & Échéances
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi et renouvellement direct des assurances, vidanges moteur et visites techniques
          </p>
        </div>

        <button
          id="open-log-maintenance-btn"
          onClick={() => setShowLogModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>+ Enregistrer une opération</span>
        </button>
      </div>

      {/* Grid of Vehicle Maintenance Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          État de santé et échéances par véhicule ({vehicles.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map(({ vehicle, daysInsurance, kmOil, daysTech }) => {
            return (
              <div
                key={vehicle.id}
                className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-white/20 hover:bg-white/[0.06] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.model}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-white/15 shadow-sm"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {vehicle.brand} {vehicle.model}
                        </h4>
                        <p className="text-xs text-slate-400">Compteur: {formatNumber(vehicle.mileage)} km</p>
                      </div>
                    </div>
                    <MoroccanPlate matricule={vehicle.matricule} size="sm" />
                  </div>

                  {/* Status Rows in Frosted Glass */}
                  <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
                    {/* 1. Assurance */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="font-medium text-slate-200 block">Assurance</span>
                          <span className="text-[10px] text-slate-400">Expire le: {formatShortDate(vehicle.insuranceExpiryDate)}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          daysInsurance <= 8
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                            : daysInsurance <= 20
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {daysInsurance <= 0 ? 'Expirée !' : `Dans ${daysInsurance}j`}
                      </span>
                    </div>

                    {/* 2. Vidange */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="font-medium text-slate-200 block">Vidange</span>
                          <span className="text-[10px] text-slate-400">Dernière: {formatNumber(vehicle.lastOilChangeMileage)} km</span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          kmOil <= 1000
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                            : kmOil <= 2500
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {kmOil <= 0 ? 'À faire' : `Dans ${formatNumber(kmOil)} km`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action footer */}
                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleOpenQuickInsurance(vehicle)}
                    className="flex-1 py-2 px-2.5 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl text-center shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-black" />
                    <span>Renouveler Assurance</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVehicleId(vehicle.id);
                      setServiceType('vidange');
                      setServiceTitle('Vidange 10 000 km + Filtres');
                      setServiceCost(650);
                      setShowLogModal(true);
                    }}
                    className="py-2 px-3 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-center transition-colors backdrop-blur-md cursor-pointer"
                    title="Enregistrer une vidange"
                  >
                    Vidange
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Maintenance History Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Historique des factures et entretiens effectués ({maintenanceRecords.length})
          </h3>
        </div>

        {/* Mobile View: Responsive Cards (< sm) */}
        <div className="block sm:hidden space-y-3">
          {maintenanceRecords.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-slate-400 text-xs">
              Aucun entretien ou facture enregistré pour le moment.
            </div>
          ) : (
            maintenanceRecords.map(rec => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-md space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {rec.vehicleName}
                    </h4>
                    <span className="font-mono text-slate-400 text-xs">{rec.vehicleMatricule}</span>
                  </div>
                  <span className="text-sm font-extrabold text-amber-400">
                    {formatNumber(rec.cost)} DH
                  </span>
                </div>

                <div className="text-xs text-slate-200 font-medium">
                  {rec.title}
                  {rec.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{rec.notes}</p>}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="capitalize px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/10 text-slate-300 border border-white/10">
                    {rec.type.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 text-[11px]">{formatShortDate(rec.date)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop / Tablet View: Overflow Table (>= sm) */}
        <div className="hidden sm:block overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl scrollbar-thin">
          <table className="w-full text-left text-xs sm:text-sm min-w-[550px]">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4 sm:px-6">Date</th>
                <th className="py-3 px-4 sm:px-6">Véhicule</th>
                <th className="py-3 px-4 sm:px-6">Opération</th>
                <th className="py-3 px-4 sm:px-6 text-center">Type</th>
                <th className="py-3 px-4 sm:px-6 text-right">Coût</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {maintenanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    Aucun entretien ou facture enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                maintenanceRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 whitespace-nowrap">{formatShortDate(rec.date)}</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-white whitespace-nowrap">
                      {rec.vehicleName} <span className="font-mono text-slate-400 text-xs font-normal">({rec.vehicleMatricule})</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-200 font-medium">
                      {rec.title}
                      {rec.notes && <p className="text-[11px] text-slate-400 italic">{rec.notes}</p>}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                      <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
                        {rec.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-amber-400 whitespace-nowrap">
                      {formatNumber(rec.cost)} DH
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEDICATED QUICK INSURANCE RENEWAL MODAL */}
      {quickInsuranceVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-amber-400/30 overflow-hidden my-6 text-slate-100 animate-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex items-start justify-between bg-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400 text-black">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Renouveler l'Assurance</h3>
                  <p className="text-xs text-amber-300/90 font-semibold">
                    {quickInsuranceVehicle.brand} {quickInsuranceVehicle.model} ({quickInsuranceVehicle.matricule})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickInsuranceVehicle(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyQuickInsurance} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Durée de renouvellement</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickInsuranceDuration('1year');
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setQuickInsuranceDate(d.toISOString().split('T')[0]);
                      setQuickInsuranceCost(4200);
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                      quickInsuranceDuration === '1year'
                        ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    + 1 An (12 mois)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickInsuranceDuration('6months');
                      const d = new Date();
                      d.setMonth(d.getMonth() + 6);
                      setQuickInsuranceDate(d.toISOString().split('T')[0]);
                      setQuickInsuranceCost(2400);
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                      quickInsuranceDuration === '6months'
                        ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    + 6 Mois
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickInsuranceDuration('custom')}
                    className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                      quickInsuranceDuration === 'custom'
                        ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    Personnalisé
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Nouvelle date d'expiration de l'assurance
                </label>
                <input
                  type="date"
                  value={quickInsuranceDate}
                  onChange={e => setQuickInsuranceDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm font-bold text-amber-300 focus:ring-2 focus:ring-amber-500/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Compagnie d'Assurance</label>
                  <select
                    value={quickInsuranceCompany}
                    onChange={e => setQuickInsuranceCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                  >
                    <option value="Sanlam Assurance">Sanlam Assurance</option>
                    <option value="Wafa Assurance">Wafa Assurance</option>
                    <option value="RMA Assurance">RMA Assurance</option>
                    <option value="AXA Assurance Maroc">AXA Assurance Maroc</option>
                    <option value="AtlantaSanad">AtlantaSanad</option>
                    <option value="Mamda Mcma">Mamda Mcma</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Montant Prime (DH)</label>
                  <input
                    type="number"
                    value={quickInsuranceCost}
                    onChange={e => setQuickInsuranceCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="4200"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-amber-500/30"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setQuickInsuranceVehicle(null)}
                  className="px-4 py-2.5 font-semibold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                >
                  Confirmer le Renouvellement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* General Modal to log maintenance */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 text-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Enregistrer un Entretien</h3>
                <p className="text-xs text-slate-400 mt-0.5">Vidange, assurance, visite technique ou réparation</p>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Véhicule</label>
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm font-semibold text-white"
                  required
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.matricule}) - {formatNumber(v.mileage)} km
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type d'opération</label>
                  <select
                    value={serviceType}
                    onChange={e => {
                      const val = e.target.value as any;
                      setServiceType(val);
                      if (val === 'assurance') {
                        setServiceTitle('Renouvellement Police Assurance Tous Risques');
                        setServiceCost(4200);
                      } else if (val === 'vidange') {
                        setServiceTitle('Vidange 10 000 km + Remplacement Filtres');
                        setServiceCost(650);
                      } else if (val === 'visite_technique') {
                        setServiceTitle('Visite Technique Périodique');
                        setServiceCost(400);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-sm text-white"
                  >
                    <option value="assurance">Assurance (Renouvellement)</option>
                    <option value="vidange">Vidange moteur</option>
                    <option value="visite_technique">Visite technique</option>
                    <option value="vignette">Vignette</option>
                    <option value="pneus">Pneumatiques</option>
                    <option value="freins">Freins / Plaquettes</option>
                    <option value="autre">Autre réparation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date d'opération</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={e => setServiceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-sm text-white"
                    required
                  />
                </div>
              </div>

              {/* Extra field for new expiry if assurance */}
              {serviceType === 'assurance' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">
                      Nouvelle Échéance Assurance
                    </label>
                    <input
                      type="date"
                      value={newExpiryDate}
                      onChange={e => setNewExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">
                      Compagnie
                    </label>
                    <input
                      type="text"
                      value={insuranceCompany}
                      onChange={e => setInsuranceCompany(e.target.value)}
                      placeholder="Sanlam, Wafa..."
                      className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Désignation / Intitulé</label>
                <input
                  type="text"
                  value={serviceTitle}
                  onChange={e => setServiceTitle(e.target.value)}
                  placeholder="Ex: Vidange Castrol 5W30 + filtre à huile"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coût total (DH)</label>
                <input
                  type="number"
                  value={serviceCost}
                  onChange={e => setServiceCost(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="650"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-amber-500/30"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Garage (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Effectué chez Garage Al Baraka Casablanca..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-sm h-18 resize-none text-white placeholder:text-slate-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md cursor-pointer"
                >
                  Enregistrer l'opération
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
