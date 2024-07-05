import 'package:flutter/material.dart';
import 'package:reserve_smart/main.dart';

class SignUpPage extends StatelessWidget {
  const SignUpPage({Key? key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: <Widget>[
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                const SizedBox(height: 175),
                const Text(
                  'Create Your Account',
                  style: TextStyle(
                    fontSize: 45,
                    fontFamily: 'Cairo',
                    fontWeight: FontWeight.bold,
                    color: Color.fromARGB(255, 18, 58, 26),
                  ),
                ),
                const SizedBox(height: 100),
                TextField(
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'First Name',
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'Last Name',
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'Phone Number',
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'Email',
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'Password',
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 20),
                Row(
                  children: <Widget>[
                    Expanded(
                      child: SizedBox(
                        height: 50, // Adjusted height to match other fields
                        child: ElevatedButton(
                          onPressed: () {
                            // Handle sign up logic here
                          },
                          style: ElevatedButton.styleFrom(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(200.0),
                            ),
                          ),
                          child: const Text(
                            'Sign Up',
                            style: TextStyle(fontSize: 20),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextButton(
                  onPressed: () {
                    // Navigate to LoginPage
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginPage()),
                    );
                  },
                  child: const Text('Have an account? Login!'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
