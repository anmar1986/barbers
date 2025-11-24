import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_result.dart';
import '../../../shared/models/business_model.dart';
import '../../../shared/widgets/widgets.dart';
import '../providers/business_provider.dart';

/// Manage Services Screen
class ManageServicesScreen extends ConsumerStatefulWidget {
  const ManageServicesScreen({super.key});

  @override
  ConsumerState<ManageServicesScreen> createState() =>
      _ManageServicesScreenState();
}

class _ManageServicesScreenState extends ConsumerState<ManageServicesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(businessProfileProvider.notifier).loadServices();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(businessProfileProvider);
    final services = state.services;

    return Scaffold(
      backgroundColor: AppColors.backgroundGrey,
      appBar: AppBar(
        title: const Text('Manage Services'),
        backgroundColor: AppColors.primary,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showServiceDialog(context, ref),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add),
        label: const Text('Add Service'),
      ),
      body: state.isServicesLoading
          ? const Center(child: CircularProgressIndicator())
          : services.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: services.length,
                  itemBuilder: (context, index) {
                    return _ServiceCard(
                      service: services[index],
                      onEdit: () => _showServiceDialog(
                        context,
                        ref,
                        service: services[index],
                      ),
                      onDelete: () => _deleteService(services[index]),
                      onToggleActive: () =>
                          _toggleServiceActive(services[index]),
                    );
                  },
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.design_services_outlined,
            size: 80,
            color: AppColors.textSecondary.withValues(alpha: 0.5),
          ),
          const SizedBox(height: 16),
          const Text(
            'No Services Yet',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Add services that your business offers',
            style: TextStyle(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  void _showServiceDialog(
    BuildContext context,
    WidgetRef ref, {
    BusinessService? service,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _ServiceFormSheet(
        service: service,
        onSave: (name, description, price, duration, isActive) async {
          if (service != null) {
            // Update existing service
            final result =
                await ref.read(businessProfileProvider.notifier).updateService(
                      uuid: service.uuid!,
                      name: name,
                      description: description,
                      price: price,
                      duration: duration,
                      isActive: isActive,
                    );
            return result;
          } else {
            // Create new service
            final result =
                await ref.read(businessProfileProvider.notifier).createService(
                      name: name,
                      description: description,
                      price: price,
                      duration: duration,
                      isActive: isActive,
                    );
            return result;
          }
        },
      ),
    );
  }

  Future<void> _deleteService(BusinessService service) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Service'),
        content: Text('Are you sure you want to delete "${service.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true && service.uuid != null) {
      final result = await ref
          .read(businessProfileProvider.notifier)
          .deleteService(service.uuid!);
      if (mounted) {
        result.onSuccess((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Service deleted'),
              backgroundColor: AppColors.success,
            ),
          );
        }).onFailure((error) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(error),
              backgroundColor: AppColors.error,
            ),
          );
        });
      }
    }
  }

  Future<void> _toggleServiceActive(BusinessService service) async {
    if (service.uuid == null) return;

    final result =
        await ref.read(businessProfileProvider.notifier).updateService(
              uuid: service.uuid!,
              isActive: !service.isActive,
            );

    if (mounted) {
      result.onFailure((error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: AppColors.error,
          ),
        );
      });
    }
  }
}

/// Service Card Widget
class _ServiceCard extends StatelessWidget {
  final BusinessService service;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onToggleActive;

  const _ServiceCard({
    required this.service,
    required this.onEdit,
    required this.onDelete,
    required this.onToggleActive,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        service.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (service.description != null &&
                          service.description!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          service.description!,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
                Switch(
                  value: service.isActive,
                  onChanged: (_) => onToggleActive(),
                  activeTrackColor: AppColors.success,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                // Price
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    service.formattedPrice,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Duration
                if (service.duration != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.access_time,
                          size: 16,
                          color: AppColors.accent,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          service.formattedDuration,
                          style: const TextStyle(
                            fontWeight: FontWeight.w500,
                            color: AppColors.accent,
                          ),
                        ),
                      ],
                    ),
                  ),
                const Spacer(),
                // Edit button
                IconButton(
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit, color: AppColors.primary),
                  tooltip: 'Edit',
                ),
                // Delete button
                IconButton(
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete, color: AppColors.error),
                  tooltip: 'Delete',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Service Form Bottom Sheet
class _ServiceFormSheet extends StatefulWidget {
  final BusinessService? service;
  final Future<ApiResult<BusinessService>> Function(
    String name,
    String? description,
    double? price,
    int? duration,
    bool isActive,
  ) onSave;

  const _ServiceFormSheet({
    this.service,
    required this.onSave,
  });

  @override
  State<_ServiceFormSheet> createState() => _ServiceFormSheetState();
}

class _ServiceFormSheetState extends State<_ServiceFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _durationController = TextEditingController();
  bool _isActive = true;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.service != null) {
      _nameController.text = widget.service!.name;
      _descriptionController.text = widget.service!.description ?? '';
      if (widget.service!.price != null) {
        _priceController.text = widget.service!.price!.toStringAsFixed(2);
      }
      if (widget.service!.duration != null) {
        _durationController.text = widget.service!.duration.toString();
      }
      _isActive = widget.service!.isActive;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _durationController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final result = await widget.onSave(
        _nameController.text.trim(),
        _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
        _priceController.text.isEmpty
            ? null
            : double.tryParse(_priceController.text),
        _durationController.text.isEmpty
            ? null
            : int.tryParse(_durationController.text),
        _isActive,
      );

      if (mounted) {
        result.onSuccess((_) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                widget.service != null ? 'Service updated' : 'Service created',
              ),
              backgroundColor: AppColors.success,
            ),
          );
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
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title
              Text(
                widget.service != null ? 'Edit Service' : 'Add Service',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 24),

              // Name
              TextInput(
                controller: _nameController,
                label: 'Service Name',
                hint: 'e.g., Haircut, Manicure',
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Service name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Description
              TextInput(
                controller: _descriptionController,
                label: 'Description (optional)',
                hint: 'Describe the service',
                maxLines: 2,
              ),
              const SizedBox(height: 16),

              // Price and Duration
              Row(
                children: [
                  Expanded(
                    child: TextInput(
                      controller: _priceController,
                      label: 'Price (\$)',
                      hint: '0.00',
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextInput(
                      controller: _durationController,
                      label: 'Duration (min)',
                      hint: '30',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Active toggle
              Row(
                children: [
                  const Text(
                    'Active',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const Spacer(),
                  Switch(
                    value: _isActive,
                    onChanged: (value) => setState(() => _isActive = value),
                    activeTrackColor: AppColors.success,
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Save button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          widget.service != null ? 'Update' : 'Add Service',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
