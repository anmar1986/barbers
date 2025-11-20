import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Error Widget
/// Displays error messages with retry option
class ErrorDisplay extends StatelessWidget {
  final String message;
  final String? details;
  final VoidCallback? onRetry;

  const ErrorDisplay({
    super.key,
    required this.message,
    this.details,
    this.onRetry,
  });

  // Common error states
  const ErrorDisplay.network({super.key, this.onRetry})
      : message = 'Connection Error',
        details = 'Please check your internet connection and try again';

  const ErrorDisplay.server({super.key, this.onRetry})
      : message = 'Server Error',
        details = 'Something went wrong on our end. Please try again later';

  const ErrorDisplay.notFound({super.key})
      : message = 'Not Found',
        details = 'The requested resource could not be found',
        onRetry = null;

  const ErrorDisplay.unauthorized({super.key})
      : message = 'Unauthorized',
        details = 'Please login to access this content',
        onRetry = null;

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
                color: AppColors.errorBackground,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.error,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              message,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            if (details != null) ...[
              const SizedBox(height: 8),
              Text(
                details!,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Try Again'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.textWhite,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
