<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingCourse extends Model
{
    use HasFactory;

    /**
     * Table associée au modèle.
     *
     * @var string
     */
    protected $table = 'training_courses';

    /**
     * Attributs modifiables.
     *
     * @var array
     */
    protected $fillable = [
        'training_id',
        'course_id'
    ];

    /**
     * Relation avec le modèle Training.
     */
    public function training()
    {
        return $this->belongsTo(Training::class);
    }

    /**
     * Relation avec le modèle Course.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
