<?php

namespace App\Http\Controllers;

use App\Models\Training;
use Illuminate\Http\Request;
use App\Services\ImageUploadService;

class TrainingController extends Controller
{
    /**
     * Récupérer toutes les formations.
     */
    public function index()
    {
        $trainings = Training::with('category')
            ->get();
        return response()->json(['trainings' => $trainings], 200);

    }

    /**
     * Créer une nouvelle formation.
     */
    public function store(Request $request)
    {
        $data = $request->all();
        $validator = Training::validate($data);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

    // traitement d'image

        try{
            if($request->hasFile('covering')){
                $data['covering'] = ImageUploadService::uploadImage($request->file('covering'), 'trainings', 'training');
            }
        }catch(\Exception $e){
             return response()->json(['errors' => ['upload' => $e->getMessage()]], 422);
        }

        $training = Training::create($data);
        // Créer automatiquement deux examens prédéfinis
        $training->exams()->createMany([
            [
                'name' => 'Code',
                'type' => 'Théorique',
                'date' => null, // Date à définir plus tard par l'admin
            ],
            [
                'name' => 'Conduite',
                'type' => 'Pratique',
                'date' => null,
            ],
        ]);
        $training->load('category'); // Charger la relation category

        return response()->json(['message' => 'Formation créée avec succès.', 'training' => $training], 201);
    }


    /**
     * Mettre à jour une formation existante.
     */

    public function update(Request $request, $id)
    {
        $training = Training::findOrFail($id);
        $data = $request->all();
        $validator = Training::validate($data);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

    // traitement d'image

            try{
                if($request->hasFile('covering')){
                ImageUploadService::deleteImage($training->covering);
                    $data['covering'] = ImageUploadService::uploadImage($request->file('covering'), 'trainings', 'training');
                }else{
                    $data['covering'] = $training->covering;
                }
            }catch(\Exception $e){
                 return response()->json(['errors' => ['upload' => $e->getMessage()]], 422);
            }

        $training->update($data);
        $training->load('category'); // Charger la relation category

        return response()->json(['message' => 'Formation mise à jour avec succès.', 'training' => $training], 200);
    }

    /**
     * Récupérer les détails d'une formation spécifique.
     */
    public function show($id)
    {
        try {
            $training = Training::with('category')->findOrFail($id);
            return response()->json(['training' => $training], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Formation non trouvée : ' . $e->getMessage()], 404);
        }
    }



    /**
     * Supprimer une formation.
     */
    public function destroy($id)
    {
        $training = Training::findOrFail($id);

        ImageUploadService::deleteImage($training->covering);
        // Suppression de la formation
        $training->delete();

        return response()->json(['message' => 'Formation supprimée avec succès.'], 200);
    }

    public function getCategories()
    {
        $categories = \App\Models\Category::all(['id', 'name']);
        return response()->json($categories, 200);
    }

    /**
     * Récupérer toutes les formations en cours sans pagination.
     */
    public function getActiveTrainings()
    {
        $trainings = Training::where('start_date', '>=', now()->startOfDay())
            ->where('registration_end_date', '>=', now()->startOfDay())
            ->with('category')
            ->get();
        return response()->json(['trainings' => $trainings], 200);
    }
    /**
     * Récupérer les cours d'une formation.
     */
    public function getCourses($id)
    {
        try {
            $training = Training::with('courses')->findOrFail($id);
            $courses = $training->courses->map(function ($course) {
                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'type' => $course->type,
                    'file_path' => $course->file_path,
                ];
            });
            return response()->json(['courses' => $courses], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la récupération des cours : ' . $e->getMessage()], 404);
        }
    }

    /**
     * Récupérer les étudiants d'une formation.
     */
    public function getStudents($id)
    {
        try {
            $training = Training::findOrFail($id);
            $students = $training->students()
            ->where('status', 'validated')
            ->get();
            return response()->json(['students' => $students], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la récupération des étudiants : ' . $e->getMessage()], 404);
        }
    }


    /**
     * Vérifie et termine une formation si tous les examens ont des résultats, puis notifie les étudiants
     */
    public function finishTraining(Request $request, $trainingId)
    {
        $training = Training::findOrFail($trainingId);

        if ($training->checkAndFinishTraining()) {
            return response()->json([
                'message' => "La formation #{$training->id} est marquée comme terminée et les étudiants ont été notifiés."
            ], 200);
        }

        return response()->json([
            'message' => "La formation ne peut pas être terminée : certains examens n'ont pas de résultats."
        ], 400);
    }

    /**
     * Récupère les résultats globaux de tous les étudiants pour toutes les formations terminées
     */
    public function getAllGlobalFinishedTrainingResults(Request $request)
    {
        $results = Training::getGlobalResultsForAllFinishedTrainings();

        return response()->json([
            'message' => "Résultats globaux des étudiants pour toutes les formations terminées.",
            'results' => $results,
        ], 200);
    }
}
