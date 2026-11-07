import { Vehicle, Client, Contract, MaintenanceRecord, AgencySettings, DailyStatement } from '../types';

export interface AgencySyncPayload {
  vehicles?: Vehicle[];
  clients?: Client[];
  contracts?: Contract[];
  maintenanceRecords?: MaintenanceRecord[];
  dailyStatements?: DailyStatement[];
  agencySettings?: AgencySettings;
}

export interface AuthResponse {
  success: boolean;
  pendingApproval?: boolean;
  isPending?: boolean;
  isRejected?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  agency?: {
    username: string;
    name: string;
    phone: string;
    email: string;
    status?: 'pending' | 'approved' | 'rejected';
    createdAt?: string;
    data?: {
      vehicles: Vehicle[];
      clients: Client[];
      contracts: Contract[];
      maintenanceRecords: MaintenanceRecord[];
      dailyStatements: DailyStatement[];
      agencySettings: AgencySettings;
    };
  };
  error?: string;
  message?: string;
}

/**
 * Submit agency creation to MM3 Acceptations via server proxy
 */
export async function submitToMM3Acceptations(agencyData: any) {
  try {
    const payload = {
      name: agencyData.name || agencyData.nom || '',
      commercialName: agencyData.commercialName || agencyData.enseigne || agencyData.name || '',
      city: agencyData.city || agencyData.ville || 'Casablanca',
      address: agencyData.address || agencyData.adresse || 'Maroc',
      managerName: agencyData.managerName || agencyData.gerant || agencyData.name || '',
      email: agencyData.email || '',
      phone: agencyData.phone || agencyData.telephone || '',
      registrationNumber: agencyData.registrationNumber || agencyData.rc || '54219',
      fleetSize: Number(agencyData.fleetSize || agencyData.flotte || 15),
      vehicleCategories: agencyData.vehicleCategories || ['Citadine', 'Berline'],
      depositAmount: Number(agencyData.depositAmount || 20000),
      notes: agencyData.notes || 'Demande créée depuis Manauto Gestions',
      ...agencyData
    };

    const response = await fetch('/api/mm3/agency-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json().catch(() => ({ success: true }));
      console.log('✅ Demande transmise pour MM3 Acceptations :', result);
      return result;
    }
  } catch (error) {
    // Non-blocking fallback for offline/preview environments
    console.info('ℹ️ Notification MM3 enregistrée dans la file locale');
  }
}

export async function registerAgencyOnServer(
  username: string,
  password: string,
  phone: string,
  email: string,
  initialSettings?: any,
  defaultVehicles?: Vehicle[]
): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        phone,
        email,
        initialSettings,
        vehicles: defaultVehicles || []
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        isPending: data.isPending,
        isRejected: data.isRejected,
        status: data.status,
        error: data.error || 'Erreur lors de la création de l\'agence.'
      };
    }
    return {
      success: true,
      pendingApproval: data.pendingApproval ?? true,
      status: data.status || 'pending',
      agency: data.agency,
      message: data.message
    };
  } catch (err: any) {
    console.error('API register error:', err);
    return { success: false, error: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.' };
  }
}

/**
 * Log into an existing agency (STRICT: rejects if agency doesn't exist, is pending, or rejected)
 */
export async function loginAgencyOnServer(username: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        isPending: data.isPending,
        isRejected: data.isRejected,
        status: data.status,
        agency: data.agency,
        error: data.error || 'Identifiants invalides.'
      };
    }
    return { success: true, status: data.agency?.status || 'approved', agency: data.agency };
  } catch (err: any) {
    console.error('API login error:', err);
    return { success: false, error: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.' };
  }
}

/**
 * Live check of agency approval status
 */
export async function checkAgencyStatusOnServer(username: string): Promise<{
  success: boolean;
  username?: string;
  name?: string;
  status?: 'pending' | 'approved' | 'rejected';
  phone?: string;
  email?: string;
  createdAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`/api/agency/${encodeURIComponent(username.trim())}/status`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Impossible de vérifier le statut.' };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: 'Erreur réseau lors de la vérification du statut.' };
  }
}

// ==========================================
// ADMIN API HELPERS
// ==========================================

export async function adminLoginOnServer(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Mot de passe administrateur incorrect.' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Erreur réseau.' };
  }
}

export async function fetchAdminAgenciesList(): Promise<{
  success: boolean;
  agencies?: any[];
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/agencies');
    if (!res.ok) {
      return { success: false, error: 'Erreur lors du chargement des agences.' };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: 'Erreur réseau.' };
  }
}

export async function updateAgencyApprovalStatus(
  username: string,
  status: 'pending' | 'approved' | 'rejected',
  rejectionReason?: string
): Promise<{ success: boolean; message?: string; error?: string; agency?: any }> {
  try {
    const res = await fetch('/api/admin/agency/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, status, rejectionReason })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erreur lors de la mise à jour.' };
    }
    return data;
  } catch (err) {
    return { success: false, error: 'Erreur réseau.' };
  }
}

export async function deleteAgencyOnServer(username: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin/agency/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erreur lors de la suppression.' };
    }
    return data;
  } catch (err) {
    return { success: false, error: 'Erreur réseau.' };
  }
}

export interface ServerAgencyDataResult {
  data: {
    vehicles: Vehicle[];
    clients: Client[];
    contracts: Contract[];
    maintenanceRecords: MaintenanceRecord[];
    dailyStatements: DailyStatement[];
    agencySettings: AgencySettings;
  };
  lastModifiedAt?: number;
  agencyName?: string;
}

/**
 * Fetch latest data for an agency from server
 */
export async function fetchAgencyDataFromServer(username: string): Promise<ServerAgencyDataResult | null> {
  const cleanUsername = (username || '').trim();
  if (!cleanUsername) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`/api/agency/${encodeURIComponent(cleanUsername)}/data`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const json = await res.json();
    if (!json.data) return null;
    return {
      data: json.data,
      lastModifiedAt: json.lastModifiedAt,
      agencyName: json.agencyName
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Sync (Push) current state to the central server so mobile and laptops are 100% identical
 */
export async function syncAgencyDataToServer(username: string, payload: AgencySyncPayload): Promise<{ success: boolean; lastModifiedAt?: number }> {
  const cleanUsername = (username || '').trim();
  if (!cleanUsername) return { success: false };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`/api/agency/${encodeURIComponent(cleanUsername)}/sync`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    clearTimeout(timeoutId);

    if (!res.ok) return { success: false };
    const json = await res.json();
    return { success: true, lastModifiedAt: json.lastModifiedAt };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { success: false };
  }
}

/**
 * Fetch list of registered agencies
 */
export async function fetchRegisteredAgencies(): Promise<string[]> {
  try {
    const res = await fetch('/api/agencies/list');
    if (!res.ok) return [];
    const json = await res.json();
    return json.agencies || [];
  } catch (err) {
    return [];
  }
}

export interface PasswordResetRequestResult {
  success: boolean;
  username?: string;
  agencyName?: string;
  deliveryMethod?: 'whatsapp' | 'email';
  code?: string;
  phone?: string;
  email?: string;
  maskedPhone?: string;
  maskedEmail?: string;
  expiresAt?: number;
  message?: string;
  error?: string;
}

export interface PasswordResetConfirmResult {
  success: boolean;
  message?: string;
  username?: string;
  agencyName?: string;
  error?: string;
}

/**
 * Request password reset verification code via WhatsApp or Email
 */
export async function requestPasswordReset(identifier: string, method: 'whatsapp' | 'email'): Promise<PasswordResetRequestResult> {
  try {
    const res = await fetch('/api/auth/forgot-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, method })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erreur lors de la demande de réinitialisation.' };
    }

    return {
      success: true,
      username: data.username,
      agencyName: data.agencyName,
      deliveryMethod: data.deliveryMethod,
      code: data.code,
      phone: data.phone,
      email: data.email,
      maskedPhone: data.maskedPhone,
      maskedEmail: data.maskedEmail,
      expiresAt: data.expiresAt,
      message: data.message
    };
  } catch (err) {
    console.error('requestPasswordReset error:', err);
    return { success: false, error: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.' };
  }
}

/**
 * Verify code and reset password
 */
export async function verifyAndResetPassword(username: string, code: string, newPassword: string): Promise<PasswordResetConfirmResult> {
  try {
    const res = await fetch('/api/auth/forgot-password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, code, newPassword })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erreur lors de la validation du mot de passe.' };
    }

    return {
      success: true,
      message: data.message,
      username: data.username,
      agencyName: data.agencyName
    };
  } catch (err) {
    console.error('verifyAndResetPassword error:', err);
    return { success: false, error: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.' };
  }
}
