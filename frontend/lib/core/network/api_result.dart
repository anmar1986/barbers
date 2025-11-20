/// API Result wrapper for handling success and error states
/// This follows a functional programming approach for error handling
sealed class ApiResult<T> {
  const ApiResult();
}

/// Success result containing data
class Success<T> extends ApiResult<T> {
  final T data;

  const Success(this.data);
}

/// Error result containing error details
class Failure<T> extends ApiResult<T> {
  final String message;
  final int? statusCode;
  final dynamic error;

  const Failure({
    required this.message,
    this.statusCode,
    this.error,
  });
}

/// Extension methods for ApiResult
extension ApiResultExtension<T> on ApiResult<T> {
  /// Check if result is successful
  bool get isSuccess => this is Success<T>;

  /// Check if result is a failure
  bool get isFailure => this is Failure<T>;

  /// Get data if successful, null otherwise
  T? get dataOrNull => this is Success<T> ? (this as Success<T>).data : null;

  /// Get error message if failed, null otherwise
  String? get errorOrNull => this is Failure<T> ? (this as Failure<T>).message : null;

  /// Execute callback if successful
  ApiResult<T> onSuccess(void Function(T data) callback) {
    if (this is Success<T>) {
      callback((this as Success<T>).data);
    }
    return this;
  }

  /// Execute callback if failed
  ApiResult<T> onFailure(void Function(String message) callback) {
    if (this is Failure<T>) {
      callback((this as Failure<T>).message);
    }
    return this;
  }

  /// Transform success data
  ApiResult<R> map<R>(R Function(T data) transform) {
    if (this is Success<T>) {
      return Success(transform((this as Success<T>).data));
    }
    return Failure(
      message: (this as Failure<T>).message,
      statusCode: (this as Failure<T>).statusCode,
      error: (this as Failure<T>).error,
    );
  }
}
