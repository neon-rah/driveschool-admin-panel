<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Result;
use App\Models\Student;
use App\Models\Training;
use Carbon\Carbon;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    public function getGlobalStatistics()
    {
        // 1. Nombre total d'étudiants inscrits
        $totalStudents = Student::count();

        // 2. Nombre de formations terminées
        $completedTrainings = Training::where('is_finished', true)->count();

        // 3. Taux de réussite global
        $totalResults = Result::count();
        $passedResults = Result::where('passed', true)->count();
        $globalSuccessRate = $totalResults > 0 ? ($passedResults / $totalResults) * 100 : 0;

        // 4. Inscriptions mensuelles (12 derniers mois)
        $startDate = Student::min('created_at') ?? now()->subYears(1); // Ajuster la plage si nécessaire
        $monthlyRegistrationsRaw = Student::selectRaw("TO_CHAR(created_at, 'Mon') as month, EXTRACT(YEAR FROM created_at) as year, COUNT(*) as count")
            ->groupByRaw("EXTRACT(YEAR FROM created_at), TO_CHAR(created_at, 'Mon')")
            ->orderBy('year', 'asc')
            ->orderByRaw("MIN(EXTRACT(MONTH FROM created_at)) asc")
            ->where('created_at', '>=', $startDate)
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->month => $item->count];
            });

        // Préparer les données pour le graphique (remplir les mois manquants avec 0)
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $registrationsData = [];
        $currentMonthIndex = now()->subMonths(12)->month - 1;
        for ($i = 0; $i < 12; $i++) {
            $monthName = $months[($currentMonthIndex + $i) % 12];
            $registrationsData[$monthName] = $monthlyRegistrationsRaw[$monthName] ?? 0;
        }

        // 5. Taux de réussite mensuel (12 derniers mois)
        $startDateResults = Result::min('created_at') ?? now()->subYears(1);
        $monthlySuccessRatesRaw = Result::selectRaw("TO_CHAR(results.created_at, 'Mon') as month, EXTRACT(YEAR FROM results.created_at) as year, AVG(CASE WHEN passed THEN 100 ELSE 0 END) as success_rate")
            ->groupByRaw("EXTRACT(YEAR FROM results.created_at), TO_CHAR(results.created_at, 'Mon')")
            ->orderBy('year', 'asc')
            ->orderByRaw("MIN(EXTRACT(MONTH FROM results.created_at)) asc")
            ->where('results.created_at', '>=', $startDateResults)
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->month => round($item->success_rate, 2)];
            });

        // Préparer les données pour le graphique (remplir les mois manquants avec 0)
        $successRateData = [];
        for ($i = 0; $i < 12; $i++) {
            $monthName = $months[($currentMonthIndex + $i) % 12];
            $successRateData[$monthName] = $monthlySuccessRatesRaw[$monthName] ?? 0;
        }

        return response()->json([
            'total_students' => $totalStudents,
            'completed_trainings' => $completedTrainings,
            'global_success_rate' => round($globalSuccessRate, 2),
            'monthly_registrations' => array_values($registrationsData),
            'monthly_success_rates' => array_values($successRateData),
            'target_success_rate' => 85,
        ], 200);
    }
}