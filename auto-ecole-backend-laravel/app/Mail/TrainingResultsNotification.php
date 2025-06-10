<?php 

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TrainingResultsNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $student;
    public $results;

    public function __construct($student, $results)
    {
        $this->student = $student;
        $this->results = $results;
    }

    public function build()
    {
        return $this->subject('Résultats de votre formation')
            ->view('training_results')
            ->with([
                'student' => $this->student,
                'results' => $this->results,
            ]);
    }
}