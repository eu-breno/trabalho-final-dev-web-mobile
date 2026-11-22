import 'package:flutter/material.dart';

abstract interface class DailyReminderNotifications {
  Future<bool> requestPermission();

  Future<void> scheduleDaily({
    required TimeOfDay time,
    required int? pendingCards,
  });

  Future<void> cancel();
}
