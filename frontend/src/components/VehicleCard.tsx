import type { Vehicle } from '../api/types';
import { formatPrice } from '../lib/format';
import { stagger } from '../lib/stagger';

interface Props {
  vehicle: Vehicle;
  index: number;
  isAdmin: boolean;
  busy: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onRestock: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, index, isAdmin, busy, onPurchase, onEdit, onRestock, onDelete }: Props) {
  const soldOut = vehicle.quantity === 0;
  const lowStock = vehicle.quantity > 0 && vehicle.quantity <= 3;
  const stockTone = soldOut ? 'text-signal' : lowStock ? 'text-brass' : 'text-mist';

  return (
    // The wrapper plays the entrance animation; the card inside is free to animate on hover.
    <div className="reveal" style={stagger(index)}>
      <article className="card flex h-full flex-col">
        <div className="card-art">
          <span className="card-initial" aria-hidden>
            {vehicle.make.charAt(0).toUpperCase()}
          </span>
          <span className="absolute left-4 top-4 rounded-full border border-cream/30 bg-ink/60 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] backdrop-blur">
            {vehicle.category}
          </span>
          {soldOut && (
            <span className="absolute right-4 top-4 rotate-3 rounded bg-signal px-2 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-widest text-ink">
              Sold out
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-brass">{vehicle.make}</p>
          <h3 className="mt-1 font-display text-3xl font-bold leading-tight">{vehicle.model}</h3>

          <div className="mt-5 flex items-end justify-between gap-2">
            <p className="font-mono text-xl font-semibold">{formatPrice(vehicle.price)}</p>
            <p className={`font-mono text-xs ${stockTone}`}>
              {soldOut ? '0 left' : `${vehicle.quantity} in stock`}
            </p>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-signal transition-all duration-700"
              style={{ width: `${Math.min(vehicle.quantity, 10) * 10}%` }}
            />
          </div>

          <button
            className="btn btn-primary mt-5 w-full"
            disabled={soldOut || busy}
            onClick={() => onPurchase(vehicle)}
          >
            {soldOut ? 'Sold out' : busy ? 'Purchasing…' : 'Purchase'}
          </button>

          {isAdmin && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(vehicle)}>Edit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onRestock(vehicle)}>Restock</button>
              <button className="btn btn-ghost btn-danger btn-sm" onClick={() => onDelete(vehicle)}>Delete</button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}