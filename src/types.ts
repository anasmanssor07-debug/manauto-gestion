export type VehicleStatus = 'disponible' | 'en_location' | 'maintenance';
export type FuelType = 'Diesel' | 'Essence' | 'Hybride' | 'Électrique';
export type TransmissionType = 'Manuelle' | 'Automatique';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  matricule: string; // e.g. "12345-A-1"
  fuel: FuelType;
  transmission: TransmissionType;
  color: string;
  dailyRate: number; // in DH
  mileage: number; // in km
  status: VehicleStatus;
  imageUrl: string;
  currentContractId?: string;
  
  // Maintenance tracking
  insuranceExpiryDate: string; // YYYY-MM-DD
  technicalVisitExpiryDate: string; // YYYY-MM-DD
  vignetteExpiryDate: string; // YYYY-MM-DD
  lastOilChangeMileage: number;
  oilChangeIntervalKm: number; // usually 10,000 km
  
  // Computed / aggregated
  totalRevenueGenerated: number;
  totalRentalsCount: number;
  totalKmDrivenInRentals: number;
}

export interface Client {
  id: string;
  fullName: string;
  cin: string; // Moroccan National ID or Passport
  phone: string;
  email?: string;
  drivingLicenseNumber: string;
  drivingLicenseDate?: string;
  address?: string;
  nationality?: string;
  notes?: string;
  createdAt: string;
  
  // Aggregates
  totalContractsCount: number;
  totalPaid: number;
  totalDue: number; // Remaining unpaid amount
}

export type ContractStatus = 'en_cours' | 'reserve' | 'termine' | 'annule' | 'en_retard';

export interface Contract {
  id: string;
  contractNumber: string; // e.g. "CTR-2026-089" or "RES-2026-042"
  type?: 'contrat' | 'reservation'; // Contract or Reservation
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientCin: string;
  clientLicense: string;
  
  vehicleId: string;
  vehicleName: string;
  vehicleMatricule: string;
  
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  durationDays: number;
  
  dailyRate: number;
  totalAmount: number;
  paidAmount: number; // Acompte / Payé
  remainingAmount: number;
  paymentMethod?: string;
  depositAmount: number; // Caution
  depositType: 'especes' | 'cheque' | 'empreinte_cb' | 'virement';
  
  startMileage: number;
  endMileage?: number;
  totalKmDriven?: number;
  
  fuelLevelStart: string; // '1/4', '1/2', '3/4', 'Plein'
  fuelLevelEnd?: string;
  
  clientSignature?: string; // Data URL of canvas drawing
  signedAt?: string;
  
  status: ContractStatus;
  notes?: string;
  createdAt: string;
  returnedAt?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleMatricule: string;
  type: 'vidange' | 'assurance' | 'visite_technique' | 'vignette' | 'pneus' | 'freins' | 'autre';
  title: string;
  date: string;
  cost: number;
  mileageAtService?: number;
  nextDueDate?: string;
  nextDueMileage?: number;
  notes?: string;
}

export type AgencyAccountStatus = 'pending' | 'approved' | 'rejected';

export interface AgencyAccountSummary {
  username: string;
  name: string;
  phone: string;
  email: string;
  status: AgencyAccountStatus;
  createdAt: string;
  lastLoginAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  vehiclesCount?: number;
  clientsCount?: number;
  contractsCount?: number;
}

export interface AgencySettings {
  agencyName: string;
  logoUrl?: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  rc: string; // Registre de commerce
  ice: string; // Identifiant Commun de l'Entreprise
  patente: string;
  currency: string; // "DH"
  defaultDeposit: number;
  termsAndConditions: string;
  financePassword?: string;
}

export interface DailyStatement {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO String
  type: 'recette_contrat' | 'reglement_dette' | 'depense_entretien' | 'autre_recette' | 'autre_depense';
  category: 'entree' | 'sortie';
  title: string;
  amount: number; // DH
  referenceId?: string; // contractId, clientId, etc.
  clientName?: string;
  vehicleMatricule?: string;
  paymentMethod?: string;
  notes?: string;
}


