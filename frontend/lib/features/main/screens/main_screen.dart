import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../profile/screens/profile_tab_screen.dart';
import '../../businesses/screens/businesses_tab_screen.dart';
import '../../shop/screens/shop_tab_screen.dart';
import '../../videos/screens/videos_tab_screen.dart';

/// Main Screen with Bottom Navigation
/// Contains 5 main tabs of the application
class MainScreen extends ConsumerStatefulWidget {
  const MainScreen({super.key});

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
  int _currentIndex = 0;

  // Tab screens
  final List<Widget> _screens = const [
    ProfileTabScreen(),
    BusinessesTabScreen(),
    VideosTabScreen(),
    ShopTabScreen(),
    ProfileTabScreen(), // Will be replaced with Settings/More
  ];

  // Navigation items
  final List<_NavigationItem> _navigationItems = const [
    _NavigationItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home,
      label: 'Home',
    ),
    _NavigationItem(
      icon: Icons.store_outlined,
      activeIcon: Icons.store,
      label: 'Discover',
    ),
    _NavigationItem(
      icon: Icons.video_library_outlined,
      activeIcon: Icons.video_library,
      label: 'Videos',
    ),
    _NavigationItem(
      icon: Icons.shopping_bag_outlined,
      activeIcon: Icons.shopping_bag,
      label: 'Shop',
    ),
    _NavigationItem(
      icon: Icons.person_outline,
      activeIcon: Icons.person,
      label: 'Profile',
    ),
  ];

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
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
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(
                _navigationItems.length,
                (index) => _NavigationButton(
                  item: _navigationItems[index],
                  isActive: _currentIndex == index,
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

  const _NavigationItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
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
                size: 26,
              ),
              const SizedBox(height: 4),
              Text(
                item.label,
                style: TextStyle(
                  fontSize: 12,
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
