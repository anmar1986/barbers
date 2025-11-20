import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

/// Custom Icon Button Widget
/// Circular or square icon button with various styles
class IconButtonWidget extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? iconColor;
  final double size;
  final double iconSize;
  final bool isCircular;
  final String? tooltip;

  const IconButtonWidget({
    super.key,
    required this.icon,
    this.onPressed,
    this.backgroundColor,
    this.iconColor,
    this.size = 40,
    this.iconSize = 20,
    this.isCircular = true,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    final widget = Material(
      color: backgroundColor ?? AppColors.backgroundGrey,
      shape: isCircular
          ? const CircleBorder()
          : RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
      child: InkWell(
        onTap: onPressed,
        customBorder: isCircular
            ? const CircleBorder()
            : RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
        child: SizedBox(
          width: size,
          height: size,
          child: Icon(
            icon,
            size: iconSize,
            color: iconColor ?? AppColors.textPrimary,
          ),
        ),
      ),
    );

    if (tooltip != null) {
      return Tooltip(
        message: tooltip!,
        child: widget,
      );
    }

    return widget;
  }
}
