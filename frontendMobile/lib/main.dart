import 'package:flutter/material.dart';
import 'package:reserve_smart/dbHelper/mongodb.dart';
import 'package:reserve_smart/reserve.dart';
import 'sign_up_page.dart'; // Import the SignUpPage

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await MongoDatabase.connect();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
   Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReserveSmart',
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.white,
        primaryColor: const Color.fromARGB(255, 18, 58, 26),
        colorScheme: ColorScheme.fromSwatch().copyWith(
          primary: const Color.fromARGB(255, 18, 58, 26),
          secondary: const Color.fromARGB(255, 18, 58, 26),
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
    var userCollection = MongoDatabase.userCollection;
    //Using MongoDB Package 'Or' operator to check Email or Username with Password
    var user = await userCollection.findOne({
      '\$or': [
        {'Email': _emailController.text, 'Password': _passwordController.text},
        {
          'UserName': _emailController.text,
          'Password': _passwordController.text
        }
      ]
    });
    if (user != null) {
      //User found, proceed with login
      Navigator.push(
        context,
        MaterialPageRoute(
            builder: (context) => ReservePage(
                user: _emailController.text)), //Pass User/Email to Reserve Page
      );
    } else {
      //User not found, show error message
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Login Error'),
            content: const Text('Invalid Email/Username or Password'),
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
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              alignment: Alignment.center,
              padding: const EdgeInsets.all(40.0),
              child: Column(
                children: [
                  Image.asset(
                    'assets/Logo2.png',
                    height: 350,
                    width: 350,
                  ),
                  const SizedBox(height: 20),
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
            const SizedBox(height: 0),
            Padding(
              padding: const EdgeInsets.all(16.0),
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
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(200.0),
                          borderSide: const BorderSide(
                            color: Color.fromARGB(255, 18, 58, 26),
                            width: 2.0,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(200.0),
                          borderSide: const BorderSide(
                            color: Color.fromARGB(255, 18, 58, 26),
                            width: 2.0,
                          ),
                        ),
                        labelText: 'Email or Username',
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  SizedBox(
                    height: 50,
                    child: TextField(
                      controller: _passwordController,
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(
                            vertical: 15.0, horizontal: 15),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(200.0),
                          borderSide: const BorderSide(
                            color: Color.fromARGB(255, 18, 58, 26),
                            width: 2.0,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(200.0),
                          borderSide: const BorderSide(
                            color: Color.fromARGB(255, 18, 58, 26),
                            width: 2.0,
                          ),
                        ),
                        labelText: 'Password',
                      ),
                      obscureText: true,
                    ),
                  ),
                  const SizedBox(height: 40),
                  SizedBox(
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () {
                        //Verify Login Credentials
                        loginVerification(context);
                      },
                      style: ElevatedButton.styleFrom(
                        foregroundColor: Colors.white, backgroundColor: const Color.fromARGB(255,18,58,26),
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
      ),
    );
  }
}
