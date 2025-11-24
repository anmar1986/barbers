/// Business Model
/// Represents a business entity (barber, nail_studio, hair_salon, massage)
class Business {
  final int id;
  final String uuid;
  final int userId;
  final String businessName;
  final String businessType;
  final String slug;
  final String? description;
  final String? address;
  final String? city;
  final String? state;
  final String? zipCode;
  final String? country;
  final double? latitude;
  final double? longitude;
  final String? phone;
  final String? email;
  final String? website;
  final String? coverImage;
  final String? logo;
  final bool isVerified;
  final double averageRating;
  final int totalReviews;
  final int viewCount;
  final String status;
  final List<BusinessService>? services;
  final List<BusinessHours>? hours;
  final BusinessUser? user;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Business({
    required this.id,
    required this.uuid,
    required this.userId,
    required this.businessName,
    required this.businessType,
    required this.slug,
    this.description,
    this.address,
    this.city,
    this.state,
    this.zipCode,
    this.country,
    this.latitude,
    this.longitude,
    this.phone,
    this.email,
    this.website,
    this.coverImage,
    this.logo,
    this.isVerified = false,
    this.averageRating = 0.0,
    this.totalReviews = 0,
    this.viewCount = 0,
    this.status = 'active',
    this.services,
    this.hours,
    this.user,
    this.createdAt,
    this.updatedAt,
  });

  /// Convert localhost URLs to emulator-accessible URLs
  static String? _fixImageUrl(String? url) {
    if (url == null) return null;
    // Replace localhost with 10.0.2.2 for Android emulator
    return url.replaceAll('://localhost:', '://10.0.2.2:');
  }

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'] ?? 0,
      uuid: json['uuid'] ?? '',
      userId: json['user_id'] ?? 0,
      businessName: json['business_name'] ?? '',
      businessType: json['business_type'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'],
      address: json['address'],
      city: json['city'],
      state: json['state'],
      zipCode: json['zip_code'],
      country: json['country'],
      latitude: json['latitude'] != null
          ? double.tryParse(json['latitude'].toString())
          : null,
      longitude: json['longitude'] != null
          ? double.tryParse(json['longitude'].toString())
          : null,
      phone: json['phone'],
      email: json['email'],
      website: json['website'],
      coverImage: _fixImageUrl(json['cover_image']),
      logo: _fixImageUrl(json['logo']),
      isVerified: json['is_verified'] == true || json['is_verified'] == 1,
      averageRating:
          double.tryParse(json['average_rating']?.toString() ?? '0') ?? 0.0,
      totalReviews: json['total_reviews'] ?? 0,
      viewCount: json['view_count'] ?? 0,
      status: json['status'] ?? 'active',
      services: json['services'] != null
          ? (json['services'] as List)
              .map((s) => BusinessService.fromJson(s))
              .toList()
          : null,
      hours: json['hours'] != null
          ? (json['hours'] as List)
              .map((h) => BusinessHours.fromJson(h))
              .toList()
          : null,
      user: json['user'] != null ? BusinessUser.fromJson(json['user']) : null,
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
      'user_id': userId,
      'business_name': businessName,
      'business_type': businessType,
      'slug': slug,
      'description': description,
      'address': address,
      'city': city,
      'state': state,
      'zip_code': zipCode,
      'country': country,
      'latitude': latitude,
      'longitude': longitude,
      'phone': phone,
      'email': email,
      'website': website,
      'cover_image': coverImage,
      'logo': logo,
      'is_verified': isVerified,
      'average_rating': averageRating,
      'total_reviews': totalReviews,
      'view_count': viewCount,
      'status': status,
    };
  }

  Business copyWith({
    int? id,
    String? uuid,
    int? userId,
    String? businessName,
    String? businessType,
    String? slug,
    String? description,
    String? address,
    String? city,
    String? state,
    String? zipCode,
    String? country,
    double? latitude,
    double? longitude,
    String? phone,
    String? email,
    String? website,
    String? coverImage,
    String? logo,
    bool? isVerified,
    double? averageRating,
    int? totalReviews,
    int? viewCount,
    String? status,
    List<BusinessService>? services,
    List<BusinessHours>? hours,
    BusinessUser? user,
  }) {
    return Business(
      id: id ?? this.id,
      uuid: uuid ?? this.uuid,
      userId: userId ?? this.userId,
      businessName: businessName ?? this.businessName,
      businessType: businessType ?? this.businessType,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      address: address ?? this.address,
      city: city ?? this.city,
      state: state ?? this.state,
      zipCode: zipCode ?? this.zipCode,
      country: country ?? this.country,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      website: website ?? this.website,
      coverImage: coverImage ?? this.coverImage,
      logo: logo ?? this.logo,
      isVerified: isVerified ?? this.isVerified,
      averageRating: averageRating ?? this.averageRating,
      totalReviews: totalReviews ?? this.totalReviews,
      viewCount: viewCount ?? this.viewCount,
      status: status ?? this.status,
      services: services ?? this.services,
      hours: hours ?? this.hours,
      user: user ?? this.user,
    );
  }

  /// Get display name for business type
  String get businessTypeDisplay {
    switch (businessType) {
      case 'barber':
        return 'Barber Shop';
      case 'nail_studio':
        return 'Nail Studio';
      case 'hair_salon':
        return 'Hair Salon';
      case 'massage':
        return 'Massage & Spa';
      default:
        return businessType;
    }
  }

  /// Check if business is open now
  bool get isOpen {
    // TODO: Implement based on business hours
    return status == 'active';
  }
}

/// Business Service Model
class BusinessService {
  final int id;
  final String? uuid;
  final int businessId;
  final String name;
  final String? description;
  final double? price;
  final int? duration;
  final bool isActive;

  const BusinessService({
    required this.id,
    this.uuid,
    required this.businessId,
    required this.name,
    this.description,
    this.price,
    this.duration,
    this.isActive = true,
  });

  factory BusinessService.fromJson(Map<String, dynamic> json) {
    return BusinessService(
      id: json['id'] ?? 0,
      uuid: json['uuid'],
      businessId: json['business_id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'],
      price: json['price'] != null
          ? double.tryParse(json['price'].toString())
          : null,
      duration: json['duration'],
      isActive: json['is_active'] == true || json['is_active'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'price': price,
      'duration': duration,
      'is_active': isActive,
    };
  }

  BusinessService copyWith({
    int? id,
    String? uuid,
    int? businessId,
    String? name,
    String? description,
    double? price,
    int? duration,
    bool? isActive,
  }) {
    return BusinessService(
      id: id ?? this.id,
      uuid: uuid ?? this.uuid,
      businessId: businessId ?? this.businessId,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      duration: duration ?? this.duration,
      isActive: isActive ?? this.isActive,
    );
  }

  String get formattedPrice {
    if (price == null) return 'Price on request';
    return '\$${price!.toStringAsFixed(2)}';
  }

  String get formattedDuration {
    if (duration == null) return '';
    if (duration! >= 60) {
      final hours = duration! ~/ 60;
      final mins = duration! % 60;
      if (mins == 0) return '${hours}h';
      return '${hours}h ${mins}min';
    }
    return '${duration}min';
  }
}

/// Business Hours Model
class BusinessHours {
  final int id;
  final int businessId;
  final int dayOfWeek;
  final String? openTime;
  final String? closeTime;
  final bool isClosed;

  const BusinessHours({
    required this.id,
    required this.businessId,
    required this.dayOfWeek,
    this.openTime,
    this.closeTime,
    this.isClosed = false,
  });

  factory BusinessHours.fromJson(Map<String, dynamic> json) {
    return BusinessHours(
      id: json['id'] ?? 0,
      businessId: json['business_id'] ?? 0,
      dayOfWeek: json['day_of_week'] ?? 0,
      openTime:
          json['open_time'] != null ? _normalizeTime(json['open_time']) : null,
      closeTime: json['close_time'] != null
          ? _normalizeTime(json['close_time'])
          : null,
      isClosed: json['is_closed'] == true || json['is_closed'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'day_of_week': dayOfWeek,
      'open_time': openTime,
      'close_time': closeTime,
      'is_closed': isClosed,
    };
  }

  BusinessHours copyWith({
    int? id,
    int? businessId,
    int? dayOfWeek,
    String? openTime,
    String? closeTime,
    bool? isClosed,
  }) {
    return BusinessHours(
      id: id ?? this.id,
      businessId: businessId ?? this.businessId,
      dayOfWeek: dayOfWeek ?? this.dayOfWeek,
      openTime: openTime ?? this.openTime,
      closeTime: closeTime ?? this.closeTime,
      isClosed: isClosed ?? this.isClosed,
    );
  }

  String get dayName {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    return days[dayOfWeek % 7];
  }

  String get dayNameShort {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayOfWeek % 7];
  }

  String get formattedHours {
    if (isClosed) return 'Closed';
    if (openTime == null || closeTime == null) return 'Not set';

    // Format times, stripping seconds if present
    final open = _normalizeTime(openTime);
    final close = _normalizeTime(closeTime);
    return '$open - $close';
  }

  /// Strip seconds from time string (HH:MM:SS -> HH:MM)
  static String _normalizeTime(String? time) {
    if (time == null) return '';
    final parts = time.split(':');
    if (parts.length >= 2) {
      return '${parts[0].padLeft(2, '0')}:${parts[1].padLeft(2, '0')}';
    }
    return time;
  }

  /// Create default hours for all days of the week
  static List<BusinessHours> createDefaultHours() {
    return List.generate(7, (index) {
      final isClosed = index == 0; // Closed on Sunday by default
      return BusinessHours(
        id: 0,
        businessId: 0,
        dayOfWeek: index,
        openTime: isClosed ? null : '09:00',
        closeTime: isClosed ? null : '18:00',
        isClosed: isClosed,
      );
    });
  }
}

/// Business User Model (simplified)
class BusinessUser {
  final int id;
  final String name;
  final String? avatar;

  const BusinessUser({
    required this.id,
    required this.name,
    this.avatar,
  });

  factory BusinessUser.fromJson(Map<String, dynamic> json) {
    return BusinessUser(
      id: json['id'] ?? 0,
      name: json['name'] ?? json['first_name'] ?? '',
      avatar: json['avatar'] ?? json['profile_picture'],
    );
  }
}
