// In location_manager.dart
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

class LocationManager with ChangeNotifier {
  LatLng? _currentLocation;

  LatLng? get currentLocation => _currentLocation;

  void updateLocation(LatLng newLocation) {
    _currentLocation = newLocation;
    notifyListeners();
  }
}

// Global instance
final LocationManager locationManager = LocationManager();
