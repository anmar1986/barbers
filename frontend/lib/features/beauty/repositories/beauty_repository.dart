import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/models/business_model.dart';

/// Beauty Repository
/// Handles all beauty-related API calls (nail_studio, hair_salon, massage)
class BeautyRepository {
  final DioClient _dioClient;

  BeautyRepository(this._dioClient);

  /// Beauty business types
  static const List<String> beautyTypes = [
    'nail_studio',
    'hair_salon',
    'massage',
  ];

  /// Get all beauty businesses (paginated)
  Future<ApiResult<List<Business>>> getBeautyBusinesses({
    int page = 1,
    int limit = 10,
    String? businessType, // null for all beauty types
    String? search,
    String? city,
    bool? verified,
    String orderBy = 'created_at',
    String orderDirection = 'desc',
  }) async {
    // Build query parameters
    final Map<String, dynamic> queryParams = {
      'page': page,
      'limit': limit,
      'order_by': orderBy,
      'order_direction': orderDirection,
    };

    // Add business type filter
    if (businessType != null) {
      queryParams['business_type'] = businessType;
    }
    // Note: When businessType is null, we don't send the parameter
    // and filter results on client side to get all beauty types

    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }
    if (city != null && city.isNotEmpty) {
      queryParams['city'] = city;
    }
    if (verified != null) {
      queryParams['verified'] = verified;
    }

    return await _dioClient.get<List<Business>>(
      ApiConstants.businesses,
      queryParameters: queryParams,
      parser: (data) {
        List<dynamic> items = [];

        // Handle paginated response: { data: [...], current_page, per_page, ... }
        if (data is Map && data['data'] != null) {
          items = data['data'] as List;
        } else if (data is List) {
          items = data;
        }

        // Parse businesses
        final businesses = items.map((business) => Business.fromJson(business)).toList();

        // Filter by beauty types if no specific type provided (All filter)
        if (businessType == null) {
          return businesses
              .where((b) => beautyTypes.contains(b.businessType))
              .toList();
        }
        return businesses;
      },
    );
  }

  /// Get businesses by specific type
  Future<ApiResult<List<Business>>> getBusinessesByType({
    required String businessType,
    int page = 1,
    int limit = 10,
    String? search,
  }) async {
    return await _dioClient.get<List<Business>>(
      ApiConstants.businesses,
      queryParameters: {
        'business_type': businessType,
        'page': page,
        'limit': limit,
        if (search != null && search.isNotEmpty) 'search': search,
      },
      parser: (data) {
        // Handle paginated response
        if (data is Map && data['data'] != null) {
          final items = data['data'] as List;
          return items.map((business) => Business.fromJson(business)).toList();
        }
        if (data is List) {
          return data.map((business) => Business.fromJson(business)).toList();
        }
        return [];
      },
    );
  }

  /// Get nail studios
  Future<ApiResult<List<Business>>> getNailStudios({
    int page = 1,
    int limit = 10,
    String? search,
  }) async {
    return getBusinessesByType(
      businessType: 'nail_studio',
      page: page,
      limit: limit,
      search: search,
    );
  }

  /// Get hair salons
  Future<ApiResult<List<Business>>> getHairSalons({
    int page = 1,
    int limit = 10,
    String? search,
  }) async {
    return getBusinessesByType(
      businessType: 'hair_salon',
      page: page,
      limit: limit,
      search: search,
    );
  }

  /// Get massage centers
  Future<ApiResult<List<Business>>> getMassageCenters({
    int page = 1,
    int limit = 10,
    String? search,
  }) async {
    return getBusinessesByType(
      businessType: 'massage',
      page: page,
      limit: limit,
      search: search,
    );
  }

  /// Get beauty business by UUID
  Future<ApiResult<Business>> getBeautyBusinessById(String uuid) async {
    return await _dioClient.get<Business>(
      '${ApiConstants.businessDetail}/$uuid',
      parser: (data) {
        return Business.fromJson(data);
      },
    );
  }

  /// Search beauty businesses
  Future<ApiResult<List<Business>>> searchBeautyBusinesses({
    required String query,
    String? businessType,
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Business>>(
      ApiConstants.searchBusinesses,
      queryParameters: {
        'q': query,
        if (businessType != null) 'business_type': businessType,
        'limit': limit,
      },
      parser: (data) {
        if (data is List) {
          final businesses =
              data.map((business) => Business.fromJson(business)).toList();
          // Filter to only beauty types if no specific type provided
          if (businessType == null) {
            return businesses
                .where((b) => beautyTypes.contains(b.businessType))
                .toList();
          }
          return businesses;
        }
        return [];
      },
    );
  }

  /// Get nearby beauty businesses
  Future<ApiResult<List<Business>>> getNearbyBeautyBusinesses({
    required double latitude,
    required double longitude,
    String? businessType,
    int radius = 10,
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Business>>(
      ApiConstants.nearbyBusinesses,
      queryParameters: {
        if (businessType != null) 'business_type': businessType,
        'lat': latitude,
        'lng': longitude,
        'radius': radius,
        'limit': limit,
      },
      parser: (data) {
        if (data is List) {
          final businesses =
              data.map((business) => Business.fromJson(business)).toList();
          // Filter to only beauty types if no specific type provided
          if (businessType == null) {
            return businesses
                .where((b) => beautyTypes.contains(b.businessType))
                .toList();
          }
          return businesses;
        }
        return [];
      },
    );
  }

  /// Get featured beauty businesses
  Future<ApiResult<List<Business>>> getFeaturedBeautyBusinesses({
    String? businessType,
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Business>>(
      ApiConstants.featuredBusinesses,
      queryParameters: {
        if (businessType != null) 'business_type': businessType,
        'limit': limit,
      },
      parser: (data) {
        if (data is List) {
          final businesses =
              data.map((business) => Business.fromJson(business)).toList();
          // Filter to only beauty types if no specific type provided
          if (businessType == null) {
            return businesses
                .where((b) => beautyTypes.contains(b.businessType))
                .toList();
          }
          return businesses;
        }
        return [];
      },
    );
  }

  /// Get business services
  Future<ApiResult<List<BusinessService>>> getBusinessServices(
      String uuid) async {
    return await _dioClient.get<List<BusinessService>>(
      '${ApiConstants.businessServices}/$uuid/services',
      parser: (data) {
        if (data is List) {
          return data
              .map((service) => BusinessService.fromJson(service))
              .toList();
        }
        return [];
      },
    );
  }

  /// Follow a business
  Future<ApiResult<void>> followBusiness(String uuid) async {
    return await _dioClient.post<void>(
      '${ApiConstants.followBusiness}/$uuid/follow',
    );
  }

  /// Unfollow a business
  Future<ApiResult<void>> unfollowBusiness(String uuid) async {
    return await _dioClient.post<void>(
      '${ApiConstants.unfollowBusiness}/$uuid/unfollow',
    );
  }
}
