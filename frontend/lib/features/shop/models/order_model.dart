import 'product_model.dart';

/// Order Status enum
enum OrderStatus {
  pending,
  confirmed,
  processing,
  shipped,
  delivered,
  cancelled,
  refunded;

  String get displayName {
    switch (this) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.confirmed:
        return 'Confirmed';
      case OrderStatus.processing:
        return 'Processing';
      case OrderStatus.shipped:
        return 'Shipped';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
      case OrderStatus.refunded:
        return 'Refunded';
    }
  }

  static OrderStatus fromString(String status) {
    return OrderStatus.values.firstWhere(
      (e) => e.name == status.toLowerCase(),
      orElse: () => OrderStatus.pending,
    );
  }
}

/// Payment Status enum
enum PaymentStatus {
  pending,
  paid,
  failed,
  refunded;

  String get displayName {
    switch (this) {
      case PaymentStatus.pending:
        return 'Pending';
      case PaymentStatus.paid:
        return 'Paid';
      case PaymentStatus.failed:
        return 'Failed';
      case PaymentStatus.refunded:
        return 'Refunded';
    }
  }

  static PaymentStatus fromString(String status) {
    return PaymentStatus.values.firstWhere(
      (e) => e.name == status.toLowerCase(),
      orElse: () => PaymentStatus.pending,
    );
  }
}

/// Order Model
/// Represents a completed order
class Order {
  final int id;
  final String orderNumber;
  final int userId;
  final OrderStatus status;
  final double subtotal;
  final double tax;
  final double shippingCost;
  final double total;
  final String? paymentMethod;
  final PaymentStatus paymentStatus;
  final String? paymentTransactionId;
  final ShippingAddress? shippingAddress;
  final ShippingAddress? billingAddress;
  final String? notes;
  final List<OrderItem>? items;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Order({
    required this.id,
    required this.orderNumber,
    required this.userId,
    this.status = OrderStatus.pending,
    required this.subtotal,
    this.tax = 0.0,
    this.shippingCost = 0.0,
    required this.total,
    this.paymentMethod,
    this.paymentStatus = PaymentStatus.pending,
    this.paymentTransactionId,
    this.shippingAddress,
    this.billingAddress,
    this.notes,
    this.items,
    this.createdAt,
    this.updatedAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? 0,
      orderNumber: json['order_number'] ?? '',
      userId: json['user_id'] ?? 0,
      status: OrderStatus.fromString(json['status'] ?? 'pending'),
      subtotal: double.tryParse(json['subtotal']?.toString() ?? '0') ?? 0.0,
      tax: double.tryParse(json['tax']?.toString() ?? '0') ?? 0.0,
      shippingCost:
          double.tryParse(json['shipping_cost']?.toString() ?? '0') ?? 0.0,
      total: double.tryParse(json['total']?.toString() ?? '0') ?? 0.0,
      paymentMethod: json['payment_method'],
      paymentStatus:
          PaymentStatus.fromString(json['payment_status'] ?? 'pending'),
      paymentTransactionId: json['payment_transaction_id'],
      shippingAddress: json['shipping_address'] != null
          ? (json['shipping_address'] is String
              ? ShippingAddress.fromJsonString(json['shipping_address'])
              : ShippingAddress.fromJson(json['shipping_address']))
          : null,
      billingAddress: json['billing_address'] != null
          ? (json['billing_address'] is String
              ? ShippingAddress.fromJsonString(json['billing_address'])
              : ShippingAddress.fromJson(json['billing_address']))
          : null,
      notes: json['notes'],
      items: json['items'] != null
          ? (json['items'] as List).map((i) => OrderItem.fromJson(i)).toList()
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order_number': orderNumber,
      'user_id': userId,
      'status': status.name,
      'subtotal': subtotal,
      'tax': tax,
      'shipping_cost': shippingCost,
      'total': total,
      'payment_method': paymentMethod,
      'payment_status': paymentStatus.name,
      'payment_transaction_id': paymentTransactionId,
      'shipping_address': shippingAddress?.toJson(),
      'billing_address': billingAddress?.toJson(),
      'notes': notes,
    };
  }

  Order copyWith({
    int? id,
    String? orderNumber,
    int? userId,
    OrderStatus? status,
    double? subtotal,
    double? tax,
    double? shippingCost,
    double? total,
    String? paymentMethod,
    PaymentStatus? paymentStatus,
    String? paymentTransactionId,
    ShippingAddress? shippingAddress,
    ShippingAddress? billingAddress,
    String? notes,
    List<OrderItem>? items,
  }) {
    return Order(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      userId: userId ?? this.userId,
      status: status ?? this.status,
      subtotal: subtotal ?? this.subtotal,
      tax: tax ?? this.tax,
      shippingCost: shippingCost ?? this.shippingCost,
      total: total ?? this.total,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentTransactionId: paymentTransactionId ?? this.paymentTransactionId,
      shippingAddress: shippingAddress ?? this.shippingAddress,
      billingAddress: billingAddress ?? this.billingAddress,
      notes: notes ?? this.notes,
      items: items ?? this.items,
    );
  }

  /// Get formatted subtotal
  String get formattedSubtotal => '\$${subtotal.toStringAsFixed(2)}';

  /// Get formatted tax
  String get formattedTax => '\$${tax.toStringAsFixed(2)}';

  /// Get formatted shipping
  String get formattedShipping {
    if (shippingCost == 0) return 'Free';
    return '\$${shippingCost.toStringAsFixed(2)}';
  }

  /// Get formatted total
  String get formattedTotal => '\$${total.toStringAsFixed(2)}';

  /// Get total item count
  int get itemCount => items?.fold(0, (sum, item) => sum! + item.quantity) ?? 0;

  /// Check if order can be cancelled
  bool get canCancel =>
      status == OrderStatus.pending || status == OrderStatus.confirmed;

  /// Check if order is complete
  bool get isComplete =>
      status == OrderStatus.delivered ||
      status == OrderStatus.cancelled ||
      status == OrderStatus.refunded;

  /// Get status color for UI
  String get statusColor {
    switch (status) {
      case OrderStatus.pending:
        return '#F59E0B'; // Amber
      case OrderStatus.confirmed:
        return '#3B82F6'; // Blue
      case OrderStatus.processing:
        return '#8B5CF6'; // Purple
      case OrderStatus.shipped:
        return '#06B6D4'; // Cyan
      case OrderStatus.delivered:
        return '#10B981'; // Green
      case OrderStatus.cancelled:
        return '#EF4444'; // Red
      case OrderStatus.refunded:
        return '#6B7280'; // Gray
    }
  }
}

/// Order Item Model
class OrderItem {
  final int id;
  final int orderId;
  final int productId;
  final int businessId;
  final int quantity;
  final double price;
  final double total;
  final Product? product;

  const OrderItem({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.businessId,
    required this.quantity,
    required this.price,
    required this.total,
    this.product,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? 0,
      orderId: json['order_id'] ?? 0,
      productId: json['product_id'] ?? 0,
      businessId: json['business_id'] ?? 0,
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
      'order_id': orderId,
      'product_id': productId,
      'business_id': businessId,
      'quantity': quantity,
      'price': price,
      'total': total,
    };
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

/// Shipping Address Model
class ShippingAddress {
  final String fullName;
  final String? phone;
  final String addressLine1;
  final String? addressLine2;
  final String city;
  final String? state;
  final String zipCode;
  final String country;

  const ShippingAddress({
    required this.fullName,
    this.phone,
    required this.addressLine1,
    this.addressLine2,
    required this.city,
    this.state,
    required this.zipCode,
    this.country = 'US',
  });

  factory ShippingAddress.fromJson(Map<String, dynamic> json) {
    return ShippingAddress(
      fullName: json['full_name'] ?? json['name'] ?? '',
      phone: json['phone'],
      addressLine1: json['address_line_1'] ?? json['address'] ?? '',
      addressLine2: json['address_line_2'],
      city: json['city'] ?? '',
      state: json['state'],
      zipCode: json['zip_code'] ?? json['postal_code'] ?? '',
      country: json['country'] ?? 'US',
    );
  }

  factory ShippingAddress.fromJsonString(String jsonString) {
    try {
      // Try to parse as JSON
      final parts = jsonString.split(', ');
      if (parts.length >= 3) {
        return ShippingAddress(
          fullName: '',
          addressLine1: parts[0],
          city: parts.length > 1 ? parts[1] : '',
          zipCode: parts.length > 2 ? parts[2] : '',
        );
      }
      return ShippingAddress(
        fullName: '',
        addressLine1: jsonString,
        city: '',
        zipCode: '',
      );
    } catch (e) {
      return ShippingAddress(
        fullName: '',
        addressLine1: jsonString,
        city: '',
        zipCode: '',
      );
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'full_name': fullName,
      'phone': phone,
      'address_line_1': addressLine1,
      'address_line_2': addressLine2,
      'city': city,
      'state': state,
      'zip_code': zipCode,
      'country': country,
    };
  }

  ShippingAddress copyWith({
    String? fullName,
    String? phone,
    String? addressLine1,
    String? addressLine2,
    String? city,
    String? state,
    String? zipCode,
    String? country,
  }) {
    return ShippingAddress(
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      addressLine1: addressLine1 ?? this.addressLine1,
      addressLine2: addressLine2 ?? this.addressLine2,
      city: city ?? this.city,
      state: state ?? this.state,
      zipCode: zipCode ?? this.zipCode,
      country: country ?? this.country,
    );
  }

  /// Get formatted address
  String get formattedAddress {
    final parts = <String>[];
    parts.add(addressLine1);
    if (addressLine2 != null && addressLine2!.isNotEmpty) {
      parts.add(addressLine2!);
    }
    parts.add('$city${state != null ? ', $state' : ''} $zipCode');
    parts.add(country);
    return parts.join('\n');
  }

  /// Get single line address
  String get singleLineAddress {
    return '$addressLine1, $city${state != null ? ', $state' : ''} $zipCode';
  }

  /// Check if address is valid
  bool get isValid =>
      fullName.isNotEmpty &&
      addressLine1.isNotEmpty &&
      city.isNotEmpty &&
      zipCode.isNotEmpty;
}

/// Create Order Request
class CreateOrderRequest {
  final ShippingAddress shippingAddress;
  final ShippingAddress? billingAddress;
  final String paymentMethod;
  final String? paymentToken;
  final String? notes;
  final String? couponCode;

  const CreateOrderRequest({
    required this.shippingAddress,
    this.billingAddress,
    required this.paymentMethod,
    this.paymentToken,
    this.notes,
    this.couponCode,
  });

  Map<String, dynamic> toJson() {
    return {
      'shipping_address': shippingAddress.toJson(),
      if (billingAddress != null) 'billing_address': billingAddress!.toJson(),
      'payment_method': paymentMethod,
      if (paymentToken != null) 'payment_token': paymentToken,
      if (notes != null) 'notes': notes,
      if (couponCode != null) 'coupon_code': couponCode,
    };
  }
}
