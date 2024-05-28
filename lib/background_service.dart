// import 'dart:async';
// import 'package:flutter/material.dart';
// import 'notification_manager.dart';
// import 'finder_terpiez.dart'; // Import your finder logic here

// class BackgroundService {
//   Timer? _timer;

//   void startMonitoring() {
//     _timer = Timer.periodic(Duration(seconds: 5), (timer) {
//       // Access the distance directly from finder's shared state
//       double distance = Finder.shared._closestTerpiezDistance; // Make sure to expose this in a shared way

//       if (distance <= 20) {
//         NotificationManager.showTerpiezNotification('$distance meters');
//       }
//     });
//   }

//   void stopMonitoring() {
//     _timer?.cancel();
//   }
// }
