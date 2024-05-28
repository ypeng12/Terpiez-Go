import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'main.dart'; // Import the file where UserModel is defined
import 'redis_service.dart'; // Assuming this file contains the necessary Redis functionality
import 'user_model.dart';

class StatsTerpiez extends StatelessWidget {
  final UserModel userModel;
  final FlutterSecureStorage secureStorage = FlutterSecureStorage();
  final RedisService redisService = RedisService(); // Instantiate Redis service

  StatsTerpiez({Key? key, required this.userModel}) : super(key: key);

 // Method to check Redis data status
  Future<String> getRedisDataStatus() async {
    try {
      // Assume you have a method in RedisService to fetch data
      await redisService.connect();
      var data = await redisService.fetchJson('terpiez'); // Example key
      await redisService.disconnect();
      if (data != null) {
        return "Data successfully(terpiez) retrieved from Redis.";
      } else {
        return "Data retrieved but is empty.";
      }
    } catch (e) {
      return "Failed to retrieve data: $e";
    }
  }
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: const Text(
              'Statistics',
              style: TextStyle(
                fontSize: 50,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Terpiez found: ${userModel.totalTerpiezCaught}',
            style: const TextStyle(
              fontSize: 20,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Days Active: ${userModel.playingDays}',
            style: const TextStyle(
              fontSize: 20,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 24),
          FutureBuilder<String>(
            future: getRedisDataStatus(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const CircularProgressIndicator();
              } else if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Text('No data found');
              } else {
                return Text(
                  snapshot.data!,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.green,
                  ),
                );
              }
            },
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Text(
              'User: ${userModel.userId}',
              style: const TextStyle(
                fontSize: 16,
                color: Colors.black54,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
