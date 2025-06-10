<?php

namespace App\Http\Controllers;

use App\Events\StudentRegistered;
use App\Mail\StudentApproved;
use App\Mail\StudentRejected;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Student;
use App\Models\Training;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;


class StudentController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->all();
        $validator = Student::validate($data, false); // Ajout

        if ($validator->fails()) {
            return Response()->json(['errors' => $validator->errors()], 422);
        }

        // Validation des prérequis de catégorie
        if (!empty($data['training_id'])) {
            $training = Training::find($data['training_id']);
            if (!$training || !$this->validateCategoryPrerequisites($data['previous_license'] ?? null, $training->category_id)) {
                return response()->json(['errors' => ['category' => 'Les prérequis de catégorie ne sont pas satisfaits.']], 422);
            }
        }

        // Traitement des fichiers après validation
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
        } catch (\Exception $e) {
            return response()->json(['errors' => ['upload' => $e->getMessage()]], 422);
        }

        $student = new Student();
        $student->fill($data);
        if (!empty($data['password'])) {
            $student->password = Hash::make($data['password']);
        }
        $student->save();

        // Créer une notification
        $notification = Notification::create([
            'training_id' => $student->training_id,
            'title' => 'Nouvelle inscription',
            'message' => "Nouvelle inscription : {$student->last_name}" .
                ($student->first_name ? " {$student->first_name}" : '') .
                ", {$student->email}",
            'sent_at' => now(),
        ]);

        Log::info("Événement StudentRegistered déclenché", ['notification' => $notification->toArray()]);
        // Déclencher l'événement
        event(new StudentRegistered($notification));

        Log::info("Après diffusion de StudentRegistered");
        Log::info("Broadcaster actuel", ['driver' => config('broadcasting.default')]);

        return response()->json(['message' => 'Student created successfully', 'student' => $student], 201);
    }

    private function validateCategoryPrerequisites(?string $previousLicense, ?int $categoryId): bool
    {
        if (!$categoryId || !$previousLicense) {
            return true; // Pas de prérequis à vérifier si l'un des deux est null
        }

        $category = Category::find($categoryId);
        if (!$category || !$category->prerequisite_category_id) {
            return true; // Pas de prérequis défini
        }

        return $previousLicense == $category->prerequisite_category_id;
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $data = $request->all();
        Log::info("Données reçues dans update :", [
            'method' => $request->method(), // Devrait être POST
            'input' => $request->all(),     // Données du formulaire
            'files' => $request->files->all() // Fichiers envoyés
        ]);
        $data['id'] = $id;

        $validator = Student::validate($data, true);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validation des prérequis de catégorie (si training_id est modifié)
        if (!empty($data['training_id'])) {
            $training = Training::find($data['training_id']);
            if (!$training || !$this->validateCategoryPrerequisites($data['previous_license'] ?? null, $training->category_id)) {
                return response()->json(['errors' => ['category' => 'Les prérequis de catégorie ne sont pas satisfaits.']], 422);
            }
        }

        // Gestion des images : ne mettre à jour que si un nouveau fichier est envoyé
        try {
            if ($request->hasFile('profile_picture')) {
                ImageUploadService::deleteImage($student->profile_picture); // Supprimer l’ancienne image
                $data['profile_picture'] = ImageUploadService::uploadImage($request->file('profile_picture'), 'students', 'student');
            } else {
                $data['profile_picture'] = $student->profile_picture; // Conserver l’existante
            }

            if ($request->hasFile('residence_certificate')) {
                ImageUploadService::deleteImage($student->residence_certificate);
                $data['residence_certificate'] = ImageUploadService::uploadImage($request->file('residence_certificate'), 'students', 'residence');
            } else {
                $data['residence_certificate'] = $student->residence_certificate;
            }

            if ($request->hasFile('payment_receipt')) {
                ImageUploadService::deleteImage($student->payment_receipt);
                $data['payment_receipt'] = ImageUploadService::uploadImage($request->file('payment_receipt'), 'students', 'receipt');
            } else {
                $data['payment_receipt'] = $student->payment_receipt;
            }
        } catch (\Exception $e) {
            return response()->json(['errors' => ['upload' => $e->getMessage()]], 422);
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $student->update($data);

        return response()->json(['message' => 'Student updated successfully', 'student' => $student], 200);
    }

    public function index()
    {
        $students = Student::paginate(10);
        return response()->json($students, 200);
    }
    public function getAllStudents()
    {
        try {
            $students = Student::where('status', 'validated')
                ->with('training:id,title')
                ->paginate(10)
                ->all();
            return response()->json($students, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la récupération des étudiants : ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $student = Student::findOrFail($id);
        return response()->json(['student' => $student], 200);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);

        ImageUploadService::deleteImage($student->profile_picture);
        ImageUploadService::deleteImage($student->residence_certificate);
        ImageUploadService::deleteImage($student->payment_receipt);

        $student->delete();

        return response()->json(['message' => 'Student deleted successfully'], 200);
    }


    public function pendingStudents()
    {
        try {
            $students = Student::where('status', 'pending')
                ->with('training:id,title')
                ->get();
            return response()->json($students, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la récupération des étudiants : ' . $e->getMessage()], 500);
        }
    }

    public function approveStudent($id)
    {
        try {
            $student = Student::findOrFail($id);
            if ($student->status !== 'pending') {
                return response()->json(['error' => 'Cet étudiant n’est pas en attente'], 400);
            }

            $student->status = 'validated';
            $student->save();

            $loginUrl = env('FRONTEND_URL', 'http://localhost:3001') . '/register-user';
            Mail::to($student->email)->send(new StudentApproved($student, $loginUrl));

            return response()->json(['message' => 'Étudiant validé avec succès', 'student' => $student], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la validation : ' . $e->getMessage()], 500);
        }
    }

    public function rejectStudent(Request $request, $id)
    {
        try {
            $student = Student::findOrFail($id);
            if ($student->status !== 'pending') {
                return response()->json(['error' => 'Cet étudiant n’est pas en attente'], 400);
            }

            $reason = $request->input('reason', 'Aucune raison spécifiée');
            $student->status = 'rejected';
            $student->save();

            Mail::to($student->email)->send(new StudentRejected($student, $reason));

            return response()->json(['message' => 'Étudiant rejeté avec succès', 'student' => $student], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors du rejet : ' . $e->getMessage()], 500);
        }
    }


    public function getStudentsInFormation(Request $request, $id)
    {
        try {
            $students = Student::where('training_id', $id)
                ->where('status', 'validated')
                ->get();
            return response()->json($students, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la récupération des étudiants de la formation : ' . $e->getMessage()], 500);
        }

    }



    /** Notification API */

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


}
