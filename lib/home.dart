import 'stats_terpiez.dart';
import 'finder_terpiez.dart';
import 'list_terpiez.dart';
import 'main.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'user_model.dart';
import 'finder_terpiez.dart';
import 'list_terpiez.dart';
import 'settings_page.dart'; // Import the settings page

class TerpiezHomePage extends StatelessWidget {
  final UserModel userModel = UserModel();

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          foregroundColor: Colors.white,
          backgroundColor: Colors.red,
          title: Text('Terpiez'),
          centerTitle: true,
          bottom: TabBar(
            tabs: [
              Tab(icon: Icon(Icons.query_stats), text: 'Stats'),
              Tab(icon: Icon(Icons.search), text: 'Finder'),
              Tab(icon: Icon(Icons.list), text: 'List'),
            ],
            indicatorColor: Colors.white,
          ),
        ),
        drawer: Drawer(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              DrawerHeader(
                decoration: BoxDecoration(color: Colors.red),
                child: Text(
                  'Terpiez Menu',
                  style: TextStyle(color: Colors.white, fontSize: 24),
                ),
              ),
              ListTile(
                leading: Icon(Icons.settings),
                title: Text('Settings'),
                onTap: () {
                  Navigator.pop(context); // Close the drawer
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => SettingsPage()),
                  );
                },
              ),
              // Add other drawer options as needed
            ],
          ),
        ),
        body: TabBarView(
          children: [
            Consumer<UserModel>(
              builder: (context, userModel, child) {
                return StatsTerpiez(userModel: userModel);
              },
            ),
            Consumer<UserModel>(
              builder: (context, userModel, child) {
                return FinderTerpiez(userModel: userModel);
              },
            ),
            Consumer<UserModel>(
              builder: (context, userModel, child) =>
                  ListTerpiez(terpiezData: userModel.getFullTerpiezData()),
            ),
          ],
        ),
      ),
    );
  }
}
