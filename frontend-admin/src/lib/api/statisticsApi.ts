// lib/api/statisticsApi.ts
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: { "Content-Type": "application/json" },
});

// Récupérer les statistiques globales
export const fetchGlobalStatistics = () =>
    api.get<{
        total_students: number;
        completed_trainings: number;
        global_success_rate: number;
        monthly_registrations: number[];
        monthly_success_rates: number[];
        target_success_rate: number;
    }>("/statistics/global").then((res) => res.data);