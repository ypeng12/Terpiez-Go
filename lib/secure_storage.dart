import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<void> saveCredential(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  Future<String?> getCredential(String key) async {
    return await _storage.read(key: key);
  }

  Future<void> deleteCredential(String key) async {
    await _storage.delete(key: key);
  }
}
