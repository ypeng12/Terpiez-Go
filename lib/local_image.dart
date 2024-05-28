import 'dart:io';
import 'dart:convert';
import 'package:path_provider/path_provider.dart';

class LocalStorageService {

  Future<String> get _localImagesPath async {
    final directory = await getApplicationDocumentsDirectory();
    final imagePath = Directory('${directory.path}');
    if (!await imagePath.exists()) {
      await imagePath.create(recursive: true); // Only create the directory if it doesn't exist.
    }
    print("Image path: ${imagePath.path}");  // Log the path
    return imagePath.path;
  }

  Future<File> _localFile(String filename) async {
    final path = await _localImagesPath;
    return File('$path/$filename');
  }

  Future<File> saveImage(String filename, List<int> bytes) async {
    final file = await _localFile(filename);
    await file.writeAsBytes(bytes);
    bool exists = await file.exists();
    print("File exists after save: $exists at ${file.path}");  // Debugging statement
    return file;
  }

  Future<File?> getImageFile(String filename) async {
    final file = await _localFile(filename);
    bool exists = await file.exists();
    if (exists) {
      return file;
    }
    return null; // Return null if the image doesn't exist.
  }
  // Read image data from a local file
  Future<String?> readImage(String filename) async {
    try {
      final file = await _localFile(filename);
      final bytes = await file.readAsBytes();
      // Convert bytes back to base64 string to use with Image.memory
      return base64Encode(bytes);
    } catch (e) {
      // If encountering an issue, return null or handle appropriately
      print('Error reading image: $e');
      return null;
    }
  }

  Future<String> getFilePath(String filename) async {
    final file = await _localFile(filename);
    return file.path;
  }
}
