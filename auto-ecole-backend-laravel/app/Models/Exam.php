<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Exam extends Model
{
    use HasFactory;


    protected $table = 'exams';


    protected $fillable = [
        'training_id',
        'name',
        'type',
        'date'
    ];


    /**
     * Validation des données avant l'enregistrement de l'examen.
     */
    public static function validate($data)
    {
        $validator = Validator::make($data, [
            'training_id' => 'required|exists:trainings,id',
            'name' => 'required|string|max:100',
            'date' => 'required|date|after:today'
        ], [
            'training_id.required' => 'Le champ formation est obligatoire.',
            'training_id.exists' => 'La formation spécifiée n\'existe pas.',
            'name.required' => 'Le champ nom de l\'examen est obligatoire.',
            'name.string' => 'Le nom de l\'examen doit être une chaîne de caractères.',
            'name.max' => 'Le nom de l\'examen ne doit pas dépasser 100 caractères.',
            'date.required' => 'Le champ date est obligatoire.',
            'date.date' => 'La date doit être valide.',
            'date.after' => 'La date doit être après aujourd\'hui.'
        ]);

        return $validator;
    }


    public function training()
    {
        return $this->belongsTo(Training::class);
    }


    public function results()
    {
        return $this->hasMany(Result::class);
    }
}
