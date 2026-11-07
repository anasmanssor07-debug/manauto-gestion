import React, { useState, useMemo } from 'react';
import { Search, Plus, SlidersHorizontal, Trash2, RotateCcw, AlertTriangle, Car, Check } from 'lucide-react';
import { Vehicle } from '../types';
import { CarCard } from './CarCard';

interface CarGridProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onRentVehicle: (vehicle: Vehicle) => void;
  onAddNewVehicle: () => void;
  onDeleteVehicle?: (vehicle: Vehicle) => void;
  onClearAllVehicles?: () => void;
  onResetSampleFleet?: () => void;
}

export const CarGrid: React.FC<CarGridProps> = ({
  vehicles,
  onSelectVehicle,
  onRentVehicle,
  onAddNewVehicle,
  onDeleteVehicle,
  onClearAllVehicles,
  onResetSampleFleet
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
      const matchesFuel = fuelFilter === 'all' || vehicle.fuel === fuelFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        vehicle.brand.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.matricule.toLowerCase().includes(query) ||
        vehicle.color.toLowerCase().includes(query);

      return matchesStatus && matchesFuel && matchesSearch;
    });
  }, [vehicles, filterStatus, fuelFilter, searchQuery]);

  const counts = {
    all: vehicles.length,
    disponible: vehicles.filter(v => v.status === 'disponible').length,
    en_location: vehicles.filter(v => v.status === 'en_location').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
        <div>
          <h2 id="cars-section-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-400" />
            Flotte de Voitures <span className="text-slate-400 font-medium text-base">({vehicles.length} véhicules)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajoutez, gérez et supprimez les voitures de votre agence en toute liberté.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Add Car Button */}
          <button
            id="add-vehicle-btn-inline"
            onClick={onAddNewVehicle}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>+ Ajouter un véhicule</span>
          </button>

          {/* Wipe or Reset options */}
          {vehicles.length > 0 && onClearAllVehicles && (
            <>
              {showClearConfirm ? (
                <div className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 rounded-xl p-1 animate-in fade-in">
                  <span className="text-[11px] text-rose-300 font-bold px-1.5">Vider toute la flotte ?</span>
                  <button
                    onClick={() => {
                      onClearAllVehicles();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg"
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] rounded-lg"
                  >
                    Non
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  title="Supprimer toutes les voitures pour commencer à zéro"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-300 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Vider flotte</span>
                </button>
              )}
            </>
          )}

          {onResetSampleFleet && vehicles.length === 0 && (
            <button
              type="button"
              onClick={onResetSampleFleet}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Charger exemples</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            id="filter-status-all"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'all'
                ? 'bg-amber-400 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            Toutes ({counts.all})
          </button>
          <button
            id="filter-status-disponible"
            onClick={() => setFilterStatus('disponible')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'disponible'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/15'
            }`}
          >
            Disponibles ({counts.disponible})
          </button>
          <button
            id="filter-status-en_location"
            onClick={() => setFilterStatus('en_location')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'en_location'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/15'
            }`}
          >
            En location ({counts.en_location})
          </button>
          <button
            id="filter-status-maintenance"
            onClick={() => setFilterStatus('maintenance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'maintenance'
                ? 'bg-rose-500 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/15'
            }`}
          >
            Garage / Entretien ({counts.maintenance})
          </button>
        </div>

        {/* Search & Fuel Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-vehicles-input"
              type="text"
              placeholder="Modèle, marque, matricule..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400/50 backdrop-blur-md"
            />
          </div>

          <select
            id="fuel-filter-select"
            value={fuelFilter}
            onChange={e => setFuelFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 backdrop-blur-md"
          >
            <option value="all" className="bg-slate-900 text-white">Tous carburants</option>
            <option value="Diesel" className="bg-slate-900 text-white">Diesel</option>
            <option value="Essence" className="bg-slate-900 text-white">Essence</option>
            <option value="Hybride" className="bg-slate-900 text-white">Hybride</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredVehicles.map(vehicle => (
            <CarCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={onSelectVehicle}
              onRent={onRentVehicle}
              onDelete={onDeleteVehicle}
            />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        /* Empty Fleet Screen */
        <div className="text-center py-16 bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-dashed border-white/15 p-8 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Votre flotte est actuellement vide</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Ajoutez vos propres véhicules avec leurs photos, matricules marocains et tarifs journaliers pour démarrer vos locations.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onAddNewVehicle}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter ma première voiture</span>
            </button>
            {onResetSampleFleet && (
              <button
                onClick={onResetSampleFleet}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Charger flotte d'exemple</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-300">Aucune voiture ne correspond à vos critères</p>
          <p className="text-xs text-slate-400 mt-1">Modifiez vos filtres ou effectuez une autre recherche</p>
        </div>
      )}
    </div>
  );
};
