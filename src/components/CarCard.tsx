import React, { useState } from 'react';
import { Fuel, Gauge, AlertCircle, Calendar, Trash2, X, Check } from 'lucide-react';
import { Vehicle } from '../types';
import { MoroccanPlate } from './MoroccanPlate';
import { formatNumber, getDaysUntil, getKmUntilOilChange } from '../utils/formatters';

interface CarCardProps {
  vehicle: Vehicle;
  onSelect: (vehicle: Vehicle) => void;
  onRent: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  vehicle,
  onSelect,
  onRent,
  onDelete
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const daysUntilInsurance = getDaysUntil(vehicle.insuranceExpiryDate);
  const kmUntilOil = getKmUntilOilChange(vehicle.mileage, vehicle.lastOilChangeMileage, vehicle.oilChangeIntervalKm);
  const hasUrgentAlert = (daysUntilInsurance <= 15 && daysUntilInsurance >= 0) || kmUntilOil <= 1000;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(vehicle);
    }
    setShowConfirmDelete(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  return (
    <div
      id={`car-card-${vehicle.id}`}
      className="group relative flex flex-col rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg hover:border-white/25 hover:bg-white/[0.07] hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden"
    >
      {/* Car Image with Badge */}
      <div
        className="relative h-44 w-full bg-slate-900 overflow-hidden cursor-pointer"
        onClick={() => onSelect(vehicle)}
      >
        <img
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {vehicle.status === 'disponible' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 text-white backdrop-blur-md border border-white/10 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Disponible
            </span>
          )}
          {vehicle.status === 'en_location' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-black backdrop-blur-md shadow-md font-bold">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
              En location
            </span>
          )}
          {vehicle.status === 'maintenance' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600/90 text-white backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              Maintenance
            </span>
          )}
        </div>

        {/* Delete button or delete confirmation overlay */}
        {onDelete && (
          <div className="absolute top-3 right-3 z-20">
            {showConfirmDelete ? (
              <div
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 bg-slate-950/90 border border-rose-500/50 rounded-xl p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-150"
              >
                <span className="text-[10px] text-rose-300 font-bold px-1.5">Supprimer ?</span>
                <button
                  type="button"
                  title="Confirmer la suppression"
                  onClick={handleConfirmDelete}
                  className="p-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Annuler"
                  onClick={handleCancelDelete}
                  className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id={`delete-car-btn-${vehicle.id}`}
                title="Supprimer ce véhicule de la flotte"
                onClick={handleDeleteClick}
                className="p-2 rounded-xl bg-slate-950/75 hover:bg-rose-500 text-slate-400 hover:text-white border border-white/10 hover:border-rose-500/50 shadow-md backdrop-blur-md transition-all opacity-80 hover:opacity-100 group/del"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Total Revenue overlay on bottom right */}
        <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-medium text-slate-300 border border-white/10">
          Gain: <span className="text-amber-400 font-bold">{formatNumber(vehicle.totalRevenueGenerated)} DH</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between text-slate-200">
        <div>
          {/* Header Row: Title & Plate */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <h3
                onClick={() => onSelect(vehicle)}
                className="text-base font-bold text-white hover:text-amber-400 transition-colors cursor-pointer"
              >
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {vehicle.year} • {vehicle.color}
              </p>
            </div>
            <MoroccanPlate matricule={vehicle.matricule} size="sm" />
          </div>

          {/* Specs Bar */}
          <div className="flex items-center gap-3 text-xs text-slate-300 py-2 border-y border-white/10 my-2.5">
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              {vehicle.fuel}
            </span>
            <span>•</span>
            <span>{vehicle.transmission}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              {formatNumber(vehicle.mileage)} km
            </span>
          </div>
        </div>

        {/* Footer: Price & Action */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-white">{vehicle.dailyRate}</span>
              <span className="text-xs font-semibold text-slate-400">DH/j</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`view-details-${vehicle.id}`}
              onClick={() => onSelect(vehicle)}
              className="px-3 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors backdrop-blur-md"
            >
              Détails
            </button>

            {vehicle.status === 'disponible' ? (
              <button
                id={`rent-car-${vehicle.id}`}
                onClick={() => onRent(vehicle)}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all"
              >
                <span>+ Louer</span>
              </button>
            ) : vehicle.status === 'en_location' ? (
              <button
                id={`view-active-contract-${vehicle.id}`}
                onClick={() => onSelect(vehicle)}
                className="px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-xl"
              >
                En cours
              </button>
            ) : (
              <button
                id={`view-maintenance-${vehicle.id}`}
                onClick={() => onSelect(vehicle)}
                className="px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl"
              >
                En révision
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
