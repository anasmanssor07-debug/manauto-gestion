import React, { useState, useEffect } from 'react';
import { X, Car, Plus, Shield, Image as ImageIcon, Sparkles, Check, Upload, RefreshCw, Wand2 } from 'lucide-react';
import { Vehicle, FuelType, TransmissionType } from '../types';
import { CAR_IMAGE_PRESETS, CarImagePreset, findMatchingCarImage } from '../data/carImages';

interface NewVehicleModalProps {
  onClose: () => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'totalRevenueGenerated' | 'totalRentalsCount' | 'totalKmDrivenInRentals'>) => void;
}

const POPULAR_BRANDS = [
  'Dacia', 'Renault', 'Peugeot', 'Volkswagen', 'Hyundai', 'Kia', 
  'Toyota', 'Citroën', 'Fiat', 'Mercedes-Benz', 'BMW', 'Audi', 'Range Rover', 'Cupra'
];

export const NewVehicleModal: React.FC<NewVehicleModalProps> = ({
  onClose,
  onAddVehicle
}) => {
  const [brand, setBrand] = useState('Dacia');
  const [model, setModel] = useState('Logan');
  const [year, setYear] = useState<number | ''>(2024);
  const [matricule, setMatricule] = useState('14589-A-1');
  const [fuel, setFuel] = useState<FuelType>('Diesel');
  const [transmission, setTransmission] = useState<TransmissionType>('Manuelle');
  const [color, setColor] = useState('Blanc');
  const [dailyRate, setDailyRate] = useState<number | ''>(230);
  const [mileage, setMileage] = useState<number | ''>(15000);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80');
  const [autoMatchedName, setAutoMatchedName] = useState<string>('Dacia Logan');
  const [isManualImage, setIsManualImage] = useState<boolean>(false);
  
  // Insurance & maintenance defaults
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('2027-02-28');
  const [technicalVisitExpiryDate, setTechnicalVisitExpiryDate] = useState('2027-06-30');

  // Intelligent Automatic Image Matcher when typing brand or model
  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    if (!isManualImage) {
      const match = findMatchingCarImage(newBrand, model);
      if (match.imageUrl) {
        setImageUrl(match.imageUrl);
        if (match.preset) {
          setAutoMatchedName(`${match.preset.brand} ${match.preset.model}`);
        }
      }
    }
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    if (!isManualImage) {
      const match = findMatchingCarImage(brand, newModel);
      if (match.imageUrl) {
        setImageUrl(match.imageUrl);
        if (match.preset) {
          setAutoMatchedName(`${match.preset.brand} ${match.preset.model}`);
          if (match.preset.fuel) setFuel(match.preset.fuel);
          if (match.preset.transmission) setTransmission(match.preset.transmission);
          if (match.preset.suggestedRate && (!dailyRate || dailyRate === 230)) {
            setDailyRate(match.preset.suggestedRate);
          }
        }
      }
    }
  };

  const handleSelectPreset = (preset: CarImagePreset) => {
    setBrand(preset.brand);
    setModel(preset.model);
    setImageUrl(preset.imageUrl);
    setFuel(preset.fuel);
    setTransmission(preset.transmission);
    setDailyRate(preset.suggestedRate);
    setAutoMatchedName(`${preset.brand} ${preset.model}`);
    setIsManualImage(false);
  };

  // Upload local photo from smartphone or laptop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setIsManualImage(true);
          setAutoMatchedName('Photo personnalisée');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVehicle({
      brand,
      model,
      year: year === '' ? new Date().getFullYear() : Number(year),
      matricule,
      fuel,
      transmission,
      color,
      dailyRate: dailyRate === '' ? 250 : Number(dailyRate),
      mileage: mileage === '' ? 0 : Number(mileage),
      status: 'disponible',
      imageUrl,
      insuranceExpiryDate,
      technicalVisitExpiryDate,
      vignetteExpiryDate: '2027-01-31',
      lastOilChangeMileage: mileage === '' ? 0 : Number(mileage),
      oilChangeIntervalKm: 10000
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-6 text-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-black shadow-lg">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">Ajouter un Véhicule</h3>
              <p className="text-xs text-slate-400 mt-0.5">Enregistrement d'une nouvelle voiture dans la flotte</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* Smart Photo Match Preview & Live Auto-Detection Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800 to-slate-800/80 border border-amber-400/25 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden border border-white/20 bg-slate-950 shrink-0 shadow-lg group">
              <img
                src={imageUrl}
                alt={`${brand} ${model}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-amber-400" />
                <span>Photo en direct</span>
              </div>
            </div>

            <div className="space-y-2 w-full text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Attribution automatique de l'image
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Photo HD Synchronisée
                </span>
              </div>
              <p className="text-xs text-slate-300">
                La photo s'ajuste automatiquement selon la marque et le modèle saisis ci-dessous.
              </p>
              
              {/* File Upload Button or custom URL option */}
              <div className="flex items-center gap-2 pt-1">
                <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-slate-200 hover:text-white font-medium flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Importer ma propre photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {isManualImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualImage(false);
                      const match = findMatchingCarImage(brand, model);
                      setImageUrl(match.imageUrl);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 text-xs font-bold hover:bg-amber-400/30 transition-colors"
                  >
                    Réinitialiser auto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Popular Brand Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Marques populaires (sélection rapide) :</label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              {POPULAR_BRANDS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleBrandChange(b)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer text-[11px] ${
                    brand.toLowerCase() === b.toLowerCase()
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Brand & Model Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marque *</label>
              <input
                type="text"
                value={brand}
                onChange={e => handleBrandChange(e.target.value)}
                placeholder="Ex: Renault, Dacia, Peugeot..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Modèle *</label>
              <input
                type="text"
                value={model}
                onChange={e => handleModelChange(e.target.value)}
                placeholder="Ex: Clio 5, Logan, Golf 8, 208, Tucson..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-bold"
                required
              />
            </div>
          </div>

          {/* Quick Model Presets Carousel */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Modèles fréquents & photos disponibles :
              </label>
              <span className="text-[10px] text-slate-400">Cliquez pour appliquer</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1 scrollbar-thin">
              {CAR_IMAGE_PRESETS.map((preset, idx) => {
                const isSelected = imageUrl === preset.imageUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`relative group rounded-xl overflow-hidden border p-1 text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-400/50 shadow-md'
                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="h-10 w-full rounded-lg overflow-hidden relative">
                      <img
                        src={preset.imageUrl}
                        alt={`${preset.brand} ${preset.model}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-400 text-black">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="mt-1 px-0.5">
                      <p className="text-[9px] font-bold text-white truncate">{preset.brand} {preset.model}</p>
                      <p className="text-[8px] text-amber-300 font-medium">{preset.suggestedRate} DH/j</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matricule & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Matricule Marocain (Format: 12345-A-1) *
              </label>
              <input
                type="text"
                value={matricule}
                onChange={e => setMatricule(e.target.value)}
                placeholder="12345-A-1"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm font-mono text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Année *</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="2024"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
          </div>

          {/* Fuel, Transmission, Color */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Carburant</label>
              <select
                value={fuel}
                onChange={e => setFuel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="Diesel">Diesel</option>
                <option value="Essence">Essence</option>
                <option value="Hybride">Hybride</option>
                <option value="Électrique">Électrique</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Boîte</label>
              <select
                value={transmission}
                onChange={e => setTransmission(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="Manuelle">Manuelle</option>
                <option value="Automatique">Automatique</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Couleur</label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {/* Daily Rate & Mileage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tarif journalier (DH/j) *</label>
              <input
                type="number"
                value={dailyRate}
                onChange={e => setDailyRate(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="250"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm font-bold text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kilométrage actuel (km) *</label>
              <input
                type="number"
                value={mileage}
                onChange={e => setMileage(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="15000"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                required
              />
            </div>
          </div>

          {/* Direct Custom Image URL (Collapsible/Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                Lien direct de l'image (URL)
              </span>
              <span className="text-[10px] text-slate-400">Modifiable manuellement</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => {
                setImageUrl(e.target.value);
                setIsManualImage(true);
              }}
              className="w-full px-3.5 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500"
              placeholder="https://..."
            />
          </div>

          {/* Insurance and Technical visit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Échéance Assurance</label>
              <input
                type="date"
                value={insuranceExpiryDate}
                onChange={e => setInsuranceExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Échéance Visite Tech.</label>
              <input
                type="date"
                value={technicalVisitExpiryDate}
                onChange={e => setTechnicalVisitExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
            >
              Enregistrer le véhicule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

