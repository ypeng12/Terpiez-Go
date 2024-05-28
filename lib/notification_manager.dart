import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// You might need to adjust this according to how you've structured your app routing.
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class NotificationManager {
  static final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();

  static Future<void> initializeNotifications() async {
    const AndroidInitializationSettings androidInitSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    final InitializationSettings initSettings = InitializationSettings(android: androidInitSettings);

    await _plugin.initialize(initSettings, onDidReceiveNotificationResponse: _handleNotificationResponse);
  }

  static Future<void> _handleNotificationResponse(NotificationResponse response) async {
    // Ensure that the app reacts to the notification tap correctly.
    if (response.payload != null) {
      // Navigate to the Finder tab if the app is running, otherwise to the home screen.
      if (navigatorKey.currentState?.context != null) {
        Navigator.pushNamed(navigatorKey.currentState!.context, '/finder');
      } else {
        navigatorKey.currentState?.pushNamed('/home');
      }
    }
  }

  static Future<void> showTerpiezNotification(String location) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'terpiez_channel',
      'Terpiez Notifications',
      channelDescription: 'Notifications for Terpiez proximity alerts',
      // importance: Importance.high,
      // priority: Priority.high,
    );

    const NotificationDetails notificationDetails = NotificationDetails(android: androidDetails);

    await _plugin.show(
      0,
      'Terpiez Nearby!',
      'A Terpiez is $location away!',
      notificationDetails,
      payload: 'details', // Adjust the payload as needed
    );
  }
}
