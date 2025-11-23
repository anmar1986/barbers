import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../shared/models/business_model.dart';
import '../providers/barber_provider.dart';

/// Barbers Tab Screen
/// Discover barber shops - fetches real data from API
class BarbersTabScreen extends ConsumerStatefulWidget {
  const BarbersTabScreen({super.key});

  @override
  ConsumerState<BarbersTabScreen> createState() => _BarbersTabScreenState();
}

class _BarbersTabScreenState extends ConsumerState<BarbersTabScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  String _selectedFilter = 'All';

  final List<String> _filters = [
    'All',
    'Haircut',
    'Beard Trim',
    'Shave',
    'Color',
    'Fades',
    'Classic',
  ];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(barberListProvider.notifier).loadMoreBarbers();
    }
  }

  @override
  Widget build(BuildContext context) {
    final barberState = ref.watch(barberListProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      body: RefreshIndicator(
        onRefresh: () => ref.read(barberListProvider.notifier).refreshBarbers(),
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // App Bar
            SliverAppBar(
              floating: true,
              pinned: true,
              backgroundColor: AppColors.primary,
              title: const Text('Barbers'),
              actions: [
                IconButton(
                  icon: const Icon(Icons.map_outlined),
                  onPressed: () {
                    // TODO: Show map view
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.filter_list),
                  onPressed: () {
                    _showFilterBottomSheet(context);
                  },
                ),
              ],
            ),

            // Search Bar
            SliverToBoxAdapter(
              child: Container(
                color: AppColors.surfaceWhite,
                padding: const EdgeInsets.all(16),
                child: SearchInput(
                  controller: _searchController,
                  hint: 'Search barber shops...',
                  onSubmit: () {
                    ref
                        .read(barberListProvider.notifier)
                        .searchBarbers(_searchController.text);
                  },
                ),
              ),
            ),

            // Service Filters
            SliverToBoxAdapter(
              child: Container(
                color: AppColors.surfaceWhite,
                padding: const EdgeInsets.only(bottom: 16),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Row(
                    children: _filters
                        .map((filter) => _ServiceChip(
                              label: filter,
                              isSelected: _selectedFilter == filter,
                              onTap: () {
                                setState(() {
                                  _selectedFilter = filter;
                                });
                                ref
                                    .read(barberListProvider.notifier)
                                    .setFilter(filter == 'All' ? null : filter);
                              },
                            ))
                        .toList(),
                  ),
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 8)),

            // Loading State
            if (barberState.isLoading && barberState.barbers.isEmpty)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(),
                ),
              )
            // Error State
            else if (barberState.error != null && barberState.barbers.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline,
                          size: 60, color: AppColors.error),
                      const SizedBox(height: 16),
                      Text(
                        barberState.error!,
                        style: const TextStyle(color: AppColors.textSecondary),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => ref
                            .read(barberListProvider.notifier)
                            .refreshBarbers(),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              )
            // Empty State
            else if (barberState.barbers.isEmpty)
              const SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.content_cut,
                          size: 60, color: AppColors.textSecondary),
                      SizedBox(height: 16),
                      Text(
                        'No barber shops found',
                        style: TextStyle(
                          fontSize: 18,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            // Barbers Grid
            else ...[
              // Section Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Nearby Barbers (${barberState.barbers.length})',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('See All'),
                      ),
                    ],
                  ),
                ),
              ),

              // Barbers Grid
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.75,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final barber = barberState.barbers[index];
                      return _BarberCard(
                        barber: barber,
                        onTap: () {
                          context
                              .push('${AppRoutes.barberDetail}/${barber.uuid}');
                        },
                      );
                    },
                    childCount: barberState.barbers.length,
                  ),
                ),
              ),

              // Loading more indicator
              if (barberState.isLoadingMore)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 16)),
            ],
          ],
        ),
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Filter Barbers',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            const Text('Distance'),
            Slider(
              value: 10,
              min: 1,
              max: 50,
              divisions: 49,
              label: '10 km',
              onChanged: (value) {},
            ),
            const SizedBox(height: 16),
            const Text('Rating'),
            Row(
              children: List.generate(
                5,
                (index) => IconButton(
                  icon: Icon(
                    index < 4 ? Icons.star : Icons.star_border,
                    color: AppColors.star,
                  ),
                  onPressed: () {},
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Reset'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Apply'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Service Filter Chip Widget
class _ServiceChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ServiceChip({
    required this.label,
    this.isSelected = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
        backgroundColor: AppColors.backgroundGrey,
        selectedColor: AppColors.primary,
        labelStyle: TextStyle(
          color: isSelected ? AppColors.textWhite : AppColors.textPrimary,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }
}

/// Barber Card Widget - Uses real Business model
class _BarberCard extends StatelessWidget {
  final Business barber;
  final VoidCallback onTap;

  const _BarberCard({
    required this.barber,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: CustomCard(
        padding: EdgeInsets.zero,
        margin: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with status badge
            Stack(
              children: [
                Container(
                  height: 120,
                  decoration: BoxDecoration(
                    color: AppColors.backgroundGrey,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(12),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(12),
                    ),
                    child: _buildCardImage(),
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color:
                          barber.isOpen ? AppColors.success : AppColors.error,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      barber.isOpen ? 'Open' : 'Closed',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textWhite,
                      ),
                    ),
                  ),
                ),
                if (barber.isVerified)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.verified,
                        size: 12,
                        color: AppColors.textWhite,
                      ),
                    ),
                  ),
              ],
            ),

            // Info
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    barber.businessName,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    barber.city ?? barber.address ?? 'Location not set',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.star,
                        size: 14,
                        color: AppColors.star,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        barber.averageRating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${barber.totalReviews})',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build card image with proper fallback
  Widget _buildCardImage() {
    // Prefer cover image, fallback to logo, then placeholder
    final imageUrl = barber.coverImage ?? barber.logo;

    if (imageUrl != null) {
      return Image.network(
        imageUrl,
        width: double.infinity,
        height: 120,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return const Center(
            child: Icon(
              Icons.content_cut,
              size: 48,
              color: AppColors.textSecondary,
            ),
          );
        },
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Center(
            child: CircularProgressIndicator(
              value: loadingProgress.expectedTotalBytes != null
                  ? loadingProgress.cumulativeBytesLoaded /
                      loadingProgress.expectedTotalBytes!
                  : null,
              strokeWidth: 2,
              color: AppColors.primary,
            ),
          );
        },
      );
    }

    return const Center(
      child: Icon(
        Icons.content_cut,
        size: 48,
        color: AppColors.textSecondary,
      ),
    );
  }
}
