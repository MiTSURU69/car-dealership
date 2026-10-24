import type { Pagination } from '../api/types';

interface Props {
  pagination: Pagination;
  onPage: (page: number) => void;
}

/** Previous / next buttons with a "Page 2 of 5" label. Hidden when everything fits on one page. */
export function Pager({ pagination, onPage }: Props) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-5">
      <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ← Previous
      </button>
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
        Page {page} of {totalPages}
      </span>
      <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next →
      </button>
    </nav>
  );
}