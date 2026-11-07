import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Car, DollarSign, Shield, CheckCircle2, Plus, AlertCircle, Gauge, Fuel, CalendarCheck, FileText } from 'lucide-react';
import { Vehicle, Client, Contract, ContractStatus } from '../types';
import { SignaturePad } from './SignaturePad';
import { calculateDaysBetween, formatNumber } from '../utils/formatters';
import { useI18n } from '../utils/i18n';

interface NewContractModalProps {
  vehicles: Vehicle[];
  clients: Client[];
  initialVehicle?: Vehicle | null;
  initialType?: 'contrat' | 'reservation';
  onClose: () => void;
  onCreateContract: (
    contractData: Omit<Contract, 'id' | 'contractNumber' | 'createdAt'>,
    newClientData?: Omit<Client, 'id' | 'createdAt' | 'totalContractsCount' | 'totalPaid' | 'totalDue'>
  ) => void;
  onQuickAddClient: () => void;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({
  vehicles,
  clients,
  initialVehicle,
  initialType = 'contrat',
  onClose,
  onCreateContract,
  onQuickAddClient
}) => {
  const { t, isArabic } = useI18n();

  // Mode: Contrat direct vs Réservation planifiée
  const [docType, setDocType] = useState<'contrat' | 'reservation'>(initialType);

  // All vehicles in the fleet are selectable
  const allFleetVehicles = vehicles;
  const matchedVehicle = initialVehicle;

  // Client mode: existing dropdown or new inline client
  const [isInlineNewClient, setIsInlineNewClient] = useState<boolean>(clients.length === 0);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientCin, setNewClientCin] = useState('');
  const [newClientLicense, setNewClientLicense] = useState('');

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    matchedVehicle?.id || allFleetVehicles[0]?.id || ''
  );

  // Today & default 4 days later
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [endTime, setEndTime] = useState<string>('09:00');

  const selectedVehicle = allFleetVehicles.find(v => v.id === selectedVehicleId) || allFleetVehicles[0];
  const selectedClient = clients.find(c => c.id === selectedClientId);

  const [dailyRate, setDailyRate] = useState<number | ''>(selectedVehicle?.dailyRate ?? 280);
  const [depositAmount, setDepositAmount] = useState<number | ''>(5000);
  const [depositType, setDepositType] = useState<'especes' | 'cheque' | 'empreinte_cb' | 'virement'>('empreinte_cb');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [isCustomPaid, setIsCustomPaid] = useState<boolean>(false);
  const [fuelLevel, setFuelLevel] = useState<string>('Plein');
  const [startMileage, setStartMileage] = useState<number | ''>(selectedVehicle?.mileage ?? 0);
  const [signature, setSignature] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Update rates & mileage when vehicle changes
  useEffect(() => {
    if (selectedVehicle) {
      setDailyRate(selectedVehicle.dailyRate);
      setStartMileage(selectedVehicle.mileage);
    }
  }, [selectedVehicleId, selectedVehicle]);

  // Sync selectedClientId if clients list changes
  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
      setIsInlineNewClient(false);
    } else if (clients.length === 0) {
      setIsInlineNewClient(true);
    }
  }, [clients]);

  const durationDays = calculateDaysBetween(startDate, endDate);
  const numDailyRate = typeof dailyRate === 'number' ? dailyRate : (Number(dailyRate) || 0);
  const totalAmount = durationDays * numDailyRate;

  // Auto set paid amount initially based on mode
  useEffect(() => {
    if (!isCustomPaid) {
      if (docType === 'contrat') {
        setPaidAmount(totalAmount);
      } else {
        setPaidAmount(0); // For reservations, defaults to 0 or advance
      }
    }
  }, [totalAmount, isCustomPaid, docType]);

  const numPaidAmount = typeof paidAmount === 'number' ? paidAmount : (Number(paidAmount) || 0);
  const remainingAmount = Math.max(0, totalAmount - numPaidAmount);

  const handlePaidAmountChange = (val: string) => {
    setIsCustomPaid(true);
    if (val === '') {
      setPaidAmount('');
    } else {
      setPaidAmount(Number(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedVehicle) {
      setErrorMessage(isArabic ? 'الرجاء اختيار سيارة' : 'Veuillez sélectionner un véhicule.');
      return;
    }

    let clientIdToUse = selectedClientId;
    let newClientPayload: Omit<Client, 'id' | 'createdAt' | 'totalContractsCount' | 'totalPaid' | 'totalDue'> | undefined;

    if (isInlineNewClient) {
      if (!newClientName.trim()) {
        setErrorMessage(isArabic ? 'الرجاء إدخال اسم الزبون' : 'Le nom du nouveau client est requis.');
        return;
      }
      newClientPayload = {
        fullName: newClientName.trim(),
        phone: newClientPhone.trim() || 'Non renseigné',
        cin: newClientCin.trim() || 'Non renseigné',
        drivingLicenseNumber: newClientLicense.trim() || newClientCin.trim() || 'Non renseigné'
      };
      clientIdToUse = 'NEW_CLIENT_' + Date.now();
    } else {
      if (!selectedClient) {
        setErrorMessage(isArabic ? 'الرجاء اختيار زبون' : 'Veuillez sélectionner un client existant.');
        return;
      }
    }

    if (durationDays < 1) {
      setErrorMessage(isArabic ? 'تاريخ الإرجاع يجب أن يكون بعد تاريخ البداية' : 'La date de fin doit être postérieure ou égale à la date de début.');
      return;
    }

    const clientName = isInlineNewClient ? newClientName.trim() : (selectedClient?.fullName || '');
    const clientPhone = isInlineNewClient ? newClientPhone.trim() : (selectedClient?.phone || '');
    const clientCin = isInlineNewClient ? newClientCin.trim() : (selectedClient?.cin || '');
    const clientLicense = isInlineNewClient ? newClientLicense.trim() : (selectedClient?.drivingLicenseNumber || '');

    const statusToSet: ContractStatus = docType === 'reservation' ? 'reserve' : 'en_cours';

    onCreateContract(
      {
        clientId: clientIdToUse,
        clientName,
        clientPhone,
        clientCin,
        clientLicense,
        vehicleId: selectedVehicle.id,
        vehicleName: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        vehicleMatricule: selectedVehicle.matricule,
        startDate,
        startTime,
        endDate,
        endTime,
        durationDays,
        dailyRate: numDailyRate,
        totalAmount,
        paidAmount: numPaidAmount,
        remainingAmount,
        depositAmount: typeof depositAmount === 'number' ? depositAmount : (Number(depositAmount) || 0),
        depositType,
        startMileage: typeof startMileage === 'number' ? startMileage : (Number(startMileage) || 0),
        fuelLevelStart: fuelLevel,
        clientSignature: signature || undefined,
        signedAt: signature ? new Date().toISOString() : undefined,
        status: statusToSet,
        type: docType,
        notes
      },
      newClientPayload
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-slate-950/60 flex items-start justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {docType === 'reservation' ? (
                <CalendarCheck className="w-5 h-5 text-sky-400" />
              ) : (
                <FileText className="w-5 h-5 text-amber-400" />
              )}
              <span>{docType === 'reservation' ? 'Nouvelle Réservation' : 'Nouveau Contrat de Location'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {docType === 'reservation' 
                ? 'Enregistrer une réservation planifiée pour bloquer des dates'
                : 'Établir un contrat de location immédiat avec remise des clés'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector: Réservation vs Contrat */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950/70 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setDocType('contrat');
                setIsCustomPaid(false);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                docType === 'contrat'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>📋 Contrat Direct (Départ)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDocType('reservation');
                setIsCustomPaid(false);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                docType === 'reservation'
                  ? 'bg-sky-500 text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>📅 Réservation (Planifiée)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Client Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                <span>Client</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsInlineNewClient(false)}
                  disabled={clients.length === 0}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    !isInlineNewClient
                      ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Client Existant
                </button>
                <button
                  type="button"
                  onClick={() => setIsInlineNewClient(true)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    isInlineNewClient
                      ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + Nouveau Client
                </button>
              </div>
            </div>

            {isInlineNewClient ? (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Nom et Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mohammed Alami"
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={newClientPhone}
                      onChange={e => setNewClientPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      CIN / Passeport
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: AB123456"
                      value={newClientCin}
                      onChange={e => setNewClientCin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      N° Permis de Conduire
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 12/345678"
                      value={newClientLicense}
                      onChange={e => setNewClientLicense(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white uppercase"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <select
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} • {c.phone} (CIN: {c.cin})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Section 2: Vehicle Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Véhicule</span>
            </label>
            <select
              value={selectedVehicleId}
              onChange={e => setSelectedVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
            >
              {allFleetVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.matricule}) • {v.dailyRate} DH/j • Statut: {v.status === 'disponible' ? '🟢 Dispo' : v.status === 'en_location' ? '🟡 Loué' : '🔴 Maintenance'}
                </option>
              ))}
            </select>
          </div>

          {/* Section 3: Dates & Duration */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Date & Heure de Début
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="col-span-2 px-2.5 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="px-2 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Date & Heure de Fin
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="col-span-2 px-2.5 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="px-2 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
              <span className="text-slate-400">Durée calculée :</span>
              <span className="font-extrabold text-amber-400 font-mono text-sm">{durationDays} jours</span>
            </div>
          </div>

          {/* Section 4: Tarifs & Acompte */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Prix par jour (DH)
              </label>
              <input
                type="number"
                required
                value={dailyRate}
                onChange={e => setDailyRate(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {docType === 'reservation' ? 'Acompte versé (DH)' : 'Montant payé (DH)'}
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={e => handlePaidAmountChange(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Caution (DH)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Section 5: Financial Summary Preview */}
          <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-400">Total Location :</span>
              <p className="text-base font-black text-white font-mono">{formatNumber(totalAmount)} DH</p>
            </div>
            <div>
              <span className="text-slate-400">Encaissé / Acompte :</span>
              <p className="text-base font-black text-emerald-400 font-mono">{formatNumber(numPaidAmount)} DH</p>
            </div>
            <div>
              <span className="text-slate-400">Reste à payer :</span>
              <p className="text-base font-black text-rose-400 font-mono">{formatNumber(remainingAmount)} DH</p>
            </div>
          </div>

          {/* Section 6: Mileage & Fuel (for Direct Rental) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Kilométrage départ (km)
              </label>
              <input
                type="number"
                value={startMileage}
                onChange={e => setStartMileage(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Niveau de carburant départ
              </label>
              <select
                value={fuelLevel}
                onChange={e => setFuelLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
              >
                <option value="Plein">Plein (100%)</option>
                <option value="3/4">3/4</option>
                <option value="1/2">1/2</option>
                <option value="1/4">1/4</option>
              </select>
            </div>
          </div>

          {/* Section 7: Signature Pad */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-400">
              Signature du client (Optionnelle)
            </label>
            <SignaturePad onSave={dataUrl => setSignature(dataUrl)} onClear={() => setSignature(null)} />
          </div>

          {/* Section 8: Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Notes ou instructions particulières
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Siège bébé inclus, second conducteur, vol numéro..."
              className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-xs font-extrabold text-black shadow-lg transition-all active:scale-95 cursor-pointer ${
                docType === 'reservation'
                  ? 'bg-sky-400 hover:bg-sky-300'
                  : 'bg-amber-400 hover:bg-amber-300'
              }`}
            >
              {docType === 'reservation' ? '📅 Enregistrer la Réservation' : '📋 Créer le Contrat de Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
