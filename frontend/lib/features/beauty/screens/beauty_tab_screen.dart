import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../shared/models/business_model.dart';
import '../providers/beauty_provider.dart';

/// Beauty Tab Screen
/// Discover beauty services: Nail Studios, Hair Salons, Massage Centers
/// Fetches real data from API
class BeautyTabScreen extends ConsumerStatefulWidget {
  const BeautyTabScreen({super.key});

  @override
  ConsumerState<BeautyTabScreen> createState() => _BeautyTabScreenState();
}

class _BeautyTabScreenState extends ConsumerState<BeautyTabScreen>
    with SingleTickerProviderStateMixin {
  final _searchController = TextEditingController();
  late TabController _tabController;

  final List<_BeautyCategory> _categories = [
    _BeautyCategory(
      name: 'All',
      icon: Icons.apps,
      type: null,
    ),
    _BeautyCategory(
      name: 'Nail Studios',
      icon: Icons.brush,
      type: 'nail_studio',
    ),
    _BeautyCategory(
      name: 'Hair Salons',
      icon: Icons.face_retouching_natural,
      type: 'hair_salon',
    ),
    _BeautyCategory(
      name: 'Massage',
      icon: Icons.spa,
      type: 'massage',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _categories.length, vsync: this);
    _tabController.addListener(_onTabChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (!_tabController.indexIsChanging) {
      final selectedType = _categories[_tabController.index].type;
      ref.read(beautyListProvider.notifier).setBusinessType(selectedType);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          // App Bar
          SliverAppBar(
            floating: true,
            pinned: true,
            backgroundColor: AppColors.secondary,
            title: const Text('Beauty'),
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
                hint: 'Search beauty services...',
                onSubmit: () {
                  ref
                      .read(beautyListProvider.notifier)
                      .searchBusinesses(_searchController.text);
                },
              ),
            ),
          ),

          // Category Tabs
          SliverToBoxAdapter(
            child: Container(
              color: AppColors.surfaceWhite,
              child: TabBar(
                controller: _tabController,
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                padding: EdgeInsets.zero,
                labelPadding: const EdgeInsets.symmetric(horizontal: 16),
                labelColor: AppColors.secondary,
                unselectedLabelColor: AppColors.textSecondary,
                indicatorColor: AppColors.secondary,
                tabs: _categories
                    .map((cat) => Tab(
                          icon: Icon(cat.icon),
                          text: cat.name,
                        ))
                    .toList(),
              ),
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: _categories
              .map((cat) => _BeautyListView(categoryType: cat.type))
              .toList(),
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
              'Filter Beauty Services',
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
              activeColor: AppColors.secondary,
              onChanged: (value) {},
            ),
            const SizedBox(height: 16),
            const Text('Price Range'),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _PriceChip(label: '\$', isSelected: false, onTap: () {}),
                _PriceChip(label: '\$\$', isSelected: true, onTap: () {}),
                _PriceChip(label: '\$\$\$', isSelected: false, onTap: () {}),
                _PriceChip(label: '\$\$\$\$', isSelected: false, onTap: () {}),
              ],
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
            const SizedBox(height: 8),
            SwitchListTile(
              title: const Text('Open Now'),
              value: true,
              activeTrackColor: AppColors.secondary.withValues(alpha: 0.5),
              thumbColor: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.selected)) {
                  return AppColors.secondary;
                }
                return null;
              }),
              onChanged: (value) {},
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
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.secondary,
                    ),
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

/// Beauty Category Model
class _BeautyCategory {
  final String name;
  final IconData icon;
  final String? type;

  _BeautyCategory({
    required this.name,
    required this.icon,
    this.type,
  });
}

/// Beauty List View Widget - Fetches real data
class _BeautyListView extends ConsumerStatefulWidget {
  final String? categoryType;

  const _BeautyListView({this.categoryType});

  @override
  ConsumerState<_BeautyListView> createState() => _BeautyListViewState();
}

class _BeautyListViewState extends ConsumerState<_BeautyListView> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(beautyListProvider.notifier).loadMoreBusinesses();
    }
  }

  @override
  Widget build(BuildContext context) {
    final beautyState = ref.watch(beautyListProvider);

    // Loading state
    if (beautyState.isLoading && beautyState.businesses.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.secondary),
      );
    }

    // Error state
    if (beautyState.error != null && beautyState.businesses.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 60, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              beautyState.error!,
              style: const TextStyle(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () =>
                  ref.read(beautyListProvider.notifier).refreshBusinesses(),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    // Empty state
    if (beautyState.businesses.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.spa, size: 60, color: AppColors.textSecondary),
            SizedBox(height: 16),
            Text(
              'No beauty services found',
              style: TextStyle(
                fontSize: 18,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () =>
          ref.read(beautyListProvider.notifier).refreshBusinesses(),
      child: CustomScrollView(
        controller: _scrollController,
        slivers: [
          const SliverToBoxAdapter(child: SizedBox(height: 8)),

          // Section Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.categoryType == null
                        ? 'All Beauty Services (${beautyState.businesses.length})'
                        : 'Popular (${beautyState.businesses.length})',
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

          // Beauty Services Grid
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.72,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final business = beautyState.businesses[index];
                  return _BeautyCard(
                    business: business,
                    onTap: () {
                      context
                          .push('${AppRoutes.beautyDetail}/${business.uuid}');
                    },
                  );
                },
                childCount: beautyState.businesses.length,
              ),
            ),
          ),

          // Loading more indicator
          if (beautyState.isLoadingMore)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Center(
                    child:
                        CircularProgressIndicator(color: AppColors.secondary)),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 16)),
        ],
      ),
    );
  }
}

/// Price Chip Widget
class _PriceChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _PriceChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.secondary : AppColors.backgroundGrey,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? AppColors.textWhite : AppColors.textPrimary,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

/// Beauty Card Widget - Uses real Business model
class _BeautyCard extends StatelessWidget {
  final Business business;
  final VoidCallback onTap;

  const _BeautyCard({
    required this.business,
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
                  height: 110,
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withValues(alpha: 0.1),
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
                          business.isOpen ? AppColors.success : AppColors.error,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      business.isOpen ? 'Open' : 'Closed',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textWhite,
                      ),
                    ),
                  ),
                ),
                if (business.isVerified)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.secondary,
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
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    business.businessName,
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
                    business.businessTypeDisplay,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.star,
                        size: 14,
                        color: AppColors.star,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        business.averageRating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${business.totalReviews})',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.location_on,
                        size: 12,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          business.city ?? business.address ?? 'Location not set',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
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
    final imageUrl = business.coverImage ?? business.logo;

    if (imageUrl != null) {
      return Image.network(
        imageUrl,
        width: double.infinity,
        height: 110,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return Center(
            child: Icon(
              _getCategoryIcon(),
              size: 48,
              color: AppColors.secondary.withValues(alpha: 0.5),
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
              color: AppColors.secondary,
            ),
          );
        },
      );
    }

    return Center(
      child: Icon(
        _getCategoryIcon(),
        size: 48,
        color: AppColors.secondary.withValues(alpha: 0.5),
      ),
    );
  }

  IconData _getCategoryIcon() {
    switch (business.businessType) {
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
