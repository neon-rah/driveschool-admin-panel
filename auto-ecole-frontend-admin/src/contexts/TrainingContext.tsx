// contexts/TrainingContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
    fetchActiveTrainings,
    createTraining,
    updateTraining,
    deleteTraining,
    fetchCategories,
    fetchTrainingDetails,
    fetchTrainingStudents,
    fetchTrainingCourses,
    addCourseToTraining,
    removeCourseFromTraining,
    fetchSpecificCourses,
    fetchTrainingExams,
    addExam,
    updateExam,
    removeExam,
    finishTraining,
    fetchAllGlobalFinishedTrainingResults, fetchTrainings,
} from "@/lib/api/trainingApi";
import { Training } from "@/types/training";
import { Course } from "@/types/course";
import { Exam } from "@/types/exam";

interface TrainingContextType {
    trainings: Training[];
    categories: { id: number; name: string }[];
    selectedTraining: Training | null;
    students: any[];
    courses: Course[];
    specificCourses: Course[];
    exams: Exam[];
    globalResults: {
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
    loading: boolean;
    error: string | null;
    successMessage: string | null;
    fetchAllTrainings: () => Promise<void>;
    addTraining: (data: any) => Promise<void>;
    editTraining: (id: number, data: any) => Promise<void>;
    removeTraining: (id: number) => Promise<void>;
    fetchTrainingDetailsWithRelations: (id: number) => Promise<void>;
    addCourse: (trainingId: number, courseId: number) => Promise<void>;
    removeCourse: (trainingId: number, courseId: number) => Promise<void>;
    fetchTrainingExams: (trainingId: number) => Promise<void>;
    addExam: (trainingId: number, examData: { name: string; type: string; date: string }) => Promise<void>;
    updateExam: (examId: number, examData: { name: string; type: string; date: string; training_id: number }) => Promise<void>;
    removeExam: (examId: number, trainingId: number) => Promise<void>;
    finishTraining: (trainingId: number) => Promise<void>;
    fetchAllGlobalFinishedTrainingResults: () => Promise<void>;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [specificCourses, setSpecificCourses] = useState<Course[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [globalResults, setGlobalResults] = useState<
        {
            training_id: number;
            training_title: string;
            student_id: number;
            first_name: string;
            last_name: string;
            email: string;
            status: string;
            results: { exam_id: number; score: number; passed: boolean }[];
            final_result: string;
        }[]
    >([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);    
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchAllTrainings = async () => {
        try {
            setLoading(true);
            // const data = await fetchActiveTrainings();
            const data = await fetchTrainings();
            setTrainings(data.trainings);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération des formations.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error("Erreur lors de la récupération des catégories :", err);
        }
    };

    const fetchAllSpecificCourses = async () => {
        try {
            const data = await fetchSpecificCourses();
            setSpecificCourses(data.courses);
        } catch (err) {
            console.error("Erreur lors de la récupération des cours spécifiques :", err);
        }
    };

    const addTraining = async (data: any) => {
        try {
            const response = await createTraining(data);
            setTrainings((prev) => [...prev, response.training]);
            setError(null);
        } catch (err: any) {
            throw err;
        }
    };

    const editTraining = async (id: number, data: any) => {
        try {
            const response = await updateTraining(id, data);
            setTrainings((prev) =>
                prev.map((training) => (training.id === id ? response.training : training))
            );
            if (selectedTraining?.id === id) setSelectedTraining(response.training);
            setError(null);
        } catch (err: any) {
            throw err;
        }
    };

    const removeTraining = async (id: number) => {
        try {
            await deleteTraining(id);
            setTrainings((prev) => prev.filter((training) => training.id !== id));
            if (selectedTraining?.id === id) setSelectedTraining(null);
            setError(null);
        } catch (err: any) {
            throw err;
        }
    };

    const fetchTrainingDetailsWithRelations = async (id: number) => {
        try {
            setLoading(true);
            const [trainingData, studentsData, coursesData, examsData] = await Promise.all([
                fetchTrainingDetails(id),
                fetchTrainingStudents(id),
                fetchTrainingCourses(id),
                fetchTrainingExams(id),
            ]);
            setSelectedTraining(trainingData.training);
            setStudents(studentsData.students);
            setCourses(coursesData.courses);
            setExams(examsData.exams);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération des détails de la formation.");
        } finally {
            setLoading(false);
        }
    };

    const addCourse = async (trainingId: number, courseId: number) => {
        try {
            const response = await addCourseToTraining(trainingId, courseId);
            setCourses((prev) => [...prev, response.course]);
            setError(null);
        } catch (err: any) {
            throw err;
        }
    };

    const removeCourse = async (trainingId: number, courseId: number) => {
        try {
            await removeCourseFromTraining(trainingId, courseId);
            setCourses((prev) => prev.filter((course) => course.id !== courseId));
            setError(null);
        } catch (err: any) {
            throw err;
        }
    };

    const fetchTrainingExamsHandler = async (trainingId: number) => {
        try {
            const data = await fetchTrainingExams(trainingId);
            setExams(data.exams);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération des examens.");
        }
    };

    const addExamHandler = async (trainingId: number, examData: { name: string; type: string; date: string }) => {
        try {
            const response = await addExam(trainingId, examData);
            setExams((prev) => [...prev, response.exam]);
            setError(null);
        } catch (err: any) {
            throw err;
        }
    };

    const updateExamHandler = async (
        examId: number,
        examData: { name: string; type: string; date: string; training_id: number }
    ) => {
        try {
            const response = await updateExam(examId, examData);
            setExams((prev) => prev.map((exam) => (exam.id === examId ? response.exam : exam)));
            setError(null);
        } catch (err: any) {
            throw err;
        }
    };

    const removeExamHandler = async (examId: number, trainingId: number) => {
        try {
            await removeExam(examId);
            setExams((prev) => prev.filter((exam) => exam.id !== examId));
            setError(null);
        } catch (err: any) {
            throw err;
        }
    };

    const finishTrainingHandler = async (trainingId: number) => {
        try {
            setLoading(true);
            // Appeler finishTraining et récupérer la réponse
            const response = await finishTraining(trainingId);

            // Mettre à jour l'état des trainings pour refléter que la formation est terminée
            setTrainings((prev) =>
                prev.map((training) =>
                    training.id === trainingId ? { ...training, is_finished: true } : training
                )
            );

            // Stocker le message de succès
            setSuccessMessage(response.message);
            setError(null);
        } catch (err: any) {
            // Stocker le message d'erreur renvoyé par le backend
            setError(err.message);
            setSuccessMessage(null);
            throw err; // Relancer l'erreur pour que le composant appelant puisse la gérer si nécessaire
        } finally {
            setLoading(false);
        }
    };

    const fetchAllGlobalFinishedTrainingResultsHandler = async () => {
        try {
            setLoading(true);
            const data = await fetchAllGlobalFinishedTrainingResults();
            setGlobalResults(data.results);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération des résultats globaux.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTrainings();
        fetchAllCategories();
        fetchAllSpecificCourses();
        fetchAllGlobalFinishedTrainingResultsHandler();
    }, []);

    return (
        <TrainingContext.Provider
            value={{
                trainings,
                categories,
                selectedTraining,
                students,
                courses,
                specificCourses,
                exams,
                globalResults,
                loading,
                error,
                successMessage,
                fetchAllTrainings,
                addTraining,
                editTraining,
                removeTraining,
                fetchTrainingDetailsWithRelations,
                addCourse,
                removeCourse,
                fetchTrainingExams: fetchTrainingExamsHandler,
                addExam: addExamHandler,
                updateExam: updateExamHandler,
                removeExam: removeExamHandler,
                finishTraining: finishTrainingHandler,
                fetchAllGlobalFinishedTrainingResults: fetchAllGlobalFinishedTrainingResultsHandler,
            }}
        >
            {children}
        </TrainingContext.Provider>
    );
};

export const useTraining = (): TrainingContextType => {
    const context = useContext(TrainingContext);
    if (!context) throw new Error("useTraining must be used within a TrainingProvider");
    return context;
};