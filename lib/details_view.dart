import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io';
import 'dart:convert'; // Import for base64Decode
import 'local_image.dart'; // Local storage handling
import 'redis_service.dart'; // Redis operations handling
import 'background_pain.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'main.dart';
import 'package:flutter_map_location_marker/flutter_map_location_marker.dart';
import 'user_model.dart';

class DetailView extends StatefulWidget {
  final String terpiezType;
  final IconData icon;
  final Map<String, dynamic> terpiezDetail;

  const DetailView({
    Key? key,
    required this.terpiezType,
    required this.icon,
    required this.terpiezDetail,
  }) : super(key: key);

  @override
  _DetailViewState createState() => _DetailViewState();
}

class _DetailViewState extends State<DetailView> with SingleTickerProviderStateMixin {
  static Map<String, LatLng> _terpiezLocations = {}; 
  late LatLng _currentLocation;

  late AnimationController _controller;
  final MapController _mapController = MapController();
  @override
  void initState() {

    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..repeat();
    _initializeLocation();

  }
  void _initializeLocation() {
    // Check if a location is already stored for this terpiez type
    if (_terpiezLocations.containsKey(widget.terpiezType)) {
      _currentLocation = _terpiezLocations[widget.terpiezType]!;
    } else {
      // Fetch the current location from userModel
      UserModel userModel = Provider.of<UserModel>(context, listen: false);
      _currentLocation = userModel.caughtTerpiezLocations.isNotEmpty
                        ? userModel.caughtTerpiezLocations.last
                        : LatLng(0, 0);  // Use LatLng(0, 0) if no location is caught

      // Store this location in the static map
      _terpiezLocations[widget.terpiezType] = _currentLocation;
    }
  }
  @override
  void dispose() {
    _controller.dispose();
    _mapController.dispose();
    super.dispose();
  }


  @override
  Widget build(BuildContext context) {
    final userModel = Provider.of<UserModel>(context, listen: false);
    final RedisService redisService = RedisService();
    final LocalStorageService localStorage = LocalStorageService();
    //LatLng center = widget.locations.isNotEmpty ? widget.locations.first : LatLng(0, 0); // Default or first location

        // Find the corresponding location
    LatLng location = userModel.caughtTerpiezLocations.isNotEmpty 
                            ? userModel.caughtTerpiezLocations.last
                            : LatLng(0, 0); // Default to (0, 0) if no location is caught

    
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.terpiezType),
        backgroundColor: Colors.red,
        foregroundColor: Colors.white,
      ),
      body: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
                return CustomPaint(
                  painter: BackgroundPainter(_controller.value),
                  child: child,
                );
              },
        
        child: SingleChildScrollView(
          padding: EdgeInsets.all(16),

          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Hero(
              tag: 'hero-${widget.terpiezDetail['image']}',
              child: FutureBuilder<File?>(
                future: localStorage.getImageFile(widget.terpiezDetail['image']),
                builder: (context, fileSnapshot) {
                  if (fileSnapshot.connectionState == ConnectionState.waiting) {
                    return CircularProgressIndicator();
                  } else if (fileSnapshot.hasData && fileSnapshot.data != null) {
                    return Image.file(fileSnapshot.data!, width: double.infinity, fit: BoxFit.cover);
                  } else {
                    // If image is not available locally, fetch from network, save, and display
                    return FutureBuilder<Map<String, dynamic>>(
                      future: redisService.asyncfetchImageData(widget.terpiezDetail['image']),
                      builder: (context, imageSnapshot) {
                        if (imageSnapshot.connectionState == ConnectionState.waiting) {
                          return CircularProgressIndicator();
                        } else if (imageSnapshot.hasError) {
                          return Text("Error downloading image: ${imageSnapshot.error}");
                        } else if (imageSnapshot.hasData) {
                          var imageData = imageSnapshot.data!;
                          var imageBytes = base64Decode(imageData['image64']);
                          localStorage.saveImage(widget.terpiezDetail['image'], imageBytes);
                          return Image.memory(imageBytes, width: double.infinity, fit: BoxFit.cover);
                        } else {
                          return Text("No image available.");
                        }
                      },
                    );
                  }
                },
              ),
            ),
            SizedBox(height: 20),
            Text(
              widget.terpiezType,
              style: TextStyle(fontSize: 24),
            ),
            SizedBox(height: 20),

            

            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [


                  // Expanded(
                  //   flex: 3, // Adjust the flex to give more space to the map
                  //   child: Container(
                  //     height: 200,
                  //     decoration: BoxDecoration(
                  //       color: Colors.grey[300],
                  //       borderRadius: BorderRadius.circular(12),
                  //     ),
                  //     child: Center(child: Text("Location: ${location.latitude}, ${location.longitude}"),),
                  //   ),
                  // ),

                  _buildLocationMap(location),

                  Expanded(
                    flex: 2, // Adjust the flex to give less space to the stats
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Text(
                          'Stats:',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        ...((widget.terpiezDetail['stats'] as Map<String, dynamic>).entries.map(
                          (entry) => Text('${entry.key}: ${entry.value}', style: TextStyle(fontSize: 16)),
                        )),
                      ],
                    ),
                  ),
                ],
              ),
            )
,
            SizedBox(height: 20),
            Text(
              widget.terpiezDetail['description'] as String? ?? 'No description available',
              style: TextStyle(fontSize: 18),
            ),
          ],
          )
        ),
      ),
    );
  }

    Widget _buildLocationMap(LatLng location) {
    return Expanded(
      flex: 3,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Container(
          height: 200,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(12),
          ),
          child: FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              center: location,
              zoom: 18,
              minZoom: 18,
              maxZoom: 22,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                subdomains: ['a', 'b', 'c'],
                userAgentPackageName: 'net.tlserver6y.flutter_map_location_marker.example',
                maxZoom: 18,
              ),
            MarkerLayer(markers: [
                Marker(
                  width: 10.0,
                  height: 10.0,
                  point: location,
                  child: Container(
                    child: Icon(Icons.location_on, color: Colors.black, size: 15.0),
                  ),
                ),
              ]), 
            ],
          ),
        ),
      ),
    );
  }
}
