import 'package:flutter/material.dart';
import 'package:http/http.dart' as http; 
import 'package:reserve_smart/dbHelper/mongodb.dart'; 
import 'package:intl/intl.dart'; 
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
      reservationFuture = fetchReservations(selectedDate);
      reservationFuture!.then((res) {
        setState(() {
          reservations = res;
        });
      }).catchError((error) {
        print('Error fetching reservations: $error');
      });
    });
  }

  Future<List<Map<String, dynamic>>> fetchReservations(DateTime date) async {
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

  Future<void> signOut() async {
    try {
      final response = await http.get(
        Uri.parse('https://4331booking.com//api/auth/logout'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        // ignore: use_build_context_synchronously
        Navigator.pushReplacementNamed(context, '/login'); 
        // ignore: use_build_context_synchronously
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Successfully logged out'),
            backgroundColor: Colors.green,
          ),
          
        );
      } else {
        // ignore: use_build_context_synchronously
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error  out')),
        );
      }
    } catch (e) {
      print('Error during sign out: $e');
      // ignore: use_build_context_synchronously
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error logging out')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    List<Map<String, dynamic>> sortedReservations = List.from(reservations);
    sortedReservations.sort((a, b) {
      DateTime startA = DateTime.tryParse(a['Start'].toString()) ?? DateTime.now();
      DateTime startB = DateTime.tryParse(b['Start'].toString()) ?? DateTime.now();
      return startA.compareTo(startB);
    });

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(175.0),
        child: AppBar(
          automaticallyImplyLeading: false,
          backgroundColor: const Color.fromARGB(255, 31, 41, 55),
          flexibleSpace: Padding(
            padding: const EdgeInsets.only(top: 80.0, left: 75.0, right: 10.0), 
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Reservations',
                  style: TextStyle(
                    fontSize: 55,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    signOut();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 31, 41, 55),
                  ),
                  child: const Text(
                    'Sign Out',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white, 
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          WeekDaysSelector(
            onDateSelected: (date) {
              setState(() {
                selectedDate = date;
                fetchReservationsForSelectedDate();
              });
            },
            reservations: sortedReservations,
          ),
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
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
                            padding: const EdgeInsets.only(top: 125.0),
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
                    return ListView.builder(
                      itemCount: snapshot.data!.length,
                      itemBuilder: (context, index) {
                        final reservation = snapshot.data![index];
                        DateTime start = DateTime.parse(reservation['Start'].toString());
                        DateTime end = DateTime.parse(reservation['End'].toString());

                        String startTime = DateFormat('h:mm a').format(start);
                        String endTime = DateFormat('h:mm a').format(end);

                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 8.0),
                          child: ListTile(
                            title: Text.rich(
                              TextSpan(
                                text: '${reservation["Machine"] ?? "N/A"} Reservation\n',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                                children: [
                                  TextSpan(
                                    text: 'From $startTime to $endTime',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.normal,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  }
                } else {
                  return const SizedBox.shrink();
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}
