"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStudent } from "@/contexts/StudentContext";
import { ColumnDef } from "@tanstack/react-table"; // Changement ici
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import DataTable from "@/components/tables/datatable"; // Nouvelle DataTable
import { Modal } from "@/components/ui/modal";
import Input from "@/components/custom-ui/input";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import ImageUpload from "@/components/ui/image-upload";
import Toast from "@/components/custom-ui/Toast";
import ConfirmModal from "@/components/custom-ui/ConfirmModal";
import { useTraining } from "@/contexts/TrainingContext";
import { useCategory } from "@/contexts/CategoryContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const StudentManager: React.FC = () => {
    const { validatedStudents, loading, addStudent, editStudent, removeStudent } = useStudent();
    const { trainings } = useTraining();
    const { categories } = useCategory();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        last_name: "",
        first_name: "",
        email: "",
        phone: "",
        cin: "",
        birth_date: "",
        gender: "",
        profile_picture: null as File | null,
        residence_certificate: null as File | null,
        payment_receipt: null as File | null,
        training_id: "",
        previous_license: "",
        status: "pending",
    });
    const [originalImages, setOriginalImages] = useState({
        profile_picture: null as string | null,
        residence_certificate: null as string | null,
        payment_receipt: null as string | null,
    });
    const [formValidation, setFormValidation] = useState({
        last_name: true,
        email: true,
        phone: true,
        cin: true,
        birth_date: true,
        training_id: true,
        profile_picture: true,
        residence_certificate: true,
        payment_receipt: true,
    });

    const resetForm = () => {
        setFormData({
            last_name: "",
            first_name: "",
            email: "",
            phone: "",
            cin: "",
            birth_date: "",
            gender: "",
            profile_picture: null,
            residence_certificate: null,
            payment_receipt: null,
            training_id: "",
            previous_license: "",
            status: "pending",
        });
        setOriginalImages({
            profile_picture: null,
            residence_certificate: null,
            payment_receipt: null,
        });
        setFormValidation({
            last_name: true,
            email: true,
            phone: true,
            cin: true,
            birth_date: true,
            training_id: true,
            profile_picture: true,
            residence_certificate: true,
            payment_receipt: true,
        });
    };

    // Colonnes adaptées pour TanStack Table v8
    const columns: ColumnDef<any>[] = [
        { header: "ID", id: "id", cell: ({ row }) => row.original.id },
        { header: "Nom", id: "last_name", cell: ({ row }) => row.original.last_name },
        { header: "Prénom", id: "first_name", cell: ({ row }) => row.original.first_name || "" },
        { header: "Email", id: "email", cell: ({ row }) => row.original.email || "" },
        { header: "Téléphone", id: "phone", cell: ({ row }) => row.original.phone || "" },
        { header: "Statut", id: "status", cell: ({ row }) => row.original.status },
    ];

    // Actions avec styles adaptés
    const actions = [
        {
            icon: <FaEye className="text-blue-500 hover:text-blue-700" />,
            onClick: (row: any) => handleView(row),
            tooltip: "Voir",
        },
        {
            icon: <FaEdit className="text-yellow-500 hover:text-yellow-700" />,
            onClick: (row: any) => handleEdit(row),
            tooltip: "Modifier",
        },
        {
            icon: <FaTrash className="text-red-500 hover:text-red-700" />,
            onClick: (row: any) => {
                setSelectedStudent(row);
                setIsConfirmModalOpen(true);
            },
            tooltip: "Supprimer",
        },
    ];

    const handleView = (row: any) => {
        setSelectedStudent(row);
        setIsViewModalOpen(true);
    };

    const handleEdit = (row: any) => {
        setSelectedStudent(row);
        setFormData({
            last_name: row.last_name,
            first_name: row.first_name || "",
            email: row.email || "",
            phone: row.phone || "",
            cin: row.cin || "",
            birth_date: row.birth_date || "",
            gender: row.gender || "",
            profile_picture: null,
            residence_certificate: null,
            payment_receipt: null,
            training_id: row.training_id?.toString() || "",
            previous_license: row.previous_license || "",
            status: row.status,
        });
        setOriginalImages({
            profile_picture: row.profile_picture,
            residence_certificate: row.residence_certificate,
            payment_receipt: row.payment_receipt,
        });
        setFormValidation({
            last_name: true,
            email: true,
            phone: true,
            cin: true,
            birth_date: true,
            training_id: true,
            profile_picture: !!row.profile_picture,
            residence_certificate: !!row.residence_certificate,
            payment_receipt: !!row.payment_receipt,
        });
        setIsEditModalOpen(true);
    };

    const validateCategoryPrerequisites = () => {
        if (!formData.training_id || !formData.previous_license) return true;
        const training = trainings.find((t) => t.id === parseInt(formData.training_id));
        if (!training || !training.category_id) return true;
        const category = categories.find((c) => c.id === training.category_id);
        if (!category || !category.prerequisite_category_id) return true;
        return formData.previous_license === category.prerequisite_category_id.toString();
    };

    const isFormValid = () => {
        return (
            formValidation.last_name &&
            formValidation.email &&
            formValidation.phone &&
            formValidation.cin &&
            formValidation.birth_date &&
            formValidation.training_id &&
            formValidation.profile_picture &&
            formValidation.residence_certificate &&
            formValidation.payment_receipt &&
            validateCategoryPrerequisites()
        );
    };

    const handleAddStudent = async () => {
        if (!isFormValid()) return;

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== "") data.append(key, value as any);
        });

        try {
            await addStudent(data);
            setToast({ message: "Étudiant ajouté avec succès", type: "success" });
            setIsAddModalOpen(false);
            resetForm();
        } catch (err: any) {
            setToast({ message: err.message || "Erreur lors de l’ajout", type: "error" });
        }
    };

    const handleEditStudent = async () => {
        if (!selectedStudent || !selectedStudent.id || !isFormValid()) return;

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "profile_picture" && value === null && originalImages.profile_picture) return;
            if (key === "residence_certificate" && value === null && originalImages.residence_certificate) return;
            if (key === "payment_receipt" && value === null && originalImages.payment_receipt) return;
            if (value !== null && value !== "") data.append(key, value as any);
        });
        data.append("id", selectedStudent.id.toString());

        try {
            await editStudent(selectedStudent.id, data);
            setToast({ message: "Étudiant modifié avec succès", type: "success" });
            setIsEditModalOpen(false);
            resetForm();
            setSelectedStudent(null);
        } catch (err: any) {
            setToast({ message: err.message || "Erreur lors de la modification", type: "error" });
        }
    };

    const handleDeleteStudent = async () => {
        if (!selectedStudent) return;
        try {
            await removeStudent(selectedStudent.id);
            setToast({ message: "Étudiant supprimé avec succès", type: "success" });
            setIsConfirmModalOpen(false);
            setSelectedStudent(null);
        } catch (err: any) {
            setToast({ message: err.message || "Erreur lors de la suppression", type: "error" });
        }
    };

    const today = new Date().toISOString().split("T")[0];

    const renderFormFields = (isEditMode: boolean = false) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    onValidationChange={(isValid) => setFormValidation((prev) => ({ ...prev, last_name: isValid }))}
                    placeholder="Nom"
                    regex={/^[a-zA-Z\s]{2,}$/}
                    errorMessage="Le nom doit contenir au moins 2 lettres."
                    require={true}
                />
            </div>
            <div>
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Prénom"
                />
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onValidationChange={(isValid) => setFormValidation((prev) => ({ ...prev, email: isValid }))}
                    placeholder="Email"
                    regex={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
                    errorMessage="Format d'email invalide."
                />
            </div>
            <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onValidationChange={(isValid) => setFormValidation((prev) => ({ ...prev, phone: isValid }))}
                    placeholder="Téléphone"
                    regex={/^(261|032|033|034|037|038)\d{7}$/}
                    errorMessage="Le numéro doit commencer par 261, 032, 033, 034, 037 ou 038 suivi de 7 chiffres."
                />
            </div>
            <div>
                <Label htmlFor="cin">CIN</Label>
                <Input
                    id="cin"
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                    onValidationChange={(isValid) => setFormValidation((prev) => ({ ...prev, cin: isValid }))}
                    placeholder="CIN"
                    regex={/^\d{5}[12]\d{6}$/}
                    errorMessage="Le CIN doit contenir 12 chiffres, 6e chiffre 1 ou 2."
                />
            </div>
            <div>
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    onValidationChange={(isValid) => setFormValidation((prev) => ({ ...prev, birth_date: isValid }))}
                    max={today}
                    regex={(value) => !!value && new Date(value) <= new Date(today)}
                    errorMessage="Date invalide ou dans le futur."
                />
            </div>
            <div>
                <Label htmlFor="gender">Genre</Label>
                <Select
                    options={[
                        { value: "1", label: "Homme" },
                        { value: "2", label: "Femme" },
                    ]}
                    value={formData.gender}
                    onChange={(value) => setFormData({ ...formData, gender: value })}
                    placeholder="Sélectionner un genre"
                />
            </div>
            <div>
                <Label htmlFor="training_id">Formation *</Label>
                <Select
                    options={trainings.map((t) => ({ value: t.id.toString(), label: t.title }))}
                    value={formData.training_id}
                    onChange={(value) => setFormData({ ...formData, training_id: value })}
                    onValidationChange={(isValid) => setFormValidation((prev) => ({ ...prev, training_id: isValid }))}
                    placeholder="Sélectionner une formation"
                />
            </div>
            <div>
                <Label htmlFor="previous_license">Licence précédente</Label>
                <Select
                    options={categories.map((c) => ({ value: c.id.toString(), label: c.name }))}
                    value={formData.previous_license}
                    onChange={(value) => setFormData({ ...formData, previous_license: value })}
                    placeholder="Sélectionner une licence"
                />
            </div>
            <div>
                <Label htmlFor="profile_picture">Photo de profil {isEditMode ? "" : "*"}</Label>
                {isEditMode && originalImages.profile_picture && !formData.profile_picture && (
                    <Image
                        src={`${API_URL}/storage/${originalImages.profile_picture}`}
                        alt="Photo de profil"
                        width={100}
                        height={100}
                        className="object-cover rounded mb-2 hidden"
                    />
                )}
                <ImageUpload
                    onImageSelect={(file) => {
                        setFormData({ ...formData, profile_picture: file });
                        setFormValidation((prev) => ({
                            ...prev,
                            profile_picture: !!file || (isEditMode && !!originalImages.profile_picture),
                        }));
                    }}
                    required={!isEditMode}
                    shape="square"
                    initialImage={
                        isEditMode && originalImages.profile_picture
                            ? `${API_URL}/storage/${originalImages.profile_picture}`
                            : undefined
                    }
                />
            </div>
            <div>
                <Label htmlFor="residence_certificate">Certificat de résidence {isEditMode ? "" : "*"}</Label>
                {isEditMode && originalImages.residence_certificate && !formData.residence_certificate && (
                    <Image
                        src={`${API_URL}/storage/${originalImages.residence_certificate}`}
                        alt="Certificat de résidence"
                        width={100}
                        height={100}
                        className="object-cover rounded mb-2 hidden"
                    />
                )}
                <ImageUpload
                    onImageSelect={(file) => {
                        setFormData({ ...formData, residence_certificate: file });
                        setFormValidation((prev) => ({
                            ...prev,
                            residence_certificate: !!file || (isEditMode && !!originalImages.residence_certificate),
                        }));
                    }}
                    required={!isEditMode}
                    shape="square"
                    initialImage={
                        isEditMode && originalImages.residence_certificate
                            ? `${API_URL}/storage/${originalImages.residence_certificate}`
                            : undefined
                    }
                />
            </div>
            <div>
                <Label htmlFor="payment_receipt">Reçu de paiement {isEditMode ? "" : "*"}</Label>
                {isEditMode && originalImages.payment_receipt && !formData.payment_receipt && (
                    <Image
                        src={`${API_URL}/storage/${originalImages.payment_receipt}`}
                        alt="Reçu de paiement"
                        width={100}
                        height={100}
                        className="object-cover rounded mb-2 hidden"
                    />
                )}
                <ImageUpload
                    onImageSelect={(file) => {
                        setFormData({ ...formData, payment_receipt: file });
                        setFormValidation((prev) => ({
                            ...prev,
                            payment_receipt: !!file || (isEditMode && !!originalImages.payment_receipt),
                        }));
                    }}
                    required={!isEditMode}
                    shape="square"
                    initialImage={
                        isEditMode && originalImages.payment_receipt
                            ? `${API_URL}/storage/${originalImages.payment_receipt}`
                            : undefined
                    }
                />
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/*<h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Gestion des étudiants</h2>*/}
            <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="mb-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
                Ajouter un étudiant
            </Button>

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <DataTable
                    columns={columns}
                    data={validatedStudents}
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
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Ajouter un étudiant</h4>
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
                    <Button size="sm" onClick={handleAddStudent} disabled={!isFormValid()}>
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
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Modifier l’étudiant</h4>
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
                    <Button size="sm" onClick={handleEditStudent} disabled={!isFormValid()}>
                        Sauvegarder
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} className="max-w-2xl p-6">
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Détails de l’étudiant</h4>
                {selectedStudent && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="view_last_name">Nom</Label>
                            <Input id="view_last_name" value={selectedStudent.last_name} disabled />
                        </div>
                        <div>
                            <Label htmlFor="view_first_name">Prénom</Label>
                            <Input id="view_first_name" value={selectedStudent.first_name || ""} disabled />
                        </div>
                        <div>
                            <Label htmlFor="view_email">Email</Label>
                            <Input id="view_email" value={selectedStudent.email || ""} disabled />
                        </div>
                        <div>
                            <Label htmlFor="view_phone">Téléphone</Label>
                            <Input id="view_phone" value={selectedStudent.phone || ""} disabled />
                        </div>
                        <div>
                            <Label htmlFor="view_cin">CIN</Label>
                            <Input id="view_cin" value={selectedStudent.cin || ""} disabled />
                        </div>
                        <div>
                            <Label htmlFor="view_birth_date">Date de naissance</Label>
                            <Input id="view_birth_date" value={selectedStudent.birth_date || ""} disabled />
                        </div>
                        <div>
                            <Label htmlFor="view_gender">Genre</Label>
                            <Input
                                id="view_gender"
                                value={
                                    selectedStudent.gender === "1"
                                        ? "Homme"
                                        : selectedStudent.gender === "2"
                                            ? "Femme"
                                            : ""
                                }
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="view_training_id">Formation</Label>
                            <Input
                                id="view_training_id"
                                value={trainings.find((t) => t.id === selectedStudent.training_id)?.title || ""}
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="view_previous_license">Licence précédente</Label>
                            <Input
                                id="view_previous_license"
                                value={
                                    categories.find((c) => c.id === parseInt(selectedStudent.previous_license))?.name ||
                                    ""
                                }
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="view_profile_picture">Photo de profil</Label>
                            {selectedStudent.profile_picture && (
                                <Image
                                    src={`${API_URL}/storage/${selectedStudent.profile_picture}`}
                                    alt="Photo de profil"
                                    width={128}
                                    height={128}
                                    className="object-cover rounded"
                                />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="view_residence_certificate">Certificat de résidence</Label>
                            {selectedStudent.residence_certificate && (
                                <Image
                                    src={`${API_URL}/storage/${selectedStudent.residence_certificate}`}
                                    alt="Certificat de résidence"
                                    width={128}
                                    height={128}
                                    className="object-cover rounded"
                                />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="view_payment_receipt">Reçu de paiement</Label>
                            {selectedStudent.payment_receipt && (
                                <Image
                                    src={`${API_URL}/storage/${selectedStudent.payment_receipt}`}
                                    alt="Reçu de paiement"
                                    width={128}
                                    height={128}
                                    className="object-cover rounded"
                                />
                            )}
                        </div>
                    </div>
                )}
                <div className="flex justify-end mt-6">
                    <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
                        Fermer
                    </Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteStudent}
                message="Êtes-vous sûr de vouloir supprimer cet étudiant ?"
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default StudentManager;