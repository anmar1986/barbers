import 'package:equatable/equatable.dart';

/// User Model
/// Represents a user in the application
class User extends Equatable {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String userType; // 'user' or 'business'
  final DateTime? emailVerifiedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    required this.userType,
    this.emailVerifiedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Check if user is verified
  bool get isVerified => emailVerifiedAt != null;

  /// Check if user is a business account
  bool get isBusiness => userType == 'business';

  /// Create User from JSON
  factory User.fromJson(Map<String, dynamic> json) {
    // Combine first_name and last_name if they exist, otherwise use name
    String fullName = json['name'] ?? '';
    if (fullName.isEmpty &&
        (json['first_name'] != null || json['last_name'] != null)) {
      final firstName = json['first_name']?.toString().trim() ?? '';
      final lastName = json['last_name']?.toString().trim() ?? '';
      fullName = '$firstName $lastName'.trim();
    }

    return User(
      id: json['id']?.toString() ?? json['uuid']?.toString() ?? '',
      name: fullName.isNotEmpty ? fullName : 'Unknown User',
      email: json['email'] ?? '',
      phone: json['phone'],
      avatar: json['avatar'] ?? json['profile_picture'],
      userType: json['user_type'] ?? 'user',
      emailVerifiedAt: json['email_verified_at'] != null
          ? DateTime.parse(json['email_verified_at'])
          : null,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  /// Convert User to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar': avatar,
      'user_type': userType,
      'email_verified_at': emailVerifiedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  /// Copy with method
  User copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? avatar,
    String? userType,
    DateTime? emailVerifiedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      userType: userType ?? this.userType,
      emailVerifiedAt: emailVerifiedAt ?? this.emailVerifiedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        email,
        phone,
        avatar,
        userType,
        emailVerifiedAt,
        createdAt,
        updatedAt,
      ];
}
