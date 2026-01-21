import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

type PageItem = number | "...";

const getPages = (
  current: number,
  totalPages: number,
  maxVisible: number = 5
): PageItem[] => {
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(totalPages, current + half);

  if (end - start + 1 < maxVisible) {
    if (start === 1) end = Math.min(totalPages, start + maxVisible - 1);
    else if (end === totalPages) start = Math.max(1, end - maxVisible + 1);
  }

  const pages: PageItem[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  if (typeof pages[0] === 'number' && pages[0] > 1) pages.unshift("...");
  if ((pages[pages.length - 1] as number) < totalPages) pages.push("...");

  return pages;
};

interface PaginateProps {
  current: number;               // halaman aktif
  total: number;                 // total data
  pageSize: number;              // jumlah per halaman
  onPageChange: (page: number) => void; // callback
}

const Paginate: React.FC<PaginateProps> = ({
  current,
  total,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === current) return;
    onPageChange(page);
  };

  return (
    <div className="flex items-center justify-end gap-2 mt-6">
      <button
        onClick={() => goToPage(current - 1)}
        disabled={current === 1}
        className="px-2 py-2 rounded bg-gray-200 text-sm disabled:opacity-50"
      >
        Prev
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => goToPage(page)}
            disabled={page === current}
            className={`px-3 py-2 rounded text-sm ${
              page === current
                ? "bg-blue-600 text-white cursor-default opacity-70"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => goToPage(current + 1)}
        disabled={current === totalPages}
        className="px-2 py-2 rounded bg-gray-200 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Paginate;
