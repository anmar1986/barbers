import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Loading Spinner Widget
/// Circular progress indicator with customizable size and color
class LoadingSpinner extends StatelessWidget {
  final double size;
  final Color? color;
  final double strokeWidth;

  const LoadingSpinner({
    super.key,
    this.size = 24,
    this.color,
    this.strokeWidth = 2,
  });

  const LoadingSpinner.small({
    super.key,
    this.color,
  })  : size = 16,
        strokeWidth = 2;

  const LoadingSpinner.medium({
    super.key,
    this.color,
  })  : size = 24,
        strokeWidth = 2;

  const LoadingSpinner.large({
    super.key,
    this.color,
  })  : size = 40,
        strokeWidth = 3;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: strokeWidth,
        valueColor: AlwaysStoppedAnimation<Color>(
          color ?? AppColors.primary,
        ),
      ),
    );
  }
}

/// Centered loading spinner with optional message
class LoadingScreen extends StatelessWidget {
  final String? message;

  const LoadingScreen({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const LoadingSpinner.large(),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(
              message!,
              style: const TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
