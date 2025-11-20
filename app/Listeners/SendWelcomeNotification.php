<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Services\NotificationService;

class SendWelcomeNotification
{
    protected $notificationService;

    /**
     * Create the event listener.
     */
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(UserRegistered $event): void
    {
        $this->notificationService->welcomeUser(
            $event->user->id,
            $event->user->first_name
        );
    }
}
