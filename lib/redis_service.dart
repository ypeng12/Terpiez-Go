// File: lib/redis_service.dart

//my UMD directory ID is ypeng12
//password  is 9f86777910fc46778fc2b9097b4a0650
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:redis/redis.dart';
import 'local_image.dart';

class RedisService {
  Command? _command;
  bool _wasConnected = false; // To track the previous connection state.

  // Directly define the Redis connection parameters
  final String _host = 'cmsc436-0101-redis.cs.umd.edu';
  final int _port = 6380;
  final String _username = 'ypeng12';
  final String _password = '9f86777910fc46778fc2b9097b4a0650';
  final _connectionController = StreamController<bool>.broadcast();
  Timer? _connectionTimer;

  RedisService() {
    _initiateConnectionMonitor();
  }
  Future<void> printUser(String username, String password) async {
    print('Connected to Redis. Username: $username');
    if (_command != null && _wasConnected) {
      print('Connected to Redis. Username: $username');
    } else {
      print('Not connected to Redis. Cannot fetch user data.');
    }
  }

  void _startConnectionMonitor() {
    _connectionTimer = Timer.periodic(Duration(seconds: 10), (_) => _checkConnection());
  }

  Function(String)? onStatusMessage;

  Stream<bool> get connectionChanges => _connectionController.stream;

  Future<void> connect() async {
    try {
      var connection = RedisConnection();
      var command = await connection.connect(_host, _port).timeout(Duration(seconds: 1));
      await command.send_object(['AUTH', _username, _password]);
      _command = command;
      _updateConnectionStatus(true);
    } catch (e) {
      _command = null;
      _updateConnectionStatus(false);
      onStatusMessage?.call("Failed to connect to Redis: $e");
    }
  }


  void _initiateConnectionMonitor() {
    Timer.periodic(Duration(seconds: 10), (_) async {
      if (_command == null) {
        await connect();
      } else {
        await _checkConnection();
      }
    });
  }
  
  Future<void> _checkConnection() async {
    try {
      if (_command != null) {
        await _command!.send_object(['PING']).timeout(Duration(seconds: 1));
        _updateConnectionStatus(true);
      } else {
        _updateConnectionStatus(false);
      }
    } catch (e) {
      _updateConnectionStatus(false);
      onStatusMessage?.call("Connection check failed: $e");
    }
  }


  bool isConnected() {
    return _command != null && _wasConnected;
  }

  void _updateConnectionStatus(bool isConnected) {
    if (isConnected != _wasConnected) {
      _connectionController.add(isConnected);
      String message = isConnected ? "Connection restored" : "Connection lost";
      onStatusMessage?.call(message);
    }
    _wasConnected = isConnected;
  }

  void dispose() {
    _connectionController.close();
  }

  Future<void> ensureConnected() async {
    if (_command == null) {
      print("Redis command not initialized. Attempting to reconnect...");
      await connect(); // Ensure your connect method is capable of safely attempting a reconnection.
    } else {
      try {
        // Send a simple PING command to check connection health.
        await _command!.send_object(['PING']);
      } catch (e) {
        print(
            "Redis connection seems to be down. Error: $e. Attempting to reconnect...");
        await connect();
      }
    }
  }

  Future<void> storeUserData(String uuid, String dataKey, dynamic data) async {
    await _command?.send_object(['JSON.SET', uuid, dataKey, jsonEncode(data)]);
  }

  Future<dynamic> getUserData(String uuid, String dataKey) async {
    var response = await _command?.send_object(['JSON.GET', uuid, dataKey]);
    return jsonDecode(response);
  }

  Future<dynamic> fetchJson(String key) async {
    var response = await _command!.send_object(['JSON.GET', key]);
    return jsonDecode(response);
  }

  Future<void> disconnect() async {
    await _command?.get_connection()?.close();
  }



  Future<List<Map<String, dynamic>>> fetchTerpiezLocations() async {
    try {
      var response = await _command!.send_object(['JSON.GET', 'locations']);
      var jsonLocations = jsonDecode(response) as List<dynamic>;
      return jsonLocations
          .map((location) => {
                'latitude': location['lat'],
                'longitude': location['lon'],
                'id': location['id'],
              })
          .toList();
    } catch (e) {
      print("Error fetching Terpiez locations: $e");
      return [];
    }
  }

  Future<Map<String, dynamic>> fetchTerpiezDetails(String id) async {
    await ensureConnected();
    try {
      var response = await _command!.send_object(['JSON.GET', 'terpiez']);
      if (response == null) {
        print("No data found for 'terpiez'");
        return {};
      }
      var allTerpiez = jsonDecode(response);
      if (!allTerpiez.containsKey(id)) {
        print("No Terpiez found with ID: $id");
        return {};
      }

      var terpiez = allTerpiez[id];
      return {
        'id': id,
        'name': terpiez['name'] ?? 'Unknown',
        'description': terpiez['description'] ?? 'No description provided.',
        'thumbnail': terpiez['thumbnail'] ?? 'default_thumbnail.png',
        'image': terpiez['image'] ?? 'default_image.png',
        'stats': terpiez['stats'] ?? {},
      };
    } catch (e) {
      print("Error fetching Terpiez details: $e");
      return {};
    }
  }

  Future<Map<String, dynamic>> asyncfetchImageData(String imageKey) async {
    await ensureConnected();
    try {
      var response = await _command!.send_object(['JSON.GET', 'images']);
      if (response == null) {
        print("No image data found in 'images'.");
        return {};
      }
      var imageData = jsonDecode(response);

      if (!imageData.containsKey(imageKey) || imageData[imageKey] == null) {
        print("No image data found with keyImage: $imageKey");
        return {};
      }

      var base64String = imageData[imageKey];
      if (base64String == null || !(base64String is String)) {
        print("Invalid or missing base64 string for keyImage: $imageKey");
        return {};
      }
      print("Valid base64 data found for $imageKey");
      return {'imageKey': imageKey, 'image64': base64String};
    } catch (e) {
      print("Error fetching image data: $e");
      return {};
    }
  }

  // Assuming this is somewhere in your widget after fetching the image data
  Future<void> fetchAndStoreImage(String imageKey) async {
    RedisService redisService = RedisService();
    LocalStorageService storage = LocalStorageService();

    // Fetch image data
    Map<String, dynamic> imageData =
        await redisService.asyncfetchImageData(imageKey);
    if (imageData.containsKey('image64')) {
      // Decode image data
      List<int> imageBytes = base64Decode(imageData['image64']);

      // Save image to local storage
      await storage.saveImage(imageKey, imageBytes);
    }
  }
}
