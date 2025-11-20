import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

/// Outlined Button Widget
/// Button with border, no fill
class OutlinedButtonWidget extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isDisabled;
  final IconData? icon;
  final double? width;
  final double height;
  final double borderRadius;
  final EdgeInsets padding;
  final Color borderColor;
  final Color textColor;

  const OutlinedButtonWidget({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isDisabled = false,
    this.icon,
    this.width,
    this.height = 48,
    this.borderRadius = 8,
    this.padding = const EdgeInsets.symmetric(horizontal: 24),
    this.borderColor = AppColors.primary,
    this.textColor = AppColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    final bool enabled = !isDisabled && !isLoading && onPressed != null;

    return SizedBox(
      width: width,
      height: height,
      child: OutlinedButton(
        onPressed: enabled ? onPressed : null,
        style: OutlinedButton.styleFrom(
          foregroundColor: textColor,
          disabledForegroundColor: AppColors.textDisabled,
          side: BorderSide(
            color: enabled ? borderColor : AppColors.borderLight,
            width: 1.5,
          ),
          padding: padding,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
        child: isLoading
            ? SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(textColor),
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 20),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
