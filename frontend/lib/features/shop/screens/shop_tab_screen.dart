import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/widgets.dart';

/// Shop Tab Screen
/// Browse and purchase products
class ShopTabScreen extends ConsumerStatefulWidget {
  const ShopTabScreen({super.key});

  @override
  ConsumerState<ShopTabScreen> createState() => _ShopTabScreenState();
}

class _ShopTabScreenState extends ConsumerState<ShopTabScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            floating: true,
            pinned: true,
            backgroundColor: AppColors.primary,
            title: const Text('Shop'),
            actions: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () => context.push(AppRoutes.cart),
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
                hint: 'Search products...',
              ),
            ),
          ),

          // Categories
          SliverToBoxAdapter(
            child: Container(
              color: AppColors.surfaceWhite,
              padding: const EdgeInsets.only(bottom: 16),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  children: [
                    _CategoryChip(label: 'All', isSelected: true, onTap: () {}),
                    _CategoryChip(label: 'Hair Care', onTap: () {}),
                    _CategoryChip(label: 'Styling', onTap: () {}),
                    _CategoryChip(label: 'Grooming', onTap: () {}),
                    _CategoryChip(label: 'Skin Care', onTap: () {}),
                    _CategoryChip(label: 'Tools', onTap: () {}),
                  ],
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 8)),

          // Featured Products
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Featured Products',
                    style: TextStyle(
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

          // Products Grid
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.7,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) => _ProductCard(
                  name: 'Product ${index + 1}',
                  price: 29.99 + (index * 5),
                  rating: 4.0 + (index % 5) * 0.2,
                  onTap: () {
                    // TODO: Navigate to product detail
                  },
                ),
                childCount: 10,
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 16)),
        ],
      ),
    );
  }
}

/// Category Chip Widget
class _CategoryChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({
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

/// Product Card Widget
class _ProductCard extends StatelessWidget {
  final String name;
  final double price;
  final double rating;
  final VoidCallback onTap;

  const _ProductCard({
    required this.name,
    required this.price,
    required this.rating,
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
            // Image
            Container(
              height: 140,
              decoration: BoxDecoration(
                color: AppColors.backgroundGrey,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(12),
                ),
              ),
              child: const Center(
                child: Icon(
                  Icons.inventory_2_outlined,
                  size: 48,
                  color: AppColors.textSecondary,
                ),
              ),
            ),

            // Info
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(
                        Icons.star,
                        size: 14,
                        color: AppColors.star,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        rating.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '\$${price.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
