<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    /**
     * Liste de tous les examens (pour un administrateur).
     */
    public function index()
    {
        $exams = Exam::with('training')->get();
        return response()->json(['exams' => $exams], 200);
    }

    /**
     * Récupérer les examens d'une formation spécifique.
     */
    public function getTrainingExams($trainingId)
    {
        try {
            $exams = Exam::where('training_id', $trainingId)->get();
            return response()->json(['exams' => $exams], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la récupération des examens : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Créer un nouvel examen.
     */
    public function store(Request $request)
    {
        $validator = Exam::validate($request->all());

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $exam = Exam::create($request->all());

        return response()->json([
            'message' => 'Examen créé avec succès.',
            'exam' => $exam
        ], 201);
    }

    /**
     * Afficher les détails d'un examen spécifique.
     */
    public function show($id)
    {
        $exam = Exam::with('training')->find($id);

        if (!$exam) {
            return response()->json(['message' => 'Examen non trouvé.'], 404);
        }

        return response()->json(['exam' => $exam], 200);
    }

    /**
     * Mettre à jour un examen existant.
     */
    public function update(Request $request, $id)
    {
        $exam = Exam::find($id);

        if (!$exam) {
            return response()->json(['message' => 'Examen non trouvé.'], 404);
        }

        $validator = Exam::validate($request->all());

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $exam->update($request->all());

        return response()->json([
            'message' => 'Examen mis à jour avec succès.',
            'exam' => $exam
        ], 200);
    }

    /**
     * Supprimer un examen.
     */
    public function destroy($id)
    {
        $exam = Exam::find($id);

        if (!$exam) {
            return response()->json(['message' => 'Examen non trouvé.'], 404);
        }

        $exam->delete();

        return response()->json(['message' => 'Examen supprimé avec succès.'], 200);
    }
}