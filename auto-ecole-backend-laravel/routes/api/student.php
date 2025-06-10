<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;

Route::prefix('students')->group(function () {
    Route::get('/', [StudentController::class, 'index']);          // Liste des étudiants (pagination)
    Route::post('/', [StudentController::class, 'store']);         // Création d'un étudiant
    Route::get('/{id}', [StudentController::class, 'show']);       // Détails d'un étudiant
    Route::put('/{id}', [StudentController::class, 'update']);     // Mise à jour d'un étudiant
    Route::delete('/{id}', [StudentController::class, 'destroy']); // Suppression d'un étudiant
});
