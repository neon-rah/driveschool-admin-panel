<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    
    protected $table = 'categories';

   
    protected $fillable = [
        'name',
        'description',
        'age_minimum',
        'prerequisite_category_id',
    ];

    // relation père fils, table père ici
    public function trainings()
    {
        return $this->hasMany(Training::class);
    }
}
