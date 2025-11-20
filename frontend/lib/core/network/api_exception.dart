/// Custom API exceptions
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic error;

  ApiException({
    required this.message,
    this.statusCode,
    this.error,
  });

  @override
  String toString() => message;
}

/// Network/Connection exception
class NetworkException extends ApiException {
  NetworkException({String? message})
      : super(
          message: message ?? 'No internet connection. Please check your network.',
        );
}

/// Timeout exception
class TimeoutException extends ApiException {
  TimeoutException({String? message})
      : super(
          message: message ?? 'Request timeout. Please try again.',
        );
}

/// Unauthorized exception (401)
class UnauthorizedException extends ApiException {
  UnauthorizedException({String? message})
      : super(
          message: message ?? 'Unauthorized access. Please login again.',
          statusCode: 401,
        );
}

/// Forbidden exception (403)
class ForbiddenException extends ApiException {
  ForbiddenException({String? message})
      : super(
          message: message ?? 'Access forbidden. You don\'t have permission.',
          statusCode: 403,
        );
}

/// Not found exception (404)
class NotFoundException extends ApiException {
  NotFoundException({String? message})
      : super(
          message: message ?? 'Resource not found.',
          statusCode: 404,
        );
}

/// Validation exception (422)
class ValidationException extends ApiException {
  final Map<String, dynamic>? errors;

  ValidationException({
    String? message,
    this.errors,
  }) : super(
          message: message ?? 'Validation failed.',
          statusCode: 422,
        );
}

/// Server exception (500+)
class ServerException extends ApiException {
  ServerException({String? message, int? statusCode})
      : super(
          message: message ?? 'Server error. Please try again later.',
          statusCode: statusCode ?? 500,
        );
}

/// Parse exception
class ParseException extends ApiException {
  ParseException({String? message})
      : super(
          message: message ?? 'Failed to parse response data.',
        );
}

/// Cancel exception
class CancelException extends ApiException {
  CancelException({String? message})
      : super(
          message: message ?? 'Request was cancelled.',
        );
}
