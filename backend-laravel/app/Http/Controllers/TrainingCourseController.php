<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\TrainingCourse;
use Illuminate\Http\Request;

class TrainingCourseController extends Controller
{
    /**
     * Liste des cours associés aux formations.
     */
    public function index()
    {
        $trainingCourses = TrainingCourse::with(['training', 'course'])->get();
        return response()->json($trainingCourses);
    }

    /**
     * Associer un cours à une formation.
     */
    public function store(Request $request)
    {
        // Création de l'association formation-cours
        $trainingCourse = TrainingCourse::create([
            'training_id' => $request->training_id,
            'course_id' => $request->course_id,
        ]);

        return response()->json([
            'message' => 'Cours associé à la formation avec succès.',
            'data' => $trainingCourse
        ], 201);
    }

    /**
     * Afficher un cours associé à une formation spécifique.
     */
    public function show($id)
    {
        $trainingCourse = TrainingCourse::with(['training', 'course'])->find($id);

        if (!$trainingCourse) {
            return response()->json(['message' => 'Association non trouvée.'], 404);
        }

        return response()->json($trainingCourse);
    }

    /**
     * Mettre à jour une association formation-cours.
     */
    public function update(Request $request, $id)
    {
        $trainingCourse = TrainingCourse::find($id);

        if (!$trainingCourse) {
            return response()->json(['message' => 'Association non trouvée.'], 404);
        }

        // Mise à jour de l'association
        $trainingCourse->update([
            'training_id' => $request->training_id,
            'course_id' => $request->course_id,
        ]);

        return response()->json([
            'message' => 'Association mise à jour avec succès.',
            'data' => $trainingCourse
        ]);
    }

    /**
     * Supprimer une association formation-cours.
     */
    public function destroy($id)
    {
        $trainingCourse = TrainingCourse::find($id);

        if (!$trainingCourse) {
            return response()->json(['message' => 'Association non trouvée.'], 404);
        }

        $trainingCourse->delete();

        return response()->json(['message' => 'Association supprimée avec succès.']);
    }


    /**
     * Associer un cours à une formation.
     */
    public function addCourseToTraining(Request $request, $trainingId)
    {
        try {
            $request->validate([
                'course_id' => 'required|exists:courses,id',
            ]);

            $training = Training::findOrFail($trainingId);
            if ($training->courses()->where('course_id', $request->course_id)->exists()) {
                return response()->json(['error' => 'Ce cours est déjà associé à la formation'], 400);
            }

            $trainingCourse = TrainingCourse::create([
                'training_id' => $trainingId,
                'course_id' => $request->course_id,
            ]);

            return response()->json([
                'message' => 'Cours associé avec succès',
                'course' => $training->courses()->find($request->course_id),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de l’association : ' . $e->getMessage()], 400);
        }
    }

    /**
     * Supprimer une association formation-cours.
     */
    public function removeCourseFromTraining(Request $request, $trainingId, $courseId)
    {
        try {
            $trainingCourse = TrainingCourse::where('training_id', $trainingId)
                ->where('course_id', $courseId)
                ->firstOrFail();

            $trainingCourse->delete();

            return response()->json(['message' => 'Cours retiré avec succès'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la suppression : ' . $e->getMessage()], 404);
        }
    }
}
