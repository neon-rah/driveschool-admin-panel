// contexts/StatisticsContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchGlobalStatistics } from "@/lib/api/statisticsApi";

interface StatisticsContextType {
    totalStudents: number;
    completedTrainings: number;
    globalSuccessRate: number;
    monthlyRegistrations: number[];
    monthlySuccessRates: number[];
    targetSuccessRate: number;
    loading: boolean;
    error: string | null;
    fetchStatistics: () => Promise<void>;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [totalStudents, setTotalStudents] = useState<number>(0);
    const [completedTrainings, setCompletedTrainings] = useState<number>(0);
    const [globalSuccessRate, setGlobalSuccessRate] = useState<number>(0);
    const [monthlyRegistrations, setMonthlyRegistrations] = useState<number[]>([]);
    const [monthlySuccessRates, setMonthlySuccessRates] = useState<number[]>([]);
    const [targetSuccessRate, setTargetSuccessRate] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // contexts/StatisticsContext.tsx
    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const data = await fetchGlobalStatistics();
            console.log("Données récupérées de l'API :", data); // Ajouter pour déboguer
            setTotalStudents(data.total_students);
            setCompletedTrainings(data.completed_trainings);
            setGlobalSuccessRate(data.global_success_rate);
            setMonthlyRegistrations(data.monthly_registrations);
            setMonthlySuccessRates(data.monthly_success_rates);
            setTargetSuccessRate(data.target_success_rate);
            setError(null);
        } catch (err: any) {
            console.error("Erreur lors de la récupération des statistiques :", err);
            setError(err.message || "Erreur lors de la récupération des statistiques.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    return (
        <StatisticsContext.Provider
            value={{
                totalStudents,
                completedTrainings,
                globalSuccessRate,
                monthlyRegistrations,
                monthlySuccessRates,
                targetSuccessRate,
                loading,
                error,
                fetchStatistics,
            }}
        >
            {children}
        </StatisticsContext.Provider>
    );
};

export const useStatistics = (): StatisticsContextType => {
    const context = useContext(StatisticsContext);
    if (!context) throw new Error("useStatistics must be used within a StatisticsProvider");
    return context;
};