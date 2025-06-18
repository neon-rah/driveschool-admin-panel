"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTraining } from "@/contexts/TrainingContext";
import { ColumnDef } from "@tanstack/react-table"; // Changement ici
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import DataTable from "@/components/tables/datatable"; // Nouvelle DataTable
import { Modal } from "@/components/ui/modal";
import Input from "@/components/custom-ui/input";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import Toast from "@/components/custom-ui/Toast";
import ConfirmModal from "@/components/custom-ui/ConfirmModal";
import ImageUpload from "@/components/ui/image-upload";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TrainingManager: React.FC = () => {
    const { trainings, categories, loading, addTraining, editTraining, removeTraining } = useTraining();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedTraining, setSelectedTraining] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        duration_weeks: "",
        price: "",
        category_id: "",
        registrationEndDate: "",
        covering: null as File | null,
    });
    const [originalCovering, setOriginalCovering] = useState<string | null>(null);
    const [isValid, setIsValid] = useState({
        title: false,
        description: false,
        startDate: false,
        duration_weeks: false,
        price: false,
        category_id: false,
        registrationEndDate: false,
        covering: false,
    });

    // Colonnes adaptées pour TanStack Table v8
    const columns: ColumnDef<any>[] = [
        { header: "ID", id: "id", cell: ({ row }) => row.original.id },
        { header: "Titre", id: "title", cell: ({ row }) => row.original.title },
        {
            header: "Catégorie",
            id: "category.name",
            cell: ({ row }) => row.original.category?.name || "",
        },
        {
            header: "Date de début",
            id: "start_date",
            cell: ({ row }) => row.original.start_date,
        },
        {
            header: "Durée (semaines)",
            id: "duration_weeks",
            cell: ({ row }) => row.original.duration_weeks,
        },
        { header: "Prix (Ar)", id: "price", cell: ({ row }) => row.original.price },
    ];

    // Actions avec styles adaptés
    const actions = [
        {
            icon: <FaEye className="text-blue-500 hover:text-blue-700" />,
            onClick: (row: any) => router.push(`/training/${row.id}`),
            tooltip: "Voir les détails",
        },
        {
            icon: <FaEdit className="text-yellow-500 hover:text-yellow-700" />,
            onClick: (row: any) => {
                setSelectedTraining(row);
                setFormData({
                    title: row.title,
                    description: row.description,
                    startDate: row.start_date,
                    duration_weeks: row.duration_weeks.toString(),
                    price: row.price.toString(),
                    category_id: row.category_id.toString(),
                    registrationEndDate: row.registration_end_date,
                    covering: null,
                });
                setOriginalCovering(row.covering);
                setIsValid({
                    title: true,
                    description: true,
                    startDate: true,
                    duration_weeks: true,
                    price: true,
                    category_id: true,
                    registrationEndDate: true,
                    covering: !!row.covering,
                });
                setIsEditModalOpen(true);
            },
            tooltip: "Modifier",
        },
        {
            icon: <FaTrash className="text-red-500 hover:text-red-700" />,
            onClick: (row: any) => {
                setSelectedTraining(row);
                setIsConfirmModalOpen(true);
            },
            tooltip: "Supprimer",
        },
    ];

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            startDate: "",
            duration_weeks: "",
            price: "",
            category_id: "",
            registrationEndDate: "",
            covering: null,
        });
        setOriginalCovering(null);
        setIsValid({
            title: false,
            description: false,
            startDate: false,
            duration_weeks: false,
            price: false,
            category_id: false,
            registrationEndDate: false,
            covering: false,
        });
    };

    const handleAddTraining = async () => {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== "") {
                data.append(
                    key === "startDate"
                        ? "start_date"
                        : key === "registrationEndDate"
                            ? "registration_end_date"
                            : key,
                    value as any
                );
            }
        });

        try {
            await addTraining(data);
            setToast({ message: "Formation ajoutée avec succès", type: "success" });
            setIsAddModalOpen(false);
            resetForm();
        } catch (err: any) {
            setToast({
                message: err.errors
                    ? Object.values(err.errors).flat().join(", ")
                    : err.message || "Erreur lors de l’ajout",
                type: "error",
            });
        }
    };

    const handleEditTraining = async () => {
        if (!selectedTraining) return;

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "covering" && value === null && originalCovering) {
                return;
            }
            if (value !== null && value !== "") {
                data.append(
                    key === "startDate"
                        ? "start_date"
                        : key === "registrationEndDate"
                            ? "registration_end_date"
                            : key,
                    value as any
                );
            }
        });
        data.append("id", selectedTraining.id.toString());

        try {
            await editTraining(selectedTraining.id, data);
            setToast({ message: "Formation modifiée avec succès", type: "success" });
            setIsEditModalOpen(false);
            resetForm();
            setSelectedTraining(null);
        } catch (err: any) {
            setToast({
                message: err.errors
                    ? Object.values(err.errors).flat().join(", ")
                    : err.message || "Erreur lors de la modification",
                type: "error",
            });
        }
    };

    const handleDeleteTraining = async () => {
        if (!selectedTraining) return;
        try {
            await removeTraining(selectedTraining.id);
            setToast({ message: "Formation supprimée avec succès", type: "success" });
            setIsConfirmModalOpen(false);
            setSelectedTraining(null);
        } catch (err: any) {
            setToast({
                message: err.errors
                    ? Object.values(err.errors).flat().join(", ")
                    : err.message || "Erreur lors de la suppression",
                type: "error",
            });
        }
    };

    const today = new Date().toISOString().split("T")[0];
    const isFormValid = Object.values(isValid).every(Boolean);

    const renderFormFields = (isEditMode: boolean = false) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    onValidationChange={(valid) => setIsValid((prev) => ({ ...prev, title: valid }))}
                    placeholder="Titre"
                    regex={/.{3,}/}
                    errorMessage="Le titre doit avoir au moins 3 caractères"
                />
            </div>
            <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    onValidationChange={(valid) => setIsValid((prev) => ({ ...prev, description: valid }))}
                    placeholder="Description"
                    regex={/.{5,}/}
                    errorMessage="La description doit avoir au moins 5 caractères"
                />
            </div>
            <div>
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    onValidationChange={(valid) => setIsValid((prev) => ({ ...prev, startDate: valid }))}
                    min={today}
                    regex={/.+/}
                    errorMessage="La date de début doit être aujourd’hui ou après"
                />
            </div>
            <div>
                <Label htmlFor="duration_weeks">Durée (semaines) *</Label>
                <Input
                    id="duration_weeks"
                    type="number"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration_weeks: e.target.value }))}
                    onValidationChange={(valid) => setIsValid((prev) => ({ ...prev, duration_weeks: valid }))}
                    min="1"
                    regex={/^[1-9]\d*$/}
                    errorMessage="La durée doit être un entier positif"
                />
            </div>
            <div>
                <Label htmlFor="price">Prix (Ar) *</Label>
                <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    onValidationChange={(valid) => setIsValid((prev) => ({ ...prev, price: valid }))}
                    min="0"
                    step={0.01}
                    regex={/^\d+(\.\d{1,2})?$/}
                    errorMessage="Le prix doit être un nombre valide"
                />
            </div>
            <div>
                <Label htmlFor="category_id">Catégorie *</Label>
                <Select
                    options={categories.map((cat) => ({ value: cat.id.toString(), label: cat.name }))}
                    value={formData.category_id}
                    onChange={(value) => {
                        setFormData((prev) => ({ ...prev, category_id: value }));
                        setIsValid((prev) => ({ ...prev, category_id: !!value }));
                    }}
                    placeholder="Sélectionner une catégorie"
                />
                {!isValid.category_id && (
                    <p className="text-xs text-red-500 mt-1">La catégorie est requise</p>
                )}
            </div>
            <div>
                <Label htmlFor="registrationEndDate">Date de fin d’inscription *</Label>
                <Input
                    id="registrationEndDate"
                    type="date"
                    value={formData.registrationEndDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, registrationEndDate: e.target.value }))}
                    onValidationChange={(valid) => setIsValid((prev) => ({ ...prev, registrationEndDate: valid }))}
                    min={today}
                    regex={/.+/}
                    errorMessage="La date de fin d’inscription doit être aujourd’hui ou après"
                />
            </div>
            <div>
                <Label htmlFor="covering">Image de couverture {isEditMode ? "" : "*"}</Label>
                {isEditMode && originalCovering && !formData.covering && (
                    <Image
                        src={`${API_URL}/storage/${originalCovering}`}
                        alt="Image de couverture"
                        width={100}
                        height={100}
                        className="object-cover rounded mb-2"
                    />
                )}
                <ImageUpload
                    onImageSelect={(file) => {
                        setFormData((prev) => ({ ...prev, covering: file }));
                        setIsValid((prev) => ({
                            ...prev,
                            covering: !!file || (isEditMode && !!originalCovering),
                        }));
                    }}
                    required={!isEditMode}
                    shape="square"
                    initialImage={
                        isEditMode && originalCovering ? `${API_URL}/storage/${originalCovering}` : undefined
                    }
                />
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/*<h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Gestion des formations en cours</h2>*/}
            <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="mb-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
                Ajouter une formation
            </Button>

            {loading ? (
                <p className="text-gray-700 dark:text-gray-300">Chargement...</p>
            ) : (
                <DataTable
                    columns={columns}
                    data={trainings}
                    actions={actions}
                    initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
                />
            )}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                }}
                className="max-w-2xl p-6"
            >
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Ajouter une formation</h4>
                {renderFormFields(false)}
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setIsAddModalOpen(false);
                            resetForm();
                        }}
                    >
                        Annuler
                    </Button>
                    <Button size="sm" onClick={handleAddTraining} disabled={!isFormValid}>
                        Ajouter
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                }}
                className="max-w-2xl p-6"
            >
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Modifier la formation</h4>
                {renderFormFields(true)}
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setIsEditModalOpen(false);
                            resetForm();
                        }}
                    >
                        Annuler
                    </Button>
                    <Button size="sm" onClick={handleEditTraining} disabled={!isFormValid}>
                        Sauvegarder
                    </Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteTraining}
                message="Êtes-vous sûr de vouloir supprimer cette formation ?"
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default TrainingManager;