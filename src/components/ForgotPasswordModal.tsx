import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, MessageCircle, Send, CheckCircle2, AlertCircle, 
  RefreshCw, KeyRound, ArrowRight, Smartphone, Eye, EyeOff, Sparkles, Building2, ExternalLink
} from 'lucide-react';
import { requestPasswordReset, verifyAndResetPassword, PasswordResetRequestResult } from '../utils/apiSync';

interface ForgotPasswordModalProps {
  initialIdentifier?: string;
  onClose: () => void;
  onPasswordResetSuccess: (username: string, newPass: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  initialIdentifier = '',
  onClose,
  onPasswordResetSuccess
}) => {
  // Steps: 'identify' (choose method & enter username/email/phone) | 'verify' (enter 6-digit code) | 'new_password' (set new pass) | 'success'
  const [step, setStep] = useState<'identify' | 'verify' | 'new_password' | 'success'>('identify');
  
  // Method: 'whatsapp' | 'email'
  const [method, setMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  
  // Verification details from server
  const [resetData, setResetData] = useState<PasswordResetRequestResult | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  
  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState<number>(0);

  // Countdown timer for code validity
  useEffect(() => {
    let interval: any;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Request Code (WhatsApp / Gmail)
  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMsg("Veuillez saisir le nom de votre agence, votre Gmail ou votre numéro de téléphone.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await requestPasswordReset(cleanId, method);
      
      if (!res.success) {
        setErrorMsg(res.error || "Impossible de trouver l'agence associée.");
        setIsLoading(false);
        return;
      }

      setResetData(res);
      setCountdown(900); // 15 minutes (900s)
      setStep('verify');
      setSuccessMsg(res.message || "Code de vérification envoyé avec succès.");

      // If WhatsApp method, prepare and propose direct WhatsApp link
      if (res.deliveryMethod === 'whatsapp' && res.phone) {
        const cleanPhone = res.phone.replace(/[\s\-\+]/g, '');
        const messageText = `Bonjour *${res.agencyName || 'MANAUTO'}*,\nVoici votre code de réinitialisation de mot de passe sécurisé : *${res.code}*.\nValable 15 minutes sur MANAUTO GESTION.`;
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
        
        // Auto-open WhatsApp link or offer button
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } else if (res.deliveryMethod === 'email' && res.email) {
        // Prepare Gmail quick open link
        const emailSubject = `Code de réinitialisation MANAUTO GESTION : ${res.code}`;
        const emailBody = `Bonjour ${res.agencyName || ''},\n\nVotre code de vérification pour changer votre mot de passe est : ${res.code}\n\nCe code est valable pendant 15 minutes.`;
        const mailtoUrl = `mailto:${res.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        // Provide link
      }
    } catch (err: any) {
      setErrorMsg("Une erreur est survenue lors de la communication avec le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify 6-digit Code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = verificationCode.trim();
    if (!cleanCode) {
      setErrorMsg("Veuillez saisir le code à 6 chiffres reçu.");
      return;
    }

    if (cleanCode.length !== 6) {
      setErrorMsg("Le code de vérification doit comporter exactement 6 chiffres.");
      return;
    }

    if (resetData?.code && resetData.code.trim() !== cleanCode) {
      setErrorMsg("Code de vérification incorrect. Veuillez vérifier vos messages WhatsApp ou vos emails.");
      return;
    }

    setStep('new_password');
    setErrorMsg('');
    setSuccessMsg("Code vérifié avec succès ! Veuillez définir votre nouveau mot de passe.");
  };

  // Submit New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 3) {
      setErrorMsg("Le mot de passe doit comporter au moins 3 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }

    const usernameToReset = resetData?.username || identifier.trim().toLowerCase();

    setIsLoading(true);

    try {
      const result = await verifyAndResetPassword(usernameToReset, verificationCode.trim(), newPassword.trim());

      if (!result.success) {
        setErrorMsg(result.error || "Erreur lors de la réinitialisation du mot de passe.");
        setIsLoading(false);
        return;
      }

      // Update in localStorage as well
      localStorage.setItem(`atlas_user_pwd_${usernameToReset}`, newPassword.trim());
      if (resetData?.agencyName) {
        localStorage.setItem(`atlas_user_pwd_${resetData.agencyName}`, newPassword.trim());
      }

      setStep('success');
      setSuccessMsg(`Le mot de passe de l'agence "${result.agencyName || usernameToReset}" a été réinitialisé !`);
    } catch (err) {
      setErrorMsg("Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 text-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-black shadow-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">Mot de Passe Oublié</h3>
              <p className="text-xs text-slate-400 mt-0.5">Récupération sécurisée par WhatsApp ou Gmail</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/60 border-b border-white/5 text-[11px] font-bold text-slate-400">
          <span className={`flex items-center gap-1.5 ${step === 'identify' ? 'text-amber-400' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 text-[10px]">1</span>
            Méthode d'envoi
          </span>
          <span className="text-slate-600">→</span>
          <span className={`flex items-center gap-1.5 ${step === 'verify' ? 'text-amber-400' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 text-[10px]">2</span>
            Code 6 chiffres
          </span>
          <span className="text-slate-600">→</span>
          <span className={`flex items-center gap-1.5 ${step === 'new_password' || step === 'success' ? 'text-amber-400' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white/10 text-[10px]">3</span>
            Nouveau mot de passe
          </span>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-tight">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-tight">{successMsg}</span>
            </div>
          )}

          {/* STEP 1: IDENTIFICATION & METHOD */}
          {step === 'identify' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Renseignez le <strong>nom de votre agence</strong>, votre <strong>adresse Gmail</strong> ou votre <strong>numéro de téléphone</strong> pour recevoir un code de réinitialisation instantané.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nom de l'agence, Gmail ou Téléphone *</span>
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => {
                    setIdentifier(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Ex: Atlas Car, contact@gmail.com, 06..."
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/15 rounded-xl text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                />
              </div>

              {/* Delivery Channel Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Où souhaitez-vous recevoir votre code de vérification ?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* WhatsApp Option */}
                  <button
                    type="button"
                    onClick={() => setMethod('whatsapp')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      method === 'whatsapp'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-slate-800/80 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      {method === 'whatsapp' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Par WhatsApp</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Envoi direct au numéro de l'agence</p>
                    </div>
                  </button>

                  {/* Gmail / Email Option */}
                  <button
                    type="button"
                    onClick={() => setMethod('email')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      method === 'email'
                        ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-md ring-2 ring-rose-500/20'
                        : 'bg-slate-800/80 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      {method === 'email' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Par Gmail / Email</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Envoi sur la boîte mail enregistrée</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recherche de l'agence...</span>
                    </>
                  ) : (
                    <>
                      <span>Envoyer le Code ({method === 'whatsapp' ? 'WhatsApp' : 'Gmail'})</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ENTER CODE */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    {resetData?.deliveryMethod === 'whatsapp' ? (
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Mail className="w-4 h-4 text-rose-400" />
                    )}
                    Destinataire :
                  </span>
                  <span className="text-[11px] font-mono font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full">
                    {resetData?.deliveryMethod === 'whatsapp' ? resetData?.maskedPhone : resetData?.maskedEmail}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Un code de sécurité à 6 chiffres a été généré pour l'agence <strong>{resetData?.agencyName}</strong>.
                </p>

                {/* Direct helper button for WhatsApp / Gmail */}
                {resetData?.deliveryMethod === 'whatsapp' && resetData?.phone && (
                  <a
                    href={`https://wa.me/${resetData.phone.replace(/[\s\-\+]/g, '')}?text=${encodeURIComponent(
                      `Bonjour ${resetData.agencyName},\nVoici votre code de réinitialisation MANAUTO : ${resetData.code}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Ouvrir WhatsApp directement</span>
                    <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                  </a>
                )}

                {resetData?.deliveryMethod === 'email' && resetData?.email && (
                  <a
                    href={`https://mail.google.com/mail/u/0/#search/MANAUTO`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Ouvrir Gmail</span>
                    <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                  </a>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Code de sécurité (6 chiffres) *</span>
                  {countdown > 0 ? (
                    <span className="text-[11px] text-amber-300 font-mono">
                      Expire dans {formatTimer(countdown)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-400 font-semibold">Expiré</span>
                  )}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={e => {
                    setVerificationCode(e.target.value.replace(/[^0-9]/g, ''));
                    setErrorMsg('');
                  }}
                  placeholder="Ex: 849201"
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 bg-slate-800 border border-white/15 rounded-xl text-center text-2xl tracking-[0.4em] font-mono font-extrabold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
                />
              </div>

              {/* Demo quick auto-fill code in dev environment */}
              {resetData?.code && (
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Code reçu sur l'écran :</span>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(resetData.code || '')}
                    className="font-mono font-bold text-amber-400 hover:underline px-2 py-0.5 rounded bg-amber-400/10 cursor-pointer"
                  >
                    Insérer code ({resetData.code})
                  </button>
                </div>
              )}

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('identify')}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Valider le code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleRequestCode()}
                  disabled={isLoading}
                  className="text-xs text-amber-400 hover:underline font-medium cursor-pointer"
                >
                  Renvoyer un nouveau code ({method === 'whatsapp' ? 'WhatsApp' : 'Gmail'})
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: DEFINE NEW PASSWORD */}
          {step === 'new_password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  Définissez un nouveau mot de passe pour l'agence <strong>{resetData?.agencyName || identifier}</strong>.
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => {
                      setNewPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Au moins 3 caractères..."
                    required
                    className="w-full pl-4 pr-12 py-3 bg-slate-800 border border-white/15 rounded-xl text-sm font-mono font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirmer le nouveau mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Répétez le nouveau mot de passe..."
                    required
                    className="w-full pl-4 pr-12 py-3 bg-slate-800 border border-white/15 rounded-xl text-sm font-mono font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <span>Mettre à jour le mot de passe</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-white">Mot de passe réinitialisé !</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter en toute sécurité.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const targetUser = resetData?.agencyName || resetData?.username || identifier;
                  onPasswordResetSuccess(targetUser, newPassword);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm shadow-xl shadow-amber-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Se connecter maintenant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
