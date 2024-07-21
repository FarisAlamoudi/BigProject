import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class WeekDaysSelector extends StatefulWidget {
  final Function(DateTime) onDateSelected;
  final List<Map<String, dynamic>> reservations;

  const WeekDaysSelector({
    required this.onDateSelected,
    required this.reservations,
    Key? key,
  }) : super(key: key);

  @override
  _WeekDaysSelectorState createState() => _WeekDaysSelectorState();
}

class _WeekDaysSelectorState extends State<WeekDaysSelector> {
  DateTime currentWeekStart = DateTime.now().subtract(Duration(days: DateTime.now().weekday - 1));
  DateTime selectedDate = DateTime.now();

  String get formattedWeekRange {
    DateTime endOfWeek = currentWeekStart.add(const Duration(days: 6));
    return '${DateFormat('EEEE, MMMM d').format(currentWeekStart)} - ${DateFormat('EEEE, MMMM d').format(endOfWeek)}';
  }

  String get formattedSelectedDate {
    return DateFormat('EEEE, MMMM d').format(selectedDate);
  }

  List<String> get days {
    return List.generate(7, (index) {
      DateTime day = currentWeekStart.add(Duration(days: index));
      return DateFormat('d').format(day);
    });
  }

  void previousWeek() {
    setState(() {
      currentWeekStart = currentWeekStart.subtract(const Duration(days: 7));
      if (selectedDate.isBefore(currentWeekStart)) {
        selectedDate = currentWeekStart;
      }
    });
  }

  void nextWeek() {
    setState(() {
      currentWeekStart = currentWeekStart.add(const Duration(days: 7));
      if (selectedDate.isAfter(currentWeekStart.add(const Duration(days: 6)))) {
        selectedDate = currentWeekStart.add(const Duration(days: 6));
      }
    });
  }

  void selectDate(int dayOffset) {
    setState(() {
      selectedDate = currentWeekStart.add(Duration(days: dayOffset));
      widget.onDateSelected(selectedDate);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 25),
        Padding(
          padding: const EdgeInsets.only(left: 16.0),
          child: Text(
            formattedSelectedDate,
            style: const TextStyle(
              fontSize: 25,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 15),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: previousWeek,
            ),
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(7, (index) {
                  return GestureDetector(
                    onTap: () => selectDate(index),
                    child: Column(
                      children: [
                        Text(
                          DateFormat('E').format(currentWeekStart.add(Duration(days: index))),
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: selectedDate == currentWeekStart.add(Duration(days: index))
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: selectedDate == currentWeekStart.add(Duration(days: index))
                                ? const Color.fromARGB(255, 88, 149, 235)
                                : const Color.fromARGB(255, 18, 58, 26),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              days[index],
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: selectedDate == currentWeekStart.add(Duration(days: index))
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.arrow_forward),
              onPressed: nextWeek,
            ),
          ],
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              if (widget.reservations.isNotEmpty)
                Column(
                  children: widget.reservations.map((reservation) {
                    DateTime start = DateTime.parse(reservation["Start"].toString());
                    DateTime end = DateTime.parse(reservation["End"].toString());

                    String startTime = DateFormat('h:mm a').format(start);
                    String endTime = DateFormat('h:mm a').format(end);

                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 8.0),
                      child: ListTile(
                        title: Text('Machine ${reservation["Machine"] ?? "N/A"}'),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text('$startTime - $endTime'),
                            const SizedBox(height: 5),
                            Text('Comment: ${reservation["Comment"] ?? "No comment"}'),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                )
            ],
          ),
        ),
      ],
    );
  }
}