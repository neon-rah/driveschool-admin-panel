// /app/components/ui/expandable-search-bar.tsx
"use client";

import { useState } from "react";
import { BiSearch, BiX, BiFilter } from "react-icons/bi";
import SearchBar from "./searchbar";
import { Button } from "@/components/ui/button";

interface ExpandableSearchBarProps {
    className?: string;
    placeholder?: string;
    size?: "default" | "sm" | "lg" | "full";
    radius?: "default" | "sm" | "lg" | "full";
    value?: string;
    setValue?: (value: string) => void;
    onFilterClick?: () => void;
    onSearch?: (query: string) => void;
    onCancel?: () => void;
    variant?: "outline" | "ghost" | "secondary" | "destructive" | "default" | "link";
    filter?: boolean;
    block?: boolean;
    expanded?: boolean;
}

export default function ExpandableSearchBar({
                                                className = "",
                                                placeholder = "Search something...",
                                                size = "sm",
                                                radius = "full",
                                                value = "",
                                                setValue = () => {
                                                    console.log("[ExpandableSearchBar] Default setValue called");
                                                },
                                                onFilterClick = () => {
                                                    console.log("[ExpandableSearchBar] Default onFilterClick called");
                                                },
                                                onSearch = () => {
                                                    console.log("[ExpandableSearchBar] Default onSearch called");
                                                },
                                                onCancel = () => {
                                                    console.log("[ExpandableSearchBar] Default onCancel called");
                                                },
                                                variant = "ghost",
                                                filter = false,
                                                block = true,
                                                expanded = false,
                                            }: ExpandableSearchBarProps) {
    const [isExpanded, setIsExpanded] = useState(expanded);

    console.log("[ExpandableSearchBar] Rendered with value:", value, "isExpanded:", isExpanded);

    return (
        <div className={`flex items-center m-0 gap-1 overflow-hidden ${className}`}>
            {!isExpanded ? (
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => {
                        console.log("[ExpandableSearchBar] Expand button clicked");
                        setIsExpanded(true);
                    }}
                >
                    <BiSearch className="w-5 h-5" />
                </Button>
            ) : (
                <>
                    <SearchBar
                        radius={radius}
                        block={block}
                        placeholder={placeholder}
                        setValue={setValue}
                        size={size}
                        variant={variant}
                        value={value}
                        onSearch={(query) => {
                            console.log("[ExpandableSearchBar] onSearch triggered with query:", query);
                            onSearch(query);
                        }}
                    />
                    {filter && (
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => {
                                console.log("[ExpandableSearchBar] Filter button clicked");
                                onFilterClick();
                            }}
                        >
                            <BiFilter className="w-5 h-5" />
                        </Button>
                    )}
                    <Button
                        variant="default"
                        className={"rounded-full w-6 h-6 bg-red-500 hover:bg-red-600"}
                        size="icon"
                        onClick={() => {
                            console.log("[ExpandableSearchBar] Clear button clicked");
                            setValue("");
                            setIsExpanded(false);
                            onCancel(); // Appelle onCancel pour réinitialiser
                        }}
                    >
                        <BiX className="text-white hover:text-red-500" />
                    </Button>
                </>
            )}
        </div>
    );
}