import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import 'text_input.dart';

/// Password Input Widget
/// Text field specifically for password with show/hide toggle
class PasswordInput extends StatefulWidget {
  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final String? Function(String?)? validator;
  final TextInputAction? textInputAction;
  final FocusNode? focusNode;

  const PasswordInput({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.errorText,
    this.onChanged,
    this.validator,
    this.textInputAction,
    this.focusNode,
  });

  @override
  State<PasswordInput> createState() => _PasswordInputState();
}

class _PasswordInputState extends State<PasswordInput> {
  bool _obscureText = true;

  void _toggleVisibility() {
    setState(() {
      _obscureText = !_obscureText;
    });
  }

  @override
  Widget build(BuildContext context) {
    return TextInput(
      controller: widget.controller,
      label: widget.label ?? 'Password',
      hint: widget.hint ?? 'Enter your password',
      errorText: widget.errorText,
      prefixIcon: Icons.lock_outline,
      suffixIcon: IconButton(
        icon: Icon(
          _obscureText ? Icons.visibility_outlined : Icons.visibility_off_outlined,
          color: AppColors.textSecondary,
        ),
        onPressed: _toggleVisibility,
      ),
      obscureText: _obscureText,
      keyboardType: TextInputType.visiblePassword,
      onChanged: widget.onChanged,
      validator: widget.validator,
      textInputAction: widget.textInputAction,
      focusNode: widget.focusNode,
    );
  }
}
