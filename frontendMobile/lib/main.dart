import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:reserve_smart/forgot_password.dart';
import 'package:reserve_smart/reserve.dart';
import 'package:reserve_smart/sign_up_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    print('Building ForgotPasswordPage');
    return MaterialApp(
      title: '4331Booking',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color.fromARGB(255, 31, 41, 55),
          primary: Colors.black,
        ),
        //scaffoldBackgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          //backgroundColor: Colors.white,
          foregroundColor: Color.fromARGB(255, 31, 41, 55),
        ),
        inputDecorationTheme: InputDecorationTheme(
          labelStyle: const TextStyle(
            color: Color.fromARGB(255, 31, 41, 55),
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(200.0),
            borderSide: const BorderSide(
                color: Color.fromARGB(255, 31, 41, 55), width: 2.0),
          ),
        ),
      ),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> loginVerification(BuildContext context) async {
    const String loginUrl = 'https://4331booking.com/api/auth/login';

    final String identifier = _emailController.text;
    final String password = _passwordController.text;

    final Map<String, String> loginData = {
      'identifier': identifier,
      'password': password,
    };

    try {
      final response = await http.post(
        Uri.parse(loginUrl),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(loginData),
      );

      if (response.statusCode == 200) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ReservePage(
              user: identifier,
            ),
          ),
        );
      } else {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              title: const Text('Invalid Credentials'),
              content: Text(jsonResponse['message'] ?? 'Incorrect Entry'),
              actions: <Widget>[
                TextButton(
                  child: const Text('OK'),
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                ),
              ],
            );
          },
        );
      }
    } catch (e) {
      print(e.toString());
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Login Error'),
            content: const Text(
                'Failed to connect to the server. Please try again later.'),
            actions: <Widget>[
              TextButton(
                child: const Text('OK'),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              alignment: Alignment.center,
              padding: const EdgeInsets.all(16.0),
              child: Image.asset(
                'assets/TheLogo.png',
                height: 350,
                width: 450,
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  SizedBox(
                    height: 60,
                    child: TextField(
                      controller: _emailController,
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(
                            vertical: 15.0, horizontal: 15),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(200.0),
                          borderSide: const BorderSide(
                              color: Color.fromARGB(255, 31, 41, 55),
                              width: 2.0),
                        ),
                        labelText: 'Email or Username',
                      ),
                    ),
                  ),
                  const SizedBox(height: 20), // Adjust spacing here
                  SizedBox(
                    height: 50,
                    child: TextField(
                      controller: _passwordController,
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(
                            vertical: 15.0, horizontal: 15),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(200.0),
                        ),
                        labelText: 'Password',
                      ),
                      obscureText: true,
                    ),
                  ),
                  const SizedBox(height: 30),
                  SizedBox(
                    height: 45,
                    child: ElevatedButton(
                      onPressed: () {
                        loginVerification(context);
                      },
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(200.0),
                        ),
                        backgroundColor: const Color.fromARGB(255, 31, 41, 55),
                      ),
                      child: const Text(
                        'Login',
                        style: TextStyle(fontSize: 20, color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => ForgotPasswordPage()),
                      );
                    },
                    style: TextButton.styleFrom(
                      foregroundColor: const Color.fromARGB(255, 31, 41, 55),
                    ),
                    child: const Text(
                      "Forget your password?",
                      style: TextStyle(color: Color.fromARGB(255, 31, 41, 55)),
                    ),
                  ),

                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const SignUpPage()),
                      );
                    },
                    child: const Text(
                      'Don\'t have an account? Sign Up!',
                      style: TextStyle(
                        color: Color.fromARGB(255, 31, 41, 55),
                        fontSize: 15, // Adjust the font size here
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
