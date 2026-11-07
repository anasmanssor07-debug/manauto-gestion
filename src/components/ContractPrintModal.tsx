import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Car, User, Stamp, CalendarCheck } from 'lucide-react';
import { Contract, AgencySettings } from '../types';
import { formatNumber, formatDate, formatCurrency } from '../utils/formatters';
import { MoroccanPlate } from './MoroccanPlate';
import appLogo from '../assets/images/app_phone_logo_1787510482700.jpg';

interface ContractPrintModalProps {
  contract: Contract | null;
  settings: AgencySettings;
  currentUser?: string;
  onClose: () => void;
}

export const ContractPrintModal: React.FC<ContractPrintModalProps> = ({
  contract,
  settings,
  currentUser,
  onClose
}) => {
  if (!contract) return null;

  const handlePrint = () => {
    window.print();
  };

  const displayName = currentUser && currentUser.trim() ? currentUser : settings.agencyName;
  const isReservation = contract.status === 'reserve' || contract.contractNumber.startsWith('RES-');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div
        id="contract-print-modal"
        className="relative w-full max-w-3xl bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-4 max-h-[95vh] flex flex-col print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none print:bg-white"
      >
        {/* Top Controls Bar (hidden during print) */}
        <div className="p-4 bg-slate-950/80 border-b border-white/10 text-white flex items-center justify-between print:hidden backdrop-blur-xl">
          <div className="flex items-center gap-2">
            {isReservation ? (
              <CalendarCheck className="w-5 h-5 text-sky-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            )}
            <span className="font-bold text-sm">
              {isReservation ? 'Bon de Réservation Officiel' : 'Contrat de Location Officiel'} • {contract.contractNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimer / Exporter PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto print:p-6 text-slate-900 bg-white m-2 sm:m-4 rounded-2xl print:m-0 print:rounded-none text-xs">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between border-b border-neutral-300 pb-4 sm:pb-5 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-neutral-300 p-1 bg-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={settings.logoUrl || appLogo}
                  alt="Logo Agence"
                  className="w-full h-full rounded-xl object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = appLogo;
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">{displayName}</h1>
                <p className="text-neutral-600 mt-0.5 text-[11px] sm:text-xs">{settings.address}</p>
                <p className="text-neutral-600 text-[11px] sm:text-xs">Tél: {settings.phone} • Email: {settings.email}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                  RC: {settings.rc} | ICE: {settings.ice} | Patente: {settings.patente}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
              <div>
                <div className="inline-block px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-300 font-mono font-bold text-xs sm:text-sm">
                  N° {contract.contractNumber}
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">Date: {formatDate(contract.createdAt)}</p>
              </div>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isReservation
                  ? 'bg-sky-100 text-sky-900 border border-sky-300'
                  : contract.status === 'en_cours'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : contract.status === 'termine'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {isReservation
                  ? 'RÉSERVATION CONFIRMÉE'
                  : contract.status === 'en_cours'
                  ? 'CONTRAT EN COURS'
                  : contract.status === 'termine'
                  ? 'CONTRAT CLÔTURÉ'
                  : 'CONTRAT ANNULÉ'}
              </span>
            </div>
          </div>

          <h2 className="text-center font-extrabold text-xs sm:text-sm uppercase tracking-widest py-1.5 border-y border-neutral-200 bg-neutral-50">
            {isReservation ? 'BON DE RÉSERVATION DE VÉHICULE' : 'CONTRAT DE LOCATION DE VÉHICULE SANS CHAUFFEUR'}
          </h2>

          {/* Grid: Client & Vehicle Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 sm:gap-4">
            {/* Client Card */}
            <div className="p-3 sm:p-4 rounded-xl border border-neutral-300 bg-neutral-50/50 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 border-b border-neutral-200 pb-1 text-xs">
                <User className="w-3.5 h-3.5 text-neutral-500" />
                INFORMATIONS DU CLIENT / LOCATAIRE
              </div>
              <div><span className="text-neutral-500">Nom & Prénom:</span> <strong className="text-neutral-950">{contract.clientName}</strong></div>
              <div><span className="text-neutral-500">CIN / Passeport:</span> <strong className="font-mono">{contract.clientCin}</strong></div>
              <div><span className="text-neutral-500">Téléphone:</span> <strong className="font-mono">{contract.clientPhone}</strong></div>
              <div><span className="text-neutral-500">N° Permis:</span> <strong className="font-mono">{contract.clientLicense}</strong></div>
            </div>

            {/* Vehicle Card */}
            <div className="p-3 sm:p-4 rounded-xl border border-neutral-300 bg-neutral-50/50 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900 border-b border-neutral-200 pb-1 text-xs">
                <Car className="w-3.5 h-3.5 text-neutral-500" />
                VÉHICULE RÉSERVÉ / LOUÉ
              </div>
              <div><span className="text-neutral-500">Modèle:</span> <strong className="text-neutral-950">{contract.vehicleName}</strong></div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">Immatriculation:</span>
                <MoroccanPlate matricule={contract.vehicleMatricule} size="sm" />
              </div>
              <div><span className="text-neutral-500">Km au départ:</span> <strong className="font-mono">{formatNumber(contract.startMileage)} km</strong></div>
              <div><span className="text-neutral-500">Carburant départ:</span> <strong>{contract.fuelLevelStart}</strong></div>
            </div>
          </div>

          {/* Rental Duration & Financial Table */}
          <div className="rounded-xl border border-neutral-300 overflow-x-auto">
            <table className="w-full text-left min-w-[320px]">
              <thead className="bg-neutral-100 border-b border-neutral-300 text-neutral-600 font-bold text-[10px] sm:text-[11px]">
                <tr>
                  <th className="p-2 sm:p-2.5">Date & Heure Début</th>
                  <th className="p-2 sm:p-2.5">Date & Heure Fin</th>
                  <th className="p-2 sm:p-2.5 text-center">Durée</th>
                  <th className="p-2 sm:p-2.5 text-right">Tarif / jour</th>
                  <th className="p-2 sm:p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-[11px] sm:text-xs">
                <tr>
                  <td className="p-2 sm:p-2.5">{formatDate(contract.startDate)} à {contract.startTime}</td>
                  <td className="p-2 sm:p-2.5">{formatDate(contract.endDate)} à {contract.endTime}</td>
                  <td className="p-2 sm:p-2.5 text-center font-bold">{contract.durationDays} j</td>
                  <td className="p-2 sm:p-2.5 text-right">{contract.dailyRate} DH</td>
                  <td className="p-2 sm:p-2.5 text-right font-bold text-neutral-950">{formatNumber(contract.totalAmount)} DH</td>
                </tr>
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="p-2.5 sm:p-3 bg-neutral-50 border-t border-neutral-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] sm:text-xs">
              <div>
                <span className="text-neutral-500">Caution / Garantie : </span>
                <strong>{formatNumber(contract.depositAmount)} DH</strong> ({contract.depositType.replace('_', ' ')})
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div>
                  <span className="text-neutral-500">{isReservation ? 'Acompte versé : ' : 'Payé : '}</span>
                  <strong className="text-emerald-700">{formatNumber(contract.paidAmount)} DH</strong>
                </div>
                <div>
                  <span className="text-neutral-500">Reste : </span>
                  <strong className={contract.remainingAmount > 0 ? 'text-rose-600' : 'text-neutral-900'}>
                    {formatNumber(contract.remainingAmount)} DH
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-[9px] sm:text-[10px] text-neutral-600 space-y-1">
            <p className="font-bold text-neutral-900">Conditions Générales :</p>
            <p>{settings.termsAndConditions}</p>
          </div>

          {/* Signatures & Place pour Cachet / Signature Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-neutral-300">
            {/* Signature & Cachet Agence */}
            <div className="text-center p-3 sm:p-4 border border-neutral-300 rounded-2xl bg-neutral-50/50 flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
              <div className="font-bold text-neutral-900 text-xs">
                Signature & Cachet : <span className="text-neutral-950 font-black underline">{displayName}</span>
              </div>
              
              <div className="h-12 sm:h-16 flex items-center justify-center my-1">
                <span className="text-neutral-400 italic text-[10px] sm:text-[11px]">Signature autorisée de l'Agence</span>
              </div>

              <p className="text-[9px] text-neutral-500 font-medium">Pour l'Agence {displayName}</p>
            </div>

            {/* Client signature */}
            <div className="text-center p-3 sm:p-4 border border-neutral-300 rounded-2xl bg-white flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
              <div className="flex items-center justify-center gap-1 font-bold text-neutral-900 text-xs">
                <span>Signature Client ({contract.clientName})</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>

              <div className="h-12 sm:h-16 flex items-center justify-center my-1">
                {contract.clientSignature ? (
                  <img
                    src={contract.clientSignature}
                    alt="Signature client"
                    className="max-h-12 sm:max-h-14 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-neutral-400 italic text-[10px] sm:text-[11px]">Signé numériquement</span>
                )}
              </div>

              {contract.signedAt && (
                <p className="text-[9px] text-neutral-400">Signé et approuvé le {formatDate(contract.signedAt)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
