import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:terpiez/auth.dart';
import 'package:terpiez/redis_service.dart';
import 'package:terpiez/user_model.dart';

class LoginScreen extends StatelessWidget {
  // Initialize the controllers with default values for username and password
  final TextEditingController _usernameController = TextEditingController(text: 'ypeng12');
  final TextEditingController _passwordController = TextEditingController(text: '9f86777910fc46778fc2b9097b4a0650');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Login")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _usernameController,
              decoration: InputDecoration(labelText: 'Username'),
            ),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            ElevatedButton(
              onPressed: () async {
                  Provider.of<UserModel>(context, listen: false).setUserCredentials(
                    _usernameController.text,
                    _passwordController.text,
                  );





                  RedisService redisService = Provider.of<RedisService>(context, listen: false);
                  await redisService.printUser(_usernameController.text, _passwordController.text);
                  
                  
                  // Proceed to home page without validating Redis connection
                  Navigator.pushReplacementNamed(context, '/home');
                },
            
              child: Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}
