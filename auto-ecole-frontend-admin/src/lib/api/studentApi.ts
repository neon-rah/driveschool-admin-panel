import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

export const fetchStudents = () => api.get("/students").then((res) => res.data);
export const createStudent = (data: FormData) =>
    api.post("/students", data, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);
export const updateStudent = (id: number, data: FormData) => {
  //  data.append("_method", "PUT"); // Spoofing pour indiquer une mise à jour
    return api.post(`/students/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);
};
export const deleteStudent = (id: number) => api.delete(`/students/${id}`).then((res) => res.data);
export const fetchNotifications = () => api.get("/notifications").then((res) => res.data);
export const markNotificationAsRead = (id: number) => api.put(`/notifications/${id}/read`).then((res) => res.data);
export const deleteNotification = (id: number) => api.delete(`/notifications/${id}`).then((res) => res.data);
export const deleteAllNotifications = () => api.delete("/notifications").then((res) => res.data);

export const getPendingStudents = async () => {
    try {
        const response = await api.get("/pending-students"); 
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Erreur lors de la récupération des étudiants en attente");
    }
};

export const getValidatedStudents = async () => {
    try {
        const response = await api.get("/validated-students");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Erreur lors de la récupération des étudiants en attente");
    }
};

export const doApproveStudent = async (id: number) => {
    try {
        const response = await api.post(`/students/${id}/approve`);
        // La réponse contient `message` et `student` en cas de succès
        const { message, student } = response.data;

        
        return {
            message, // "Étudiant validé avec succès"
            student, // Objet contenant les détails de l'étudiant (id, status, email, etc.)
        };
    } catch (error) {
        throw new Error(error.response?.data?.error || "Erreur lors de la validation de l’étudiant");
    }
};

export const doRejectStudent = async (id: number, reason: string) => {
    try {
        const response = await api.post(`/students/${id}/reject`, { reason });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Erreur lors du rejet de l’étudiant");
    }
};