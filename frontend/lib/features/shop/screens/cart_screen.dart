import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/shop_provider.dart';
import '../widgets/widgets.dart';

/// Cart Screen
/// Shows all items in the shopping cart with checkout option
class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        title: const Text('Shopping Cart'),
        actions: [
          if (state.cart.isNotEmpty)
            TextButton(
              onPressed: () => _showClearCartDialog(context, ref),
              child: const Text(
                'Clear',
                style: TextStyle(color: AppColors.textWhite),
              ),
            ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: LoadingSpinner())
          : state.cart.isEmpty
              ? const Center(
                  child: EmptyState(
                    title: 'Empty Cart',
                    message: 'Your cart is empty',
                    icon: Icons.shopping_cart_outlined,
                  ),
                )
              : Column(
                  children: [
                    // Cart Items List
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: state.cart.items.length,
                        itemBuilder: (context, index) {
                          final item = state.cart.items[index];
                          return CartItemWidget(item: item);
                        },
                      ),
                    ),

                    // Cart Summary
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: CartSummary(
                        cart: state.cart,
                        onCheckout: () => context.push(AppRoutes.checkout),
                      ),
                    ),
                  ],
                ),
    );
  }

  void _showClearCartDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cart'),
        content: const Text(
            'Are you sure you want to remove all items from your cart?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(cartProvider.notifier).clearCart();
            },
            child: const Text(
              'Clear',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}
