import { useEffect, useState } from 'react';
import { vehicleApi } from '../api/endpoints';
import type { SearchFilters, Vehicle } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { Brand } from '../components/Brand';
import { RestockModal } from '../components/RestockModal';
import { SearchBar } from '../components/SearchBar';
import { Toast, useToast } from '../components/Toast';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleFormModal } from '../components/VehicleFormModal';
import { messageOf } from '../lib/errors';
import { stagger } from '../lib/stagger';

const EMPTY_FILTERS: SearchFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

export function DashboardPage() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { toast, showToast } = useToast();

  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Vehicle | 'new' | null>(null);
  const [restocking, setRestocking] = useState<Vehicle | null>(null);
  const [reloadKey, setReloadKey] = useState(0); // bump to force a fresh fetch

  const hasFilters = Object.values(filters).some((value) => value.trim() !== '');

  // Fetch whenever the filters change. Typing is debounced so we don't call the API on every keystroke.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(
      async () => {
        try {
          const { vehicles: found } = hasFilters
            ? await vehicleApi.search(filters)
            : await vehicleApi.list();
          if (cancelled) return;
          setVehicles(found);
          setLoadError('');
          // Remember every category we have seen so the dropdown stays complete while filtering.
          setCategories((previous) =>
            Array.from(new Set([...previous, ...found.map((v) => v.category)])).sort(),
          );
        } catch (err) {
          if (!cancelled) setLoadError(messageOf(err));
        } finally {
          if (!cancelled) setLoading(false);
        }
      },
      hasFilters ? 300 : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters, hasFilters, reloadKey]);

  const visible = inStockOnly ? vehicles.filter((v) => v.quantity > 0) : vehicles;
  const unitsInStock = vehicles.reduce((sum, v) => sum + v.quantity, 0);

  async function handlePurchase(vehicle: Vehicle) {
    setBusyId(vehicle.id);
    try {
      const { vehicle: updated } = await vehicleApi.purchase(vehicle.id);
      setVehicles((current) => current.map((v) => (v.id === updated.id ? updated : v)));
      showToast(`${updated.make} ${updated.model} is yours. Enjoy the drive!`);
    } catch (err) {
      showToast(messageOf(err), 'error');
      setReloadKey((key) => key + 1); // someone else may have bought it first: refresh
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(vehicle: Vehicle) {
    if (!window.confirm(`Delete ${vehicle.make} ${vehicle.model}? This cannot be undone.`)) return;
    try {
      await vehicleApi.remove(vehicle.id);
      setVehicles((current) => current.filter((v) => v.id !== vehicle.id));
      showToast('Vehicle deleted');
    } catch (err) {
      showToast(messageOf(err), 'error');
    }
  }

  function handleSaved(_vehicle: Vehicle, created: boolean) {
    setEditing(null);
    setReloadKey((key) => key + 1);
    showToast(created ? 'Vehicle added to the floor' : 'Vehicle updated');
  }

  function handleRestocked(updated: Vehicle) {
    setRestocking(null);
    setVehicles((current) => current.map((v) => (v.id === updated.id ? updated : v)));
    showToast(`${updated.make} ${updated.model} restocked: ${updated.quantity} in stock`);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setInStockOnly(false);
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Brand />
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-brass">
                {isAdmin ? 'Admin' : 'Member'}
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
          </div>
        </div>
        <div className="lane" />
      </header>

      <main className="mx-auto max-w-7xl px-6">
        <section className="pb-10 pt-12">
          <p className="reveal font-mono text-xs uppercase tracking-[0.35em] text-brass" style={stagger(0)}>
            The showroom floor
          </p>
          <h1
            className="reveal mt-3 font-display text-5xl font-extrabold italic leading-none sm:text-7xl"
            style={stagger(1)}
          >
            Find your <span className="text-signal">next</span> machine.
          </h1>
          <div className="reveal mt-8 flex gap-10 font-mono" style={stagger(2)}>
            <div>
              <p className="text-3xl font-semibold">{vehicles.length}</p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-mist">Models</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{unitsInStock}</p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-mist">Units in stock</p>
            </div>
          </div>
        </section>

        <div className="reveal" style={stagger(3)}>
          <SearchBar
            filters={filters}
            categories={categories}
            inStockOnly={inStockOnly}
            onChange={setFilters}
            onInStockChange={setInStockOnly}
            onReset={resetFilters}
          />
        </div>

        <div className="mb-6 mt-10 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
            {visible.length} {visible.length === 1 ? 'vehicle' : 'vehicles'}
          </p>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
              + Add vehicle
            </button>
          )}
        </div>

        {loadError && (
          <p role="alert" className="mb-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {loadError}
          </p>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="skeleton" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-20 text-center">
            <p className="font-display text-3xl italic">Nothing on the floor matches.</p>
            <button className="btn btn-ghost mt-6" onClick={resetFilters}>Reset filters</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index}
                isAdmin={isAdmin}
                busy={busyId === vehicle.id}
                onPurchase={handlePurchase}
                onEdit={setEditing}
                onRestock={setRestocking}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {editing !== null && (
        <VehicleFormModal
          vehicle={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {restocking && (
        <RestockModal
          vehicle={restocking}
          onClose={() => setRestocking(null)}
          onRestocked={handleRestocked}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}