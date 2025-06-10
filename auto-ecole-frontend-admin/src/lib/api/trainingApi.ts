// lib/api/trainingApi.ts
import axios from "axios";
import { Training } from "@/types/training";
import { Course } from "@/types/course";
import { Exam } from "@/types/exam";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: { "Content-Type": "application/json" },
});

// Récupérer les formations en cours
export const fetchTrainings = () =>
    api.get<{ trainings: Training[] }>("/trainings").then((res) => res.data);


// Récupérer toutes les catégories
export const fetchCategories = () =>
    api.get<{ id: number; name: string }[]>("/categories").then((res) => res.data);

// Créer une formation
export const createTraining = (data: FormData) =>
    api
        .post<{ training: Training; message: string }>("/trainings", data, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data)
        .catch((err) => {
            throw err.response?.data || { message: "Erreur lors de la création" };
        });

// Mettre à jour une formation
export const updateTraining = (id: number, data: FormData) =>
    api
        .post<{ training: Training; message: string }>(`/trainings/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => res.data)
        .catch((err) => {
            throw err.response?.data || { message: "Erreur lors de la mise à jour" };
        });

// Supprimer une formation
export const deleteTraining = (id: number) =>
    api.delete<{ message: string }>(`/trainings/${id}`).then((res) => res.data).catch((err) => {
        throw err.response?.data || { message: "Erreur lors de la suppression" };
    });

// Récupérer une formation spécifique
export const fetchTraining = (id: number) =>
    api.get<Training>(`/trainings/${id}`).then((res) => res.data);

// Récupérer toutes les formations en cours sans pagination
export const fetchActiveTrainings = () =>
    api.get<{ trainings: Training[] }>("/trainings/active").then((res) => res.data);

// Récupérer les détails de base d'une formation
export const fetchTrainingDetails = (id: number) =>
    api.get<{ training: Training }>("/trainings/" + id).then((res) => res.data);

// Récupérer les étudiants d'une formation
export const fetchTrainingStudents = (id: number) =>
    api.get<{ students: any[] }>("/trainings/" + id + "/students").then((res) => res.data);

// Récupérer les cours d'une formation
export const fetchTrainingCourses = (id: number) =>
    api.get<{ courses: Course[] }>("/trainings/" + id + "/courses").then((res) => res.data);

// Associer un cours à une formation
export const addCourseToTraining = (trainingId: number, courseId: number) =>
    api.post<{ message: string; course: Course }>("/trainings/" + trainingId + "/courses", { course_id: courseId })
        .then((res) => res.data)
        .catch((err) => {
            throw err.response?.data || { message: "Erreur lors de l’association du cours" };
        });

// Supprimer un cours d'une formation
export const removeCourseFromTraining = (trainingId: number, courseId: number) =>
    api.delete<{ message: string }>("/trainings/" + trainingId + "/courses/" + courseId).then((res) => res.data).catch((err) => {
        throw err.response?.data || { message: "Erreur lors de la suppression du cours" };
    });

// Récupérer tous les cours disponibles
export const fetchCourses = () =>
    api.get<{ courses: Course[] }>("/courses").then((res) => res.data);

// Récupérer tous les cours spécifiques
export const fetchSpecificCourses = () =>
    api.get<{ courses: Course[] }>("/courses/specific").then((res) => res.data);

// Récupérer les examens d'une formation
export const fetchTrainingExams = (trainingId: number) =>
    api.get<{ exams: Exam[] }>("/trainings/" + trainingId + "/exams").then((res) => res.data);

// Créer un examen
export const addExam = (trainingId: number, examData: { name: string; type: string; date: string }) =>
    api.post<{ exam: Exam; message: string }>("/exams", { ...examData, training_id: trainingId })
        .then((res) => res.data)
        .catch((err) => {
            throw err.response?.data || { message: "Erreur lors de l’ajout de l’examen" };
        });

// Mettre à jour un examen
export const updateExam = (examId: number, examData: { name: string; type: string; date: string; training_id: number }) =>
    api.put<{ exam: Exam; message: string }>("/exams/" + examId, examData)
        .then((res) => res.data)
        .catch((err) => {
            throw err.response?.data || { message: "Erreur lors de la modification de l’examen" };
        });

// Supprimer un examen
export const removeExam = (examId: number) =>
    api.delete<{ message: string }>("/exams/" + examId).then((res) => res.data).catch((err) => {
        throw err.response?.data || { message: "Erreur lors de la suppression de l’examen" };
    });

export const finishTraining = (trainingId: number) =>
    
    api
        .post<{ message: string }>("/trainings/" + trainingId + "/finish")
        .then((res) => {
            // Retourner explicitement le message en cas de succès
            return { message: res.data.message, success: true };
        })
        .catch((err) => {
            // Lancer une erreur avec le message du backend ou un message par défaut
            const errorMessage =
                err.response?.data?.message || "Erreur lors de la finalisation de la formation";
            throw new Error(errorMessage);
        });

// Récupérer les résultats globaux de toutes les formations terminées
export const fetchAllGlobalFinishedTrainingResults = () =>
    api.get<{
        message: string;
        results: {
            training_id: number;
            training_title: string;
            student_id: number;
            first_name: string;
            last_name: string;
            email: string;
            status: string;
            results: { exam_id: number; score: number; passed: boolean }[];
            final_result: string;
        }[];
    }>("/trainings/global-finished-results").then((res) => res.data);