import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'daily_reminder_notifications.dart';
import 'local_daily_reminder_notifications.dart';

class StudyReminderSettings {
  const StudyReminderSettings({
    required this.enabled,
    required this.time,
  });

  final bool enabled;
  final TimeOfDay time;
}

class StudyReminderPreferences {
  StudyReminderPreferences({
    Future<SharedPreferences> Function()? loadPreferences,
  }) : _loadPreferences = loadPreferences ?? SharedPreferences.getInstance;

  static const enabledKey = 'memora.reminder.enabled';
  static const hourKey = 'memora.reminder.hour';
  static const minuteKey = 'memora.reminder.minute';

  final Future<SharedPreferences> Function() _loadPreferences;

  Future<StudyReminderSettings> load() async {
    final preferences = await _loadPreferences();
    final hour = preferences.getInt(hourKey) ?? 20;
    final minute = preferences.getInt(minuteKey) ?? 0;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      throw const FormatException('O horário do lembrete salvo é inválido.');
    }
    return StudyReminderSettings(
      enabled: preferences.getBool(enabledKey) ?? false,
      time: TimeOfDay(hour: hour, minute: minute),
    );
  }

  Future<void> save(StudyReminderSettings settings) async {
    final preferences = await _loadPreferences();
    final savedEnabled = await preferences.setBool(
      enabledKey,
      settings.enabled,
    );
    final savedHour = await preferences.setInt(hourKey, settings.time.hour);
    final savedMinute = await preferences.setInt(
      minuteKey,
      settings.time.minute,
    );
    if (!savedEnabled || !savedHour || !savedMinute) {
      throw StateError('Não foi possível salvar a preferência de lembrete.');
    }
  }
}

class StudyReminderController {
  StudyReminderController({
    StudyReminderPreferences? preferences,
    DailyReminderNotifications? notifications,
  }) : _preferences = preferences ?? StudyReminderPreferences(),
       _notifications =
           notifications ?? LocalDailyReminderNotifications.instance;

  final StudyReminderPreferences _preferences;
  final DailyReminderNotifications _notifications;

  Future<StudyReminderSettings> load() => _preferences.load();

  Future<bool> enable({
    required TimeOfDay time,
    required int? pendingCards,
  }) async {
    final granted = await _notifications.requestPermission();
    if (!granted) {
      await _preferences.save(
        StudyReminderSettings(enabled: false, time: time),
      );
      await _notifications.cancel();
      return false;
    }

    await _preferences.save(StudyReminderSettings(enabled: true, time: time));
    try {
      await _notifications.scheduleDaily(
        time: time,
        pendingCards: pendingCards,
      );
    } catch (_) {
      await _preferences.save(StudyReminderSettings(enabled: false, time: time));
      await _notifications.cancel();
      rethrow;
    }
    return true;
  }

  Future<void> disable({required TimeOfDay time}) async {
    await _preferences.save(StudyReminderSettings(enabled: false, time: time));
    await _notifications.cancel();
  }

  Future<void> updateTime({
    required TimeOfDay time,
    required bool enabled,
    required int? pendingCards,
  }) async {
    await _preferences.save(StudyReminderSettings(enabled: enabled, time: time));
    if (enabled) {
      try {
        await _notifications.scheduleDaily(
          time: time,
          pendingCards: pendingCards,
        );
      } catch (_) {
        await _preferences.save(
          StudyReminderSettings(enabled: false, time: time),
        );
        await _notifications.cancel();
        rethrow;
      }
    }
  }

  Future<void> refreshIfEnabled({required int pendingCards}) async {
    final settings = await _preferences.load();
    if (settings.enabled) {
      await _notifications.scheduleDaily(
        time: settings.time,
        pendingCards: pendingCards,
      );
    }
  }

  Future<void> cancelScheduled() => _notifications.cancel();
}
