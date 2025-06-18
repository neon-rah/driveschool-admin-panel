<?php

namespace App\Mail;

use App\Models\Student;
use Illuminate\Mail\Mailable;

class StudentApproved extends Mailable
{
    public $student;
    public $loginUrl;

    public function __construct(Student $student, string $loginUrl)
    {
        $this->student = $student;
        $this->loginUrl = $loginUrl;
    }

    public function build()
    {
        return $this->subject('Votre inscription a été validée')
            ->view('student_approved');
    }
}