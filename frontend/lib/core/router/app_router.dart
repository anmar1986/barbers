import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Import actual screen implementations
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/main/screens/main_screen.dart';
import '../../features/auth/providers/auth_provider.dart';

/// App Router Configuration
/// Centralized routing using GoRouter
class AppRouter {
  AppRouter._();

  /// Router configuration
  static final GoRouter router = GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    routes: [
      // ==================== SPLASH & ONBOARDING ====================
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.onboarding,
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // ==================== AUTHENTICATION ====================
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        name: 'forgotPassword',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),

      // ==================== MAIN APP ====================
      GoRoute(
        path: AppRoutes.main,
        name: 'main',
        builder: (context, state) => const MainScreen(),
      ),

      // ==================== PROFILE MODULE ====================
      GoRoute(
        path: AppRoutes.profile,
        name: 'profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.editProfile,
        name: 'editProfile',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.settings,
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '${AppRoutes.userProfile}/:userId',
        name: 'userProfile',
        builder: (context, state) {
          final userId = state.pathParameters['userId']!;
          return UserProfileScreen(userId: userId);
        },
      ),

      // ==================== BUSINESS MODULE ====================
      GoRoute(
        path: '${AppRoutes.businessDetail}/:businessId',
        name: 'businessDetail',
        builder: (context, state) {
          final businessId = state.pathParameters['businessId']!;
          return BusinessDetailScreen(businessId: businessId);
        },
      ),
      GoRoute(
        path: AppRoutes.businessSearch,
        name: 'businessSearch',
        builder: (context, state) => const BusinessSearchScreen(),
      ),

      // ==================== BOOKING MODULE ====================
      GoRoute(
        path: '${AppRoutes.booking}/:businessId',
        name: 'booking',
        builder: (context, state) {
          final businessId = state.pathParameters['businessId']!;
          return BookingScreen(businessId: businessId);
        },
      ),
      GoRoute(
        path: AppRoutes.bookingHistory,
        name: 'bookingHistory',
        builder: (context, state) => const BookingHistoryScreen(),
      ),
      GoRoute(
        path: '${AppRoutes.bookingDetail}/:bookingId',
        name: 'bookingDetail',
        builder: (context, state) {
          final bookingId = state.pathParameters['bookingId']!;
          return BookingDetailScreen(bookingId: bookingId);
        },
      ),

      // ==================== VIDEO MODULE ====================
      GoRoute(
        path: '${AppRoutes.videoDetail}/:videoId',
        name: 'videoDetail',
        builder: (context, state) {
          final videoId = state.pathParameters['videoId']!;
          return VideoDetailScreen(videoId: videoId);
        },
      ),
      GoRoute(
        path: AppRoutes.uploadVideo,
        name: 'uploadVideo',
        builder: (context, state) => const UploadVideoScreen(),
      ),

      // ==================== SHOP MODULE ====================
      GoRoute(
        path: '${AppRoutes.productDetail}/:productId',
        name: 'productDetail',
        builder: (context, state) {
          final productId = state.pathParameters['productId']!;
          return ProductDetailScreen(productId: productId);
        },
      ),
      GoRoute(
        path: AppRoutes.cart,
        name: 'cart',
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: AppRoutes.checkout,
        name: 'checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: AppRoutes.orders,
        name: 'orders',
        builder: (context, state) => const OrdersScreen(),
      ),
      GoRoute(
        path: '${AppRoutes.orderDetail}/:orderId',
        name: 'orderDetail',
        builder: (context, state) {
          final orderId = state.pathParameters['orderId']!;
          return OrderDetailScreen(orderId: orderId);
        },
      ),

      // ==================== CHAT MODULE ====================
      GoRoute(
        path: AppRoutes.conversations,
        name: 'conversations',
        builder: (context, state) => const ConversationsScreen(),
      ),
      GoRoute(
        path: '${AppRoutes.chat}/:conversationId',
        name: 'chat',
        builder: (context, state) {
          final conversationId = state.pathParameters['conversationId']!;
          return ChatScreen(conversationId: conversationId);
        },
      ),

      // ==================== NOTIFICATIONS ====================
      GoRoute(
        path: AppRoutes.notifications,
        name: 'notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),

      // ==================== SEARCH ====================
      GoRoute(
        path: AppRoutes.search,
        name: 'search',
        builder: (context, state) => const SearchScreen(),
      ),

      // ==================== ANALYTICS (Business Only) ====================
      GoRoute(
        path: AppRoutes.analytics,
        name: 'analytics',
        builder: (context, state) => const AnalyticsScreen(),
      ),
    ],
    errorBuilder: (context, state) => ErrorScreen(error: state.error),
  );
}

/// App Routes Constants
class AppRoutes {
  AppRoutes._();

  // Auth & Onboarding
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';

  // Main
  static const String main = '/main';

  // Profile
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
  static const String settings = '/settings';
  static const String userProfile = '/user';

  // Business
  static const String businessDetail = '/business';
  static const String businessSearch = '/business/search';

  // Booking
  static const String booking = '/booking';
  static const String bookingHistory = '/bookings';
  static const String bookingDetail = '/booking';

  // Video
  static const String videoDetail = '/video';
  static const String uploadVideo = '/video/upload';

  // Shop
  static const String productDetail = '/product';
  static const String cart = '/cart';
  static const String checkout = '/checkout';
  static const String orders = '/orders';
  static const String orderDetail = '/order';

  // Chat
  static const String conversations = '/conversations';
  static const String chat = '/chat';

  // Other
  static const String notifications = '/notifications';
  static const String search = '/search';
  static const String analytics = '/analytics';
}

// ==================== PLACEHOLDER SCREENS ====================
// These will be replaced with actual implementations

/// Splash Screen with Auto Navigation
/// Checks authentication status and navigates accordingly
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateAfterDelay();
  }

  Future<void> _navigateAfterDelay() async {
    // Wait for initialization and minimum splash duration
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    // Check authentication status
    final authState = ref.read(authProvider);

    // Navigate based on authentication status
    if (authState.isAuthenticated) {
      context.go(AppRoutes.main);
    } else {
      context.go(AppRoutes.login);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.cut,
              size: 100,
              color: Theme.of(context).primaryColor,
            ),
            const SizedBox(height: 24),
            const Text(
              'Barber Social',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Onboarding')),
      body: const Center(child: Text('Onboarding Screen')),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: const Center(child: Text('Profile Screen')),
    );
  }
}

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: const Center(child: Text('Edit Profile Screen')),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: const Center(child: Text('Settings Screen')),
    );
  }
}

class UserProfileScreen extends StatelessWidget {
  final String userId;
  const UserProfileScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Profile')),
      body: Center(child: Text('User Profile: $userId')),
    );
  }
}

class BusinessDetailScreen extends StatelessWidget {
  final String businessId;
  const BusinessDetailScreen({super.key, required this.businessId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Business Detail')),
      body: Center(child: Text('Business: $businessId')),
    );
  }
}

class BusinessSearchScreen extends StatelessWidget {
  const BusinessSearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search Businesses')),
      body: const Center(child: Text('Business Search')),
    );
  }
}

class BookingScreen extends StatelessWidget {
  final String businessId;
  const BookingScreen({super.key, required this.businessId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Book Service')),
      body: Center(child: Text('Booking for: $businessId')),
    );
  }
}

class BookingHistoryScreen extends StatelessWidget {
  const BookingHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Booking History')),
      body: const Center(child: Text('Booking History')),
    );
  }
}

class BookingDetailScreen extends StatelessWidget {
  final String bookingId;
  const BookingDetailScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Booking Detail')),
      body: Center(child: Text('Booking: $bookingId')),
    );
  }
}

class VideoDetailScreen extends StatelessWidget {
  final String videoId;
  const VideoDetailScreen({super.key, required this.videoId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Video Detail')),
      body: Center(child: Text('Video: $videoId')),
    );
  }
}

class UploadVideoScreen extends StatelessWidget {
  const UploadVideoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload Video')),
      body: const Center(child: Text('Upload Video')),
    );
  }
}

class ProductDetailScreen extends StatelessWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Product Detail')),
      body: Center(child: Text('Product: $productId')),
    );
  }
}

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cart')),
      body: const Center(child: Text('Shopping Cart')),
    );
  }
}

class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: const Center(child: Text('Checkout')),
    );
  }
}

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Orders')),
      body: const Center(child: Text('Order History')),
    );
  }
}

class OrderDetailScreen extends StatelessWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Detail')),
      body: Center(child: Text('Order: $orderId')),
    );
  }
}

class ConversationsScreen extends StatelessWidget {
  const ConversationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Messages')),
      body: const Center(child: Text('Conversations')),
    );
  }
}

class ChatScreen extends StatelessWidget {
  final String conversationId;
  const ChatScreen({super.key, required this.conversationId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chat')),
      body: Center(child: Text('Chat: $conversationId')),
    );
  }
}

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: const Center(child: Text('Notifications')),
    );
  }
}

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search')),
      body: const Center(child: Text('Search')),
    );
  }
}

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      body: const Center(child: Text('Business Analytics')),
    );
  }
}

class ErrorScreen extends StatelessWidget {
  final Exception? error;
  const ErrorScreen({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 80, color: Colors.red),
            const SizedBox(height: 16),
            const Text('Oops! Something went wrong'),
            if (error != null) ...[
              const SizedBox(height: 8),
              Text(
                error.toString(),
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
