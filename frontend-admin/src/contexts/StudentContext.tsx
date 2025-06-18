"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import echo from "@/lib/echo";
import {
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    fetchNotifications,
    markNotificationAsRead,
    deleteNotification,
    deleteAllNotifications,
    getPendingStudents,
    doApproveStudent,
    doRejectStudent,
    getValidatedStudents,
} from "@/lib/api/studentApi";

interface Notification {
    id: number;
    title: string;
    message: string;
    sent_at: string;
    is_read: boolean;
    training_id?: number;
}

interface StudentContextType {
    validatedStudents: any[];
    pendingStudents: any[];
    notifications: Notification[];
    loading: boolean;
    error: string | null;
    fetchValidatedStudents: () => Promise<void>;
    fetchPendingStudents: () => Promise<void>;
    addStudent: (data: FormData) => Promise<void>;
    editStudent: (id: number, data: FormData) => Promise<void>;
    removeStudent: (id: number) => Promise<void>;
    approveStudent: (id: number) => Promise<void>;
    rejectStudent: (id: number, reason: string) => Promise<void>;
    fetchAllNotifications: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    removeNotification: (id: number) => Promise<void>;
    removeAllNotifications: () => Promise<void>;
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [validatedStudents, setValidatedStudents] = useState<any[]>([]);
    const [pendingStudents, setPendingStudents] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchValidatedStudents();
        fetchPendingStudents();
        fetchAllNotifications();

        const channel = echo.channel("notifications");
        channel.listen("StudentRegistered", (e: { notification: Notification }) => {
            console.log("Événement StudentRegistered reçu:", e.notification);
            setNotifications((prev) => {
                if (!prev.some((n) => n.id === e.notification.id)) {
                    return [e.notification, ...prev];
                }
                return prev;
            });
        });

        channel.listenToAll((event, data) => {
            if (data?.notification) {
                setNotifications((prev) => {
                    if (!prev.some((n) => n.id === data.notification.id)) {
                        return [data.notification, ...prev];
                    }
                    return prev;
                });
            }
        });

        echo.connector.pusher.connection.bind("connected", () => {
            console.log("Connecté au serveur Reverb");
        });
        echo.connector.pusher.connection.bind("error", (err) => {
            console.error("Erreur de connexion Reverb:", err);
        });

        return () => {
            echo.leaveChannel("notifications");
        };
    }, []);

    const fetchValidatedStudents = async () => {
        try {
            setLoading(true);
            const data = await getValidatedStudents();
            setValidatedStudents(data);
            setError(null);
        } catch (err) {
            setError("Erreur lors de la récupération des étudiants validés.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingStudents = useCallback(async() => {
        try {
            setLoading(true);
            const data = await getPendingStudents();
            setPendingStudents(data);
            setError(null);
        } catch (err) {
            setError("Erreur lors de la récupération des étudiants en attente.");
        } finally {
            setLoading(false);
        }
    }, []);
    const addStudent = async (data: FormData) => {
        try {
            const response = await createStudent(data);
            setPendingStudents((prev) => [...prev, response.student]); // Nouvel étudiant en attente
            setError(null);
        } catch (err: any) {
            throw err.response?.data || { message: "Erreur lors de l’ajout" };
        }
    };

    const editStudent = async (id: number, data: FormData) => {
        try {
            const response = await updateStudent(id, data);
            setValidatedStudents((prev) =>
                prev.map((student) => (student.id === id ? response.student : student))
            );
            setPendingStudents((prev) =>
                prev.map((student) => (student.id === id ? response.student : student))
            );
            setError(null);
        } catch (err: any) {
            throw err.response?.data || { message: "Erreur lors de la mise à jour" };
        }
    };

    const removeStudent = async (id: number) => {
        try {
            await deleteStudent(id);
            setValidatedStudents((prev) => prev.filter((student) => student.id !== id));
            setPendingStudents((prev) => prev.filter((student) => student.id !== id));
            setError(null);
        } catch (err: any) {
            throw err.response?.data || { message: "Erreur lors de la suppression" };
        }
    };

    const approveStudent = async (id: number) => {
        try {
            const response = await doApproveStudent(id);
            setPendingStudents((prev) => prev.filter((s) => s.id !== id)); // Retirer de la liste des en attente
            setValidatedStudents((prev) => [...prev, response.student]); // Ajouter à la liste des validés
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const rejectStudent = async (id: number, reason: string) => {
        try {
            await doRejectStudent(id, reason);
            setPendingStudents((prev) => prev.filter((s) => s.id !== id)); // Retirer de la liste des en attente
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const fetchAllNotifications = async () => {
        try {
            const data = await fetchNotifications();
            setNotifications(data.notifications);
        } catch (err) {
            console.error("Erreur lors de la récupération des notifications :", err);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await markNotificationAsRead(id);
            setNotifications((prev) =>
                prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
            );
        } catch (err) {
            console.error("Erreur lors du marquage comme lu :", err);
        }
    };

    const removeNotification = async (id: number) => {
        try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        } catch (err) {
            console.error("Erreur lors de la suppression de la notification :", err);
        }
    };

    const removeAllNotifications = async () => {
        try {
            await deleteAllNotifications();
            setNotifications([]);
        } catch (err) {
            console.error("Erreur lors de la suppression de toutes les notifications :", err);
        }
    };

    return (
        <StudentContext.Provider
            value={{
                validatedStudents,
                pendingStudents,
                notifications,
                loading,
                error,
                fetchValidatedStudents,
                fetchPendingStudents,
                addStudent,
                editStudent,
                removeStudent,
                approveStudent,
                rejectStudent,
                fetchAllNotifications,
                markAsRead,
                removeNotification,
                removeAllNotifications,
                setNotifications,
            }}
        >
            {children}
        </StudentContext.Provider>
    );
};

export const useStudent = (): StudentContextType => {
    const context = useContext(StudentContext);
    if (!context) throw new Error("useStudent must be used within a StudentProvider");
    return context;
};