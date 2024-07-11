import 'package:flutter/material.dart';
import 'package:reserve_smart/main.dart';
import 'package:reserve_smart/dbHelper/mongodb.dart';
import 'package:mongo_dart/mongo_dart.dart' as M;

class ReservePage extends StatefulWidget {
  final String user;
  const ReservePage({super.key, required this.user});

  @override
  _ReservePageState createState() => _ReservePageState();
}

class _ReservePageState extends State<ReservePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      userVerification(context);
    });
  }

  Future<List<Map<String, dynamic>>> userVerification(
      BuildContext context) async {
    var reserveCollection = MongoDatabase.reserveCollection;
    var userCollection = MongoDatabase.userCollection;

    //Check if provided value is an Email or Username
    bool isEmail = widget.user.contains('@');

    String username;
    if (isEmail) {
      //If it's an Email, get corresponding Username
      var userDoc = await userCollection.findOne({'Email': widget.user});
      username = userDoc['UserName'];
    } else {
      //If it's already a Username, don't do anything
      username = widget.user;
    }

    //Using MongoDB to check reservations for the user
    var reservations =
        await reserveCollection.find({'User': username}).toList();

    if (reservations.isNotEmpty) {
      //For Debug console to List UserName & rsvp ID
      for (var reservation in reservations) {
        print('Reservation ID: ${reservation["_id"]}');
        print('User: ${reservation["User"]}');
      }
      //Reservations found, Return info to display them
      return reservations;
    } else {
      //No Reservations, Return Empty list
      return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: <Widget>[
          const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                SizedBox(height: 175),
                Text(
                  'Reservations',
                  style: TextStyle(
                    fontSize: 45,
                    fontFamily: 'Cairo',
                    fontWeight: FontWeight.bold,
                    color: Color.fromARGB(255, 18, 58, 26),
                  ),
                ),
              ],
            ),
          ),
          FutureBuilder(
            //Waits for userVerification function to finish getting Reservations
            //If they exist it displays them
            future: userVerification(context),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                List<Widget> reservationWidgets = [];
                if (snapshot.data != null) {
                  for (var reservation
                      in snapshot.data as List<Map<String, dynamic>>) {
                    reservationWidgets.add(
                      Card(
                        child: ListTile(
                          title: Text('Machine: ${reservation["Machine"]}'),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Text('Start: ${reservation["Start"]}'),
                              Text('End: ${reservation["End"]}'),
                              Text('Comment: ${reservation["Comment"]}'),
                            ],
                          ),
                        ),
                      ),
                    );
                  }
                }
                return Column(children: reservationWidgets);
              }
            },
          ),
        ],
      ),
    );
  }
}
