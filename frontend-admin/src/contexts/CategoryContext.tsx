"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {getCategories } from "@/lib/api/categoryApi";
import {Category} from "@/types/category";



interface CategoryContextType {
    categories: Category[];
    fetchCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Erreur lors de la récupération des catégories :", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <CategoryContext.Provider value={{ categories, fetchCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategory = (): CategoryContextType => {
    const context = useContext(CategoryContext);
    if (!context) throw new Error("useCategory must be used within a CategoryProvider");
    return context;
};