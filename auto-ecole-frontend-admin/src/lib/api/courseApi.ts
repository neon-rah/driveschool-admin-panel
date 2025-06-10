import axios from "axios";
import { Course } from "@/types/course";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

// Récupérer tous les cours
export const fetchCourses = () =>
    api.get<{ courses: Course[] }>("/courses").then((res) => res.data);

// Créer un cours
export const createCourse = (formData: FormData) =>
    api.post<{ course: Course; message: string }>("/courses", formData).then((res) => res.data).catch((err) => {
        throw err.response?.data || { message: "Erreur inconnue lors de la création" };
    });

// Mettre à jour un cours
export const updateCourse = (id: number, formData: FormData) =>
    api.post<{ course: Course; message: string }>(`/courses/${id}?_method=PUT`, formData).then((res) => res.data).catch((err) => {
        throw err.response?.data || { message: "Erreur inconnue lors de la mise à jour" };
    });

// Supprimer un cours
export const deleteCourse = (id: number) =>
    api.delete<{ message: string }>(`/courses/${id}`).then((res) => res.data).catch((err) => {
        throw err.response?.data || { message: "Erreur inconnue lors de la suppression" };
    });