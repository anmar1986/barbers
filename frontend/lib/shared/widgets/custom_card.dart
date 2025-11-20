import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Custom Card Widget
/// Reusable card container with consistent styling
class CustomCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final double borderRadius;
  final Color? color;
  final List<BoxShadow>? boxShadow;
  final VoidCallback? onTap;

  const CustomCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.borderRadius = 12,
    this.color,
    this.boxShadow,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cardWidget = Container(
      margin: margin,
      decoration: BoxDecoration(
        color: color ?? AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: boxShadow ??
            [
              BoxShadow(
                color: AppColors.shadowMedium,
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
      ),
      child: Padding(
        padding: padding ?? const EdgeInsets.all(16),
        child: child,
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(borderRadius),
        child: cardWidget,
      );
    }

    return cardWidget;
  }
}
