<?php

namespace App\Mail;

use App\Models\Student;
use Illuminate\Mail\Mailable;

class StudentRejected extends Mailable
{
    public $student;
    public $reason;

    public function __construct(Student $student, string $reason)
    {
        $this->student = $student;
        $this->reason = $reason;
    }

    public function build()
    {
        return $this->subject('Votre inscription a été rejetée')
            ->view('student_rejected');
    }
}