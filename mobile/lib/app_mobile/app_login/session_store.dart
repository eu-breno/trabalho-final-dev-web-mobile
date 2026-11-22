import 'package:shared_preferences/shared_preferences.dart';

import '../notifications/study_reminder.dart';

class SessionStore {
  SessionStore({StudyReminderController? reminderController})
    : _reminderController = reminderController ?? StudyReminderController();

  static const accessTokenKey = 'memora.accessToken';
  final StudyReminderController _reminderController;

  Future<String?> readAccessToken() async {
    final token = (await SharedPreferences.getInstance()).getString(
      accessTokenKey,
    );
    return token == null || token.isEmpty ? null : token;
  }

  Future<void> saveAccessToken(String accessToken) async {
    await (await SharedPreferences.getInstance()).setString(
      accessTokenKey,
      accessToken,
    );
  }

  Future<void> clearAccessToken() async {
    await _reminderController.cancelScheduled();
    await (await SharedPreferences.getInstance()).remove(accessTokenKey);
  }
}
