import { useEffect, useState } from 'react';
import type { Vehicle } from '../api/types';
import { fetchCarSpecs, type CarSpecs } from '../lib/wikipedia';
import { formatPrice } from '../lib/format';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
}

/** Slides up from the bottom with the Wikipedia summary and specs for a vehicle. */
export function SpecsDrawer({ vehicle, onClose }: Props) {
  const [specs, setSpecs] = useState<CarSpecs | null>(null);
  const [loading, setLoading] = useState(true);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Fetch Wikipedia data
  useEffect(() => {
    let cancelled = false;
    fetchCarSpecs(vehicle.make, vehicle.model).then((result) => {
      if (!cancelled) { setSpecs(result); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [vehicle.make, vehicle.model]);

  const soldOut = vehicle.quantity === 0;
  const photo = specs?.imageUrl ?? vehicle.imageUrl;

  return (
    <>
      {/* Backdrop */}
      <div
        className="drawer-backdrop"
        aria-hidden
        onMouseDown={onClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${vehicle.make} ${vehicle.model} specifications`}
        className="drawer"
      >
        <div className="drawer-handle" />

        {/* Hero photo */}
        <div className="specs-hero mt-3">
          {photo && (
            <img
              src={photo}
              alt={`${vehicle.make} ${vehicle.model}`}
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-brass">{vehicle.make}</p>
              <h2 className="font-display text-4xl font-extrabold italic leading-none">{vehicle.model}</h2>
            </div>
            <button
              className="btn btn-ghost btn-sm shrink-0"
              aria-label="Close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pb-10">
          {/* Key figures */}
          <div className="grid grid-cols-3 gap-4 rounded-xl border border-line bg-moss/40 p-4">
            <div className="text-center">
              <p className="font-mono text-xl font-semibold">{formatPrice(vehicle.price)}</p>
              <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mist">Price</p>
            </div>
            <div className="text-center">
              <p className={`font-mono text-xl font-semibold ${soldOut ? 'text-signal' : ''}`}>
                {vehicle.quantity}
              </p>
              <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mist">In stock</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-xl font-semibold">{vehicle.category}</p>
              <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-mist">Category</p>
            </div>
          </div>

          {/* Wikipedia extract */}
          <div className="mt-6">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-brass">About</p>
            {loading ? (
              <div className="mt-3 space-y-2">
                {[100, 90, 95, 70].map((w, i) => (
                  <div
                    key={i}
                    className="skeleton h-4 rounded"
                    style={{ width: `${w}%`, height: '1rem' }}
                  />
                ))}
              </div>
            ) : specs?.extract ? (
              <p className="mt-3 text-sm leading-relaxed text-mist">{specs.extract}</p>
            ) : (
              <p className="mt-3 text-sm text-mist italic">
                No description found for this model.
              </p>
            )}
          </div>

          {/* Wikipedia link */}
          {specs?.wikiUrl && (
            <a
              href={specs.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-brass underline-offset-4 hover:underline"
            >
              Read more on Wikipedia ↗
            </a>
          )}
        </div>
      </div>
    </>
  );
}