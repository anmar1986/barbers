import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/widgets.dart';
import '../models/models.dart';
import '../providers/shop_provider.dart';

/// Cart Item Widget
/// Displays a single item in the shopping cart with quantity controls
class CartItemWidget extends ConsumerWidget {
  final CartItem item;
  final bool isEditable;

  const CartItemWidget({
    super.key,
    required this.item,
    this.isEditable = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);

    return CustomCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Image
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.backgroundGrey,
              borderRadius: BorderRadius.circular(8),
            ),
            child: item.productImage != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      item.productImage!,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return const Center(
                          child: Icon(
                            Icons.inventory_2_outlined,
                            size: 32,
                            color: AppColors.textSecondary,
                          ),
                        );
                      },
                    ),
                  )
                : const Center(
                    child: Icon(
                      Icons.inventory_2_outlined,
                      size: 32,
                      color: AppColors.textSecondary,
                    ),
                  ),
          ),
          const SizedBox(width: 12),

          // Product Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Name
                Text(
                  item.productName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),

                // Price
                Text(
                  item.formattedPrice,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),

                // Quantity Controls and Total
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Quantity Controls
                    if (isEditable)
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: AppColors.border),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Decrement Button
                            IconButton(
                              icon: const Icon(Icons.remove, size: 18),
                              onPressed: cartState.isUpdating
                                  ? null
                                  : () {
                                      if (item.quantity > 1) {
                                        ref
                                            .read(cartProvider.notifier)
                                            .updateQuantity(
                                              item.id,
                                              item.quantity - 1,
                                            );
                                      } else {
                                        // Show confirmation dialog for remove
                                        _showRemoveDialog(
                                            context, ref, item.id);
                                      }
                                    },
                              padding: const EdgeInsets.all(4),
                              constraints: const BoxConstraints(
                                minWidth: 32,
                                minHeight: 32,
                              ),
                            ),
                            // Quantity Display
                            Container(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                '${item.quantity}',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            // Increment Button
                            IconButton(
                              icon: const Icon(Icons.add, size: 18),
                              onPressed: cartState.isUpdating
                                  ? null
                                  : () {
                                      ref
                                          .read(cartProvider.notifier)
                                          .updateQuantity(
                                            item.id,
                                            item.quantity + 1,
                                          );
                                    },
                              padding: const EdgeInsets.all(4),
                              constraints: const BoxConstraints(
                                minWidth: 32,
                                minHeight: 32,
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      Text(
                        'Qty: ${item.quantity}',
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                        ),
                      ),

                    // Item Total
                    Text(
                      item.formattedTotal,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Remove Button
          if (isEditable)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: AppColors.error),
              onPressed: cartState.isUpdating
                  ? null
                  : () => _showRemoveDialog(context, ref, item.id),
            ),
        ],
      ),
    );
  }

  void _showRemoveDialog(BuildContext context, WidgetRef ref, int itemId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Item'),
        content: const Text(
            'Are you sure you want to remove this item from your cart?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(cartProvider.notifier).removeItem(itemId);
            },
            child: const Text(
              'Remove',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}

/// Cart Summary Widget
/// Displays cart totals (subtotal, tax, shipping, total)
class CartSummary extends StatelessWidget {
  final Cart cart;
  final VoidCallback? onCheckout;
  final bool showCheckoutButton;

  const CartSummary({
    super.key,
    required this.cart,
    this.onCheckout,
    this.showCheckoutButton = true,
  });

  @override
  Widget build(BuildContext context) {
    return CustomCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Order Summary',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          // Subtotal
          _SummaryRow(
            label: 'Subtotal',
            value: cart.formattedSubtotal,
          ),
          const SizedBox(height: 8),

          // Tax
          if (cart.tax != null)
            _SummaryRow(
              label: 'Tax',
              value: cart.formattedTax,
            ),
          if (cart.tax != null) const SizedBox(height: 8),

          // Shipping
          _SummaryRow(
            label: 'Shipping',
            value: cart.formattedShipping,
          ),
          const SizedBox(height: 8),

          // Discount
          if (cart.discountAmount != null) ...[
            _SummaryRow(
              label: 'Discount',
              value: cart.formattedDiscount!,
              valueColor: AppColors.success,
            ),
            const SizedBox(height: 8),
          ],

          const Divider(height: 24),

          // Total
          _SummaryRow(
            label: 'Total',
            value: cart.formattedTotal,
            isTotal: true,
          ),

          // Checkout Button
          if (showCheckoutButton && onCheckout != null) ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: PrimaryButton(
                text: 'Proceed to Checkout',
                onPressed: cart.isEmpty ? null : onCheckout,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Summary Row Helper Widget
class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isTotal;
  final Color? valueColor;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isTotal = false,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 18 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            color: isTotal ? AppColors.textPrimary : AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? 20 : 16,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
            color: valueColor ??
                (isTotal ? AppColors.primary : AppColors.textPrimary),
          ),
        ),
      ],
    );
  }
}
