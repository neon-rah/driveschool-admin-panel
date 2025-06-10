// pages/trainings/global-finished-results.tsx
"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TrainingProvider, useTraining } from "@/contexts/TrainingContext";
import DataTable from "@/components/tables/datatable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const AllGlobalFinishedTrainingResultsPage: React.FC = () => {
    return (
        <TrainingProvider>
            <AllGlobalFinishedTrainingResultsContent />
        </TrainingProvider>
    );
};

const AllGlobalFinishedTrainingResultsContent: React.FC = () => {
    const { globalResults, loading } = useTraining();

    const columns = React.useMemo<ColumnDef<any>[]>(
        () => [
            {
                header: "ID Formation",
                accessorKey: "training_id",
                cell: ({ row }) => row.original.training_id,
            },
            {
                header: "Titre Formation",
                accessorKey: "training_title",
                cell: ({ row }) => row.original.training_title,
            },
            {
                header: "ID Étudiant",
                accessorKey: "student_id",
                cell: ({ row }) => row.original.student_id,
            },
            {
                header: "Nom",
                accessorKey: "last_name",
                cell: ({ row }) => row.original.last_name,
            },
            {
                header: "Prénom",
                accessorKey: "first_name",
                cell: ({ row }) => row.original.first_name,
            },
            {
                header: "Email",
                accessorKey: "email",
                cell: ({ row }) => row.original.email,
            },
            {
                header: "Statut",
                accessorKey: "status",
                cell: ({ row }) => row.original.status,
            },
            {
                header: "Résultats des examens",
                id: "exam_results",
                cell: ({ row }) => (
                    <ul>
                        {row.original.results.map((result: any) => (
                            <li key={result.exam_id}>
                                Examen #{result.exam_id}: {result.score} - {result.passed ? "Réussi" : "Échoué"}
                            </li>
                        ))}
                    </ul>
                ),
            },
            {
                header: "Résultat final",
                accessorKey: "final_result",
                cell: ({ row }) => (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            row.original.final_result === "Réussi"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {row.original.final_result}
                    </span>
                ),
            },
        ],
        []
    );

    if (loading) return <div className="p-6">Chargement...</div>;

    return (
        <>
            <PageBreadcrumb pageTitle="Resultat global"/>
            <div className="p-6 max-w-7xl mx-auto">
                
                {globalResults.length > 0 ? (
                    <DataTable
                        columns={columns}
                        data={globalResults}
                        initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
                    />
                ) : (
                    <p className="text-gray-500">Aucune formation terminée trouvée.</p>
                )}
            </div>
        </>
    );
};

export default AllGlobalFinishedTrainingResultsPage;    