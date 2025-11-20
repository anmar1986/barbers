import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import '../constants/api_constants.dart';
import 'api_interceptor.dart';
import 'api_result.dart';
import 'dart:io';

/// HTTP Client built on top of Dio
/// Provides a clean interface for making API requests
class DioClient {
  late final Dio _dio;

  DioClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: ApiConstants.connectTimeout,
        receiveTimeout: ApiConstants.receiveTimeout,
        sendTimeout: ApiConstants.sendTimeout,
        validateStatus: (status) {
          // Accept all status codes to handle them manually
          return status != null && status < 500;
        },
      ),
    );

    // Add interceptors
    _dio.interceptors.add(ApiInterceptor());

    // Add pretty logger in debug mode
    _dio.interceptors.add(
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: true,
        responseHeader: false,
        error: true,
        compact: true,
        maxWidth: 90,
      ),
    );
  }

  /// GET request
  Future<ApiResult<T>> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? parser,
  }) async {
    try {
      final response = await _dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: options,
      );

      return _handleResponse<T>(response, parser);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// POST request
  Future<ApiResult<T>> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? parser,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );

      return _handleResponse<T>(response, parser);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// PUT request
  Future<ApiResult<T>> put<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? parser,
  }) async {
    try {
      final response = await _dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );

      return _handleResponse<T>(response, parser);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// PATCH request
  Future<ApiResult<T>> patch<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? parser,
  }) async {
    try {
      final response = await _dio.patch(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );

      return _handleResponse<T>(response, parser);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// DELETE request
  Future<ApiResult<T>> delete<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic)? parser,
  }) async {
    try {
      final response = await _dio.delete(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );

      return _handleResponse<T>(response, parser);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// Upload file with multipart/form-data
  Future<ApiResult<T>> upload<T>(
    String endpoint, {
    required File file,
    required String fileKey,
    Map<String, dynamic>? data,
    T Function(dynamic)? parser,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final fileName = file.path.split('/').last;
      final formData = FormData.fromMap({
        fileKey: await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        ),
        ...?data,
      });

      final response = await _dio.post(
        endpoint,
        data: formData,
        onSendProgress: onSendProgress,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      return _handleResponse<T>(response, parser);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// Upload multiple files
  Future<ApiResult<T>> uploadMultiple<T>(
    String endpoint, {
    required List<File> files,
    required String fileKey,
    Map<String, dynamic>? data,
    T Function(dynamic)? parser,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        fileKey: [
          for (final file in files)
            await MultipartFile.fromFile(
              file.path,
              filename: file.path.split('/').last,
            ),
        ],
        ...?data,
      });

      final response = await _dio.post(
        endpoint,
        data: formData,
        onSendProgress: onSendProgress,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      return _handleResponse<T>(response, parser);
    } catch (e) {
      return _handleError<T>(e);
    }
  }

  /// Download file
  Future<ApiResult<void>> download(
    String endpoint,
    String savePath, {
    Map<String, dynamic>? queryParameters,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      await _dio.download(
        endpoint,
        savePath,
        queryParameters: queryParameters,
        onReceiveProgress: onReceiveProgress,
      );

      return const Success(null);
    } catch (e) {
      return _handleError<void>(e);
    }
  }

  /// Handle response and parse data
  ApiResult<T> _handleResponse<T>(
    Response response,
    T Function(dynamic)? parser,
  ) {
    final statusCode = response.statusCode ?? 0;

    // Success response (200-299)
    if (statusCode >= 200 && statusCode < 300) {
      try {
        final data = response.data;

        // If no parser provided, return raw data
        if (parser == null) {
          return Success(data as T);
        }

        // Parse response data
        final parsedData = parser(data is Map ? data['data'] : data);
        return Success(parsedData);
      } catch (e) {
        return Failure(
          message: 'Failed to parse response',
          statusCode: statusCode,
          error: e,
        );
      }
    }

    // Error response
    final message = _extractErrorMessage(response.data);

    return Failure(
      message: message,
      statusCode: statusCode,
      error: response.data,
    );
  }

  /// Handle errors and convert to ApiResult
  ApiResult<T> _handleError<T>(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return Failure(
            message: 'Connection timeout. Please try again.',
            error: error,
          );

        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final message = _extractErrorMessage(error.response?.data);

          return Failure(
            message: message,
            statusCode: statusCode,
            error: error.response?.data,
          );

        case DioExceptionType.cancel:
          return const Failure(
            message: 'Request was cancelled',
          );

        case DioExceptionType.connectionError:
          return const Failure(
            message: 'No internet connection. Please check your network.',
          );

        default:
          return Failure(
            message: error.message ?? 'An unexpected error occurred',
            error: error,
          );
      }
    }

    return Failure(
      message: 'An unexpected error occurred',
      error: error,
    );
  }

  /// Extract error message from response
  String _extractErrorMessage(dynamic data) {
    if (data == null) return 'An error occurred';

    if (data is String) return data;

    if (data is Map) {
      // Try common error message keys
      if (data.containsKey('message')) {
        return data['message'].toString();
      }
      if (data.containsKey('error')) {
        return data['error'].toString();
      }
      if (data.containsKey('errors')) {
        final errors = data['errors'];
        if (errors is Map) {
          // Get first error message
          final firstError = errors.values.first;
          if (firstError is List && firstError.isNotEmpty) {
            return firstError.first.toString();
          }
          return firstError.toString();
        }
        return errors.toString();
      }
    }

    return 'An error occurred';
  }

  /// Get Dio instance for advanced usage
  Dio get dio => _dio;
}
