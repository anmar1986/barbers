import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_result.dart';
import '../../../shared/models/business_model.dart';
import '../../videos/models/video_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../repositories/business_repository.dart';

/// Business Profile State
class BusinessProfileState {
  final Business? business;
  final BusinessStatistics? statistics;
  final List<BusinessService> services;
  final List<BusinessHours> hours;
  final List<Video> videos;
  final bool isLoading;
  final bool isServicesLoading;
  final bool isHoursLoading;
  final bool isVideosLoading;
  final String? error;

  const BusinessProfileState({
    this.business,
    this.statistics,
    this.services = const [],
    this.hours = const [],
    this.videos = const [],
    this.isLoading = false,
    this.isServicesLoading = false,
    this.isHoursLoading = false,
    this.isVideosLoading = false,
    this.error,
  });

  BusinessProfileState copyWith({
    Business? business,
    BusinessStatistics? statistics,
    List<BusinessService>? services,
    List<BusinessHours>? hours,
    List<Video>? videos,
    bool? isLoading,
    bool? isServicesLoading,
    bool? isHoursLoading,
    bool? isVideosLoading,
    String? error,
  }) {
    return BusinessProfileState(
      business: business ?? this.business,
      statistics: statistics ?? this.statistics,
      services: services ?? this.services,
      hours: hours ?? this.hours,
      videos: videos ?? this.videos,
      isLoading: isLoading ?? this.isLoading,
      isServicesLoading: isServicesLoading ?? this.isServicesLoading,
      isHoursLoading: isHoursLoading ?? this.isHoursLoading,
      isVideosLoading: isVideosLoading ?? this.isVideosLoading,
      error: error,
    );
  }
}

/// Business Repository Provider
final businessRepositoryProvider = Provider<BusinessRepository>((ref) {
  return BusinessRepository(ref.read(dioClientProvider));
});

/// Business Profile Notifier
class BusinessProfileNotifier extends StateNotifier<BusinessProfileState> {
  final BusinessRepository _repository;

  BusinessProfileNotifier(this._repository)
      : super(const BusinessProfileState());

  /// Load business profile
  Future<void> loadBusiness() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getMyBusiness();

    result.onSuccess((business) {
      state = state.copyWith(
        business: business,
        services: business.services ?? [],
        hours: business.hours ?? [],
        isLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
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
    String? stateName,
    String? zipCode,
    String? country,
    double? latitude,
    double? longitude,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.createBusiness(
      businessName: businessName,
      businessType: businessType,
      description: description,
      phone: phone,
      email: email,
      website: website,
      address: address,
      city: city,
      state: stateName,
      zipCode: zipCode,
      country: country,
      latitude: latitude,
      longitude: longitude,
    );

    result.onSuccess((business) {
      state = state.copyWith(
        business: business,
        services: business.services ?? [],
        hours: business.hours ?? [],
        isLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });

    return result;
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
    this.state = this.state.copyWith(isLoading: true, error: null);

    final result = await _repository.updateBusiness(
      businessName: businessName,
      businessType: businessType,
      description: description,
      phone: phone,
      email: email,
      website: website,
      address: address,
      city: city,
      state: state,
      zipCode: zipCode,
      country: country,
      latitude: latitude,
      longitude: longitude,
      logo: logo,
      coverImage: coverImage,
    );

    result.onSuccess((business) {
      this.state = this.state.copyWith(
            business: business,
            isLoading: false,
          );
    }).onFailure((error) {
      this.state = this.state.copyWith(
            isLoading: false,
            error: error,
          );
    });

    return result;
  }

  /// Load statistics
  Future<void> loadStatistics() async {
    final result = await _repository.getStatistics();

    result.onSuccess((statistics) {
      state = state.copyWith(statistics: statistics);
    });
  }

  // ==================== SERVICES ====================

  /// Load services
  Future<void> loadServices() async {
    state = state.copyWith(isServicesLoading: true);

    final result = await _repository.getServices();

    result.onSuccess((services) {
      state = state.copyWith(
        services: services,
        isServicesLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isServicesLoading: false,
        error: error,
      );
    });
  }

  /// Create a new service
  Future<ApiResult<BusinessService>> createService({
    required String name,
    String? description,
    double? price,
    int? duration,
    bool isActive = true,
  }) async {
    final result = await _repository.createService(
      name: name,
      description: description,
      price: price,
      duration: duration,
      isActive: isActive,
    );

    result.onSuccess((service) {
      state = state.copyWith(
        services: [...state.services, service],
      );
    });

    return result;
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
    final result = await _repository.updateService(
      uuid: uuid,
      name: name,
      description: description,
      price: price,
      duration: duration,
      isActive: isActive,
    );

    result.onSuccess((updatedService) {
      final services = state.services.map((s) {
        if (s.uuid == uuid) return updatedService;
        return s;
      }).toList();
      state = state.copyWith(services: services);
    });

    return result;
  }

  /// Delete a service
  Future<ApiResult<void>> deleteService(String uuid) async {
    final result = await _repository.deleteService(uuid);

    result.onSuccess((_) {
      state = state.copyWith(
        services: state.services.where((s) => s.uuid != uuid).toList(),
      );
    });

    return result;
  }

  // ==================== BUSINESS HOURS ====================

  /// Load business hours
  Future<void> loadBusinessHours() async {
    state = state.copyWith(isHoursLoading: true);

    final result = await _repository.getBusinessHours();

    result.onSuccess((hours) {
      // If no hours exist, create default hours
      final businessHours =
          hours.isEmpty ? BusinessHours.createDefaultHours() : hours;
      state = state.copyWith(
        hours: businessHours,
        isHoursLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isHoursLoading: false,
        error: error,
      );
    });
  }

  /// Update business hours
  Future<ApiResult<List<BusinessHours>>> updateBusinessHours(
    List<BusinessHours> hours,
  ) async {
    state = state.copyWith(isHoursLoading: true);

    final result = await _repository.updateBusinessHours(hours);

    result.onSuccess((updatedHours) {
      state = state.copyWith(
        hours: updatedHours,
        isHoursLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isHoursLoading: false,
        error: error,
      );
    });

    return result;
  }

  /// Update single day hours locally (before saving)
  void updateDayHours(int dayOfWeek, BusinessHours newHours) {
    final hours = state.hours.map((h) {
      if (h.dayOfWeek == dayOfWeek) return newHours;
      return h;
    }).toList();
    state = state.copyWith(hours: hours);
  }

  // ==================== VIDEOS ====================

  /// Load videos
  Future<void> loadVideos() async {
    state = state.copyWith(isVideosLoading: true);

    final result = await _repository.getVideos();

    result.onSuccess((videos) {
      state = state.copyWith(
        videos: videos,
        isVideosLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isVideosLoading: false,
        error: error,
      );
    });
  }

  /// Upload image
  Future<ApiResult<UploadResponse>> uploadImage({
    required File file,
    String? directory,
  }) async {
    return await _repository.uploadImage(
      file: file,
      directory: directory,
    );
  }

  /// Upload video and create video entry
  Future<ApiResult<Video>> uploadAndCreateVideo({
    required File file,
    String? title,
    String? description,
  }) async {
    // First upload the video file
    final uploadResult = await _repository.uploadVideo(
      file: file,
      directory: 'videos',
    );

    if (uploadResult is Failure) {
      return Failure(message: (uploadResult as Failure).message);
    }

    final uploadResponse = (uploadResult as Success<UploadResponse>).data;

    // Then create the video entry
    final businessId = state.business?.id ?? 0;
    final createResult = await _repository.createVideo(
      businessId: businessId,
      videoUrl: uploadResponse.fileUrl,
      title: title,
      description: description,
    );

    createResult.onSuccess((video) {
      state = state.copyWith(
        videos: [video, ...state.videos],
      );
    });

    return createResult;
  }

  /// Delete video
  Future<ApiResult<void>> deleteVideo(String uuid) async {
    final result = await _repository.deleteVideo(uuid);

    result.onSuccess((_) {
      state = state.copyWith(
        videos: state.videos.where((v) => v.uuid != uuid).toList(),
      );
    });

    return result;
  }

  /// Clear state
  void clear() {
    state = const BusinessProfileState();
  }
}

/// Business Profile Provider
final businessProfileProvider =
    StateNotifierProvider<BusinessProfileNotifier, BusinessProfileState>((ref) {
  return BusinessProfileNotifier(ref.read(businessRepositoryProvider));
});

/// Convenience providers
final businessProvider = Provider<Business?>((ref) {
  return ref.watch(businessProfileProvider).business;
});

final businessServicesProvider = Provider<List<BusinessService>>((ref) {
  return ref.watch(businessProfileProvider).services;
});

final businessHoursProvider = Provider<List<BusinessHours>>((ref) {
  return ref.watch(businessProfileProvider).hours;
});

final businessVideosProvider = Provider<List<Video>>((ref) {
  return ref.watch(businessProfileProvider).videos;
});

final businessStatisticsProvider = Provider<BusinessStatistics?>((ref) {
  return ref.watch(businessProfileProvider).statistics;
});
