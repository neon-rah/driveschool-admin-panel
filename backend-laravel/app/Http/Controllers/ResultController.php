<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Result;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    /**
     * Liste des résultats d'examen pour un administrateur.
     */
    public function index($examId)
    {
        $exam = Exam::findOrFail($examId);
        $results = $exam->results()->with('student')->get();
        return response()->json(['results' => $results], 200);
    }

    public function store(Request $request, $examId)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'score' => 'required|numeric|min:0|max:20',
        ]);

        $threshold = 10; // Seuil de réussite (configurable si besoin)
        $passed = $request->score >= $threshold;

        $result = Result::updateOrCreate(
            ['exam_id' => $examId, 'student_id' => $request->student_id],
            ['score' => $request->score, 'passed' => $passed]
        );

        return response()->json(['result' => $result, 'message' => 'Note enregistrée'], 200);
    }
    /**
     * Afficher les détails d'un résultat spécifique.
     */
    public function show($id)
    {
        $result = Result::with('exam', 'student')->find($id);

        if (!$result) {
            return response()->json(['message' => 'Résultat non trouvé.'], 404);
        }

        return response()->json($result);
    }

    /**
     * Mettre à jour un résultat d'examen existant.
     */
    public function update(Request $request, $id)
    {
        $result = Result::find($id);

        if (!$result) {
            return response()->json(['message' => 'Résultat non trouvé.'], 404);
        }

        // Validation des données
        $validator = Result::validate($request->all());

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Mise à jour du résultat
        $result->update($request->all());

        return response()->json([
            'message' => 'Résultat mis à jour avec succès.',
            'data' => $result
        ]);
    }

    /**
     * Supprimer un résultat d'examen.
     */
    public function destroy($id)
    {
        $result = Result::find($id);

        if (!$result) {
            return response()->json(['message' => 'Résultat non trouvé.'], 404);
        }

        $result->delete();

        return response()->json(['message' => 'Résultat supprimé avec succès.']);
    }
}
