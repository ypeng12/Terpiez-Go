import 'package:audioplayers/audioplayers.dart';

class AudioService {
  static final AudioPlayer _player = AudioPlayer();
  static bool _isAudioEnabled = true;

  // Initialize and configure the audio player instance
  static void initializePlayer() {
    // Listen for audio player state changes if required
    _player.onPlayerStateChanged.listen((state) {
      if (state == PlayerState.completed) {
        print("Audio playback completed.");
      }
    });
  }

  static void playCatchSound() {
    if (_isAudioEnabled) {
      try {
        // Ensure this path matches the declared path in pubspec.yaml
        _player.play(AssetSource('audio/notification.mp3'), volume: 1.0);
        print("Playing catch sound...");
      } catch (error) {
        print("Error playing catch sound: $error");
      }
    } else {
      print("Audio is disabled.");
    }
  }

  static void playNotificationSound() {
    if (_isAudioEnabled) {
      try {
        _player.play(AssetSource('audio/catch.mp3'));
       
      } catch (error) {
        print("Error playing notification sound: $error");
      }
    } else {
      print("Audio is disabled.");
    }
  }

  static void setAudioEnabled(bool enabled) {
    _isAudioEnabled = enabled;
  }

  static bool isAudioEnabled() => _isAudioEnabled;
}
