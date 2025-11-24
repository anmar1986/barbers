import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/shop_provider.dart';
import '../widgets/product_card.dart';

/// Shop Tab Screen
/// Browse and purchase products
class ShopTabScreen extends ConsumerStatefulWidget {
  const ShopTabScreen({super.key});

  @override
  ConsumerState<ShopTabScreen> createState() => _ShopTabScreenState();
}

class _ShopTabScreenState extends ConsumerState<ShopTabScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

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
        _scrollController.position.maxScrollExtent * 0.8) {
      ref.read(productListProvider.notifier).loadMoreProducts();
    }
  }

  void _onSearch(String query) {
    ref.read(productListProvider.notifier).searchProducts(query);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productListProvider);
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar
          SliverAppBar(
            floating: true,
            pinned: true,
            backgroundColor: AppColors.primary,
            title: const Text('Shop'),
            actions: [
              Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart_outlined),
                    onPressed: () => context.push(AppRoutes.cart),
                  ),
                  if (cartState.cart.itemCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.error,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${cartState.cart.itemCount}',
                          style: const TextStyle(
                            color: AppColors.textWhite,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
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
                onChanged: _onSearch,
              ),
            ),
          ),

          // Categories - Hidden until backend endpoint is ready
          // if (state.categories.isNotEmpty)
          //   SliverToBoxAdapter(...),

          const SliverToBoxAdapter(child: SizedBox(height: 8)),

          // Featured Products - Hidden until backend endpoint is ready
          // if (state.featuredProducts.isNotEmpty)
          //   SliverToBoxAdapter(...),

          // All Products Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'All Products',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.filter_list),
                    onPressed: () {
                      // TODO: Show sort/filter options
                    },
                  ),
                ],
              ),
            ),
          ),

          // Loading or Products Grid
          if (state.isLoading && state.products.isEmpty)
            const SliverFillRemaining(
              child: Center(child: LoadingSpinner()),
            )
          else if (state.error != null && state.products.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Text(
                  state.error!,
                  style: const TextStyle(color: AppColors.error),
                ),
              ),
            )
          else if (state.products.isEmpty)
            const SliverFillRemaining(
              child: EmptyState(
                title: 'No Products',
                message: 'No products found',
                icon: Icons.inventory_2_outlined,
              ),
            )
          else
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
                  (context, index) {
                    final product = state.products[index];
                    return ProductCard(
                      product: product,
                      onTap: () => context
                          .push('${AppRoutes.productDetail}/${product.uuid}'),
                    );
                  },
                  childCount: state.products.length,
                ),
              ),
            ),

          // Loading more indicator
          if (state.isLoadingMore)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Center(child: LoadingSpinner()),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 16)),
        ],
      ),
    );
  }
}

// Category Chip Widget - Commented out until backend endpoint is ready
// class _CategoryChip extends StatelessWidget { ... }
