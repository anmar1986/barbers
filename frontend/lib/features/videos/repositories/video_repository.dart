import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../../../core/constants/api_constants.dart';
import '../models/video_model.dart';
import '../models/comment_model.dart';

/// Video Repository
/// Handles all video-related API calls
class VideoRepository {
  final DioClient _dioClient;

  VideoRepository(this._dioClient);

  /// Get video feed (paginated)
  Future<ApiResult<List<Video>>> getVideoFeed({
    int page = 1,
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Video>>(
      ApiConstants.videoFeed,
      queryParameters: {
        'limit': limit,
      },
      parser: (data) {
        // Backend returns { success, data, cursor }
        // DioClient already extracts data['data'] if data is Map
        if (data is List) {
          final videos = data.map((video) => Video.fromJson(video)).toList();
          // Debug logging
          if (videos.isNotEmpty) {
            print('📹 Loaded ${videos.length} videos');
            print('📹 First video URL: ${videos.first.videoUrl}');
            print('📹 First video title: ${videos.first.title}');
          }
          return videos;
        }
        return [];
      },
    );
  }

  /// Get all videos (paginated)
  Future<ApiResult<List<Video>>> getVideos({
    int page = 1,
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Video>>(
      ApiConstants.videos,
      queryParameters: {
        'page': page,
        'limit': limit,
      },
      parser: (data) {
        if (data is List) {
          return data.map((video) => Video.fromJson(video)).toList();
        }
        return [];
      },
    );
  }

  /// Get trending videos
  Future<ApiResult<List<Video>>> getTrendingVideos({
    int page = 1,
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Video>>(
      ApiConstants.videoTrending,
      queryParameters: {
        'limit': limit,
      },
      parser: (data) {
        // Backend returns { success, data }
        if (data is List) {
          return data.map((video) => Video.fromJson(video)).toList();
        }
        return [];
      },
    );
  }

  /// Get video by ID
  Future<ApiResult<Video>> getVideoById(String uuid) async {
    return await _dioClient.get<Video>(
      '${ApiConstants.videoDetail}/$uuid',
      parser: (data) {
        // Backend returns { success, data }
        // DioClient extracts data['data'] already
        return Video.fromJson(data);
      },
    );
  }

  /// Get videos by business
  Future<ApiResult<List<Video>>> getVideosByBusiness(
    String businessUuid, {
    int page = 1,
    int limit = 10,
  }) async {
    return await _dioClient.get<List<Video>>(
      '/businesses/$businessUuid/videos',
      queryParameters: {
        'limit': limit,
      },
      parser: (data) {
        // Backend returns { success, data }
        if (data is List) {
          return data.map((video) => Video.fromJson(video)).toList();
        }
        return [];
      },
    );
  }

  /// Like a video
  Future<ApiResult<void>> likeVideo(String uuid) async {
    return await _dioClient.post<void>(
      '${ApiConstants.likeVideo}/$uuid/like',
    );
  }

  /// Unlike a video
  Future<ApiResult<void>> unlikeVideo(String uuid) async {
    return await _dioClient.post<void>(
      '${ApiConstants.unlikeVideo}/$uuid/unlike',
    );
  }

  /// Get video comments
  Future<ApiResult<List<Comment>>> getComments(
    String videoUuid, {
    int page = 1,
    int limit = 20,
  }) async {
    return await _dioClient.get<List<Comment>>(
      '${ApiConstants.commentVideo}/$videoUuid/comments',
      queryParameters: {
        'limit': limit,
      },
      parser: (data) {
        // Backend returns { success, data }
        if (data is List) {
          return data.map((comment) => Comment.fromJson(comment)).toList();
        }
        return [];
      },
    );
  }

  /// Add comment to video
  Future<ApiResult<Comment>> addComment(
    String videoUuid,
    String content, {
    String? parentId,
  }) async {
    return await _dioClient.post<Comment>(
      '${ApiConstants.commentVideo}/$videoUuid/comments',
      data: {
        'comment_text': content,
        if (parentId != null) 'parent_id': parentId,
      },
      parser: (data) {
        // Backend returns { success, data, message }
        return Comment.fromJson(data);
      },
    );
  }

  /// Delete comment
  Future<ApiResult<void>> deleteComment(
    String videoUuid,
    String commentId,
  ) async {
    return await _dioClient.delete<void>(
      '${ApiConstants.commentVideo}/$videoUuid/comments/$commentId',
    );
  }

  /// Share video (track share count)
  Future<ApiResult<void>> shareVideo(String uuid) async {
    return await _dioClient.post<void>(
      '${ApiConstants.shareVideo}/$uuid/share',
    );
  }

  /// Upload video
  Future<ApiResult<Video>> uploadVideo({
    required String videoPath,
    String? thumbnailPath,
    required String title,
    required String description,
    int? duration,
  }) async {
    // This will be implemented when upload feature is needed
    // For now, return a failure
    return const Failure(
      message: 'Video upload not implemented yet',
    );
  }

  /// Delete video
  Future<ApiResult<void>> deleteVideo(String uuid) async {
    return await _dioClient.delete<void>(
      '${ApiConstants.deleteVideo}/$uuid',
    );
  }

  /// Increment view count
  Future<ApiResult<void>> incrementViewCount(String uuid) async {
    // This would typically be a separate endpoint or handled automatically
    // For now, we can track it client-side or implement when backend supports it
    return const Success(null);
  }
}
