import 'package:flutter/material.dart';
import 'package:reserve_smart/main.dart';

class ReservePage extends StatelessWidget {
  const ReservePage({super.key});

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
                  'Make a Reservation',
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
        ],
      ),
    );
  }
}
