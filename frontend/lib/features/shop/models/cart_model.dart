import 'product_model.dart';

/// Cart Model
/// Represents the user's shopping cart
class Cart {
  final List<CartItem> items;
  final double subtotal;
  final double? tax;
  final double? shippingCost;
  final double total;
  final String? couponCode;
  final double? discountAmount;

  const Cart({
    this.items = const [],
    this.subtotal = 0.0,
    this.tax,
    this.shippingCost,
    this.total = 0.0,
    this.couponCode,
    this.discountAmount,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      items: json['items'] != null
          ? (json['items'] as List).map((i) => CartItem.fromJson(i)).toList()
          : [],
      subtotal: double.tryParse(json['subtotal']?.toString() ?? '0') ?? 0.0,
      tax: json['tax'] != null ? double.tryParse(json['tax'].toString()) : null,
      shippingCost: json['shipping_cost'] != null
          ? double.tryParse(json['shipping_cost'].toString())
          : null,
      total: double.tryParse(json['total']?.toString() ?? '0') ?? 0.0,
      couponCode: json['coupon_code'],
      discountAmount: json['discount_amount'] != null
          ? double.tryParse(json['discount_amount'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'items': items.map((i) => i.toJson()).toList(),
      'subtotal': subtotal,
      'tax': tax,
      'shipping_cost': shippingCost,
      'total': total,
      'coupon_code': couponCode,
      'discount_amount': discountAmount,
    };
  }

  Cart copyWith({
    List<CartItem>? items,
    double? subtotal,
    double? tax,
    double? shippingCost,
    double? total,
    String? couponCode,
    double? discountAmount,
  }) {
    return Cart(
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      tax: tax ?? this.tax,
      shippingCost: shippingCost ?? this.shippingCost,
      total: total ?? this.total,
      couponCode: couponCode ?? this.couponCode,
      discountAmount: discountAmount ?? this.discountAmount,
    );
  }

  /// Create an empty cart
  factory Cart.empty() => const Cart();

  /// Check if cart is empty
  bool get isEmpty => items.isEmpty;

  /// Check if cart is not empty
  bool get isNotEmpty => items.isNotEmpty;

  /// Get total item count
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  /// Get unique product count
  int get uniqueItemCount => items.length;

  /// Get formatted subtotal
  String get formattedSubtotal => '\$${subtotal.toStringAsFixed(2)}';

  /// Get formatted tax
  String get formattedTax =>
      tax != null ? '\$${tax!.toStringAsFixed(2)}' : '\$0.00';

  /// Get formatted shipping
  String get formattedShipping {
    if (shippingCost == null || shippingCost == 0) return 'Free';
    return '\$${shippingCost!.toStringAsFixed(2)}';
  }

  /// Get formatted total
  String get formattedTotal => '\$${total.toStringAsFixed(2)}';

  /// Get formatted discount
  String? get formattedDiscount {
    if (discountAmount == null) return null;
    return '-\$${discountAmount!.toStringAsFixed(2)}';
  }

  /// Calculate cart from items (for local cart management)
  static Cart fromItems(List<CartItem> items) {
    final subtotal = items.fold<double>(
      0,
      (sum, item) => sum + item.total,
    );
    // Simple tax calculation (can be customized)
    final tax = subtotal * 0.1; // 10% tax
    final total = subtotal + tax;

    return Cart(
      items: items,
      subtotal: subtotal,
      tax: tax,
      total: total,
    );
  }
}

/// Cart Item Model
/// Represents a single item in the cart
class CartItem {
  final int id;
  final int productId;
  final String? productUuid;
  final int quantity;
  final double price;
  final double total;
  final Product? product;

  const CartItem({
    required this.id,
    required this.productId,
    this.productUuid,
    required this.quantity,
    required this.price,
    required this.total,
    this.product,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] ?? 0,
      productId: json['product_id'] ?? 0,
      productUuid: json['product_uuid'],
      quantity: json['quantity'] ?? 1,
      price: double.tryParse(json['price']?.toString() ?? '0') ?? 0.0,
      total: double.tryParse(json['total']?.toString() ?? '0') ?? 0.0,
      product:
          json['product'] != null ? Product.fromJson(json['product']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_id': productId,
      'product_uuid': productUuid,
      'quantity': quantity,
      'price': price,
      'total': total,
    };
  }

  CartItem copyWith({
    int? id,
    int? productId,
    String? productUuid,
    int? quantity,
    double? price,
    double? total,
    Product? product,
  }) {
    return CartItem(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      productUuid: productUuid ?? this.productUuid,
      quantity: quantity ?? this.quantity,
      price: price ?? this.price,
      total: total ?? (quantity ?? this.quantity) * (price ?? this.price),
      product: product ?? this.product,
    );
  }

  /// Create cart item from product
  factory CartItem.fromProduct(Product product, {int quantity = 1}) {
    return CartItem(
      id: 0, // Will be assigned by server
      productId: product.id,
      productUuid: product.uuid,
      quantity: quantity,
      price: product.price,
      total: product.price * quantity,
      product: product,
    );
  }

  /// Get formatted price
  String get formattedPrice => '\$${price.toStringAsFixed(2)}';

  /// Get formatted total
  String get formattedTotal => '\$${total.toStringAsFixed(2)}';

  /// Get product name
  String get productName => product?.name ?? 'Unknown Product';

  /// Get product image
  String? get productImage => product?.primaryImageUrl;
}

/// Add to Cart Request
class AddToCartRequest {
  final String productUuid;
  final int quantity;

  const AddToCartRequest({
    required this.productUuid,
    this.quantity = 1,
  });

  Map<String, dynamic> toJson() {
    return {
      'product_uuid': productUuid,
      'quantity': quantity,
    };
  }
}

/// Update Cart Item Request
class UpdateCartItemRequest {
  final int quantity;

  const UpdateCartItemRequest({
    required this.quantity,
  });

  Map<String, dynamic> toJson() {
    return {
      'quantity': quantity,
    };
  }
}
