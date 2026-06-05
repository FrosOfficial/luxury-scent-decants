<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    // ─── FAQ Knowledge Base ───────────────────────────────────────────────────

    private const FAQS = [
        [
            'keywords' => ['shipping', 'delivery', 'nationwide', 'tagum', 'courier', 'ship'],
            'answer'   => "We offer **free delivery within Tagum City** for all orders 🚚. We also ship nationwide across the Philippines via local couriers. Just fill in your delivery address at checkout!",
        ],
        [
            'keywords' => ['decant', 'fresh decant', 'what is', 'bottle'],
            'answer'   => "A **Fresh Decant** is the original luxury perfume poured straight into a clean, premium travel-size glass bottle. We bottle it by hand using sterile syringes right when you order, so the scent stays 100% fresh and untouched ✨.",
        ],
        [
            'keywords' => ['original', 'authentic', 'full bottle', 'retail', 'fake'],
            'answer'   => "You're getting a **premium travel-size decant** (e.g., 2ml, 5ml, 10ml) from the original authentic bottle — NOT the full retail bottle. It's the perfect way to test a luxury scent before investing in the full price. All our fragrances are 100% authentic and sourced directly 🏆.",
        ],
        [
            'keywords' => ['order', 'checkout', 'payment', 'gcash', 'cod', 'cash', 'maya', 'bank', 'rcbc'],
            'answer'   => "To order, add your chosen decants to your inquiry bag and head to checkout. We accept **Cash on Delivery (COD), GCash, Maya, and RCBC Online Banking**. A premium digital invoice is generated instantly after checkout 📜.",
        ],
        [
            'keywords' => ['price', 'cost', 'how much', 'ml', 'volume', 'size'],
            'answer'   => "Our decants start at around ₱490 for 2ml samples up to ₱4,890 for 30ml of ultra-premium fragrances. Each product page shows exact pricing by volume. Check the shop to find your perfect size! 💛",
        ],
        [
            'keywords' => ['louis vuitton', 'lv', 'imagination', 'ombre nomade', 'symphony', 'attrape reves'],
            'answer'   => "We carry several Louis Vuitton fragrances including **Imagination, Ombre Nomade, Symphony**, and more. You can browse all LV decants in our shop. Want me to help find a specific one? 🌸",
        ],
        [
            'keywords' => ['creed', 'aventus', 'green irish', 'silver mountain'],
            'answer'   => "We stock Creed fragrances like **Aventus** and others. Head to the Shop and filter by brand to see all available Creed decants! 👑",
        ],
        [
            'keywords' => ['track', 'tracking', 'where is my order', 'status'],
            'answer'   => "After your order is placed, you can track its status by logging into your account and checking **My Orders**. Our team processes orders within 1-2 business days. For urgent tracking questions, click **Talk to Seller** and we'll update you right away! 📦",
        ],
        [
            'keywords' => ['return', 'refund', 'exchange', 'cancel'],
            'answer'   => "Since our decants are freshly poured by hand per order, we generally do not accept returns for hygiene reasons. However, if there's an issue with your order (damaged, wrong item), please contact us immediately via **Talk to Seller** and we'll make it right! 🤝",
        ],
        [
            'keywords' => ['contact', 'seller', 'human', 'help', 'support', 'talk'],
            'answer'   => "Sure! Click the **Talk to Seller** button below and I'll connect you with our team right away 👇",
        ],
    ];

    // ─── Start a Chat Session ─────────────────────────────────────────────────

    public function startSession(Request $request): JsonResponse
    {
        if (Auth::check()) {
            $request->merge(['user_id' => Auth::id()]);
        }

        $validated = $request->validate([
            'guest_name'  => 'required_without:user_id|string|max:100',
            'guest_email' => 'required_without:user_id|email|max:255',
            'user_id'     => 'nullable',
        ]);

        $userId = Auth::id();

        if (!$userId) {
            $this->validateGuestCensorship($validated);
        }

        $session = ChatSession::create([
            'id'          => Str::uuid(),
            'guest_name'  => $userId ? null : ($validated['guest_name'] ?? null),
            'guest_email' => $userId ? null : ($validated['guest_email'] ?? null),
            'user_id'     => $userId,
            'is_escalated' => false,
        ]);

        // Welcome system message
        $welcomeMsg = ChatMessage::create([
            'id'              => Str::uuid(),
            'chat_session_id' => $session->id,
            'sender'          => ChatMessage::SENDER_SYSTEM,
            'message'         => "👋 Hello " . ($session->display_name ?? 'there') . "! I'm the Luxury Scent AI assistant. I can help you with shipping info, fragrance questions, pricing, and more. Type your question below, or click **Talk to Seller** anytime to chat with our team directly!",
        ]);

        return response()->json([
            'session'         => $session,
            'welcome_message' => $welcomeMsg,
        ], 201);
    }

    /**
     * Validate chat guest details against common bad words and troll credentials.
     */
    private function validateGuestCensorship(array $data): void
    {
        $badWords = [
            'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'cock', 'whore', 'slut', 
            'troll', 'fake', 'spam', 'test', 'dummy', 'asdf', 'qwerty',
            'putangina', 'putang ina', 'gago', 'tarantado', 'tanga', 'ulol', 'bobo', 'hayop', 'tae'
        ];

        $trollDomains = [
            'mailinator.com', 'yopmail.com', '10minutemail.com', 'tempmail.com', 
            'trashmail.com', 'guerrillamail.com', 'sharklasers.com', 'getairmail.com', 
            'dispostable.com', 'burnmailer.com'
        ];

        $errors = [];

        // 1. Check guest_name
        $nameLower = strtolower($data['guest_name'] ?? '');
        foreach ($badWords as $word) {
            if (str_contains($nameLower, $word)) {
                $errors['guest_name'] = ['Prohibited or invalid name detected. Please use a valid name.'];
                break;
            }
        }

        // 2. Check guest_email
        $emailLower = strtolower($data['guest_email'] ?? '');
        foreach ($badWords as $word) {
            if (str_contains($emailLower, $word)) {
                $errors['guest_email'] = ['Prohibited or invalid email address detected.'];
                break;
            }
        }
        if (empty($errors['guest_email'])) {
            foreach ($trollDomains as $domain) {
                if (str_ends_with($emailLower, '@' . $domain) || str_contains($emailLower, '@' . $domain)) {
                    $errors['guest_email'] = ['Prohibited or temporary email provider detected. Please use a valid email address.'];
                    break;
                }
            }
        }

        if (!empty($errors)) {
            throw \Illuminate\Validation\ValidationException::withMessages($errors);
        }
    }

    // ─── Get Messages for a Session ──────────────────────────────────────────

    public function getMessages(string $sessionId): JsonResponse
    {
        $session = ChatSession::find($sessionId);

        if (! $session) {
            return response()->json(['message' => 'Chat session not found.'], 404);
        }

        return response()->json([
            'session'  => $session,
            'messages' => $session->messages,
        ]);
    }

    // ─── Send a Message ───────────────────────────────────────────────────────

    public function sendMessage(Request $request, string $sessionId): JsonResponse
    {
        $session = ChatSession::find($sessionId);

        if (! $session) {
            return response()->json(['message' => 'Chat session not found.'], 404);
        }

        if ($session->is_closed) {
            return response()->json(['message' => 'This conversation has been closed.'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        // Save user's message
        $userMsg = ChatMessage::create([
            'id'              => Str::uuid(),
            'chat_session_id' => $sessionId,
            'sender'          => ChatMessage::SENDER_USER,
            'message'         => $validated['message'],
        ]);

        $session->update(['last_message_at' => now()]);

        // Broadcast user message to admin
        broadcast(new MessageSent($userMsg, $sessionId))->toOthers();

        // If already escalated, skip AI — admin handles from here
        if ($session->is_escalated) {
            return response()->json(['message' => $userMsg]);
        }

        // Run AI auto-reply
        $aiReply = $this->generateAutoReply($validated['message'], $session);

        $replyMsg = ChatMessage::create([
            'id'              => Str::uuid(),
            'chat_session_id' => $sessionId,
            'sender'          => $aiReply['escalate'] ? ChatMessage::SENDER_SYSTEM : ChatMessage::SENDER_SYSTEM,
            'message'         => $aiReply['text'],
        ]);

        if ($aiReply['escalate']) {
            $session->update(['is_escalated' => true]);
        }

        broadcast(new MessageSent($replyMsg, $sessionId));

        return response()->json([
            'message'    => $userMsg,
            'ai_reply'   => $replyMsg,
            'escalated'  => $aiReply['escalate'],
        ]);
    }

    // ─── Manually Escalate a Session ─────────────────────────────────────────

    public function escalateSession(string $sessionId): JsonResponse
    {
        $session = ChatSession::find($sessionId);

        if (! $session) {
            return response()->json(['message' => 'Chat session not found.'], 404);
        }

        if ($session->is_closed) {
            return response()->json(['message' => 'Cannot escalate a closed conversation.'], 403);
        }

        $session->update(['is_escalated' => true]);

        $escalateMsg = ChatMessage::create([
            'id'              => Str::uuid(),
            'chat_session_id' => $sessionId,
            'sender'          => ChatMessage::SENDER_SYSTEM,
            'message'         => "✅ Got it! You've been connected to our seller. Please hold on — we'll get back to you shortly! 🙏",
        ]);

        broadcast(new MessageSent($escalateMsg, $sessionId));

        return response()->json([
            'session' => $session->fresh(),
            'message' => $escalateMsg,
        ]);
    }

    // ─── AI Auto-Reply Engine ─────────────────────────────────────────────────

    private function generateAutoReply(string $userMessage, ChatSession $session): array
    {
        $lower = strtolower($userMessage);
        $tokens = preg_split('/\s+/', $lower);

        // 1. Check against FAQ knowledge base
        $bestFaq   = null;
        $bestScore = 0;

        foreach (self::FAQS as $faq) {
            $score = 0;
            foreach ($faq['keywords'] as $keyword) {
                if (str_contains($lower, $keyword)) {
                    $score += strlen($keyword); // longer keyword match = higher score
                }
            }
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestFaq   = $faq;
            }
        }

        if ($bestScore >= 4) {
            return ['text' => $bestFaq['answer'], 'escalate' => false];
        }

        // 2. Search product catalog
        $matchedProducts = Product::with(['volumes', 'accords'])
            ->where(function ($q) use ($lower, $tokens) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$lower}%"])
                  ->orWhereRaw('LOWER(brand) LIKE ?', ["%{$lower}%"])
                  ->orWhereRaw('LOWER(scent_profile) LIKE ?', ["%{$lower}%"]);

                // Also search by individual tokens
                foreach ($tokens as $token) {
                    if (strlen($token) >= 3) {
                        $q->orWhereRaw('LOWER(name) LIKE ?', ["%{$token}%"])
                          ->orWhereRaw('LOWER(brand) LIKE ?', ["%{$token}%"]);
                    }
                }
            })
            ->where('is_active', true)
            ->limit(3)
            ->get();

        if ($matchedProducts->isNotEmpty()) {
            $lines = ["Here are some fragrances I found that match your query 🌸\n"];
            foreach ($matchedProducts as $product) {
                $cheapest = $product->volumes->sortBy('price')->first();
                $priceStr = $cheapest ? "from ₱" . number_format($cheapest->price) : '';
                $lines[]  = "**{$product->name}** by {$product->brand} — {$product->scent_profile} {$priceStr}";
            }
            $lines[] = "\nYou can browse and add them to your bag in our **Shop**. Need more info? Click **Talk to Seller**!";

            return ['text' => implode("\n", $lines), 'escalate' => false];
        }

        // 3. No match found — escalate to human
        $escalateText = "I couldn't find a specific answer to that question in our database 🙏. I'm connecting you with our seller now — they'll get back to you shortly!";

        return ['text' => $escalateText, 'escalate' => true];
    }
}
