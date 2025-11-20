import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Empty State Widget
/// Displays when no data/content is available
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? message;
  final String? actionText;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.actionText,
    this.onAction,
  });

  // Common empty states
  const EmptyState.noResults({super.key})
      : icon = Icons.search_off,
        title = 'No Results Found',
        message = 'Try adjusting your search or filters',
        actionText = null,
        onAction = null;

  const EmptyState.noData({
    super.key,
    String? customMessage,
  })  : icon = Icons.inbox_outlined,
        title = 'No Data Available',
        message = customMessage ?? 'There is no data to display',
        actionText = null,
        onAction = null;

  const EmptyState.noBookings({super.key})
      : icon = Icons.event_busy_outlined,
        title = 'No Bookings Yet',
        message = 'Your booking history will appear here',
        actionText = 'Browse Barbers',
        onAction = null;

  const EmptyState.noVideos({super.key})
      : icon = Icons.videocam_off_outlined,
        title = 'No Videos Yet',
        message = 'Start exploring or create your first video',
        actionText = 'Explore Videos',
        onAction = null;

  const EmptyState.noMessages({super.key})
      : icon = Icons.chat_bubble_outline,
        title = 'No Messages',
        message = 'Your conversations will appear here',
        actionText = null,
        onAction = null;

  const EmptyState.emptyCart({super.key})
      : icon = Icons.shopping_cart_outlined,
        title = 'Your Cart is Empty',
        message = 'Add some products to get started',
        actionText = 'Shop Now',
        onAction = null;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.backgroundGrey,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 64,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            if (message != null) ...[
              const SizedBox(height: 8),
              Text(
                message!,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionText != null && onAction != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onAction,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.textWhite,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                ),
                child: Text(actionText!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
