
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import 'package:redis/redis.dart';
import 'package:terpiez/redis_service.dart';
import 'package:uuid/uuid.dart';
import 'dart:io';
import 'package:latlong2/latlong.dart';

class UserModel with ChangeNotifier {

  int _totalTerpiezCaught = 0; // Set initial value to 0
  String? _username;
  String? _password;
  DateTime _startDate; // The real start date
  String _userId = const Uuid().v4();

  UserModel() : _startDate = DateTime.now(); // Set to the current date

  int get totalTerpiezCaught => _totalTerpiezCaught;
  DateTime get startDate => _startDate;
  String get userId => _userId;

  // Call this method to increment the caught Terpiez
  void catchTerpiez() {
    _totalTerpiezCaught++;
    notifyListeners();
  }

  void setUserCredentials(String username, String password) {
    _username = username;
    _password = password;
    // Notify listeners if you plan to use these values elsewhere in the UI
    notifyListeners();
  }

  // Call this method to reset the user's information
  void resetUser() {
    _startDate = DateTime.now();
    _userId = const Uuid().v4();
    _totalTerpiezCaught = 0;
    _caughtTerpiezLocations.clear();
    _caughtTerpiezIds.clear();
    notifyListeners();
  }

  // This method calculates the days active since the app was first opened.
  int get playingDays => DateTime.now().difference(_startDate).inDays;


  List<String> _caughtTerpiezIds = [];
  
  Set<LatLng> _caughtTerpiezLocations = Set<LatLng>();



  List<String> get caughtTerpiezIds => _caughtTerpiezIds;
  Set<LatLng> get caughtTerpiezLocations => Set.unmodifiable(_caughtTerpiezLocations);
  Set<LatLng> get caughtlatlong=> Set.unmodifiable(caughtlatlong);

  void addTerpiezId(String id) {
    
    if (!_caughtTerpiezIds.contains(id)) {
      _caughtTerpiezIds.add(id);
      print(_caughtTerpiezIds);
      
      notifyListeners();
    }
    print(_caughtTerpiezIds);
  }
  // Generates a new unique user ID
  void resetData() {
    _totalTerpiezCaught = 0;
    _startDate = DateTime.now();
    generateNewUserId(); // Call to generate a new user ID
    _caughtTerpiezIds.clear();
    _caughtTerpiezLocations.clear();
    notifyListeners(); // Notify listeners for UI update
  }

  // Generates a new unique user ID
  void generateNewUserId() {
    _userId = const Uuid().v4();
    notifyListeners(); // Notify listeners to reflect changes in the UI
  }

  void addTerpiezLocation(LatLng location) {
    _caughtTerpiezLocations.add(location);
    notifyListeners();
    print(_caughtTerpiezLocations);
  }

    List<Map<String, dynamic>> getFullTerpiezData() {
      List<Map<String, dynamic>> terpiezData = [];
      for (int i = 0; i < _caughtTerpiezIds.length; i++) {
        // Ensure there's a corresponding location for each ID
        if (_caughtTerpiezLocations.length > i) {
          LatLng location = _caughtTerpiezLocations.elementAt(i);
          terpiezData.add({
            'id': _caughtTerpiezIds[i],
            'name': "Terpiez #${_caughtTerpiezIds[i]}", // Example name
            'location': location,
          });
        }
      }
      return terpiezData;
    }
      // Getters for credentials
    String? get username => _username;
    String? get password => _password;
    
}