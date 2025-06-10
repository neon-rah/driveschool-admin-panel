<?php

namespace App\Models;

use App\Mail\TrainingResultsNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class Training extends Model
{
    use HasFactory;

    /**
     * Table associée au modèle.
     *
     * @var string
     */
    protected $table = 'trainings';

    /**
     * Attributs modifiables.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'start_date',
        'duration_weeks',
        'price',
        'category_id',
        'schedule',
        'registration_end_date',
        'covering',
        'is_finished'
    ];

    /**
     * Cast du champ 'schedule' en tableau.
     */
    protected $casts = [
        'schedule' => 'array',  // Conversion du JSON en array pour une meilleure manipulation
    ];


    public static $rules = [
        'title' => 'required|string|min:3|max:255',
        'description' => 'required|string|min:5|max:1000',
        'start_date' => 'required|date|after_or_equal:today',
        'duration_weeks' => 'required|integer|min:1',
        'price' => 'required|numeric|min:0',
        'category_id' => 'required|exists:categories,id',
        'schedule' => 'nullable',
        'registration_end_date' => 'required|date|after_or_equal:today',
        'covering'=>'sometimes|file|image|mimes:jpeg,png,jpg|max:2048'
    ];

    public static $messages = [
        'title.required' => 'Le titre de la formation est requis.',
        'title.string' => 'Le titre doit être une chaîne de caractères.',
        'title.min' => 'Le titre au moins contenir 3 caractères.',
        'title.max' => 'Le titre ne doit pas dépasser 255 caractères.',
        'description.required' => 'La description est requise.',
        'description.string' => 'La description doit être une chaîne de caractères.',
        'description.min' => 'La description doit au moins contenir 5 caractères.',
        'description.max' => 'La description ne doit pas dépasser 1000 caractères.',
        'start_date.required' => 'La date de début est requise.',
        'start_date.date' => 'La date de début doit être une date valide.',
        'start_date.after_or_equal' => 'La date de début ne peut pas être antérieure à aujourd\'hui.',
        'duration_weeks.required' => 'La durée de la formation en semaines est requise.',
        'duration_weeks.integer' => 'La durée de la formation doit être un entier.',
        'duration_weeks.min' => 'La durée de la formation doit être d\'au moins 1 semaine.',
        'price.required' => 'Le prix de la formation est requis.',
        'price.numeric' => 'Le prix doit être un nombre.',
        'price.min' => 'Le prix ne peut pas être inférieur à 0.',
        'category_id.required' => 'La catégorie de la formation est requise.',
        'category_id.exists' => 'La catégorie sélectionnée est invalide.',
        'registration_end_date.required' => 'La date de fin d\'inscription est requise.',
        'registration_end_date.date' => 'La date de fin d\'inscription doit être une date valide.',
        'registration_end_date.after_or_equal' => 'La date de fin d\'inscription doit être égale ou postérieure à aujoudh\'ui ',
        'covering.file' => 'La photo de couverture doit être un fichier.',
         'covering.image' => 'La photo de couverture doit être une image.',
         'covering.mimes' => 'La photo de couverture doit être au format JPEG, PNG ou JPG.',
         'covering.max' => 'La photo de couverture ne doit pas dépasser 10 Mo.',
    ];

    public static function validate($data)
    {
        return Validator::make($data, self::$rules, self::$messages);
    }

    /**
     * Relation avec la catégorie.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relation un-à-plusieurs avec les étudiants.
     */
    public function students()
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Relation un-à-plusieurs avec les examens.
     */
    public function exams()
    {
        return $this->hasMany(Exam::class);
    }

    /**
     * Relation un-à-plusieurs avec TrainingCourse (table pivot).
     */
    public function trainingCourses()
    {
        return $this->hasMany(TrainingCourse::class);
    }

    /**
     * Relation plusieurs-à-plusieurs avec les cours.
     */
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'training_courses');
    }


    /**
     * Vérifie si tous les examens ont des résultats, termine la formation et notifie les étudiants
     *
     * @return bool
     */
    public function checkAndFinishTraining()
    {
        // Charger tous les examens avec leurs résultats
        $exams = $this->exams()->with('results')->get();

        // Vérifier si chaque examen a au moins un résultat
        foreach ($exams as $exam) {
            if ($exam->results->isEmpty()) {
                return false; // Un examen n'a pas de résultats, on ne finit pas
            }
        }

        // Si tous les examens ont des résultats, marquer comme terminé
        $this->is_finished = true;
        $this->save();

        // Calculer les résultats et envoyer des emails
        $this->notifyStudentsOfResults();

        return true;
    }

    /**
     * Calcule les résultats finaux et envoie des notifications aux étudiants
     *
     * @return array
     */
    protected function notifyStudentsOfResults()
    {
        // Récupérer les étudiants validés
        $students = $this->students()
            ->where('status', 'validated')
            ->with([
                'results' => function ($query) {
                    $query->whereIn('exam_id', $this->exams->pluck('id'));
                }
            ])
            ->get();

        $results = [];

        // Récupérer les deux derniers examens (par date)
        $lastTwoExams = $this->exams()->orderBy('date', 'desc')->take(2)->pluck('id');

        foreach ($students as $student) {
            $studentResults = $student->results;

            // Vérifier les résultats des deux derniers examens
            $lastTwoResults = $studentResults->whereIn('exam_id', $lastTwoExams)->pluck('passed');
            $isSuccessful = $lastTwoResults->count() === 2 && $lastTwoResults->every(fn($passed) => $passed);

            $results[$student->id] = [
                'student' => [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'email' => $student->email,
                ],
                'results' => $studentResults->map(fn($result) => [
                    'exam_id' => $result->exam_id,
                    'score' => $result->score,
                    'passed' => $result->passed,
                ])->all(),
                'final_result' => $isSuccessful ? 'Réussi' : 'Échoué',
            ];

            // Envoyer un email à l'étudiant
            Mail::to($student->email)->send(new TrainingResultsNotification($student, $results[$student->id]));
        }

        return $results;
    }

    /**
     * Récupère les résultats globaux de tous les étudiants pour toutes les formations terminées
     *
     * @return array
     */
    public static function getGlobalResultsForAllFinishedTrainings()
    {
        $trainings = self::where('is_finished', true)
            ->with(['students.results', 'exams'])
            ->get();

        $results = [];

        foreach ($trainings as $training) {
            $lastTwoExams = $training->exams()->orderBy('date', 'desc')->take(2)->pluck('id');

            foreach ($training->students as $student) {
                $studentResults = $student->results->whereIn('exam_id', $training->exams->pluck('id'));
                $lastTwoResults = $studentResults->whereIn('exam_id', $lastTwoExams)->pluck('passed');
                $isSuccessful = $lastTwoResults->count() === 2 && $lastTwoResults->every(fn($passed) => $passed);

                $results[] = [
                    'training_id' => $training->id,
                    'training_title' => $training->title,
                    'student_id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'email' => $student->email,
                    'status' => $student->status,
                    'results' => $studentResults->map(fn($result) => [
                        'exam_id' => $result->exam_id,
                        'score' => $result->score,
                        'passed' => $result->passed,
                    ])->all(),
                    'final_result' => $isSuccessful ? 'Réussi' : 'Échoué',
                ];
            }
        }

        return $results;
    }
}
