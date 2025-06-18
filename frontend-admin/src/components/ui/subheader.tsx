"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BiUser } from "react-icons/bi"; // Icône par défaut, modifiable

interface SubHeaderProps {
    name: string;
    icon?: ReactNode;
    sticky?: boolean;
    size?: "md" | "lg";
    rightContent?: ReactNode;
    hideLeftContent?: boolean;
}

const sizeVariants = {
    padding: {
        md: "px-6 py-4",
        lg: "px-6 py-4",
    },
    text: {
        md: "text-lead text-black-80 max-md:text-base",
        lg: "text-subtitle-3",
    },
};

export function SubHeader({
                              name,
                              icon = <BiUser className="text-icon" />, // Icône par défaut
                              sticky = false,
                              size = "md",
                              rightContent = null,
                              hideLeftContent = false,
                          }: SubHeaderProps) {
    return (
        <div
            className={cn(
                "flex py-3 px-3 select-none gap-10 max-md:gap-2 w-full justify-between items-center z-30 rounded-sm shadow-sm shadow-gray-700  bg-white dark:shadow-gray-800  dark:border-neutral-800 dark:bg-secondary-d dark:backdrop-blur-sm",
                sticky && "sticky top-0"
            )}
        >
            {!hideLeftContent && (
                <div
                    className={cn(
                        "flex items-center gap-2 text-primary-dark font-bold text-nowrap dark:text-white",
                        sizeVariants.text[size]
                    )}
                >
                    {icon} {/* Affiche une icône React au lieu d'une className */}
                    <span className="text-primary dark:text-primary-dark">{name}</span>
                </div>
            )}
            {rightContent && <div className="w-full flex justify-end">{rightContent}</div>}
        </div>
    );
}
