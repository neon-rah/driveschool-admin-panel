Je vais vous guider pas à pas pour intégrer un système de notifications en temps réel dans votre application Laravel/Next.js, en utilisant les technologies gratuites (Laravel WebSockets et Laravel Echo) et en intégrant le module étudiant avec les fonctionnalités demandées. Nous allons structurer cela proprement avec un contexte, une API, et une intégration complète dans le frontend et le backend. Voici une explication détaillée, étape par étape.

---

### **Technologies utilisées**
1. **Backend (Laravel)** :
    - **Laravel WebSockets** : Serveur WebSocket auto-hébergé pour diffuser des notifications en temps réel.
    - **Laravel Broadcasting** : Système d’événements pour déclencher des notifications.
    - **Eloquent** : Pour gérer les modèles (`Student`, `Notification`, `Category`).

2. **Frontend (Next.js)** :
    - **Laravel Echo** : Bibliothèque pour écouter les événements WebSocket.
    - **Pusher-js** : Utilisé comme fallback par Laravel WebSockets.
    - **React Context** : Pour gérer les données globales (étudiants, notifications).

3. **Composants existants** :
    - `DataTable`, `Input`, `Select`, `ImageUpload`, `NotificationDropdown`.

---

### **Étape 1 : Configuration du backend**

#### **1.1 Installation de Laravel WebSockets**
- Installez le package :
  ```bash
  composer require beyondcode/laravel-websockets
  ```
- Publiez la configuration :
  ```bash
  php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
  ```
- Mettez à jour `.env` :
  ```env
  BROADCAST_DRIVER=websockets
  WEBSOCKETS_HOST=127.0.0.1
  WEBSOCKETS_PORT=6001
  ```

#### **1.2 Création des modèles et migrations**
- **Table `notifications`** : Votre migration est correcte, mais je vais l’ajuster légèrement pour inclure un champ `student_id` :
  ```php
  Schema::create('notifications', function (Blueprint $table) {
      $table->id();
      $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('cascade');
      $table->foreignId('training_id')->nullable()->constrained('trainings')->onDelete('cascade');
      $table->string('title', 100);
      $table->text('message');
      $table->timestamp('sent_at')->nullable();
      $table->boolean('is_read')->default(false);
      $table->timestamps();
  });
  ```
    - Exécutez la migration :
      ```bash
      php artisan migrate
      ```

- **Modèle `Notification`** :
  ```php
  namespace App\Models;

  use Illuminate\Database\Eloquent\Factories\HasFactory;
  use Illuminate\Database\Eloquent\Model;

  class Notification extends Model
  {
      use HasFactory;

      protected $fillable = [
          'student_id',
          'training_id',
          'title',
          'message',
          'sent_at',
          'is_read',
      ];

      public function student()
      {
          return $this->belongsTo(Student::class);
      }

      public function training()
      {
          return $this->belongsTo(Training::class);
      }
  }
  ```

#### **1.3 Création d’un événement pour les notifications**
- Générez un événement :
  ```bash
  php artisan make:event StudentRegistered
  ```
- Modifiez `app/Events/StudentRegistered.php` :
  ```php
  namespace App\Events;

  use App\Models\Student;
  use Illuminate\Broadcasting\Channel;
  use Illuminate\Broadcasting\InteractsWithSockets;
  use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
  use Illuminate\Foundation\Events\Dispatchable;
  use Illuminate\Queue\SerializesModels;

  class StudentRegistered implements ShouldBroadcast
  {
      use Dispatchable, InteractsWithSockets, SerializesModels;

      public $student;

      public function __construct(Student $student)
      {
          $this->student = $student;
      }

      public function broadcastOn()
      {
          return new Channel('notifications');
      }

      public function broadcastWith()
      {
          return [
              'id' => $this->student->id,
              'title' => 'Nouvelle inscription',
              'message' => "Nouvelle inscription : {$this->student->last_name}" . 
                           ($this->student->first_name ? " {$this->student->first_name}" : '') . 
                           ", {$this->student->email}",
              'sent_at' => now()->toISOString(),
              'is_read' => false,
          ];
      }
  }
  ```

#### **1.4 Mise à jour de `StudentController`**
- Ajoutez la création d’une notification et le déclenchement de l’événement dans `store` :
  ```php
  public function store(Request $request)
  {
      $data = $request->all();
      $validator = Student::validate($data);

      if ($validator->fails()) {
          return response()->json(['errors' => $validator->errors()], 422);
      }

      try {
          if ($request->hasFile('profile_picture')) {
              $data['profile_picture'] = ImageUploadService::uploadImage($request->file('profile_picture'), 'students', 'student');
          }
          if ($request->hasFile('residence_certificate')) {
              $data['residence_certificate'] = ImageUploadService::uploadImage($request->file('residence_certificate'), 'students', 'residence');
          }
          if ($request->hasFile('payment_receipt')) {
              $data['payment_receipt'] = ImageUploadService::uploadImage($request->file('payment_receipt'), 'students', 'receipt');
          }
      } catch (\Illuminate\Validation\ValidationException $e) {
          return response()->json(['errors' => $e->errors()], 422);
      }

      $student = new Student();
      $student->fill($data);
      if (!empty($data['password'])) {
          $student->password = Hash::make($data['password']);
      }
      $student->save();

      // Créer une notification dans la base de données
      $notification = Notification::create([
          'student_id' => $student->id,
          'training_id' => $student->training_id,
          'title' => 'Nouvelle inscription',
          'message' => "Nouvelle inscription : {$student->last_name}" . 
                       ($student->first_name ? " {$student->first_name}" : '') . 
                       ", {$student->email}",
          'sent_at' => now(),
      ]);

      // Déclencher l'événement pour la notification en temps réel
      event(new StudentRegistered($student));

      return response()->json(['message' => 'Student created successfully', 'student' => $student], 201);
  }
  ```

- Ajoutez une méthode pour récupérer toutes les notifications :
  ```php
  public function getNotifications()
  {
      $notifications = Notification::latest()->get();
      return response()->json(['notifications' => $notifications], 200);
  }

  public function markNotificationAsRead($id)
  {
      $notification = Notification::findOrFail($id);
      $notification->update(['is_read' => true]);
      return response()->json(['message' => 'Notification marked as read'], 200);
  }

  public function deleteNotification($id)
  {
      $notification = Notification::findOrFail($id);
      $notification->delete();
      return response()->json(['message' => 'Notification deleted'], 200);
  }

  public function deleteAllNotifications()
  {
      Notification::truncate();
      return response()->json(['message' => 'All notifications deleted'], 200);
  }
  ```

#### **1.5 Définir les routes dans `routes/api.php`**
```php
Route::prefix('students')->group(function () {
    Route::post('/', [StudentController::class, 'store']);
    Route::get('/', [StudentController::class, 'index']);
    Route::get('/{id}', [StudentController::class, 'show']);
    Route::put('/{id}', [StudentController::class, 'update']);
    Route::delete('/{id}', [StudentController::class, 'destroy']);
});

Route::prefix('notifications')->group(function () {
    Route::get('/', [StudentController::class, 'getNotifications']);
    Route::put('/{id}/read', [StudentController::class, 'markNotificationAsRead']);
    Route::delete('/{id}', [StudentController::class, 'deleteNotification']);
    Route::delete('/', [StudentController::class, 'deleteAllNotifications']);
});
```

#### **1.6 Lancer le serveur WebSocket**
- Exécutez :
  ```bash
  php artisan websockets:serve
  ```
- Assurez-vous que le serveur Laravel est aussi lancé :
  ```bash
  php artisan serve
  ```

---

### **Étape 2 : Configuration du frontend**

#### **2.1 Installation des dépendances**
- Installez Laravel Echo et Pusher-js :
  ```bash
  npm install laravel-echo pusher-js
  ```

#### **2.2 Configuration de Laravel Echo**
- Créez `lib/echo.ts` :
  ```ts
  import Echo from "laravel-echo";
  import Pusher from "pusher-js";

  (window as any).Pusher = Pusher;

  const echo = new Echo({
      broadcaster: "pusher",
      key: "any_key",
      wsHost: "127.0.0.1",
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
  });

  export default echo;
  ```

#### **2.3 Création du contexte pour les étudiants et notifications**
- Créez `contexts/StudentContext.tsx` :
  ```tsx
  "use client";

  import React, { createContext, useContext, useState, useEffect } from "react";
  import {
      fetchStudents,
      createStudent,
      updateStudent,
      deleteStudent,
      fetchNotifications,
      markNotificationAsRead,
      deleteNotification,
      deleteAllNotifications,
  } from "@/lib/api/studentApi";
  import { Student } from "@/types/student";
  import { Notification } from "@/types/notification";

  interface StudentContextType {
      students: Student[];
      notifications: Notification[];
      loading: boolean;
      error: string | null;
      fetchAllStudents: () => Promise<void>;
      addStudent: (data: FormData) => Promise<void>;
      editStudent: (id: number, data: FormData) => Promise<void>;
      removeStudent: (id: number) => Promise<void>;
      fetchAllNotifications: () => Promise<void>;
      markAsRead: (id: number) => Promise<void>;
      removeNotification: (id: number) => Promise<void>;
      removeAllNotifications: () => Promise<void>;
  }

  const StudentContext = createContext<StudentContextType | undefined>(undefined);

  export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [students, setStudents] = useState<Student[]>([]);
      const [notifications, setNotifications] = useState<Notification[]>([]);
      const [loading, setLoading] = useState<boolean>(true);
      const [error, setError] = useState<string | null>(null);

      const fetchAllStudents = async () => {
          try {
              setLoading(true);
              const data = await fetchStudents();
              setStudents(data.data);
              setError(null);
          } catch (err) {
              setError("Erreur lors de la récupération des étudiants.");
          } finally {
              setLoading(false);
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

      const addStudent = async (data: FormData) => {
          try {
              const response = await createStudent(data);
              setStudents((prev) => [...prev, response.student]);
              setError(null);
          } catch (err: any) {
              throw err.response?.data || { message: "Erreur lors de l’ajout" };
          }
      };

      const editStudent = async (id: number, data: FormData) => {
          try {
              const response = await updateStudent(id, data);
              setStudents((prev) =>
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
              setStudents((prev) => prev.filter((student) => student.id !== id));
              setError(null);
          } catch (err: any) {
              throw err.response?.data || { message: "Erreur lors de la suppression" };
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

      useEffect(() => {
          fetchAllStudents();
          fetchAllNotifications();
      }, []);

      return (
          <StudentContext.Provider
              value={{
                  students,
                  notifications,
                  loading,
                  error,
                  fetchAllStudents,
                  addStudent,
                  editStudent,
                  removeStudent,
                  fetchAllNotifications,
                  markAsRead,
                  removeNotification,
                  removeAllNotifications,
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
  ```

#### **2.4 API dans `lib/api/studentApi.ts`**
```ts
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });

export const fetchStudents = () => api.get("/students").then((res) => res.data);

export const createStudent = (data: FormData) =>
    api.post("/students", data, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);

export const updateStudent = (id: number, data: FormData) =>
    api.put(`/students/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);

export const deleteStudent = (id: number) => api.delete(`/students/${id}`).then((res) => res.data);

export const fetchNotifications = () => api.get("/notifications").then((res) => res.data);

export const markNotificationAsRead = (id: number) => api.put(`/notifications/${id}/read`).then((res) => res.data);

export const deleteNotification = (id: number) => api.delete(`/notifications/${id}`).then((res) => res.data);

export const deleteAllNotifications = () => api.delete("/notifications").then((res) => res.data);
```

#### **2.5 Types dans `types/student.ts` et `types/notification.ts`**
- `types/student.ts` :
  ```ts
  export interface Student {
      id: number;
      last_name: string;
      first_name?: string;
      email?: string;
      phone?: string;
      cin?: string;
      birth_date?: string;
      gender?: "1" | "2";
      profile_picture: string;
      residence_certificate: string;
      password?: string;
      previous_license?: string;
      payment_receipt: string;
      training_id?: number;
      status: "pending" | "validated" | "rejected";
  }
  ```

- `types/notification.ts` :
  ```ts
  export interface Notification {
      id: number;
      student_id?: number;
      training_id?: number;
      title: string;
      message: string;
      sent_at: string;
      is_read: boolean;
  }
  ```

#### **2.6 Adaptation de `timeSince` en français**
- Modifiez `lib/utils.ts` :
  ```ts
  export const timeSince = (date: string | Date, max: number = 7): string => {
      const now = new Date();
      const pastDate = new Date(date);
      const secondsPast = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
      const maximum = max * 24 * 3600;

      if (secondsPast < 60) {
          return `il y a ${secondsPast} secondes`;
      }
      if (secondsPast < 3600) {
          return `il y a ${Math.floor(secondsPast / 60)} minutes`;
      }
      if (secondsPast < 86400) {
          return `il y a ${Math.floor(secondsPast / 3600)} heures`;
      }
      if (secondsPast < maximum) {
          return `il y a ${Math.floor(secondsPast / 86400)} jours`;
      }

      return pastDate.toLocaleString("fr-FR", {
          month: "long",
          day: "2-digit",
          year: "numeric",
      });
  };
  ```

---

### **Étape 3 : Intégration dans le frontend**

#### **3.1 Composant `StudentManager.tsx`**
```tsx
"use client";

import React, { useState, useEffect } from "react";
import { useStudent } from "@/contexts/StudentContext";
import { Column } from "react-table";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import DataTable from "@/components/tables/datatable";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/ui/input";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import ImageUpload from "@/components/ui/image-upload/ImageUpload";
import Toast from "@/components/custom-ui/Toast";
import ConfirmModal from "@/components/custom-ui/ConfirmModal";
import { useTraining } from "@/contexts/TrainingContext";

const StudentManager: React.FC = () => {
    const { students, loading, addStudent, editStudent, removeStudent } = useStudent();
    const { trainings, categories } = useTraining();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
        status: "pending",
    });
    const [isFormValid, setIsFormValid] = useState(false);

    const columns: Column<any>[] = [
        { Header: "Nom", accessor: "last_name" },
        { Header: "Prénom", accessor: "first_name" },
        { Header: "Email", accessor: "email" },
        { Header: "Téléphone", accessor: "phone" },
        { Header: "Statut", accessor: "status" },
    ];

    const actions = [
        { icon: <FaEye />, onClick: (row: any) => router.push(`/students/${row.id}`), tooltip: "Voir" },
        { icon: <FaEdit />, onClick: (row: any) => handleEdit(row), tooltip: "Modifier" },
        { icon: <FaTrash />, onClick: (row: any) => { setSelectedStudent(row); setIsConfirmModalOpen(true); }, tooltip: "Supprimer" },
    ];

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
            status: row.status,
        });
        setIsEditModalOpen(true);
    };

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
            status: "pending",
        });
        setIsFormValid(false);
    };

    const handleAddStudent = async () => {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) data.append(key, value as any);
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
        if (!selectedStudent) return;
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) data.append(key, value as any);
        });

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

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Gestion des étudiants</h2>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="mb-4 bg-blue-500 hover:bg-blue-600 text-white">
                Ajouter un étudiant
            </Button>

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <DataTable columns={columns} data={students} actions={actions} />
            )}

            {/* Modal d’ajout */}
            <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} className="max-w-2xl p-6">
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Ajouter un étudiant</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="last_name">Nom *</Label>
                        <Input
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            placeholder="Nom"
                            required
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
                            placeholder="Email"
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Téléphone"
                        />
                    </div>
                    <div>
                        <Label htmlFor="cin">CIN</Label>
                        <Input
                            id="cin"
                            value={formData.cin}
                            onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                            placeholder="CIN"
                        />
                    </div>
                    <div>
                        <Label htmlFor="birth_date">Date de naissance</Label>
                        <Input
                            id="birth_date"
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                            max={today}
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
                            placeholder="Sélectionner une formation"
                        />
                    </div>
                    <div>
                        <Label htmlFor="profile_picture">Photo de profil *</Label>
                        <ImageUpload
                            onImageSelect={(file) => setFormData({ ...formData, profile_picture: file })}
                            initialImage={formData.profile_picture ? URL.createObjectURL(formData.profile_picture) : null}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="residence_certificate">Certificat de résidence *</Label>
                        <ImageUpload
                            onImageSelect={(file) => setFormData({ ...formData, residence_certificate: file })}
                            initialImage={formData.residence_certificate ? URL.createObjectURL(formData.residence_certificate) : null}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="payment_receipt">Reçu de paiement *</Label>
                        <ImageUpload
                            onImageSelect={(file) => setFormData({ ...formData, payment_receipt: file })}
                            initialImage={formData.payment_receipt ? URL.createObjectURL(formData.payment_receipt) : null}
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" size="sm" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={handleAddStudent} disabled={!isFormValid}>
                        Ajouter
                    </Button>
                </div>
            </Modal>

            {/* Modal de modification */}
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); resetForm(); }} className="max-w-2xl p-6">
                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Modifier l’étudiant</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="last_name">Nom *</Label>
                        <Input
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            placeholder="Nom"
                            required
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
                            placeholder="Email"
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Téléphone"
                        />
                    </div>
                    <div>
                        <Label htmlFor="cin">CIN</Label>
                        <Input
                            id="cin"
                            value={formData.cin}
                            onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                            placeholder="CIN"
                        />
                    </div>
                    <div>
                        <Label htmlFor="birth_date">Date de naissance</Label>
                        <Input
                            id="birth_date"
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                            max={today}
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
                            placeholder="Sélectionner une formation"
                        />
                    </div>
                    <div>
                        <Label htmlFor="profile_picture">Photo de profil *</Label>
                        <ImageUpload
                            onImageSelect={(file) => setFormData({ ...formData, profile_picture: file })}
                            initialImage={selectedStudent?.profile_picture}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="residence_certificate">Certificat de résidence *</Label>
                        <ImageUpload
                            onImageSelect={(file) => setFormData({ ...formData, residence_certificate: file })}
                            initialImage={selectedStudent?.residence_certificate}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="payment_receipt">Reçu de paiement *</Label>
                        <ImageUpload
                            onImageSelect={(file) => setFormData({ ...formData, payment_receipt: file })}
                            initialImage={selectedStudent?.payment_receipt}
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" size="sm" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>
                        Annuler
                    </Button>
                    <Button size="sm" onClick={handleEditStudent} disabled={!isFormValid}>
                        Sauvegarder
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
```

#### **3.2 Mise à jour de `NotificationDropdown.tsx`**
```tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStudent } from "@/contexts/StudentContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import echo from "@/lib/echo";
import { timeSince } from "@/lib/utils";

export default function NotificationDropdown() {
    const { notifications, markAsRead, removeNotification } = useStudent();
    const [isOpen, setIsOpen] = useState(false);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    useEffect(() => {
        echo.channel("notifications").listen("StudentRegistered", (e: any) => {
            setHasNewNotifications(true);
        });

        setHasNewNotifications(notifications.some((n) => !n.is_read));

        return () => {
            echo.leaveChannel("notifications");
        };
    }, [notifications]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNewNotifications(false);
            notifications.forEach((n) => !n.is_read && markAsRead(n.id));
        }
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                className="relative flex items-center justify-center text-gray-500 bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                onClick={toggleDropdown}
            >
                <span
                    className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-green-500 ${!hasNewNotifications ? "hidden" : "flex"}`}
                >
                    <span className="absolute inline-flex w-full h-full bg-green-500 rounded-full opacity-75 animate-ping"></span>
                </span>
                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
            >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
                    <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h5>
                    <button
                        onClick={toggleDropdown}
                        className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>
                <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
                    {notifications.map((notif) => (
                        <li key={notif.id}>
                            <DropdownItem
                                onItemClick={closeDropdown}
                                className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                            >
                                <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                                    <Image
                                        width={40}
                                        height={40}
                                        src="/images/user/user-02.jpg"
                                        alt="User"
                                        className="w-full overflow-hidden rounded-full"
                                    />
                                    <span
                                        className={`absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white ${
                                            notif.is_read ? "bg-gray-500" : "bg-success-500"
                                        } dark:border-gray-900`}
                                    ></span>
                                </span>
                                <span className="block">
                                    <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
                                        {notif.message}
                                    </span>
                                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                                        <span>{timeSince(notif.sent_at)}</span>
                                    </span>
                                </span>
                            </DropdownItem>
                        </li>
                    ))}
                </ul>
                <Link
                    href="/notifications"
                    className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                    Voir toutes les notifications
                </Link>
            </Dropdown>
        </div>
    );
}
```

#### **3.3 Page `notifications.tsx`**
- Créez `pages/notifications.tsx` :
```tsx
"use client";

import React, { useEffect } from "react";
import { useStudent } from "@/contexts/StudentContext";
import { Column } from "react-table";
import { FaTrash } from "react-icons/fa";
import Button from "@/components/ui/button/Button";
import DataTable from "@/components/tables/datatable";
import { timeSince } from "@/lib/utils";

const NotificationsPage: React.FC = () => {
    const { notifications, loading, markAsRead, removeNotification, removeAllNotifications } = useStudent();

    useEffect(() => {
        notifications.forEach((n) => !n.is_read && markAsRead(n.id));
    }, [notifications, markAsRead]);

    const columns: Column<any>[] = [
        { Header: "Titre", accessor: "title" },
        { Header: "Message", accessor: "message" },
        { Header: "Envoyé", accessor: "sent_at", Cell: ({ value }) => timeSince(value) },
    ];

    const actions = [
        { icon: <FaTrash />, onClick: (row: any) => removeNotification(row.id), tooltip: "Supprimer" },
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Notifications</h2>
            <Button
                size="sm"
                onClick={removeAllNotifications}
                className="mb-4 bg-red-500 hover:bg-red-600 text-white"
            >
                Supprimer toutes les notifications
            </Button>
            {loading ? (
                <p>Chargement...</p>
            ) : (
                <DataTable columns={columns} data={notifications} actions={actions} />
            )}
        </div>
    );
};

export default NotificationsPage;
```

#### **3.4 Mise à jour de `AppSidebar.tsx`**
- Ajoutez le lien vers la page des notifications (déjà présent dans votre code).

---

### **Explications des étapes**

#### **Backend**
1. **Laravel WebSockets** : Configuré pour diffuser des événements via le canal `notifications`.
2. **Événement `StudentRegistered`** : Déclenché à chaque inscription d’un étudiant, avec les données nécessaires pour la notification.
3. **Contrôleur** : Crée une entrée dans la table `notifications` et diffuse l’événement.
4. **Routes** : Fournissent des endpoints pour gérer les notifications (récupérer, marquer comme lu, supprimer).

#### **Frontend**
1. **Contexte `StudentContext`** : Gère les étudiants et les notifications, avec des fonctions pour interagir avec l’API.
2. **Composant `StudentManager`** : Utilise `DataTable`, `Input`, `Select`, et `ImageUpload` pour gérer les étudiants.
    - **Validation** : Les champs obligatoires sont marqués avec `*`, et `isFormValid` pourrait être amélioré avec une logique plus stricte (ex. regex).
    - **Chargement des données** : Les valeurs sont correctement chargées dans le `Select` lors de la modification (pas de placeholder par défaut).
3. **Notifications en temps réel** :
    - **Dropdown** : Écoute les événements WebSocket et affiche les notifications avec un indicateur vert pour les non-lues.
    - **Page `notifications`** : Liste toutes les notifications avec options de suppression.
4. **Gestion des catégories** :
    - `previous_license` reste une chaîne pour éviter des problèmes de boucles infinies avec une clé étrangère. Si vous voulez une relation avec `categories`, ajoutez une colonne `previous_license_category_id` dans `students` et liez-la à `categories` avec une relation `belongsTo`.

#### **Gestion des erreurs**
- Les erreurs sont capturées et affichées via des `Toast`.

#### **Validation des catégories**
- Pour valider les prérequis des catégories, ajoutez une logique dans `StudentManager` pour vérifier `training.category_id` contre `categories.prerequisite_category_id` (nécessite une API supplémentaire pour récupérer les catégories avec leurs prérequis).

---

### **Prochaines étapes**
1. **Validation des prérequis** : Ajoutez une API `/categories` et vérifiez les prérequis dans `handleAddStudent`.
2. **E-mails** : Implémentez l’envoi d’e-mails dans `StudentController::store` une fois les services de validation prêts.
3. **Tests** : Ajoutez un étudiant via le frontend et vérifiez les notifications dans le dropdown et la page.

Si vous avez des questions ou des erreurs, dites-le-moi, et je vous aiderai à finaliser !




L’erreur TypeScript que vous rencontrez :

```
TS2345: Argument of type
{ wsHost: string; wsPort: number; wssPort: number; forceTLS: false; enabledTransports: "ws"[]; disableStats: true; }
is not assignable to parameter of type Options
Property 'cluster' is missing in type
{ wsHost: string; wsPort: number; wssPort: number; forceTLS: false; enabledTransports: "ws"[]; disableStats: true; }
but required in type Options
```

indique que TypeScript considère la propriété `cluster` comme **obligatoire** dans le type `Options` attendu par le constructeur de `Pusher` (défini dans `pusher-js`). Cela se produit parce que les types par défaut de `pusher-js` sont conçus pour le service Pusher hébergé dans le cloud, où `cluster` est requis pour spécifier une région (comme `eu`, `us`, etc.). Cependant, avec Reverb, qui est auto-hébergé, vous n’utilisez pas de cluster, mais TypeScript ne le sait pas encore.

---

### **Pourquoi cette erreur ?**
- Les types de `pusher-js` (fournis par `@types/pusher-js`) définissent l’interface `Options` avec `cluster` comme champ obligatoire :
  ```typescript
  interface Options {
      cluster: string;
      wsHost?: string;
      wsPort?: number;
      wssPort?: number;
      forceTLS?: boolean;
      enabledTransports?: string[];
      disableStats?: boolean;
      // ... autres options
  }
  ```
- Lorsque vous omettez `cluster`, TypeScript génère une erreur, car il ne reconnaît pas que vous utilisez un serveur personnalisé (Reverb) où `cluster` n’est pas pertinent.

---

### **Solutions**
Vous avez deux options pour résoudre cette erreur :

#### **Option 1 : Ajouter `cluster` avec une valeur vide ou arbitraire**
- Puisque vous utilisez Reverb et non le service Pusher cloud, vous pouvez ajouter `cluster: ""` ou une valeur arbitraire (comme `"custom"`) pour satisfaire TypeScript. Cela n’affectera pas le comportement, car `wsHost` et `wsPort` prennent le pas sur `cluster` dans ce contexte.

```typescript
"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

const pusherClient = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY || "my-reverb-key", {
    cluster: "custom", // Valeur arbitraire, ignorée avec wsHost
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    forceTLS: false,
    enabledTransports: ["ws"],
    disableStats: true,
});

const echo = new Echo({
    broadcaster: "reverb",
    client: pusherClient,
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
    wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
    wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
    forceTLS: false,
    enabledTransports: ["ws"],
});

export default echo;
```

- **Avantage** : Simple et rapide.
- **Inconvénient** : Ajoute une propriété inutile (`cluster`) qui n’est pas utilisée par Reverb.

---

#### **Option 2 : Étendre les types de `pusher-js` pour rendre `cluster` optionnel**
- Créez un fichier de déclaration TypeScript pour surcharger les types de `pusher-js` et rendre `cluster` optionnel, ce qui correspond mieux à votre cas d’utilisation avec Reverb.

1. **Créez un fichier de déclaration** :
    - Dans `dashboard-admin/src/types/` (créez le dossier si nécessaire), ajoutez un fichier nommé `pusher.d.ts` :
      ```typescript
      declare module "pusher-js" {
          interface Options {
              cluster?: string; // Rendre cluster optionnel
              wsHost?: string;
              wsPort?: number;
              wssPort?: number;
              forceTLS?: boolean;
              enabledTransports?: string[];
              disableStats?: boolean;
              // Ajoutez d'autres propriétés si nécessaire
          }
      }
      ```

2. **Utilisez la configuration sans `cluster`** :
    - Votre `echo.ts` reste inchangé, sans besoin d’ajouter `cluster` :
      ```typescript
      "use client";
 
      import Echo from "laravel-echo";
      import Pusher from "pusher-js";
 
      const pusherClient = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY || "my-reverb-key", {
          wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
          wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
          wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
          forceTLS: false,
          enabledTransports: ["ws"],
          disableStats: true,
      });
 
      const echo = new Echo({
          broadcaster: "reverb",
          client: pusherClient,
          key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
          wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
          wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
          wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
          forceTLS: false,
          enabledTransports: ["ws"],
      });
 
      export default echo;
      ```

3. **Mettez à jour `tsconfig.json`** (si nécessaire) :
    - Assurez-vous que TypeScript inclut votre dossier de types. Ajoutez ceci dans `tsconfig.json` si ce n’est pas déjà fait :
      ```json
      {
          "compilerOptions": {
              "typeRoots": ["./src/types", "./node_modules/@types"]
          }
      }
      ```

- **Avantage** : Plus propre, reflète fidèlement votre utilisation avec Reverb, et évite d’ajouter des propriétés inutiles.
- **Inconvénient** : Nécessite un fichier supplémentaire et une petite configuration.

---

#### **Option 3 : Ignorer l’erreur avec `@ts-ignore` (moins recommandé)**
- Si vous voulez une solution rapide sans modifier les types :
  ```typescript
  const pusherClient = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY || "my-reverb-key", {
      // @ts-ignore
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
      forceTLS: false,
      enabledTransports: ["ws"],
      disableStats: true,
  });
  ```
- **Avantage** : Rapide.
- **Inconvénient** : Ignore la vérification de type, ce qui peut masquer d’autres problèmes potentiels.

---

### **Recommandation**
Je vous recommande **l’Option 2** (étendre les types), car elle est plus robuste et adaptée à votre cas d’utilisation avec Reverb. Voici les étapes concrètes :

1. **Créez `src/types/pusher.d.ts`** :
   ```typescript
   declare module "pusher-js" {
       interface Options {
           cluster?: string; // Optionnel
           wsHost?: string;
           wsPort?: number;
           wssPort?: number;
           forceTLS?: boolean;
           enabledTransports?: string[];
           disableStats?: boolean;
       }
   }
   ```

2. **Gardez `echo.ts` sans `cluster`** :
   ```typescript
   "use client";

   import Echo from "laravel-echo";
   import Pusher from "pusher-js";

   const pusherClient = new Pusher(process.env.NEXT_PUBLIC_REVERB_APP_KEY || "my-reverb-key", {
       wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
       wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
       wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
       forceTLS: false,
       enabledTransports: ["ws"],
       disableStats: true,
   });

   const echo = new Echo({
       broadcaster: "reverb",
       client: pusherClient,
       key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
       wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
       wsPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
       wssPort: process.env.NEXT_PUBLIC_REVERB_PORT || 8080,
       forceTLS: false,
       enabledTransports: ["ws"],
   });

   export default echo;
   ```

3. **Redémarrez TypeScript et Next.js** :
    - Assurez-vous que votre éditeur (comme VS Code) recharge les types.
    - Relancez le serveur :
      ```bash
      npm run dev
      ```

---

### **Résultat attendu**
- L’erreur TypeScript disparaît.
- La connexion WebSocket avec Reverb fonctionne correctement sans `cluster`, car elle repose sur `wsHost` et `wsPort`.

---

### **Vérification**
- Ajoutez un étudiant via `StudentManager.tsx`.
- Vérifiez dans la console du navigateur (F12 > Console) si des erreurs persistent ou si l’événement `StudentRegistered` est reçu dans `NotificationDropdown.tsx`.

Si vous avez encore des problèmes après cela, partagez-moi le contenu exact de `echo.ts` et les logs/erreurs, et je vous aiderai à finaliser !


Merci pour les nouveaux logs et le code mis à jour de `StudentRegistered.php`. Votre observation est cruciale : les logs `"Définition du canal de diffusion"` et `"Données prêtes pour la diffusion"` n’apparaissent pas dans `laravel.log`, alors que `"Préparation de la diffusion de StudentRegistered"` est bien présent. Cela signifie que les méthodes `broadcastOn()` et `broadcastWith()` ne sont **pas appelées**, ce qui explique pourquoi l’événement ne parvient pas à Reverb ni au frontend.

Analysons pourquoi ces méthodes ne sont pas exécutées et corrigeons le problème.

---

### **Analyse des logs et du code**

#### **Logs actuels (`laravel.log`)**
```
[2025-03-09 08:55:04] local.INFO: Broadcaster actuel {"driver":"reverb"}
[2025-03-09 08:56:17] local.INFO: Préparation de la diffusion de StudentRegistered {"notification":{"training_id":1,"title":"Test","message":"Test","sent_at":"2025-03-09 08:56:11","updated_at":"2025-03-09T08:56:11.000000Z","created_at":"2025-03-09T08:56:11.000000Z","id":17},"channel":"notifications","event":"StudentRegistered"}
[2025-03-09 08:56:29] local.INFO: Broadcaster actuel {"driver":"reverb"}
```
- `"Préparation de la diffusion de StudentRegistered"` : Apparaît, donc le constructeur est appelé.
- `"Définition du canal de diffusion"` et `"Données prêtes pour la diffusion"` : Absents, donc `broadcastOn()` et `broadcastWith()` ne sont pas exécutés.
- `"Broadcaster actuel" : "reverb"` : Confirme que le driver est bien `reverb`.

#### **Code de `StudentRegistered.php`**
```php
class StudentRegistered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
        Log::info("Préparation de la diffusion de StudentRegistered", [...]);
    }

    public function broadcastOn()
    {
        Log::info("Définition du canal de diffusion", ['channel' => 'notifications']);
        return new Channel('notifications');
    }

    public function broadcastAs()
    {
        return 'StudentRegistered';
    }

    public function broadcastWith()
    {
        $data = [...];
        Log::info("Données prêtes pour la diffusion", $data);
        return $data;
    }
}
```
- L’événement implémente `ShouldBroadcast`, ce qui est correct pour une diffusion via Reverb.
- Le constructeur fonctionne (log présent), mais les méthodes de diffusion ne sont pas appelées.

#### **Problème identifié**
- **L’événement n’est pas traité comme un événement diffusé** :
    - Bien que `ShouldBroadcast` soit implémenté, Laravel ne semble pas invoquer les méthodes `broadcastOn()`, `broadcastAs()`, et `broadcastWith()`. Cela peut arriver si :
        1. **L’événement est traité de manière synchrone** au lieu d’être envoyé à la file d’attente (queue) ou au broadcaster.
        2. **La configuration de la file d’attente ou du broadcaster interfère**.

- **Reverb ne reçoit rien** :
    - Si ces méthodes ne sont pas appelées, aucune donnée n’est envoyée à Reverb, d’où l’absence de `[INFO] Broadcasting event [StudentRegistered] on [notifications]` dans les logs Reverb.

---

### **Pourquoi `broadcastOn()` et `broadcastWith()` ne sont pas appelés ?**

#### **1. File d’attente (Queue) mal configurée**
- Par défaut, les événements qui implémentent `ShouldBroadcast` sont diffusés via la file d’attente (queue) de Laravel si `QUEUE_CONNECTION` n’est pas `sync`. Si la file d’attente n’est pas traitée (par exemple, pas de worker actif), l’événement est mis en attente et non diffusé immédiatement.
- Votre `.env` indique :
  ```
  QUEUE_CONNECTION=database
  ```
    - Cela signifie que les événements sont envoyés à la table `jobs` dans votre base de données, mais aucun worker ne les traite.

#### **2. Pas de worker actif**
- Avec `QUEUE_CONNECTION=database`, vous devez exécuter un worker (`php artisan queue:work`) pour traiter les tâches en file d’attente. Sans cela, l’événement reste bloqué dans la table `jobs`.

#### **Preuve**
- Vérifiez votre base de données PostgreSQL (`auto_ecole`), table `jobs` :
  ```sql
  SELECT * FROM jobs;
  ```
- Si vous trouvez une entrée après avoir exécuté Tinker, cela confirme que l’événement est en attente dans la file d’attente.

---

### **Solution**

#### **Option 1 : Exécuter un worker pour traiter la file d’attente**
1. **Démarrez Reverb** :
   ```bash
   php artisan reverb:start --debug
   ```
2. **Démarrez un worker dans un autre terminal** :
   ```bash
   php artisan queue:work --queue=default
   ```
    - Laissez ce terminal ouvert pour traiter les tâches en continu.

3. **Testez avec Tinker dans un troisième terminal** :
   ```bash
   php artisan tinker
   ```
   ```php
   $notification = App\Models\Notification::create(['training_id' => 1, 'title' => 'Test', 'message' => 'Test', 'sent_at' => now()]);
   event(new App\Events\StudentRegistered($notification));
   ```

4. **Vérifiez les logs** :
    - **Laravel (`laravel.log`)** :
      ```
      [2025-03-09 ...] local.INFO: Préparation de la diffusion de StudentRegistered ...
      [2025-03-09 ...] local.INFO: Définition du canal de diffusion {"channel":"notifications"}
      [2025-03-09 ...] local.INFO: Données prêtes pour la diffusion {"notification": ...}
      ```
    - **Reverb** :
      ```
      [INFO] Broadcasting event [StudentRegistered] on [notifications]
      ```
    - **Console frontend** :
      ```
      Événement StudentRegistered reçu (global): {notification: {id: 17, title: "Test", ...}}
      ```

#### **Option 2 : Forcer une diffusion synchrone (pour tester)**
- Changez temporairement `QUEUE_CONNECTION` dans `.env` pour éviter la file d’attente :
  ```
  QUEUE_CONNECTION=sync
  ```
- Videz le cache :
  ```bash
  php artisan config:cache
  ```
- Testez avec Tinker :
  ```bash
  php artisan tinker
  ```
  ```php
  $notification = App\Models\Notification::create(['training_id' => 1, 'title' => 'Test', 'message' => 'Test', 'sent_at' => now()]);
  event(new App\Events\StudentRegistered($notification));
  ```

- Avec `sync`, l’événement sera diffusé immédiatement sans passer par la file d’attente.

#### **Option 3 : Ajouter un trait ShouldBroadcastNow**
- Si vous voulez éviter la file d’attente sans changer `QUEUE_CONNECTION`, utilisez le trait `ShouldBroadcastNow` au lieu de `ShouldBroadcast` :
  ```php
  namespace App\Events;

  use App\Models\Notification;
  use Illuminate\Broadcasting\Channel;
  use Illuminate\Broadcasting\InteractsWithSockets;
  use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // Changement ici
  use Illuminate\Foundation\Events\Dispatchable;
  use Illuminate\Queue\SerializesModels;
  use Illuminate\Support\Facades\Log;

  class StudentRegistered implements ShouldBroadcastNow
  {
      use Dispatchable, InteractsWithSockets, SerializesModels;

      public $notification;

      public function __construct(Notification $notification)
      {
          $this->notification = $notification;
          Log::info("Préparation de la diffusion de StudentRegistered", [...]);
      }

      public function broadcastOn()
      {
          Log::info("Définition du canal de diffusion", ['channel' => 'notifications']);
          return new Channel('notifications');
      }

      public function broadcastAs()
      {
          return 'StudentRegistered';
      }

      public function broadcastWith()
      {
          $data = [...];
          Log::info("Données prêtes pour la diffusion", $data);
          return $data;
      }
  }
  ```
- Testez à nouveau avec Tinker.

---

### **Pourquoi ça ne marchait pas avant ?**
- Avec `QUEUE_CONNECTION=database`, l’événement était envoyé à la file d’attente au lieu d’être diffusé directement. Sans worker (`queue:work`), il restait en attente dans la table `jobs`, et les méthodes `broadcastOn()` et `broadcastWith()` n’étaient pas appelées immédiatement.

---

### **Résultat attendu**
- Avec un worker actif ou `QUEUE_CONNECTION=sync` ou `ShouldBroadcastNow` :
    - **Laravel log** :
      ```
      [2025-03-09 ...] local.INFO: Préparation de la diffusion de StudentRegistered ...
      [2025-03-09 ...] local.INFO: Définition du canal de diffusion {"channel":"notifications"}
      [2025-03-09 ...] local.INFO: Données prêtes pour la diffusion {"notification": ...}
      ```
    - **Reverb log** :
      ```
      [INFO] Broadcasting event [StudentRegistered] on [notifications]
      ```
    - **Console frontend** :
      ```
      Événement StudentRegistered reçu (global): {notification: {id: 17, title: "Test", ...}}
      ```

---

### **Prochaines étapes**
1. **Testez une des options ci-dessus** :
    - Option 1 (worker) pour une solution production-ready.
    - Option 2 (sync) pour un test rapide.
    - Option 3 (ShouldBroadcastNow) pour contourner la file d’attente temporairement.

2. **Partagez les résultats** :
    - Les nouveaux logs Laravel après le test.
    - Les logs Reverb après le test.
    - Les logs frontend après le test.

Avec ces ajustements, je suis certain que nous verrons les logs manquants et que l’événement atteindra le frontend. Dites-moi ce que vous obtenez !