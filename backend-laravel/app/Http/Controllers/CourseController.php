<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CourseController extends Controller
{
    /**
     * Liste tous les cours.
     */
    public function index()
    {
        $courses = Course::all();
        return response()->json(['courses' => $courses], 200);
    }

    /**
     * Récupérer tous les cours spécifiques.
     */
    public function getSpecificCourses()
    {
        try {
            $specificCourses = Course::where('type', 'specific')->get(['id', 'name', 'type', 'file_path']);
            return response()->json(['courses' => $specificCourses], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la récupération des cours spécifiques : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Affiche un cours spécifique.
     */
    public function show($id)
    {
        $course = Course::findOrFail($id);
        return response()->json(['course' => $course], 200);
    }

    /**
     * Crée un cours.
     */
    public function store(Request $request)
    {
        $data = $request->all();
        $validator = Course::validate($data);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Gérer l'upload du fichier PDF
            if ($request->hasFile('file')) {
                $data['file_path'] = FileUploadService::uploadPdf($request->file('file'), 'courses');
            }

            $course = Course::create($data);

            return response()->json(['message' => 'Cours créé avec succès.', 'course' => $course], 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Met à jour un cours avec remplacement du fichier PDF.
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $data = $request->all();
        $validator = Course::validate($data);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Remplacement du fichier si un nouveau fichier est fourni
            if ($request->hasFile('file')) {
                // Supprime l'ancien fichier
                FileUploadService::deleteFile($course->file_path);

                // Upload du nouveau fichier
                $data['file_path'] = FileUploadService::uploadPdf($request->file('file'), 'courses');
            }

            $course->update($data);

            return response()->json(['message' => 'Cours mis à jour avec succès.', 'course' => $course], 200);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Supprime un cours ainsi que son fichier PDF associé.
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);

        // Supprime le fichier PDF associé
        FileUploadService::deleteFile($course->file_path);

        // Supprime le cours
        $course->delete();

        return response()->json(['message' => 'Cours supprimé avec succès.'], 200);
    }
}
