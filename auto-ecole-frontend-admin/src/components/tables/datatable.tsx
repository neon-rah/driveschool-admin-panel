// src/components/tables/datatable.tsx
"use client";

import React, { useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    ColumnDef,
    flexRender,
} from "@tanstack/react-table";
import { FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Action {
    icon: React.ReactNode;
    onClick: (row: any) => void;
    className?: string;
    tooltip?: string;
    disabled?: (row: any) => boolean;
}

interface DataTableProps {
    columns: ColumnDef<any>[];
    data?: any[]; // Rendre data optionnel
    actions?: Action[];
    initialState?: { pagination?: { pageIndex: number; pageSize: number } };
}

const DataTable: React.FC<DataTableProps> = ({
                                                 columns,
                                                 data = [], // Valeur par défaut : tableau vide
                                                 actions = [],
                                                 initialState = { pagination: { pageIndex: 0, pageSize: 10 } },
                                             }) => {
    const pageSizeOptions = useMemo(() => [5, 10, 20, 30], []);
    const normalizedData = useMemo(() => data || [], [data]);

    const normalizedColumns = useMemo(() => {
        return columns.map((col, index) => {
            const baseCol = !col.id ? { ...col, id: `col-${index}` } : col;
            return {
                ...baseCol,
                accessorFn: (row) => {
                    if (baseCol.cell) {
                        const cellValue = baseCol.cell({ row: { original: row }, getValue: () => row[baseCol.id!] });
                        return cellValue?.toString() || "";
                    }
                    return row[baseCol.id!] || "";
                },
                enableSorting: true,
                enableGlobalFilter: true,
            };
        });
    }, [columns]);

    const enhancedColumns = useMemo(() => {
        const actionColumn: ColumnDef<any> = {
            header: "Actions",
            id: "actions",
            enableSorting: false,
            enableGlobalFilter: false,
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    {actions.map((action, idx) => {
                        const isDisabled = action.disabled ? action.disabled(row.original) : false;
                        return (
                            <button
                                key={idx}
                                onClick={() => !isDisabled && action.onClick(row.original)}
                                className={`${action.className || "p-1 rounded-full text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                title={action.tooltip}
                                disabled={isDisabled}
                            >
                                {action.icon}
                            </button>
                        );
                    })}
                </div>
            ),
        };
        return actions.length > 0 ? [...normalizedColumns, actionColumn] : normalizedColumns;
    }, [normalizedColumns, actions]);

    const table = useReactTable({
        data: normalizedData,
        columns: enhancedColumns,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: (row, columnId, filterValue) => {
            const value = row.getValue(columnId);
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        },
    });

    const { getHeaderGroups, getRowModel, setGlobalFilter, getState, setPageSize, previousPage, nextPage, getCanPreviousPage, getCanNextPage, setPageIndex, getPageCount } = table;
    const { globalFilter, pagination } = getState();
    const pageIndex = pagination.pageIndex;
    const pageSize = pagination.pageSize;

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value || "";
        setGlobalFilter(value);
    };

    return (
        <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-4">
                <div className="w-full sm:w-64">
                    <div className="relative">
                        <input
                            value={globalFilter ?? ""}
                            onChange={handleFilterChange}
                            placeholder="Rechercher..."
                            className="w-full border-0 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-gray-800 dark:hover:shadow-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700 dark:text-gray-400">
                        Entrées par page :
                    </label>
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    {getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className={`px-6 py-3 ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                        <span className="flex items-center">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                {
                                                    asc: <FaSortUp className="w-4 h-4 ml-1" />,
                                                    desc: <FaSortDown className="w-4 h-4 ml-1" />,
                                                    false: <FaSort className="w-4 h-4 ml-1 opacity-50" />,
                                                }[header.column.getIsSorted() as string] ?? <FaSort className="w-4 h-4 ml-1 opacity-50" />
                                            )}
                                        </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {getRowModel().rows.length > 0 ? (
                        getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-6 py-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={enhancedColumns.length} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                Aucune donnée trouvée
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mt-4">
                <div className="text-sm text-gray-700 dark:text-gray-400">
                    Affichage de {pageIndex * pageSize + 1} à{" "}
                    {Math.min((pageIndex + 1) * pageSize, normalizedData.length)} sur {normalizedData.length}{" "}
                    entrées
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => previousPage()}
                        disabled={!getCanPreviousPage()}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                        <FaChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: getPageCount() }, (_, idx) => idx).map((pageIdx) => (
                        <button
                            key={pageIdx}
                            onClick={() => setPageIndex(pageIdx)}
                            className={`border border-gray-200 rounded-lg px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 ${
                                pageIndex === pageIdx
                                    ? "bg-emerald-500 text-white"
                                    : "text-gray-700 dark:text-gray-400"
                            }`}
                        >
                            {pageIdx + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => nextPage()}
                        disabled={!getCanNextPage()}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                        <FaChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;