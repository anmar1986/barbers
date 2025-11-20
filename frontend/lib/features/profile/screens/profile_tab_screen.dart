import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/widgets.dart';
import '../../auth/providers/auth_provider.dart';

/// Profile Tab Screen
/// Main home/profile feed screen
class ProfileTabScreen extends ConsumerWidget {
  const ProfileTabScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final isLoading = ref.watch(isAuthLoadingProvider);

    if (isLoading) {
      return const LoadingScreen(message: 'Loading profile...');
    }

    if (user == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Not logged in'),
              ElevatedButton(
                onPressed: () => context.go(AppRoutes.login),
                child: const Text('Login'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            floating: true,
            backgroundColor: AppColors.primary,
            title: const Text('Barber Social'),
            actions: [
              IconButton(
                icon: const Icon(Icons.search),
                onPressed: () => context.push(AppRoutes.search),
              ),
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () => context.push(AppRoutes.notifications),
              ),
              IconButton(
                icon: const Icon(Icons.settings_outlined),
                onPressed: () => context.push(AppRoutes.settings),
              ),
            ],
          ),

          // Content
          SliverToBoxAdapter(
            child: Column(
              children: [
                // User Profile Header
                Container(
                  color: AppColors.surfaceWhite,
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      // Avatar
                      CircleAvatar(
                        radius: 32,
                        backgroundColor: AppColors.primary,
                        backgroundImage: user.avatar != null
                            ? NetworkImage(user.avatar!)
                            : null,
                        child: user.avatar == null
                            ? Text(
                                user.name.isNotEmpty
                                    ? user.name[0].toUpperCase()
                                    : '?',
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textWhite,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(width: 16),

                      // User Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user.name,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              user.email,
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: user.isBusiness
                                    ? AppColors.accent.withValues(alpha: 0.1)
                                    : AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                user.isBusiness ? 'Business' : 'User',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: user.isBusiness
                                      ? AppColors.accent
                                      : AppColors.primary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Edit Profile Button
                      IconButtonWidget(
                        icon: Icons.edit,
                        onPressed: () => context.push(AppRoutes.editProfile),
                        backgroundColor: AppColors.backgroundGrey,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // Quick Actions
                CustomCard(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Quick Actions',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _QuickActionButton(
                        icon: Icons.calendar_today,
                        label: 'My Bookings',
                        onTap: () => context.push(AppRoutes.bookingHistory),
                      ),
                      const Divider(),
                      _QuickActionButton(
                        icon: Icons.shopping_bag,
                        label: 'My Orders',
                        onTap: () => context.push(AppRoutes.orders),
                      ),
                      const Divider(),
                      _QuickActionButton(
                        icon: Icons.chat_bubble_outline,
                        label: 'Messages',
                        onTap: () => context.push(AppRoutes.conversations),
                      ),
                      if (user.isBusiness) ...[
                        const Divider(),
                        _QuickActionButton(
                          icon: Icons.analytics_outlined,
                          label: 'Analytics',
                          onTap: () => context.push(AppRoutes.analytics),
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Logout Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: OutlinedButtonWidget(
                    text: 'Logout',
                    icon: Icons.logout,
                    onPressed: () async {
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) {
                        context.go(AppRoutes.login);
                      }
                    },
                    borderColor: AppColors.error,
                    textColor: AppColors.error,
                    width: double.infinity,
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Quick Action Button Widget
class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: AppColors.textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}
