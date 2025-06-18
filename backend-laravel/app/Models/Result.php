<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Result extends Model
{
    use HasFactory;


    protected $table = 'results';


    protected $fillable = [
        'exam_id',
        'student_id',
        'score',
        'passed'
    ];


    /**
     * Validation des données avant l'enregistrement du résultat.
     */
    public static function validate($data)
    {
        $validator = Validator::make($data, [
            'exam_id' => 'required|exists:exams,id',
            'student_id' => 'required|exists:students,id',
            'score' => 'required|numeric|min:0|max:100',

        ], [
            'exam_id.required' => 'Le champ examen est obligatoire.',
            'exam_id.exists' => 'L\'examen spécifié n\'existe pas.',
            'student_id.required' => 'Le champ étudiant est obligatoire.',
            'student_id.exists' => 'L\'étudiant spécifié n\'existe pas.',
            'score.required' => 'Le champ score est obligatoire.',
            'score.numeric' => 'Le score doit être un nombre.',
            'score.min' => 'Le score ne peut pas être inférieur à 0.',
            'score.max' => 'Le score ne peut pas être supérieur à 100.',
            'status.required' => 'Le champ statut est obligatoire.'
        ]);

        return $validator;
    }


    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }


    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
