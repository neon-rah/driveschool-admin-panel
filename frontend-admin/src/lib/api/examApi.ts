import axios from "axios";
import { Result } from "@/types/result";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: { "Content-Type": "application/json" },
});

export const fetchExamResults = (examId: number) =>
    api.get<{ results: Result[] }>(`/exams/${examId}/results`).then((res) => res.data);

export const saveExamResult = (examId: number, studentId: number, score: number) =>
    api.post<{ result: Result; message: string }>(`/exams/${examId}/results`, { student_id: studentId, score })
        .then((res) => res.data)
        .catch((err) => {
            throw err.response?.data || { message: "Erreur lors de l’enregistrement" };
        });