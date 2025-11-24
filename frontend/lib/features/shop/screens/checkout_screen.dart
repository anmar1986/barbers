import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/widgets/widgets.dart';
import '../models/models.dart';
import '../providers/shop_provider.dart';
import '../widgets/widgets.dart';

/// Checkout Screen
/// Multi-step checkout process
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _zipController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _zipController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);
    final checkoutState = ref.watch(checkoutProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        title: const Text('Checkout'),
      ),
      body: cartState.cart.isEmpty
          ? const Center(
              child: EmptyState(
                title: 'Empty Cart',
                message: 'Your cart is empty',
                icon: Icons.shopping_cart_outlined,
              ),
            )
          : Column(
              children: [
                // Step Indicator
                _StepIndicator(currentStep: _currentStep),

                // Step Content
                Expanded(
                  child: _buildStepContent(checkoutState, cartState),
                ),

                // Bottom Actions
                _BottomActions(
                  currentStep: _currentStep,
                  checkoutState: checkoutState,
                  onNext: _handleNext,
                  onBack: _handleBack,
                ),
              ],
            ),
    );
  }

  Widget _buildStepContent(CheckoutState checkoutState, CartState cartState) {
    switch (_currentStep) {
      case 0:
        return _ShippingAddressStep(
          formKey: _formKey,
          nameController: _nameController,
          phoneController: _phoneController,
          addressController: _addressController,
          cityController: _cityController,
          zipController: _zipController,
        );
      case 1:
        return _PaymentMethodStep();
      case 2:
        return _ReviewOrderStep(cart: cartState.cart);
      default:
        return const SizedBox();
    }
  }

  void _handleNext() {
    if (_currentStep == 0) {
      if (_formKey.currentState!.validate()) {
        final address = ShippingAddress(
          fullName: _nameController.text,
          phone: _phoneController.text,
          addressLine1: _addressController.text,
          city: _cityController.text,
          zipCode: _zipController.text,
        );
        ref.read(checkoutProvider.notifier).setShippingAddress(address);
        setState(() => _currentStep++);
      }
    } else if (_currentStep == 1) {
      final checkoutState = ref.read(checkoutProvider);
      if (checkoutState.selectedPaymentMethod != null) {
        setState(() => _currentStep++);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a payment method')),
        );
      }
    } else if (_currentStep == 2) {
      _processCheckout();
    }
  }

  void _handleBack() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    } else {
      context.pop();
    }
  }

  Future<void> _processCheckout() async {
    final success = await ref.read(checkoutProvider.notifier).processCheckout();
    if (success && mounted) {
      context.go(AppRoutes.orderSuccess);
    } else {
      final error = ref.read(checkoutProvider).error;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? 'Failed to place order'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
}

/// Step Indicator
class _StepIndicator extends StatelessWidget {
  final int currentStep;

  const _StepIndicator({required this.currentStep});

  @override
  Widget build(BuildContext context) {
    final steps = ['Shipping', 'Payment', 'Review'];

    return Container(
      padding: const EdgeInsets.all(16),
      color: AppColors.surfaceWhite,
      child: Row(
        children: List.generate(steps.length, (index) {
          final isActive = index <= currentStep;
          final isComplete = index < currentStep;

          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color:
                              isActive ? AppColors.primary : AppColors.border,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: isComplete
                              ? const Icon(Icons.check,
                                  color: AppColors.textWhite, size: 16)
                              : Text(
                                  '${index + 1}',
                                  style: TextStyle(
                                    color: isActive
                                        ? AppColors.textWhite
                                        : AppColors.textSecondary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        steps[index],
                        style: TextStyle(
                          fontSize: 12,
                          color: isActive
                              ? AppColors.textPrimary
                              : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                if (index < steps.length - 1)
                  Expanded(
                    child: Container(
                      height: 2,
                      color: isComplete ? AppColors.primary : AppColors.border,
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }
}

/// Shipping Address Step
class _ShippingAddressStep extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final TextEditingController addressController;
  final TextEditingController cityController;
  final TextEditingController zipController;

  const _ShippingAddressStep({
    required this.formKey,
    required this.nameController,
    required this.phoneController,
    required this.addressController,
    required this.cityController,
    required this.zipController,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Shipping Address',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextInput(
              controller: nameController,
              label: 'Full Name',
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextInput(
              controller: phoneController,
              label: 'Phone Number',
              keyboardType: TextInputType.phone,
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextInput(
              controller: addressController,
              label: 'Address',
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextInput(
              controller: cityController,
              label: 'City',
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextInput(
              controller: zipController,
              label: 'ZIP Code',
              keyboardType: TextInputType.number,
              validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            ),
          ],
        ),
      ),
    );
  }
}

/// Payment Method Step
class _PaymentMethodStep extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final checkoutState = ref.watch(checkoutProvider);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Payment Method',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _PaymentOption(
          title: 'Credit/Debit Card',
          icon: Icons.credit_card,
          value: 'card',
          groupValue: checkoutState.selectedPaymentMethod,
          onChanged: (value) =>
              ref.read(checkoutProvider.notifier).setPaymentMethod(value!),
        ),
        _PaymentOption(
          title: 'Cash on Delivery',
          icon: Icons.money,
          value: 'cod',
          groupValue: checkoutState.selectedPaymentMethod,
          onChanged: (value) =>
              ref.read(checkoutProvider.notifier).setPaymentMethod(value!),
        ),
      ],
    );
  }
}

class _PaymentOption extends StatelessWidget {
  final String title;
  final IconData icon;
  final String value;
  final String? groupValue;
  final ValueChanged<String?> onChanged;

  const _PaymentOption({
    required this.title,
    required this.icon,
    required this.value,
    required this.groupValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return CustomCard(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(title),
        leading: Icon(icon, color: AppColors.primary),
        trailing: Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
              width: 2,
            ),
          ),
          child: isSelected
              ? Center(
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primary,
                    ),
                  ),
                )
              : null,
        ),
        onTap: () => onChanged(value),
        selected: isSelected,
      ),
    );
  }
}

/// Review Order Step
class _ReviewOrderStep extends StatelessWidget {
  final Cart cart;

  const _ReviewOrderStep({required this.cart});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Review Order',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        ...cart.items
            .map((item) => CartItemWidget(item: item, isEditable: false)),
        const SizedBox(height: 16),
        CartSummary(cart: cart, showCheckoutButton: false),
      ],
    );
  }
}

/// Bottom Actions
class _BottomActions extends ConsumerWidget {
  final int currentStep;
  final CheckoutState checkoutState;
  final VoidCallback onNext;
  final VoidCallback onBack;

  const _BottomActions({
    required this.currentStep,
    required this.checkoutState,
    required this.onNext,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
            if (currentStep > 0)
              Expanded(
                child: SecondaryButton(
                  text: 'Back',
                  onPressed: checkoutState.isProcessing ? null : onBack,
                ),
              ),
            if (currentStep > 0) const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: PrimaryButton(
                text: currentStep == 2 ? 'Place Order' : 'Continue',
                onPressed: checkoutState.isProcessing ? null : onNext,
                isLoading: checkoutState.isProcessing,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
