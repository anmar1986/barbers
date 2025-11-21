import 'dart:io';
import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:video_compress/video_compress.dart';

/// Video upload service with compression and chunked upload support
class VideoUploadService {
  final Dio _dio;
  final String _baseUrl;

  // Upload configuration
  static const int chunkSize = 1536 * 1024; // 1.5MB chunks (fits within PHP's 2MB default)
  static const int maxFileSize = 500 * 1024 * 1024; // 500MB max

  VideoUploadService({
    required Dio dio,
    required String baseUrl,
  })  : _dio = dio,
        _baseUrl = baseUrl;

  /// Compress video using video_compress package
  /// Returns the path to the compressed video
  Future<VideoCompressionResult> compressVideo(
    String inputPath, {
    void Function(double progress)? onProgress,
    VideoQuality quality = VideoQuality.MediumQuality,
  }) async {
    final inputFile = File(inputPath);
    if (!await inputFile.exists()) {
      throw VideoUploadException('Input file does not exist');
    }

    // Get original file info
    final originalSize = await inputFile.length();

    // Subscribe to compression progress
    final subscription = VideoCompress.compressProgress$.subscribe((progress) {
      onProgress?.call(progress / 100);
    });

    try {
      // Compress the video
      final info = await VideoCompress.compressVideo(
        inputPath,
        quality: quality,
        deleteOrigin: false,
        includeAudio: true,
      );

      if (info == null || info.path == null) {
        throw VideoUploadException('Video compression failed');
      }

      final compressedFile = File(info.path!);
      final compressedSize = await compressedFile.length();

      return VideoCompressionResult(
        originalPath: inputPath,
        compressedPath: info.path!,
        originalSize: originalSize,
        compressedSize: compressedSize,
        compressionRatio: originalSize / compressedSize,
        width: info.width ?? 0,
        height: info.height ?? 0,
        durationMs: (info.duration ?? 0).toInt(),
      );
    } finally {
      subscription.unsubscribe();
    }
  }

  /// Upload video using chunked upload
  Future<ChunkedUploadResult> uploadVideo(
    String filePath, {
    required String directory,
    required String authToken,
    String? title,
    String? description,
    int? businessId,
    bool createVideoRecord = false,
    void Function(double progress, String status)? onProgress,
    CancelToken? cancelToken,
  }) async {
    final file = File(filePath);
    if (!await file.exists()) {
      throw VideoUploadException('File does not exist');
    }

    final fileSize = await file.length();
    if (fileSize > maxFileSize) {
      throw VideoUploadException('File size exceeds maximum allowed size of ${maxFileSize ~/ (1024 * 1024)}MB');
    }

    final fileName = file.path.split(Platform.pathSeparator).last;
    final mimeType = _getMimeType(fileName);

    // Step 1: Initialize upload
    onProgress?.call(0.0, 'Initializing upload...');

    final initResponse = await _dio.post(
      '$_baseUrl/upload/chunked/init',
      data: {
        'file_name': fileName,
        'file_size': fileSize,
        'mime_type': mimeType,
        'chunk_size': chunkSize,
      },
      options: Options(
        headers: {'Authorization': 'Bearer $authToken'},
      ),
      cancelToken: cancelToken,
    );

    final uploadId = initResponse.data['data']['upload_id'] as String;
    final totalChunks = initResponse.data['data']['total_chunks'] as int;

    // Step 2: Upload chunks
    final fileStream = file.openRead();
    int chunkIndex = 0;

    await for (final chunk in _chunkStream(fileStream, chunkSize)) {
      if (cancelToken?.isCancelled ?? false) {
        await _cancelUpload(uploadId, authToken);
        throw VideoUploadException('Upload cancelled');
      }

      final progress = (chunkIndex + 1) / totalChunks;
      onProgress?.call(progress * 0.9, 'Uploading chunk ${chunkIndex + 1}/$totalChunks...');

      await _uploadChunk(
        uploadId: uploadId,
        chunkIndex: chunkIndex,
        chunkData: chunk,
        authToken: authToken,
        cancelToken: cancelToken,
      );

      chunkIndex++;
    }

    // Step 3: Complete upload
    onProgress?.call(0.95, 'Finalizing upload...');

    final completeResponse = await _dio.post(
      '$_baseUrl/upload/chunked/complete',
      data: {
        'upload_id': uploadId,
        'directory': directory,
        'create_video': createVideoRecord,
        if (businessId != null) 'business_id': businessId,
        if (title != null) 'title': title,
        if (description != null) 'description': description,
      },
      options: Options(
        headers: {'Authorization': 'Bearer $authToken'},
      ),
      cancelToken: cancelToken,
    );

    onProgress?.call(1.0, 'Upload complete!');

    return ChunkedUploadResult(
      fileUrl: completeResponse.data['data']['file_url'] as String,
      filePath: completeResponse.data['data']['file_path'] as String,
      fileName: completeResponse.data['data']['file_name'] as String,
      fileSize: completeResponse.data['data']['file_size'] as int,
      videoId: completeResponse.data['data']['video']?['id'] as int?,
      videoUuid: completeResponse.data['data']['video']?['uuid'] as String?,
    );
  }

  /// Compress and upload video in one operation
  Future<ChunkedUploadResult> compressAndUpload(
    String inputPath, {
    required String directory,
    required String authToken,
    String? title,
    String? description,
    int? businessId,
    bool createVideoRecord = false,
    void Function(double progress, String status)? onProgress,
    CancelToken? cancelToken,
  }) async {
    // Step 1: Compress video (0-50% of progress)
    onProgress?.call(0.0, 'Compressing video...');

    final compressionResult = await compressVideo(
      inputPath,
      onProgress: (progress) {
        onProgress?.call(progress * 0.5, 'Compressing video... ${(progress * 100).toInt()}%');
      },
    );

    // Step 2: Upload compressed video (50-100% of progress)
    try {
      final result = await uploadVideo(
        compressionResult.compressedPath,
        directory: directory,
        authToken: authToken,
        title: title,
        description: description,
        businessId: businessId,
        createVideoRecord: createVideoRecord,
        onProgress: (progress, status) {
          onProgress?.call(0.5 + (progress * 0.5), status);
        },
        cancelToken: cancelToken,
      );

      return result;
    } finally {
      // Clean up compressed file
      final compressedFile = File(compressionResult.compressedPath);
      if (await compressedFile.exists()) {
        await compressedFile.delete();
      }
      // Cancel any ongoing compression
      await VideoCompress.cancelCompression();
    }
  }

  /// Get upload status for resuming
  Future<UploadStatus> getUploadStatus(String uploadId, String authToken) async {
    final response = await _dio.get(
      '$_baseUrl/upload/chunked/status/$uploadId',
      options: Options(
        headers: {'Authorization': 'Bearer $authToken'},
      ),
    );

    final data = response.data['data'];
    return UploadStatus(
      uploadId: data['upload_id'],
      fileName: data['file_name'],
      totalSize: data['total_size'],
      totalChunks: data['total_chunks'],
      uploadedChunks: List<int>.from(data['uploaded_chunks']),
      progress: data['progress'].toDouble(),
      isComplete: data['is_complete'],
    );
  }

  /// Resume a failed upload
  Future<ChunkedUploadResult> resumeUpload(
    String filePath,
    String uploadId, {
    required String directory,
    required String authToken,
    String? title,
    String? description,
    int? businessId,
    bool createVideoRecord = false,
    void Function(double progress, String status)? onProgress,
    CancelToken? cancelToken,
  }) async {
    // Get current status
    final status = await getUploadStatus(uploadId, authToken);

    if (status.isComplete) {
      throw VideoUploadException('Upload is already complete');
    }

    final file = File(filePath);
    final missingChunks = List<int>.generate(status.totalChunks, (i) => i)
        .where((i) => !status.uploadedChunks.contains(i))
        .toList();

    // Upload missing chunks
    for (var i = 0; i < missingChunks.length; i++) {
      final chunkIndex = missingChunks[i];
      final offset = chunkIndex * chunkSize;

      if (cancelToken?.isCancelled ?? false) {
        throw VideoUploadException('Upload cancelled');
      }

      final progress = (status.uploadedChunks.length + i + 1) / status.totalChunks;
      onProgress?.call(progress * 0.9, 'Resuming upload... chunk ${chunkIndex + 1}/${status.totalChunks}');

      final raf = await file.open();
      await raf.setPosition(offset);
      final chunkData = await raf.read(chunkSize);
      await raf.close();

      await _uploadChunk(
        uploadId: uploadId,
        chunkIndex: chunkIndex,
        chunkData: chunkData,
        authToken: authToken,
        cancelToken: cancelToken,
      );
    }

    // Complete upload
    onProgress?.call(0.95, 'Finalizing upload...');

    final completeResponse = await _dio.post(
      '$_baseUrl/upload/chunked/complete',
      data: {
        'upload_id': uploadId,
        'directory': directory,
        'create_video': createVideoRecord,
        if (businessId != null) 'business_id': businessId,
        if (title != null) 'title': title,
        if (description != null) 'description': description,
      },
      options: Options(
        headers: {'Authorization': 'Bearer $authToken'},
      ),
      cancelToken: cancelToken,
    );

    onProgress?.call(1.0, 'Upload complete!');

    return ChunkedUploadResult(
      fileUrl: completeResponse.data['data']['file_url'] as String,
      filePath: completeResponse.data['data']['file_path'] as String,
      fileName: completeResponse.data['data']['file_name'] as String,
      fileSize: completeResponse.data['data']['file_size'] as int,
      videoId: completeResponse.data['data']['video']?['id'] as int?,
      videoUuid: completeResponse.data['data']['video']?['uuid'] as String?,
    );
  }

  // Private helper methods

  Future<void> _uploadChunk({
    required String uploadId,
    required int chunkIndex,
    required Uint8List chunkData,
    required String authToken,
    CancelToken? cancelToken,
  }) async {
    final formData = FormData.fromMap({
      'upload_id': uploadId,
      'chunk_index': chunkIndex,
      'chunk': MultipartFile.fromBytes(
        chunkData,
        filename: 'chunk_$chunkIndex',
      ),
    });

    await _dio.post(
      '$_baseUrl/upload/chunked/chunk',
      data: formData,
      options: Options(
        headers: {'Authorization': 'Bearer $authToken'},
      ),
      cancelToken: cancelToken,
    );
  }

  Future<void> _cancelUpload(String uploadId, String authToken) async {
    try {
      await _dio.delete(
        '$_baseUrl/upload/chunked/cancel/$uploadId',
        options: Options(
          headers: {'Authorization': 'Bearer $authToken'},
        ),
      );
    } catch (_) {
      // Ignore cancel errors
    }
  }

  Stream<Uint8List> _chunkStream(Stream<List<int>> source, int chunkSize) async* {
    var buffer = <int>[];

    await for (final data in source) {
      buffer.addAll(data);

      while (buffer.length >= chunkSize) {
        yield Uint8List.fromList(buffer.sublist(0, chunkSize));
        buffer = buffer.sublist(chunkSize);
      }
    }

    if (buffer.isNotEmpty) {
      yield Uint8List.fromList(buffer);
    }
  }

  String _getMimeType(String fileName) {
    final ext = fileName.split('.').last.toLowerCase();
    switch (ext) {
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      case 'avi':
        return 'video/x-msvideo';
      case 'webm':
        return 'video/webm';
      case 'mpeg':
      case 'mpg':
        return 'video/mpeg';
      default:
        return 'video/mp4';
    }
  }
}

// Data classes

class VideoCompressionResult {
  final String originalPath;
  final String compressedPath;
  final int originalSize;
  final int compressedSize;
  final double compressionRatio;
  final int width;
  final int height;
  final int durationMs;

  VideoCompressionResult({
    required this.originalPath,
    required this.compressedPath,
    required this.originalSize,
    required this.compressedSize,
    required this.compressionRatio,
    required this.width,
    required this.height,
    required this.durationMs,
  });

  String get savedPercentage => '${((1 - (compressedSize / originalSize)) * 100).toStringAsFixed(1)}%';
}

class ChunkedUploadResult {
  final String fileUrl;
  final String filePath;
  final String fileName;
  final int fileSize;
  final int? videoId;
  final String? videoUuid;

  ChunkedUploadResult({
    required this.fileUrl,
    required this.filePath,
    required this.fileName,
    required this.fileSize,
    this.videoId,
    this.videoUuid,
  });
}

class UploadStatus {
  final String uploadId;
  final String fileName;
  final int totalSize;
  final int totalChunks;
  final List<int> uploadedChunks;
  final double progress;
  final bool isComplete;

  UploadStatus({
    required this.uploadId,
    required this.fileName,
    required this.totalSize,
    required this.totalChunks,
    required this.uploadedChunks,
    required this.progress,
    required this.isComplete,
  });
}

class VideoUploadException implements Exception {
  final String message;
  VideoUploadException(this.message);

  @override
  String toString() => 'VideoUploadException: $message';
}
