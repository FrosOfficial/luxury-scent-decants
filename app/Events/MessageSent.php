<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ChatMessage $message,
        public readonly string $sessionId,
    ) {}

    /**
     * Broadcast on:
     *  - chat.{sessionId}     (public — the guest/customer listens here)
     *  - admin-chats          (private — all admin users listen here for notifications)
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('chat.' . $this->sessionId),
            new PrivateChannel('admin-chats'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id'              => $this->message->id,
            'chat_session_id' => $this->sessionId,
            'sender'          => $this->message->sender,
            'message'         => $this->message->message,
            'created_at'      => $this->message->created_at->toIso8601String(),
        ];
    }
}
