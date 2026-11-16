import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../api_config.dart';

class AdminUser {
  const AdminUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final DateTime? createdAt;

  factory AdminUser.fromJson(Object? value) {
    if (value is! Map<String, dynamic>) {
      throw const FormatException('Um usuário retornado pela API é inválido.');
    }
    final id = value['id'];
    final name = value['nome'];
    final email = value['email'];
    final role = value['perfil'];
    final createdAt = value['createdAt'];
    if (id is! String ||
        name is! String ||
        email is! String ||
        role is! String) {
      throw const FormatException('Um usuário não contém dados válidos.');
    }
    return AdminUser(
      id: id,
      name: name,
      email: email,
      role: role,
      createdAt: createdAt is String ? DateTime.tryParse(createdAt) : null,
    );
  }
}

class AdminUserPageData {
  const AdminUserPageData({
    required this.users,
    required this.total,
    required this.page,
    required this.limit,
  });

  final List<AdminUser> users;
  final int total;
  final int page;
  final int limit;

  factory AdminUserPageData.fromJson(Object? value) {
    if (value is! Map<String, dynamic> || value['dados'] is! List) {
      throw const FormatException('A lista de usuários retornada é inválida.');
    }
    return AdminUserPageData(
      users: (value['dados'] as List).map(AdminUser.fromJson).toList(),
      total: _readInt(value, 'total'),
      page: _readInt(value, 'page'),
      limit: _readInt(value, 'limit'),
    );
  }
}

class AdminUserDetail extends AdminUser {
  const AdminUserDetail({
    required super.id,
    required super.name,
    required super.email,
    required super.role,
    required super.createdAt,
    required this.totalDecks,
    required this.totalCards,
    required this.pendingCards,
  });

  final int totalDecks;
  final int totalCards;
  final int pendingCards;

  factory AdminUserDetail.fromJson(Object? value) {
    final user = AdminUser.fromJson(value);
    if (value is! Map<String, dynamic>) {
      throw const FormatException('Os detalhes do usuário são inválidos.');
    }
    return AdminUserDetail(
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      totalDecks: _readInt(value, 'totalBaralhos'),
      totalCards: _readInt(value, 'totalCartoes'),
      pendingCards: _readInt(value, 'cartoesPendentes'),
    );
  }
}

class AdminUserStatistics {
  const AdminUserStatistics({
    required this.totalDecks,
    required this.totalCards,
    required this.reviews,
    required this.accuracyPercentage,
    required this.streak,
  });

  final int totalDecks;
  final int totalCards;
  final int reviews;
  final double accuracyPercentage;
  final int streak;

  factory AdminUserStatistics.fromJson(Object? value) {
    if (value is! Map<String, dynamic>) {
      throw const FormatException('As estatísticas do usuário são inválidas.');
    }
    final accuracy = value['taxaAcertoPorcentagem'];
    if (accuracy is! num) {
      throw const FormatException('A taxa de acerto retornada é inválida.');
    }
    return AdminUserStatistics(
      totalDecks: _readInt(value, 'totalBaralhos'),
      totalCards: _readInt(value, 'totalCartoes'),
      reviews: _readInt(value, 'cartoesEstudados'),
      accuracyPercentage: accuracy.toDouble(),
      streak: _readInt(value, 'sequenciaDiasAtual'),
    );
  }
}

class AdminUserActivity {
  const AdminUserActivity({
    required this.date,
    required this.total,
    required this.correct,
    required this.errors,
  });

  final String date;
  final int total;
  final int correct;
  final int errors;

  factory AdminUserActivity.fromJson(Object? value) {
    if (value is! Map<String, dynamic> || value['data'] is! String) {
      throw const FormatException('Um registro de atividade é inválido.');
    }
    return AdminUserActivity(
      date: value['data'] as String,
      total: _readInt(value, 'total'),
      correct: _readInt(value, 'acertos'),
      errors: _readInt(value, 'erros'),
    );
  }
}

class AdminUserDeck {
  const AdminUserDeck({
    required this.id,
    required this.name,
    required this.totalCards,
    required this.reviewedCards,
    required this.retentionPercentage,
  });

  final String id;
  final String name;
  final int totalCards;
  final int reviewedCards;
  final double retentionPercentage;

  factory AdminUserDeck.fromJson(Object? value) {
    if (value is! Map<String, dynamic> ||
        value['id'] is! String ||
        value['nome'] is! String ||
        value['retencaoPorcentagem'] is! num) {
      throw const FormatException('Um baralho do usuário é inválido.');
    }
    return AdminUserDeck(
      id: value['id'] as String,
      name: value['nome'] as String,
      totalCards: _readInt(value, 'totalCartoes'),
      reviewedCards: _readInt(value, 'cartoesRevisados'),
      retentionPercentage: (value['retencaoPorcentagem'] as num).toDouble(),
    );
  }
}

class AdminUsersRepository {
  AdminUsersRepository({http.Client? client})
    : _client = client ?? http.Client(),
      _ownsClient = client == null;

  final http.Client _client;
  final bool _ownsClient;

  Future<AdminUserPageData> listUsers(
    String accessToken, {
    required int page,
    int limit = 20,
  }) async => AdminUserPageData.fromJson(
    await _request('GET', '/usuarios?page=$page&limit=$limit', accessToken),
  );

  Future<AdminUserDetail> getUser(String accessToken, String id) async =>
      AdminUserDetail.fromJson(
        await _request(
          'GET',
          '/usuarios/${Uri.encodeComponent(id)}',
          accessToken,
        ),
      );

  Future<AdminUserStatistics> getStatistics(
    String accessToken,
    String id,
  ) async => AdminUserStatistics.fromJson(
    await _request(
      'GET',
      '/usuarios/${Uri.encodeComponent(id)}/estatisticas?periodo=semana',
      accessToken,
    ),
  );

  Future<List<AdminUserActivity>> getActivity(
    String accessToken,
    String id, {
    int days = 30,
  }) async {
    final payload = await _request(
      'GET',
      '/usuarios/${Uri.encodeComponent(id)}/estatisticas/atividade?dias=$days',
      accessToken,
    );
    if (payload is! List) {
      throw const FormatException(
        'A atividade do usuário retornada é inválida.',
      );
    }
    return payload.map(AdminUserActivity.fromJson).toList();
  }

  Future<List<AdminUserDeck>> getDecks(String accessToken, String id) async {
    final payload = await _request(
      'GET',
      '/usuarios/${Uri.encodeComponent(id)}/baralhos',
      accessToken,
    );
    if (payload is! List) {
      throw const FormatException(
        'Os baralhos do usuário retornados são inválidos.',
      );
    }
    return payload.map(AdminUserDeck.fromJson).toList();
  }

  Future<void> deleteUser(
    String accessToken,
    String id, {
    required String password,
  }) async {
    await _request(
      'DELETE',
      '/usuarios/${Uri.encodeComponent(id)}',
      accessToken,
      body: {'senha': password},
    );
  }

  void close() {
    if (_ownsClient) _client.close();
  }

  Future<Object?> _request(
    String method,
    String path,
    String accessToken, {
    Map<String, dynamic>? body,
  }) async {
    final response = await _client
        .send(
          http.Request(method, Uri.parse('${apiBaseUrl()}$path'))
            ..headers.addAll({
              'Authorization': 'Bearer $accessToken',
              if (body != null) 'Content-Type': 'application/json',
            })
            ..body = body == null ? '' : jsonEncode(body),
        )
        .timeout(const Duration(seconds: 15))
        .then(http.Response.fromStream);

    if (response.statusCode == 204) return null;

    final Object? payload;
    try {
      payload = jsonDecode(response.body);
    } on FormatException {
      throw const FormatException(
        'A API retornou uma resposta inválida ao carregar os usuários.',
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
          : 'Não foi possível concluir a operação (HTTP ${response.statusCode}).';
      throw Exception(errorMessage);
    }
    return payload;
  }
}

int _readInt(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is int) return value;
  throw FormatException('O campo "$key" retornado pela API é inválido.');
}
