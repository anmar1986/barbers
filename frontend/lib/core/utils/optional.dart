/// Optional wrapper class for handling nullable values in copyWith methods
/// This allows distinguishing between "not provided" and "explicitly set to null"
class Optional<T> {
  final T? _value;
  final bool _isPresent;

  /// Create an Optional with a value (including null)
  const Optional.value(this._value) : _isPresent = true;

  /// Create an Optional representing "not provided"
  const Optional.absent()
      : _value = null,
        _isPresent = false;

  /// Check if a value was provided (even if null)
  bool get isPresent => _isPresent;

  /// Get the value (can be null if explicitly set)
  T? get value => _value;

  /// Get the value or use a default
  T valueOr(T defaultValue) => _isPresent ? _value as T : defaultValue;
}
