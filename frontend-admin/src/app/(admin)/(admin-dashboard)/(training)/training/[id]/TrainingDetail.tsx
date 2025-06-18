"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { FaEye, FaTrash, FaPlus, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import DataTable from "@/components/tables/datatable";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Toast from "@/components/custom-ui/Toast";
import ConfirmModal from "@/components/custom-ui/ConfirmModal";
import Select from "@/components/form/Select";
import Input from "@/components/custom-ui/input";
import { useTraining } from "@/contexts/TrainingContext";
import { PiExamFill } from "react-icons/pi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TrainingDetail: React.FC<{ trainingId: number }> = ({ trainingId }) => {
    const {
        selectedTraining,
        students,
        courses,
        specificCourses,
        exams,
        loading,
        error: contextError,
        successMessage,
        fetchTrainingDetailsWithRelations,
        addCourse,
        removeCourse,
        addExam,
        updateExam,
        removeExam,
        finishTraining,
    } = useTraining();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
    const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
    const [newCourseId, setNewCourseId] = useState<string>("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [examForm, setExamForm] = useState({
        name: "",
        type: "",
        date: "",
    });
    const [examValidation, setExamValidation] = useState({
        name: false,
        type: false,
        date: false,
    });

    const router = useRouter();

    useEffect(() => {
        if (trainingId) {
            fetchTrainingDetailsWithRelations(trainingId);
        }
    }, [trainingId]);

    // Gérer les messages du contexte avec Toast
    useEffect(() => {
        if (successMessage) {
            setToast({ message: successMessage, type: "success" });
        }
        if (contextError) {
            setToast({ message: contextError, type: "error" });
        }
    }, [successMessage, contextError]);

    const handleFinishTraining = async () => {
        try {
            await finishTraining(trainingId);
        } catch (err: any) {
            // L'erreur est gérée par le contexte et affichée via Toast
        }
    };

    const studentColumns: ColumnDef<any>[] = [
        { header: "ID", id: "id", cell: ({ row }) => row.original.id },
        {
            header: "Photo",
            id: "profile_picture",
            cell: ({ row }) => {
                const value = row.original.profile_picture;
                return value ? (
                    <Image
                        src={`${API_URL}/storage/${value}`}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full w-10 h-10 object-fit"
                    />
                ) : (
                    <span>-</span>
                );
            },
        },
        { header: "Nom", id: "last_name", cell: ({ row }) => row.original.last_name },
        { header: "Prénom", id: "first_name", cell: ({ row }) => row.original.first_name },
        { header: "Email", id: "email", cell: ({ row }) => row.original.email },
        { header: "Téléphone", id: "phone", cell: ({ row }) => row.original.phone },
    ];

    const courseColumns: ColumnDef<any>[] = [
        { header: "ID", id: "id", cell: ({ row }) => row.original.id },
        { header: "Nom", id: "name", cell: ({ row }) => row.original.name },
        { header: "Type", id: "type", cell: ({ row }) => row.original.type },
        {
            header: "Fichier",
            id: "file_path",
            cell: ({ row }) => (
                <a
                    href={`${API_URL}/storage/${row.original.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    Voir PDF
                </a>
            ),
        },
    ];

    const examColumns: ColumnDef<any>[] = [
        { header: "ID", id: "id", cell: ({ row }) => row.original.id },
        { header: "Nom", id: "name", cell: ({ row }) => row.original.name },
        { header: "Type", id: "type", cell: ({ row }) => row.original.type },
        { header: "Date", id: "date", cell: ({ row }) => row.original.date || "Non défini" },
    ];

    const courseActions = [
        {
            icon: <FaEye className="text-blue-500 hover:text-blue-700" />,
            onClick: (row: any) => window.open(`${API_URL}/storage/${row.file_path}`, "_blank"),
            tooltip: "Voir le PDF",
        },
        {
            icon: <FaTrash className="text-red-500 hover:text-red-700" />,
            onClick: (row: any) => {
                setSelectedCourseId(row.id);
                setIsConfirmModalOpen(true);
            },
            tooltip: "Retirer le cours",
        },
    ];

    const examActions = [
        {
            icon: <FaEye className="text-blue-500 hover:text-blue-700" />,
            onClick: (row: any) => router.push(`/exam-results/${row.id}?trainingId=${trainingId}`),
            tooltip: "Voir les résultats",
        },
        {
            icon: <FaEdit className="text-yellow-500 hover:text-yellow-700" />,
            onClick: (row: any) => {
                setSelectedExamId(row.id);
                setExamForm({
                    name: row.name,
                    type: row.type,
                    date: row.date || "",
                });
                setExamValidation({
                    name: true,
                    type: true,
                    date: !!row.date,
                });
                setIsEditExamModalOpen(true);
            },
            tooltip: "Modifier l'examen",
        },
        {
            icon: <FaTrash className="text-red-500 hover:text-red-700" />,
            onClick: (row: any) => {
                setSelectedExamId(row.id);
                setIsConfirmModalOpen(true);
            },
            tooltip: "Supprimer l'examen",
        },
    ];

    const handleAddCourse = async () => {
        if (!newCourseId) {
            setToast({ message: "Veuillez sélectionner un cours", type: "error" });
            return;
        }
        try {
            await addCourse(trainingId, parseInt(newCourseId));
            setToast({ message: "Cours ajouté avec succès", type: "success" });
            setIsAddModalOpen(false);
            setNewCourseId("");
        } catch (err: any) {
            setToast({ message: err.message || "Erreur lors de l’ajout", type: "error" });
        }
    };

    const handleRemoveCourse = async () => {
        if (!selectedCourseId || !selectedTraining) return;
        try {
            await removeCourse(selectedTraining.id, selectedCourseId);
            setToast({ message: "Cours retiré avec succès", type: "success" });
            setIsConfirmModalOpen(false);
            setSelectedCourseId(null);
        } catch (err: any) {
            setToast({ message: err.message || "Erreur lors de la suppression", type: "error" });
        }
    };

    const handleAddExam = async () => {
        if (!Object.values(examValidation).every(Boolean)) {
            setToast({ message: "Veuillez remplir tous les champs correctement", type: "error" });
            return;
        }
        try {
            await addExam(trainingId, examForm);
            setToast({ message: "Examen ajouté avec succès", type: "success" });
            setIsAddExamModalOpen(false);
            resetExamForm();
        } catch (err: any) {
            setToast({ message: err.message || "Erreur lors de l’ajout", type: "error" });
        }
    };

    const handleEditExam = async () => {
        if (!selectedExamId || !Object.values(examValidation).every(Boolean)) {
            setToast({ message: "Veuillez remplir tous les champs correctement", type: "error" });
            return;
        }
        try {
            await updateExam(selectedExamId, { ...examForm, training_id: trainingId });
            setToast({ message: "Examen modifié avec succès", type: "success" });
            setIsEditExamModalOpen(false);
            resetExamForm();
        } catch (err: any) {
            setToast({ message: err.message || "Erreur lors de la modification", type: "error" });
        }
    };

    const handleRemoveExam = async () => {
        if (!selectedExamId) return;
        try {
            await removeExam(selectedExamId, trainingId);
            setToast({ message: "Examen supprimé avec succès", type: "success" });
            setIsConfirmModalOpen(false);
            setSelectedExamId(null);
        } catch (err: any) {
            setToast({ message: err.message || "Erreur lors de la suppression", type: "error" });
        }
    };

    const resetExamForm = () => {
        setExamForm({ name: "", type: "", date: "" });
        setExamValidation({ name: false, type: false, date: false });
        setSelectedExamId(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white text-center">
                {selectedTraining?.title || "Chargement..."}
            </h1>

            <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex flex-wrap items-center gap-8">
                    {selectedTraining?.covering && (
                        <div className="relative w-full md:w-1/3">
                            <Image
                                src={`${API_URL}/storage/${selectedTraining.covering}`}
                                alt="Image de couverture"
                                width={400}
                                height={250}
                                className="rounded-lg w-[400px] h-[250px] object-fit shadow-md"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent rounded-lg"></div>
                        </div>
                    )}
                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">Description</Label>
                                <p className="text-gray-600 dark:text-gray-400">{selectedTraining?.description || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">Catégorie</Label>
                                <p className="text-gray-600 dark:text-gray-400">{selectedTraining?.category?.name || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">Date de début</Label>
                                <p className="text-gray-600 dark:text-gray-400">{selectedTraining?.start_date || "-"}</p>
                            </div>
                            <div>
                                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">Durée</Label>
                                <p className="text-gray-600 dark:text-gray-400">{selectedTraining?.duration_weeks ? `${selectedTraining.duration_weeks} semaines` : "-"}</p>
                            </div>
                            <div>
                                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">Prix</Label>
                                <p className="text-gray-600 dark:text-gray-400">{selectedTraining?.price ? `${selectedTraining.price} Ar` : "-"}</p>
                            </div>
                            <div>
                                <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">Fin des inscriptions</Label>
                                <p className="text-gray-600 dark:text-gray-400">{selectedTraining?.registration_end_date || "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Étudiants inscrits ({students.length})
                    </h2>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <DataTable columns={studentColumns} data={students} initialState={{ pagination: { pageIndex: 0, pageSize: 5 } }} />
                </div>
            </section>

            <section className="mb-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Cours associés ({courses.length})
                    </h2>
                    <Button
                        size="sm"
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                        disabled={loading}
                    >
                        <FaPlus /> Ajouter un cours
                    </Button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <DataTable columns={courseColumns} data={courses} actions={courseActions} initialState={{ pagination: { pageIndex: 0, pageSize: 5 } }} />
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Examens associés ({exams.length})
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleFinishTraining}
                            variant="outline"
                            className="bg-brand-500 hover:bg-green-600 text-green-700 flex items-center gap-2"
                            disabled={loading}
                        >
                            <PiExamFill /> Publier Résultat
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setIsAddExamModalOpen(true)}
                            className="bg-brand-500 hover:bg-green-600 text-white flex items-center gap-2"
                            disabled={loading}
                        >
                            <FaPlus /> Ajouter un examen
                        </Button>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <DataTable columns={examColumns} data={exams} actions={examActions} initialState={{ pagination: { pageIndex: 0, pageSize: 5 } }} />
                </div>
            </section>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-md p-6">
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Ajouter un cours spécifique</h4>
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium mb-1">Cours spécifique *</Label>
                        <Select
                            options={specificCourses
                                .filter((course) => !courses.some((c) => c.id === course.id))
                                .map((course) => ({ value: course.id.toString(), label: course.name }))}
                            value={newCourseId}
                            onChange={(value) => setNewCourseId(value)}
                            placeholder="Sélectionner un cours spécifique"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={handleAddCourse} disabled={!newCourseId || loading}>
                        Ajouter
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isAddExamModalOpen} onClose={() => setIsAddExamModalOpen(false)} className="max-w-md p-6">
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Ajouter un examen</h4>
                <div className="space-y-4">
                    <div>
                        <Label>Nom *</Label>
                        <Input
                            value={examForm.name}
                            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                            onValidationChange={(valid) => setExamValidation((prev) => ({ ...prev, name: valid }))}
                            placeholder="Nom de l'examen"
                            regex={/.{1,100}/}
                            errorMessage="Le nom doit contenir entre 1 et 100 caractères"
                        />
                    </div>
                    <div>
                        <Label>Type *</Label>
                        <Select
                            options={[
                                { value: "Théorique", label: "Théorique" },
                                { value: "Pratique", label: "Pratique" },
                            ]}
                            value={examForm.type}
                            onChange={(value) => {
                                setExamForm({ ...examForm, type: value });
                                setExamValidation((prev) => ({ ...prev, type: !!value }));
                            }}
                            placeholder="Sélectionner un type"
                        />
                        {!examValidation.type && <p className="text-xs text-red-500 mt-1">Le type est requis</p>}
                    </div>
                    <div>
                        <Label>Date *</Label>
                        <Input
                            type="date"
                            value={examForm.date}
                            onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                            onValidationChange={(valid) => setExamValidation((prev) => ({ ...prev, date: valid }))}
                            min={new Date().toISOString().split("T")[0]}
                            regex={/.+/}
                            errorMessage="La date doit être aujourd’hui ou après"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" size="sm" onClick={() => setIsAddExamModalOpen(false)}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={handleAddExam} disabled={!Object.values(examValidation).every(Boolean) || loading}>
                        Ajouter
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isEditExamModalOpen} onClose={() => setIsEditExamModalOpen(false)} className="max-w-md p-6">
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Modifier l’examen</h4>
                <div className="space-y-4">
                    <div>
                        <Label>Nom *</Label>
                        <Input
                            value={examForm.name}
                            onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                            onValidationChange={(valid) => setExamValidation((prev) => ({ ...prev, name: valid }))}
                            placeholder="Nom de l'examen"
                            regex={/.{1,100}/}
                            errorMessage="Le nom doit contenir entre 1 et 100 caractères"
                        />
                    </div>
                    <div>
                        <Label>Type *</Label>
                        <Select
                            options={[
                                { value: "Théorique", label: "Théorique" },
                                { value: "Pratique", label: "Pratique" },
                            ]}
                            value={examForm.type}
                            onChange={(value) => {
                                setExamForm({ ...examForm, type: value });
                                setExamValidation((prev) => ({ ...prev, type: !!value }));
                            }}
                            placeholder="Sélectionner un type"
                        />
                        {!examValidation.type && <p className="text-xs text-red-500 mt-1">Le type est requis</p>}
                    </div>
                    <div>
                        <Label>Date *</Label>
                        <Input
                            type="date"
                            value={examForm.date}
                            onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                            onValidationChange={(valid) => setExamValidation((prev) => ({ ...prev, date: valid }))}
                            min={new Date().toISOString().split("T")[0]}
                            regex={/.+/}
                            errorMessage="La date doit être aujourd’hui ou après"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" size="sm" onClick={() => setIsEditExamModalOpen(false)}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={handleEditExam} disabled={!Object.values(examValidation).every(Boolean) || loading}>
                        Sauvegarder
                    </Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={selectedCourseId ? handleRemoveCourse : handleRemoveExam}
                message={
                    selectedCourseId
                        ? "Êtes-vous sûr de vouloir retirer ce cours de la formation ?"
                        : "Êtes-vous sûr de vouloir supprimer cet examen ?"
                }
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default TrainingDetail;