import 'package:flutter/material.dart';
import 'audio.dart';
import 'user_model.dart';
import 'package:provider/provider.dart';

class SettingsPage extends StatefulWidget {
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _isAudioEnabled = AudioService.isAudioEnabled();

  void _toggleAudio(bool value) {
    setState(() {
      _isAudioEnabled = value;
      AudioService.setAudioEnabled(value);
    });
  }

  void _clearData(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Confirm Data Reset'),
          content: Text(
            'Are you sure you want to clear all data (days active, user ID, and all Terpiez caught)? This action is irreversible!',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Dismiss the dialog
              },
              child: Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Dismiss the dialog
                _resetData(); // Reset the data
              },
              child: Text('Confirm'),
            ),
          ],
        );
      },
    );
  }

  void _resetData() {
    // Access the user model using the Provider pattern
    final userModel = Provider.of<UserModel>(context, listen: false);
    userModel.resetData(); // Reset the user data
    userModel.generateNewUserId(); // Generate a new user ID
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Settings')),
      body: Column(
        children: [
          SwitchListTile(
            title: Text('Enable Sound Effects'),
            value: _isAudioEnabled,
            onChanged: _toggleAudio,
          ),
          ListTile(
            leading: Icon(Icons.delete, color: Colors.red),
            title: Text('Clear All Data'),
            onTap: () => _clearData(context),
          ),
        ],
      ),
    );
  }
}
