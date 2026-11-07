import React, { useState } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';
import { Client } from '../types';

interface NewClientModalProps {
  onClose: () => void;
  onAddClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalContractsCount' | 'totalPaid' | 'totalDue'>) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  onClose,
  onAddClient
}) => {
  const [fullName, setFullName] = useState('');
  const [cin, setCin] = useState('');
  const [phone, setPhone] = useState('06 ');
  const [email, setEmail] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [address, setAddress] = useState('Casablanca');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !cin || !phone) {
      alert('Veuillez remplir au moins le nom, la CIN et le numéro de téléphone.');
      return;
    }

    onAddClient({
      fullName,
      cin,
      phone,
      email: email || undefined,
      drivingLicenseNumber: drivingLicenseNumber || cin,
      address,
      nationality: 'Marocaine',
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-auto text-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Nouveau Client</h3>
            <p className="text-xs text-slate-400 mt-0.5">Fiche d'identité et permis de conduire</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom et Prénom *</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Ex: Yassine Bennani"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CIN / Passeport *</label>
              <input
                type="text"
                value={cin}
                onChange={e => setCin(e.target.value.toUpperCase())}
                placeholder="Ex: BE489102"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm font-mono text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone *</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="06 00 00 00 00"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">N° Permis de conduire</label>
              <input
                type="text"
                value={drivingLicenseNumber}
                onChange={e => setDrivingLicenseNumber(e.target.value)}
                placeholder="Ex: 14/89201"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@mail.com"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Quartier, Ville..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Remarques</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Bon payeur, client habitué..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white h-16 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="pt-3 flex flex-col sm:flex-row justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95"
            >
              Créer la fiche client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
