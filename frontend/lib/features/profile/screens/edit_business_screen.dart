import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_result.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/business_provider.dart';
import '../repositories/business_repository.dart';

/// Edit Business Profile Screen
class EditBusinessScreen extends ConsumerStatefulWidget {
  const EditBusinessScreen({super.key});

  @override
  ConsumerState<EditBusinessScreen> createState() => _EditBusinessScreenState();
}

class _EditBusinessScreenState extends ConsumerState<EditBusinessScreen> {
  final _formKey = GlobalKey<FormState>();
  final _businessNameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _websiteController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _zipCodeController = TextEditingController();
  final _countryController = TextEditingController();

  String _selectedBusinessType = 'barber';
  File? _logoFile;
  File? _coverImageFile;
  String? _currentLogoUrl;
  String? _currentCoverUrl;
  bool _isLoading = false;

  final List<Map<String, String>> _businessTypes = [
    {'value': 'barber', 'label': 'Barber Shop'},
    {'value': 'nail_studio', 'label': 'Nail Studio'},
    {'value': 'hair_salon', 'label': 'Hair Salon'},
    {'value': 'massage', 'label': 'Massage & Spa'},
  ];

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      // Load business data if not already loaded
      final state = ref.read(businessProfileProvider);
      if (state.business == null) {
        await ref.read(businessProfileProvider.notifier).loadBusiness();
      }
      _loadBusinessData();
    });
  }

  void _loadBusinessData() {
    final business = ref.read(businessProfileProvider).business;
    if (business != null) {
      _businessNameController.text = business.businessName;
      _descriptionController.text = business.description ?? '';
      _phoneController.text = business.phone ?? '';
      _emailController.text = business.email ?? '';
      _websiteController.text = business.website ?? '';
      _addressController.text = business.address ?? '';
      _cityController.text = business.city ?? '';
      _stateController.text = business.state ?? '';
      _zipCodeController.text = business.zipCode ?? '';
      _countryController.text = business.country ?? '';
      _selectedBusinessType = business.businessType;
      _currentLogoUrl = business.logo;
      _currentCoverUrl = business.coverImage;
    }
  }

  @override
  void dispose() {
    _businessNameController.dispose();
    _descriptionController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _websiteController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _zipCodeController.dispose();
    _countryController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(bool isLogo) async {
    final picker = ImagePicker();
    final image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: isLogo ? 500 : 1200,
      maxHeight: isLogo ? 500 : 800,
      imageQuality: 85,
    );

    if (image != null) {
      setState(() {
        if (isLogo) {
          _logoFile = File(image.path);
        } else {
          _coverImageFile = File(image.path);
        }
      });
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      String? logoUrl = _currentLogoUrl;
      String? coverUrl = _currentCoverUrl;

      // Upload logo if changed
      if (_logoFile != null) {
        final result =
            await ref.read(businessProfileProvider.notifier).uploadImage(
                  file: _logoFile!,
                  directory: 'logos',
                );
        if (result is Success<UploadResponse>) {
          logoUrl = result.data.fileUrl;
        }
      }

      // Upload cover image if changed
      if (_coverImageFile != null) {
        final result =
            await ref.read(businessProfileProvider.notifier).uploadImage(
                  file: _coverImageFile!,
                  directory: 'covers',
                );
        if (result is Success<UploadResponse>) {
          coverUrl = result.data.fileUrl;
        }
      }

      // Update profile
      final result =
          await ref.read(businessProfileProvider.notifier).updateBusiness(
                businessName: _businessNameController.text.trim(),
                businessType: _selectedBusinessType,
                description: _descriptionController.text.trim(),
                phone: _phoneController.text.trim(),
                email: _emailController.text.trim(),
                website: _websiteController.text.trim(),
                address: _addressController.text.trim(),
                city: _cityController.text.trim(),
                state: _stateController.text.trim(),
                zipCode: _zipCodeController.text.trim(),
                country: _countryController.text.trim(),
                logo: logoUrl,
                coverImage: coverUrl,
              );

      if (mounted) {
        result.onSuccess((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Profile updated successfully'),
              backgroundColor: AppColors.success,
            ),
          );
          context.pop();
        }).onFailure((error) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(error),
              backgroundColor: AppColors.error,
            ),
          );
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final businessState = ref.watch(businessProfileProvider);

    // Show loading if business data is being loaded
    if (businessState.isLoading && businessState.business == null) {
      return Scaffold(
        backgroundColor: AppColors.backgroundGrey,
        appBar: AppBar(
          title: const Text('Edit Business Profile'),
          backgroundColor: AppColors.primary,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      appBar: AppBar(
        title: const Text('Edit Business Profile'),
        backgroundColor: AppColors.primary,
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _saveProfile,
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    'Save',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cover Image
              _buildCoverImageSection(),
              const SizedBox(height: 24),

              // Logo
              _buildLogoSection(),
              const SizedBox(height: 24),

              // Business Information Section
              _buildSectionTitle('Business Information'),
              const SizedBox(height: 16),

              // Business Name
              TextInput(
                controller: _businessNameController,
                label: 'Business Name',
                hint: 'Enter your business name',
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Business name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Business Type
              _buildBusinessTypeDropdown(),
              const SizedBox(height: 16),

              // Description
              TextInput(
                controller: _descriptionController,
                label: 'Description',
                hint: 'Describe your business',
                maxLines: 4,
              ),
              const SizedBox(height: 24),

              // Contact Information Section
              _buildSectionTitle('Contact Information'),
              const SizedBox(height: 16),

              TextInput(
                controller: _phoneController,
                label: 'Phone',
                hint: 'Business phone number',
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),

              TextInput(
                controller: _emailController,
                label: 'Email',
                hint: 'Business email address',
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),

              TextInput(
                controller: _websiteController,
                label: 'Website',
                hint: 'https://www.example.com',
                keyboardType: TextInputType.url,
              ),
              const SizedBox(height: 24),

              // Address Section
              _buildSectionTitle('Address'),
              const SizedBox(height: 16),

              TextInput(
                controller: _addressController,
                label: 'Street Address',
                hint: 'Enter street address',
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: TextInput(
                      controller: _cityController,
                      label: 'City',
                      hint: 'City',
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextInput(
                      controller: _stateController,
                      label: 'State',
                      hint: 'State',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: TextInput(
                      controller: _zipCodeController,
                      label: 'ZIP Code',
                      hint: 'ZIP Code',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextInput(
                      controller: _countryController,
                      label: 'Country',
                      hint: 'Country',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildCoverImageSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Cover Image',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: () => _pickImage(false),
          child: Container(
            height: 150,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
              image: _coverImageFile != null
                  ? DecorationImage(
                      image: FileImage(_coverImageFile!),
                      fit: BoxFit.cover,
                    )
                  : _currentCoverUrl != null
                      ? DecorationImage(
                          image: NetworkImage(_currentCoverUrl!),
                          fit: BoxFit.cover,
                        )
                      : null,
            ),
            child: (_coverImageFile == null && _currentCoverUrl == null)
                ? const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.add_photo_alternate,
                          size: 40, color: AppColors.textSecondary),
                      SizedBox(height: 8),
                      Text(
                        'Tap to add cover image',
                        style: TextStyle(color: AppColors.textSecondary),
                      ),
                    ],
                  )
                : Align(
                    alignment: Alignment.bottomRight,
                    child: Container(
                      margin: const EdgeInsets.all(8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child:
                          const Icon(Icons.edit, color: Colors.white, size: 20),
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildLogoSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Logo',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: () => _pickImage(true),
          child: Container(
            height: 100,
            width: 100,
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
              image: _logoFile != null
                  ? DecorationImage(
                      image: FileImage(_logoFile!),
                      fit: BoxFit.cover,
                    )
                  : _currentLogoUrl != null
                      ? DecorationImage(
                          image: NetworkImage(_currentLogoUrl!),
                          fit: BoxFit.cover,
                        )
                      : null,
            ),
            child: (_logoFile == null && _currentLogoUrl == null)
                ? const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.add_a_photo,
                          size: 32, color: AppColors.textSecondary),
                      SizedBox(height: 4),
                      Text(
                        'Logo',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  )
                : Align(
                    alignment: Alignment.bottomRight,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child:
                          const Icon(Icons.edit, color: Colors.white, size: 16),
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildBusinessTypeDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Business Type',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedBusinessType,
              isExpanded: true,
              items: _businessTypes.map((type) {
                return DropdownMenuItem(
                  value: type['value'],
                  child: Text(type['label']!),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedBusinessType = value);
                }
              },
            ),
          ),
        ),
      ],
    );
  }
}
