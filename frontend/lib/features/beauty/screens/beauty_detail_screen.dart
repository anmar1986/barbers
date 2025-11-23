import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/models/business_model.dart';
import '../providers/beauty_provider.dart';

/// Beauty Detail Screen
/// Shows full details of a beauty business (nail studio, hair salon, massage)
class BeautyDetailScreen extends ConsumerWidget {
  final String businessId;

  const BeautyDetailScreen({super.key, required this.businessId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final beautyState = ref.watch(beautyDetailProvider(businessId));

    if (beautyState.isLoading) {
      return Scaffold(
        appBar: AppBar(
          backgroundColor: AppColors.secondary,
          title: const Text('Loading...'),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (beautyState.error != null || beautyState.business == null) {
      return Scaffold(
        appBar: AppBar(
          backgroundColor: AppColors.secondary,
          title: const Text('Error'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 60, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                beautyState.error ?? 'Business not found',
                style: const TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref
                    .read(beautyDetailProvider(businessId).notifier)
                    .loadBusiness(),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    final business = beautyState.business!;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar with Cover Image
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            backgroundColor: AppColors.secondary,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                business.businessName,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  shadows: [
                    Shadow(
                      offset: Offset(0, 1),
                      blurRadius: 3,
                      color: Colors.black54,
                    ),
                  ],
                ),
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Cover Image
                  if (business.coverImage != null)
                    Image.network(
                      business.coverImage!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AppColors.secondary.withValues(alpha: 0.3),
                        child: Icon(
                          _getBusinessIcon(business.businessType),
                          size: 80,
                          color: AppColors.textWhite,
                        ),
                      ),
                    )
                  else
                    Container(
                      color: AppColors.secondary.withValues(alpha: 0.3),
                      child: Icon(
                        _getBusinessIcon(business.businessType),
                        size: 80,
                        color: AppColors.textWhite,
                      ),
                    ),
                  // Gradient overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.7),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () {
                  // TODO: Share business
                },
              ),
              IconButton(
                icon: const Icon(Icons.favorite_border),
                onPressed: () {
                  // TODO: Follow business
                },
              ),
            ],
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Logo and Info Row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Logo
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: AppColors.secondary,
                            width: 2,
                          ),
                          color: AppColors.backgroundGrey,
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: business.logo != null
                              ? Image.network(
                                  business.logo!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      Icon(
                                    _getBusinessIcon(business.businessType),
                                    size: 40,
                                    color: AppColors.secondary,
                                  ),
                                )
                              : Icon(
                                  _getBusinessIcon(business.businessType),
                                  size: 40,
                                  color: AppColors.secondary,
                                ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      // Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Business Type Badge
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color:
                                    AppColors.secondary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                business.businessTypeDisplay,
                                style: const TextStyle(
                                  color: AppColors.secondary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            // Rating
                            Row(
                              children: [
                                const Icon(Icons.star,
                                    size: 20, color: AppColors.star),
                                const SizedBox(width: 4),
                                Text(
                                  business.averageRating.toStringAsFixed(1),
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '(${business.totalReviews} reviews)',
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            // Verified badge
                            if (business.isVerified)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.success,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.verified,
                                        size: 14, color: AppColors.textWhite),
                                    SizedBox(width: 4),
                                    Text(
                                      'Verified',
                                      style: TextStyle(
                                        color: AppColors.textWhite,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            const SizedBox(height: 8),
                            // Status
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: business.isOpen
                                    ? AppColors.success
                                    : AppColors.error,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                business.isOpen ? 'Open Now' : 'Closed',
                                style: const TextStyle(
                                  color: AppColors.textWhite,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Description
                  if (business.description != null &&
                      business.description!.isNotEmpty) ...[
                    const Text(
                      'About',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      business.description!,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Contact Info
                  const Text(
                    'Contact',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _ContactItem(
                    icon: Icons.location_on,
                    label: 'Address',
                    value:
                        '${business.address ?? ''}, ${business.city ?? ''}, ${business.state ?? ''}',
                  ),
                  if (business.phone != null)
                    _ContactItem(
                      icon: Icons.phone,
                      label: 'Phone',
                      value: business.phone!,
                    ),
                  if (business.email != null)
                    _ContactItem(
                      icon: Icons.email,
                      label: 'Email',
                      value: business.email!,
                    ),
                  if (business.website != null)
                    _ContactItem(
                      icon: Icons.language,
                      label: 'Website',
                      value: business.website!,
                    ),
                  const SizedBox(height: 24),

                  // Working Hours
                  if (business.hours != null && business.hours!.isNotEmpty) ...[
                    const Text(
                      'Working Hours',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.backgroundGrey,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: business.hours!
                            .map((hour) => _WorkingHourItem(
                                  hour: hour,
                                ))
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Services
                  if (business.services != null &&
                      business.services!.isNotEmpty) ...[
                    const Text(
                      'Services',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...business.services!.map((service) => _ServiceItem(
                          service: service,
                        )),
                    const SizedBox(height: 24),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
      // Book Now Button
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
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
          child: ElevatedButton(
            onPressed: () {
              // TODO: Navigate to booking
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.secondary,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Book Now',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textWhite,
              ),
            ),
          ),
        ),
      ),
    );
  }

  IconData _getBusinessIcon(String businessType) {
    switch (businessType) {
      case 'nail_studio':
        return Icons.brush;
      case 'hair_salon':
        return Icons.face_retouching_natural;
      case 'massage':
        return Icons.spa;
      default:
        return Icons.spa;
    }
  }
}

/// Contact Item Widget
class _ContactItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ContactItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.secondary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Service Item Widget
class _ServiceItem extends StatelessWidget {
  final BusinessService service;

  const _ServiceItem({required this.service});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.backgroundGrey,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (service.description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    service.description!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
                if (service.duration != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    '${service.duration} min',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (service.price != null)
            Text(
              '\$${service.price!.toStringAsFixed(0)}',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.secondary,
              ),
            ),
        ],
      ),
    );
  }
}

/// Working Hour Item Widget
class _WorkingHourItem extends StatelessWidget {
  final BusinessHours hour;

  const _WorkingHourItem({required this.hour});

  @override
  Widget build(BuildContext context) {
    final isToday = DateTime.now().weekday % 7 == hour.dayOfWeek;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            hour.dayName,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
              color: isToday ? AppColors.secondary : AppColors.textPrimary,
            ),
          ),
          Text(
            hour.isClosed
                ? 'Closed'
                : '${hour.openTime ?? '--:--'} - ${hour.closeTime ?? '--:--'}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
              color: hour.isClosed
                  ? AppColors.error
                  : (isToday ? AppColors.secondary : AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}
