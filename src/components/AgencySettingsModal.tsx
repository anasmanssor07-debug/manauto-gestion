import React, { useState } from 'react';
import { X, Building2, Save, RotateCcw, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { AgencySettings } from '../types';
import defaultAppLogo from '../assets/images/manauto_dark_logo_1787837006380.jpg';

interface AgencySettingsModalProps {
  settings: AgencySettings;
  onSave: (newSettings: AgencySettings) => void;
  onClose: () => void;
}

export const AgencySettingsModal: React.FC<AgencySettingsModalProps> = ({
  settings,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<AgencySettings>({ ...settings });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Le logo ne doit pas dépasser 5 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, logoUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const currentPreviewLogo = formData.logoUrl || defaultAppLogo;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 text-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Paramètres de l'Agence</h3>
              <p className="text-xs text-slate-400">Nom commercial, logo de l'agence, coordonnées et mentions légales</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Logo Agence de Location Section */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <label className="block font-semibold text-slate-300">
              Logo de l'Agence de Location (Affiché sur contrats, reçus et en-tête)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-400/40 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                <img
                  src={currentPreviewLogo}
                  alt="Logo Agence"
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAppLogo;
                  }}
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir un logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-medium text-xs flex items-center gap-1 transition-colors"
                      title="Réinitialiser au logo par défaut"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Défaut</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG ou WEBP (Recommandé : format carré ou détouré)
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nom de l'Agence (Affiché en haut)</label>
            <input
              type="text"
              value={formData.agencyName}
              onChange={e => setFormData({ ...formData, agencyName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ville</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Adresse complète</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email de contact</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">N° RC</label>
              <input
                type="text"
                value={formData.rc}
                onChange={e => setFormData({ ...formData, rc: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl font-mono text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">N° ICE</label>
              <input
                type="text"
                value={formData.ice}
                onChange={e => setFormData({ ...formData, ice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl font-mono text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">N° Patente</label>
              <input
                type="text"
                value={formData.patente}
                onChange={e => setFormData({ ...formData, patente: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl font-mono text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Devise</label>
            <input
              type="text"
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
              className="w-24 px-3 py-2 bg-slate-800 border border-white/15 rounded-xl font-bold text-amber-400"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
