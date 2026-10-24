import { useState, type ChangeEvent, type FormEvent } from 'react';
import { vehicleApi } from '../api/endpoints';
import type { Vehicle, VehicleInput } from '../api/types';
import { messageOf } from '../lib/errors';
import { Modal } from './Modal';

interface Props {
  /** The vehicle being edited, or null when adding a new one. */
  vehicle: Vehicle | null;
  categories: string[];
  onClose: () => void;
  onSaved: (vehicle: Vehicle, created: boolean) => void;
}

/** Admin form used for both "Add vehicle" and "Edit vehicle". */
export function VehicleFormModal({ vehicle, categories, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    category: vehicle?.category ?? '',
    price: vehicle ? String(vehicle.price) : '',
    quantity: vehicle ? String(vehicle.quantity) : '0',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const price = Number(form.price);
    if (form.price.trim() === '' || !Number.isFinite(price)) {
      setError('Enter a valid price');
      return;
    }

    const payload: VehicleInput = {
      make: form.make,
      model: form.model,
      category: form.category,
      price,
      quantity: Number(form.quantity),
    };

    setBusy(true);
    try {
      const result = vehicle
        ? await vehicleApi.update(vehicle.id, payload)
        : await vehicleApi.create(payload);
      onSaved(result.vehicle, vehicle === null);
    } catch (err) {
      setError(messageOf(err)); // the server's validation message
      setBusy(false);
    }
  }

  return (
    <Modal title={vehicle ? 'Edit vehicle' : 'Add vehicle'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="v-make">Make</label>
            <input id="v-make" className="field" required value={form.make} onChange={set('make')} />
          </div>
          <div>
            <label className="label" htmlFor="v-model">Model</label>
            <input id="v-model" className="field" required value={form.model} onChange={set('model')} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="v-category">Category</label>
          <input id="v-category" className="field" required list="category-options" placeholder="Sedan, SUV, Coupe…"
            value={form.category} onChange={set('category')} />
          <datalist id="category-options">
            {categories.map((category) => <option key={category} value={category} />)}
          </datalist>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="v-price">Price (USD)</label>
            <input id="v-price" type="number" min={0} step="any" className="field" required
              value={form.price} onChange={set('price')} />
          </div>
          <div>
            <label className="label" htmlFor="v-qty">In stock</label>
            <input id="v-qty" type="number" min={0} step={1} className="field" required
              value={form.quantity} onChange={set('quantity')} />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : vehicle ? 'Save changes' : 'Add vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
}