<?php

namespace App\Mail;

use App\Models\AppVersion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmployeeBroadcastMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public AppVersion $appVersion,
        public string $employeeName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pembaruan Aplikasi Bisa Absen v' . $this->appVersion->version,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.employee-broadcast',
            with: [
                'appVersion' => $this->appVersion,
                'employeeName' => $this->employeeName,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
