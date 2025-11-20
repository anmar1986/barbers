import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/widgets.dart';
import '../widgets/video_player_widget.dart';

/// Upload Video Screen
/// Allows users to record or pick a video and upload it
class UploadVideoScreen extends ConsumerStatefulWidget {
  const UploadVideoScreen({super.key});

  @override
  ConsumerState<UploadVideoScreen> createState() => _UploadVideoScreenState();
}

class _UploadVideoScreenState extends ConsumerState<UploadVideoScreen> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final ImagePicker _picker = ImagePicker();

  XFile? _videoFile;
  bool _isUploading = false;
  double _uploadProgress = 0.0;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickVideoFromGallery() async {
    try {
      final XFile? video = await _picker.pickVideo(
        source: ImageSource.gallery,
        maxDuration: const Duration(minutes: 5),
      );

      if (video != null) {
        setState(() {
          _videoFile = video;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error picking video: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _recordVideo() async {
    try {
      final XFile? video = await _picker.pickVideo(
        source: ImageSource.camera,
        maxDuration: const Duration(minutes: 5),
      );

      if (video != null) {
        setState(() {
          _videoFile = video;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error recording video: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _uploadVideo() async {
    if (_videoFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a video first'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a title'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isUploading = true;
      _uploadProgress = 0.0;
    });

    try {
      // TODO: Implement actual upload to backend
      // Simulate upload progress
      for (var i = 0; i <= 100; i += 10) {
        await Future.delayed(const Duration(milliseconds: 200));
        if (mounted) {
          setState(() {
            _uploadProgress = i / 100;
          });
        }
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Video uploaded successfully!'),
            backgroundColor: AppColors.success,
          ),
        );

        // Navigate back
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error uploading video: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWhite,
      appBar: AppBar(
        title: const Text('Upload Video'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        actions: [
          if (_videoFile != null && !_isUploading)
            TextButton(
              onPressed: _uploadVideo,
              child: const Text(
                'Post',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
      body: _videoFile == null
          ? _buildVideoSourceSelection()
          : _buildUploadForm(),
    );
  }

  Widget _buildVideoSourceSelection() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.video_library,
                size: 80,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 32),

            // Title
            const Text(
              'Upload Your Video',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),

            // Description
            Text(
              'Share your best moments with the community',
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),

            // Record Video Button
            PrimaryButton(
              text: 'Record Video',
              icon: Icons.videocam,
              onPressed: _recordVideo,
              width: double.infinity,
              height: 56,
            ),
            const SizedBox(height: 16),

            // Pick from Gallery Button
            OutlinedButtonWidget(
              text: 'Choose from Gallery',
              icon: Icons.photo_library,
              onPressed: _pickVideoFromGallery,
              width: double.infinity,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUploadForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Video Preview
          AspectRatio(
            aspectRatio: 16 / 9,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  SimpleVideoPlayer(
                    videoUrl: _videoFile!.path,
                    autoPlay: false,
                  ),
                  if (_isUploading)
                    Container(
                      color: Colors.black.withValues(alpha: 0.7),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const CircularProgressIndicator(
                              color: Colors.white,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Uploading... ${(_uploadProgress * 100).toInt()}%',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 32),
                              child: LinearProgressIndicator(
                                value: _uploadProgress,
                                backgroundColor:
                                    Colors.white.withValues(alpha: 0.3),
                                valueColor: const AlwaysStoppedAnimation<Color>(
                                    Colors.white),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Change Video Button
          if (!_isUploading)
            TextButton.icon(
              onPressed: () {
                setState(() {
                  _videoFile = null;
                });
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Change Video'),
            ),
          const SizedBox(height: 24),

          // Title Input
          TextInput(
            controller: _titleController,
            label: 'Title',
            hint: 'Enter video title',
            prefixIcon: Icons.title,
            enabled: !_isUploading,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a title';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),

          // Description Input
          TextInput(
            controller: _descriptionController,
            label: 'Description',
            hint: 'Write a description... (use #hashtags)',
            prefixIcon: Icons.description,
            maxLines: 5,
            enabled: !_isUploading,
          ),
          const SizedBox(height: 24),

          // Info
          if (!_isUploading)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.infoBackground,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Your video will be reviewed before publishing',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
