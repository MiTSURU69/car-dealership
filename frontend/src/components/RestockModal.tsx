import { useState, type FormEvent } from 'react';
import { vehicleApi } from '../api/endpoints';
import type { Vehicle } from '../api/types';
import { messageOf } from '../lib/errors';
import { Modal } from './Modal';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
  onRestocked: (vehicle: Vehicle) => void;
}

/** Admin dialog for adding units to a vehicle's stock. */
export function RestockModal({ vehicle, onClose, onRestocked }: Props) {
  const [quantity, setQuantity] = useState('5');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await vehicleApi.restock(vehicle.id, Number(quantity));
      onRestocked(result.vehicle);
    } catch (err) {
      setError(messageOf(err));
      setBusy(false);
    }
  }

  return (
    <Modal title="Restock" onClose={onClose}>
      <p className="mb-5 text-mist">
        {vehicle.make} {vehicle.model} currently has{' '}
        <span className="font-mono text-cream">{vehicle.quantity}</span> in stock.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="r-qty">Units to add</label>
          <input id="r-qty" type="number" min={1} step={1} className="field" required autoFocus
            value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Adding…' : 'Add stock'}</button>
        </div>
      </form>
    </Modal>
  );
}