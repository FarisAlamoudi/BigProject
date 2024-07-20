import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:reserve_smart/dbHelper/mongodb.dart';
import 'date_selector.dart';

class ReservePage extends StatefulWidget {
  final String user;
  const ReservePage({super.key, required this.user});

  @override
  _ReservePageState createState() => _ReservePageState();
}

class _ReservePageState extends State<ReservePage> {
  DateTime selectedDate = DateTime.now();
  Future<List<Map<String, dynamic>>>? reservationFuture;
  List<Map<String, dynamic>> reservations = [];

  @override
  void initState() {
    super.initState();
    fetchReservationsForSelectedDate();
  }

  void fetchReservationsForSelectedDate() {
    setState(() {
      reservationFuture = userVerification(selectedDate);
      reservationFuture!.then((res) {
        setState(() {
          reservations = res;
        });
      });
    });
  }

  Future<List<Map<String, dynamic>>> userVerification(DateTime date) async {
    var reserveCollection = MongoDatabase.reserveCollection;
    var userCollection = MongoDatabase.userCollection;

    bool isEmail = widget.user.contains('@');
    String username;

    if (isEmail) {
      var userDoc = await userCollection.findOne({'Email': widget.user});
      if (userDoc != null) {
        username = userDoc['UserName'];
      } else {
        return [];
      }
    } else {
      username = widget.user;
    }

    DateTime startOfDay = DateTime(date.year, date.month, date.day, 0, 0, 0);
    DateTime endOfDay = DateTime(date.year, date.month, date.day, 23, 59, 59);

    var reservations = await reserveCollection.find({
      'User': username,
      'Start': {'\$gte': startOfDay, '\$lt': endOfDay}
    }).toList();

    return reservations;
  }

  @override
  Widget build(BuildContext context) {
    List<Map<String, dynamic>> sortedReservations = List.from(reservations);
    sortedReservations.sort((a, b) {
      DateTime startA =
          DateTime.tryParse(a['Start'].toString()) ?? DateTime.now();
      DateTime startB =
          DateTime.tryParse(b['Start'].toString()) ?? DateTime.now();
      return startA.compareTo(startB);
    });

    Widget buildWeekDaysSelector() {
      return WeekDaysSelector(
        onDateSelected: (date) {
          setState(() {
            selectedDate = date;
            fetchReservationsForSelectedDate();
          });
        },
        reservations: sortedReservations,
      );
    }

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(130.0),
        child: AppBar(
          backgroundColor: const Color.fromARGB(255, 18, 58, 26),
          flexibleSpace: const Center(
            child: Padding(
              padding: EdgeInsets.only(top: 25.0),
              child: Text(
                'Reservations',
                style: TextStyle(
                  fontSize: 55,
                  fontFamily: 'Cairo',
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ),
      ),
      body: ListView(
        children: [
          buildWeekDaysSelector(),
          FutureBuilder<List<Map<String, dynamic>>>(
            future: reservationFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}'));
              } else if (snapshot.hasData) {
                if (snapshot.data!.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(top: 10.0),
                          child: Image.asset(
                            'assets/SleepingBrain.png',
                            height: 275,
                          ),
                        ),
                        const SizedBox(height: 0),
                        const Text(
                          'No reservations found.',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ],
                    ),
                  );
                } else {
                  return const SizedBox.shrink();
                }
              } else {
                return const SizedBox.shrink();
              }
            },
          ),
        ],
      ),
    );
  }
}
