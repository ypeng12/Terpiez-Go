import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:convert'; // For base64Decode
import 'details_view.dart';
import 'local_image.dart';
import 'redis_service.dart';
import 'user_model.dart';

class ListTerpiez extends StatefulWidget {
  const ListTerpiez({Key? key, required List<Map<String, dynamic>> terpiezData}) : super(key: key);

  @override
  _ListTerpiezState createState() => _ListTerpiezState();
}

class _ListTerpiezState extends State<ListTerpiez> {
  final RedisService redisService = RedisService();
  final LocalStorageService storageService = LocalStorageService();

  @override
  Widget build(BuildContext context) {
    final userModel = Provider.of<UserModel>(context, listen: false);

    return FutureBuilder<List<Map<String, dynamic>>>(
      future: fetchAllTerpiez(userModel), // Fetch all the relevant Terpiez details
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text("Error: ${snapshot.error}"));
        } else if (snapshot.hasData) {
          var terpiezList = snapshot.data!;
          return ListView.builder(
            itemCount: terpiezList.length,
            itemBuilder: (context, index) {
              var terpiezDetail = terpiezList[index];
              return FutureBuilder<File?>(
                future: storageService.getImageFile(terpiezDetail['thumbnail']),
                builder: (context, localImageSnapshot) {
                  if (localImageSnapshot.connectionState == ConnectionState.waiting) {
                    return ListTile(
                      title: Text("Checking local image..."),
                      leading: CircularProgressIndicator(),
                    );
                  } else if (localImageSnapshot.hasData) {
                    return ListTile(
                      leading: Hero(
                        tag: 'hero-${terpiezDetail['thumbnail']}',
                        child: Image.file(localImageSnapshot.data!, width: 50, height: 50),
                      ),
                      title: Text(terpiezDetail['name']),
                      onTap: () => _navigateToDetail(context, terpiezDetail),
                    );
                  } else {
                    return FutureBuilder<Map<String, dynamic>>(
                      future: redisService.asyncfetchImageData(terpiezDetail['thumbnail']),
                      builder: (context, imageSnapshot) {
                        if (imageSnapshot.connectionState == ConnectionState.waiting) {
                          return ListTile(
                            title: Text("Loading image..."),
                            leading: CircularProgressIndicator(),
                          );
                        } else if (imageSnapshot.hasError) {
                          return ListTile(
                            title: Text("Error loading image: ${imageSnapshot.error}"),
                          );
                        } else if (imageSnapshot.hasData) {
                          var imageData = imageSnapshot.data!;
                          var imageBytes = base64Decode(imageData['image64']);
                          return ListTile(
                            leading: Hero(
                              tag: 'hero-${terpiezDetail['thumbnail']}',
                              child: Image.memory(imageBytes, width: 50, height: 50),
                            ),
                            title: Text(terpiezDetail['name']),
                            onTap: () => _navigateToDetail(context, terpiezDetail),
                          );
                        } else {
                          return ListTile(
                            title: Text("No image available."),
                          );
                        }
                      },
                    );
                  }
                },
              );
            },
          );
        } else {
          return Center(child: Text("No Terpiez data available."));
        }
      },
    );
  }

  Future<List<Map<String, dynamic>>> fetchAllTerpiez(UserModel userModel) async {
    List<Map<String, dynamic>> terpiezList = [];

    for (var terpiezId in userModel.caughtTerpiezIds) {
      var terpiezDetail = await redisService.fetchTerpiezDetails(terpiezId);
      if (terpiezDetail.isNotEmpty) {
        terpiezList.add(terpiezDetail);
      }
    }

    return terpiezList;
  }

  void _navigateToDetail(BuildContext context, Map<String, dynamic> terpiez) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => DetailView(
          terpiezType: terpiez['name'],
          icon: Icons.image, // Placeholder for now
          terpiezDetail: terpiez,
        ),
      ),
    );
  }
}
