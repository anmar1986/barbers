import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/models/business_model.dart';

/// Barber Repository
/// Handles all barber-related API calls
class BarberRepository {
  final DioClient _dioClient;

  BarberRepository(this._dioClient);

  /// Get all barbers (paginated)
  Future<ApiResult<List<Business>>> getBarbers({
    int page = 1,
    int limit = 10,
    String? search,
    String? city,
    bool? verified,
    String orderBy = 'created_at',
    String orderDirection = 'desc',
  }) async {
    return await _dioClient.get<List<Business>>(
      ApiConstants.businesses,
      queryParameters: {
        'business_type': 'barber',
        'page': page,
        'limit': limit,
        if (search != null && search.isNotEmpty) 'search': search,
        if (city != null && city.isNotEmpty) 'city': city,
        if (verified != null) 'verified': verified,
        'order_by': orderBy,
        'order_direction': orderDirection,
      },
      parser: (data) {
        // Handle paginated response: { data: [...], current_page, per_page, ... }
        if (data is Map && data['data'] != null) {
          final items = data['data'] as List;
          return items.map((business) => Business.fromJson(business)).toList();
        }
        // Handle direct list response
        if (data is List) {
          return data.map((business) => Business.fromJson(business)).toList();
        }
        return [];
      },
    );
  }

  /// Get barber by UUID
  Future<ApiResult<Business>> getBarberById(String uuid) async {
    return await _dioClient.get<Business>(
      '${ApiConstants.businessDetail}/$uuid',
      parser: (data) {
        return Business.fromJson(data);
      },
    );
  }

  /// Search barbers
  Future<ApiResult<List<Business>>> searchBarbers({
    required String query,
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Business>>(
      ApiConstants.searchBusinesses,
      queryParameters: {
        'q': query,
        'business_type': 'barber',
        'limit': limit,
      },
      parser: (data) {
        if (data is List) {
          return data.map((business) => Business.fromJson(business)).toList();
        }
        return [];
      },
    );
  }

  /// Get nearby barbers
  Future<ApiResult<List<Business>>> getNearbyBarbers({
    required double latitude,
    required double longitude,
    int radius = 10,
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Business>>(
      ApiConstants.nearbyBusinesses,
      queryParameters: {
        'business_type': 'barber',
        'lat': latitude,
        'lng': longitude,
        'radius': radius,
        'limit': limit,
      },
      parser: (data) {
        if (data is List) {
          return data.map((business) => Business.fromJson(business)).toList();
        }
        return [];
      },
    );
  }

  /// Get featured barbers
  Future<ApiResult<List<Business>>> getFeaturedBarbers({
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Business>>(
      ApiConstants.featuredBusinesses,
      queryParameters: {
        'business_type': 'barber',
        'limit': limit,
      },
      parser: (data) {
        if (data is List) {
          return data.map((business) => Business.fromJson(business)).toList();
        }
        return [];
      },
    );
  }

  /// Get barber services
  Future<ApiResult<List<BusinessService>>> getBarberServices(
      String uuid) async {
    return await _dioClient.get<List<BusinessService>>(
      '${ApiConstants.businessServices}/$uuid/services',
      parser: (data) {
        if (data is List) {
          return data.map((service) => BusinessService.fromJson(service)).toList();
        }
        return [];
      },
    );
  }

  /// Follow a barber
  Future<ApiResult<void>> followBarber(String uuid) async {
    return await _dioClient.post<void>(
      '${ApiConstants.followBusiness}/$uuid/follow',
    );
  }

  /// Unfollow a barber
  Future<ApiResult<void>> unfollowBarber(String uuid) async {
    return await _dioClient.post<void>(
      '${ApiConstants.unfollowBusiness}/$uuid/unfollow',
    );
  }
}
