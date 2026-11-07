import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'ar';

export interface Translations {
  // Navigation
  dashboard: string;
  vehicles: string;
  contracts: string;
  clients: string;
  reservations: string;
  maintenance: string;
  dailyCash: string;
  newContract: string;
  addVehicle: string;
  newClient: string;
  settings: string;
  logout: string;
  search: string;
  all: string;
  disponible: string;
  en_location: string;
  en_maintenance: string;
  active: string;
  completed: string;
  late: string;
  unpaid: string;
  paid: string;
  
  // Header
  directSync: string;
  offlineMode: string;
  alerts: string;
  unpaidClients: string;
  onlineReservations: string;
  
  // Dashboard
  totalFleet: string;
  rentedVehicles: string;
  monthlyRevenue: string;
  occupancyRate: string;
  urgentAlerts: string;
  quickActions: string;
  recentContracts: string;
  
  // Reservations
  reservationsTitle: string;
  pendingReservations: string;
  convertToContract: string;
  approveReservation: string;
  rejectReservation: string;
  deleteReservation: string;
  clientReservationPortal: string;
  accessReservationSystem: string;
  bookThisCar: string;
  bookingFormTitle: string;
  agencyOwner: string;
  estimatedTotal: string;
  filterByAgency: string;
  allAgencies: string;
  
  // Vehicles
  fleetManagement: string;
  vehicleDetails: string;
  matricule: string;
  dailyRate: string;
  mileage: string;
  fuel: string;
  transmission: string;
  year: string;
  color: string;
  
  // Contracts
  contractNumber: string;
  clientInfo: string;
  vehicle: string;
  rentalPeriod: string;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  depositCaution: string;
  startKm: string;
  endKm: string;
  kmDriven: string;
  status: string;
  signContract: string;
  createContract: string;
  returnVehicle: string;
  printContract: string;
  
  // Clients
  clientDirectory: string;
  clientHistory: string;
  totalSpent: string;
  totalDebt: string;
  totalKmByClient: string;
  rentalsCount: string;
  totalDaysRented: string;
  settleDebt: string;
  drivingLicense: string;
  cinPassport: string;
  phone: string;
  email: string;
  address: string;
  editClient: string;
  deleteClient: string;
  
  // Maintenance
  maintenanceTracking: string;
  oilChange: string;
  insurance: string;
  technicalVisit: string;
  vignette: string;
  daysRemaining: string;
  kmRemaining: string;
  
  // Common
  cancel: string;
  confirm: string;
  save: string;
  back: string;
  filter: string;
  dh: string;
  days: string;
  km: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    dashboard: 'Tableau de bord',
    vehicles: 'Véhicules',
    contracts: 'Réservations & Contrats',
    clients: 'Clients',
    reservations: 'Réservations',
    maintenance: 'Entretiens & Alertes',
    dailyCash: 'Caisse Journalière',
    newContract: '+ Nouveau Contrat / Réservation',
    addVehicle: '+ Ajouter Véhicule',
    newClient: '+ Nouveau Client',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    search: 'Rechercher...',
    all: 'Tous',
    disponible: 'Disponible',
    en_location: 'En location',
    en_maintenance: 'En maintenance',
    active: 'En cours',
    completed: 'Terminé',
    late: 'En retard',
    unpaid: 'Impayé',
    paid: 'Payé',
    
    directSync: 'Direct Sync',
    offlineMode: 'Hors-Ligne (Local)',
    alerts: 'Alertes',
    unpaidClients: 'Clients Impayés',
    onlineReservations: 'Réservations en Ligne',
    
    totalFleet: 'Total Parc',
    rentedVehicles: 'En Location',
    monthlyRevenue: "Chiffre d'Affaires",
    occupancyRate: "Taux d'Occupation",
    urgentAlerts: 'Alertes Urgentes',
    quickActions: 'Actions Rapides',
    recentContracts: 'Derniers Contrats Actifs',
    
    // Reservations
    reservationsTitle: 'Demandes de Réservations en Ligne',
    pendingReservations: 'Réservations en attente',
    convertToContract: 'Transformer en Contrat',
    approveReservation: 'Confirmer la Réservation',
    rejectReservation: 'Refuser la Réservation',
    deleteReservation: 'Supprimer la Réservation',
    clientReservationPortal: 'Système de Réservation Client',
    accessReservationSystem: 'Accéder au système de réservations',
    bookThisCar: 'Réserver ce véhicule',
    bookingFormTitle: 'Formulaire de Réservation Véhicule',
    agencyOwner: 'Agence Propriétaire',
    estimatedTotal: 'Total Estimé',
    filterByAgency: 'Filtrer par Agence',
    allAgencies: 'Toutes les Agences',
    
    fleetManagement: 'Parc Automobile',
    vehicleDetails: 'Fiche Véhicule',
    matricule: 'Matricule',
    dailyRate: 'Prix par jour',
    mileage: 'Kilométrage',
    fuel: 'Carburant',
    transmission: 'Boîte de vitesse',
    year: 'Année',
    color: 'Couleur',
    
    contractNumber: 'N° Contrat',
    clientInfo: 'Informations Client',
    vehicle: 'Véhicule',
    rentalPeriod: 'Période de Location',
    totalAmount: 'Montant Total',
    paidAmount: 'Montant Encaissé',
    remainingAmount: 'Reste à Payer',
    depositCaution: 'Caution / Dépôt',
    startKm: 'Km Départ',
    endKm: 'Km Retour',
    kmDriven: 'Km Parcourus',
    status: 'Statut',
    signContract: 'Signer le contrat',
    createContract: 'Créer le contrat',
    returnVehicle: 'Retour de Véhicule',
    printContract: 'Imprimer le Contrat',
    
    clientDirectory: 'Répertoire des Clients',
    clientHistory: 'Historique des locations et Kilomètres par client',
    totalSpent: "Total Chiffre d'Affaires",
    totalDebt: 'Reste / Impayé',
    totalKmByClient: 'Total Km Parcourus',
    rentalsCount: 'Nombre de Locations',
    totalDaysRented: 'Jours Cumulés',
    settleDebt: 'Encaisser un paiement',
    drivingLicense: 'Permis de Conduire',
    cinPassport: 'CIN / Passeport',
    phone: 'Téléphone',
    email: 'Email',
    address: 'Adresse',
    editClient: 'Modifier la fiche',
    deleteClient: 'Supprimer le client',
    
    maintenanceTracking: 'Suivi des Entretiens & Visites',
    oilChange: 'Vidange',
    insurance: 'Assurance',
    technicalVisit: 'Visite Technique',
    vignette: 'Taxe Vignette',
    daysRemaining: 'Jours restants',
    kmRemaining: 'Km restants',
    
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    back: '← Retour',
    filter: 'Filtrer',
    dh: 'DH',
    days: 'jours',
    km: 'km'
  },
  ar: {
    dashboard: 'لوحة القيادة',
    vehicles: 'السيارات',
    contracts: 'الحجوزات والعقود',
    clients: 'الزبائن',
    reservations: 'حجوزات الزبائن',
    maintenance: 'الصيانة والتنبيهات',
    dailyCash: 'الصندوق اليومي',
    newContract: '+ عقد / حجز جديد',
    addVehicle: '+ إضافة سيارة',
    newClient: '+ زبون جديد',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    search: 'بحث...',
    all: 'الكل',
    disponible: 'متاحة',
    en_location: 'مؤجرة',
    en_maintenance: 'في الصيانة',
    active: 'جارية',
    completed: 'مكتمل',
    late: 'متأخر',
    unpaid: 'غير مدفوع',
    paid: 'مدفوع',
    
    directSync: 'مزامنة مباشرة',
    offlineMode: 'بدون إنترنت (محلي)',
    alerts: 'تنبيهات',
    unpaidClients: 'زبائن بذمتهم ديون',
    onlineReservations: 'حجوزات عبر الإنترنت',
    
    totalFleet: 'إجمالي الأسطول',
    rentedVehicles: 'السيارات المؤجرة',
    monthlyRevenue: 'رقم المعاملات',
    occupancyRate: 'نسبة الاستغلال',
    urgentAlerts: 'تنبيهات عاجلة',
    quickActions: 'إجراءات سريعة',
    recentContracts: 'أحدث العقود النشطة',
    
    // Reservations
    reservationsTitle: 'طلبات الحجز عبر الإنترنت',
    pendingReservations: 'حجوزات في الانتظار',
    convertToContract: 'تحويل إلى عقد رسمي',
    approveReservation: 'تأكيد الحجز',
    rejectReservation: 'رفض الحجز',
    deleteReservation: 'حذف الحجز',
    clientReservationPortal: 'بوابة حجز الزبائن',
    accessReservationSystem: 'الدخول إلى نظام الحجوزات',
    bookThisCar: 'حجز هذه السيارة',
    bookingFormTitle: 'استمارة حجز السيارة',
    agencyOwner: 'الوكالة المالكة',
    estimatedTotal: 'المبلغ التقديري',
    filterByAgency: 'تصفية حسب الوكالة',
    allAgencies: 'جميع الوكالات',
    
    fleetManagement: 'أسطول السيارات',
    vehicleDetails: 'تفاصيل السيارة',
    matricule: 'رقم الترقيم (الماتريكول)',
    dailyRate: 'السعر باليوم',
    mileage: 'العداد (كيلومتر)',
    fuel: 'الوقود',
    transmission: 'علبة السرعات',
    year: 'السنة',
    color: 'اللون',
    
    contractNumber: 'رقم العقد',
    clientInfo: 'بيانات الزبون',
    vehicle: 'السيارة',
    rentalPeriod: 'فترة الكراء',
    totalAmount: 'المبلغ الإجمالي',
    paidAmount: 'المبلغ المقبوض',
    remainingAmount: 'المبلغ المتبقي',
    depositCaution: 'الضمانة (الكاسيون)',
    startKm: 'عداد الانطلاق',
    endKm: 'عداد الإرجاع',
    kmDriven: 'المسافة المقطوعة',
    status: 'الحالة',
    signContract: 'توقيع العقد',
    createContract: 'إنشاء العقد',
    returnVehicle: 'إرجاع السيارة',
    printContract: 'طباعة العقد',
    
    clientDirectory: 'دليل الزبائن',
    clientHistory: 'سجل الكراء والكيلومترات للزبون',
    totalSpent: 'إجمالي المعاملات',
    totalDebt: 'الديون المتبقية',
    totalKmByClient: 'مجموع المسافة المقطوعة',
    rentalsCount: 'عدد الإيجارات',
    totalDaysRented: 'مجموع الأيام',
    settleDebt: 'قبض دفعة دين',
    drivingLicense: 'رخصة السياقة',
    cinPassport: 'بطاقة التعريف / الجواز',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    editClient: 'تعديل البيانات',
    deleteClient: 'حذف الزبون',
    
    maintenanceTracking: 'متابعة الصيانة والفحص',
    oilChange: 'تغيير الزيت (الفيدونج)',
    insurance: 'التأمين',
    technicalVisit: 'الفحص التقني',
    vignette: 'الضريبة السنوية',
    daysRemaining: 'أيام متبقية',
    kmRemaining: 'كم متبقي',
    
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    back: '← رجوع',
    filter: 'تصفية',
    dh: 'درهم',
    days: 'أيام',
    km: 'كلم'
  }
};

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isArabic: boolean;
}

const I18nContext = createContext<I18nContextProps>({
  language: 'fr',
  setLanguage: () => {},
  t: translations.fr,
  isArabic: false
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('atlas_language') as Language;
    return saved === 'ar' || saved === 'fr' ? saved : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('atlas_language', lang);
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'fr';
    }
  };

  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'fr';
    }
  }, [language]);

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        isArabic: language === 'ar'
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
