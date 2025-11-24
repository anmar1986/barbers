import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../../../core/providers/dio_provider.dart';
import '../../../core/utils/optional.dart';
import '../models/models.dart';
import '../repositories/shop_repository.dart';

// ==================== PROVIDERS ====================

/// Dio Client Provider for Shop
final shopDioClientProvider = Provider<DioClient>((ref) {
  return ref.watch(dioClientProvider);
});

/// Shop Repository Provider
final shopRepositoryProvider = Provider<ShopRepository>((ref) {
  return ShopRepository(ref.read(shopDioClientProvider));
});

// ==================== PRODUCT STATE & NOTIFIER ====================

/// Product List State
class ProductListState {
  final List<Product> products;
  final List<Product> featuredProducts;
  final List<ProductCategory> categories;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final int currentPage;
  final bool hasMore;
  final String? searchQuery;
  final int? selectedCategoryId;
  final String? sortBy;
  final String? sortOrder;

  const ProductListState({
    this.products = const [],
    this.featuredProducts = const [],
    this.categories = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.currentPage = 1,
    this.hasMore = true,
    this.searchQuery,
    this.selectedCategoryId,
    this.sortBy,
    this.sortOrder,
  });

  ProductListState copyWith({
    List<Product>? products,
    List<Product>? featuredProducts,
    List<ProductCategory>? categories,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    int? currentPage,
    bool? hasMore,
    String? searchQuery,
    Optional<int?>? selectedCategoryId,
    String? sortBy,
    String? sortOrder,
  }) {
    return ProductListState(
      products: products ?? this.products,
      featuredProducts: featuredProducts ?? this.featuredProducts,
      categories: categories ?? this.categories,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      searchQuery: searchQuery ?? this.searchQuery,
      selectedCategoryId:
          selectedCategoryId != null && selectedCategoryId.isPresent
              ? selectedCategoryId.value
              : this.selectedCategoryId,
      sortBy: sortBy ?? this.sortBy,
      sortOrder: sortOrder ?? this.sortOrder,
    );
  }
}

/// Product List Notifier
class ProductListNotifier extends StateNotifier<ProductListState> {
  final ShopRepository _repository;

  ProductListNotifier(this._repository) : super(const ProductListState()) {
    _init();
  }

  /// Initialize: load categories and products
  Future<void> _init() async {
    // Only load products for now - categories and featured endpoints don't exist yet
    await loadProducts();
    // TODO: Uncomment when backend endpoints are ready:
    // await Future.wait([
    //   loadCategories(),
    //   loadFeaturedProducts(),
    // ]);
  }

  /// Load product categories
  Future<void> loadCategories() async {
    final result = await _repository.getCategories();

    result.onSuccess((categories) {
      state = state.copyWith(categories: categories);
    });
  }

  /// Load featured products
  Future<void> loadFeaturedProducts() async {
    final result = await _repository.getFeaturedProducts(limit: 6);

    result.onSuccess((products) {
      state = state.copyWith(featuredProducts: products);
    });
  }

  /// Load products with current filters
  Future<void> loadProducts({bool refresh = false}) async {
    if (state.isLoading && !refresh) return;

    state = state.copyWith(
      isLoading: true,
      error: null,
      currentPage: refresh ? 1 : state.currentPage,
    );

    final result = await _repository.getProducts(
      page: refresh ? 1 : state.currentPage,
      limit: 10,
      search: state.searchQuery,
      categoryId: state.selectedCategoryId,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
    );

    result.onSuccess((products) {
      state = ProductListState(
        products: refresh ? products : [...state.products, ...products],
        featuredProducts: state.featuredProducts,
        categories: state.categories,
        isLoading: false,
        currentPage: refresh ? 1 : state.currentPage,
        hasMore: products.isNotEmpty && products.length >= 10,
        searchQuery: state.searchQuery,
        selectedCategoryId: state.selectedCategoryId,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Load more products (pagination)
  Future<void> loadMoreProducts() async {
    if (state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    final result = await _repository.getProducts(
      page: state.currentPage + 1,
      limit: 10,
      search: state.searchQuery,
      categoryId: state.selectedCategoryId,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
    );

    result.onSuccess((products) {
      state = ProductListState(
        products: [...state.products, ...products],
        featuredProducts: state.featuredProducts,
        categories: state.categories,
        isLoadingMore: false,
        currentPage: state.currentPage + 1,
        hasMore: products.isNotEmpty && products.length >= 10,
        searchQuery: state.searchQuery,
        selectedCategoryId: state.selectedCategoryId,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoadingMore: false,
        error: error,
      );
    });
  }

  /// Refresh products
  Future<void> refreshProducts() async {
    await loadProducts(refresh: true);
  }

  /// Search products
  Future<void> searchProducts(String query) async {
    state = state.copyWith(
      searchQuery: query.isEmpty ? null : query,
    );
    await loadProducts(refresh: true);
  }

  /// Filter by category
  Future<void> setCategory(int? categoryId) async {
    state = state.copyWith(
      selectedCategoryId: Optional.value(categoryId),
    );
    await loadProducts(refresh: true);
  }

  /// Set sort options
  Future<void> setSorting(String? sortBy, String? sortOrder) async {
    state = state.copyWith(
      sortBy: sortBy,
      sortOrder: sortOrder,
    );
    await loadProducts(refresh: true);
  }

  /// Clear search
  void clearSearch() {
    state = state.copyWith(searchQuery: null);
    loadProducts(refresh: true);
  }

  /// Clear all filters
  void clearFilters() {
    state = state.copyWith(
      searchQuery: null,
      selectedCategoryId: Optional.value(null),
      sortBy: null,
      sortOrder: null,
    );
    loadProducts(refresh: true);
  }
}

/// Product List Provider
final productListProvider =
    StateNotifierProvider<ProductListNotifier, ProductListState>((ref) {
  return ProductListNotifier(ref.read(shopRepositoryProvider));
});

// ==================== PRODUCT DETAIL STATE & NOTIFIER ====================

/// Product Detail State
class ProductDetailState {
  final Product? product;
  final bool isLoading;
  final String? error;
  final int selectedQuantity;

  const ProductDetailState({
    this.product,
    this.isLoading = false,
    this.error,
    this.selectedQuantity = 1,
  });

  ProductDetailState copyWith({
    Product? product,
    bool? isLoading,
    String? error,
    int? selectedQuantity,
  }) {
    return ProductDetailState(
      product: product ?? this.product,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedQuantity: selectedQuantity ?? this.selectedQuantity,
    );
  }
}

/// Product Detail Notifier
class ProductDetailNotifier extends StateNotifier<ProductDetailState> {
  final ShopRepository _repository;
  final String productUuid;

  ProductDetailNotifier(this._repository, this.productUuid)
      : super(const ProductDetailState()) {
    loadProduct();
  }

  /// Load product details
  Future<void> loadProduct() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getProductById(productUuid);

    result.onSuccess((product) {
      state = ProductDetailState(
        product: product,
        isLoading: false,
        selectedQuantity: 1,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Set selected quantity
  void setQuantity(int quantity) {
    if (quantity < 1) return;
    final maxQuantity = state.product?.stockQuantity ?? 99;
    if (quantity > maxQuantity) return;

    state = state.copyWith(selectedQuantity: quantity);
  }

  /// Increment quantity
  void incrementQuantity() {
    setQuantity(state.selectedQuantity + 1);
  }

  /// Decrement quantity
  void decrementQuantity() {
    setQuantity(state.selectedQuantity - 1);
  }
}

/// Product Detail Provider Factory
final productDetailProvider = StateNotifierProvider.family<
    ProductDetailNotifier, ProductDetailState, String>((ref, productUuid) {
  return ProductDetailNotifier(ref.read(shopRepositoryProvider), productUuid);
});

// ==================== CART STATE & NOTIFIER ====================

/// Cart State
class CartState {
  final Cart cart;
  final bool isLoading;
  final bool isUpdating;
  final String? error;
  final String? successMessage;

  const CartState({
    this.cart = const Cart(),
    this.isLoading = false,
    this.isUpdating = false,
    this.error,
    this.successMessage,
  });

  CartState copyWith({
    Cart? cart,
    bool? isLoading,
    bool? isUpdating,
    String? error,
    String? successMessage,
  }) {
    return CartState(
      cart: cart ?? this.cart,
      isLoading: isLoading ?? this.isLoading,
      isUpdating: isUpdating ?? this.isUpdating,
      error: error,
      successMessage: successMessage,
    );
  }
}

/// Cart Notifier
class CartNotifier extends StateNotifier<CartState> {
  final ShopRepository _repository;

  CartNotifier(this._repository) : super(const CartState()) {
    loadCart();
  }

  /// Load cart from server
  Future<void> loadCart() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getCart();

    result.onSuccess((cart) {
      state = CartState(cart: cart, isLoading: false);
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Add item to cart
  Future<bool> addToCart(String productUuid, {int quantity = 1}) async {
    state = state.copyWith(isUpdating: true, error: null, successMessage: null);

    final result = await _repository.addToCart(productUuid, quantity: quantity);

    return result.fold(
      onSuccess: (cart) {
        state = CartState(
          cart: cart,
          isUpdating: false,
          successMessage: 'Added to cart',
        );
        return true;
      },
      onFailure: (error) {
        state = state.copyWith(
          isUpdating: false,
          error: error,
        );
        return false;
      },
    );
  }

  /// Update cart item quantity
  Future<bool> updateQuantity(int itemId, int quantity) async {
    if (quantity < 1) {
      return removeItem(itemId);
    }

    state = state.copyWith(isUpdating: true, error: null);

    final result = await _repository.updateCartItem(itemId, quantity);

    return result.fold(
      onSuccess: (cart) {
        state = CartState(cart: cart, isUpdating: false);
        return true;
      },
      onFailure: (error) {
        state = state.copyWith(
          isUpdating: false,
          error: error,
        );
        return false;
      },
    );
  }

  /// Remove item from cart
  Future<bool> removeItem(int itemId) async {
    state = state.copyWith(isUpdating: true, error: null);

    final result = await _repository.removeFromCart(itemId);

    return result.fold(
      onSuccess: (cart) {
        state = CartState(
          cart: cart,
          isUpdating: false,
          successMessage: 'Item removed',
        );
        return true;
      },
      onFailure: (error) {
        state = state.copyWith(
          isUpdating: false,
          error: error,
        );
        return false;
      },
    );
  }

  /// Clear entire cart
  Future<bool> clearCart() async {
    state = state.copyWith(isUpdating: true, error: null);

    final result = await _repository.clearCart();

    return result.fold(
      onSuccess: (_) {
        state = CartState(
          cart: Cart.empty(),
          isUpdating: false,
          successMessage: 'Cart cleared',
        );
        return true;
      },
      onFailure: (error) {
        state = state.copyWith(
          isUpdating: false,
          error: error,
        );
        return false;
      },
    );
  }

  /// Apply coupon code
  Future<bool> applyCoupon(String couponCode) async {
    state = state.copyWith(isUpdating: true, error: null);

    final result = await _repository.applyCoupon(couponCode);

    return result.fold(
      onSuccess: (cart) {
        state = CartState(
          cart: cart,
          isUpdating: false,
          successMessage: 'Coupon applied',
        );
        return true;
      },
      onFailure: (error) {
        state = state.copyWith(
          isUpdating: false,
          error: error,
        );
        return false;
      },
    );
  }

  /// Remove coupon
  Future<void> removeCoupon() async {
    state = state.copyWith(isUpdating: true, error: null);

    final result = await _repository.removeCoupon();

    result.onSuccess((cart) {
      state = CartState(cart: cart, isUpdating: false);
    }).onFailure((error) {
      state = state.copyWith(
        isUpdating: false,
        error: error,
      );
    });
  }

  /// Clear messages
  void clearMessages() {
    state = state.copyWith(error: null, successMessage: null);
  }
}

/// Cart Provider
final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier(ref.read(shopRepositoryProvider));
});

// ==================== ORDER STATE & NOTIFIER ====================

/// Order List State
class OrderListState {
  final List<Order> orders;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final int currentPage;
  final bool hasMore;

  const OrderListState({
    this.orders = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.currentPage = 1,
    this.hasMore = true,
  });

  OrderListState copyWith({
    List<Order>? orders,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    int? currentPage,
    bool? hasMore,
  }) {
    return OrderListState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

/// Order List Notifier
class OrderListNotifier extends StateNotifier<OrderListState> {
  final ShopRepository _repository;

  OrderListNotifier(this._repository) : super(const OrderListState()) {
    loadOrders();
  }

  /// Load orders
  Future<void> loadOrders({bool refresh = false}) async {
    if (state.isLoading && !refresh) return;

    state = state.copyWith(
      isLoading: true,
      error: null,
      currentPage: refresh ? 1 : state.currentPage,
    );

    final result = await _repository.getOrders(
      page: refresh ? 1 : state.currentPage,
      limit: 10,
    );

    result.onSuccess((orders) {
      state = OrderListState(
        orders: refresh ? orders : [...state.orders, ...orders],
        isLoading: false,
        currentPage: refresh ? 1 : state.currentPage,
        hasMore: orders.isNotEmpty && orders.length >= 10,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Load more orders
  Future<void> loadMoreOrders() async {
    if (state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    final result = await _repository.getOrders(
      page: state.currentPage + 1,
      limit: 10,
    );

    result.onSuccess((orders) {
      state = OrderListState(
        orders: [...state.orders, ...orders],
        isLoadingMore: false,
        currentPage: state.currentPage + 1,
        hasMore: orders.isNotEmpty && orders.length >= 10,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoadingMore: false,
        error: error,
      );
    });
  }

  /// Refresh orders
  Future<void> refreshOrders() async {
    await loadOrders(refresh: true);
  }

  /// Cancel order
  Future<bool> cancelOrder(String orderNumber) async {
    final result = await _repository.cancelOrder(orderNumber);

    return result.fold(
      onSuccess: (updatedOrder) {
        // Update the order in the list
        final updatedOrders = state.orders.map((order) {
          if (order.orderNumber == orderNumber) {
            return updatedOrder;
          }
          return order;
        }).toList();

        state = state.copyWith(orders: updatedOrders);
        return true;
      },
      onFailure: (error) {
        state = state.copyWith(error: error);
        return false;
      },
    );
  }
}

/// Order List Provider
final orderListProvider =
    StateNotifierProvider<OrderListNotifier, OrderListState>((ref) {
  return OrderListNotifier(ref.read(shopRepositoryProvider));
});

// ==================== ORDER DETAIL STATE & NOTIFIER ====================

/// Order Detail State
class OrderDetailState {
  final Order? order;
  final bool isLoading;
  final String? error;

  const OrderDetailState({
    this.order,
    this.isLoading = false,
    this.error,
  });

  OrderDetailState copyWith({
    Order? order,
    bool? isLoading,
    String? error,
  }) {
    return OrderDetailState(
      order: order ?? this.order,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Order Detail Notifier
class OrderDetailNotifier extends StateNotifier<OrderDetailState> {
  final ShopRepository _repository;
  final String orderNumber;

  OrderDetailNotifier(this._repository, this.orderNumber)
      : super(const OrderDetailState()) {
    loadOrder();
  }

  /// Load order details
  Future<void> loadOrder() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getOrderByNumber(orderNumber);

    result.onSuccess((order) {
      state = OrderDetailState(order: order, isLoading: false);
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Cancel order
  Future<bool> cancelOrder() async {
    if (state.order == null) return false;

    final result = await _repository.cancelOrder(orderNumber);

    return result.fold(
      onSuccess: (updatedOrder) {
        state = state.copyWith(order: updatedOrder);
        return true;
      },
      onFailure: (error) {
        state = state.copyWith(error: error);
        return false;
      },
    );
  }
}

/// Order Detail Provider Factory
final orderDetailProvider =
    StateNotifierProvider.family<OrderDetailNotifier, OrderDetailState, String>(
        (ref, orderNumber) {
  return OrderDetailNotifier(ref.read(shopRepositoryProvider), orderNumber);
});

// ==================== CHECKOUT STATE & NOTIFIER ====================

/// Checkout State
class CheckoutState {
  final ShippingAddress? shippingAddress;
  final ShippingAddress? billingAddress;
  final bool sameAsShipping;
  final String? selectedPaymentMethod;
  final String? notes;
  final bool isProcessing;
  final String? error;
  final Order? completedOrder;

  const CheckoutState({
    this.shippingAddress,
    this.billingAddress,
    this.sameAsShipping = true,
    this.selectedPaymentMethod,
    this.notes,
    this.isProcessing = false,
    this.error,
    this.completedOrder,
  });

  CheckoutState copyWith({
    ShippingAddress? shippingAddress,
    ShippingAddress? billingAddress,
    bool? sameAsShipping,
    String? selectedPaymentMethod,
    String? notes,
    bool? isProcessing,
    String? error,
    Order? completedOrder,
  }) {
    return CheckoutState(
      shippingAddress: shippingAddress ?? this.shippingAddress,
      billingAddress: billingAddress ?? this.billingAddress,
      sameAsShipping: sameAsShipping ?? this.sameAsShipping,
      selectedPaymentMethod:
          selectedPaymentMethod ?? this.selectedPaymentMethod,
      notes: notes ?? this.notes,
      isProcessing: isProcessing ?? this.isProcessing,
      error: error,
      completedOrder: completedOrder ?? this.completedOrder,
    );
  }

  /// Check if checkout is ready
  bool get isReady =>
      shippingAddress != null &&
      shippingAddress!.isValid &&
      selectedPaymentMethod != null;
}

/// Checkout Notifier
class CheckoutNotifier extends StateNotifier<CheckoutState> {
  final ShopRepository _repository;
  final Ref _ref;

  CheckoutNotifier(this._repository, this._ref) : super(const CheckoutState());

  /// Set shipping address
  void setShippingAddress(ShippingAddress address) {
    state = state.copyWith(shippingAddress: address);
    if (state.sameAsShipping) {
      state = state.copyWith(billingAddress: address);
    }
  }

  /// Set billing address
  void setBillingAddress(ShippingAddress address) {
    state = state.copyWith(billingAddress: address);
  }

  /// Toggle same as shipping
  void setSameAsShipping(bool value) {
    state = state.copyWith(sameAsShipping: value);
    if (value && state.shippingAddress != null) {
      state = state.copyWith(billingAddress: state.shippingAddress);
    }
  }

  /// Set payment method
  void setPaymentMethod(String method) {
    state = state.copyWith(selectedPaymentMethod: method);
  }

  /// Set notes
  void setNotes(String notes) {
    state = state.copyWith(notes: notes);
  }

  /// Process checkout
  Future<bool> processCheckout({String? paymentToken}) async {
    if (!state.isReady) {
      state = state.copyWith(error: 'Please complete all required fields');
      return false;
    }

    state = state.copyWith(isProcessing: true, error: null);

    final request = CreateOrderRequest(
      shippingAddress: state.shippingAddress!,
      billingAddress: state.sameAsShipping ? null : state.billingAddress,
      paymentMethod: state.selectedPaymentMethod!,
      paymentToken: paymentToken,
      notes: state.notes,
    );

    final result = await _repository.createOrder(request);

    return result.fold(
      onSuccess: (order) {
        state = state.copyWith(
          isProcessing: false,
          completedOrder: order,
        );
        // Clear cart after successful order
        _ref.read(cartProvider.notifier).loadCart();
        return true;
      },
      onFailure: (error) {
        state = state.copyWith(
          isProcessing: false,
          error: error,
        );
        return false;
      },
    );
  }

  /// Reset checkout state
  void reset() {
    state = const CheckoutState();
  }
}

/// Checkout Provider
final checkoutProvider =
    StateNotifierProvider<CheckoutNotifier, CheckoutState>((ref) {
  return CheckoutNotifier(ref.read(shopRepositoryProvider), ref);
});
