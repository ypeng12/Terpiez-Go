
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'home.dart';
import 'user_model.dart';

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Use ChangeNotifierProvider to provide UserModel to the widget tree
    return ChangeNotifierProvider<UserModel>(
      create: (context) => UserModel(),
      child: MaterialApp(
        title: 'Terpiez',
        theme: ThemeData(
          // Base theme colors
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.red,
            primary: Colors.red, // Primary color for the app
            onPrimary: Colors.white, // Color for text/icons on top of the primary color
          ),
          useMaterial3: true,
          // Customizing AppBar Theme
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.red, // AppBar background color
            foregroundColor: Colors.white, // AppBar text and icons color
          ),
          // Customizing TabBar theme
          tabBarTheme: const TabBarTheme(
            labelColor: Colors.white, // Color of the text and icons for selected tabs
            unselectedLabelColor: Colors.white, // Color for unselected tabs, making them slightly faded
            indicator: UnderlineTabIndicator( // Customizing the indicator below the tab
              borderSide: BorderSide(color: Colors.white),
            ),
          ),
        ),
        home: TerpiezHomePage(),
      ),
    );
  }
}