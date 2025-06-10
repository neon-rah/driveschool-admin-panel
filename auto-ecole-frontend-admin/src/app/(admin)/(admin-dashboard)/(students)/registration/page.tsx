"use client";

import React, { useState, useEffect } from "react";
import { useStudent } from "@/contexts/StudentContext";
import { ColumnDef } from "@tanstack/react-table"; // Changement ici
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import DataTable from "@/components/tables/datatable"; // Votre nouveau DataTable
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import Toast from "@/components/custom-ui/Toast";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const PendingStudents: React.FC = () => {
    const { pendingStudents, fetchPendingStudents, approveStudent, rejectStudent } = useStudent();
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        fetchPendingStudents();
    }, [fetchPendingStudents]);

    // Colonnes adaptées pour TanStack Table v8
    const columns: ColumnDef<any>[] = [
        { header: "ID", id: "id", cell: ({ row }) => row.original.id },
        { header: "Nom", id: "last_name", cell: ({ row }) => row.original.last_name },
        { header: "Prénom", id: "first_name", cell: ({ row }) => row.original.first_name || "" },
        { header: "Email", id: "email", cell: ({ row }) => row.original.email || "" },
        { header: "Formation ID", id: "training.id", cell: ({ row }) => row.original.training?.id || "" },
        { header: "Formation", id: "training.title", cell: ({ row }) => row.original.training?.title || "" },
    ];

    // Actions compatibles avec le nouveau DataTable
    const actions = [
        {
            icon: <FaEye className="text-blue-500 hover:text-blue-700" />,
            onClick: (row: any) => handleView(row),
            tooltip: "Voir",
        },
        {
            icon: <FaCheck className="text-green-500 hover:text-green-700" />,
            onClick: (row: any) => handleApprove(row),
            tooltip: "Valider",
        },
        {
            icon: <FaTimes className="text-red-500 hover:text-red-700" />,
            onClick: (row: any) => handleReject(row),
            tooltip: "Rejeter",
        },
    ];

    const handleView = (row: any) => {
        setSelectedStudent(row);
        setIsViewModalOpen(true);
    };

    const handleApprove = async (row: any) => {
        try {
            await approveStudent(row.id);
            setToast({ message: "Étudiant validé avec succès", type: "success" });
        } catch (error: any) {
            setToast({ message: error.message || "Erreur lors de la validation", type: "error" });
        }
    };

    const handleReject = (row: any) => {
        setSelectedStudent(row);
        setIsRejectModalOpen(true);
    };

    const confirmReject = async () => {
        if (!selectedStudent) return;
        try {
            await rejectStudent(selectedStudent.id, rejectReason);
            setToast({ message: "Étudiant rejeté avec succès", type: "success" });
            setIsRejectModalOpen(false);
            setRejectReason("");
            setSelectedStudent(null);
        } catch (error: any) {
            setToast({ message: error.message || "Erreur lors du rejet", type: "error" });
        }
    };

    return (
        <>
        <PageBreadcrumb pageTitle="Liste d'attente" />
        <div className="p-6">
            {/*<h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Étudiants en attente</h2>*/}
            <DataTable
                columns={columns}
                data={pendingStudents}
                actions={actions}
                initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
            />

            {/* Modal Voir */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} className="max-w-2xl p-6">
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Détails de l’étudiant</h4>
                {selectedStudent && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>ID :</strong> {selectedStudent.id}</p>
                        <p><strong>Nom :</strong> {selectedStudent.last_name}</p>
                        <p><strong>Prénom :</strong> {selectedStudent.first_name || ""}</p>
                        <p><strong>Email :</strong> {selectedStudent.email || ""}</p>
                        <p><strong>Téléphone :</strong> {selectedStudent.phone || ""}</p>
                        <p><strong>Formation :</strong> {selectedStudent.training?.title || ""}</p>
                        {selectedStudent.profile_picture && (
                            <div>
                                <strong>Photo de profil :</strong>
                                <Image
                                    src={`${API_URL}/storage/${selectedStudent.profile_picture}`}
                                    alt="Photo de profil"
                                    width={128}
                                    height={128}
                                    className="object-cover rounded"
                                />
                            </div>
                        )}
                        {selectedStudent.residence_certificate && (
                            <div>
                                <strong>Certificat de résidence :</strong>
                                <Image
                                    src={`${API_URL}/storage/${selectedStudent.residence_certificate}`}
                                    alt="Certificat de résidence"
                                    width={128}
                                    height={128}
                                    className="object-cover rounded"
                                />
                            </div>
                        )}
                        {selectedStudent.payment_receipt && (
                            <div>
                                <strong>Reçu de paiement :</strong>
                                <Image
                                    src={`${API_URL}/storage/${selectedStudent.payment_receipt}`}
                                    alt="Reçu de paiement"
                                    width={128}
                                    height={128}
                                    className="object-cover rounded"
                                />
                            </div>
                        )}
                    </div>
                )}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={() => setIsViewModalOpen(false)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Fermer
                    </button>
                </div>
            </Modal>

            {/* Modal Rejet */}
            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} className="max-w-md p-6">
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Confirmer le rejet</h4>
                <p>Rejeter {selectedStudent?.first_name} {selectedStudent?.last_name} ?</p>
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Raison du rejet"
                    className="w-full p-2 border rounded mt-2"
                />
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setIsRejectModalOpen(false)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={confirmReject}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Confirmer
                    </button>
                </div>
            </Modal>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
        </>
    );
};

export default PendingStudents;