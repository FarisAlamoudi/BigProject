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
  //Create a GlobalKey for Register Form Validation
  final _formKey = GlobalKey<FormState>();

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

  //Send all inputs to MongoUsers to translate info to proper format for MongoDB
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

    //Send info to Database
    String user = await MongoDatabase.insert(data);

    //if Info didn't fail to store in Database - Go to Reservation Page
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
            content: const Text(
                'Invalid Entry or Entry Already Taken\n (Phone Number, Username, Email)'),
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
      body: Form(
        key: _formKey, //Associate GlobalKey with this Form
        child: ListView(
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
                  TextFormField(
                    controller: _firstNameController,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(200.0),
                        borderSide: const BorderSide(
                            color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                      ),
                      labelText: 'First Name',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter First Name';
                      }
                    },
                    autovalidateMode: AutovalidateMode
                        .onUserInteraction, //First Name Validation as User is typing in box
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _lastNameController,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(200.0),
                        borderSide: const BorderSide(
                            color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                      ),
                      labelText: 'Last Name',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter Last Name';
                      }
                    },
                    autovalidateMode: AutovalidateMode
                        .onUserInteraction, //Last Name Validation as User is typing in box
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _phoneNumberController,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(200.0),
                        borderSide: const BorderSide(
                            color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                      ),
                      labelText: 'Phone Number',
                    ),
                    validator: (value) {
                      //String pattern = r'(^(?:[+0]9)?[0-9]{10,12}$)'; // XXX-XXX-XXXX Format
                      String pattern = r'^\d{10}$'; //Format of any 10 Digits
                      RegExp regex = new RegExp(pattern);
                      if (value != null && !regex.hasMatch(value)) {
                        return 'Enter 10 Digit Phone Number (XXXXXXXXXX)';
                      } else {
                        return null;
                      }
                    },
                    autovalidateMode: AutovalidateMode
                        .onUserInteraction, //Email Validation as User is typing in box
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _usernameController,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(200.0),
                        borderSide: const BorderSide(
                            color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                      ),
                      labelText: 'Username',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter Username';
                      }
                    },
                    autovalidateMode: AutovalidateMode
                        .onUserInteraction, //Username Validation as User is typing in box
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
                      if (value != null && !regex.hasMatch(value)) {
                        return 'Enter Valid Email (XXX@XXX.XXX)';
                      } else {
                        return null;
                      }
                    },
                    autovalidateMode: AutovalidateMode
                        .onUserInteraction, //Email Validation as User is typing in box
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(200.0),
                        borderSide: const BorderSide(
                            color: Color.fromARGB(255, 18, 58, 26), width: 2.0),
                      ),
                      labelText: 'Password',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter Password';
                      }
                    },
                    autovalidateMode: AutovalidateMode
                        .onUserInteraction, //Password Validation as User is typing in box
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
                              //Validate the form entries before Approving Sign Up
                              if (_formKey.currentState != null &&
                                  _formKey.currentState!.validate()) {
                                //If validation passes, call the signUp function to Attempt SignUp
                                signUp(context);
                              } else {
                                //If validation fails, call setState to trigger a UI refresh keeping user on the screen
                                setState(() {
                                  //This empty setState call will trigger a rebuild of the widget,
                                });
                                print(
                                    'Please enter valid data'); //Displayed in debug console, not for User
                              }
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
                      //Navigate to LoginPage
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
      ),
    );
  }
}
