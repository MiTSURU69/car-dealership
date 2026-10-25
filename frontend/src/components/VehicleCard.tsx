import { useState } from 'react';
import type { Vehicle } from '../api/types';
import { fetchCarSpecs, type CarSpecs } from '../lib/wikipedia';
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

export function VehicleCard({
  vehicle, index, isAdmin, busy,
  onPurchase, onEdit, onRestock, onDelete,
}: Props) {
  const soldOut = vehicle.quantity === 0;
  const lowStock = vehicle.quantity > 0 && vehicle.quantity <= 3;
  const stockTone = soldOut ? 'text-signal' : lowStock ? 'text-brass' : 'text-mist';

  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [specs, setSpecs] = useState<CarSpecs | null>(null);
  const [specsLoading, setSpecsLoading] = useState(false);
  const showPhoto = vehicle.imageUrl !== null && failedUrl !== vehicle.imageUrl;

  function handleFlip() {
    if (!flipped && !specs && !specsLoading) {
      setSpecsLoading(true);
      fetchCarSpecs(vehicle.make, vehicle.model).then((result) => {
        setSpecs(result);
        setSpecsLoading(false);
      });
    }
    setFlipped((f) => !f);
  }

  return (
    <div className="reveal flip-card" style={{ ...stagger(index), height: '100%' }}>
      <div className={`flip-inner${flipped ? ' is-flipped' : ''}`} style={{ minHeight: '26rem' }}>

        {/* ── FRONT ── */}
        <div className="flip-front card flex flex-col">
          <div className="card-art">
            {showPhoto ? (
              <>
                <img
                  className="card-photo"
                  src={vehicle.imageUrl!}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setFailedUrl(vehicle.imageUrl)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
              </>
            ) : (
              <span className="card-initial" aria-hidden>
                {vehicle.make.charAt(0).toUpperCase()}
              </span>
            )}
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

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                className="btn btn-primary"
                disabled={soldOut || busy}
                onClick={(e) => { e.stopPropagation(); onPurchase(vehicle); }}
              >
                {soldOut ? 'Sold out' : busy ? '…' : 'Purchase'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={(e) => { e.stopPropagation(); handleFlip(); }}
              >
                Specs ↩
              </button>
            </div>

            {isAdmin && (
              <div
                className="mt-3 grid grid-cols-3 gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(vehicle)}>Edit</button>
                <button className="btn btn-ghost btn-sm" onClick={() => onRestock(vehicle)}>Restock</button>
                <button className="btn btn-ghost btn-danger btn-sm" onClick={() => onDelete(vehicle)}>Delete</button>
              </div>
            )}
          </div>
        </div>

        {/* ── BACK ── */}
        <div className="flip-back flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-brass">{vehicle.make}</p>
              <h3 className="mt-0.5 font-display text-3xl font-bold italic leading-tight">{vehicle.model}</h3>
            </div>
            <button
              className="btn btn-ghost btn-sm shrink-0"
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              aria-label="Flip back"
            >
              ↩
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-line bg-moss/40 p-3">
            <div className="text-center">
              <p className="font-mono text-sm font-semibold">{formatPrice(vehicle.price)}</p>
              <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-mist">Price</p>
            </div>
            <div className="text-center">
              <p className={`font-mono text-sm font-semibold ${soldOut ? 'text-signal' : ''}`}>
                {vehicle.quantity}
              </p>
              <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-mist">Stock</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-sm font-semibold">{vehicle.category}</p>
              <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-mist">Type</p>
            </div>
          </div>

          {/* Wikipedia extract */}
          <div className="mt-4 flex-1 overflow-y-auto">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-brass">About</p>
            {specsLoading ? (
              <div className="mt-2 space-y-2">
                {[100, 88, 94, 72, 80].map((w, i) => (
                  <div
                    key={i}
                    className="skeleton rounded"
                    style={{ width: `${w}%`, height: '0.75rem' }}
                  />
                ))}
              </div>
            ) : specs?.extract ? (
              <p className="mt-2 text-xs leading-relaxed text-mist line-clamp-6">{specs.extract}</p>
            ) : (
              <p className="mt-2 text-xs italic text-mist">No description found.</p>
            )}
          </div>

          {/* Wikipedia link */}
          {specs?.wikiUrl && (
            <a
              href={specs.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 font-mono text-[0.65rem] text-brass underline-offset-4 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Read more on Wikipedia ↗
            </a>
          )}
        </div>

      </div>
    </div>
  );
}