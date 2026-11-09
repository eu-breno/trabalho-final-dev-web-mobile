import 'package:shared_preferences/shared_preferences.dart';

class SessionStore {
  static const accessTokenKey = 'memora.accessToken';

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
    await (await SharedPreferences.getInstance()).remove(accessTokenKey);
  }
}
