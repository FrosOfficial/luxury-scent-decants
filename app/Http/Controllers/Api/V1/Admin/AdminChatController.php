<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminChatController extends Controller
{
    /**
     * List all chat sessions, prioritising escalated/unread ones.
     */
    public function index(): JsonResponse
    {
        $sessions = ChatSession::with(['messages' => function ($q) {
                $q->latest()->limit(1);
            }])
            ->orderByDesc('is_escalated')
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($session) {
                return [
                    'id'              => $session->id,
                    'display_name'    => $session->display_name,
                    'display_email'   => $session->display_email,
                    'is_escalated'    => $session->is_escalated,
                    'is_closed'       => $session->is_closed,
                    'last_message_at' => $session->last_message_at?->toIso8601String(),
                    'created_at'      => $session->created_at->toIso8601String(),
                    'last_message'    => $session->messages->first()?->message,
                ];
            });

        return response()->json(['data' => $sessions]);
    }

    /**
     * Get full message history for a session.
     */
    public function show(string $sessionId): JsonResponse
    {
        $session = ChatSession::with('messages')->find($sessionId);

        if (! $session) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        return response()->json([
            'session'  => [
                'id'            => $session->id,
                'display_name'  => $session->display_name,
                'display_email' => $session->display_email,
                'is_escalated'  => $session->is_escalated,
                'is_closed'     => $session->is_closed,
                'created_at'    => $session->created_at->toIso8601String(),
            ],
            'messages' => $session->messages->map(fn ($m) => [
                'id'         => $m->id,
                'sender'     => $m->sender,
                'message'    => $m->message,
                'created_at' => $m->created_at->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Admin sends a reply to the guest.
     */
    public function reply(Request $request, string $sessionId): JsonResponse
    {
        $session = ChatSession::find($sessionId);

        if (! $session) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        if ($session->is_closed) {
            return response()->json(['message' => 'Cannot reply to a closed session.'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $admin = \App\Models\Admin::where('email', \Illuminate\Support\Facades\Auth::user()->email)->first();

        $msg = ChatMessage::create([
            'id'              => Str::uuid(),
            'chat_session_id' => $sessionId,
            'sender'          => ChatMessage::SENDER_ADMIN,
            'admin_id'        => $admin ? $admin->id : null,
            'message'         => $validated['message'],
        ]);

        $session->update(['last_message_at' => now()]);

        broadcast(new MessageSent($msg, $sessionId));

        return response()->json(['message' => $msg]);
    }

    /**
     * Close a chat session.
     */
    public function close(string $sessionId): JsonResponse
    {
        $session = ChatSession::find($sessionId);

        if (! $session) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        $session->update(['is_closed' => true]);

        // Send a system message that the chat is closed
        $msg = ChatMessage::create([
            'id'              => Str::uuid(),
            'chat_session_id' => $sessionId,
            'sender'          => ChatMessage::SENDER_SYSTEM,
            'message'         => '🔒 This conversation has been closed by the seller.',
        ]);

        broadcast(new MessageSent($msg, $sessionId));

        return response()->json([
            'session' => [
                'id'            => $session->id,
                'display_name'  => $session->display_name,
                'display_email' => $session->display_email,
                'is_escalated'  => $session->is_escalated,
                'is_closed'     => $session->is_closed,
                'created_at'    => $session->created_at->toIso8601String(),
            ],
            'message' => $msg
        ]);
    }
}
