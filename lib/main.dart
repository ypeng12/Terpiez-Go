import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:terpiez/home.dart';
import 'package:terpiez/login.dart';
import 'redis_service.dart';
import 'user_model.dart';
import 'auth.dart';
import 'notification_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Create an instance of UserModel here if you need to use it before runApp.
  final userModel = UserModel();  
  final redisService = RedisService();
  final authService = AuthService();
  
  try {
    await redisService.connect();  // Make sure Redis connection is established.
  } catch (e) {
    print("Error during Redis operation: $e");
    // Consider how to handle this error. Maybe a retry logic or a fallback?
  }
  NotificationManager.initializeNotifications(); 
  runApp(
    MultiProvider(
      
      providers: [
        ChangeNotifierProvider(create: (_) => userModel),
        Provider<AuthService>(create: (_) => authService),
        Provider<RedisService>(
          create: (_) => RedisService(),
          lazy: false, // Initializes the instance as soon as the provider is created if needed
        ),
      ],
      child: MaterialApp(
        home: LoginScreen(),
        routes: {
          '/home': (context) => TerpiezHomePage(),
        },
      ),
    ),
  );
}
