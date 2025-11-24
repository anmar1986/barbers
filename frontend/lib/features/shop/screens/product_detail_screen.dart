import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/widgets.dart';
import '../models/models.dart';
import '../providers/shop_provider.dart';

/// Product Detail Screen
/// Shows full product details with ability to add to cart
class ProductDetailScreen extends ConsumerWidget {
  final String productUuid;

  const ProductDetailScreen({
    super.key,
    required this.productUuid,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(productDetailProvider(productUuid));
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        title: const Text('Product Details'),
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
                    constraints:
                        const BoxConstraints(minWidth: 16, minHeight: 16),
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
      body: state.isLoading
          ? const Center(child: LoadingSpinner())
          : state.error != null
              ? Center(
                  child: Text(
                    state.error!,
                    style: const TextStyle(color: AppColors.error),
                  ),
                )
              : state.product == null
                  ? const Center(child: Text('Product not found'))
                  : _ProductDetailContent(
                      product: state.product!, state: state),
    );
  }
}

class _ProductDetailContent extends ConsumerWidget {
  final Product product;
  final ProductDetailState state;

  const _ProductDetailContent({
    required this.product,
    required this.state,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Images
                _ProductImageGallery(images: product.images ?? []),

                // Product Info
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product Name
                      Text(
                        product.name,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Rating and Reviews
                      if (product.reviewCount > 0)
                        Row(
                          children: [
                            const Icon(Icons.star,
                                color: AppColors.star, size: 20),
                            const SizedBox(width: 4),
                            Text(
                              product.rating.toStringAsFixed(1),
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '(${product.reviewCount} reviews)',
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      const SizedBox(height: 16),

                      // Price
                      Row(
                        children: [
                          Text(
                            product.formattedPrice,
                            style: const TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                          if (product.hasDiscount) ...[
                            const SizedBox(width: 12),
                            Text(
                              product.formattedComparePrice!,
                              style: const TextStyle(
                                fontSize: 18,
                                color: AppColors.textSecondary,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.error,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                '${product.discountPercentage}% OFF',
                                style: const TextStyle(
                                  color: AppColors.textWhite,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Stock Status
                      Text(
                        product.stockStatus,
                        style: TextStyle(
                          fontSize: 14,
                          color: product.inStock
                              ? AppColors.success
                              : AppColors.error,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Description
                      if (product.description != null) ...[
                        const Text(
                          'Description',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          product.description!,
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],

                      // Product Details
                      const Text(
                        'Product Details',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      if (product.sku != null)
                        _DetailRow(label: 'SKU', value: product.sku!),
                      if (product.category != null)
                        _DetailRow(
                            label: 'Category', value: product.category!.name),
                      if (product.business != null)
                        _DetailRow(
                            label: 'Seller',
                            value: product.business!.businessName),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Add to Cart Bar
        _AddToCartBar(product: product, state: state),
      ],
    );
  }
}

/// Product Image Gallery
class _ProductImageGallery extends StatefulWidget {
  final List<ProductImage> images;

  const _ProductImageGallery({required this.images});

  @override
  State<_ProductImageGallery> createState() => _ProductImageGalleryState();
}

class _ProductImageGalleryState extends State<_ProductImageGallery> {
  int _currentPage = 0;

  @override
  Widget build(BuildContext context) {
    if (widget.images.isEmpty) {
      return Container(
        height: 300,
        color: AppColors.backgroundGrey,
        child: const Center(
          child: Icon(Icons.inventory_2_outlined,
              size: 80, color: AppColors.textSecondary),
        ),
      );
    }

    return Column(
      children: [
        SizedBox(
          height: 300,
          child: PageView.builder(
            itemCount: widget.images.length,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemBuilder: (context, index) {
              return Image.network(
                widget.images[index].imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: AppColors.backgroundGrey,
                    child: const Center(
                      child: Icon(Icons.broken_image,
                          size: 80, color: AppColors.textSecondary),
                    ),
                  );
                },
              );
            },
          ),
        ),
        if (widget.images.length > 1)
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                widget.images.length,
                (index) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _currentPage == index
                        ? AppColors.primary
                        : AppColors.border,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Add to Cart Bar
class _AddToCartBar extends ConsumerWidget {
  final Product product;
  final ProductDetailState state;

  const _AddToCartBar({
    required this.product,
    required this.state,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Quantity Selector
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove, size: 20),
                    onPressed: () => ref
                        .read(productDetailProvider(product.uuid).notifier)
                        .decrementQuantity(),
                    padding: const EdgeInsets.all(8),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      '${state.selectedQuantity}',
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add, size: 20),
                    onPressed: () => ref
                        .read(productDetailProvider(product.uuid).notifier)
                        .incrementQuantity(),
                    padding: const EdgeInsets.all(8),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),

            // Add to Cart Button
            Expanded(
              child: PrimaryButton(
                text: cartState.isUpdating ? 'Adding...' : 'Add to Cart',
                onPressed: product.inStock && !cartState.isUpdating
                    ? () async {
                        final success =
                            await ref.read(cartProvider.notifier).addToCart(
                                  product.uuid,
                                  quantity: state.selectedQuantity,
                                );
                        if (success && context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Added to cart!'),
                              duration: Duration(seconds: 2),
                              backgroundColor: AppColors.success,
                            ),
                          );
                        }
                      }
                    : null,
                isLoading: cartState.isUpdating,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Detail Row Helper Widget
class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
