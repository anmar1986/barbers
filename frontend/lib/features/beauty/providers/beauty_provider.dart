import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../../../shared/models/business_model.dart';
import '../repositories/beauty_repository.dart';

/// Beauty List State
class BeautyListState {
  final List<Business> businesses;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final int currentPage;
  final bool hasMore;
  final String? searchQuery;
  final String? selectedType; // null = all, or nail_studio, hair_salon, massage

  const BeautyListState({
    this.businesses = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.currentPage = 1,
    this.hasMore = true,
    this.searchQuery,
    this.selectedType,
  });

  BeautyListState copyWith({
    List<Business>? businesses,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    int? currentPage,
    bool? hasMore,
    String? searchQuery,
    String? selectedType,
    bool clearSelectedType = false,
  }) {
    return BeautyListState(
      businesses: businesses ?? this.businesses,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      searchQuery: searchQuery ?? this.searchQuery,
      selectedType: clearSelectedType ? null : (selectedType ?? this.selectedType),
    );
  }
}

/// Dio Client Provider for Beauty
final beautyDioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});

/// Beauty Repository Provider
final beautyRepositoryProvider = Provider<BeautyRepository>((ref) {
  return BeautyRepository(ref.read(beautyDioClientProvider));
});

/// Beauty List Notifier
class BeautyListNotifier extends StateNotifier<BeautyListState> {
  final BeautyRepository _repository;

  BeautyListNotifier(this._repository) : super(const BeautyListState()) {
    loadBusinesses();
  }

  /// Load initial businesses
  Future<void> loadBusinesses({bool refresh = false}) async {
    if (state.isLoading && !refresh) return;

    state = state.copyWith(
      isLoading: true,
      error: null,
      currentPage: refresh ? 1 : state.currentPage,
    );

    final result = await _repository.getBeautyBusinesses(
      page: refresh ? 1 : state.currentPage,
      limit: 10,
      businessType: state.selectedType,
      search: state.searchQuery,
    );

    result.onSuccess((businesses) {
      state = BeautyListState(
        businesses: refresh ? businesses : [...state.businesses, ...businesses],
        isLoading: false,
        currentPage: refresh ? 1 : state.currentPage,
        hasMore: businesses.isNotEmpty && businesses.length >= 10,
        searchQuery: state.searchQuery,
        selectedType: state.selectedType,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Load more businesses (pagination)
  Future<void> loadMoreBusinesses() async {
    if (state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    final result = await _repository.getBeautyBusinesses(
      page: state.currentPage + 1,
      limit: 10,
      businessType: state.selectedType,
      search: state.searchQuery,
    );

    result.onSuccess((businesses) {
      state = BeautyListState(
        businesses: [...state.businesses, ...businesses],
        isLoadingMore: false,
        currentPage: state.currentPage + 1,
        hasMore: businesses.isNotEmpty && businesses.length >= 10,
        searchQuery: state.searchQuery,
        selectedType: state.selectedType,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoadingMore: false,
        error: error,
      );
    });
  }

  /// Refresh businesses
  Future<void> refreshBusinesses() async {
    await loadBusinesses(refresh: true);
  }

  /// Search businesses
  Future<void> searchBusinesses(String query) async {
    state = state.copyWith(searchQuery: query.isEmpty ? null : query);
    await loadBusinesses(refresh: true);
  }

  /// Filter by business type
  Future<void> setBusinessType(String? type) async {
    state = state.copyWith(
      selectedType: type,
      clearSelectedType: type == null,
    );
    await loadBusinesses(refresh: true);
  }

  /// Clear search
  void clearSearch() {
    state = state.copyWith(searchQuery: null);
    loadBusinesses(refresh: true);
  }
}

/// Beauty List Provider
final beautyListProvider =
    StateNotifierProvider<BeautyListNotifier, BeautyListState>((ref) {
  return BeautyListNotifier(ref.read(beautyRepositoryProvider));
});

/// Provider for specific business type
final beautyTypeProvider = StateNotifierProvider.family<BeautyListNotifier,
    BeautyListState, String?>((ref, businessType) {
  final notifier = BeautyListNotifier(ref.read(beautyRepositoryProvider));
  if (businessType != null) {
    notifier.setBusinessType(businessType);
  }
  return notifier;
});

/// Single Beauty Business State
class BeautyDetailState {
  final Business? business;
  final bool isLoading;
  final String? error;

  const BeautyDetailState({
    this.business,
    this.isLoading = false,
    this.error,
  });

  BeautyDetailState copyWith({
    Business? business,
    bool? isLoading,
    String? error,
  }) {
    return BeautyDetailState(
      business: business ?? this.business,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Beauty Detail Notifier
class BeautyDetailNotifier extends StateNotifier<BeautyDetailState> {
  final BeautyRepository _repository;
  final String businessUuid;

  BeautyDetailNotifier(this._repository, this.businessUuid)
      : super(const BeautyDetailState()) {
    loadBusiness();
  }

  /// Load business details
  Future<void> loadBusiness() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getBeautyBusinessById(businessUuid);

    result.onSuccess((business) {
      state = BeautyDetailState(
        business: business,
        isLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Follow business
  Future<void> followBusiness() async {
    if (state.business == null) return;

    final result = await _repository.followBusiness(state.business!.uuid);

    result.onSuccess((_) {
      loadBusiness();
    });
  }

  /// Unfollow business
  Future<void> unfollowBusiness() async {
    if (state.business == null) return;

    final result = await _repository.unfollowBusiness(state.business!.uuid);

    result.onSuccess((_) {
      loadBusiness();
    });
  }
}

/// Beauty Detail Provider Factory
final beautyDetailProvider = StateNotifierProvider.family<BeautyDetailNotifier,
    BeautyDetailState, String>((ref, businessUuid) {
  return BeautyDetailNotifier(ref.read(beautyRepositoryProvider), businessUuid);
});
