import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/video_provider.dart';
import '../models/comment_model.dart';
import 'package:timeago/timeago.dart' as timeago;

/// Comments Bottom Sheet
/// Shows video comments with ability to add, like, and reply
class CommentsBottomSheet extends ConsumerStatefulWidget {
  final String videoUuid;
  final int initialCommentCount;

  const CommentsBottomSheet({
    super.key,
    required this.videoUuid,
    required this.initialCommentCount,
  });

  @override
  ConsumerState<CommentsBottomSheet> createState() =>
      _CommentsBottomSheetState();
}

class _CommentsBottomSheetState extends ConsumerState<CommentsBottomSheet> {
  final TextEditingController _commentController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  Comment? _replyingTo;

  @override
  void dispose() {
    _commentController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleAddComment() async {
    if (_commentController.text.trim().isEmpty) return;

    final content = _commentController.text.trim();
    _commentController.clear();
    _focusNode.unfocus();

    await ref.read(commentsProvider(widget.videoUuid).notifier).addComment(
          content,
          parentId: _replyingTo?.id,
        );

    setState(() {
      _replyingTo = null;
    });

    // Update comment count in video feed
    final commentsState = ref.read(commentsProvider(widget.videoUuid));
    ref
        .read(videoFeedProvider.notifier)
        .updateCommentCount(widget.videoUuid, commentsState.comments.length);
  }

  void _handleReply(Comment comment) {
    setState(() {
      _replyingTo = comment;
    });
    _focusNode.requestFocus();
  }

  void _cancelReply() {
    setState(() {
      _replyingTo = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final commentsState = ref.watch(commentsProvider(widget.videoUuid));

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(
                bottom: BorderSide(color: AppColors.border),
              ),
            ),
            child: Column(
              children: [
                // Drag Handle
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 16),
                // Title
                Row(
                  children: [
                    Text(
                      '${commentsState.comments.length} Comments',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Comments List
          Expanded(
            child: commentsState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : commentsState.comments.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.chat_bubble_outline,
                              size: 60,
                              color: AppColors.textSecondary.withValues(alpha: 0.5),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No comments yet',
                              style: TextStyle(
                                fontSize: 16,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Be the first to comment!',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary.withValues(alpha: 0.7),
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        itemCount: commentsState.comments.length,
                        itemBuilder: (context, index) {
                          final comment = commentsState.comments[index];
                          return _CommentItem(
                            comment: comment,
                            onReply: () => _handleReply(comment),
                            onDelete: () {
                              ref
                                  .read(commentsProvider(widget.videoUuid)
                                      .notifier)
                                  .deleteComment(comment.id);
                            },
                          );
                        },
                      ),
          ),

          // Reply Banner
          if (_replyingTo != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.backgroundGrey,
                border: Border(
                  top: BorderSide(color: AppColors.border),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.reply,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Replying to ${_replyingTo!.user.name}',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: _cancelReply,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),

          // Input Field
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: AppColors.border),
              ),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      focusNode: _focusNode,
                      decoration: InputDecoration(
                        hintText: 'Add a comment...',
                        hintStyle: TextStyle(color: AppColors.textSecondary),
                        filled: true,
                        fillColor: AppColors.backgroundGrey,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      maxLines: null,
                      textCapitalization: TextCapitalization.sentences,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: Icon(
                      Icons.send,
                      color: _commentController.text.isEmpty
                          ? AppColors.textSecondary
                          : AppColors.primary,
                    ),
                    onPressed: _handleAddComment,
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                      padding: const EdgeInsets.all(12),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Comment Item Widget
class _CommentItem extends StatelessWidget {
  final Comment comment;
  final VoidCallback onReply;
  final VoidCallback onDelete;

  const _CommentItem({
    required this.comment,
    required this.onReply,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primary,
            backgroundImage: comment.user.avatar != null
                ? NetworkImage(comment.user.avatar!)
                : null,
            child: comment.user.avatar == null
                ? Text(
                    comment.user.name.isNotEmpty
                        ? comment.user.name[0].toUpperCase()
                        : '?',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 12),

          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // User name and time
                Row(
                  children: [
                    Text(
                      comment.user.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      timeago.format(comment.createdAt, locale: 'en_short'),
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),

                // Comment text
                Text(
                  comment.content,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),

                // Actions
                Row(
                  children: [
                    // Like button
                    InkWell(
                      onTap: () {
                        // TODO: Implement comment like
                      },
                      child: Row(
                        children: [
                          Icon(
                            comment.isLiked
                                ? Icons.favorite
                                : Icons.favorite_outline,
                            size: 16,
                            color: comment.isLiked
                                ? Colors.red
                                : AppColors.textSecondary,
                          ),
                          if (comment.likeCount > 0) ...[
                            const SizedBox(width: 4),
                            Text(
                              comment.likeCount.toString(),
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),

                    // Reply button
                    InkWell(
                      onTap: onReply,
                      child: Text(
                        'Reply',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),

                    // TODO: Add delete button for own comments
                  ],
                ),

                // Replies
                if (comment.replies != null && comment.replies!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Column(
                      children: comment.replies!.map((reply) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              CircleAvatar(
                                radius: 14,
                                backgroundColor: AppColors.primary,
                                backgroundImage: reply.user.avatar != null
                                    ? NetworkImage(reply.user.avatar!)
                                    : null,
                                child: reply.user.avatar == null
                                    ? Text(
                                        reply.user.name.isNotEmpty
                                            ? reply.user.name[0].toUpperCase()
                                            : '?',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      )
                                    : null,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          reply.user.name,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          timeago.format(reply.createdAt,
                                              locale: 'en_short'),
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: AppColors.textSecondary,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      reply.content,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Helper function to show comments bottom sheet
void showCommentsBottomSheet(
  BuildContext context, {
  required String videoUuid,
  required int commentCount,
}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => CommentsBottomSheet(
      videoUuid: videoUuid,
      initialCommentCount: commentCount,
    ),
  );
}
