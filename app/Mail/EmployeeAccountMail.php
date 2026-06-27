<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Bus\Queueable;

class EmployeeAccountMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user, $password;

    public function __construct($user, $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Akun BK Absensi');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.employee-account');
    }

    public function attachments(): array
    {
        return [];
    }
}
