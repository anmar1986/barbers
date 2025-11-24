import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../models/models.dart';

/// Shop Repository
/// Handles all shop-related API calls (products, cart, orders)
class ShopRepository {
  final DioClient _dioClient;

  ShopRepository(this._dioClient);

  // ==================== PRODUCTS ====================

  /// Get all products with pagination and filters
  Future<ApiResult<List<Product>>> getProducts({
    int page = 1,
    int limit = 10,
    String? search,
    int? categoryId,
    String? businessUuid,
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? sortOrder,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search != null && search.isNotEmpty) 'search': search,
      if (categoryId != null) 'category_id': categoryId,
      if (businessUuid != null) 'business_uuid': businessUuid,
      if (minPrice != null) 'min_price': minPrice,
      if (maxPrice != null) 'max_price': maxPrice,
      if (sortBy != null) 'sort_by': sortBy,
      if (sortOrder != null) 'sort_order': sortOrder,
    };

    final result = await _dioClient.get(
      ApiConstants.products,
      queryParameters: queryParams,
    );

    return result.map((data) {
      try {
        // Handle Laravel pagination response structure
        // Expected: { success: true, data: { current_page: 1, data: [...], ... } }
        dynamic productsData = data;
        if (data is Map && data.containsKey('data')) {
          productsData = data['data'];
        }

        // Now get the products array
        List<dynamic> productsJson = [];
        if (productsData is List) {
          // Direct array of products
          productsJson = productsData;
        } else if (productsData is Map && productsData.containsKey('data')) {
          // Laravel pagination structure: { data: [...], current_page: ..., etc }
          productsJson = productsData['data'] as List<dynamic>? ?? [];
        }

        if (productsJson.isEmpty) {
          return <Product>[];
        }

        return productsJson.map((json) => Product.fromJson(json)).toList();
      } catch (e) {
        // Return empty list instead of throwing to prevent app crash
        return <Product>[];
      }
    });
  }

  /// Get featured products
  Future<ApiResult<List<Product>>> getFeaturedProducts({int limit = 10}) async {
    final result = await _dioClient.get(
      ApiConstants.featuredProducts,
      queryParameters: {'limit': limit},
    );

    return result.map((data) {
      final List<dynamic> productsJson = data['data'] ?? data ?? [];
      return productsJson.map((json) => Product.fromJson(json)).toList();
    });
  }

  /// Search products
  Future<ApiResult<List<Product>>> searchProducts(
    String query, {
    int page = 1,
    int limit = 10,
  }) async {
    final result = await _dioClient.get(
      ApiConstants.searchProducts,
      queryParameters: {
        'q': query,
        'page': page,
        'limit': limit,
      },
    );

    return result.map((data) {
      final List<dynamic> productsJson = data['data'] ?? data ?? [];
      return productsJson.map((json) => Product.fromJson(json)).toList();
    });
  }

  /// Get product details by UUID
  Future<ApiResult<Product>> getProductById(String uuid) async {
    final result = await _dioClient.get('${ApiConstants.productDetail}/$uuid');

    return result.map((data) {
      final productData = data['data'] ?? data;
      return Product.fromJson(productData);
    });
  }

  /// Get product categories
  Future<ApiResult<List<ProductCategory>>> getCategories() async {
    final result = await _dioClient.get(ApiConstants.productCategories);

    return result.map((data) {
      final List<dynamic> categoriesJson = data['data'] ?? data ?? [];
      return categoriesJson
          .map((json) => ProductCategory.fromJson(json))
          .toList();
    });
  }

  // ==================== CART ====================

  /// Get current user's cart
  Future<ApiResult<Cart>> getCart() async {
    final result = await _dioClient.get(ApiConstants.cart);

    return result.map((data) {
      final cartData = data['data'] ?? data;
      return Cart.fromJson(cartData);
    });
  }

  /// Add item to cart
  Future<ApiResult<Cart>> addToCart(String productUuid,
      {int quantity = 1}) async {
    final result = await _dioClient.post(
      ApiConstants.addToCart,
      data: {
        'product_uuid': productUuid,
        'quantity': quantity,
      },
    );

    return result.map((data) {
      final cartData = data['data'] ?? data;
      return Cart.fromJson(cartData);
    });
  }

  /// Update cart item quantity
  Future<ApiResult<Cart>> updateCartItem(int itemId, int quantity) async {
    final result = await _dioClient.put(
      '${ApiConstants.updateCartItem}/$itemId',
      data: {'quantity': quantity},
    );

    return result.map((data) {
      final cartData = data['data'] ?? data;
      return Cart.fromJson(cartData);
    });
  }

  /// Remove item from cart
  Future<ApiResult<Cart>> removeFromCart(int itemId) async {
    final result = await _dioClient.delete(
      '${ApiConstants.removeFromCart}/$itemId',
    );

    return result.map((data) {
      final cartData = data['data'] ?? data;
      return Cart.fromJson(cartData);
    });
  }

  /// Clear entire cart
  Future<ApiResult<void>> clearCart() async {
    final result = await _dioClient.delete(ApiConstants.clearCart);
    return result.map((_) {});
  }

  /// Apply coupon code
  Future<ApiResult<Cart>> applyCoupon(String couponCode) async {
    final result = await _dioClient.post(
      '${ApiConstants.cart}/coupon',
      data: {'coupon_code': couponCode},
    );

    return result.map((data) {
      final cartData = data['data'] ?? data;
      return Cart.fromJson(cartData);
    });
  }

  /// Remove coupon code
  Future<ApiResult<Cart>> removeCoupon() async {
    final result = await _dioClient.delete('${ApiConstants.cart}/coupon');

    return result.map((data) {
      final cartData = data['data'] ?? data;
      return Cart.fromJson(cartData);
    });
  }

  // ==================== ORDERS ====================

  /// Create a new order (checkout)
  Future<ApiResult<Order>> createOrder(CreateOrderRequest request) async {
    final result = await _dioClient.post(
      ApiConstants.createOrder,
      data: request.toJson(),
    );

    return result.map((data) {
      final orderData = data['data'] ?? data;
      return Order.fromJson(orderData);
    });
  }

  /// Get user's orders
  Future<ApiResult<List<Order>>> getOrders({
    int page = 1,
    int limit = 10,
    String? status,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (status != null) 'status': status,
    };

    final result = await _dioClient.get(
      ApiConstants.orders,
      queryParameters: queryParams,
    );

    return result.map((data) {
      final List<dynamic> ordersJson = data['data'] ?? data ?? [];
      return ordersJson.map((json) => Order.fromJson(json)).toList();
    });
  }

  /// Get order history
  Future<ApiResult<List<Order>>> getOrderHistory({
    int page = 1,
    int limit = 10,
  }) async {
    final result = await _dioClient.get(
      ApiConstants.orderHistory,
      queryParameters: {
        'page': page,
        'limit': limit,
      },
    );

    return result.map((data) {
      final List<dynamic> ordersJson = data['data'] ?? data ?? [];
      return ordersJson.map((json) => Order.fromJson(json)).toList();
    });
  }

  /// Get order details by order number
  Future<ApiResult<Order>> getOrderByNumber(String orderNumber) async {
    final result = await _dioClient.get(
      '${ApiConstants.orderDetail}/$orderNumber',
    );

    return result.map((data) {
      final orderData = data['data'] ?? data;
      return Order.fromJson(orderData);
    });
  }

  /// Cancel an order
  Future<ApiResult<Order>> cancelOrder(String orderNumber) async {
    final result = await _dioClient.post(
      '${ApiConstants.cancelOrder}/$orderNumber/cancel',
    );

    return result.map((data) {
      final orderData = data['data'] ?? data;
      return Order.fromJson(orderData);
    });
  }

  // ==================== PAYMENT ====================

  /// Create payment intent for Stripe
  Future<ApiResult<Map<String, dynamic>>> createPaymentIntent({
    required double amount,
    String currency = 'usd',
  }) async {
    final result = await _dioClient.post(
      ApiConstants.createPaymentIntent,
      data: {
        'amount': (amount * 100).round(), // Convert to cents
        'currency': currency,
      },
    );

    return result.map((data) {
      return data['data'] ?? data;
    });
  }

  /// Confirm payment
  Future<ApiResult<void>> confirmPayment({
    required String paymentIntentId,
    required String orderNumber,
  }) async {
    final result = await _dioClient.post(
      ApiConstants.confirmPayment,
      data: {
        'payment_intent_id': paymentIntentId,
        'order_number': orderNumber,
      },
    );

    return result.map((_) {});
  }

  /// Get saved payment methods
  Future<ApiResult<List<Map<String, dynamic>>>> getPaymentMethods() async {
    final result = await _dioClient.get(ApiConstants.paymentMethods);

    return result.map((data) {
      final List<dynamic> methods = data['data'] ?? data ?? [];
      return methods.cast<Map<String, dynamic>>();
    });
  }
}
