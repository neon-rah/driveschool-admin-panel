"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchExamResults, saveExamResult } from "@/lib/api/examApi";
import { Result } from "@/types/result";

interface ExamContextType {
    results: Result[];
    loading: boolean;
    error: string | null;
    fetchResults: (examId: number) => Promise<void>;
    saveResult: (examId: number, studentId: number, score: number) => Promise<void>;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode; examId: number }> = ({ children, examId }) => {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchResults = async (examId: number) => {
        try {
            setLoading(true);
            const data = await fetchExamResults(examId);
            setResults(data.results);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors du chargement des résultats");
        } finally {
            setLoading(false);
        }
    };

    const saveResult = async (examId: number, studentId: number, score: number) => {
        try {
            const response = await saveExamResult(examId, studentId, score);
            setResults((prev) =>
                prev.map((r) => (r.student_id === studentId ? { ...response.result, student: r.student } : r))
            );
            setError(null);
        } catch (err: any) {
            throw err;
        }
    };

    useEffect(() => {
        fetchResults(examId);
    }, [examId]);

    return (
        <ExamContext.Provider value={{ results, loading, error,fetchResults, saveResult }}>
            {children}
        </ExamContext.Provider>
    );
};

export const useExam = (): ExamContextType => {
    const context = useContext(ExamContext);
    if (!context) throw new Error("useExam must be used within an ExamProvider");
    return context;
};