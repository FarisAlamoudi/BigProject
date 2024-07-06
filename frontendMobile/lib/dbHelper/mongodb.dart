import 'dart:developer';

import 'package:reserve_smart/dbHelper/constant.dart';
import 'package:mongo_dart/mongo_dart.dart';
import 'package:reserve_smart/mongoUsers.dart';

class MongoDatabase {
  static var db, userCollection;
  static connect() async {
    db = await Db.create(MONGO_CONN_URL);
    await db.open();
    inspect(db);
    userCollection = db.collection(USER_COLLECTION);
  }

  static Future<String> insert(MongoUsers data) async {
    try {
      var result = await userCollection.insertOne(data.toJson());
      if (result.isSuccess) {
        return "Data Inserted";
      } else {
        return "Insert Failed";
      }
    } catch (e) {
      print(e.toString());
      return e.toString();
    }
  }
}
