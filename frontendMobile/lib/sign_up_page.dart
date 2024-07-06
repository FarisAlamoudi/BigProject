import 'package:flutter/material.dart';
import 'package:reserve_smart/main.dart';
import 'package:reserve_smart/dbHelper/mongodb.dart';
import 'package:mongo_dart/mongo_dart.dart' as M;
import 'package:reserve_smart/mongoUsers.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({Key? key}) : super(key: key);

  @override
  _SignUpPageState createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();
  var _id = M.ObjectId();

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneNumberController.dispose();
    super.dispose();
  }

  Future<void> signUp(BuildContext context) async {
    final data = MongoUsers(
        id: _id,
        firstName: _firstNameController.text,
        lastName: _lastNameController.text,
        userName: _usernameController.text,
        password: _passwordController.text,
        email: _emailController.text,
        phone: _phoneNumberController.text,
        isAdmin: false,
        emailVerified: false,
        darkMode: false,
        publicInfo: false,
        verificationToken: "");

    String user = await MongoDatabase.insert(data);
    //var user = await userCollection.insert(data);
    // var user = await userCollection.insert({
    //   'FirstName': _firstNameController.text,
    //   'LastName': _lastNameController.text,
    //   'UserName': _usernameController.text,
    //   'Password': _passwordController.text, //Hash
    //   'Email': _emailController.text,
    //   'PhoneNumber': _phoneNumberController.text,
    // });
    if (user != "Insert Failed") {
      // User added successfully, navigate to LoginPage
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const LoginPage()),
      );
    } else {
      // User not added, show error dialog
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Sign Up Error'),
            content: const Text('Invalid entry'),
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
                  controller: _firstNameController,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(
                          color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'First Name',
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _lastNameController,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(
                          color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'Last Name',
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _phoneNumberController,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(
                          color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'Phone Number',
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _usernameController,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(
                          color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'Username',
                  ),
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(
                          color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                    ),
                    labelText: 'Email',
                  ),
                  validator: (value) {
                    String pattern =
                        r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
                    RegExp regex = new RegExp(pattern);
                    if (value != null && !regex.hasMatch(value))
                      return 'Enter Valid Email';
                    else
                      return null;
                  },
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _passwordController,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(200.0),
                      borderSide: const BorderSide(
                          color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
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
                            signUp(context);
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
                      MaterialPageRoute(
                          builder: (context) => const LoginPage()),
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
