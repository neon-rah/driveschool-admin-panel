"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchCourses, createCourse, updateCourse, deleteCourse } from "@/lib/api/courseApi";
import { Course } from "@/types/course";

interface CourseContextType {
    courses: Course[];
    loading: boolean;
    error: string | null;
    fetchAllCourses: () => Promise<void>;
    addCourse: (formData: FormData) => Promise<void>;
    editCourse: (id: number, formData: FormData) => Promise<void>;
    removeCourse: (id: number) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Récupérer tous les cours au montage
    const fetchAllCourses = async () => {
        try {
            setLoading(true);
            const data = await fetchCourses();
            setCourses(data.courses);
            setError(null);
        } catch (err) {
            setError("Erreur lors de la récupération des cours.");
        } finally {
            setLoading(false);
        }
    };

    // Ajouter un cours
    const addCourse = async (formData: FormData) => {
        try {
            const newCourse = await createCourse(formData);
            setCourses((prev) => [...prev, newCourse.course]);
            setError(null);
        } catch (err) {
            throw new Error("Erreur lors de la création du cours.");
        }
    };

    // Modifier un cours
    const editCourse = async (id: number, formData: FormData) => {
        try {
            const updatedCourse = await updateCourse(id, formData);
            setCourses((prev) =>
                prev.map((course) => (course.id === id ? updatedCourse.course : course))
            );
            setError(null);
        } catch (err) {
            throw new Error("Erreur lors de la mise à jour du cours.");
        }
    };

    // Supprimer un cours
    const removeCourse = async (id: number) => {
        try {
            await deleteCourse(id);
            setCourses((prev) => prev.filter((course) => course.id !== id));
            setError(null);
        } catch (err) {
            throw new Error("Erreur lors de la suppression du cours.");
        }
    };

    useEffect(() => {
        fetchAllCourses();
    }, []);

    return (
        <CourseContext.Provider
            value={{ courses, loading, error, fetchAllCourses, addCourse, editCourse, removeCourse }}
        >
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = (): CourseContextType => {
    const context = useContext(CourseContext);
    if (!context) throw new Error("useCourse must be used within a CourseProvider");
    return context;
};