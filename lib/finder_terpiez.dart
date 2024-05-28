import 'dart:convert';
import 'audio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'package:flutter_map_location_marker/flutter_map_location_marker.dart';
import 'dart:async';
import 'redis_service.dart';
import 'user_model.dart';
import 'package:shake_event/shake_event.dart';
import 'package:sensors/sensors.dart';
import 'notification_manager.dart';


class FinderTerpiez extends StatefulWidget {
  final UserModel userModel;
  FinderTerpiez({Key? key, required this.userModel}) : super(key: key);

  @override
  _FinderTerpiezState createState() => _FinderTerpiezState();
}

class _FinderTerpiezState extends State<FinderTerpiez> with ShakeHandler {
  RedisService _redisService =
      RedisService(); // Create an instance of RedisService
  final MapController _mapController = MapController();
  StreamSubscription<Position>? _positionStreamSubscription;
  Future<Map<String, dynamic>> fetchTerpiezDetails(String id) async {
    return await _redisService.fetchTerpiezDetails(id);
  }

  LatLng _currentLocation = LatLng(38.991400, -76.935800);
  // List<LatLng> _terpiezLocations = [
  //   LatLng(38.9892, -76.9363),
  //   LatLng(38.9896, -76.9351),
  //   LatLng(38.9878, -76.9373),
  //   LatLng(38.989400, -76.936500),
  //   LatLng(38.991400, -76.935800),
  //   LatLng(38.991200, -76.935800),
  //   LatLng(38.9907, -76.9359),
  //   LatLng(38.992500, -76.939900),
  // ];
  List<LatLng> _terpiezLocations = [];
  Map<String, String> _terpiezIDs = {};

  double _closestTerpiezDistance = double.infinity;
  bool _isWithinRange = false;

  @override
  void initState() {
    super.initState();
    startListeningShake(15);
    // _fetchTerpiezLocations(); // Fetch Terpiez locations from Redis
    _startListeningToPositionUpdates();
    _determinePosition();
    fetchLocations();
    accelerometerEvents.listen((AccelerometerEvent event) {
      // Check if the absolute acceleration value exceeds 10m/s^2
      if (event.x.abs() > 10 || event.y.abs() > 10 || event.z.abs() > 10) {       
        // Device shake detected, call onShake function
        onShake();
      }
    });
  }
  void onShake() {
    if ( _closestTerpiezLocation != null && _isWithinRange == true) {
      
      _catchTerpiez(); // Call the function to "catch" the Terpiez
    } 
  }

  @override
  void dispose() {
    _positionStreamSubscription?.cancel(); // Cancel the subscription
    super.dispose();
  }

  void fetchLocations() async {
    var redisService = RedisService();
    await redisService.connect();
    var locations = await redisService.fetchTerpiezLocations();
    // await redisService.disconnect();

    var caughtLocations = context.read<UserModel>().caughtTerpiezLocations;
    // AudioService.playCatchSound();
    setState(() {
      // Filter locations to exclude those that are in the caught locations set
      _terpiezLocations = locations
          .map(
              (location) => LatLng(location['latitude'], location['longitude']))
          .where((loc) => !caughtLocations.contains(loc))
          .toList();

      _terpiezIDs = Map.fromIterable(locations,
          key: (item) => "${item['latitude']},${item['longitude']}",
          value: (item) => item['id']);
    });
  }

  void _startListeningToPositionUpdates() {
    final positionStream = Geolocator.getPositionStream();
    _positionStreamSubscription = positionStream.listen((Position position) {
      if (mounted) {
        // Check if the widget is still in the widget tree
        setState(() {
          _currentLocation = LatLng(position.latitude, position.longitude);
          _mapController.move(_currentLocation, _mapController.zoom);
          _updateClosestTerpiezDistance();
        });
      }
    });
  }

  Future<void> _determinePosition() async {
    LocationPermission permission = await Geolocator.requestPermission();
    if (permission != LocationPermission.denied &&
        permission != LocationPermission.deniedForever) {
      Position position = await Geolocator.getCurrentPosition();
      if (mounted) {
        // Again, check if the widget is still mounted
        setState(() {
          _currentLocation = LatLng(position.latitude, position.longitude);
          _updateClosestTerpiezDistance();
          _mapController.move(_currentLocation, 5);
        });
      }
    }
  }

  List<Marker> _createTerpiezMarkers() {
    UserModel userModel = Provider.of<UserModel>(context, listen: false);
    Set<LatLng> caughtLocations = userModel.caughtTerpiezLocations;

    return _terpiezLocations
        .where((loc) => !caughtLocations.contains(loc))
        .map((location) {
      return Marker(
        width: 10.0,
        height: 10.0,
        point: location,
        child: Container(
          child: Icon(Icons.location_on, color: Colors.black, size: 15.0),
        ),
      );
    }).toList();
  }

  LatLng? _closestTerpiezLocation;

  void _updateClosestTerpiezDistance() {
    double closestDistance = double.infinity;
    LatLng? closestLocation;

    for (var terpiezLocation in _terpiezLocations) {
      double distance = Geolocator.distanceBetween(
        _currentLocation.latitude,
        _currentLocation.longitude,
        terpiezLocation.latitude,
        terpiezLocation.longitude,
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestLocation = terpiezLocation;
      }
    }

    setState(() {
      _closestTerpiezDistance = closestDistance;
      _closestTerpiezLocation = closestLocation;
      _isWithinRange =
      _closestTerpiezDistance <= 10; // Terpiez is within 10 meters
      if (_closestTerpiezDistance <= 20){
        AudioService.playCatchSound();
        NotificationManager.showTerpiezNotification(
        '$_closestTerpiezDistance meters',
      );
      }
      if (_isWithinRange) {
        _showInRangeNotification();
      }
    });
  }

  void _showInRangeNotification() {
    AudioService.playNotificationSound();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text("A Terpiez is nearby!"),
      duration: Duration(seconds: 2),
    ));
  }



  void _catchTerpiez() {
  if (_closestTerpiezLocation != null && _isWithinRange) {

    AudioService.playCatchSound();  // Play the catch sound

    print('Caught a Terpiez!');
    String locationKey =
        "${_closestTerpiezLocation?.latitude},${_closestTerpiezLocation?.longitude}";
    String? closestTerpiezId = _terpiezIDs[locationKey];

    if (closestTerpiezId != null) {
      fetchTerpiezDetails(closestTerpiezId).then((details) {
        if (details.isNotEmpty) {
          _redisService.asyncfetchImageData(details['image']).then((imageData) {
            showDialog(
              context: context,
              builder: (context) {
                return AlertDialog(
                  title: Text(details['name'] ?? 'Terpiez'),
                  content: SingleChildScrollView(
                    child: ListBody(
                      children: <Widget>[
                        if (imageData.isNotEmpty)
                          Image.memory(base64Decode(imageData['image64'])),
                        Text('You caught a Terpiez.'),
                      ],
                    ),
                  ),
                  actions: <Widget>[
                    TextButton(
                      child: Text('Dismiss'),
                      onPressed: () {
                        Navigator.of(context).pop();
                        Navigator.of(context).pushNamed('/list_terpiez'); 
                      },
                    ),
                  ],
                );
              },
            );

            // Updating the UserModel
            widget.userModel.addTerpiezId(closestTerpiezId);
            widget.userModel.catchTerpiez();
            widget.userModel.addTerpiezLocation(_closestTerpiezLocation!);
            print("Details of the caught Terpiez: $details");

          }).catchError((error) {
            print("Failed to load image: $error");
          });
        }
      });
    }

    setState(() {
      _isWithinRange = false;
    });
  } else {
    print("No Terpiez is within catching range!");
  }
}


  @override
  Widget build(BuildContext context) {
    // _isWithinRange = _closestTerpiezDistance <= 10;

    Widget _closestTerpiezContainer() {
      return Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9), // Adjust opacity as needed
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(12),
            topRight: Radius.circular(12),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment:
              CrossAxisAlignment.center, // Center the column items
          children: [
            Text(
              'Closest Terpiez:',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 24.0,
              ),
            ),
            SizedBox(height: 8.0), // Space between text lines
            Text(
              '${_closestTerpiezDistance != null ? _closestTerpiezDistance.toStringAsFixed(1) : "<undefined>"}m',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 24.0,
              ),
            ),
            SizedBox(height: 10.0), // Space between text and button
            FloatingActionButton.extended(
              onPressed: _isWithinRange ? _catchTerpiez : null,
              label: Text('Catch it!'),
              icon: Icon(Icons.catching_pokemon),
              backgroundColor: _isWithinRange ? Colors.red : Colors.grey,
            ),
          ],
        ),
      );
    }


    // function

    // button ( click box insede button) - ( available to see) - other

    // - click box - button - other

    Widget _buildMapBox() {
      return ClipRRect(
        borderRadius: BorderRadius.circular(20.0), // Rounded corners
        child: Container(
          height: 300.0, // Fixed height for the map box
          margin: const EdgeInsets.all(12.0), // Margin around the map
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey), // Border color
            borderRadius: BorderRadius.circular(20.0), // Rounded corners
          ),
          child: FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              center: _currentLocation,
              zoom: 18,
              minZoom: 18,
              maxZoom: 22,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                subdomains: ['a', 'b', 'c'],
                userAgentPackageName:
                    'net.tlserver6y.flutter_map_location_marker.example',
                maxZoom: 18,
              ),
              MarkerLayer(
                markers:
                    _createTerpiezMarkers(), // Add this line to include the markers
              ),

              CurrentLocationLayer(
                style: LocationMarkerStyle(
                  marker: const DefaultLocationMarker(
                    color: Colors.green,
                  ),
                  markerSize: const Size.square(20),
                  accuracyCircleColor: Colors.green.withOpacity(0.1),
                  headingSectorColor: Colors.green.withOpacity(0.8),
                  headingSectorRadius: 120,
                ),
                moveAnimationDuration: Duration.zero, // disable animation
              ),
              // Other layers such as MarkerLayerWidget can be added here
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Terpiez Finder'),
      ),
      body: Column(
        // Using a Column to lay out the map box and the bottom container
        children: [
          _buildMapBox(), // Map box with a defined height
          Expanded(
            child: Padding(
              // Padding widget to create space between the map box and the bottom container
              padding: const EdgeInsets.only(
                bottom:
                    80.0, // Adjust the bottom padding to create the desired space
              ),
              child: Align(
                alignment: Alignment.bottomCenter,
                child: _closestTerpiezContainer(), // Bottom container
              ),
            ),
          ),
        ],
      ),
    );
  }
}
