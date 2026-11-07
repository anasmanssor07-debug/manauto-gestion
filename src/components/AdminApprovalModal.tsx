import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Phone, 
  Mail, 
  Lock, 
  Trash2, 
  RefreshCw, 
  Search, 
  AlertTriangle,
  Sparkles,
  Car
} from 'lucide-react';
import { 
  adminLoginOnServer, 
  fetchAdminAgenciesList, 
  updateAgencyApprovalStatus, 
  deleteAgencyOnServer,
  submitToMM3Acceptations
} from '../utils/apiSync';

interface AdminApprovalModalProps {
  onClose: () => void;
  onAgencyStatusChanged?: () => void;
}

export const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({ onClose, onAgencyStatusChanged }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Management state
  const [agencies, setAgencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [processingUsername, setProcessingUsername] = useState<string | null>(null);

  // Reject modal substate
  const [rejectingAgency, setRejectingAgency] = useState<any | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const res = await adminLoginOnServer(passwordInput);
      if (res.success) {
        setIsAuthenticated(true);
        loadAgencies();
      } else {
        setAuthError(res.error || "Mot de passe administrateur incorrect.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadAgencies = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const res = await fetchAdminAgenciesList();
      if (res.success && res.agencies) {
        setAgencies(res.agencies);
      } else {
        setActionError(res.error || 'Impossible de charger les agences.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (username: string) => {
    setProcessingUsername(username);
    setActionFeedback('');
    setActionError('');

    try {
      const targetAgency = agencies.find(a => a.username === username);
      const res = await updateAgencyApprovalStatus(username, 'approved');
      if (res.success) {
        // Forward approved agency data to MM3 Acceptations
        submitToMM3Acceptations({
          name: targetAgency?.name || username,
          commercialName: targetAgency?.name || username,
          city: targetAgency?.city || 'Casablanca',
          address: targetAgency?.address || 'Maroc',
          managerName: targetAgency?.name || username,
          email: targetAgency?.email || '',
          phone: targetAgency?.phone || '',
          registrationNumber: '54219',
          fleetSize: targetAgency?.vehiclesCount || 15,
          vehicleCategories: ['Citadine', 'Berline'],
          depositAmount: 20000,
          notes: 'Agence validée et activée par l\'administrateur Manauto',
        }).catch(err => console.error('MM3 transmit error:', err));

        setActionFeedback(`Agence "${username}" approuvée et activée avec succès !`);
        loadAgencies();
        onAgencyStatusChanged?.();
      } else {
        setActionError(res.error || 'Erreur lors de l\'approbation.');
      }
    } finally {
      setProcessingUsername(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingAgency) return;
    setProcessingUsername(rejectingAgency.username);
    setActionFeedback('');
    setActionError('');

    try {
      const res = await updateAgencyApprovalStatus(
        rejectingAgency.username, 
        'rejected', 
        rejectionReasonText || 'Demande non conforme aux critères d\'adhésion.'
      );
      if (res.success) {
        setActionFeedback(`L'agence "${rejectingAgency.username}" a été refusée.`);
        setRejectingAgency(null);
        setRejectionReasonText('');
        loadAgencies();
        onAgencyStatusChanged?.();
      } else {
        setActionError(res.error || 'Erreur lors du refus.');
      }
    } finally {
      setProcessingUsername(null);
    }
  };

  const handleDelete = async (username: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'agence "${username}" ?`)) {
      return;
    }

    setProcessingUsername(username);
    setActionFeedback('');
    setActionError('');

    try {
      const res = await deleteAgencyOnServer(username);
      if (res.success) {
        setActionFeedback(`Agence "${username}" supprimée.`);
        loadAgencies();
        onAgencyStatusChanged?.();
      } else {
        setActionError(res.error || 'Erreur lors de la suppression.');
      }
    } finally {
      setProcessingUsername(null);
    }
  };

  const filteredAgencies = agencies.filter(a => {
    const matchesFilter = 
      filter === 'all' ? true :
      a.status === filter;
    
    const matchesSearch = 
      (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = agencies.filter(a => a.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Portail Administrateur Manauto</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-xs font-black animate-pulse">
                    {pendingCount} en attente
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Validation des nouvelles demandes d'agences</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        {!isAuthenticated ? (
          /* STEP 1: Admin Password Login */
          <div className="p-6 sm:p-8 max-w-md mx-auto w-full my-auto text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Authentification Espace Admin</h3>
              <p className="text-xs text-slate-400">
                Saisissez le code d'accès administrateur pour valider ou refuser les demandes d'agences.
              </p>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={e => {
                  setPasswordInput(e.target.value);
                  setAuthError('');
                }}
                placeholder="Code d'accès administrateur..."
                required
                autoFocus
                className="w-full px-4 py-3 bg-slate-800 border border-white/15 rounded-xl text-sm text-center font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
              />

              {authError && (
                <p className="text-xs text-rose-400 font-semibold">{authError}</p>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm cursor-pointer transition-all disabled:opacity-50"
              >
                {isAuthenticating ? 'Vérification...' : 'Déverrouiller le portail'}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: Agencies List & Approval Controls */
          <div className="p-4 sm:p-6 flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
            
            {/* Feedback Banners */}
            {actionFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {actionFeedback}
                </span>
                <button type="button" onClick={() => setActionFeedback('')} className="text-emerald-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  {actionError}
                </span>
                <button type="button" onClick={() => setActionError('')} className="text-rose-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              
              {/* Tabs */}
              <div className="flex p-1 rounded-xl bg-slate-800/80 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filter === 'pending'
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>En attente ({agencies.filter(a => a.status === 'pending').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filter === 'approved'
                      ? 'bg-emerald-400 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approuvées ({agencies.filter(a => a.status === 'approved').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-white text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Toutes ({agencies.length})</span>
                </button>
              </div>

              {/* Search & Reload */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une agence..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={loadAgencies}
                  disabled={isLoading}
                  title="Rafraîchir"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* List of Agencies */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[260px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <p className="text-xs">Chargement des agences...</p>
                </div>
              ) : filteredAgencies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 border border-dashed border-white/10 rounded-2xl">
                  <Building2 className="w-8 h-8 text-slate-500" />
                  <p className="text-xs font-semibold text-slate-300">
                    {filter === 'pending'
                      ? 'Aucune demande d\'agence en attente pour le moment.'
                      : 'Aucune agence trouvée.'}
                  </p>
                </div>
              ) : (
                filteredAgencies.map(agency => {
                  const isPending = agency.status === 'pending';
                  const isApproved = agency.status === 'approved';
                  const isRejected = agency.status === 'rejected';
                  const isProcessing = processingUsername === agency.username;

                  return (
                    <div
                      key={agency.username}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isPending
                          ? 'bg-amber-500/[0.06] border-amber-500/30'
                          : isApproved
                          ? 'bg-slate-800/50 border-white/10 hover:border-white/20'
                          : 'bg-rose-500/[0.04] border-rose-500/20'
                      }`}
                    >
                      {/* Agency Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white uppercase">{agency.name}</span>
                          
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              En attente
                            </span>
                          )}

                          {isApproved && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wide">
                              ✓ Validée
                            </span>
                          )}

                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wide">
                              Refusée
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          {agency.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {agency.phone}
                            </span>
                          )}
                          {agency.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {agency.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(agency.createdAt || Date.now()).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {agency.rejectionReason && (
                          <p className="text-[11px] text-rose-300 italic">
                            Motif du refus : {agency.rejectionReason}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(agency.username)}
                              disabled={isProcessing}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approuver & Activer</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRejectingAgency(agency);
                                setRejectionReasonText('');
                              }}
                              disabled={isProcessing}
                              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Refuser</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingAgency(agency);
                              setRejectionReasonText('');
                            }}
                            disabled={isProcessing}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-medium cursor-pointer transition-all"
                            title="Suspendre / Refuser"
                          >
                            Suspendre
                          </button>
                        )}

                        {isRejected && (
                          <button
                            type="button"
                            onClick={() => handleApprove(agency.username)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold cursor-pointer transition-all"
                          >
                            Réapprouver
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(agency.username)}
                          disabled={isProcessing}
                          title="Supprimer définitivement"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with stats */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Total agences inscrites : <strong className="text-white">{agencies.length}</strong></span>
              <span className="text-[11px] text-slate-500">Validation instantanée sur le serveur central</span>
            </div>

          </div>
        )}

      </div>

      {/* Rejection Prompt Modal */}
      {rejectingAgency && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 max-w-md w-full space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Refuser l'agence "{rejectingAgency.name}"
            </h3>
            
            <p className="text-xs text-slate-300">
              Veuillez indiquer le motif du refus. Ce message sera affiché à l'agence lorsqu'elle consultera son statut.
            </p>

            <textarea
              value={rejectionReasonText}
              onChange={e => setRejectionReasonText(e.target.value)}
              placeholder="Ex: Informations non vérifiées, numéro injoignable, documents manquants..."
              rows={3}
              className="w-full p-3 bg-slate-800 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRejectingAgency(null)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
