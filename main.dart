import 'package:flutter/material.dart';
import 'sign_up_page.dart'; // Import the SignUpPage

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReserveSmart',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSwatch(
          primarySwatch: Colors.brown, 
        ).copyWith(
          primary: const Color.fromARGB(255, 18, 58, 26),
        ),
      ),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            alignment: Alignment.center,
            padding: const EdgeInsets.all(0.0),
            child: Column(
              children: [
                Image.asset(
                  'assets/Logo2.png',
                  height: 300,
                  width: 300,
                ),
                const SizedBox(height: 0),
                const Text(
                  'Welcome to ReserveSmart!',
                  style: TextStyle(
                    fontSize: 35,
                    fontFamily: 'Cairo',
                    fontWeight: FontWeight.bold,
                    color: Color.fromARGB(255, 18, 58, 26),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 45), 
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                SizedBox(
                  height: 60,
                  child: TextField(
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(vertical: 15.0, horizontal: 15), 
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(200.0),
                        borderSide: const BorderSide(color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                      ),
                      labelText: 'Email',
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 50, 
                  child: TextField(
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(vertical: 15.0, horizontal: 15), 
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(200.0),
                      ),
                      labelText: 'Password',
                    ),
                    obscureText: true,
                  ),
                ),
                const SizedBox(height: 25), 
                SizedBox(
                  height: 45,
                  child: ElevatedButton(
                    onPressed: () {
                      // Handle login login logic here
                    },
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(200.0),
                      ),
                    ),
                    child: const Text(
                      'Login',
                      style: TextStyle(fontSize: 20),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                TextButton(
                  onPressed: () {
                    // Handle forget password logic here
                  },
                  child: const Text("Forget your password?"),
                ),
              ],
            ),
          ),
          const SizedBox(height: 0), 
          TextButton(
            onPressed: () {
              // Navigates to SignUpPage
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SignUpPage()),
              );
            },
            child: const Text("Don't have an account? Sign Up!"),
          ),
        ],
      ),
    );
  }
}
