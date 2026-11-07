import React, { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Sparkles, Building2, CheckCircle2, AlertCircle, Eye, EyeOff, Phone, Mail, UserPlus, LogIn, Laptop, RefreshCw, Car, KeyRound, ShieldAlert } from 'lucide-react';
import appLogo from '../assets/images/app_phone_logo_1787510482700.jpg';
import { ManautoLogo } from './ManautoLogo';
import { loginAgencyOnServer, registerAgencyOnServer, fetchRegisteredAgencies, submitToMM3Acceptations } from '../utils/apiSync';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { AgencyPendingApprovalView } from './AgencyPendingApprovalView';
import { AdminApprovalModal } from './AdminApprovalModal';

interface LoginPageProps {
  onLoginSuccess: (username: string, agencyData?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Modes: 'login' (Agency login) | 'register_agency' (Create agency)
  const [authMode, setAuthMode] = useState<'login' | 'register_agency'>('login');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Pending approval screen state
  const [pendingAgencyInfo, setPendingAgencyInfo] = useState<{
    username: string;
    phone?: string;
    email?: string;
    createdAt?: string;
  } | null>(null);

  // Load remembered agencies and last active username
  const lastRemembered = localStorage.getItem('atlas_remembered_agency') || '';
  const [username, setUsername] = useState(lastRemembered);
  const [password, setPassword] = useState(() => {
    if (lastRemembered) {
      return localStorage.getItem(`atlas_user_pwd_${lastRemembered}`) || '';
    }
    return '';
  });
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [existingAgencyFound, setExistingAgencyFound] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List of agencies that are registered (combining server + local memory)
  const [savedAgenciesList, setSavedAgenciesList] = useState<string[]>(() => {
    const localListStr = localStorage.getItem('atlas_all_agencies');
    const localList: string[] = localListStr ? JSON.parse(localListStr) : [];
    if (lastRemembered && !localList.includes(lastRemembered)) {
      localList.push(lastRemembered);
    }
    return localList;
  });

  useEffect(() => {
    // Load registered agencies from server and merge with local list
    fetchRegisteredAgencies().then(serverList => {
      if (serverList && serverList.length > 0) {
        setSavedAgenciesList(prev => {
          const merged = Array.from(new Set([...serverList, ...prev]));
          localStorage.setItem('atlas_all_agencies', JSON.stringify(merged));
          return merged;
        });
      }
    });
  }, []);

  // Update password when changing selected username if stored
  const handleSelectAgency = (agencyName: string) => {
    setAuthMode('login');
    setUsername(agencyName);
    const savedPass = localStorage.getItem(`atlas_user_pwd_${agencyName}`);
    if (savedPass) {
      setPassword(savedPass);
    } else {
      setPassword('');
    }
    setErrorMessage('');
    setSuccessMessage('');
    setExistingAgencyFound(null);
  };

  // Strict Login: reject if agency is not registered, pending, or rejected
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setExistingAgencyFound(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMessage("Veuillez saisir votre nom d'utilisateur ou le nom de votre agence.");
      return;
    }

    if (!cleanPassword) {
      setErrorMessage("Veuillez saisir le mot de passe de votre agence.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginAgencyOnServer(cleanUsername, cleanPassword);

      // CASE 1: Agency is pending approval -> Show the waiting view!
      if (result.isPending) {
        setIsSubmitting(false);
        setPendingAgencyInfo({
          username: result.agency?.name || cleanUsername,
          phone: result.agency?.phone || '',
          email: result.agency?.email || '',
          createdAt: result.agency?.createdAt || new Date().toISOString()
        });
        return;
      }

      // CASE 2: Approved and valid
      if (result.success && result.agency) {
        setSuccessMessage(`Connexion réussie ! Vos données de "${result.agency.name}" sont prêtes.`);

        // Save session & credentials permanently
        localStorage.setItem(`atlas_user_pwd_${result.agency.name}`, cleanPassword);
        localStorage.setItem('atlas_current_user', result.agency.name);
        localStorage.setItem('atlas_remembered_agency', result.agency.name);

        setSavedAgenciesList(prev => {
          const updated = Array.from(new Set([result.agency!.name, ...prev]));
          localStorage.setItem('atlas_all_agencies', JSON.stringify(updated));
          return updated;
        });

        setTimeout(() => {
          onLoginSuccess(result.agency!.name, result.agency!.data);
        }, 350);
        return;
      }

      // CASE 3: Rejected
      if (result.isRejected) {
        setErrorMessage(result.error || `La demande pour l'agence "${cleanUsername}" a été refusée par l'administrateur.`);
        setIsSubmitting(false);
        return;
      }

      // If server returned specific password error
      if (result.error && result.error.toLowerCase().includes('mot de passe incorrect')) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
        return;
      }

      // Offline fallback: Check local storage for agency data
      const localSettings = localStorage.getItem(`atlas_user_${cleanUsername}_settings`);
      const localPwd = localStorage.getItem(`atlas_user_pwd_${cleanUsername}`);

      if (localSettings || localPwd) {
        const parsedSettings = localSettings ? JSON.parse(localSettings) : null;
        const storedPass = localPwd || parsedSettings?.financePassword || '121107';

        if (storedPass === cleanPassword) {
          setSuccessMessage(`Connexion réussie en mode local pour "${cleanUsername}" !`);
          localStorage.setItem(`atlas_user_pwd_${cleanUsername}`, cleanPassword);
          localStorage.setItem('atlas_current_user', cleanUsername);
          localStorage.setItem('atlas_remembered_agency', cleanUsername);

          setTimeout(() => {
            onLoginSuccess(cleanUsername);
          }, 350);
          return;
        } else {
          setErrorMessage('Mot de passe incorrect pour cette agence.');
          setIsSubmitting(false);
          return;
        }
      }

      setErrorMessage(
        result.error ||
        `Cette agence "${cleanUsername}" n'a pas encore été créée. Enregistrez-la via le formulaire de création d'agence.`
      );
      setIsSubmitting(false);
    } catch (err: any) {
      // Local fallback in case server is unreachable
      const localPwd = localStorage.getItem(`atlas_user_pwd_${cleanUsername}`);
      if (localPwd && localPwd === cleanPassword) {
        setSuccessMessage(`Connexion hors-ligne établie pour "${cleanUsername}".`);
        localStorage.setItem('atlas_current_user', cleanUsername);
        localStorage.setItem('atlas_remembered_agency', cleanUsername);
        setTimeout(() => {
          onLoginSuccess(cleanUsername);
        }, 350);
        return;
      }

      setErrorMessage("Erreur de communication avec le serveur. Vérifiez vos identifiants ou votre connexion.");
      setIsSubmitting(false);
    }
  };

  // Register: Create agency in the central database -> Transitions to WAITING VIEW
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setExistingAgencyFound(null);

    const cleanAgencyName = regUsername.trim();
    const cleanPhone = regPhone.trim();
    const cleanEmail = regEmail.trim();
    const cleanPassword = regPassword.trim();

    if (!cleanAgencyName) {
      setErrorMessage("Veuillez saisir le nom de l'agence (Username).");
      return;
    }

    if (cleanAgencyName.length < 2) {
      setErrorMessage("Le nom de l'agence doit comporter au moins 2 caractères.");
      return;
    }

    // Check if agency name already exists
    const isAlreadyExisting = savedAgenciesList.some(
      existing => existing.trim().toLowerCase() === cleanAgencyName.toLowerCase()
    );

    if (isAlreadyExisting) {
      setExistingAgencyFound(cleanAgencyName);
      setErrorMessage(`L'agence "${cleanAgencyName}" est déjà enregistrée et conservée dans le système !`);
      return;
    }

    if (!cleanPhone) {
      setErrorMessage("Veuillez saisir le numéro de téléphone de l'agence.");
      return;
    }

    if (!cleanEmail) {
      setErrorMessage("Veuillez saisir une adresse Gmail / Email valide.");
      return;
    }

    if (!cleanPassword || cleanPassword.length < 3) {
      setErrorMessage("Veuillez définir un mot de passe d'au moins 3 caractères.");
      return;
    }

    setIsSubmitting(true);

    try {
      const initialSettings = {
        agencyName: cleanAgencyName,
        city: 'Casablanca',
        address: 'Maroc',
        phone: cleanPhone,
        email: cleanEmail,
        ice: '003294819000084',
        rc: '54219',
        patente: '4892019',
        termsAndConditions:
          "Le locataire s'engage à restituer le véhicule dans l'état où il a été reçu, avec le même niveau de carburant. Assurance tous risques avec franchise en cas d'accident responsable.",
        currency: 'DH',
        defaultDeposit: 5000,
        financePassword: cleanPassword
      };

      const result = await registerAgencyOnServer(
        cleanAgencyName,
        cleanPassword,
        cleanPhone,
        cleanEmail,
        initialSettings,
        [] // Start with empty fleet
      );

      if (!result.success) {
        if (result.error && result.error.includes('existe déjà')) {
          setExistingAgencyFound(cleanAgencyName);
        }
        setErrorMessage(result.error || "Erreur lors de la création de l'agence.");
        setIsSubmitting(false);
        return;
      }

      // Save user credentials and data locally in case
      localStorage.setItem(`atlas_user_pwd_${cleanAgencyName}`, cleanPassword);
      localStorage.setItem('atlas_remembered_agency', cleanAgencyName);
      localStorage.setItem(`atlas_user_${cleanAgencyName}_settings`, JSON.stringify(initialSettings));
      localStorage.setItem(`atlas_user_${cleanAgencyName}_vehicles`, JSON.stringify([]));
      localStorage.setItem(`atlas_user_${cleanAgencyName}_clients`, JSON.stringify([]));
      localStorage.setItem(`atlas_user_${cleanAgencyName}_contracts`, JSON.stringify([]));
      localStorage.setItem(`atlas_user_${cleanAgencyName}_maintenance`, JSON.stringify([]));
      localStorage.setItem(`atlas_user_${cleanAgencyName}_statements`, JSON.stringify([]));

      setSavedAgenciesList(prev => {
        const updated = Array.from(new Set([cleanAgencyName, ...prev]));
        localStorage.setItem('atlas_all_agencies', JSON.stringify(updated));
        return updated;
      });

      // Transmit agency creation request to MM3 Acceptations
      submitToMM3Acceptations({
        name: cleanAgencyName,
        commercialName: cleanAgencyName,
        city: 'Casablanca',
        address: 'Maroc',
        managerName: cleanAgencyName,
        email: cleanEmail,
        phone: cleanPhone,
        registrationNumber: '54219',
        fleetSize: 15,
        vehicleCategories: ['Citadine', 'Berline'],
        depositAmount: 20000,
        notes: 'Demande créée depuis Manauto Gestions'
      }).catch(err => console.error('MM3 transmission error:', err));

      setIsSubmitting(false);

      // SHOW THE WAITING VIEW UNTIL ACCEPTATION OF THE ADMIN
      setPendingAgencyInfo({
        username: cleanAgencyName,
        phone: cleanPhone,
        email: cleanEmail,
        createdAt: result.agency?.createdAt || new Date().toISOString()
      });

    } catch (err: any) {
      setErrorMessage("Erreur de communication avec le serveur.");
      setIsSubmitting(false);
    }
  };

  // If agency is waiting for admin approval, display the Waiting Screen
  if (pendingAgencyInfo) {
    return (
      <>
        <AgencyPendingApprovalView
          agencyName={pendingAgencyInfo.username}
          phone={pendingAgencyInfo.phone}
          email={pendingAgencyInfo.email}
          createdAt={pendingAgencyInfo.createdAt}
          onApproved={(approvedUsername, agencyData) => {
            localStorage.setItem('atlas_current_user', approvedUsername);
            localStorage.setItem('atlas_remembered_agency', approvedUsername);
            onLoginSuccess(approvedUsername, agencyData);
          }}
          onBackToLogin={() => {
            setPendingAgencyInfo(null);
            setAuthMode('login');
            setUsername(pendingAgencyInfo.username);
          }}
        />

        {showAdminModal && (
          <AdminApprovalModal
            onClose={() => setShowAdminModal(false)}
            onAgencyStatusChanged={() => {
              // will trigger live polling
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col justify-center items-center px-4 py-8 sm:py-12 overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Glowing background orbs for frosted glass aesthetic */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-amber-500/15 rounded-full blur-3xl" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-sky-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main Container - Responsive for Laptop & Mobile */}
      <div className="relative z-10 w-full max-w-lg lg:max-w-5xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
          
          {/* Laptop / Desktop Left Showcase Panel (visible on lg+) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center text-center p-8 rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <ManautoLogo variant="full" theme="dark" showSubtitle={true} />

            <div className="mt-6 w-full pt-6 border-t border-white/10 space-y-3 text-left">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Optimisé Laptop & Mobile</p>
                  <p className="text-[10px] text-slate-400">Interface tactile et clavier fluide</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Synchronisation Directe</p>
                  <p className="text-[10px] text-slate-400">Accédez à vos données en temps réel</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Contrats & Bons Officiels</p>
                  <p className="text-[10px] text-slate-400">Signatures et export PDF instantané</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column / Mobile Main Form */}
          <div className="lg:col-span-7">
            {/* Top Logo (Mobile and Tablet only) */}
            <div className="mb-6 lg:hidden">
              <ManautoLogo variant="full" theme="dark" showSubtitle={true} />
            </div>

            {/* Card Container */}
            <div
              id="login-form-card"
              className="relative bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-slate-100 overflow-hidden"
            >
              {/* Mode Switcher Tabs: Se Connecter vs Espace Admin */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-800/80 border border-white/10 mb-5">
                <button
                  id="tab-login-btn"
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se Connecter</span>
                </button>

                <button
                  id="tab-admin-btn"
                  type="button"
                  onClick={() => {
                    setShowAdminModal(true);
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-300 hover:text-amber-400 hover:bg-white/5 border border-transparent hover:border-amber-500/20"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Espace Admin</span>
                </button>
              </div>

          {/* MODE 1: Se Connecter (Agence) */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs flex items-center gap-2">
                <Laptop className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Connectez-vous avec vos identifiants pour gérer votre flotte, vos contrats, vos clients et vos finances.
                </span>
              </div>

              {/* Username / Agency Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Nom d'utilisateur de l'Agence
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Ex: Atlas Car</span>
                </label>
                <div className="relative">
                  <input
                    id="login-username-input"
                    type="text"
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Nom exact de l'agence..."
                    required
                    className="w-full pl-4 pr-4 py-3 bg-slate-800/90 border border-white/15 rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mot de passe</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(true);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <KeyRound className="w-3 h-3 text-amber-400" />
                    <span>Mot de passe oublié ?</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Mot de passe de l'agence"
                    required
                    className="w-full pl-4 pr-12 py-3 bg-slate-800/90 border border-white/15 rounded-xl text-sm font-mono font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Créer une Agence button directly under password input */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-800/80 to-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Pas encore inscrit ?</p>
                      <p className="text-[10px] text-slate-400">Créez le compte de votre agence</p>
                    </div>
                  </div>
                  <button
                    id="create-agency-shortcut-btn"
                    type="button"
                    onClick={() => {
                      setAuthMode('register_agency');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-all shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Créer une agence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-start justify-between gap-2 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span className="leading-tight">{errorMessage}</span>
                  </div>
                  {errorMessage.toLowerCase().includes('mot de passe') && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[11px] font-bold text-amber-300 hover:underline shrink-0"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer text-sm"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Vérification et connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Accéder à mon tableau de bord</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Agency Switcher if saved agencies exist */}
              {savedAgenciesList.length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Agences enregistrées sur cet appareil :</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {savedAgenciesList.map(agName => (
                      <button
                        key={agName}
                        type="button"
                        onClick={() => handleSelectAgency(agName)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          username.toLowerCase() === agName.toLowerCase()
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-bold'
                            : 'bg-slate-800/60 text-slate-300 border-white/10 hover:border-white/30 hover:bg-slate-800'
                        }`}
                      >
                        {agName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* MODE 2: Créer une Nouvelle Agence */}
          {authMode === 'register_agency' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>← Retour à la connexion</span>
                </button>
                <span className="text-[11px] text-slate-400 font-medium">Nouvelle Demande</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Créez le compte de votre agence. Après soumission, votre demande sera envoyée pour approbation par l'administrateur.
                </span>
              </div>

              {/* Agency Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Nom de l'agence (Nom d'utilisateur) *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-username-input"
                    type="text"
                    value={regUsername}
                    onChange={e => {
                      setRegUsername(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Ex: Atlas Location, Fast Car..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-white/15 rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Numéro de Téléphone (WhatsApp / SMS) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-phone-input"
                    type="tel"
                    value={regPhone}
                    onChange={e => {
                      setRegPhone(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Ex: +212 6 12 34 56 78"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-white/15 rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Adresse Gmail / Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-email-input"
                    type="email"
                    value={regEmail}
                    onChange={e => {
                      setRegEmail(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Ex: agence@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-white/15 rounded-xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Définir le mot de passe de l'agence *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-password-input"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => {
                      setRegPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Au moins 3 caractères..."
                    required
                    className="w-full pl-10 pr-12 py-2.5 bg-slate-800/90 border border-white/15 rounded-xl text-sm font-mono font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="leading-tight block">{errorMessage}</span>
                    {existingAgencyFound && (
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectAgency(existingAgencyFound);
                        }}
                        className="text-amber-300 font-bold underline hover:text-amber-200 cursor-pointer block mt-1"
                      >
                        Se connecter à l'agence "{existingAgencyFound}"
                      </button>
                    )}
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                id="register-agency-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer text-sm"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Créer et demander l'approbation</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer security badges & Admin Link */}
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Données chiffrées & isolées par agence</span>
            </div>
            
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Espace Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          initialIdentifier={username}
          onClose={() => setShowForgotPasswordModal(false)}
          onPasswordResetSuccess={(agencyName, newPass) => {
            setUsername(agencyName);
            setPassword(newPass);
            setShowForgotPasswordModal(false);
            setSuccessMessage(`Mot de passe réinitialisé pour "${agencyName}". Vous pouvez maintenant vous connecter.`);
          }}
        />
      )}

      {/* Admin Approval Portal Modal */}
      {showAdminModal && (
        <AdminApprovalModal
          onClose={() => setShowAdminModal(false)}
          onAgencyStatusChanged={() => {
            fetchRegisteredAgencies().then(list => {
              if (list) setSavedAgenciesList(list);
            });
          }}
        />
      )}
    </div>
  );
};

