import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../providers/video_provider.dart';
import '../models/video_model.dart';
import '../widgets/comments_bottom_sheet.dart';
import '../widgets/video_player_widget.dart';
import '../utils/share_utils.dart';

/// Videos Tab Screen
/// TikTok-style vertical video feed
class VideosTabScreen extends ConsumerStatefulWidget {
  const VideosTabScreen({super.key});

  @override
  ConsumerState<VideosTabScreen> createState() => _VideosTabScreenState();
}

class _VideosTabScreenState extends ConsumerState<VideosTabScreen> {
  final PageController _pageController = PageController();

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final videoFeedState = ref.watch(videoFeedProvider);

    // Loading state
    if (videoFeedState.isLoading && videoFeedState.videos.isEmpty) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    // Error state
    if (videoFeedState.error != null && videoFeedState.videos.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 60, color: Colors.white),
              const SizedBox(height: 16),
              Text(
                videoFeedState.error!,
                style: const TextStyle(color: Colors.white),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  ref.read(videoFeedProvider.notifier).refreshVideos();
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    // Empty state
    if (videoFeedState.videos.isEmpty) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Text(
            'No videos available',
            style: TextStyle(color: Colors.white, fontSize: 18),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.textPrimary,
      body: Stack(
        children: [
          PageView.builder(
        controller: _pageController,
        scrollDirection: Axis.vertical,
        itemCount: videoFeedState.videos.length,
        onPageChanged: (index) {
          // Load more when reaching near the end
          if (index >= videoFeedState.videos.length - 2 &&
              !videoFeedState.isLoadingMore &&
              videoFeedState.hasMore) {
            ref.read(videoFeedProvider.notifier).loadMoreVideos();
          }
        },
        itemBuilder: (context, index) {
          final video = videoFeedState.videos[index];
          return _VideoItem(
            video: video,
            onLike: () {
              ref.read(videoFeedProvider.notifier).toggleLike(video.uuid);
            },
            onComment: () {
              showCommentsBottomSheet(
                context,
                videoUuid: video.uuid,
                commentCount: video.commentCount,
              );
            },
            onShare: () {
              ShareUtils.showShareOptions(
                context,
                video,
                () {
                  ref
                      .read(videoFeedProvider.notifier)
                      .updateShareCount(video.uuid);
                },
              );
            },
          );
        },
      ),

          // Upload Video FAB
          Positioned(
            bottom: 80,
            right: 16,
            child: FloatingActionButton.extended(
              onPressed: () {
                context.push(AppRoutes.uploadVideo);
              },
              backgroundColor: AppColors.primary,
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text(
                'Upload',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Video Item Widget
class _VideoItem extends StatelessWidget {
  final Video video;
  final VoidCallback onLike;
  final VoidCallback onComment;
  final VoidCallback onShare;

  const _VideoItem({
    required this.video,
    required this.onLike,
    required this.onComment,
    required this.onShare,
  });

  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Video Player
        video.videoUrl.isNotEmpty && video.videoUrl.startsWith('http')
            ? SimpleVideoPlayer(
                videoUrl: video.videoUrl,
                autoPlay: true,
              )
            : Container(
                color: Colors.black,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.play_circle_outline,
                        size: 80,
                        color: Colors.white,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        video.title,
                        style: const TextStyle(
                          fontSize: 24,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: Text(
                          video.videoUrl.isEmpty
                              ? 'No video URL'
                              : 'Preview not available',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.white70,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

        // Right Side Actions
        Positioned(
          right: 12,
          bottom: 100,
          child: Column(
            children: [
              // Like Button
              _ActionButton(
                icon: video.isLiked ? Icons.favorite : Icons.favorite_outline,
                label: _formatCount(video.likeCount),
                onTap: onLike,
                isActive: video.isLiked,
              ),
              const SizedBox(height: 24),

              // Comment Button
              _ActionButton(
                icon: Icons.chat_bubble_outline,
                label: _formatCount(video.commentCount),
                onTap: onComment,
              ),
              const SizedBox(height: 24),

              // Share Button
              _ActionButton(
                icon: Icons.share_outlined,
                label: _formatCount(video.shareCount),
                onTap: onShare,
              ),
              const SizedBox(height: 24),

              // More Options
              _ActionButton(
                icon: Icons.more_vert,
                label: '',
                onTap: () {},
              ),
            ],
          ),
        ),

        // Bottom Info
        Positioned(
          left: 16,
          right: 80,
          bottom: 100,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Info
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primary,
                    backgroundImage: video.user.avatar != null
                        ? NetworkImage(video.user.avatar!)
                        : null,
                    child: video.user.avatar == null
                        ? Text(
                            video.user.name.isNotEmpty
                                ? video.user.name[0].toUpperCase()
                                : '?',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          )
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      video.user.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Follow',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Caption
              Text(
                video.description,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),

              // Hashtags
              if (video.hashtags != null && video.hashtags!.isNotEmpty)
                Text(
                  video.hashtags!.join(' '),
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.white70,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Action Button Widget
class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool isActive;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.black45,
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: isActive ? Colors.red : Colors.white,
              size: 28,
            ),
          ),
          if (label.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
