import React, { useState } from 'react';
import { X, Wrench, Shield, CheckCircle, Calendar, ArrowRight, Gauge, Fuel, DollarSign, History, AlertTriangle, Edit3, Trash2, AlertCircle, Image as ImageIcon, Sparkles, Check, Clock, Phone, ArrowLeft, CalendarCheck } from 'lucide-react';
import { Vehicle, Contract } from '../types';
import { MoroccanPlate } from './MoroccanPlate';
import { formatNumber, formatDate, getDaysUntil, getKmUntilOilChange, formatShortDate } from '../utils/formatters';
import { CAR_IMAGE_PRESETS } from '../data/carImages';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  contracts: Contract[];
  onClose: () => void;
  onRent: (vehicle: Vehicle) => void;
  onUpdateVehicle: (updated: Vehicle) => void;
  onLogMaintenance: (vehicle: Vehicle, type: 'vidange' | 'assurance' | 'autre') => void;
  onDeleteVehicle?: (vehicle: Vehicle) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  contracts,
  onClose,
  onRent,
  onUpdateVehicle,
  onLogMaintenance,
  onDeleteVehicle
}) => {
  if (!vehicle) return null;

  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editedRate, setEditedRate] = useState(vehicle.dailyRate);
  const [editedMileage, setEditedMileage] = useState(vehicle.mileage);
  const [editedStatus, setEditedStatus] = useState(vehicle.status);
  const [editedImageUrl, setEditedImageUrl] = useState(vehicle.imageUrl);

  // Filter contracts for this vehicle
  const vehicleContracts = contracts.filter(c => c.vehicleId === vehicle.id);

  // Active ongoing contract and return date calculation
  const activeContract = contracts.find(c => c.vehicleId === vehicle.id && c.status === 'en_cours')
    || (vehicle.currentContractId ? contracts.find(c => c.id === vehicle.currentContractId) : undefined);
  const daysUntilReturn = activeContract ? getDaysUntil(activeContract.endDate) : null;

  // Maintenance calculations
  const daysUntilInsurance = getDaysUntil(vehicle.insuranceExpiryDate);
  const kmUntilOil = getKmUntilOilChange(vehicle.mileage, vehicle.lastOilChangeMileage, vehicle.oilChangeIntervalKm);
  const daysUntilTechVisit = getDaysUntil(vehicle.technicalVisitExpiryDate);

  const handleSaveSpecs = () => {
    onUpdateVehicle({
      ...vehicle,
      dailyRate: Number(editedRate),
      mileage: Number(editedMileage),
      status: editedStatus,
      imageUrl: editedImageUrl || vehicle.imageUrl
    });
    setIsEditingSpecs(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div
        id="vehicle-detail-modal"
        className="relative w-full max-w-3xl bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 max-h-[92vh] flex flex-col text-slate-100 animate-in fade-in zoom-in duration-200"
      >
        {/* Top Floating Header Navigation Buttons */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <button
            id="vehicle-detail-back-top-btn"
            onClick={onClose}
            className="pointer-events-auto px-3.5 py-2 rounded-2xl bg-black/75 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xl active:scale-95 cursor-pointer"
            title="Retour à la flotte"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>← Retour</span>
          </button>

          <button
            id="close-vehicle-detail-btn"
            onClick={onClose}
            className="pointer-events-auto p-2 rounded-2xl bg-black/75 text-white hover:bg-black/90 backdrop-blur-md border border-white/15 transition-all shadow-xl active:scale-95 cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Banner with Car Image */}
          <div className="relative h-60 sm:h-76 w-full bg-slate-950">
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            {/* Badges on hero */}
            <div className="absolute top-16 left-4 flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                  vehicle.status === 'disponible'
                    ? 'bg-emerald-500/90 text-white border border-emerald-400/30'
                    : vehicle.status === 'en_location'
                    ? 'bg-amber-500/95 text-black border border-amber-400/40'
                    : 'bg-rose-500/90 text-white border border-rose-400/30'
                }`}
              >
                {vehicle.status === 'disponible'
                  ? '● Disponible'
                  : vehicle.status === 'en_location'
                  ? '● En location'
                  : '● En maintenance'}
              </span>

              {vehicle.status === 'en_location' && activeContract && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/80 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Rentrée : {formatShortDate(activeContract.endDate)}
                    {daysUntilReturn !== null && (
                      <strong className="ml-1 text-white font-extrabold">
                        ({daysUntilReturn < 0 ? `Retard ${Math.abs(daysUntilReturn)}j` : daysUntilReturn === 0 ? "Aujourd'hui" : daysUntilReturn === 1 ? "Demain" : `dans ${daysUntilReturn}j`})
                      </strong>
                    )}
                  </span>
                </span>
              )}
            </div>

            {/* Vehicle Name & Plate */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {vehicle.brand} {vehicle.model} <span className="text-slate-400 font-normal text-xl">({vehicle.year})</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {vehicle.color} • {vehicle.fuel} • {vehicle.transmission}
                </p>
              </div>
              <div className="self-start sm:self-auto">
                <MoroccanPlate matricule={vehicle.matricule} size="md" />
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Active Rental Time & Scheduled Return Date Banner */}
            {(vehicle.status === 'en_location' || activeContract) && activeContract && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-slate-900/50 border-2 border-amber-400/40 shadow-xl backdrop-blur-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-400/20 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        Location en cours
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        Voiture actuellement louée à <span className="text-amber-300">{activeContract.clientName}</span>
                      </h3>
                    </div>
                  </div>

                  {daysUntilReturn !== null && (
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 self-start sm:self-auto shadow-md ${
                        daysUntilReturn < 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : daysUntilReturn === 0
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 animate-pulse'
                          : daysUntilReturn === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {daysUntilReturn < 0
                        ? `⚠️ En retard de ${Math.abs(daysUntilReturn)} jour(s)`
                        : daysUntilReturn === 0
                        ? "⚡ Rentre aujourd'hui"
                        : daysUntilReturn === 1
                        ? "⏰ Rentre demain"
                        : `⏳ Rentre dans ${daysUntilReturn} jours`}
                    </span>
                  )}
                </div>

                {/* Big Return Date Highlight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-400/30 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                      <CalendarCheck className="w-4 h-4 text-amber-400" />
                      Date et Heure de Restitution / Rentrée :
                    </span>
                    <p className="text-lg sm:text-xl font-extrabold text-amber-300 tracking-tight">
                      {formatDate(activeContract.endDate)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-white bg-amber-400/20 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                        Heure prévue : {activeContract.endTime || '18:00'}
                      </span>
                      <span className="text-xs text-slate-300">
                        (Durée : {activeContract.durationDays} jour{activeContract.durationDays > 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-center space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Période de location :</span>
                      <span className="font-semibold text-white">
                        {formatShortDate(activeContract.startDate)} ({activeContract.startTime || '10:00'}) → {formatShortDate(activeContract.endDate)} ({activeContract.endTime || '18:00'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Client conducteur :</span>
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>{activeContract.clientName}</span>
                        {activeContract.clientPhone && (
                          <a
                            href={`tel:${activeContract.clientPhone}`}
                            className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 transition-colors"
                            title="Appeler le client"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{activeContract.clientPhone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                      <span className="text-slate-400">Contrat {activeContract.contractNumber} :</span>
                      <span className="font-bold text-amber-400">
                        {formatNumber(activeContract.totalAmount)} DH
                        {activeContract.remainingAmount > 0 ? (
                          <span className="text-rose-400 font-normal ml-1">
                            (Reste: {formatNumber(activeContract.remainingAmount)} DH)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-normal ml-1">(Payé)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Revenue Badge */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Revenus générés
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
                    {formatNumber(vehicle.totalRevenueGenerated)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">DH</span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {vehicle.totalRentalsCount} contrat{vehicle.totalRentalsCount > 1 ? 's' : ''} au total • {formatNumber(vehicle.totalKmDrivenInRentals)} km loués
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {vehicle.status === 'disponible' && (
                  <button
                    id="modal-rent-now-btn"
                    onClick={() => {
                      onClose();
                      onRent(vehicle);
                    }}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 text-center"
                  >
                    + Louer ce véhicule
                  </button>
                )}
                <button
                  id="toggle-edit-specs-btn"
                  onClick={() => setIsEditingSpecs(!isEditingSpecs)}
                  className="px-3.5 py-3 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 backdrop-blur-md"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>{isEditingSpecs ? 'Fermer' : 'Modifier'}</span>
                </button>
                {onDeleteVehicle && (
                  <button
                    id="modal-delete-vehicle-btn"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-3 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 backdrop-blur-md"
                    title="Supprimer définitivement ce véhicule"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Confirm Delete Banner */}
            {isConfirmingDelete && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-3 animate-in fade-in backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Confirmer la suppression de {vehicle.brand} {vehicle.model} ({vehicle.matricule}) ?
                    </h4>
                    <p className="text-xs text-rose-200/80 mt-0.5">
                      Cette action retirera ce véhicule de votre flotte d'agence.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/10 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    id="confirm-delete-vehicle-final-btn"
                    onClick={() => {
                      if (onDeleteVehicle) {
                        onDeleteVehicle(vehicle);
                      }
                      onClose();
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-lg"
                  >
                    Oui, supprimer le véhicule
                  </button>
                </div>
              </div>
            )}

            {/* Quick Edit Specs Form */}
            {isEditingSpecs && (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-amber-400/30 space-y-4 animate-in fade-in backdrop-blur-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Modifier les paramètres & la photo du véhicule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tarif journalier (DH)</label>
                    <input
                      type="number"
                      value={editedRate}
                      onChange={e => setEditedRate(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Kilométrage actuel (km)</label>
                    <input
                      type="number"
                      value={editedMileage}
                      onChange={e => setEditedMileage(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Statut</label>
                    <select
                      value={editedStatus}
                      onChange={e => setEditedStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="en_location">En location</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Photo modification */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Photo du véhicule (Lien ou sélectionner un modèle ci-dessous)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editedImageUrl}
                      onChange={e => setEditedImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 text-sm bg-slate-800 border border-white/15 rounded-xl text-white focus:ring-2 focus:ring-amber-500/30"
                    />
                    {editedImageUrl && (
                      <div className="w-12 h-10 rounded-xl overflow-hidden border border-white/20 shrink-0">
                        <img src={editedImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Preset thumbnails */}
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {CAR_IMAGE_PRESETS.slice(0, 8).map(preset => (
                      <button
                        key={`${preset.brand}-${preset.model}`}
                        type="button"
                        onClick={() => setEditedImageUrl(preset.imageUrl)}
                        className={`relative shrink-0 rounded-xl overflow-hidden border-2 transition-all p-0.5 w-16 h-12 ${
                          editedImageUrl === preset.imageUrl
                            ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30'
                            : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                        }`}
                        title={`${preset.brand} ${preset.model}`}
                      >
                        <img src={preset.imageUrl} alt={preset.model} className="w-full h-full object-cover rounded-lg" />
                        {editedImageUrl === preset.imageUrl && (
                          <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setIsEditingSpecs(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    id="save-vehicle-specs-btn"
                    onClick={handleSaveSpecs}
                    className="px-4 py-1.5 text-xs font-bold text-black bg-amber-400 rounded-lg hover:bg-amber-300 shadow-md"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-medium text-slate-400">Boîte</span>
                <p className="text-sm font-bold text-white mt-0.5">{vehicle.transmission}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-medium text-slate-400">Carburant</span>
                <p className="text-sm font-bold text-white mt-0.5">{vehicle.fuel}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-medium text-slate-400">Kilométrage</span>
                <p className="text-sm font-bold text-white mt-0.5">{formatNumber(vehicle.mileage)} km</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-medium text-slate-400">Tarif / jour</span>
                <p className="text-sm font-bold text-amber-400 mt-0.5">{vehicle.dailyRate} DH</p>
              </div>
            </div>

            {/* Section: Alertes et Entretiens */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Entretiens & Alertes
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => onLogMaintenance(vehicle, 'vidange')}
                    className="text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                  >
                    + Enregistrer vidange
                  </button>
                  <button
                    onClick={() => onLogMaintenance(vehicle, 'assurance')}
                    className="text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                  >
                    + Renouveler assurance
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Assurance */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-400">Assurance</span>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {daysUntilInsurance <= 0
                          ? 'Expirée !'
                          : daysUntilInsurance <= 15
                          ? `Expire dans ${daysUntilInsurance} jours`
                          : `Valide jusqu'au ${formatShortDate(vehicle.insuranceExpiryDate)}`}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        daysUntilInsurance <= 10
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : daysUntilInsurance <= 30
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {daysUntilInsurance <= 0 ? 'Expirée' : `Dans ${daysUntilInsurance}j`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Échéance: {formatDate(vehicle.insuranceExpiryDate)}</p>
                </div>

                {/* 2. Vidange */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-400">Vidange moteur</span>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {kmUntilOil <= 0
                          ? 'À faire immédiatement !'
                          : kmUntilOil <= 1500
                          ? `Dans ${formatNumber(kmUntilOil)} km`
                          : `Prochaine à ${formatNumber(vehicle.lastOilChangeMileage + vehicle.oilChangeIntervalKm)} km`}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        kmUntilOil <= 500
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : kmUntilOil <= 1500
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {kmUntilOil <= 0 ? 'Urgente' : `Dans ${formatNumber(kmUntilOil)} km`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Dernière: {formatNumber(vehicle.lastOilChangeMileage)} km</p>
                </div>

                {/* 3. Visite Technique */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-400">Visite technique</span>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {daysUntilTechVisit <= 0 ? 'À renouveler' : `Dans ${daysUntilTechVisit} jours`}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-slate-300 border border-white/10">
                      {formatShortDate(vehicle.technicalVisitExpiryDate)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Valide: {formatDate(vehicle.technicalVisitExpiryDate)}</p>
                </div>
              </div>
            </div>

            {/* Section: Historique des locations & Kilomètres par client */}
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-slate-400" />
                Historique des locations et Kilomètres par client
              </h3>

              {vehicleContracts.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Période</th>
                        <th className="py-3 px-4 text-center">Km Parcourus</th>
                        <th className="py-3 px-4 text-right">Montant</th>
                        <th className="py-3 px-4 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {vehicleContracts.map(c => {
                        const kmDriven = c.totalKmDriven || (c.endMileage && c.startMileage ? c.endMileage - c.startMileage : null);

                        return (
                          <tr key={c.id} className="hover:bg-white/[0.04] transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">{c.clientName}</div>
                              <div className="text-[11px] text-slate-400">{c.clientPhone}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <div>{formatShortDate(c.startDate)} → {formatShortDate(c.endDate)}</div>
                              <div className="text-[11px] text-slate-400">{c.durationDays} jours</div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {kmDriven ? (
                                <span className="font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                  +{formatNumber(kmDriven)} km
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">En cours (Dép: {formatNumber(c.startMileage)} km)</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                              {formatNumber(c.totalAmount)} DH
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                  c.status === 'en_cours'
                                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    : c.status === 'termine'
                                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-white/10 text-slate-300 border border-white/10'
                                }`}
                              >
                                {c.status === 'en_cours' ? 'En cours' : 'Terminé'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/10 text-slate-400 text-xs">
                  Aucun contrat enregistré pour cette voiture pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer with prominent Return button */}
        <div className="p-4 bg-slate-950/85 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 backdrop-blur-xl">
          <button
            id="vehicle-detail-return-footer-btn"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-xs sm:text-sm font-bold border border-white/15 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>← Retour aux véhicules</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {vehicle.status === 'disponible' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRent(vehicle);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-black text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                <span>+ Louer ce véhicule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
