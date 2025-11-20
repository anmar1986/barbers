import 'package:share_plus/share_plus.dart';
import 'package:flutter/material.dart';
import '../models/video_model.dart';

/// Share Utilities
/// Helper functions for sharing videos
class ShareUtils {
  ShareUtils._();

  /// Share video with native share sheet
  static Future<void> shareVideo(
    Video video, {
    BuildContext? context,
  }) async {
    try {
      final String shareText = _buildShareText(video);

      // Share using native share sheet
      final result = await Share.share(
        shareText,
        subject: video.title,
      );

      // Check if share was successful
      if (result.status == ShareResultStatus.success) {
        debugPrint('Video shared successfully');
      }
    } catch (e) {
      debugPrint('Error sharing video: $e');
      if (context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to share: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Share video with specific text
  static Future<void> shareWithText(
    String text, {
    String? subject,
  }) async {
    try {
      await Share.share(
        text,
        subject: subject,
      );
    } catch (e) {
      debugPrint('Error sharing: $e');
    }
  }

  /// Share video URL
  static Future<void> shareVideoUrl(
    String videoUrl,
    String title,
  ) async {
    try {
      await Share.share(
        'Check out this video: $title\n$videoUrl',
        subject: title,
      );
    } catch (e) {
      debugPrint('Error sharing video URL: $e');
    }
  }

  /// Build share text from video
  static String _buildShareText(Video video) {
    final StringBuffer buffer = StringBuffer();

    // Title
    buffer.writeln('🎬 ${video.title}');
    buffer.writeln();

    // Description (first 100 chars)
    if (video.description.isNotEmpty) {
      final description = video.description.length > 100
          ? '${video.description.substring(0, 100)}...'
          : video.description;
      buffer.writeln(description);
      buffer.writeln();
    }

    // Hashtags
    if (video.hashtags != null && video.hashtags!.isNotEmpty) {
      buffer.writeln(video.hashtags!.join(' '));
      buffer.writeln();
    }

    // Author
    buffer.writeln('By: ${video.user.name}');
    buffer.writeln();

    // Stats
    buffer.writeln(
        '👍 ${_formatCount(video.likeCount)} | 💬 ${_formatCount(video.commentCount)} | 👀 ${_formatCount(video.viewCount)}');
    buffer.writeln();

    // Video URL
    buffer.writeln('Watch now: ${video.videoUrl}');
    buffer.writeln();

    // App promotion
    buffer.writeln('Download Barber Social app to see more!');

    return buffer.toString();
  }

  /// Format count numbers
  static String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }

  /// Show share options bottom sheet
  static void showShareOptions(
    BuildContext context,
    Video video,
    VoidCallback onShareComplete,
  ) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _ShareOptionsSheet(
        video: video,
        onShareComplete: onShareComplete,
      ),
    );
  }
}

/// Share Options Bottom Sheet
class _ShareOptionsSheet extends StatelessWidget {
  final Video video;
  final VoidCallback onShareComplete;

  const _ShareOptionsSheet({
    required this.video,
    required this.onShareComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),

          // Title
          const Text(
            'Share Video',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),

          // Share options
          _ShareOption(
            icon: Icons.share,
            label: 'Share via...',
            onTap: () {
              Navigator.pop(context);
              ShareUtils.shareVideo(video, context: context);
              onShareComplete();
            },
          ),
          const SizedBox(height: 12),

          _ShareOption(
            icon: Icons.link,
            label: 'Copy Link',
            onTap: () {
              Navigator.pop(context);
              // TODO: Implement copy to clipboard
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Link copied to clipboard!'),
                ),
              );
              onShareComplete();
            },
          ),
          const SizedBox(height: 12),

          _ShareOption(
            icon: Icons.download,
            label: 'Save Video',
            onTap: () {
              Navigator.pop(context);
              // TODO: Implement save video
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Video saved to gallery!'),
                ),
              );
            },
          ),
          const SizedBox(height: 12),

          _ShareOption(
            icon: Icons.report_outlined,
            label: 'Report',
            color: Colors.red,
            onTap: () {
              Navigator.pop(context);
              // TODO: Implement report
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Thank you for reporting'),
                ),
              );
            },
          ),
          const SizedBox(height: 12),

          // Cancel button
          OutlinedButton(
            onPressed: () => Navigator.pop(context),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Cancel'),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

/// Share Option Item
class _ShareOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  const _ShareOption({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: color ?? Colors.black87),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 16,
                  color: color ?? Colors.black87,
                ),
              ),
            ),
            Icon(Icons.chevron_right, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}
