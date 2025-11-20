import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../models/user_model.dart';
import '../models/auth_response.dart';
import '../repositories/auth_repository.dart';

/// Auth State
class AuthState {
  final User? user;
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Dio Client Provider
final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});

/// Auth Repository Provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.read(dioClientProvider));
});

/// Auth State Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;

  AuthNotifier(this._authRepository) : super(const AuthState()) {
    // Check if user is already logged in
    _checkAuthStatus();
  }

  /// Check authentication status on app start
  Future<void> _checkAuthStatus() async {
    state = state.copyWith(isLoading: true);

    final result = await _authRepository.getProfile();

    result.onSuccess((user) {
      state = AuthState(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      );
    }).onFailure((_) {
      state = const AuthState(
        isAuthenticated: false,
        isLoading: false,
      );
    });
  }

  /// Login
  Future<ApiResult<AuthResponse>> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _authRepository.login(
      email: email,
      password: password,
    );

    result.onSuccess((authResponse) {
      state = AuthState(
        user: authResponse.user,
        isAuthenticated: true,
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

  /// Register
  Future<ApiResult<AuthResponse>> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    required String userType,
    String? phone,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _authRepository.register(
      name: name,
      email: email,
      password: password,
      passwordConfirmation: passwordConfirmation,
      userType: userType,
      phone: phone,
    );

    result.onSuccess((authResponse) {
      state = AuthState(
        user: authResponse.user,
        isAuthenticated: true,
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

  /// Logout
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);

    await _authRepository.logout();

    state = const AuthState(
      isAuthenticated: false,
      isLoading: false,
    );
  }

  /// Update profile
  Future<ApiResult<User>> updateProfile({
    String? name,
    String? email,
    String? phone,
  }) async {
    final result = await _authRepository.updateProfile(
      name: name,
      email: email,
      phone: phone,
    );

    result.onSuccess((user) {
      state = state.copyWith(user: user);
    });

    return result;
  }

  /// Refresh user data
  Future<void> refreshUser() async {
    final result = await _authRepository.getProfile();

    result.onSuccess((user) {
      state = state.copyWith(user: user);
    });
  }
}

/// Auth Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

/// Convenience providers for specific auth state values
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

final isAuthLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isLoading;
});
