<?php

namespace App\Services;

use App\Modules\User\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Create a notification for a user
     */
    public function create(
        int $userId,
        string $type,
        string $title,
        string $message,
        array $data = []
    ): Notification {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Create notifications for multiple users
     */
    public function createForUsers(
        array $userIds,
        string $type,
        string $title,
        string $message,
        array $data = []
    ): void {
        foreach ($userIds as $userId) {
            $this->create($userId, $type, $title, $message, $data);
        }
    }

    /**
     * Create notification when someone likes a video
     */
    public function videoLiked(int $videoOwnerId, string $likerName, string $videoTitle, string $videoUuid): Notification
    {
        return $this->create(
            $videoOwnerId,
            'like',
            'New Like on Your Video',
            "{$likerName} liked your video \"{$videoTitle}\"",
            [
                'video_uuid' => $videoUuid,
                'url' => "/videos/{$videoUuid}",
            ]
        );
    }

    /**
     * Create notification when someone comments on a video
     */
    public function videoCommented(int $videoOwnerId, string $commenterName, string $videoTitle, string $videoUuid): Notification
    {
        return $this->create(
            $videoOwnerId,
            'comment',
            'New Comment on Your Video',
            "{$commenterName} commented on your video \"{$videoTitle}\"",
            [
                'video_uuid' => $videoUuid,
                'url' => "/videos/{$videoUuid}",
            ]
        );
    }

    /**
     * Create notification for new order
     */
    public function newOrder(int $businessOwnerId, string $orderNumber, float $total): Notification
    {
        return $this->create(
            $businessOwnerId,
            'order',
            'New Order Received',
            "You received a new order #{$orderNumber} for ${$total}",
            [
                'order_number' => $orderNumber,
                'url' => "/management/orders/{$orderNumber}",
            ]
        );
    }

    /**
     * Create notification for order status update
     */
    public function orderStatusUpdated(int $customerId, string $orderNumber, string $status): Notification
    {
        $statusMessages = [
            'processing' => 'Your order is now being processed',
            'shipped' => 'Your order has been shipped',
            'delivered' => 'Your order has been delivered',
            'cancelled' => 'Your order has been cancelled',
        ];

        return $this->create(
            $customerId,
            'order',
            'Order Status Updated',
            $statusMessages[$status] ?? "Your order status has been updated to {$status}",
            [
                'order_number' => $orderNumber,
                'status' => $status,
                'url' => "/orders/{$orderNumber}",
            ]
        );
    }

    /**
     * Create notification for booking confirmation
     */
    public function bookingConfirmed(int $customerId, string $businessName, string $serviceDate): Notification
    {
        return $this->create(
            $customerId,
            'success',
            'Booking Confirmed',
            "Your booking at {$businessName} for {$serviceDate} has been confirmed",
            [
                'business_name' => $businessName,
                'service_date' => $serviceDate,
            ]
        );
    }

    /**
     * Create notification for booking reminder
     */
    public function bookingReminder(int $customerId, string $businessName, string $serviceDate): Notification
    {
        return $this->create(
            $customerId,
            'info',
            'Booking Reminder',
            "Reminder: You have a booking at {$businessName} on {$serviceDate}",
            [
                'business_name' => $businessName,
                'service_date' => $serviceDate,
            ]
        );
    }

    /**
     * Create notification for new follower
     */
    public function newFollower(int $businessOwnerId, string $followerName): Notification
    {
        return $this->create(
            $businessOwnerId,
            'follow',
            'New Follower',
            "{$followerName} started following your business",
            []
        );
    }

    /**
     * Create notification for business verification
     */
    public function businessVerified(int $businessOwnerId): Notification
    {
        return $this->create(
            $businessOwnerId,
            'success',
            'Business Verified',
            'Congratulations! Your business has been verified',
            [
                'url' => '/management',
            ]
        );
    }

    /**
     * Create notification for payment received
     */
    public function paymentReceived(int $businessOwnerId, float $amount, string $orderNumber): Notification
    {
        return $this->create(
            $businessOwnerId,
            'payment',
            'Payment Received',
            "You received a payment of ${$amount} for order #{$orderNumber}",
            [
                'amount' => $amount,
                'order_number' => $orderNumber,
            ]
        );
    }

    /**
     * Create welcome notification for new users
     */
    public function welcomeUser(int $userId, string $firstName): Notification
    {
        return $this->create(
            $userId,
            'info',
            'Welcome to Barber Social!',
            "Hi {$firstName}! Welcome to our platform. Start exploring businesses, videos, and products.",
            [
                'url' => '/',
            ]
        );
    }

    /**
     * Get unread count for a user
     */
    public function getUnreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $notificationId): bool
    {
        $notification = Notification::find($notificationId);
        if ($notification) {
            $notification->markAsRead();
            return true;
        }
        return false;
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }
}
