type Props = {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export function Pagination({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  label = 'elementos',
}: Props) {
  if (total === 0) return null;

  return (
    <div className="pagination" role="navigation" aria-label="Paginación">
      <p className="pagination-meta">
        {from}–{to} de {total} {label}
      </p>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          Anterior
        </button>
        <span className="pagination-page" aria-current="page">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
