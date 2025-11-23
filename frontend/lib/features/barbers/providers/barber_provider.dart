import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../../../shared/models/business_model.dart';
import '../repositories/barber_repository.dart';

/// Barber List State
class BarberListState {
  final List<Business> barbers;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final int currentPage;
  final bool hasMore;
  final String? searchQuery;
  final String? selectedFilter;

  const BarberListState({
    this.barbers = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.currentPage = 1,
    this.hasMore = true,
    this.searchQuery,
    this.selectedFilter,
  });

  BarberListState copyWith({
    List<Business>? barbers,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    int? currentPage,
    bool? hasMore,
    String? searchQuery,
    String? selectedFilter,
  }) {
    return BarberListState(
      barbers: barbers ?? this.barbers,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      searchQuery: searchQuery ?? this.searchQuery,
      selectedFilter: selectedFilter ?? this.selectedFilter,
    );
  }
}

/// Dio Client Provider for Barbers
final barberDioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});

/// Barber Repository Provider
final barberRepositoryProvider = Provider<BarberRepository>((ref) {
  return BarberRepository(ref.read(barberDioClientProvider));
});

/// Barber List Notifier
class BarberListNotifier extends StateNotifier<BarberListState> {
  final BarberRepository _repository;

  BarberListNotifier(this._repository) : super(const BarberListState()) {
    loadBarbers();
  }

  /// Load initial barbers
  Future<void> loadBarbers({bool refresh = false}) async {
    if (state.isLoading && !refresh) return;

    state = state.copyWith(
      isLoading: true,
      error: null,
      currentPage: refresh ? 1 : state.currentPage,
    );

    final result = await _repository.getBarbers(
      page: refresh ? 1 : state.currentPage,
      limit: 10,
      search: state.searchQuery,
    );

    result.onSuccess((barbers) {
      state = BarberListState(
        barbers: refresh ? barbers : [...state.barbers, ...barbers],
        isLoading: false,
        currentPage: refresh ? 1 : state.currentPage,
        hasMore: barbers.isNotEmpty && barbers.length >= 10,
        searchQuery: state.searchQuery,
        selectedFilter: state.selectedFilter,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Load more barbers (pagination)
  Future<void> loadMoreBarbers() async {
    if (state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    final result = await _repository.getBarbers(
      page: state.currentPage + 1,
      limit: 10,
      search: state.searchQuery,
    );

    result.onSuccess((barbers) {
      state = BarberListState(
        barbers: [...state.barbers, ...barbers],
        isLoadingMore: false,
        currentPage: state.currentPage + 1,
        hasMore: barbers.isNotEmpty && barbers.length >= 10,
        searchQuery: state.searchQuery,
        selectedFilter: state.selectedFilter,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoadingMore: false,
        error: error,
      );
    });
  }

  /// Refresh barbers
  Future<void> refreshBarbers() async {
    await loadBarbers(refresh: true);
  }

  /// Search barbers
  Future<void> searchBarbers(String query) async {
    state = state.copyWith(searchQuery: query.isEmpty ? null : query);
    await loadBarbers(refresh: true);
  }

  /// Set filter
  void setFilter(String? filter) {
    state = state.copyWith(selectedFilter: filter);
    loadBarbers(refresh: true);
  }

  /// Clear search
  void clearSearch() {
    state = state.copyWith(searchQuery: null);
    loadBarbers(refresh: true);
  }
}

/// Barber List Provider
final barberListProvider =
    StateNotifierProvider<BarberListNotifier, BarberListState>((ref) {
  return BarberListNotifier(ref.read(barberRepositoryProvider));
});

/// Single Barber State
class BarberDetailState {
  final Business? barber;
  final bool isLoading;
  final String? error;

  const BarberDetailState({
    this.barber,
    this.isLoading = false,
    this.error,
  });

  BarberDetailState copyWith({
    Business? barber,
    bool? isLoading,
    String? error,
  }) {
    return BarberDetailState(
      barber: barber ?? this.barber,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Barber Detail Notifier
class BarberDetailNotifier extends StateNotifier<BarberDetailState> {
  final BarberRepository _repository;
  final String barberUuid;

  BarberDetailNotifier(this._repository, this.barberUuid)
      : super(const BarberDetailState()) {
    loadBarber();
  }

  /// Load barber details
  Future<void> loadBarber() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getBarberById(barberUuid);

    result.onSuccess((barber) {
      state = BarberDetailState(
        barber: barber,
        isLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Follow barber
  Future<void> followBarber() async {
    if (state.barber == null) return;

    final result = await _repository.followBarber(state.barber!.uuid);

    result.onSuccess((_) {
      // Refresh barber data
      loadBarber();
    });
  }

  /// Unfollow barber
  Future<void> unfollowBarber() async {
    if (state.barber == null) return;

    final result = await _repository.unfollowBarber(state.barber!.uuid);

    result.onSuccess((_) {
      // Refresh barber data
      loadBarber();
    });
  }
}

/// Barber Detail Provider Factory
final barberDetailProvider = StateNotifierProvider.family<BarberDetailNotifier,
    BarberDetailState, String>((ref, barberUuid) {
  return BarberDetailNotifier(ref.read(barberRepositoryProvider), barberUuid);
});
