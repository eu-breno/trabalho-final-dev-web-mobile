import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../api_config.dart';

class AuthApi {
  AuthApi({http.Client? client})
    : _client = client ?? http.Client(),
      _ownsClient = client == null;

  final http.Client _client;
  final bool _ownsClient;

  Future<String> login({
    required String email,
    required String password,
  }) async {
    final payload = await _postJson('/auth/login', {
      'email': email.trim(),
      'senha': password,
    });

    final accessToken = payload['accessToken'];
    if (accessToken is! String || accessToken.isEmpty) {
      throw const AuthApiException(
        'O servidor não confirmou o login. Tente novamente.',
      );
    }
    return accessToken;
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    await _postJson('/auth/registro', {
      'nome': name.trim(),
      'email': email.trim(),
      'senha': password,
    });
  }

  Future<Map<String, dynamic>> _postJson(
    String path,
    Map<String, String> body,
  ) async {
    final response = await _client
        .post(
          Uri.parse('${apiBaseUrl()}$path'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));

    final Object? payload;
    try {
      payload = jsonDecode(response.body);
    } on FormatException {
      throw const AuthApiException(
        'O servidor retornou uma resposta inválida. Verifique se a API está disponível.',
      );
    }

    if (payload is! Map<String, dynamic>) {
      throw const AuthApiException(
        'O servidor retornou uma resposta inválida. Verifique se a API está disponível.',
      );
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = payload['message'];
      final errorMessage = message is String
          ? message
          : message is List
          ? message.whereType<String>().join(', ')
          : 'Não foi possível concluir a solicitação.';
      throw AuthApiException(errorMessage);
    }
    return payload;
  }

  void close() {
    if (_ownsClient) _client.close();
  }
}

class AuthApiException implements Exception {
  const AuthApiException(this.message);

  final String message;

  @override
  String toString() => message;
}
