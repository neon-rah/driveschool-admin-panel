<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
use HasFactory;

protected $fillable = [
'training_id',
'title',
'message',
'sent_at',
'is_read',
];

public function training()
{
return $this->belongsTo(Training::class);
}
}