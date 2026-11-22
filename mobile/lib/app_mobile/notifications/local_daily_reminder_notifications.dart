import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:timezone/data/latest.dart' as timezone_data;
import 'package:timezone/timezone.dart' as timezone;

import 'daily_reminder_notifications.dart';

class LocalDailyReminderNotifications implements DailyReminderNotifications {
  LocalDailyReminderNotifications._();

  static final instance = LocalDailyReminderNotifications._();

  static const _notificationId = 7026;
  static const _channelId = 'study_card_daily_reminder';
  static const _channelName = 'Lembretes de estudo';

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();
  Future<void>? _initialization;

  Future<void> _ensureInitialized() async {
    final pending = _initialization ??= _initialize();
    try {
      await pending;
    } catch (_) {
      _initialization = null;
      rethrow;
    }
  }

  Future<void> _initialize() async {
    timezone_data.initializeTimeZones();
    final localTimezone = await FlutterTimezone.getLocalTimezone();
    timezone.setLocalLocation(timezone.getLocation(localTimezone.identifier));

    await _plugin.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(
          requestAlertPermission: false,
          requestBadgePermission: false,
          requestSoundPermission: false,
        ),
      ),
    );
  }

  @override
  Future<bool> requestPermission() async {
    await _ensureInitialized();
    final android = _plugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >();
    if (android != null) {
      final permission = await android.requestNotificationsPermission();
      if (permission != null) return permission;
      final enabled = await android.areNotificationsEnabled();
      if (enabled == null) {
        throw StateError(
          'Não foi possível consultar a permissão de notificações.',
        );
      }
      return enabled;
    }

    final ios = _plugin
        .resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin
        >();
    if (ios != null) {
      final permission = await ios.requestPermissions(alert: true, sound: true);
      if (permission == null) {
        throw StateError(
          'Não foi possível consultar a permissão de notificações.',
        );
      }
      return permission;
    }
    throw UnsupportedError(
      'Lembretes locais estão disponíveis apenas no Android e iOS.',
    );
  }

  @override
  Future<void> scheduleDaily({
    required TimeOfDay time,
    required int? pendingCards,
  }) async {
    await _ensureInitialized();
    final now = timezone.TZDateTime.now(timezone.local);
    var scheduledDate = timezone.TZDateTime(
      timezone.local,
      now.year,
      now.month,
      now.day,
      time.hour,
      time.minute,
    );
    if (!scheduledDate.isAfter(now)) {
      scheduledDate = timezone.TZDateTime(
        timezone.local,
        now.year,
        now.month,
        now.day + 1,
        time.hour,
        time.minute,
      );
    }

    final body = switch (pendingCards) {
      null => 'Volte ao Memora para conferir seus cartões pendentes.',
      0 => 'Você tem 0 cartões pendentes. Abra o Memora para estudar.',
      1 => 'Você tem 1 cartão pendente. Que tal revisar agora?',
      final count => 'Você tem $count cartões pendentes. Que tal revisar?',
    };

    await _plugin.zonedSchedule(
      id: _notificationId,
      title: 'Hora de revisar',
      body: body,
      scheduledDate: scheduledDate,
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          _channelId,
          _channelName,
          channelDescription: 'Lembretes diários para revisar cartões.',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
        ),
        iOS: DarwinNotificationDetails(),
      ),
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  @override
  Future<void> cancel() async {
    await _ensureInitialized();
    await _plugin.cancel(id: _notificationId);
  }
}
