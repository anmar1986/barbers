/// API Constants
/// Contains all API endpoints and configuration
class ApiConstants {
  ApiConstants._();

  // ==================== BASE CONFIGURATION ====================

  /// Base URL for API requests
  /// Change this to your production URL when deploying
  /// For Android emulator: use 10.0.2.2 to access host machine
  /// For iOS simulator: use localhost or your machine's IP
  static const String baseUrl = 'http://10.0.2.2:8000/api';

  /// API version
  static const String apiVersion = 'v1';

  /// Request timeout durations
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  // ==================== AUTH ENDPOINTS ====================

  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String verifyEmail = '/auth/verify-email';
  static const String resendVerification = '/auth/resend-verification';

  // ==================== USER ENDPOINTS ====================

  static const String profile = '/auth/profile';
  static const String updateProfile = '/auth/profile';
  static const String updatePassword = '/auth/change-password';
  static const String uploadAvatar = '/user/avatar';
  static const String deleteAccount = '/user/account';

  // ==================== BUSINESS ENDPOINTS ====================

  static const String businesses = '/businesses';
  static const String businessDetail = '/businesses'; // + /{uuid}
  static const String businessServices = '/businesses'; // + /{uuid}/services
  static const String businessGallery = '/businesses'; // + /{uuid}/gallery
  static const String businessReviews = '/businesses'; // + /{uuid}/reviews
  static const String businessBookings = '/businesses'; // + /{uuid}/bookings
  static const String followBusiness = '/businesses'; // + /{uuid}/follow
  static const String unfollowBusiness = '/businesses'; // + /{uuid}/unfollow
  static const String nearbyBusinesses = '/businesses/nearby';
  static const String featuredBusinesses = '/businesses/featured';
  static const String searchBusinesses = '/businesses/search';

  // ==================== MY BUSINESS (OWNER) ENDPOINTS ====================

  static const String myBusiness = '/my-business';
  static const String myBusinessStatistics = '/my-business/statistics';
  static const String myBusinessServices = '/my-business/services';
  static const String myBusinessHours = '/my-business/hours';
  static const String myBusinessVideos = '/my-business/videos';

  // ==================== UPLOAD ENDPOINTS ====================

  static const String uploadImage = '/upload/image';
  static const String uploadImages = '/upload/images';
  static const String uploadVideoFile = '/upload/video';
  static const String deleteFile = '/upload/file';
  static const String chunkedUploadInit = '/upload/chunked/init';
  static const String chunkedUploadChunk = '/upload/chunked/chunk';
  static const String chunkedUploadComplete = '/upload/chunked/complete';
  static const String chunkedUploadStatus =
      '/upload/chunked/status'; // + /{uploadId}
  static const String chunkedUploadCancel =
      '/upload/chunked/cancel'; // + /{uploadId}

  // ==================== VIDEO ENDPOINTS ====================

  static const String videos = '/videos';
  static const String videoDetail = '/videos'; // + /{uuid}
  static const String videoFeed = '/videos/feed';
  static const String videoTrending = '/videos/trending';
  static const String videosByBusiness = '/videos/business'; // + /{uuid}
  static const String uploadVideo = '/videos';
  static const String deleteVideo = '/videos'; // + /{uuid}
  static const String likeVideo = '/videos'; // + /{uuid}/like
  static const String unlikeVideo = '/videos'; // + /{uuid}/unlike
  static const String commentVideo = '/videos'; // + /{uuid}/comments
  static const String shareVideo = '/videos'; // + /{uuid}/share

  // ==================== BOOKING ENDPOINTS ====================

  static const String bookings = '/bookings';
  static const String bookingDetail = '/bookings'; // + /{uuid}
  static const String createBooking = '/bookings';
  static const String cancelBooking = '/bookings'; // + /{uuid}/cancel
  static const String rescheduleBooking = '/bookings'; // + /{uuid}/reschedule
  static const String bookingHistory = '/bookings/history';
  static const String upcomingBookings = '/bookings/upcoming';

  // ==================== PRODUCT/SHOP ENDPOINTS ====================

  static const String products = '/products';
  static const String productDetail = '/products'; // + /{uuid}
  static const String productCategories = '/products/categories';
  static const String featuredProducts = '/products/featured';
  static const String searchProducts = '/products/search';

  // ==================== CART ENDPOINTS ====================

  static const String cart = '/cart';
  static const String addToCart = '/cart/add';
  static const String updateCartItem = '/cart/update'; // + /{id}
  static const String removeFromCart = '/cart/remove'; // + /{id}
  static const String clearCart = '/cart/clear';

  // ==================== ORDER ENDPOINTS ====================

  static const String orders = '/orders';
  static const String orderDetail = '/orders'; // + /{uuid}
  static const String createOrder = '/orders';
  static const String cancelOrder = '/orders'; // + /{uuid}/cancel
  static const String orderHistory = '/orders/history';

  // ==================== PAYMENT ENDPOINTS ====================

  static const String createPaymentIntent = '/payments/intent';
  static const String confirmPayment = '/payments/confirm';
  static const String paymentMethods = '/payments/methods';
  static const String addPaymentMethod = '/payments/methods/add';
  static const String deletePaymentMethod = '/payments/methods'; // + /{id}

  // ==================== REVIEW ENDPOINTS ====================

  static const String reviews = '/reviews';
  static const String createReview = '/reviews';
  static const String updateReview = '/reviews'; // + /{id}
  static const String deleteReview = '/reviews'; // + /{id}

  // ==================== NOTIFICATION ENDPOINTS ====================

  static const String notifications = '/notifications';
  static const String markNotificationRead = '/notifications'; // + /{id}/read
  static const String markAllNotificationsRead = '/notifications/read-all';
  static const String deleteNotification = '/notifications'; // + /{id}
  static const String notificationSettings = '/notifications/settings';

  // ==================== CHAT/MESSAGING ENDPOINTS ====================

  static const String conversations = '/conversations';
  static const String conversationDetail = '/conversations'; // + /{uuid}
  static const String sendMessage = '/conversations'; // + /{uuid}/messages
  static const String messages = '/conversations'; // + /{uuid}/messages
  static const String markMessageRead = '/messages'; // + /{id}/read

  // ==================== SEARCH ENDPOINTS ====================

  static const String search = '/search';
  static const String searchAll = '/search/all';
  static const String searchSuggestions = '/search/suggestions';

  // ==================== ANALYTICS ENDPOINTS ====================

  static const String analytics = '/analytics';
  static const String businessAnalytics = '/analytics/business';
  static const String videoAnalytics = '/analytics/videos';
  static const String exportAnalytics = '/analytics/export';

  // ==================== LOCATION ENDPOINTS ====================

  static const String cities = '/locations/cities';
  static const String states = '/locations/states';
  static const String countries = '/locations/countries';

  // ==================== HELPER METHODS ====================

  /// Build full URL with base URL
  static String buildUrl(String endpoint) {
    return '$baseUrl$endpoint';
  }

  /// Build URL with path parameter
  static String buildUrlWithId(String endpoint, String id) {
    return '$baseUrl$endpoint/$id';
  }

  /// Build URL with multiple path segments
  static String buildUrlWithPath(String endpoint, List<String> segments) {
    return '$baseUrl$endpoint/${segments.join('/')}';
  }
}
