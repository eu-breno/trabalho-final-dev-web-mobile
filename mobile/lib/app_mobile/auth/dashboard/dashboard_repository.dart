import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../api_config.dart';
import 'dashboard_models.dart';

class DashboardRepository {
  DashboardRepository({http.Client? client})
    : _client = client ?? http.Client(),
      _ownsClient = client == null;

  final http.Client _client;
  final bool _ownsClient;

  Future<DashboardData> load(String accessToken) async {
    final results = await Future.wait([
      _getJson('/auth/perfil', accessToken),
      _getJson('/estatisticas?periodo=geral', accessToken),
      _getJson('/baralhos', accessToken),
    ]);

    return DashboardData.fromJson(
      profile: _asJsonObject(results[0], 'perfil'),
      stats: _asJsonObject(results[1], 'estatísticas'),
      decks: _asJsonList(results[2], 'baralhos'),
    );
  }

  void close() {
    if (_ownsClient) _client.close();
  }

  Future<Object?> _getJson(String path, String accessToken) async {
    final response = await _client
        .get(
          Uri.parse('${apiBaseUrl()}$path'),
          headers: {'Authorization': 'Bearer $accessToken'},
        )
        .timeout(const Duration(seconds: 15));

    final Object? payload;
    try {
      payload = jsonDecode(response.body);
    } on FormatException {
      throw const FormatException(
        'A API retornou uma resposta inválida ao carregar seus dados.',
      );
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = payload is Map<String, dynamic>
          ? payload['message']
          : null;
      final errorMessage = message is String
          ? message
          : message is List
          ? message.whereType<String>().join(', ')
          : 'Não foi possível carregar seus dados (HTTP ${response.statusCode}).';
      throw Exception(errorMessage);
    }
    return payload;
  }

  Map<String, dynamic> _asJsonObject(Object? value, String label) {
    if (value is Map<String, dynamic>) return value;
    throw FormatException('A API retornou dados inválidos para $label.');
  }

  List<Object?> _asJsonList(Object? value, String label) {
    if (value is List<Object?>) return value;
    throw FormatException('A API retornou dados inválidos para $label.');
  }
}
