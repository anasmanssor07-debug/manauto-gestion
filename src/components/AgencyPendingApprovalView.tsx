import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Phone, 
  Mail, 
  RefreshCw, 
  Building2, 
  ArrowLeft, 
  Sparkles,
  MessageCircle,
  HelpCircle,
  LogIn
} from 'lucide-react';
import { checkAgencyStatusOnServer } from '../utils/apiSync';

interface AgencyPendingApprovalViewProps {
  agencyName: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  onApproved: (username: string, agencyData?: any) => void;
  onBackToLogin: () => void;
}

export const AgencyPendingApprovalView: React.FC<AgencyPendingApprovalViewProps> = ({
  agencyName,
  phone = '',
  email = '',
  createdAt = new Date().toISOString(),
  onApproved,
  onBackToLogin
}) => {
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [agencyData, setAgencyData] = useState<any>(null);

  // Live polling every 8 seconds to detect approval automatically
  useEffect(() => {
    let isMounted = true;

    const performCheck = async (silent = true) => {
      if (!silent) setIsChecking(true);
      try {
        const result = await checkAgencyStatusOnServer(agencyName);
        if (!isMounted) return;

        setLastCheckTime(new Date());

        if (result.success && result.status) {
          setCurrentStatus(result.status);
          if (result.status === 'rejected' && result.rejectionReason) {
            setRejectionReason(result.rejectionReason);
          }
          if (result.status === 'approved') {
            setAgencyData(result.data);
          }
        }
      } catch (e) {
        console.error('Status check error:', e);
      } finally {
        if (!silent && isMounted) setIsChecking(false);
      }
    };

    // Initial check
    performCheck(true);

    const interval = setInterval(() => {
      performCheck(true);
    }, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [agencyName]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const result = await checkAgencyStatusOnServer(agencyName);
      setLastCheckTime(new Date());

      if (result.success && result.status) {
        setCurrentStatus(result.status);
        if (result.status === 'rejected' && result.rejectionReason) {
          setRejectionReason(result.rejectionReason);
        }
        if (result.status === 'approved') {
          setAgencyData(result.data);
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleStartUsingApp = () => {
    onApproved(agencyName, agencyData);
  };

  // WhatsApp support message
  const adminWhatsAppNumber = '212600000000'; // Default support line
  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(
    `Bonjour Admin Manauto, je viens de créer mon agence "${agencyName}" et je souhaite demander la validation de mon compte.`
  )}`;

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col justify-center items-center px-4 py-8 overflow-hidden">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-slate-100">
          
          {/* Top back button */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la connexion</span>
            </button>

            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-400">
              Réf : {agencyName.replace(/\s+/g, '-').toUpperCase()}
            </span>
          </div>

          {/* STATUS 1: PENDING (DEFAULT WAITING SCREEN) */}
          {currentStatus === 'pending' && (
            <div className="space-y-6 text-center">
              {/* Animated Waiting Icon */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping opacity-60" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
                  <Clock className="w-8 h-8 animate-spin-slow" />
                </div>
              </div>

              {/* Title & Badge */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>En attente de validation administrateur</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Votre agence a été enregistrée avec succès !
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Merci d'avoir rejoint <strong className="text-amber-400">Manauto</strong>. Votre compte d'agence est actuellement soumis à la révision de l'administrateur pour activation.
                </p>
              </div>

              {/* Agency Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/10 text-left space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    Nom de l'agence
                  </span>
                  <span className="text-xs font-bold text-white uppercase">{agencyName}</span>
                </div>
                {phone && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Téléphone
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Date de demande
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {new Date(createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Informative notice box */}
              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs text-left flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sky-100">Que se passe-t-il maintenant ?</p>
                  <p className="text-sky-300/90 leading-relaxed text-[11px]">
                    Dès que l'administrateur approuvera votre compte, cette page se mettra à jour automatiquement et vous pourrez immédiatement accéder à toutes les fonctionnalités de gestion de flotte, contrats et facturation.
                  </p>
                </div>
              </div>

              {/* Status refresh control */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-white/15 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-amber-400 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Vérification en cours...' : 'Vérifier l\'approbation'}</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacter l'Admin (WhatsApp)</span>
                </a>
              </div>

              <p className="text-[11px] text-slate-500">
                Dernière vérification automatique à {lastCheckTime.toLocaleTimeString('fr-FR')} • Vérification toutes les 8 secondes
              </p>
            </div>
          )}

          {/* STATUS 2: APPROVED (SUCCESS) */}
          {currentStatus === 'approved' && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Compte Approuvé & Activé !</span>
                </div>
                <h1 className="text-2xl font-black text-white">
                  Félicitations ! Votre agence est validée.
                </h1>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  L'administrateur a validé l'accès pour l'agence <strong className="text-emerald-400">{agencyName}</strong>. Vous pouvez maintenant accéder à votre espace de travail.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartUsingApp}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black font-extrabold rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Ouvrir mon tableau de bord Manauto</span>
              </button>
            </div>
          )}

          {/* STATUS 3: REJECTED */}
          {currentStatus === 'rejected' && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <XCircle className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
                  <span>Demande non validée</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Inscription non validée
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                  Votre demande pour l'agence <strong className="text-rose-400">{agencyName}</strong> n'a pas été approuvée par l'administrateur.
                </p>
              </div>

              {rejectionReason && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs text-left">
                  <p className="font-semibold text-rose-300 mb-1">Motif communiqué :</p>
                  <p className="italic">{rejectionReason}</p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacter l'administrateur</span>
                </a>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-200 cursor-pointer transition-all"
                >
                  <span>Retour à l'accueil</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer badge */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Système de validation et de protection Manauto Pro</span>
          </div>

        </div>
      </div>
    </div>
  );
};
