import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/dio_client.dart';

/// Shared DioClient provider
/// Provides a single instance of DioClient across the app
/// to ensure efficient resource usage and shared configuration
final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});
