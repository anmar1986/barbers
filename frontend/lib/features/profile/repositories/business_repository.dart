import 'dart:io';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../../../core/constants/api_constants.dart';
import '../../../shared/models/business_model.dart';
import '../../videos/models/video_model.dart';

/// Business Statistics Model
class BusinessStatistics {
  final int totalViews;
  final int totalFollowers;
  final int totalVideos;
  final int totalReviews;
  final double averageRating;
  final int videosThisMonth;
  final int viewsThisMonth;

  const BusinessStatistics({
    this.totalViews = 0,
    this.totalFollowers = 0,
    this.totalVideos = 0,
    this.totalReviews = 0,
    this.averageRating = 0.0,
    this.videosThisMonth = 0,
    this.viewsThisMonth = 0,
  });

  factory BusinessStatistics.fromJson(Map<String, dynamic> json) {
    return BusinessStatistics(
      totalViews: json['total_views'] ?? json['view_count'] ?? 0,
      totalFollowers: json['total_followers'] ?? json['followers_count'] ?? 0,
      totalVideos: json['total_videos'] ?? json['videos_count'] ?? 0,
      totalReviews: json['total_reviews'] ?? 0,
      averageRating:
          double.tryParse(json['average_rating']?.toString() ?? '0') ?? 0.0,
      videosThisMonth: json['videos_this_month'] ?? 0,
      viewsThisMonth: json['views_this_month'] ?? 0,
    );
  }
}

/// Upload Response Model
class UploadResponse {
  final String fileName;
  final String filePath;
  final String fileUrl;
  final int? fileSize;
  final String? mimeType;

  const UploadResponse({
    required this.fileName,
    required this.filePath,
    required this.fileUrl,
    this.fileSize,
    this.mimeType,
  });

  factory UploadResponse.fromJson(Map<String, dynamic> json) {
    return UploadResponse(
      fileName: json['file_name'] ?? json['filename'] ?? '',
      filePath: json['file_path'] ?? json['path'] ?? '',
      fileUrl: _fixUrl(json['file_url'] ?? json['url'] ?? ''),
      fileSize: json['file_size'],
      mimeType: json['mime_type'],
    );
  }

  static String _fixUrl(String url) {
    return url.replaceAll('://localhost:', '://10.0.2.2:');
  }
}

/// Chunked Upload Init Response
class ChunkedUploadInitResponse {
  final String uploadId;
  final int totalChunks;
  final int chunkSize;
  final DateTime expiresAt;

  const ChunkedUploadInitResponse({
    required this.uploadId,
    required this.totalChunks,
    required this.chunkSize,
    required this.expiresAt,
  });

  factory ChunkedUploadInitResponse.fromJson(Map<String, dynamic> json) {
    return ChunkedUploadInitResponse(
      uploadId: json['upload_id'] ?? '',
      totalChunks: json['total_chunks'] ?? 0,
      chunkSize: json['chunk_size'] ?? 0,
      expiresAt: DateTime.tryParse(json['expires_at'] ?? '') ?? DateTime.now(),
    );
  }
}

/// Business Repository
/// Handles all business owner management API calls
class BusinessRepository {
  final DioClient _dioClient;

  BusinessRepository(this._dioClient);

  // ==================== BUSINESS PROFILE ====================

  /// Get authenticated user's business profile
  Future<ApiResult<Business>> getMyBusiness() async {
    return await _dioClient.get<Business>(
      ApiConstants.myBusiness,
      parser: (data) => Business.fromJson(data),
    );
  }

  /// Create a new business profile
  Future<ApiResult<Business>> createBusiness({
    required String businessName,
    required String businessType,
    String? description,
    String? phone,
    String? email,
    String? website,
    String? address,
    String? city,
    String? state,
    String? zipCode,
    String? country,
    double? latitude,
    double? longitude,
  }) async {
    return await _dioClient.post<Business>(
      ApiConstants.businesses,
      data: {
        'business_name': businessName,
        'business_type': businessType,
        if (description != null) 'description': description,
        if (phone != null) 'phone': phone,
        if (email != null) 'email': email,
        if (website != null) 'website': website,
        if (address != null) 'address': address,
        if (city != null) 'city': city,
        if (state != null) 'state': state,
        if (zipCode != null) 'zip_code': zipCode,
        if (country != null) 'country': country,
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
      },
      parser: (data) => Business.fromJson(data),
    );
  }

  /// Update business profile
  Future<ApiResult<Business>> updateBusiness({
    String? businessName,
    String? businessType,
    String? description,
    String? phone,
    String? email,
    String? website,
    String? address,
    String? city,
    String? state,
    String? zipCode,
    String? country,
    double? latitude,
    double? longitude,
    String? logo,
    String? coverImage,
  }) async {
    final data = <String, dynamic>{};
    if (businessName != null) data['business_name'] = businessName;
    if (businessType != null) data['business_type'] = businessType;
    if (description != null) data['description'] = description;
    if (phone != null) data['phone'] = phone;
    if (email != null) data['email'] = email;
    if (website != null) data['website'] = website;
    if (address != null) data['address'] = address;
    if (city != null) data['city'] = city;
    if (state != null) data['state'] = state;
    if (zipCode != null) data['zip_code'] = zipCode;
    if (country != null) data['country'] = country;
    if (latitude != null) data['latitude'] = latitude;
    if (longitude != null) data['longitude'] = longitude;
    if (logo != null) data['logo'] = logo;
    if (coverImage != null) data['cover_image'] = coverImage;

    return await _dioClient.put<Business>(
      ApiConstants.myBusiness,
      data: data,
      parser: (data) => Business.fromJson(data),
    );
  }

  /// Delete business
  Future<ApiResult<void>> deleteBusiness() async {
    return await _dioClient.delete<void>(
      ApiConstants.myBusiness,
    );
  }

  /// Get business statistics
  Future<ApiResult<BusinessStatistics>> getStatistics() async {
    return await _dioClient.get<BusinessStatistics>(
      ApiConstants.myBusinessStatistics,
      parser: (data) => BusinessStatistics.fromJson(data),
    );
  }

  // ==================== SERVICES ====================

  /// Get all services for user's business
  Future<ApiResult<List<BusinessService>>> getServices() async {
    return await _dioClient.get<List<BusinessService>>(
      ApiConstants.myBusinessServices,
      parser: (data) {
        if (data is List) {
          return data.map((s) => BusinessService.fromJson(s)).toList();
        }
        return [];
      },
    );
  }

  /// Create a new service
  Future<ApiResult<BusinessService>> createService({
    required String name,
    String? description,
    double? price,
    int? duration,
    bool isActive = true,
  }) async {
    return await _dioClient.post<BusinessService>(
      ApiConstants.myBusinessServices,
      data: {
        'name': name,
        if (description != null) 'description': description,
        if (price != null) 'price': price,
        if (duration != null) 'duration': duration,
        'is_active': isActive,
      },
      parser: (data) => BusinessService.fromJson(data),
    );
  }

  /// Update a service
  Future<ApiResult<BusinessService>> updateService({
    required String uuid,
    String? name,
    String? description,
    double? price,
    int? duration,
    bool? isActive,
  }) async {
    final data = <String, dynamic>{};
    if (name != null) data['name'] = name;
    if (description != null) data['description'] = description;
    if (price != null) data['price'] = price;
    if (duration != null) data['duration'] = duration;
    if (isActive != null) data['is_active'] = isActive;

    return await _dioClient.put<BusinessService>(
      '${ApiConstants.myBusinessServices}/$uuid',
      data: data,
      parser: (data) => BusinessService.fromJson(data),
    );
  }

  /// Delete a service
  Future<ApiResult<void>> deleteService(String uuid) async {
    return await _dioClient.delete<void>(
      '${ApiConstants.myBusinessServices}/$uuid',
    );
  }

  // ==================== BUSINESS HOURS ====================

  /// Get business hours
  Future<ApiResult<List<BusinessHours>>> getBusinessHours() async {
    return await _dioClient.get<List<BusinessHours>>(
      ApiConstants.myBusinessHours,
      parser: (data) {
        if (data is List) {
          return data.map((h) => BusinessHours.fromJson(h)).toList();
        }
        return [];
      },
    );
  }

  /// Update business hours
  Future<ApiResult<List<BusinessHours>>> updateBusinessHours(
    List<BusinessHours> hours,
  ) async {
    return await _dioClient.put<List<BusinessHours>>(
      ApiConstants.myBusinessHours,
      data: {
        'hours': hours.map((h) => h.toJson()).toList(),
      },
      parser: (data) {
        if (data is List) {
          return data.map((h) => BusinessHours.fromJson(h)).toList();
        }
        return [];
      },
    );
  }

  // ==================== VIDEOS ====================

  /// Get business videos
  Future<ApiResult<List<Video>>> getVideos() async {
    return await _dioClient.get<List<Video>>(
      ApiConstants.myBusinessVideos,
      parser: (data) {
        if (data is List) {
          return data.map((v) => Video.fromJson(v)).toList();
        }
        return [];
      },
    );
  }

  // ==================== FILE UPLOADS ====================

  /// Upload a single image
  Future<ApiResult<UploadResponse>> uploadImage({
    required File file,
    String? directory,
    int? resizeWidth,
    int? resizeHeight,
    bool createThumbnail = false,
  }) async {
    return await _dioClient.upload<UploadResponse>(
      ApiConstants.uploadImage,
      file: file,
      fileKey: 'file',
      data: {
        if (directory != null) 'directory': directory,
        if (resizeWidth != null) 'resize_width': resizeWidth,
        if (resizeHeight != null) 'resize_height': resizeHeight,
        'create_thumbnail': createThumbnail,
      },
      parser: (data) => UploadResponse.fromJson(data),
    );
  }

  /// Upload a video file (up to 100MB)
  Future<ApiResult<UploadResponse>> uploadVideo({
    required File file,
    String? directory,
  }) async {
    return await _dioClient.upload<UploadResponse>(
      ApiConstants.uploadVideoFile,
      file: file,
      fileKey: 'file',
      data: {
        if (directory != null) 'directory': directory,
      },
      parser: (data) => UploadResponse.fromJson(data),
    );
  }

  /// Initialize chunked upload (for large video files up to 500MB)
  Future<ApiResult<ChunkedUploadInitResponse>> initChunkedUpload({
    required String fileName,
    required int fileSize,
    required String mimeType,
    int chunkSize = 1500000, // 1.5MB default
  }) async {
    return await _dioClient.post<ChunkedUploadInitResponse>(
      ApiConstants.chunkedUploadInit,
      data: {
        'file_name': fileName,
        'file_size': fileSize,
        'mime_type': mimeType,
        'chunk_size': chunkSize,
      },
      parser: (data) => ChunkedUploadInitResponse.fromJson(data),
    );
  }

  /// Delete a file
  Future<ApiResult<void>> deleteFile(String filePath) async {
    return await _dioClient.delete<void>(
      ApiConstants.deleteFile,
      data: {'file': filePath},
    );
  }

  // ==================== CREATE VIDEO ====================

  /// Create a new video entry
  Future<ApiResult<Video>> createVideo({
    required int businessId,
    required String videoUrl,
    String? title,
    String? description,
    String? thumbnailUrl,
    int? duration,
  }) async {
    return await _dioClient.post<Video>(
      ApiConstants.videos,
      data: {
        'business_id': businessId,
        'video_url': videoUrl,
        if (title != null) 'title': title,
        if (description != null) 'description': description,
        if (thumbnailUrl != null) 'thumbnail_url': thumbnailUrl,
        if (duration != null) 'duration': duration,
      },
      parser: (data) => Video.fromJson(data),
    );
  }

  /// Update video
  Future<ApiResult<Video>> updateVideo({
    required String uuid,
    String? title,
    String? description,
    bool? isPublished,
  }) async {
    final data = <String, dynamic>{};
    if (title != null) data['title'] = title;
    if (description != null) data['description'] = description;
    if (isPublished != null) data['is_published'] = isPublished;

    return await _dioClient.put<Video>(
      '${ApiConstants.videos}/$uuid',
      data: data,
      parser: (data) => Video.fromJson(data),
    );
  }

  /// Delete video
  Future<ApiResult<void>> deleteVideo(String uuid) async {
    return await _dioClient.delete<void>(
      '${ApiConstants.videos}/$uuid',
    );
  }
}
