import 'package:flutter/material.dart';

/// App Color Palette
/// Brand colors matching the web application
/// IMPORTANT: ALWAYS use these colors, NEVER use Colors.* directly
class AppColors {
  // Prevent instantiation
  AppColors._();

  // ==================== PRIMARY COLORS ====================

  /// Primary Blue - Main brand color
  /// Used for: Primary buttons, active states, links
  static const Color primary = Color(0xFF1E40AF);

  /// Primary variants
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color primaryDark = Color(0xFF1E3A8A);

  /// Secondary Purple
  /// Used for: Secondary buttons, accents, highlights
  static const Color secondary = Color(0xFF7C3AED);

  /// Secondary variants
  static const Color secondaryLight = Color(0xFF9F67FF);
  static const Color secondaryDark = Color(0xFF5B21B6);

  /// Accent Amber
  /// Used for: Call-to-action, featured items, special badges
  static const Color accent = Color(0xFFF59E0B);

  /// Accent variants
  static const Color accentLight = Color(0xFFFBBF24);
  static const Color accentDark = Color(0xFFD97706);

  // ==================== NEUTRAL COLORS ====================

  /// Background colors
  static const Color backgroundWhite = Color(0xFFFFFFFF);
  static const Color backgroundGrey = Color(0xFFF9FAFB);

  /// Surface colors (cards, containers)
  static const Color surface = Color(0xFFF9FAFB);
  static const Color surfaceWhite = Color(0xFFFFFFFF);

  /// Border colors
  static const Color border = Color(0xFFE5E7EB);
  static const Color borderLight = Color(0xFFF3F4F6);
  static const Color borderDark = Color(0xFFD1D5DB);

  /// Text colors
  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textDisabled = Color(0xFF9CA3AF);
  static const Color textWhite = Color(0xFFFFFFFF);

  // ==================== STATUS COLORS ====================

  /// Success - Green
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFF34D399);
  static const Color successDark = Color(0xFF059669);
  static const Color successBackground = Color(0xFFD1FAE5);

  /// Error - Red
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFF87171);
  static const Color errorDark = Color(0xFFDC2626);
  static const Color errorBackground = Color(0xFFFEE2E2);

  /// Warning - Amber/Orange
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFBBF24);
  static const Color warningDark = Color(0xFFD97706);
  static const Color warningBackground = Color(0xFFFEF3C7);

  /// Info - Blue
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFF60A5FA);
  static const Color infoDark = Color(0xFF2563EB);
  static const Color infoBackground = Color(0xFFDCEEFD);

  // ==================== SEMANTIC COLORS ====================

  /// Like/Favorite - Red/Pink
  static const Color like = Color(0xFFEC4899);
  static const Color likeActive = Color(0xFFDB2777);

  /// Star Rating - Yellow
  static const Color star = Color(0xFFFBBF24);
  static const Color starInactive = Color(0xFFE5E7EB);

  /// Open/Closed status
  static const Color open = Color(0xFF10B981);
  static const Color closed = Color(0xFFEF4444);

  /// Verified badge
  static const Color verified = Color(0xFF3B82F6);

  /// Premium/Featured
  static const Color premium = Color(0xFFD97706);

  // ==================== SOCIAL COLORS ====================

  static const Color facebook = Color(0xFF1877F2);
  static const Color google = Color(0xFFDB4437);
  static const Color apple = Color(0xFF000000);
  static const Color twitter = Color(0xFF1DA1F2);
  static const Color instagram = Color(0xFFE4405F);
  static const Color whatsapp = Color(0xFF25D366);

  // ==================== GRADIENT COLORS ====================

  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryLight],
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [secondary, secondaryLight],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accent, accentLight],
  );

  /// Shimmer loading gradient
  static const LinearGradient shimmerGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFFF3F4F6),
      Color(0xFFE5E7EB),
      Color(0xFFF3F4F6),
    ],
  );

  // ==================== OVERLAY COLORS ====================

  /// Dark overlays for images/videos
  static const Color overlayDark = Color(0x80000000);
  static const Color overlayMedium = Color(0x40000000);
  static const Color overlayLight = Color(0x20000000);

  /// White overlays
  static const Color overlayWhite = Color(0x80FFFFFF);

  // ==================== SHADOW COLORS ====================

  static const Color shadowLight = Color(0x0A000000);
  static const Color shadowMedium = Color(0x1A000000);
  static const Color shadowDark = Color(0x33000000);

  // ==================== DARK MODE COLORS ====================

  /// Dark mode backgrounds
  static const Color darkBackground = Color(0xFF111827);
  static const Color darkSurface = Color(0xFF1F2937);
  static const Color darkSurfaceLight = Color(0xFF374151);

  /// Dark mode text
  static const Color darkTextPrimary = Color(0xFFF9FAFB);
  static const Color darkTextSecondary = Color(0xFFD1D5DB);

  /// Dark mode border
  static const Color darkBorder = Color(0xFF374151);
}
