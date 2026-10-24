import type { SearchFilters } from '../api/types';

interface Props {
  filters: SearchFilters;
  categories: string[];
  inStockOnly: boolean;
  onChange: (filters: SearchFilters) => void;
  onInStockChange: (value: boolean) => void;
  onReset: () => void;
}

export function SearchBar({ filters, categories, inStockOnly, onChange, onInStockChange, onReset }: Props) {
  const set = (key: keyof SearchFilters) => (value: string) => onChange({ ...filters, [key]: value });

  return (
    <section
      aria-label="Search and filter vehicles"
      className="rounded-2xl border border-line bg-panel/60 p-5 backdrop-blur"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label" htmlFor="f-make">Make</label>
          <input id="f-make" className="field" placeholder="Toyota"
            value={filters.make} onChange={(e) => set('make')(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-model">Model</label>
          <input id="f-model" className="field" placeholder="Corolla"
            value={filters.model} onChange={(e) => set('model')(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-category">Category</label>
          <select id="f-category" className="field"
            value={filters.category} onChange={(e) => set('category')(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-min">Min price</label>
          <input id="f-min" type="number" min={0} className="field" placeholder="0"
            value={filters.minPrice} onChange={(e) => set('minPrice')(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-max">Max price</label>
          <input id="f-max" type="number" min={0} className="field" placeholder="100000"
            value={filters.maxPrice} onChange={(e) => set('maxPrice')(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-mist">
          <input type="checkbox" className="h-4 w-4 accent-signal"
            checked={inStockOnly} onChange={(e) => onInStockChange(e.target.checked)} />
          In stock only
        </label>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
          Reset filters
        </button>
      </div>
    </section>
  );
}