import 'package:flutter/material.dart';
import 'package:mobile/app_mobile/notifications/daily_reminder_notifications.dart';

class FakeDailyReminderNotifications implements DailyReminderNotifications {
  bool permissionGranted = true;
  int permissionRequests = 0;
  int cancellations = 0;
  final List<({TimeOfDay time, int? pendingCards})> schedules = [];

  @override
  Future<bool> requestPermission() async {
    permissionRequests += 1;
    return permissionGranted;
  }

  @override
  Future<void> scheduleDaily({
    required TimeOfDay time,
    required int? pendingCards,
  }) async {
    schedules.add((time: time, pendingCards: pendingCards));
  }

  @override
  Future<void> cancel() async {
    cancellations += 1;
  }
}
