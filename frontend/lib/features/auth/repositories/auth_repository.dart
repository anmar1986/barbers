import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../../../core/network/api_interceptor.dart';
import '../../../core/constants/api_constants.dart';
import '../models/user_model.dart';
import '../models/auth_response.dart';

/// Auth Repository
/// Handles all authentication-related API calls
class AuthRepository {
  final DioClient _dioClient;

  AuthRepository(this._dioClient);

  /// Login with email and password
  Future<ApiResult<AuthResponse>> login({
    required String email,
    required String password,
  }) async {
    final result = await _dioClient.post<AuthResponse>(
      ApiConstants.login,
      data: {
        'email': email,
        'password': password,
      },
      parser: (data) => AuthResponse.fromJson(data),
    );

    // Save tokens if successful
    if (result is Success<AuthResponse>) {
      await ApiInterceptor.saveToken(result.data.token);
      if (result.data.refreshToken != null) {
        await ApiInterceptor.saveRefreshToken(result.data.refreshToken!);
      }
    }

    return result;
  }

  /// Register new user
  Future<ApiResult<AuthResponse>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String passwordConfirmation,
    required String userType,
    String? phone,
  }) async {
    final result = await _dioClient.post<AuthResponse>(
      ApiConstants.register,
      data: {
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        'password': password,
        'password_confirmation': passwordConfirmation,
        'user_type': userType,
        if (phone != null) 'phone': phone,
      },
      parser: (data) => AuthResponse.fromJson(data),
    );

    // Save tokens if successful
    if (result is Success<AuthResponse>) {
      await ApiInterceptor.saveToken(result.data.token);
      if (result.data.refreshToken != null) {
        await ApiInterceptor.saveRefreshToken(result.data.refreshToken!);
      }
    }

    return result;
  }

  /// Logout
  Future<ApiResult<void>> logout() async {
    final result = await _dioClient.post<void>(
      ApiConstants.logout,
    );

    // Clear tokens
    await ApiInterceptor.clearTokens();

    return result;
  }

  /// Get current user profile
  Future<ApiResult<User>> getProfile() async {
    return await _dioClient.get<User>(
      ApiConstants.profile,
      parser: (data) => User.fromJson(data),
    );
  }

  /// Update user profile
  Future<ApiResult<User>> updateProfile({
    String? name,
    String? email,
    String? phone,
  }) async {
    return await _dioClient.put<User>(
      ApiConstants.updateProfile,
      data: {
        if (name != null) 'name': name,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
      },
      parser: (data) => User.fromJson(data),
    );
  }

  /// Forgot password - send reset email
  Future<ApiResult<void>> forgotPassword({
    required String email,
  }) async {
    return await _dioClient.post<void>(
      ApiConstants.forgotPassword,
      data: {'email': email},
    );
  }

  /// Reset password with token
  Future<ApiResult<void>> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  }) async {
    return await _dioClient.post<void>(
      ApiConstants.resetPassword,
      data: {
        'email': email,
        'token': token,
        'password': password,
        'password_confirmation': passwordConfirmation,
      },
    );
  }

  /// Verify email
  Future<ApiResult<void>> verifyEmail({
    required String token,
  }) async {
    return await _dioClient.post<void>(
      ApiConstants.verifyEmail,
      data: {'token': token},
    );
  }

  /// Resend verification email
  Future<ApiResult<void>> resendVerification() async {
    return await _dioClient.post<void>(
      ApiConstants.resendVerification,
    );
  }

  /// Update password
  Future<ApiResult<void>> updatePassword({
    required String currentPassword,
    required String newPassword,
    required String passwordConfirmation,
  }) async {
    return await _dioClient.put<void>(
      ApiConstants.updatePassword,
      data: {
        'current_password': currentPassword,
        'password': newPassword,
        'password_confirmation': passwordConfirmation,
      },
    );
  }

  /// Delete account
  Future<ApiResult<void>> deleteAccount() async {
    final result = await _dioClient.delete<void>(
      ApiConstants.deleteAccount,
    );

    // Clear tokens
    await ApiInterceptor.clearTokens();

    return result;
  }
}
