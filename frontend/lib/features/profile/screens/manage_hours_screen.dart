import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_result.dart';
import '../../../shared/models/business_model.dart';
import '../providers/business_provider.dart';

/// Manage Business Hours Screen
class ManageHoursScreen extends ConsumerStatefulWidget {
  const ManageHoursScreen({super.key});

  @override
  ConsumerState<ManageHoursScreen> createState() => _ManageHoursScreenState();
}

class _ManageHoursScreenState extends ConsumerState<ManageHoursScreen> {
  List<BusinessHours> _hours = [];
  bool _isLoading = false;
  bool _hasChanges = false;

  /// Helper to strip seconds from time string (HH:MM:SS -> HH:MM)
  String _normalizeTime(String? time) {
    if (time == null) return '09:00';
    final parts = time.split(':');
    if (parts.length >= 2) {
      return '${parts[0].padLeft(2, '0')}:${parts[1].padLeft(2, '0')}';
    }
    return time;
  }

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      // Load business hours if not already loaded
      final state = ref.read(businessProfileProvider);
      if (state.hours.isEmpty) {
        await ref.read(businessProfileProvider.notifier).loadBusinessHours();
      }
      _loadHours();
      setState(() {});
    });
  }

  void _loadHours() {
    final hours = ref.read(businessProfileProvider).hours;
    if (hours.isEmpty) {
      _hours = BusinessHours.createDefaultHours();
    } else {
      // Create a copy of the hours list and normalize times
      _hours = hours
          .map((h) => h.copyWith(
                openTime:
                    h.openTime != null ? _normalizeTime(h.openTime) : null,
                closeTime:
                    h.closeTime != null ? _normalizeTime(h.closeTime) : null,
              ))
          .toList();
      // Ensure we have all 7 days
      if (_hours.length < 7) {
        final existingDays = _hours.map((h) => h.dayOfWeek).toSet();
        for (int i = 0; i < 7; i++) {
          if (!existingDays.contains(i)) {
            _hours.add(BusinessHours(
              id: 0,
              businessId: 0,
              dayOfWeek: i,
              openTime: '09:00',
              closeTime: '18:00',
              isClosed: i == 0,
            ));
          }
        }
      }
    }
    // Sort by day of week
    _hours.sort((a, b) => a.dayOfWeek.compareTo(b.dayOfWeek));
  }

  Future<void> _saveHours() async {
    setState(() => _isLoading = true);

    try {
      final result = await ref
          .read(businessProfileProvider.notifier)
          .updateBusinessHours(_hours);

      if (mounted) {
        result.onSuccess((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Business hours updated'),
              backgroundColor: AppColors.success,
            ),
          );
          setState(() => _hasChanges = false);
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

  void _updateDayHours(int dayOfWeek, BusinessHours newHours) {
    setState(() {
      final index = _hours.indexWhere((h) => h.dayOfWeek == dayOfWeek);
      if (index != -1) {
        _hours[index] = newHours;
      }
      _hasChanges = true;
    });
  }

  Future<bool> _onWillPop() async {
    if (_hasChanges) {
      final shouldPop = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Unsaved Changes'),
          content: const Text(
              'You have unsaved changes. Do you want to discard them?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Discard'),
            ),
          ],
        ),
      );
      return shouldPop ?? false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_hasChanges,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _onWillPop();
        if (shouldPop && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.backgroundGrey,
        appBar: AppBar(
          title: const Text('Business Hours'),
          backgroundColor: AppColors.primary,
          actions: [
            TextButton(
              onPressed: _isLoading ? null : _saveHours,
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
        body: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _hours.length,
          itemBuilder: (context, index) {
            final hour = _hours[index];
            return _DayHoursCard(
              hours: hour,
              onChanged: (newHours) =>
                  _updateDayHours(hour.dayOfWeek, newHours),
            );
          },
        ),
      ),
    );
  }
}

/// Day Hours Card Widget
class _DayHoursCard extends StatelessWidget {
  final BusinessHours hours;
  final ValueChanged<BusinessHours> onChanged;

  const _DayHoursCard({
    required this.hours,
    required this.onChanged,
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
                  child: Text(
                    hours.dayName,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                Row(
                  children: [
                    Text(
                      hours.isClosed ? 'Closed' : 'Open',
                      style: TextStyle(
                        color: hours.isClosed
                            ? AppColors.error
                            : AppColors.success,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Switch(
                      value: !hours.isClosed,
                      onChanged: (value) {
                        onChanged(hours.copyWith(isClosed: !value));
                      },
                      activeTrackColor: AppColors.success,
                    ),
                  ],
                ),
              ],
            ),
            if (!hours.isClosed) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _TimePickerField(
                      label: 'Open',
                      time: hours.openTime ?? '09:00',
                      onChanged: (time) {
                        onChanged(hours.copyWith(openTime: time));
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _TimePickerField(
                      label: 'Close',
                      time: hours.closeTime ?? '18:00',
                      onChanged: (time) {
                        onChanged(hours.copyWith(closeTime: time));
                      },
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Time Picker Field Widget
class _TimePickerField extends StatelessWidget {
  final String label;
  final String time;
  final ValueChanged<String> onChanged;

  const _TimePickerField({
    required this.label,
    required this.time,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    // Parse time, stripping seconds if present
    final parts = time.split(':');
    final hour = int.tryParse(parts[0]) ?? 9;
    final minute = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;

    // Format display time in 12-hour format
    final displayTime = _formatTime12Hour(hour, minute);

    return GestureDetector(
      onTap: () async {
        final initialTime = TimeOfDay(hour: hour, minute: minute);

        final selectedTime = await showTimePicker(
          context: context,
          initialTime: initialTime,
          builder: (context, child) {
            return MediaQuery(
              data: MediaQuery.of(context).copyWith(
                alwaysUse24HourFormat: false,
              ),
              child: Theme(
                data: Theme.of(context).copyWith(
                  colorScheme: const ColorScheme.light(
                    primary: AppColors.primary,
                  ),
                ),
                child: child!,
              ),
            );
          },
        );

        if (selectedTime != null) {
          // Store in 24-hour format HH:MM (no seconds)
          final formattedTime =
              '${selectedTime.hour.toString().padLeft(2, '0')}:${selectedTime.minute.toString().padLeft(2, '0')}';
          onChanged(formattedTime);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.backgroundGrey,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(
                  Icons.access_time,
                  size: 18,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  displayTime,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Format time to 12-hour format with AM/PM
  String _formatTime12Hour(int hour, int minute) {
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    return '${displayHour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')} $period';
  }
}
