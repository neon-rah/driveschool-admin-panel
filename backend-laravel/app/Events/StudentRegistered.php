<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class StudentRegistered implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
        Log::info("Préparation de la diffusion de StudentRegistered", [
            'notification' => $notification->toArray(),
            'channel' => 'notifications',
            'event' => 'StudentRegistered'
        ]);
    }

    public function broadcastOn()
    {
        Log::info("Définition du canal de diffusion", ['channel' => 'notifications']);
        return new Channel('notifications');
    }



    public function broadcastWith()
    {
        $data = [
            'notification' => [
                'id' => $this->notification->id,
                'title' => $this->notification->title,
                'message' => $this->notification->message,
                'sent_at' => $this->notification->sent_at->toISOString(),
                'is_read' => $this->notification->is_read ?? false,
            ],
        ];
        Log::info("Données prêtes pour la diffusion", $data);
        return $data;
    }
}