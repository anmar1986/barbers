import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'app.dart';

/// Application Entry Point
void main() async {
  // Ensure Flutter binding is initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize app services
  await _initializeApp();

  // Run app with Riverpod provider scope
  runApp(
    const ProviderScope(
      child: BarberSocialApp(),
    ),
  );
}

/// Initialize all app services and dependencies
Future<void> _initializeApp() async {
  try {
    // ==================== LOAD ENVIRONMENT VARIABLES ====================
    await _loadEnvironment();

    // ==================== INITIALIZE HIVE (LOCAL DATABASE) ====================
    await _initializeHive();

    // ==================== INITIALIZE STRIPE ====================
    await _initializeStripe();

    // ==================== SET SYSTEM UI PREFERENCES ====================
    await _setSystemUIPreferences();

    // ==================== INITIALIZE FIREBASE (OPTIONAL) ====================
    // Uncomment when Firebase is needed
    // await _initializeFirebase();
  } catch (e, stackTrace) {
    // Log initialization errors
    debugPrint('❌ Error initializing app: $e');
    debugPrint('Stack trace: $stackTrace');

    // You might want to show an error screen here
    // or handle the error in a different way
  }
}

/// Load environment variables from .env file
Future<void> _loadEnvironment() async {
  try {
    await dotenv.load(fileName: '.env');
    debugPrint('✅ Environment variables loaded');
  } catch (e) {
    debugPrint('⚠️ Warning: Could not load .env file: $e');
    debugPrint('   Using default configuration');
  }
}

/// Initialize Hive local database
Future<void> _initializeHive() async {
  try {
    // Initialize Hive
    await Hive.initFlutter();

    // Register adapters here when you create them
    // Example:
    // Hive.registerAdapter(UserAdapter());
    // Hive.registerAdapter(BusinessAdapter());

    // Open boxes
    // await Hive.openBox('settings');
    // await Hive.openBox('cache');

    debugPrint('✅ Hive initialized successfully');
  } catch (e) {
    debugPrint('❌ Error initializing Hive: $e');
    rethrow;
  }
}

/// Initialize Stripe payment SDK
Future<void> _initializeStripe() async {
  try {
    // Get Stripe publishable key from environment
    final stripePublishableKey = dotenv.env['STRIPE_PUBLISHABLE_KEY'];

    if (stripePublishableKey == null || stripePublishableKey.isEmpty) {
      debugPrint('⚠️ Warning: STRIPE_PUBLISHABLE_KEY not found in .env');
      return;
    }

    // Initialize Stripe
    Stripe.publishableKey = stripePublishableKey;

    // Optional: Configure Stripe settings
    Stripe.merchantIdentifier = 'merchant.com.barbersocial';
    Stripe.urlScheme = 'barbersocial';

    debugPrint('✅ Stripe initialized successfully');
  } catch (e) {
    debugPrint('❌ Error initializing Stripe: $e');
    // Don't rethrow - app can work without Stripe
  }
}

/// Set system UI preferences
Future<void> _setSystemUIPreferences() async {
  try {
    // Set system overlay style
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
    );

    // Set preferred orientations
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    debugPrint('✅ System UI preferences set');
  } catch (e) {
    debugPrint('❌ Error setting system UI preferences: $e');
    // Don't rethrow - not critical
  }
}

/// Initialize Firebase (optional - uncomment when needed)
// Future<void> _initializeFirebase() async {
//   try {
//     await Firebase.initializeApp(
//       options: DefaultFirebaseOptions.currentPlatform,
//     );
//
//     // Initialize Firebase Messaging
//     final messaging = FirebaseMessaging.instance;
//
//     // Request permissions for iOS
//     await messaging.requestPermission(
//       alert: true,
//       badge: true,
//       sound: true,
//     );
//
//     // Get FCM token
//     final token = await messaging.getToken();
//     debugPrint('📱 FCM Token: $token');
//
//     // Handle background messages
//     FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
//
//     debugPrint('✅ Firebase initialized successfully');
//   } catch (e) {
//     debugPrint('❌ Error initializing Firebase: $e');
//     rethrow;
//   }
// }

/// Handle Firebase background messages
// @pragma('vm:entry-point')
// Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
//   await Firebase.initializeApp();
//   debugPrint('📬 Background message received: ${message.messageId}');
// }
