import 'package:equatable/equatable.dart';
import '../../auth/models/user_model.dart';

/// Video Model
/// Represents a video in the application (TikTok-style)
class Video extends Equatable {
  final String id;
  final String uuid;
  final String title;
  final String description;
  final String videoUrl;
  final String? thumbnailUrl;
  final int duration; // in seconds
  final int viewCount;
  final int likeCount;
  final int commentCount;
  final int shareCount;
  final bool isLiked;
  final User user; // The user/business who posted the video
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String>? hashtags;
  final String? musicName;

  const Video({
    required this.id,
    required this.uuid,
    required this.title,
    required this.description,
    required this.videoUrl,
    this.thumbnailUrl,
    required this.duration,
    required this.viewCount,
    required this.likeCount,
    required this.commentCount,
    required this.shareCount,
    required this.isLiked,
    required this.user,
    required this.createdAt,
    required this.updatedAt,
    this.hashtags,
    this.musicName,
  });

  /// Create Video from JSON
  factory Video.fromJson(Map<String, dynamic> json) {
    // Parse hashtags from description or separate field
    List<String> extractedHashtags = [];
    if (json['hashtags'] != null) {
      if (json['hashtags'] is List) {
        // If it's already a list of strings or objects
        extractedHashtags = (json['hashtags'] as List)
            .map((h) {
              if (h is String) return h;
              if (h is Map) return (h['name'] ?? h['tag'] ?? '').toString();
              return h.toString();
            })
            .where((h) => h.isNotEmpty)
            .map((h) => h.startsWith('#') ? h : '#$h')
            .toList();
      }
    }

    // If no hashtags found, extract from description
    if (extractedHashtags.isEmpty && json['description'] != null) {
      final description = json['description'] as String;
      final regex = RegExp(r'#\w+');
      extractedHashtags = regex
          .allMatches(description)
          .map((match) => match.group(0)!)
          .toList();
    }

    // Get user/business data - backend returns 'business' field
    Map<String, dynamic> userData = {};
    if (json['business'] != null && json['business'] is Map) {
      userData = json['business'] as Map<String, dynamic>;
    } else if (json['user'] != null && json['user'] is Map) {
      userData = json['user'] as Map<String, dynamic>;
    }

    // Create default user if no user data available
    User user;
    if (userData.isNotEmpty) {
      try {
        user = User.fromJson(userData);
      } catch (e) {
        // Fallback to default user if parsing fails
        user = User(
          id: '',
          name: 'Unknown',
          email: '',
          userType: 'user',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
      }
    } else {
      user = User(
        id: '',
        name: 'Unknown',
        email: '',
        userType: 'user',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
    }

    return Video(
      id: json['id']?.toString() ?? json['uuid']?.toString() ?? '',
      uuid: json['uuid']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? json['caption'] ?? '',
      videoUrl: json['video_url'] ?? json['url'] ?? '',
      thumbnailUrl: json['thumbnail_url'] ?? json['thumbnail'],
      duration: (json['duration'] is int)
          ? json['duration']
          : int.tryParse(json['duration']?.toString() ?? '0') ?? 0,
      viewCount: (json['view_count'] ?? json['views_count'] ?? 0) is int
          ? (json['view_count'] ?? json['views_count'])
          : int.tryParse(
                  (json['view_count'] ?? json['views_count'])?.toString() ??
                      '0') ??
              0,
      likeCount: (json['like_count'] ?? json['likes_count'] ?? 0) is int
          ? (json['like_count'] ?? json['likes_count'])
          : int.tryParse(
                  (json['like_count'] ?? json['likes_count'])?.toString() ??
                      '0') ??
              0,
      commentCount:
          (json['comment_count'] ?? json['comments_count'] ?? 0) is int
              ? (json['comment_count'] ?? json['comments_count'])
              : int.tryParse((json['comment_count'] ?? json['comments_count'])
                          ?.toString() ??
                      '0') ??
                  0,
      shareCount: (json['share_count'] ?? json['shares_count'] ?? 0) is int
          ? (json['share_count'] ?? json['shares_count'])
          : int.tryParse(
                  (json['share_count'] ?? json['shares_count'])?.toString() ??
                      '0') ??
              0,
      isLiked: json['is_liked'] ?? json['liked'] ?? false,
      user: user,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
      hashtags: extractedHashtags.isNotEmpty ? extractedHashtags : null,
      musicName: json['music_name'] ?? json['audio_name'],
    );
  }

  /// Convert Video to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'uuid': uuid,
      'title': title,
      'description': description,
      'video_url': videoUrl,
      'thumbnail_url': thumbnailUrl,
      'duration': duration,
      'view_count': viewCount,
      'like_count': likeCount,
      'comment_count': commentCount,
      'share_count': shareCount,
      'is_liked': isLiked,
      'user': user.toJson(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'hashtags': hashtags,
      'music_name': musicName,
    };
  }

  /// Copy with method
  Video copyWith({
    String? id,
    String? uuid,
    String? title,
    String? description,
    String? videoUrl,
    String? thumbnailUrl,
    int? duration,
    int? viewCount,
    int? likeCount,
    int? commentCount,
    int? shareCount,
    bool? isLiked,
    User? user,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<String>? hashtags,
    String? musicName,
  }) {
    return Video(
      id: id ?? this.id,
      uuid: uuid ?? this.uuid,
      title: title ?? this.title,
      description: description ?? this.description,
      videoUrl: videoUrl ?? this.videoUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      duration: duration ?? this.duration,
      viewCount: viewCount ?? this.viewCount,
      likeCount: likeCount ?? this.likeCount,
      commentCount: commentCount ?? this.commentCount,
      shareCount: shareCount ?? this.shareCount,
      isLiked: isLiked ?? this.isLiked,
      user: user ?? this.user,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      hashtags: hashtags ?? this.hashtags,
      musicName: musicName ?? this.musicName,
    );
  }

  @override
  List<Object?> get props => [
        id,
        uuid,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
        viewCount,
        likeCount,
        commentCount,
        shareCount,
        isLiked,
        user,
        createdAt,
        updatedAt,
        hashtags,
        musicName,
      ];
}
