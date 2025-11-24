/// Product Model
/// Represents a product in the e-commerce shop
class Product {
  final int id;
  final String uuid;
  final int businessId;
  final int? categoryId;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final double? comparePrice;
  final double? costPerItem;
  final String? sku;
  final String? barcode;
  final int stockQuantity;
  final bool trackInventory;
  final bool isAvailable;
  final double? weight;
  final String? weightUnit;
  final double rating;
  final int reviewCount;
  final int viewCount;
  final List<ProductImage>? images;
  final ProductCategory? category;
  final ProductBusiness? business;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Product({
    required this.id,
    required this.uuid,
    required this.businessId,
    this.categoryId,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.comparePrice,
    this.costPerItem,
    this.sku,
    this.barcode,
    this.stockQuantity = 0,
    this.trackInventory = true,
    this.isAvailable = true,
    this.weight,
    this.weightUnit,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.viewCount = 0,
    this.images,
    this.category,
    this.business,
    this.createdAt,
    this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      uuid: json['uuid'] ?? '',
      businessId: json['business_id'] ?? 0,
      categoryId: json['category_id'],
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'],
      price: double.tryParse(json['price']?.toString() ?? '0') ?? 0.0,
      comparePrice: json['compare_price'] != null
          ? double.tryParse(json['compare_price'].toString())
          : null,
      costPerItem: json['cost_per_item'] != null
          ? double.tryParse(json['cost_per_item'].toString())
          : null,
      sku: json['sku'],
      barcode: json['barcode'],
      stockQuantity: json['stock_quantity'] ?? 0,
      trackInventory:
          json['track_inventory'] == true || json['track_inventory'] == 1,
      isAvailable: json['is_available'] == true || json['is_available'] == 1,
      weight: json['weight'] != null
          ? double.tryParse(json['weight'].toString())
          : null,
      weightUnit: json['weight_unit'],
      rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0.0,
      reviewCount: json['review_count'] ?? 0,
      viewCount: json['view_count'] ?? 0,
      images: json['images'] != null
          ? (json['images'] as List)
              .map((i) => ProductImage.fromJson(i))
              .toList()
          : null,
      category: json['category'] != null
          ? ProductCategory.fromJson(json['category'])
          : null,
      business: json['business'] != null
          ? ProductBusiness.fromJson(json['business'])
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
      'uuid': uuid,
      'business_id': businessId,
      'category_id': categoryId,
      'name': name,
      'slug': slug,
      'description': description,
      'price': price,
      'compare_price': comparePrice,
      'cost_per_item': costPerItem,
      'sku': sku,
      'barcode': barcode,
      'stock_quantity': stockQuantity,
      'track_inventory': trackInventory,
      'is_available': isAvailable,
      'weight': weight,
      'weight_unit': weightUnit,
      'rating': rating,
      'review_count': reviewCount,
      'view_count': viewCount,
    };
  }

  Product copyWith({
    int? id,
    String? uuid,
    int? businessId,
    int? categoryId,
    String? name,
    String? slug,
    String? description,
    double? price,
    double? comparePrice,
    double? costPerItem,
    String? sku,
    String? barcode,
    int? stockQuantity,
    bool? trackInventory,
    bool? isAvailable,
    double? weight,
    String? weightUnit,
    double? rating,
    int? reviewCount,
    int? viewCount,
    List<ProductImage>? images,
    ProductCategory? category,
    ProductBusiness? business,
  }) {
    return Product(
      id: id ?? this.id,
      uuid: uuid ?? this.uuid,
      businessId: businessId ?? this.businessId,
      categoryId: categoryId ?? this.categoryId,
      name: name ?? this.name,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      price: price ?? this.price,
      comparePrice: comparePrice ?? this.comparePrice,
      costPerItem: costPerItem ?? this.costPerItem,
      sku: sku ?? this.sku,
      barcode: barcode ?? this.barcode,
      stockQuantity: stockQuantity ?? this.stockQuantity,
      trackInventory: trackInventory ?? this.trackInventory,
      isAvailable: isAvailable ?? this.isAvailable,
      weight: weight ?? this.weight,
      weightUnit: weightUnit ?? this.weightUnit,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      viewCount: viewCount ?? this.viewCount,
      images: images ?? this.images,
      category: category ?? this.category,
      business: business ?? this.business,
    );
  }

  /// Get the primary image URL
  String? get primaryImageUrl {
    if (images == null || images!.isEmpty) return null;
    final primary = images!.where((i) => i.isPrimary).firstOrNull;
    return primary?.imageUrl ?? images!.first.imageUrl;
  }

  /// Get formatted price
  String get formattedPrice => '\$${price.toStringAsFixed(2)}';

  /// Get formatted compare price
  String? get formattedComparePrice {
    if (comparePrice == null) return null;
    return '\$${comparePrice!.toStringAsFixed(2)}';
  }

  /// Check if product has discount
  bool get hasDiscount => comparePrice != null && comparePrice! > price;

  /// Get discount percentage
  int get discountPercentage {
    if (!hasDiscount) return 0;
    return (((comparePrice! - price) / comparePrice!) * 100).round();
  }

  /// Check if product is in stock
  bool get inStock => !trackInventory || stockQuantity > 0;

  /// Get stock status text
  String get stockStatus {
    if (!trackInventory) return 'In Stock';
    if (stockQuantity <= 0) return 'Out of Stock';
    if (stockQuantity < 5) return 'Low Stock ($stockQuantity left)';
    return 'In Stock';
  }
}

/// Product Image Model
class ProductImage {
  final int id;
  final int productId;
  final String imageUrl;
  final int displayOrder;
  final bool isPrimary;

  const ProductImage({
    required this.id,
    required this.productId,
    required this.imageUrl,
    this.displayOrder = 0,
    this.isPrimary = false,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    String? imageUrl = json['image_url'];
    // Fix localhost URLs for emulator
    if (imageUrl != null) {
      imageUrl = imageUrl.replaceAll('://localhost:', '://10.0.2.2:');
    }

    return ProductImage(
      id: json['id'] ?? 0,
      productId: json['product_id'] ?? 0,
      imageUrl: imageUrl ?? '',
      displayOrder: json['display_order'] ?? 0,
      isPrimary: json['is_primary'] == true || json['is_primary'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_id': productId,
      'image_url': imageUrl,
      'display_order': displayOrder,
      'is_primary': isPrimary,
    };
  }
}

/// Product Category Model
class ProductCategory {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final int? parentId;
  final String? imageUrl;
  final int displayOrder;
  final bool isActive;
  final int? productCount;
  final List<ProductCategory>? children;

  const ProductCategory({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.parentId,
    this.imageUrl,
    this.displayOrder = 0,
    this.isActive = true,
    this.productCount,
    this.children,
  });

  factory ProductCategory.fromJson(Map<String, dynamic> json) {
    String? imageUrl = json['image_url'];
    if (imageUrl != null) {
      imageUrl = imageUrl.replaceAll('://localhost:', '://10.0.2.2:');
    }

    return ProductCategory(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'],
      parentId: json['parent_id'],
      imageUrl: imageUrl,
      displayOrder: json['display_order'] ?? 0,
      isActive: json['is_active'] == true || json['is_active'] == 1,
      productCount: json['products_count'] ?? json['product_count'],
      children: json['children'] != null
          ? (json['children'] as List)
              .map((c) => ProductCategory.fromJson(c))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'parent_id': parentId,
      'image_url': imageUrl,
      'display_order': displayOrder,
      'is_active': isActive,
    };
  }
}

/// Product Business Model (simplified business info for products)
class ProductBusiness {
  final int id;
  final String uuid;
  final String businessName;
  final String? logo;
  final double averageRating;
  final bool isVerified;

  const ProductBusiness({
    required this.id,
    required this.uuid,
    required this.businessName,
    this.logo,
    this.averageRating = 0.0,
    this.isVerified = false,
  });

  factory ProductBusiness.fromJson(Map<String, dynamic> json) {
    String? logo = json['logo'];
    if (logo != null) {
      logo = logo.replaceAll('://localhost:', '://10.0.2.2:');
    }

    return ProductBusiness(
      id: json['id'] ?? 0,
      uuid: json['uuid'] ?? '',
      businessName: json['business_name'] ?? '',
      logo: logo,
      averageRating:
          double.tryParse(json['average_rating']?.toString() ?? '0') ?? 0.0,
      isVerified: json['is_verified'] == true || json['is_verified'] == 1,
    );
  }
}
