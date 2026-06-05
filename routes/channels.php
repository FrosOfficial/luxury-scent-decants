<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel for admin-only live chat notifications
// Only users with role = 'admin' can subscribe
Broadcast::channel('admin-chats', function ($user) {
    return $user->isAdmin();
});
