"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { fetchTrainingStudents } from "@/lib/api/trainingApi";
import { ExamProvider, useExam } from "@/contexts/ExamContext";
import DataTable from "@/components/tables/datatable";
import Toast from "@/components/custom-ui/Toast";

interface ExamResultsPageProps {
    params: Promise<{ examId: string }>; // params est une Promise
    searchParams: Promise<{ trainingId: string }>; // searchParams est une Promise
}

const ExamResultsPage: React.FC<ExamResultsPageProps> = ({ params, searchParams }) => {
    // Déballer params et searchParams avec React.use()
    const resolvedParams = React.use(params);
    const resolvedSearchParams = React.use(searchParams);

    const examId = parseInt(resolvedParams.examId);
    const trainingId = parseInt(resolvedSearchParams.trainingId);

    return (
        <ExamProvider examId={examId}>
            <ExamResultsContent examId={examId} trainingId={trainingId} />
        </ExamProvider>
    );
};

// Composant dédié pour gérer l’input de la note
const ScoreInput: React.FC<{
    studentId: number;
    initialValue: number | null;
    examId: number;
    saveResult: (examId: number, studentId: number, score: number) => Promise<void>;
    updateLocalResult: (studentId: number, score: number | null) => void;
    setToast: (toast: { message: string; type: "success" | "error" } | null) => void;
}> = ({ studentId, initialValue, examId, saveResult, updateLocalResult, setToast }) => {
    const [inputValue, setInputValue] = useState<string>(initialValue !== null ? String(initialValue) : "");
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            setInputValue(initialValue !== null ? String(initialValue) : "");
            isMounted.current = true;
        }
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleBlur = useCallback(async (e: React.FocusEvent<HTMLInputElement>) => {
        const score = e.target.value;
        const scoreNum = score ? parseFloat(score) : null;

        if (scoreNum !== null) {
            if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) {
                setToast({ message: "Note invalide (0-20)", type: "error" });
                setInputValue("");
                return;
            }

            try {
                await saveResult(examId, studentId, scoreNum);
                updateLocalResult(studentId, scoreNum);
                const localData = JSON.parse(localStorage.getItem(`exam_${examId}_results`) || "{}");
                delete localData[studentId];
                localStorage.setItem(`exam_${examId}_results`, JSON.stringify(localData));
                setToast({ message: "Note enregistrée", type: "success" });
            } catch (err: any) {
                setToast({ message: err.message || "Erreur lors de l’enregistrement", type: "error" });
                setInputValue("");
            }
        } else {
            updateLocalResult(studentId, null);
            const localData = JSON.parse(localStorage.getItem(`exam_${examId}_results`) || "{}");
            localData[studentId] = null;
            localStorage.setItem(`exam_${examId}_results`, JSON.stringify(localData));
        }
    }, [studentId, examId, saveResult, updateLocalResult, setToast]);

    return (
        <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="0-20"
            min="0"
            max="20"
            step="0.01"
            className="h-11 w-20 rounded-lg border px-4 py-2.5 text-sm"
        />
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

                const initialResults = results.reduce((acc, r) => {
                    acc[r.student_id] = r.score;
                    return acc;
                }, {} as { [key: number]: number | null });
                setLocalResults((prev) => ({ ...prev, ...initialResults }));

                const localData = JSON.parse(localStorage.getItem(`exam_${examId}_results`) || "{}");
                setLocalResults((prev) => ({ ...prev, ...localData }));
            } catch (err: any) {
                setToast({ message: err.message || "Erreur lors du chargement", type: "error" });
            }
        };
        loadStudents();
    }, [trainingId, results]);

    const updateLocalResult = useCallback((studentId: number, score: number | null) => {
        setLocalResults((prev) => ({ ...prev, [studentId]: score }));
    }, []);

    const columns = React.useMemo<ColumnDef<any>[]>(
        () => [
            { header: "ID", id: "id", cell: ({ row }) => row.original.id },
            { header: "Nom", id: "last_name", cell: ({ row }) => row.original.last_name },
            { header: "Prénom", id: "first_name", cell: ({ row }) => row.original.first_name },
            {
                header: "Note",
                id: "score",
                cell: ({ row }) => (
                    <ScoreInput
                        key={row.original.id}
                        studentId={row.original.id}
                        initialValue={localResults[row.original.id]}
                        examId={examId}
                        saveResult={saveResult}
                        updateLocalResult={updateLocalResult}
                        setToast={setToast}
                    />
                ),
            },
            {
                header: "Statut",
                id: "passed",
                cell: ({ row }) => {
                    const score = localResults[row.original.id];
                    if (score === null || score === undefined) return "-";
                    const passed = score >= 10;
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
        ],
        [examId, localResults, saveResult, updateLocalResult]
    );

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