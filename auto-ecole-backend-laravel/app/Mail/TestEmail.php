<?php
// app/Mail/TestEmail.php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TestEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function build()
    {
        return $this->from(env('MAIL_FROM_ADDRESS'))
                            ->subject('Test d\'envoi d\'email')
                            ->view('test');

    }
}
