import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:developer' as developer;

/// API Interceptor for handling authentication and logging
class ApiInterceptor extends Interceptor {
  /// Storage key for auth token
  static const String _tokenKey = 'auth_token';

  /// Storage key for refresh token
  static const String _refreshTokenKey = 'refresh_token';

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Add authentication token to headers
    final token = await _getToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    // Add common headers
    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';

    // Log request in debug mode
    developer.log(
      '🚀 REQUEST: ${options.method} ${options.uri}',
      name: 'API',
    );

    if (options.data != null) {
      developer.log(
        '📦 REQUEST DATA: ${options.data}',
        name: 'API',
      );
    }

    super.onRequest(options, handler);
  }

  @override
  void onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) {
    // Log response in debug mode
    developer.log(
      '✅ RESPONSE: ${response.statusCode} ${response.requestOptions.uri}',
      name: 'API',
    );

    developer.log(
      '📥 RESPONSE DATA: ${response.data}',
      name: 'API',
    );

    super.onResponse(response, handler);
  }

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // Log error in debug mode
    developer.log(
      '❌ ERROR: ${err.response?.statusCode} ${err.requestOptions.uri}',
      name: 'API',
      error: err,
    );

    // Handle 401 Unauthorized - Token expired
    if (err.response?.statusCode == 401) {
      developer.log(
        '🔄 Attempting token refresh...',
        name: 'API',
      );

      // Try to refresh token
      final refreshed = await _refreshToken(err.requestOptions);

      if (refreshed) {
        // Retry original request with new token
        try {
          final response = await _retry(err.requestOptions);
          return handler.resolve(response);
        } catch (e) {
          developer.log(
            '❌ Retry failed after token refresh',
            name: 'API',
            error: e,
          );
        }
      } else {
        // Refresh failed, clear tokens and redirect to login
        await _clearTokens();
        developer.log(
          '🚪 Token refresh failed, clearing auth data',
          name: 'API',
        );
      }
    }

    super.onError(err, handler);
  }

  /// Get stored auth token
  Future<String?> _getToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_tokenKey);
    } catch (e) {
      developer.log(
        'Error getting token',
        name: 'API',
        error: e,
      );
      return null;
    }
  }

  /// Get stored refresh token
  Future<String?> _getRefreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_refreshTokenKey);
    } catch (e) {
      developer.log(
        'Error getting refresh token',
        name: 'API',
        error: e,
      );
      return null;
    }
  }

  /// Save auth token
  static Future<void> saveToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
    } catch (e) {
      developer.log(
        'Error saving token',
        name: 'API',
        error: e,
      );
    }
  }

  /// Save refresh token
  static Future<void> saveRefreshToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_refreshTokenKey, token);
    } catch (e) {
      developer.log(
        'Error saving refresh token',
        name: 'API',
        error: e,
      );
    }
  }

  /// Clear all tokens
  Future<void> _clearTokens() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_refreshTokenKey);
    } catch (e) {
      developer.log(
        'Error clearing tokens',
        name: 'API',
        error: e,
      );
    }
  }

  /// Clear tokens (public method)
  static Future<void> clearTokens() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_refreshTokenKey);
    } catch (e) {
      developer.log(
        'Error clearing tokens',
        name: 'API',
        error: e,
      );
    }
  }

  /// Refresh auth token
  Future<bool> _refreshToken(RequestOptions options) async {
    try {
      final refreshToken = await _getRefreshToken();
      if (refreshToken == null) return false;

      // Create new Dio instance to avoid interceptor loop
      final dio = Dio();
      final response = await dio.post(
        '${options.baseUrl}/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      if (response.statusCode == 200) {
        final newToken = response.data['data']['token'];
        final newRefreshToken = response.data['data']['refresh_token'];

        await saveToken(newToken);
        await saveRefreshToken(newRefreshToken);

        return true;
      }

      return false;
    } catch (e) {
      developer.log(
        'Token refresh error',
        name: 'API',
        error: e,
      );
      return false;
    }
  }

  /// Retry failed request
  Future<Response> _retry(RequestOptions options) async {
    final token = await _getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    final dio = Dio();
    return dio.request(
      options.path,
      options: Options(
        method: options.method,
        headers: options.headers,
      ),
      data: options.data,
      queryParameters: options.queryParameters,
    );
  }
}
