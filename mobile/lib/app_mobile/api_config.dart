import 'package:flutter/foundation.dart';

const _configuredApiBaseUrl = String.fromEnvironment('API_BASE_URL');

String apiBaseUrl() {
  if (_configuredApiBaseUrl.isNotEmpty) {
    return _configuredApiBaseUrl.replaceFirst(RegExp(r'/+$'), '');
  }
  if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}
