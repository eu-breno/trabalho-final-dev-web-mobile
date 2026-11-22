import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mobile/app_mobile/app_login/session_store.dart';
import 'package:mobile/app_mobile/auth/dashboard/account_settings_dialog.dart';
import 'package:mobile/app_mobile/notifications/study_reminder.dart';
import 'support/fake_daily_reminder_notifications.dart';

void main() {
  test('persists reminder activation and selected time', () async {
    SharedPreferences.setMockInitialValues({});
    final preferences = StudyReminderPreferences();

    await preferences.save(
      const StudyReminderSettings(
        enabled: true,
        time: TimeOfDay(hour: 7, minute: 45),
      ),
    );

    final settings = await preferences.load();
    expect(settings.enabled, isTrue);
    expect(settings.time, const TimeOfDay(hour: 7, minute: 45));
  });

  test(
    'cancels the scheduled notification when the session is cleared',
    () async {
      SharedPreferences.setMockInitialValues({
        SessionStore.accessTokenKey: 'token-de-teste',
      });
      final notifications = FakeDailyReminderNotifications();
      final controller = StudyReminderController(notifications: notifications);

      await SessionStore(
        reminderController: controller,
      ).clearAccessToken();

      expect(notifications.cancellations, 1);
      expect(await SessionStore().readAccessToken(), isNull);
    },
  );

  testWidgets('permission denial leaves the reminder disabled', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final notifications = FakeDailyReminderNotifications()
      ..permissionGranted = false;
    final controller = StudyReminderController(notifications: notifications);

    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: TextButton(
              onPressed: () => showDialog<void>(
                context: context,
                builder: (_) => AccountSettingsDialog(
                  accessToken: 'token-de-teste',
                  name: 'Ana',
                  email: 'ana@example.com',
                  reminderController: controller,
                ),
              ),
              child: const Text('Abrir configurações'),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('Abrir configurações'));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('daily-reminder-switch')));
    await tester.pumpAndSettle();

    expect(
      find.textContaining('Permissão de notificações negada.'),
      findsOneWidget,
    );
    expect((await controller.load()).enabled, isFalse);
    expect(notifications.permissionRequests, 1);
    expect(notifications.schedules, isEmpty);
    expect(notifications.cancellations, 1);
  });
}
