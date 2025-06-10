"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { fetchTrainingStudents } from "@/lib/api/trainingApi";
import { ExamProvider, useExam } from "@/contexts/ExamContext";
import DataTable from "@/components/tables/datatable";
import Input from "@/components/custom-ui/input";
import Toast from "@/components/custom-ui/Toast";
import debounce from "lodash/debounce";

const ExamResultsPage: React.FC<{ params: { examId: string }; searchParams: { trainingId: string } }> = ({
                                                                                                             params,
                                                                                                             searchParams,
                                                                                                         }) => {
    const examId = parseInt(params.examId);
    const trainingId = parseInt(searchParams.trainingId);

    return (
        <ExamProvider examId={examId}>
            <ExamResultsContent examId={examId} trainingId={trainingId} />
        </ExamProvider>
    );
};

const ExamResultsContent: React.FC<{ examId: number; trainingId: number }> = ({ examId, trainingId }) => {
    const { results, loading: resultsLoading, saveResult } = useExam();
    const [students, setStudents] = useState<any[]>([]);
    const [localResults, setLocalResults] = useState<{ [key: number]: number | null }>({});
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const data = await fetchTrainingStudents(trainingId);
                setStudents(data.students);

                // Initialiser les résultats locaux avec les données du serveur
                const initialResults = results.reduce((acc, r) => {
                    acc[r.student_id] = r.score;
                    return acc;
                }, {} as { [key: number]: number | null });
                setLocalResults((prev) => ({ ...prev, ...initialResults }));

                // Charger les données non sauvegardées depuis localStorage
                const localData = JSON.parse(localStorage.getItem(`exam_${examId}_results`) || "{}");
                setLocalResults((prev) => ({ ...prev, ...localData }));
            } catch (err: any) {
                setToast({ message: err.message || "Erreur lors du chargement", type: "error" });
            }
        };
        loadStudents();
    }, [trainingId, results]);

    const saveResultDebounced = debounce(async (studentId: number, score: string) => {
        const scoreNum = parseFloat(score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) {
            setToast({ message: "Note invalide (0-20)", type: "error" });
            return;
        }

        try {
            await saveResult(examId, studentId, scoreNum);
            setToast({ message: "Note enregistrée", type: "success" });
            const localData = JSON.parse(localStorage.getItem(`exam_${examId}_results`) || "{}");
            delete localData[studentId];
            localStorage.setItem(`exam_${examId}_results`, JSON.stringify(localData));
        } catch (err: any) {
            setToast({ message: err.message || "Erreur lors de l’enregistrement", type: "error" });
        }
    }, 500);

    const handleScoreChange = (studentId: number, score: string) => {
        const scoreNum = score ? parseFloat(score) : null;
        setLocalResults((prev) => ({ ...prev, [studentId]: scoreNum }));

        const localData = JSON.parse(localStorage.getItem(`exam_${examId}_results`) || "{}");
        localData[studentId] = scoreNum;
        localStorage.setItem(`exam_${examId}_results`, JSON.stringify(localData));

        if (score) saveResultDebounced(studentId, score);
    };

    const columns: ColumnDef<any>[] = [
        { header: "ID", id: "id", cell: ({ row }) => row.original.id },
        { header: "Nom", id: "last_name", cell: ({ row }) => row.original.last_name },
        { header: "Prénom", id: "first_name", cell: ({ row }) => row.original.first_name },
        {
            header: "Note",
            id: "score",
            cell: ({ row }) => (
                <Input
                    type="number"
                    value={localResults[row.original.id] ?? ""}
                    onChange={(e) => handleScoreChange(row.original.id, e.target.value)}
                    placeholder="0-20"
                    min={'0'}
                    max={'20'}
                    className="w-20"
                />
            ),
        },
        {
            header: "Statut",
            id: "passed",
            cell: ({ row }) => {
                const score = localResults[row.original.id];
                if (score === null || score === undefined) return "-";
                const passed = score >= 10; // Seuil local de 10/20
                return (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                    >
                        {passed ? "Réussi" : "Échoué"}
                    </span>
                );
            },
        },
    ];

    if (resultsLoading) return <div className="p-6">Chargement...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Résultats de l’examen #{examId}</h1>
            <DataTable columns={columns} data={students} />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default ExamResultsPage;