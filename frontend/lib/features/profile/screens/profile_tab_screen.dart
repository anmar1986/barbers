import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/models/business_model.dart';
import '../../../shared/widgets/widgets.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/business_provider.dart';

/// Profile Tab Screen
/// Main home/profile feed screen
class ProfileTabScreen extends ConsumerStatefulWidget {
  const ProfileTabScreen({super.key});

  @override
  ConsumerState<ProfileTabScreen> createState() => _ProfileTabScreenState();
}

class _ProfileTabScreenState extends ConsumerState<ProfileTabScreen> {
  @override
  void initState() {
    super.initState();
    // Load business data if user is a business owner
    Future.microtask(() {
      final user = ref.read(currentUserProvider);
      if (user != null && user.isBusiness) {
        ref.read(businessProfileProvider.notifier).loadBusiness();
        ref.read(businessProfileProvider.notifier).loadStatistics();
        ref.read(businessProfileProvider.notifier).loadBusinessHours();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final businessState = ref.watch(businessProfileProvider);

    // Guest user view - show login/register options
    if (user == null) {
      return Scaffold(
        backgroundColor: AppColors.backgroundGrey,
        body: CustomScrollView(
          slivers: [
            // App Bar
            SliverAppBar(
              floating: true,
              backgroundColor: AppColors.primary,
              title: const Text('Profile'),
            ),

            // Guest Content
            SliverFillRemaining(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Icon
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.person_outline,
                          size: 64,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Title
                      const Text(
                        'Welcome to Barber Social',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),

                      // Description
                      const Text(
                        'Sign in to book appointments, save your favorite barbers, and more!',
                        style: TextStyle(
                          fontSize: 16,
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),

                      // Login Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => context.go(AppRoutes.login),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Sign In',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textWhite,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Register Button
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () => context.go(AppRoutes.register),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: const BorderSide(color: AppColors.primary),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Create Account',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Continue as guest note
                      const Text(
                        'You can browse without signing in',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
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

                // Business Management Section (for business owners)
                if (user.isBusiness) ...[
                  // Show "Create Business" card if no business exists
                  if (businessState.business == null &&
                      !businessState.isLoading) ...[
                    CustomCard(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.business, color: AppColors.primary),
                              SizedBox(width: 8),
                              Text(
                                'Create Your Business',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Set up your business profile to start accepting bookings and showcasing your services.',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () =>
                                  context.push(AppRoutes.createBusiness),
                              icon: const Icon(Icons.add_business),
                              label: const Text('Create Business Profile'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ] else if (businessState.business != null) ...[
                    CustomCard(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.business,
                                  color: AppColors.primary),
                              const SizedBox(width: 8),
                              const Expanded(
                                child: Text(
                                  'Business Management',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ),
                              if (businessState.business?.isVerified == true)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.success
                                        .withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.verified,
                                        size: 14,
                                        color: AppColors.success,
                                      ),
                                      SizedBox(width: 4),
                                      Text(
                                        'Verified',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.success,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Business Stats
                          if (businessState.statistics != null) ...[
                            Row(
                              children: [
                                _StatItem(
                                  icon: Icons.visibility,
                                  label: 'Views',
                                  value: businessState.statistics!.totalViews
                                      .toString(),
                                ),
                                _StatItem(
                                  icon: Icons.people,
                                  label: 'Followers',
                                  value: businessState
                                      .statistics!.totalFollowers
                                      .toString(),
                                ),
                                _StatItem(
                                  icon: Icons.star,
                                  label: 'Rating',
                                  value: businessState.statistics!.averageRating
                                      .toStringAsFixed(1),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            const Divider(),
                          ],

                          _QuickActionButton(
                            icon: Icons.edit_square,
                            label: 'Edit Business Profile',
                            onTap: () => context.push(AppRoutes.editBusiness),
                          ),
                          const Divider(),
                          _QuickActionButton(
                            icon: Icons.design_services,
                            label: 'Manage Services',
                            subtitle:
                                '${businessState.services.length} services',
                            onTap: () => context.push(AppRoutes.manageServices),
                          ),
                          const Divider(),
                          _QuickActionButton(
                            icon: Icons.access_time,
                            label: 'Business Hours',
                            subtitle: _getHoursSubtitle(businessState.hours),
                            onTap: () async {
                              await context.push(AppRoutes.manageHours);
                              // Reload hours after returning from manage hours screen
                              if (context.mounted) {
                                ref
                                    .read(businessProfileProvider.notifier)
                                    .loadBusinessHours();
                              }
                            },
                          ),
                          const Divider(),
                          _QuickActionButton(
                            icon: Icons.video_library,
                            label: 'My Videos',
                            subtitle: '${businessState.videos.length} videos',
                            onTap: () => context.push(AppRoutes.manageVideos),
                          ),
                          const Divider(),
                          _QuickActionButton(
                            icon: Icons.analytics_outlined,
                            label: 'Analytics',
                            onTap: () => context.push(AppRoutes.analytics),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),

                  // Working Hours Preview (for business owners with configured hours)
                  if (user.isBusiness && businessState.hours.isNotEmpty)
                    CustomCard(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Working Hours',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              TextButton(
                                onPressed: () async {
                                  await context.push(AppRoutes.manageHours);
                                  if (context.mounted) {
                                    ref
                                        .read(businessProfileProvider.notifier)
                                        .loadBusinessHours();
                                  }
                                },
                                child: const Text('Edit'),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ...businessState.hours.map((hour) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      hour.dayName,
                                      style: TextStyle(
                                        color: AppColors.textPrimary,
                                        fontWeight: hour.dayOfWeek ==
                                                DateTime.now().weekday % 7
                                            ? FontWeight.bold
                                            : FontWeight.normal,
                                      ),
                                    ),
                                    Text(
                                      hour.formattedHours,
                                      style: TextStyle(
                                        color: hour.isClosed
                                            ? AppColors.error
                                            : AppColors.textSecondary,
                                        fontWeight: hour.dayOfWeek ==
                                                DateTime.now().weekday % 7
                                            ? FontWeight.bold
                                            : FontWeight.normal,
                                      ),
                                    ),
                                  ],
                                ),
                              )),
                        ],
                      ),
                    ),
                  if (user.isBusiness && businessState.hours.isNotEmpty)
                    const SizedBox(height: 16),
                ],

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

  /// Get hours subtitle showing configured open days
  String _getHoursSubtitle(List<BusinessHours> hours) {
    if (hours.isEmpty) return 'Not configured';
    final openDays = hours.where((h) => !h.isClosed).length;
    if (openDays == 0) return 'All days closed';
    return '$openDays day${openDays == 1 ? '' : 's'} open';
  }
}

/// Quick Action Button Widget
class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    this.subtitle,
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 16,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                ],
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

/// Stat Item Widget
class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
