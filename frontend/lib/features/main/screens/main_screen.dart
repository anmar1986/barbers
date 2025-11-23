import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';

/// Main Screen with Bottom Navigation (LTR Layout)
/// Navbar order from right to left: Profile, Barbers, Shop, Beauty, Videos
/// Which means left to right: Videos, Beauty, Shop, Barbers, Profile
class MainScreen extends ConsumerStatefulWidget {
  final Widget child;

  const MainScreen({super.key, required this.child});

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
  // Navigation items order (left to right): Videos, Beauty, Shop, Barbers, Profile
  final List<_NavigationItem> _navigationItems = const [
    _NavigationItem(
      icon: Icons.play_circle_outline,
      activeIcon: Icons.play_circle,
      label: 'Videos',
      route: AppRoutes.videos,
    ),
    _NavigationItem(
      icon: Icons.spa_outlined,
      activeIcon: Icons.spa,
      label: 'Beauty',
      route: AppRoutes.beauty,
    ),
    _NavigationItem(
      icon: Icons.shopping_bag_outlined,
      activeIcon: Icons.shopping_bag,
      label: 'Shop',
      route: AppRoutes.shop,
    ),
    _NavigationItem(
      icon: Icons.content_cut_outlined,
      activeIcon: Icons.content_cut,
      label: 'Barbers',
      route: AppRoutes.barbers,
    ),
    _NavigationItem(
      icon: Icons.person_outline,
      activeIcon: Icons.person,
      label: 'Profile',
      route: AppRoutes.profile,
    ),
  ];

  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();

    // Check which tab route the current location belongs to
    if (location.startsWith('/videos') || location.startsWith('/video')) {
      return 0;
    } else if (location.startsWith('/beauty') ||
        location.startsWith('/beauty-service')) {
      return 1;
    } else if (location.startsWith('/shop') ||
        location.startsWith('/product') ||
        location.startsWith('/cart') ||
        location.startsWith('/checkout')) {
      return 2;
    } else if (location.startsWith('/barbers') ||
        location.startsWith('/barber')) {
      return 3;
    } else if (location.startsWith('/profile') ||
        location.startsWith('/settings')) {
      return 4;
    }

    // Default to Shop (center)
    return 2;
  }

  void _onTabTapped(int index) {
    final route = _navigationItems[index].route;
    context.go(route);
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _getSelectedIndex(context);

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          boxShadow: [
            BoxShadow(
              color: AppColors.shadowMedium,
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(
                _navigationItems.length,
                (index) => _NavigationButton(
                  item: _navigationItems[index],
                  isActive: currentIndex == index,
                  onTap: () => _onTabTapped(index),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Navigation Item Model
class _NavigationItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String route;

  const _NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.route,
  });
}

/// Navigation Button Widget
class _NavigationButton extends StatelessWidget {
  final _NavigationItem item;
  final bool isActive;
  final VoidCallback onTap;

  const _NavigationButton({
    required this.item,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isActive ? item.activeIcon : item.icon,
                color: isActive ? AppColors.primary : AppColors.textSecondary,
                size: 24,
              ),
              const SizedBox(height: 4),
              Text(
                item.label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                  color: isActive ? AppColors.primary : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
