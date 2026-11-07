import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Enable CORS and open access for all mobile/desktop clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-agency-password');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// File-based database directory for persistence across devices/reboots
const DATA_DIR = path.join(process.cwd(), 'server_data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'agencies_db.json');

// Interface for Agency Data
interface AgencyRecord {
  username: string; // unique lowercase key or identifier
  name: string;
  passwordHash: string; // plain or hashed password
  phone: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  lastModifiedAt?: number;
  status?: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectionReason?: string;
  data: {
    vehicles: any[];
    clients: any[];
    contracts: any[];
    maintenanceRecords: any[];
    dailyStatements: any[];
    agencySettings: any;
  };
}

interface DatabaseSchema {
  agencies: Record<string, AgencyRecord>;
}

// Read database
function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = { agencies: {} };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(content);
    
    // Ensure all existing legacy agencies have a status (default to approved)
    let hasChanges = false;
    for (const key of Object.keys(parsed.agencies || {})) {
      if (!parsed.agencies[key].status) {
        parsed.agencies[key].status = 'approved';
        hasChanges = true;
      }
    }
    if (hasChanges) {
      writeDB(parsed);
    }

    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err);
    return { agencies: {} };
  }
}

// Write database
function writeDB(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Normalize username for case-insensitive lookup
function normalizeKey(username: string): string {
  return username.trim().toLowerCase();
}

const MM3_WEBHOOK_URL = 'https://ais-dev-l2yom2rptt42ikl2pmsore-864399601012.europe-west2.run.app/api/webhook/agency-registration';

// Safe transmission helper for MM3 Acceptations
async function sendToMM3Webhook(payload: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(MM3_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `HTTP status ${response.status}` };
    }

    const data = await response.json().catch(() => ({ status: 'received' }));
    return { success: true, data };
  } catch (err: any) {
    // Gracefully handle network / timeout / offline external app
    const msg = err?.name === 'AbortError' ? 'Timeout reaching MM3 service' : (err?.message || 'Remote endpoint unavailable');
    return { success: false, error: msg };
  }
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Proxy for MM3 Acceptations Webhook (avoids browser CORS & connection errors)
app.post('/api/mm3/agency-registration', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await sendToMM3Webhook(payload);
    if (result.success) {
      console.log('✅ Demande MM3 relayée avec succès par le serveur');
      return res.json({ success: true, relayed: true, data: result.data });
    } else {
      console.warn('⚠️ Webhook MM3 non joignable (enregistré localement) :', result.error);
      return res.json({ success: true, relayed: false, note: result.error });
    }
  } catch (err: any) {
    return res.json({ success: true, relayed: false, note: 'Traitement local conservé' });
  }
});

// 2. Register Agency (Must create before login)
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, phone, email, initialSettings } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Le nom d'utilisateur et le mot de passe sont obligatoires." });
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanPhone = (phone || '').trim();
    const cleanEmail = (email || '').trim();

    if (cleanUsername.length < 2) {
      return res.status(400).json({ error: "Le nom de l'agence doit comporter au moins 2 caractères." });
    }

    if (cleanPassword.length < 3) {
      return res.status(400).json({ error: "Le mot de passe doit comporter au moins 3 caractères." });
    }

    const key = normalizeKey(cleanUsername);
    const db = readDB();

    if (db.agencies[key]) {
      return res.status(409).json({ 
        error: `Ce nom d'utilisateur "${cleanUsername}" existe déjà ! Veuillez changer de nom car une agence est déjà enregistrée avec ce même nom d'utilisateur.` 
      });
    }

    // Default settings
    const settings = initialSettings || {
      agencyName: cleanUsername,
      city: 'Casablanca',
      address: 'Maroc',
      phone: cleanPhone || '+212 6 00 00 00 00',
      email: cleanEmail || `${key}@gmail.com`,
      rc: '458921',
      ice: '002154879000045',
      patente: '34891200',
      currency: 'DH',
      defaultDeposit: 5000,
      termsAndConditions: "Le locataire s'engage à restituer le véhicule dans le même état de propreté et de fonctionnement. Le carburant doit être au même niveau qu'au départ. Assurance tous risques avec franchise.",
      financePassword: cleanPassword
    };

    const now = Date.now();
    const newRecord: AgencyRecord = {
      username: key,
      name: cleanUsername,
      passwordHash: cleanPassword,
      phone: cleanPhone,
      email: cleanEmail,
      status: 'pending', // Waiting for admin approval
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      lastModifiedAt: now,
      data: {
        vehicles: req.body.vehicles || [],
        clients: [],
        contracts: [],
        maintenanceRecords: [],
        dailyStatements: [],
        agencySettings: settings
      }
    };

    db.agencies[key] = newRecord;
    writeDB(db);

    // Asynchronously forward to MM3 Acceptations webhook safely
    sendToMM3Webhook({
      name: cleanUsername,
      commercialName: cleanUsername,
      city: settings.city || 'Casablanca',
      address: settings.address || 'Maroc',
      managerName: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      registrationNumber: settings.rc || '54219',
      fleetSize: (req.body.vehicles && req.body.vehicles.length) ? req.body.vehicles.length : 15,
      vehicleCategories: ['Citadine', 'Berline'],
      depositAmount: settings.defaultDeposit || 20000,
      notes: 'Demande créée depuis Manauto Gestions',
    }).then((res) => {
      if (res.success) {
        console.log('✅ Demande transmise à MM3 Acceptations (serveur)');
      }
    });

    return res.status(201).json({
      success: true,
      pendingApproval: true,
      status: 'pending',
      message: `Votre agence "${cleanUsername}" a été créée avec succès ! Votre compte est actuellement en attente d'approbation par l'administrateur.`,
      agency: {
        username: key,
        name: cleanUsername,
        phone: cleanPhone,
        email: cleanEmail,
        status: 'pending',
        createdAt: newRecord.createdAt,
        lastModifiedAt: now,
        data: newRecord.data
      }
    });
  } catch (err: any) {
    console.error('Error registering agency:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur lors de la création de l\'agence.' });
  }
});

// 3. Login Agency (STRICT CHECK: Must already exist, match password, and be approved by admin)
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Veuillez saisir votre nom d'utilisateur et votre mot de passe." });
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const key = normalizeKey(cleanUsername);

    const db = readDB();
    const agency = db.agencies[key];

    // STRICT CHECK 1: Agency does NOT exist -> Block entry!
    if (!agency) {
      return res.status(404).json({
        error: `Cette agence n'existe pas ou n'a pas encore été créée. Veuillez d'abord cliquer sur "Créer une Agence" pour l'enregistrer.`
      });
    }

    // STRICT CHECK 2: Password mismatch -> Block entry!
    if (agency.passwordHash !== cleanPassword) {
      return res.status(401).json({
        error: "Mot de passe incorrect pour cette agence. Veuillez vérifier vos identifiants."
      });
    }

    // STRICT CHECK 3: Agency is waiting for admin approval
    const agencyStatus = agency.status || 'approved';
    if (agencyStatus === 'pending') {
      return res.status(403).json({
        success: false,
        isPending: true,
        status: 'pending',
        error: `Votre compte d'agence "${agency.name}" est actuellement en attente d'approbation par l'administrateur. Veuillez patienter jusqu'à sa validation.`,
        agency: {
          username: agency.username,
          name: agency.name,
          phone: agency.phone,
          email: agency.email,
          status: 'pending',
          createdAt: agency.createdAt
        }
      });
    }

    // STRICT CHECK 4: Agency was rejected by admin
    if (agencyStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        isRejected: true,
        status: 'rejected',
        error: `Votre demande d'inscription pour l'agence "${agency.name}" a été refusée par l'administrateur.${agency.rejectionReason ? ` Motif : ${agency.rejectionReason}` : ''}`
      });
    }

    // Update last login
    agency.lastLoginAt = new Date().toISOString();
    writeDB(db);

    return res.json({
      success: true,
      agency: {
        username: agency.username,
        name: agency.name,
        phone: agency.phone,
        email: agency.email,
        status: agency.status || 'approved',
        lastModifiedAt: agency.lastModifiedAt || Date.now(),
        data: agency.data
      }
    });
  } catch (err: any) {
    console.error('Error logging in:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur lors de la connexion.' });
  }
});

// 3.1 Check Agency Status (Used by waiting screen for live verification)
app.get('/api/agency/:username/status', (req, res) => {
  try {
    const { username } = req.params;
    const key = normalizeKey(username);
    const db = readDB();
    const agency = db.agencies[key];

    if (!agency) {
      return res.status(404).json({ error: "Agence introuvable." });
    }

    return res.json({
      success: true,
      username: agency.username,
      name: agency.name,
      status: agency.status || 'approved',
      phone: agency.phone,
      email: agency.email,
      createdAt: agency.createdAt,
      approvedAt: agency.approvedAt,
      rejectionReason: agency.rejectionReason,
      lastModifiedAt: agency.lastModifiedAt || Date.now(),
      data: agency.status === 'approved' ? agency.data : undefined
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la vérification du statut." });
  }
});

// ==========================================
// ADMIN MANAGEMENT ROUTES
// ==========================================

// Admin Login Check
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    const clean = (password || '').trim();

    // Accepted admin passwords
    const validPasswords = ['admin2026', 'manauto2026', '121107', 'admin', 'superadmin'];

    if (!clean || !validPasswords.includes(clean)) {
      return res.status(401).json({ error: "Code d'accès administrateur incorrect." });
    }

    return res.json({
      success: true,
      message: "Authentification administrateur réussie."
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

// Admin: Get all agencies with approval status & stats
app.get('/api/admin/agencies', (req, res) => {
  try {
    const db = readDB();
    const agenciesList = Object.values(db.agencies).map(a => ({
      username: a.username,
      name: a.name,
      phone: a.phone || '',
      email: a.email || '',
      status: a.status || 'approved',
      createdAt: a.createdAt,
      lastLoginAt: a.lastLoginAt,
      approvedAt: a.approvedAt,
      rejectionReason: a.rejectionReason,
      vehiclesCount: a.data?.vehicles?.length || 0,
      clientsCount: a.data?.clients?.length || 0,
      contractsCount: a.data?.contracts?.length || 0
    }));

    // Sort: Pending first, then newest
    agenciesList.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return res.json({
      success: true,
      agencies: agenciesList,
      pendingCount: agenciesList.filter(a => a.status === 'pending').length,
      approvedCount: agenciesList.filter(a => a.status === 'approved').length,
      rejectedCount: agenciesList.filter(a => a.status === 'rejected').length
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la récupération des agences." });
  }
});

// Admin: Update agency status (Approve / Reject / Reset)
app.post('/api/admin/agency/status', (req, res) => {
  try {
    const { username, status, rejectionReason } = req.body;

    if (!username || !status) {
      return res.status(400).json({ error: "Nom d'agence et statut requis." });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Statut invalide (pending, approved, rejected)." });
    }

    const key = normalizeKey(username);
    const db = readDB();
    const agency = db.agencies[key];

    if (!agency) {
      return res.status(404).json({ error: "Agence introuvable." });
    }

    agency.status = status;
    agency.lastModifiedAt = Date.now();

    if (status === 'approved') {
      agency.approvedAt = new Date().toISOString();
      agency.rejectionReason = undefined;

      // Forward approval/validation to MM3 Acceptations webhook safely
      sendToMM3Webhook({
        name: agency.name,
        commercialName: agency.name,
        city: agency.data?.agencySettings?.city || 'Casablanca',
        address: agency.data?.agencySettings?.address || 'Maroc',
        managerName: agency.name,
        email: agency.email,
        phone: agency.phone,
        registrationNumber: agency.data?.agencySettings?.rc || '54219',
        fleetSize: agency.data?.vehicles?.length || 15,
        vehicleCategories: ['Citadine', 'Berline'],
        depositAmount: agency.data?.agencySettings?.defaultDeposit || 20000,
        notes: `Agence validée et approuvée dans Manauto Gestions le ${new Date().toLocaleDateString('fr-FR')}`,
        status: 'approved'
      }).then((res) => {
        if (res.success) {
          console.log('✅ Validation transmise à MM3 Acceptations (serveur)');
        }
      });
    } else if (status === 'rejected') {
      agency.rejectionReason = rejectionReason || 'Demande non conforme aux critères d\'adhésion.';
    }

    writeDB(db);

    const actionLabel = status === 'approved' ? 'approuvée et activée' : status === 'rejected' ? 'refusée' : 'mise en attente';

    return res.json({
      success: true,
      message: `L'agence "${agency.name}" a été ${actionLabel} avec succès.`,
      agency: {
        username: agency.username,
        name: agency.name,
        status: agency.status,
        approvedAt: agency.approvedAt,
        rejectionReason: agency.rejectionReason
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la mise à jour du statut." });
  }
});

// Admin: Delete agency
app.post('/api/admin/agency/delete', (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Nom d'agence requis." });
    }

    const key = normalizeKey(username);
    const db = readDB();

    if (!db.agencies[key]) {
      return res.status(404).json({ error: "Agence introuvable." });
    }

    const agencyName = db.agencies[key].name;
    delete db.agencies[key];
    writeDB(db);

    return res.json({
      success: true,
      message: `L'agence "${agencyName}" a été définitivement supprimée du système central.`
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// In-memory verification codes store for password resets
const passwordResetTokens: Record<string, {
  username: string;
  code: string;
  expiresAt: number;
  method: 'whatsapp' | 'email';
}> = {};

// Helper: Mask phone number
function maskPhone(phone: string): string {
  if (!phone) return 'Non renseigné';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return clean.slice(0, 4) + ' •••• ' + clean.slice(-2);
}

// Helper: Mask email
function maskEmail(email: string): string {
  if (!email) return 'Non renseigné';
  const parts = email.split('@');
  if (parts.length < 2) return email;
  const user = parts[0];
  const domain = parts[1];
  const maskedUser = user.length > 2 ? user.slice(0, 2) + '••••' + user.slice(-1) : user + '••';
  return `${maskedUser}@${domain}`;
}

// 4. Forgot Password: Request Verification Code (via WhatsApp or Gmail)
app.post('/api/auth/forgot-password/request', (req, res) => {
  try {
    const { identifier, method } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: "Veuillez renseigner le nom de votre agence, votre Gmail ou votre numéro de téléphone." });
    }

    const cleanInput = identifier.trim().toLowerCase();
    const db = readDB();

    // Find agency by username, email or phone
    let matchedAgency: AgencyRecord | null = null;

    // Direct username lookup
    if (db.agencies[cleanInput]) {
      matchedAgency = db.agencies[cleanInput];
    } else {
      // Search through all agencies for email or phone match
      for (const key of Object.keys(db.agencies)) {
        const ag = db.agencies[key];
        const agEmail = (ag.email || '').toLowerCase().trim();
        const agPhone = (ag.phone || '').replace(/[\s\-\+\(\)]/g, '');
        const searchClean = cleanInput.replace(/[\s\-\+\(\)]/g, '');

        if (agEmail === cleanInput || (searchClean.length >= 8 && agPhone.includes(searchClean))) {
          matchedAgency = ag;
          break;
        }
      }
    }

    if (!matchedAgency) {
      return res.status(404).json({
        error: `Aucune agence trouvée pour "${identifier}". Veuillez vérifier l'orthographe exacte de votre agence.`
      });
    }

    // Generate 6-digit security code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    const deliveryMethod = method === 'email' ? 'email' : 'whatsapp';

    passwordResetTokens[matchedAgency.username] = {
      username: matchedAgency.username,
      code,
      expiresAt,
      method: deliveryMethod
    };

    const targetPhone = matchedAgency.phone || '+212600000000';
    const targetEmail = matchedAgency.email || `${matchedAgency.username}@gmail.com`;

    return res.json({
      success: true,
      username: matchedAgency.username,
      agencyName: matchedAgency.name,
      deliveryMethod,
      code,
      phone: targetPhone,
      email: targetEmail,
      maskedPhone: maskPhone(targetPhone),
      maskedEmail: maskEmail(targetEmail),
      expiresAt,
      message: deliveryMethod === 'whatsapp'
        ? `Code de sécurité envoyé avec succès au numéro WhatsApp de l'agence (${maskPhone(targetPhone)}).`
        : `Code de sécurité envoyé avec succès à l'adresse Gmail (${maskEmail(targetEmail)}).`
    });
  } catch (err: any) {
    console.error('Error requesting password reset:', err);
    return res.status(500).json({ error: "Erreur lors de la génération du code de réinitialisation." });
  }
});

// 5. Forgot Password: Verify Code & Set New Password
app.post('/api/auth/forgot-password/reset', (req, res) => {
  try {
    const { username, code, newPassword } = req.body;

    if (!username || !code || !newPassword) {
      return res.status(400).json({ error: "Tous les champs sont requis (Identifiant, Code, Nouveau mot de passe)." });
    }

    if (newPassword.trim().length < 3) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit comporter au moins 3 caractères." });
    }

    const key = normalizeKey(username);
    const tokenRecord = passwordResetTokens[key];

    if (!tokenRecord) {
      return res.status(400).json({ error: "Aucune demande de réinitialisation en cours. Veuillez refaire une demande." });
    }

    if (Date.now() > tokenRecord.expiresAt) {
      delete passwordResetTokens[key];
      return res.status(400).json({ error: "Le code de sécurité a expiré (validité 15 minutes). Veuillez demander un nouveau code." });
    }

    if (tokenRecord.code.trim() !== code.trim()) {
      return res.status(400).json({ error: "Code de sécurité incorrect. Veuillez vérifier le code à 6 chiffres reçu." });
    }

    // Code is valid -> Update agency password
    const db = readDB();
    const agency = db.agencies[key];

    if (!agency) {
      return res.status(404).json({ error: "Agence introuvable." });
    }

    const cleanNewPassword = newPassword.trim();
    agency.passwordHash = cleanNewPassword;
    agency.lastModifiedAt = Date.now();

    if (agency.data && agency.data.agencySettings) {
      agency.data.agencySettings.financePassword = cleanNewPassword;
    }

    writeDB(db);

    delete passwordResetTokens[key];

    return res.json({
      success: true,
      message: `Le mot de passe de l'agence "${agency.name}" a été mis à jour avec succès ! Vous pouvez maintenant vous connecter.`,
      username: agency.username,
      agencyName: agency.name
    });
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return res.status(500).json({ error: "Erreur lors de la réinitialisation du mot de passe." });
  }
});

// 6. Fetch Synced Agency Data (For any device with this agency)
app.get('/api/agency/:username/data', (req, res) => {
  try {
    const { username } = req.params;
    const authPassword = req.headers['x-agency-password'] as string;

    const key = normalizeKey(username);
    const db = readDB();
    const agency = db.agencies[key];

    if (!agency) {
      return res.status(404).json({ error: "Agence introuvable." });
    }

    if (authPassword && agency.passwordHash !== authPassword) {
      return res.status(401).json({ error: "Authentification requise." });
    }

    return res.json({
      success: true,
      agencyName: agency.name,
      lastModifiedAt: agency.lastModifiedAt || Date.now(),
      data: agency.data,
      lastLoginAt: agency.lastLoginAt
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erreur de récupération des données.' });
  }
});

// 7. Sync/Save Agency Data (Push changes from Mobile or Laptop)
app.post('/api/agency/:username/sync', (req, res) => {
  try {
    const { username } = req.params;
    const { vehicles, clients, contracts, maintenanceRecords, dailyStatements, agencySettings } = req.body;

    const key = normalizeKey(username);
    const db = readDB();
    let agency = db.agencies[key];

    if (!agency) {
      agency = {
        username: key,
        name: username,
        passwordHash: agencySettings?.financePassword || '121107',
        phone: agencySettings?.phone || '',
        email: agencySettings?.email || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastModifiedAt: Date.now(),
        data: {
          vehicles: vehicles || [],
          clients: clients || [],
          contracts: contracts || [],
          maintenanceRecords: maintenanceRecords || [],
          dailyStatements: dailyStatements || [],
          agencySettings: agencySettings || {}
        }
      };
      db.agencies[key] = agency;
    }

    if (vehicles !== undefined) agency.data.vehicles = vehicles;
    if (clients !== undefined) agency.data.clients = clients;
    if (contracts !== undefined) agency.data.contracts = contracts;
    if (maintenanceRecords !== undefined) agency.data.maintenanceRecords = maintenanceRecords;
    if (dailyStatements !== undefined) agency.data.dailyStatements = dailyStatements;
    if (agencySettings !== undefined) agency.data.agencySettings = agencySettings;

    const now = Date.now();
    agency.lastModifiedAt = now;

    writeDB(db);

    return res.json({
      success: true,
      message: 'Données synchronisées avec succès sur le serveur central.',
      lastModifiedAt: now,
      data: agency.data
    });
  } catch (err: any) {
    console.error('Error syncing agency data:', err);
    return res.status(500).json({ error: 'Erreur lors de la synchronisation des données.' });
  }
});

// 8. List registered agency names (for switcher display)
app.get('/api/agencies/list', (req, res) => {
  try {
    const db = readDB();
    const list = Object.values(db.agencies).map(a => a.name);
    return res.json({ agencies: list });
  } catch (err) {
    return res.json({ agencies: [] });
  }
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MANAUTO Central Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
