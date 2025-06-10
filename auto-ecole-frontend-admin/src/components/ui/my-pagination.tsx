"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {  buttonVariants } from "@/components/ui/button";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination = ({ totalPages, currentPage, onPageChange, className }: PaginationProps) => {
    const handlePageClick = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)}>
            <ul className="flex flex-row items-center gap-1">
                {/* Bouton "Précédent" */}
                <PaginationPrevious
                    onClick={() => handlePageClick(currentPage - 1)}
                    disabled={currentPage === 1}
                />

                {/* Affichage des pages */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => handlePageClick(page)}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {/* Bouton "Suivant" */}
                <PaginationNext
                    onClick={() => handlePageClick(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
            </ul>
        </nav>
    );
};

/* --- Composants enfants de la pagination --- */

const PaginationItem = ({ children }: { children: React.ReactNode }) => (
    <li className="list-none">{children}</li>
);

const PaginationLink = ({
                            isActive,
                            className,
                            ...props
                        }: {
    isActive?: boolean;
} & React.ComponentProps<"button">) => (
    <button
        aria-current={isActive ? "page" : undefined}
        className={cn(
            buttonVariants({
                variant: isActive ? "outline" : "ghost",
                size: "icon",
            }),
            "px-3 py-2 rounded",
            className
        )}
        {...props}
    />
);

const PaginationPrevious = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "flex items-center gap-1 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800",
            disabled && "opacity-50 cursor-not-allowed"
        )}
    >
        <ChevronLeft className="h-4 w-4" />
        <span>Précédent</span>
    </button>
);

const PaginationNext = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "flex items-center gap-1 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800",
            disabled && "opacity-50 cursor-not-allowed"
        )}
    >
        <span>Suivant</span>
        <ChevronRight className="h-4 w-4" />
    </button>
);

export { Pagination };
