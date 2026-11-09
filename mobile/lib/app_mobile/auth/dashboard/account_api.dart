import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../api_config.dart';

class AccountProfile {
  const AccountProfile({required this.name, required this.email});

  final String name;
  final String email;

  factory AccountProfile.fromJson(Map<String, dynamic> json) {
    final name = json['nome'];
    final email = json['email'];
    if (name is! String || email is! String) {
      throw const AccountApiException('A API retornou um perfil inválido.');
    }
    return AccountProfile(name: name, email: email);
  }
}

class AccountApi {
  AccountApi({http.Client? client})
    : _client = client ?? http.Client(),
      _ownsClient = client == null;

  final http.Client _client;
  final bool _ownsClient;

  Future<AccountProfile> updateProfile({
    required String accessToken,
    required String name,
    required String email,
  }) async {
    final payload = await _patchJson('/auth/perfil', accessToken, {
      'nome': name.trim(),
      'email': email.trim(),
    });
    return AccountProfile.fromJson(payload);
  }

  Future<void> updatePassword({
    required String accessToken,
    required String currentPassword,
    required String newPassword,
  }) async {
    await _patchJson('/auth/senha', accessToken, {
      'senhaAtual': currentPassword,
      'novaSenha': newPassword,
    });
  }

  Future<Map<String, dynamic>> _patchJson(
    String path,
    String accessToken,
    Map<String, String> body,
  ) async {
    final response = await _client
        .patch(
          Uri.parse('${apiBaseUrl()}$path'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $accessToken',
          },
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15));

    final Object? payload;
    try {
      payload = jsonDecode(response.body);
    } on FormatException {
      throw const AccountApiException(
        'O servidor retornou uma resposta inválida.',
      );
    }

    if (payload is! Map<String, dynamic>) {
      throw const AccountApiException(
        'O servidor retornou uma resposta inválida.',
      );
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = payload['message'];
      final errorMessage = message is String
          ? message
          : message is List
          ? message.whereType<String>().join(', ')
          : 'Não foi possível atualizar sua conta.';
      throw AccountApiException(errorMessage);
    }
    return payload;
  }

  void close() {
    if (_ownsClient) _client.close();
  }
}

class AccountApiException implements Exception {
  const AccountApiException(this.message);

  final String message;

  @override
  String toString() => message;
}
