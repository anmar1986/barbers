import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_result.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/business_provider.dart';

/// Create Business Screen
/// Shown when a business user doesn't have a business profile yet
class CreateBusinessScreen extends ConsumerStatefulWidget {
  const CreateBusinessScreen({super.key});

  @override
  ConsumerState<CreateBusinessScreen> createState() =>
      _CreateBusinessScreenState();
}

class _CreateBusinessScreenState extends ConsumerState<CreateBusinessScreen> {
  final _formKey = GlobalKey<FormState>();
  final _businessNameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _zipCodeController = TextEditingController();
  final _countryController = TextEditingController();

  String _selectedBusinessType = 'barber';
  bool _isLoading = false;
  int _currentStep = 0;

  final List<Map<String, String>> _businessTypes = [
    {'value': 'barber', 'label': 'Barber Shop', 'icon': 'content_cut'},
    {'value': 'nail_studio', 'label': 'Nail Studio', 'icon': 'spa'},
    {'value': 'hair_salon', 'label': 'Hair Salon', 'icon': 'face'},
    {'value': 'massage', 'label': 'Massage & Spa', 'icon': 'self_improvement'},
  ];

  @override
  void dispose() {
    _businessNameController.dispose();
    _descriptionController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _zipCodeController.dispose();
    _countryController.dispose();
    super.dispose();
  }

  Future<void> _createBusiness() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final result =
          await ref.read(businessProfileProvider.notifier).createBusiness(
                businessName: _businessNameController.text.trim(),
                businessType: _selectedBusinessType,
                description: _descriptionController.text.trim().isEmpty
                    ? null
                    : _descriptionController.text.trim(),
                phone: _phoneController.text.trim().isEmpty
                    ? null
                    : _phoneController.text.trim(),
                email: _emailController.text.trim().isEmpty
                    ? null
                    : _emailController.text.trim(),
                address: _addressController.text.trim().isEmpty
                    ? null
                    : _addressController.text.trim(),
                city: _cityController.text.trim().isEmpty
                    ? null
                    : _cityController.text.trim(),
                stateName: _stateController.text.trim().isEmpty
                    ? null
                    : _stateController.text.trim(),
                zipCode: _zipCodeController.text.trim().isEmpty
                    ? null
                    : _zipCodeController.text.trim(),
                country: _countryController.text.trim().isEmpty
                    ? null
                    : _countryController.text.trim(),
              );

      if (mounted) {
        result.onSuccess((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Business created successfully!'),
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
    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      appBar: AppBar(
        title: const Text('Create Your Business'),
        backgroundColor: AppColors.primary,
      ),
      body: Form(
        key: _formKey,
        child: Stepper(
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep == 0) {
              // Validate business name before moving to next step
              if (_businessNameController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please enter your business name'),
                    backgroundColor: AppColors.error,
                  ),
                );
                return;
              }
            }
            if (_currentStep < 2) {
              setState(() => _currentStep++);
            } else {
              _createBusiness();
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep--);
            }
          },
          controlsBuilder: (context, details) {
            return Padding(
              padding: const EdgeInsets.only(top: 16),
              child: Row(
                children: [
                  ElevatedButton(
                    onPressed: _isLoading ? null : details.onStepContinue,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                    child: _isLoading && _currentStep == 2
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            _currentStep == 2 ? 'Create Business' : 'Continue'),
                  ),
                  if (_currentStep > 0) ...[
                    const SizedBox(width: 12),
                    TextButton(
                      onPressed: details.onStepCancel,
                      child: const Text('Back'),
                    ),
                  ],
                ],
              ),
            );
          },
          steps: [
            // Step 1: Business Type & Name
            Step(
              title: const Text('Basic Info'),
              subtitle: const Text('Business name and type'),
              isActive: _currentStep >= 0,
              state: _currentStep > 0 ? StepState.complete : StepState.indexed,
              content: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'What type of business do you have?',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildBusinessTypeSelector(),
                  const SizedBox(height: 24),
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
                  TextInput(
                    controller: _descriptionController,
                    label: 'Description (optional)',
                    hint: 'Tell customers about your business',
                    maxLines: 3,
                  ),
                ],
              ),
            ),

            // Step 2: Contact Information
            Step(
              title: const Text('Contact Info'),
              subtitle: const Text('How customers can reach you'),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.indexed,
              content: Column(
                children: [
                  TextInput(
                    controller: _phoneController,
                    label: 'Phone Number',
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
                ],
              ),
            ),

            // Step 3: Location
            Step(
              title: const Text('Location'),
              subtitle: const Text('Where are you located?'),
              isActive: _currentStep >= 2,
              state: _currentStep > 2 ? StepState.complete : StepState.indexed,
              content: Column(
                children: [
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
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBusinessTypeSelector() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: _businessTypes.map((type) {
        final isSelected = _selectedBusinessType == type['value'];
        return GestureDetector(
          onTap: () => setState(() => _selectedBusinessType = type['value']!),
          child: Container(
            width: (MediaQuery.of(context).size.width - 64) / 2,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.primary.withValues(alpha: 0.1)
                  : AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? AppColors.primary : AppColors.border,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  _getIconForType(type['value']!),
                  size: 32,
                  color:
                      isSelected ? AppColors.primary : AppColors.textSecondary,
                ),
                const SizedBox(height: 8),
                Text(
                  type['label']!,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.normal,
                    color:
                        isSelected ? AppColors.primary : AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'barber':
        return Icons.content_cut;
      case 'nail_studio':
        return Icons.spa;
      case 'hair_salon':
        return Icons.face;
      case 'massage':
        return Icons.self_improvement;
      default:
        return Icons.store;
    }
  }
}
