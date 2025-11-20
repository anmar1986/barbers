import 'user_model.dart';

/// Auth Response Model
/// Response from login/register endpoints
class AuthResponse {
  final User user;
  final String token;
  final String? refreshToken;

  const AuthResponse({
    required this.user,
    required this.token,
    this.refreshToken,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      user: User.fromJson(json['user']),
      token: json['token'] ?? json['access_token'] ?? '',
      refreshToken: json['refresh_token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'token': token,
      'refresh_token': refreshToken,
    };
  }
}
