import 'package:equatable/equatable.dart';
import '../../auth/models/user_model.dart';

/// Comment Model
/// Represents a comment on a video
class Comment extends Equatable {
  final String id;
  final String uuid;
  final String content;
  final User user;
  final int likeCount;
  final bool isLiked;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<Comment>? replies; // Nested replies
  final String? parentId; // For threaded comments

  const Comment({
    required this.id,
    required this.uuid,
    required this.content,
    required this.user,
    required this.likeCount,
    required this.isLiked,
    required this.createdAt,
    required this.updatedAt,
    this.replies,
    this.parentId,
  });

  /// Create Comment from JSON
  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id']?.toString() ?? json['uuid']?.toString() ?? '',
      uuid: json['uuid']?.toString() ?? '',
      content: json['content'] ?? json['comment'] ?? json['text'] ?? '',
      user: User.fromJson(json['user'] ?? {}),
      likeCount: json['like_count'] ?? json['likes_count'] ?? 0,
      isLiked: json['is_liked'] ?? json['liked'] ?? false,
      createdAt: DateTime.parse(
          json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(
          json['updated_at'] ?? DateTime.now().toIso8601String()),
      replies: json['replies'] != null
          ? (json['replies'] as List)
              .map((reply) => Comment.fromJson(reply))
              .toList()
          : null,
      parentId: json['parent_id']?.toString(),
    );
  }

  /// Convert Comment to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'uuid': uuid,
      'content': content,
      'user': user.toJson(),
      'like_count': likeCount,
      'is_liked': isLiked,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'replies': replies?.map((reply) => reply.toJson()).toList(),
      'parent_id': parentId,
    };
  }

  /// Copy with method
  Comment copyWith({
    String? id,
    String? uuid,
    String? content,
    User? user,
    int? likeCount,
    bool? isLiked,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<Comment>? replies,
    String? parentId,
  }) {
    return Comment(
      id: id ?? this.id,
      uuid: uuid ?? this.uuid,
      content: content ?? this.content,
      user: user ?? this.user,
      likeCount: likeCount ?? this.likeCount,
      isLiked: isLiked ?? this.isLiked,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      replies: replies ?? this.replies,
      parentId: parentId ?? this.parentId,
    );
  }

  @override
  List<Object?> get props => [
        id,
        uuid,
        content,
        user,
        likeCount,
        isLiked,
        createdAt,
        updatedAt,
        replies,
        parentId,
      ];
}
