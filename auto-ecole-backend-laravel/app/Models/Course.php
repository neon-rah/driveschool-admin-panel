<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Course extends Model
{
    use HasFactory;

  
    protected $table = 'courses';

   
    protected $fillable = [
        'name',
        'type',
        'file_path'
    ];

    /**
     * Règles de validation pour l'ajout/modification d'un cours.
     */
    public static $rules = [
        'name' => 'required|string|max:100',
        'type' => 'required|string|max:50',
        'file' => 'nullable|file|mimes:pdf|max:10240', // Max 10MB, uniquement PDF
    ];

    /**
     * Messages d'erreur personnalisés.
     */
    public static $messages = [
        'name.required' => 'Le nom du cours est requis.',
        'name.string' => 'Le nom doit être une chaîne de caractères.',
        'name.max' => 'Le nom ne doit pas dépasser 100 caractères.',
        'type.required' => 'Le type de cours est requis.',
        'type.string' => 'Le type doit être une chaîne de caractères.',
        'type.max' => 'Le type ne doit pas dépasser 50 caractères.',
        'file.file' => 'Le fichier doit être un fichier valide.',
        'file.mimes' => 'Le fichier doit être un PDF.',
        'file.max' => 'Le fichier ne doit pas dépasser 10 Mo.',
    ];

    public static function validate($data)
    {
        return Validator::make($data, self::$rules, self::$messages);
    }

    
    public function trainings()
    {
        return $this->belongsToMany(Training::class, 'training_courses');
    }

    public function trainingCourses()
    {
        return $this->hasMany(TrainingCourse::class);
    }

}
