import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_result.dart';
import '../models/video_model.dart';
import '../models/comment_model.dart';
import '../repositories/video_repository.dart';

/// Video Feed State
class VideoFeedState {
  final List<Video> videos;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final int currentPage;
  final bool hasMore;

  const VideoFeedState({
    this.videos = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.currentPage = 1,
    this.hasMore = true,
  });

  VideoFeedState copyWith({
    List<Video>? videos,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    int? currentPage,
    bool? hasMore,
  }) {
    return VideoFeedState(
      videos: videos ?? this.videos,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

/// Dio Client Provider
final videosDioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});

/// Video Repository Provider
final videoRepositoryProvider = Provider<VideoRepository>((ref) {
  return VideoRepository(ref.read(videosDioClientProvider));
});

/// Video Feed Notifier
class VideoFeedNotifier extends StateNotifier<VideoFeedState> {
  final VideoRepository _repository;

  VideoFeedNotifier(this._repository) : super(const VideoFeedState()) {
    // Auto-load videos when provider is created
    loadVideos();
  }

  /// Load initial videos
  Future<void> loadVideos({bool refresh = false}) async {
    if (state.isLoading && !refresh) return;

    state = state.copyWith(
      isLoading: true,
      error: null,
      currentPage: refresh ? 1 : state.currentPage,
    );

    final result = await _repository.getVideoFeed(
      page: refresh ? 1 : state.currentPage,
      limit: 10,
    );

    result
        .onSuccess((videos) {
      state = VideoFeedState(
        videos: refresh ? videos : [...state.videos, ...videos],
        isLoading: false,
        currentPage: refresh ? 1 : state.currentPage,
        hasMore: videos.isNotEmpty && videos.length >= 10,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Load more videos (pagination)
  Future<void> loadMoreVideos() async {
    if (state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    final result = await _repository.getVideoFeed(
      page: state.currentPage + 1,
      limit: 10,
    );

    result
        .onSuccess((videos) {
      state = VideoFeedState(
        videos: [...state.videos, ...videos],
        isLoadingMore: false,
        currentPage: state.currentPage + 1,
        hasMore: videos.isNotEmpty && videos.length >= 10,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoadingMore: false,
        error: error,
      );
    });
  }

  /// Refresh videos
  Future<void> refreshVideos() async {
    await loadVideos(refresh: true);
  }

  /// Toggle like on a video
  Future<void> toggleLike(String videoUuid) async {
    // Find the video
    final videoIndex = state.videos.indexWhere((v) => v.uuid == videoUuid);
    if (videoIndex == -1) return;

    final video = state.videos[videoIndex];
    final wasLiked = video.isLiked;

    // Optimistic update
    final updatedVideos = List<Video>.from(state.videos);
    updatedVideos[videoIndex] = video.copyWith(
      isLiked: !wasLiked,
      likeCount: wasLiked ? video.likeCount - 1 : video.likeCount + 1,
    );

    state = state.copyWith(videos: updatedVideos);

    // Make API call
    final result = wasLiked
        ? await _repository.unlikeVideo(videoUuid)
        : await _repository.likeVideo(videoUuid);

    // Revert on failure
    if (result is Failure) {
      final revertedVideos = List<Video>.from(state.videos);
      revertedVideos[videoIndex] = video;
      state = state.copyWith(videos: revertedVideos);
    }
  }

  /// Update comment count for a video
  void updateCommentCount(String videoUuid, int count) {
    final videoIndex = state.videos.indexWhere((v) => v.uuid == videoUuid);
    if (videoIndex == -1) return;

    final video = state.videos[videoIndex];
    final updatedVideos = List<Video>.from(state.videos);
    updatedVideos[videoIndex] = video.copyWith(commentCount: count);

    state = state.copyWith(videos: updatedVideos);
  }

  /// Update share count for a video
  void updateShareCount(String videoUuid) {
    final videoIndex = state.videos.indexWhere((v) => v.uuid == videoUuid);
    if (videoIndex == -1) return;

    final video = state.videos[videoIndex];
    final updatedVideos = List<Video>.from(state.videos);
    updatedVideos[videoIndex] = video.copyWith(
      shareCount: video.shareCount + 1,
    );

    state = state.copyWith(videos: updatedVideos);

    // Track share on backend
    _repository.shareVideo(videoUuid);
  }
}

/// Video Feed Provider
final videoFeedProvider =
    StateNotifierProvider<VideoFeedNotifier, VideoFeedState>((ref) {
  return VideoFeedNotifier(ref.read(videoRepositoryProvider));
});

/// Comments State
class CommentsState {
  final List<Comment> comments;
  final bool isLoading;
  final String? error;

  const CommentsState({
    this.comments = const [],
    this.isLoading = false,
    this.error,
  });

  CommentsState copyWith({
    List<Comment>? comments,
    bool? isLoading,
    String? error,
  }) {
    return CommentsState(
      comments: comments ?? this.comments,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Comments Notifier
class CommentsNotifier extends StateNotifier<CommentsState> {
  final VideoRepository _repository;
  final String videoUuid;

  CommentsNotifier(this._repository, this.videoUuid)
      : super(const CommentsState()) {
    loadComments();
  }

  /// Load comments for video
  Future<void> loadComments() async {
    state = state.copyWith(isLoading: true, error: null);

    final result = await _repository.getComments(videoUuid);

    result
        .onSuccess((comments) {
      state = CommentsState(
        comments: comments,
        isLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(
        isLoading: false,
        error: error,
      );
    });
  }

  /// Add a comment
  Future<void> addComment(String content, {String? parentId}) async {
    final result = await _repository.addComment(
      videoUuid,
      content,
      parentId: parentId,
    );

    result.onSuccess((comment) {
      state = CommentsState(
        comments: [comment, ...state.comments],
        isLoading: false,
      );
    }).onFailure((error) {
      state = state.copyWith(error: error);
    });
  }

  /// Delete a comment
  Future<void> deleteComment(String commentId) async {
    final result = await _repository.deleteComment(videoUuid, commentId);

    result.onSuccess((_) {
      state = CommentsState(
        comments: state.comments.where((c) => c.id != commentId).toList(),
        isLoading: false,
      );
    });
  }
}

/// Comments Provider Factory
final commentsProvider = StateNotifierProvider.family<CommentsNotifier,
    CommentsState, String>((ref, videoUuid) {
  return CommentsNotifier(ref.read(videoRepositoryProvider), videoUuid);
});
