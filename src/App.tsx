import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  initialVehicles,
  initialClients,
  initialContracts,
  initialMaintenanceRecords,
  initialAgencySettings
} from './data/mockData';
import { Vehicle, Client, Contract, MaintenanceRecord, AgencySettings, ContractStatus, DailyStatement } from './types';
import { fetchAgencyDataFromServer, syncAgencyDataToServer } from './utils/apiSync';
import { Navbar, TabType } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { DashboardOverview } from './components/DashboardOverview';
import { CarGrid } from './components/CarGrid';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { NewContractModal } from './components/NewContractModal';
import { ContractList } from './components/ContractList';
import { ClientList } from './components/ClientList';
import { MaintenanceView } from './components/MaintenanceView';
import { AnalyticsView } from './components/AnalyticsView';
import { ContractPrintModal } from './components/ContractPrintModal';
import { NewVehicleModal } from './components/NewVehicleModal';
import { NewClientModal } from './components/NewClientModal';
import { AgencySettingsModal } from './components/AgencySettingsModal';
import { getDaysUntil, getKmUntilOilChange } from './utils/formatters';

export default function App() {
  // Current Logged-in User / Agency - Permanent session across restarts and reloads
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('atlas_current_user') || '';
  });

  // Saved agencies registry (permanent local store)
  const [savedAgencies, setSavedAgencies] = useState<string[]>(() => {
    const saved = localStorage.getItem('atlas_all_agencies');
    const list: string[] = saved ? JSON.parse(saved) : [];
    const current = localStorage.getItem('atlas_current_user');
    if (current && !list.includes(current)) {
      list.unshift(current);
    }
    return list;
  });

  // Agency data states
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const user = localStorage.getItem('atlas_current_user');
    if (user) {
      const savedUserVehicles = localStorage.getItem(`atlas_user_${user}_vehicles`);
      if (savedUserVehicles) return JSON.parse(savedUserVehicles);
      return [];
    }
    const legacySaved = localStorage.getItem('atlas_vehicles');
    return legacySaved ? JSON.parse(legacySaved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const user = localStorage.getItem('atlas_current_user');
    if (user) {
      const savedUserClients = localStorage.getItem(`atlas_user_${user}_clients`);
      if (savedUserClients) return JSON.parse(savedUserClients);
      return [];
    }
    const legacySaved = localStorage.getItem('atlas_clients');
    return legacySaved ? JSON.parse(legacySaved) : [];
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    const user = localStorage.getItem('atlas_current_user');
    if (user) {
      const savedUserContracts = localStorage.getItem(`atlas_user_${user}_contracts`);
      if (savedUserContracts) return JSON.parse(savedUserContracts);
      return [];
    }
    const legacySaved = localStorage.getItem('atlas_contracts');
    return legacySaved ? JSON.parse(legacySaved) : [];
  });

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => {
    const user = localStorage.getItem('atlas_current_user');
    if (user) {
      const savedUserMaint = localStorage.getItem(`atlas_user_${user}_maintenance`);
      if (savedUserMaint) return JSON.parse(savedUserMaint);
      return [];
    }
    const legacySaved = localStorage.getItem('atlas_maintenance');
    return legacySaved ? JSON.parse(legacySaved) : [];
  });

  const [dailyStatements, setDailyStatements] = useState<DailyStatement[]>(() => {
    const user = localStorage.getItem('atlas_current_user');
    if (user) {
      const savedUserStatements = localStorage.getItem(`atlas_user_${user}_statements`);
      if (savedUserStatements) return JSON.parse(savedUserStatements);
    }
    return [];
  });

  const [agencySettings, setAgencySettings] = useState<AgencySettings>(() => {
    const user = localStorage.getItem('atlas_current_user');
    const userPassword = user ? (localStorage.getItem(`atlas_user_pwd_${user}`) || '121107') : '121107';
    if (user) {
      const savedUserSettings = localStorage.getItem(`atlas_user_${user}_settings`);
      if (savedUserSettings) return JSON.parse(savedUserSettings);
      return {
        ...initialAgencySettings,
        agencyName: user,
        financePassword: userPassword
      };
    }
    const legacySaved = localStorage.getItem('atlas_settings');
    return legacySaved ? JSON.parse(legacySaved) : { ...initialAgencySettings, financePassword: userPassword };
  });

  // Navigation State with persistence
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem('atlas_active_tab') as TabType;
    if (savedTab === ('reservations' as any)) return 'dashboard';
    return savedTab || 'dashboard';
  });

  // Save activeTab whenever it changes
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('atlas_active_tab', activeTab);
    }
  }, [activeTab]);

  // Update activity timestamp to prevent reload/logout before 30 mins
  useEffect(() => {
    const updateActivity = () => {
      if (currentUser) {
        localStorage.setItem('atlas_last_active_time', Date.now().toString());
      }
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    window.addEventListener('focus', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('focus', updateActivity);
    };
  }, [currentUser]);

  // Modal Dialogs & Details states
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [contractPreselectedVehicle, setContractPreselectedVehicle] = useState<Vehicle | null>(null);
  const [contractToPrint, setContractToPrint] = useState<Contract | null>(null);
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false);
  const [isContractSubModalOpen, setIsContractSubModalOpen] = useState(false);
  const [isMaintenanceSubModalOpen, setIsMaintenanceSubModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Overall check: whether user is viewing details or modal of anything
  const isAnyDetailOrModalOpen = Boolean(
    selectedVehicleForDetail ||
    isNewContractOpen ||
    contractToPrint ||
    isNewVehicleOpen ||
    isNewClientOpen ||
    isSettingsOpen ||
    isClientDetailOpen ||
    isContractSubModalOpen ||
    isMaintenanceSubModalOpen
  );

  const lastServerModifiedTime = useRef<number>(0);
  const isInitialMount = useRef<boolean>(true);
  const isPullingRef = useRef<boolean>(false);
  const pushSyncTimeoutRef = useRef<any>(null);

  // Handle Login with server-provided agency data
  const handleLogin = (username: string, agencyData?: any) => {
    const cleanUser = (username || '').trim();
    if (!cleanUser) return;

    setCurrentUser(cleanUser);
    localStorage.setItem('atlas_current_user', cleanUser);

    // Register agency in list
    setSavedAgencies(prev => {
      const updated = Array.from(new Set([cleanUser, ...prev]));
      localStorage.setItem('atlas_all_agencies', JSON.stringify(updated));
      return updated;
    });

    if (agencyData) {
      if (agencyData.vehicles) setVehicles(agencyData.vehicles);
      if (agencyData.clients) setClients(agencyData.clients);
      if (agencyData.contracts) setContracts(agencyData.contracts);
      if (agencyData.maintenanceRecords) setMaintenanceRecords(agencyData.maintenanceRecords);
      if (agencyData.dailyStatements) setDailyStatements(agencyData.dailyStatements);
      if (agencyData.agencySettings) setAgencySettings(agencyData.agencySettings);
      if (agencyData.lastModifiedAt) lastServerModifiedTime.current = agencyData.lastModifiedAt;
    } else {
      // Load from server in background
      fetchAgencyDataFromServer(cleanUser).then(serverResult => {
        if (serverResult && serverResult.data) {
          const sd = serverResult.data;
          if (sd.vehicles) setVehicles(sd.vehicles);
          if (sd.clients) setClients(sd.clients);
          if (sd.contracts) setContracts(sd.contracts);
          if (sd.maintenanceRecords) setMaintenanceRecords(sd.maintenanceRecords);
          if (sd.dailyStatements) setDailyStatements(sd.dailyStatements);
          if (sd.agencySettings) setAgencySettings(sd.agencySettings);
          if (serverResult.lastModifiedAt) lastServerModifiedTime.current = serverResult.lastModifiedAt;
        }
      }).catch(() => {});
    }

    setActiveTab('dashboard');
  };

  // Live Auto-fetch latest data from server (every 4 seconds) so mobile and laptops are ALWAYS 100% identical in statistics
  useEffect(() => {
    const cleanUser = (currentUser || '').trim();
    if (!cleanUser) return;

    let isSubscribed = true;

    const pullLatestFromServer = async () => {
      if (isPullingRef.current) return;
      isPullingRef.current = true;

      try {
        const serverResult = await fetchAgencyDataFromServer(cleanUser);
        if (!isSubscribed) return;

        if (serverResult && serverResult.data) {
          const serverModified = serverResult.lastModifiedAt || 0;
          if (serverModified > lastServerModifiedTime.current) {
            lastServerModifiedTime.current = serverModified;
            const sd = serverResult.data;

            if (sd.vehicles) {
              setVehicles(sd.vehicles);
              try {
                localStorage.setItem(`atlas_user_${cleanUser}_vehicles`, JSON.stringify(sd.vehicles));
              } catch (_) {}
            }
            if (sd.clients) {
              setClients(sd.clients);
              try {
                localStorage.setItem(`atlas_user_${cleanUser}_clients`, JSON.stringify(sd.clients));
              } catch (_) {}
            }
            if (sd.contracts) {
              setContracts(sd.contracts);
              try {
                localStorage.setItem(`atlas_user_${cleanUser}_contracts`, JSON.stringify(sd.contracts));
              } catch (_) {}
            }
            if (sd.maintenanceRecords) {
              setMaintenanceRecords(sd.maintenanceRecords);
              try {
                localStorage.setItem(`atlas_user_${cleanUser}_maintenance`, JSON.stringify(sd.maintenanceRecords));
              } catch (_) {}
            }
            if (sd.dailyStatements) {
              setDailyStatements(sd.dailyStatements);
              try {
                localStorage.setItem(`atlas_user_${cleanUser}_statements`, JSON.stringify(sd.dailyStatements));
              } catch (_) {}
            }
            if (sd.agencySettings) {
              setAgencySettings(sd.agencySettings);
              try {
                localStorage.setItem(`atlas_user_${cleanUser}_settings`, JSON.stringify(sd.agencySettings));
              } catch (_) {}
            }
          }
        }
      } catch (err) {
        // silent fallback
      } finally {
        isPullingRef.current = false;
      }
    };

    pullLatestFromServer();
    const interval = setInterval(pullLatestFromServer, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  // Manual Instant Sync Trigger
  const handleManualSync = async () => {
    const cleanUser = (currentUser || '').trim();
    if (!cleanUser) return;
    setIsSyncing(true);
    try {
      const serverResult = await fetchAgencyDataFromServer(cleanUser);
      if (serverResult && serverResult.data) {
        const sd = serverResult.data;
        if (sd.vehicles) setVehicles(sd.vehicles);
        if (sd.clients) setClients(sd.clients);
        if (sd.contracts) setContracts(sd.contracts);
        if (sd.maintenanceRecords) setMaintenanceRecords(sd.maintenanceRecords);
        if (sd.dailyStatements) setDailyStatements(sd.dailyStatements);
        if (sd.agencySettings) setAgencySettings(sd.agencySettings);
        if (serverResult.lastModifiedAt) lastServerModifiedTime.current = serverResult.lastModifiedAt;
      }
    } catch (e) {
      // quiet catch
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    if (pushSyncTimeoutRef.current) clearTimeout(pushSyncTimeoutRef.current);
    setCurrentUser('');
    localStorage.removeItem('atlas_current_user');
    sessionStorage.removeItem('atlas_finances_unlocked');
  };

  // Push local updates to server and localStorage (Debounced)
  useEffect(() => {
    const cleanUser = (currentUser || '').trim();
    if (!cleanUser) return;

    // Skip first empty trigger
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      localStorage.setItem(`atlas_user_${cleanUser}_vehicles`, JSON.stringify(vehicles));
      localStorage.setItem(`atlas_user_${cleanUser}_clients`, JSON.stringify(clients));
      localStorage.setItem(`atlas_user_${cleanUser}_contracts`, JSON.stringify(contracts));
      localStorage.setItem(`atlas_user_${cleanUser}_maintenance`, JSON.stringify(maintenanceRecords));
      localStorage.setItem(`atlas_user_${currentUser}_statements`, JSON.stringify(dailyStatements));
      localStorage.setItem(`atlas_user_${cleanUser}_settings`, JSON.stringify(agencySettings));
    } catch (_) {}

    // Debounce push to central server so laptop and mobile stay 100% identical without spamming
    if (pushSyncTimeoutRef.current) {
      clearTimeout(pushSyncTimeoutRef.current);
    }

    pushSyncTimeoutRef.current = setTimeout(() => {
      syncAgencyDataToServer(cleanUser, {
        vehicles,
        clients,
        contracts,
        maintenanceRecords,
        dailyStatements,
        agencySettings
      }).then(res => {
        if (res.success && res.lastModifiedAt) {
          lastServerModifiedTime.current = res.lastModifiedAt;
        }
      }).catch(() => {});
    }, 500);

    return () => {
      if (pushSyncTimeoutRef.current) {
        clearTimeout(pushSyncTimeoutRef.current);
      }
    };
  }, [vehicles, clients, contracts, maintenanceRecords, dailyStatements, agencySettings, currentUser]);

  // Daily statement handlers
  const handleAddDailyStatement = (statement: Omit<DailyStatement, 'id' | 'timestamp'>) => {
    const newStmt: DailyStatement = {
      ...statement,
      id: `stmt-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString()
    };
    setDailyStatements(prev => [newStmt, ...prev]);
  };

  const handleDeleteDailyStatement = (statementId: string) => {
    setDailyStatements(prev => prev.filter(s => s.id !== statementId));
  };

  // Urgent alerts calculation
  const alertCount = vehicles.filter(v => {
    const daysIns = getDaysUntil(v.insuranceExpiryDate);
    const kmOil = getKmUntilOilChange(v.mileage, v.lastOilChangeMileage, v.oilChangeIntervalKm);
    return daysIns <= 15 || kmOil <= 1000;
  }).length;

  const unpaidClientsCount = clients.filter(c => (c.totalDue || 0) > 0).length;

  // Handlers:
  const handleQuickRent = (vehicle: Vehicle) => {
    setContractPreselectedVehicle(vehicle);
    setIsNewContractOpen(true);
  };

  const handleCreateContract = (
    contractData: Omit<Contract, 'id' | 'contractNumber' | 'createdAt'>,
    newClientData?: Omit<Client, 'id' | 'createdAt' | 'totalContractsCount' | 'totalPaid' | 'totalDue'>
  ) => {
    const isRes = contractData.status === 'reserve' || contractData.type === 'reservation';
    const prefix = isRes ? 'RES-2026' : 'CTR-2026';
    const newId = `${isRes ? 'res' : 'ctr'}-${Date.now().toString().slice(-4)}`;
    const ctrNum = `${prefix}-${String(contracts.length + 1).padStart(3, '0')}`;

    let effectiveClientId = contractData.clientId;
    let effectiveClientName = contractData.clientName;

    // 1. If a new client was entered inline, create the client
    if (newClientData) {
      effectiveClientId = `cli-${Date.now().toString().slice(-4)}`;
      effectiveClientName = newClientData.fullName;

      const newClient: Client = {
        ...newClientData,
        id: effectiveClientId,
        totalContractsCount: 1,
        totalPaid: contractData.paidAmount,
        totalDue: contractData.remainingAmount,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setClients(prev => [newClient, ...prev]);
    } else {
      // Update existing client stats
      setClients(prev => prev.map(c => {
        if (c.id === contractData.clientId) {
          return {
            ...c,
            totalContractsCount: (c.totalContractsCount || 0) + 1,
            totalPaid: (c.totalPaid || 0) + contractData.paidAmount,
            totalDue: (c.totalDue || 0) + contractData.remainingAmount
          };
        }
        return c;
      }));
    }

    const newContract: Contract = {
      ...contractData,
      id: newId,
      clientId: effectiveClientId,
      clientName: effectiveClientName,
      contractNumber: ctrNum,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // 2. Update contracts list
    setContracts(prev => [newContract, ...prev]);

    // 3. If direct contract (en_cours), mark vehicle as "en_location". If reserve, keep vehicle available until departure
    if (!isRes && contractData.status === 'en_cours') {
      setVehicles(prev => prev.map(v => {
        if (v.id === contractData.vehicleId) {
          return {
            ...v,
            status: 'en_location',
            currentContractId: newId,
            totalRentalsCount: (v.totalRentalsCount || 0) + 1,
            totalRevenueGenerated: (v.totalRevenueGenerated || 0) + contractData.paidAmount
          };
        }
        return v;
      }));
    }

    // 4. Record daily income statement if amount paid / advance
    if (contractData.paidAmount > 0) {
      handleAddDailyStatement({
        date: new Date().toISOString().split('T')[0],
        type: 'recette_contrat',
        category: 'entree',
        title: isRes 
          ? `Acompte Réservation ${ctrNum} - ${contractData.vehicleName}`
          : `Paiement Contrat ${ctrNum} - ${contractData.vehicleName}`,
        amount: contractData.paidAmount,
        referenceId: newId,
        clientName: effectiveClientName,
        vehicleMatricule: contractData.vehicleMatricule,
        paymentMethod: contractData.paymentMethod || 'Espèces',
        notes: `Du ${contractData.startDate} au ${contractData.endDate}`
      });
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f59e0b', '#10b981', '#ffffff']
      });
    } catch (e) {
      // ignore
    }

    setIsNewContractOpen(false);
    setContractPreselectedVehicle(null);
  };

  // Modify Contract Status directly (reserve, en_cours, termine, annule)
  const handleUpdateContractStatus = (contractId: string, newStatus: ContractStatus, notes?: string) => {
    const target = contracts.find(c => c.id === contractId);
    if (!target) return;

    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          status: newStatus,
          notes: notes !== undefined ? notes : c.notes
        };
      }
      return c;
    }));

    if (newStatus === 'termine' || newStatus === 'annule' || newStatus === 'reserve') {
      setVehicles(prev => prev.map(v => {
        if (v.id === target.vehicleId) {
          return {
            ...v,
            status: 'disponible',
            currentContractId: undefined
          };
        }
        return v;
      }));
    } else if (newStatus === 'en_cours') {
      setVehicles(prev => prev.map(v => {
        if (v.id === target.vehicleId) {
          return {
            ...v,
            status: 'en_location',
            currentContractId: target.id
          };
        }
        return v;
      }));
    }
  };

  // Vehicle Return handler
  const handleReturnVehicle = (contractId: string, endMileage: number, fuelLevelReturn: string, returnNotes?: string) => {
    const targetContract = contracts.find(c => c.id === contractId);
    if (!targetContract) return;

    const kmDriven = Math.max(0, endMileage - (targetContract.startMileage || 0));

    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          status: 'termine',
          endMileage,
          fuelLevelReturn,
          notes: returnNotes ? `${c.notes ? c.notes + ' | ' : ''}${returnNotes}` : c.notes
        };
      }
      return c;
    }));

    setVehicles(prev => prev.map(v => {
      if (v.id === targetContract.vehicleId) {
        return {
          ...v,
          status: 'disponible',
          currentContractId: undefined,
          mileage: Math.max(v.mileage, endMileage),
          totalKmDrivenInRentals: (v.totalKmDrivenInRentals || 0) + kmDriven
        };
      }
      return v;
    }));
  };

  // Vehicle CRUD
  const handleAddVehicle = (newVehData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...newVehData,
      id: `veh-${Date.now().toString().slice(-4)}`,
      totalRentalsCount: 0,
      totalRevenueGenerated: 0,
      totalKmDrivenInRentals: 0
    };
    setVehicles(prev => [newVehicle, ...prev]);
    setIsNewVehicleOpen(false);
  };

  const handleUpdateVehicle = (updatedVeh: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVeh.id ? updatedVeh : v));
    if (selectedVehicleForDetail?.id === updatedVeh.id) {
      setSelectedVehicleForDetail(updatedVeh);
    }
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    if (selectedVehicleForDetail?.id === vehicleId) {
      setSelectedVehicleForDetail(null);
    }
  };

  const handleClearAllVehicles = () => {
    setVehicles([]);
    setSelectedVehicleForDetail(null);
  };

  const handleResetSampleFleet = () => {
    setVehicles(initialVehicles);
  };

  // Client CRUD
  const handleAddClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'totalContractsCount' | 'totalPaid' | 'totalDue'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now().toString().slice(-4)}`,
      totalContractsCount: 0,
      totalPaid: 0,
      totalDue: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [newClient, ...prev]);
    setIsNewClientOpen(false);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  const handleResetAllClients = () => {
    setClients(initialClients);
  };

  const handleDeleteContract = (contractId: string) => {
    const target = contracts.find(c => c.id === contractId);
    if (target && target.status === 'en_cours') {
      setVehicles(prev => prev.map(v => {
        if (v.id === target.vehicleId) {
          return { ...v, status: 'disponible', currentContractId: undefined };
        }
        return v;
      }));
    }
    setContracts(prev => prev.filter(c => c.id !== contractId));
  };

  // Settle Debt
  const handleSettleClientDebt = (clientId: string, amount: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const newDue = Math.max(0, (c.totalDue || 0) - amount);
        const newPaid = (c.totalPaid || 0) + amount;
        return {
          ...c,
          totalDue: newDue,
          totalPaid: newPaid
        };
      }
      return c;
    }));

    handleAddDailyStatement({
      date: new Date().toISOString().split('T')[0],
      type: 'reglement_dette',
      category: 'entree',
      title: `Règlement de dette - ${client.fullName}`,
      amount: amount,
      referenceId: clientId,
      clientName: client.fullName,
      paymentMethod: 'Espèces',
      notes: `Règlement d'impayé sur solde client`
    });
  };

  // Maintenance record
  const handleAddMaintenanceRecord = (recordData: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: `mnt-${Date.now().toString().slice(-4)}`
    };

    setMaintenanceRecords(prev => [newRecord, ...prev]);

    if (recordData.cost && recordData.cost > 0) {
      handleAddDailyStatement({
        date: recordData.date,
        type: 'depense_entretien',
        category: 'sortie',
        title: recordData.title || `Entretien (${recordData.type}) - ${recordData.vehicleName}`,
        amount: recordData.cost,
        referenceId: newRecord.id,
        vehicleMatricule: recordData.vehicleMatricule,
        paymentMethod: 'Espèces',
        notes: recordData.notes
      });
    }
  };

  // Oil Change quick log
  const handleQuickLogOilChange = (vehicleId: string, currentKm: number, cost: number, intervalKm: number) => {
    const targetVehicle = vehicles.find(v => v.id === vehicleId);

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          mileage: Math.max(v.mileage, currentKm),
          lastOilChangeMileage: currentKm,
          oilChangeIntervalKm: intervalKm
        };
      }
      return v;
    }));

    if (targetVehicle) {
      handleAddMaintenanceRecord({
        vehicleId: targetVehicle.id,
        vehicleName: `${targetVehicle.brand} ${targetVehicle.model}`,
        vehicleMatricule: targetVehicle.matricule,
        type: 'vidange',
        title: `Vidange moteur effectuée à ${currentKm} km (Prochaine dans ${intervalKm} km)`,
        cost: cost || 450,
        date: new Date().toISOString().split('T')[0],
        mileageAtService: currentKm,
        nextDueMileage: currentKm + intervalKm,
        notes: 'Huile 5W30 + filtre à huile'
      });
    }
  };

  // Insurance renewal handler
  const handleQuickRenewInsurance = (vehicleId: string, newExpiryDate: string, cost: number, company?: string) => {
    const targetVehicle = vehicles.find(v => v.id === vehicleId);

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          insuranceExpiryDate: newExpiryDate,
          insuranceCompany: company || v.insuranceCompany || 'Sanlam'
        };
      }
      return v;
    }));

    if (targetVehicle) {
      handleAddMaintenanceRecord({
        vehicleId: targetVehicle.id,
        vehicleName: `${targetVehicle.brand} ${targetVehicle.model}`,
        vehicleMatricule: targetVehicle.matricule,
        type: 'assurance',
        title: `Renouvellement assurance ${company || 'Sanlam'} jusqu'au ${newExpiryDate}`,
        cost: cost || 3800,
        date: new Date().toISOString().split('T')[0],
        mileageAtService: targetVehicle.mileage,
        nextDueDate: newExpiryDate,
        notes: `Police renouvelée jusqu'au ${newExpiryDate} (${company || 'Sanlam'})`
      });
    }
  };

  // Technical Visit renewal handler
  const handleQuickRenewTechVisit = (vehicleId: string, newExpiryDate: string, cost: number) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          technicalVisitExpiryDate: newExpiryDate
        };
      }
      return v;
    }));
  };

  // Reset Statistics of the System
  const handleResetStatistics = () => {
    // 1. Reset financial counters on all vehicles
    setVehicles(prev => prev.map(v => ({
      ...v,
      totalRevenueGenerated: 0,
      totalRentalsCount: 0,
      totalKmDrivenInRentals: 0
    })));

    // 2. Reset client spending & debt
    setClients(prev => prev.map(c => ({
      ...c,
      totalContractsCount: 0,
      totalPaid: 0,
      totalDue: 0
    })));

    // 3. Reset daily statements
    setDailyStatements([]);
  };

  // Complete system wipe for user
  const handleResetAllData = () => {
    setContracts([]);
    setMaintenanceRecords([]);
    setDailyStatements([]);
    setVehicles(initialVehicles);
    setClients(initialClients);
  };

  // Update Finance Password
  const handleUpdateFinancePassword = (newPassword: string) => {
    setAgencySettings(prev => ({
      ...prev,
      financePassword: newPassword
    }));
  };

  // If user is not logged in, display the Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLogin}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-black flex flex-col overflow-x-hidden">
      {/* Ambient Frosted Background Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden ambient-glow z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] bg-sky-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar - Hidden when viewing any details, forms or modals */}
      {!isAnyDetailOrModalOpen && (
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          agencyName={agencySettings.agencyName}
          agencyLogoUrl={agencySettings.logoUrl}
          userName={currentUser}
          onOpenNewContract={() => {
            setContractPreselectedVehicle(null);
            setIsNewContractOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
          onLogout={handleLogout}
          alertCount={alertCount}
          unpaidCount={unpaidClientsCount}
          isSyncing={isSyncing}
          onManualSync={handleManualSync}
        />
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-8"
            >
              {/* Top Overview 4 metric cards with Bonjour, UserName */}
              <DashboardOverview
                vehicles={vehicles}
                contracts={contracts}
                clients={clients}
                userName={currentUser}
                onSelectVehicle={v => setSelectedVehicleForDetail(v)}
                onRentVehicle={handleQuickRent}
                onNavigateToTab={setActiveTab}
                onAddNewVehicle={() => setIsNewVehicleOpen(true)}
                onOpenNewContract={() => {
                  setContractPreselectedVehicle(null);
                  setIsNewContractOpen(true);
                }}
                alertCount={alertCount}
              />

              {/* Fleet Grid */}
              <CarGrid
                vehicles={vehicles}
                onSelectVehicle={v => setSelectedVehicleForDetail(v)}
                onRentVehicle={handleQuickRent}
                onAddNewVehicle={() => setIsNewVehicleOpen(true)}
                onDeleteVehicle={handleDeleteVehicle}
                onClearAllVehicles={handleClearAllVehicles}
                onResetSampleFleet={handleResetSampleFleet}
              />
            </motion.div>
          )}

          {activeTab === 'fleet' && (
            <motion.div
              key="fleet"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <CarGrid
                vehicles={vehicles}
                onSelectVehicle={v => setSelectedVehicleForDetail(v)}
                onRentVehicle={handleQuickRent}
                onAddNewVehicle={() => setIsNewVehicleOpen(true)}
                onDeleteVehicle={handleDeleteVehicle}
                onClearAllVehicles={handleClearAllVehicles}
                onResetSampleFleet={handleResetSampleFleet}
              />
            </motion.div>
          )}

          {activeTab === 'contracts' && (
            <motion.div
              key="contracts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ContractList
                contracts={contracts}
                vehicles={vehicles}
                onOpenNewContract={() => {
                  setContractPreselectedVehicle(null);
                  setIsNewContractOpen(true);
                }}
                onViewContractPrint={c => setContractToPrint(c)}
                onReturnVehicle={handleReturnVehicle}
                onUpdateContractStatus={handleUpdateContractStatus}
                onDetailStateChange={setIsContractSubModalOpen}
              />
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ClientList
                clients={clients}
                contracts={contracts}
                onAddNewClient={() => setIsNewClientOpen(true)}
                onSettleDebt={handleSettleClientDebt}
                onDeleteClient={handleDeleteClient}
                onUpdateClient={handleUpdateClient}
                onDeleteContract={handleDeleteContract}
                onSelectClientToRent={client => {
                  setContractPreselectedVehicle(null);
                  setIsNewContractOpen(true);
                }}
                onResetAllClients={handleResetAllClients}
                onDetailStateChange={setIsClientDetailOpen}
              />
            </motion.div>
          )}

          {activeTab === 'maintenance' && (
            <motion.div
              key="maintenance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <MaintenanceView
                vehicles={vehicles}
                maintenanceRecords={maintenanceRecords}
                onAddMaintenanceRecord={handleAddMaintenanceRecord}
                onQuickRenewInsurance={handleQuickRenewInsurance}
                onQuickLogOilChange={handleQuickLogOilChange}
                onQuickRenewTechVisit={handleQuickRenewTechVisit}
                onDetailStateChange={setIsMaintenanceSubModalOpen}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <AnalyticsView
                vehicles={vehicles}
                contracts={contracts}
                clients={clients}
                dailyStatements={dailyStatements}
                onAddDailyStatement={handleAddDailyStatement}
                onDeleteDailyStatement={handleDeleteDailyStatement}
                financePassword={agencySettings.financePassword || '121107'}
                onUpdateFinancePassword={handleUpdateFinancePassword}
                onResetStatistics={handleResetStatistics}
                onResetAllData={handleResetAllData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Frosted Glass Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/10 bg-slate-950/60 backdrop-blur-xl py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {agencySettings.agencyName || currentUser} • MANAUTO GESTION</p>
          <p className="text-[11px] text-slate-400 font-mono">RC: {agencySettings.rc} • ICE: {agencySettings.ice} • {agencySettings.city}</p>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {/* 1. Vehicle Detail Modal with revenue & alerts */}
      {selectedVehicleForDetail && (
        <VehicleDetailModal
          vehicle={selectedVehicleForDetail}
          contracts={contracts}
          onClose={() => setSelectedVehicleForDetail(null)}
          onRent={handleQuickRent}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onLogMaintenance={(veh, type) => {
            setSelectedVehicleForDetail(null);
            setActiveTab('maintenance');
          }}
        />
      )}

      {/* 2. New Contract Creation Modal with digital signature */}
      {isNewContractOpen && (
        <NewContractModal
          vehicles={vehicles}
          clients={clients}
          initialVehicle={contractPreselectedVehicle}
          onClose={() => {
            setIsNewContractOpen(false);
            setContractPreselectedVehicle(null);
          }}
          onCreateContract={handleCreateContract}
          onQuickAddClient={() => setIsNewClientOpen(true)}
        />
      )}

      {/* 3. Printable Contract Modal with User Cachet */}
      {contractToPrint && (
        <ContractPrintModal
          contract={contractToPrint}
          settings={agencySettings}
          currentUser={currentUser}
          onClose={() => setContractToPrint(null)}
        />
      )}

      {/* 4. New Vehicle Modal */}
      {isNewVehicleOpen && (
        <NewVehicleModal
          onClose={() => setIsNewVehicleOpen(false)}
          onAddVehicle={handleAddVehicle}
        />
      )}

      {/* 5. New Client Modal */}
      {isNewClientOpen && (
        <NewClientModal
          onClose={() => setIsNewClientOpen(false)}
          onAddClient={handleAddClient}
        />
      )}

      {/* 6. Agency Settings Modal */}
      {isSettingsOpen && (
        <AgencySettingsModal
          settings={agencySettings}
          onSave={setAgencySettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
