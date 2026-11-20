import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import CustomLoader from "../CustomLoader";

const DataTable = ({
  columns,
  data = [],
  pagination = { pageIndex: 1, pageSize: 5 },
  setPagination,
  isPagination = true,
  totalCount = 0,
  loading = false,
  maxHeight = "500px",
  stickyActionColumn = false,

  // ✅ Optional row selection props
  isSelectable = false,
  selectedRows = [],
  setSelectedRows,
  rowIdKey = "id",
}) => {
  const isRowSelected = (rowData) =>
    selectedRows?.some((item) => item?.[rowIdKey] === rowData?.[rowIdKey]);

  const handleSelectRow = (rowData) => {
    if (!setSelectedRows) return;

    setSelectedRows((prev) => {
      const alreadySelected = prev.some(
        (item) => item?.[rowIdKey] === rowData?.[rowIdKey]
      );

      if (alreadySelected) {
        return prev.filter(
          (item) => item?.[rowIdKey] !== rowData?.[rowIdKey]
        );
      }

      return [...prev, rowData];
    });
  };

  const handleSelectAll = () => {
    if (!setSelectedRows) return;

    const allSelected = data.every((row) => isRowSelected(row));

    if (allSelected) {
      setSelectedRows((prev) =>
        prev.filter(
          (item) =>
            !data.some((row) => row?.[rowIdKey] === item?.[rowIdKey])
        )
      );
    } else {
      setSelectedRows((prev) => {
        const newRows = data.filter(
          (row) =>
            !prev.some((item) => item?.[rowIdKey] === row?.[rowIdKey])
        );

        return [...prev, ...newRows];
      });
    }
  };

  const pageSize = pagination?.pageSize || 10;
  const pageIndex = pagination?.pageIndex || 1;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    manualPagination: true,
    pageCount: totalPages,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const allCurrentPageSelected =
    data.length > 0 && data.every((row) => isRowSelected(row));

  // Range calculations for "Showing X to Y of Z entries"
  const startItem = totalCount > 0 && data.length > 0 ? (pageIndex - 1) * pageSize + 1 : 0;
  const endItem = totalCount > 0 && data.length > 0 ? Math.min(pageIndex * pageSize, totalCount) : 0;

  // Generate page numbers for professional pagination controls
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (pageIndex > 3) {
        pages.push("...");
      }

      const start = Math.max(2, pageIndex - 1);
      const end = Math.min(totalPages - 1, pageIndex + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (pageIndex < totalPages - 2) {
        pages.push("...");
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs w-full overflow-hidden">
      <div
        className="w-full overflow-x-auto overflow-y-auto"
        style={{ maxHeight }}
      >
        <Table className="min-w-[800px]">
          <TableHeader className="sticky top-0 z-10 bg-card border-b-2 border-primary">
            {table?.getHeaderGroups()?.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {isSelectable && (
                  <TableHead className="w-12 text-center">
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      onChange={handleSelectAll}
                      className="cursor-pointer"
                    />
                  </TableHead>
                )}

                {headerGroup.headers.map((header, index) => {
                  const isLastColumn = index === headerGroup.headers.length - 1;
                  const isAction =
                    header.column.id === "actions" ||
                    header.column.id === "action" ||
                    isLastColumn;
                  const isSticky = stickyActionColumn && isAction;

                  return (
                    <TableHead
                      key={header.id}
                      className={`relative text-primary font-semibold text-sm select-none ${isSticky
                        ? "sticky right-0 z-20 bg-slate-50 border-l border-slate-200/80 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)]"
                        : ""
                        }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {!isLastColumn && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          className="absolute right-0 top-2 bottom-2 w-[2px] cursor-col-resize bg-primary/30 hover:bg-primary"
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (isSelectable ? 1 : 0)}
                  className="text-center py-8"
                >
                  <CustomLoader />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (isSelectable ? 1 : 0)}
                  className="text-center py-8 text-slate-400 font-medium text-sm"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const rowData = row.original;
                const selected = isRowSelected(rowData);

                return (
                  <TableRow
                    key={row.id}
                    className={`group hover:bg-slate-50/80 transition-colors ${selected ? "bg-primary/5" : ""
                      }`}
                  >
                    {isSelectable && (
                      <TableCell className="w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleSelectRow(rowData)}
                          className="cursor-pointer"
                        />
                      </TableCell>
                    )}

                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const isLastCell =
                        cellIndex === row.getVisibleCells().length - 1;
                      const isAction =
                        cell.column.id === "actions" ||
                        cell.column.id === "action" ||
                        isLastCell;
                      const isSticky = stickyActionColumn && isAction;

                      return (
                        <TableCell
                          key={cell.id}
                          className={`py-3 text-slate-700 text-sm ${isSticky
                            ? "sticky right-0 z-10 bg-white group-hover:bg-slate-50/90 border-l border-slate-200/80 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)]"
                            : ""
                            }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {isPagination && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs sm:text-sm text-slate-600">
          {/* Left Info: Total Elements & Showing Range */}
          <div className="font-medium text-slate-600">
            Showing <span className="font-bold text-slate-900">{startItem.toLocaleString()}</span> to{" "}
            <span className="font-bold text-slate-900">{endItem.toLocaleString()}</span> of{" "}
            <span className="font-bold text-slate-900">{Number(totalCount || 0).toLocaleString()}</span> entries
          </div>

          {/* Right Controls: Rows per page & Page Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) =>
                  setPagination &&
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: Number(e.target.value),
                    pageIndex: 1,
                  }))
                }
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground shadow-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination Navigation Buttons */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setPagination && setPagination((prev) => ({ ...prev, pageIndex: 1 }))}
                disabled={pageIndex === 1 || loading}
                title="First Page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Previous Page */}
              <button
                type="button"
                onClick={() =>
                  setPagination &&
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: Math.max(1, prev.pageIndex - 1),
                  }))
                }
                disabled={pageIndex === 1 || loading}
                title="Previous Page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {pageNumbers.map((page, idx) =>
                page === "..." ? (
                  <span key={`dots-${idx}`} className="px-1 text-xs text-muted-foreground select-none">
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    type="button"
                    onClick={() =>
                      setPagination &&
                      setPagination((prev) => ({
                        ...prev,
                        pageIndex: page,
                      }))
                    }
                    disabled={loading}
                    className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2.5 text-xs transition-all cursor-pointer ${pageIndex === page
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "border border-border bg-background text-foreground font-medium hover:bg-muted"
                      }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next Page */}
              <button
                type="button"
                onClick={() =>
                  setPagination &&
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: Math.min(totalPages, prev.pageIndex + 1),
                  }))
                }
                disabled={pageIndex >= totalPages || loading}
                title="Next Page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() =>
                  setPagination &&
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: totalPages,
                  }))
                }
                disabled={pageIndex >= totalPages || loading}
                title="Last Page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;