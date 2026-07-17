import { useMemo, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 10;

export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  function goTo(next: number) {
    setPage(Math.min(totalPages, Math.max(1, next)));
  }

  function reset() {
    setPage(1);
  }

  return {
    page: currentPage,
    pageSize,
    total,
    totalPages,
    pageItems,
    from,
    to,
    goTo,
    reset,
    setPage,
  };
}
