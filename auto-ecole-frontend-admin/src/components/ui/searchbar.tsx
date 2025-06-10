// /app/components/ui/searchbar.tsx
"use client";

import { useEffect, useState } from "react";
import { BiSearch, BiX } from "react-icons/bi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
    className?: string;
    placeholder?: string;
    size?: "default" | "sm" | "lg" | "full";
    radius?: "default" | "sm" | "lg" | "full";
    value?: string;
    onSearch?: (query: string) => void;
    setValue?: (value: string) => void;
    variant?: "outline" | "ghost" | "secondary" | "destructive" | "default" | "link";
    block?: boolean;
}

export default function SearchBar({
                                      className = "",
                                      placeholder = "Search something...",
                                      size = "default",
                                      radius = "default",
                                      value = "",
                                      onSearch = () => {
                                          console.log("[SearchBar] Default onSearch called");
                                      },
                                      setValue = () => {
                                          console.log("[SearchBar] Default setValue called");
                                      },
                                      variant = "outline",
                                      block = false,
                                  }: SearchBarProps) {
    const [query, setQuery] = useState(value);

    useEffect(() => {
        console.log("[SearchBar] Value prop updated to:", value);
        setQuery(value);
    }, [value]);

    const handleSearch = () => {
        console.log("[SearchBar] handleSearch triggered with query:", query);
        if (query.trim()) {
            console.log("[SearchBar] Calling onSearch with query:", query);
            onSearch(query);
        } else {
            console.log("[SearchBar] Query is empty, no search triggered");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("[SearchBar] Input changed to:", e.target.value);
        setQuery(e.target.value);
        setValue(e.target.value);
    };

    return (
        <div
            className={`flex items-center border border-primary rounded-${radius} overflow-hidden bg-black-10 dark:bg-black-90 
        ${block ? "w-full" : "max-w-md"} ${className}`}
        >
            <Button
                variant={variant}
                size="icon"
                onClick={() => {
                    console.log("[SearchBar] Search button clicked");
                    handleSearch();
                }}
                className="text-primary hover:text-primary-dark"
            >
                <BiSearch className="w-5 h-5" />
            </Button>
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleChange}
                onKeyDown={(e) => {
                    console.log("[SearchBar] Key pressed:", e.key);
                    if (e.key === "Escape") {
                        console.log("[SearchBar] Escape pressed, clearing query");
                        setQuery("");
                        setValue("");
                        onSearch("");
                    } else if (e.key === "Enter") {
                        console.log("[SearchBar] Enter pressed, triggering search");
                        handleSearch();
                    }
                }}
                className="flex-1 border-none bg-transparent text-black-80 placeholder:text-black-60 dark:text-white-80 dark:placeholder:text-white-60 focus:outline-none h-[30px] m-0 p-0 ring-0 focus:ring-0"
            />
            {query && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        console.log("[SearchBar] Clear button clicked");
                        setQuery("");
                        setValue("");
                        onSearch("");
                    }}
                    className="text-gray-500 hover:text-red-500"
                >
                    <BiX className="w-5 h-5" />
                </Button>
            )}
        </div>
    );
}