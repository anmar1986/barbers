import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/constants/app_colors.dart';

/// Shimmer Loading Widget
/// Animated loading placeholder
class ShimmerLoading extends StatelessWidget {
  final Widget child;

  const ShimmerLoading({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.borderLight,
      highlightColor: AppColors.surfaceWhite,
      child: child,
    );
  }
}

/// Shimmer Box - Common rectangle placeholder
class ShimmerBox extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerBox({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    return ShimmerLoading(
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

/// Shimmer Circle - For avatars/profile pictures
class ShimmerCircle extends StatelessWidget {
  final double size;

  const ShimmerCircle({super.key, required this.size});

  @override
  Widget build(BuildContext context) {
    return ShimmerLoading(
      child: Container(
        width: size,
        height: size,
        decoration: const BoxDecoration(
          color: AppColors.surfaceWhite,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}

/// Shimmer List Item - Common card loading state
class ShimmerListItem extends StatelessWidget {
  const ShimmerListItem({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          const ShimmerCircle(size: 48),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ShimmerBox(
                  width: MediaQuery.of(context).size.width * 0.5,
                  height: 16,
                ),
                const SizedBox(height: 8),
                ShimmerBox(
                  width: MediaQuery.of(context).size.width * 0.3,
                  height: 14,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Shimmer Card - For card loading states
class ShimmerCard extends StatelessWidget {
  final double height;

  const ShimmerCard({super.key, this.height = 200});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerBox(
            width: double.infinity,
            height: height,
            borderRadius: 12,
          ),
          const SizedBox(height: 12),
          ShimmerBox(
            width: MediaQuery.of(context).size.width * 0.7,
            height: 20,
          ),
          const SizedBox(height: 8),
          ShimmerBox(
            width: MediaQuery.of(context).size.width * 0.5,
            height: 16,
          ),
        ],
      ),
    );
  }
}
