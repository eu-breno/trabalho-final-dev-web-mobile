import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../api_config.dart';

class StudyDeck {
  const StudyDeck({
    required this.id,
    required this.name,
    required this.description,
    required this.totalCards,
    required this.pendingCards,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String? description;
  final int totalCards;
  final int pendingCards;
  final DateTime? createdAt;

  factory StudyDeck.fromJson(Object? value) {
    if (value is! Map<String, dynamic>) {
      throw const FormatException('Um baralho retornado pela API é inválido.');
    }
    final id = value['id'];
    final name = value['nome'];
    final description = value['descricao'];
    final createdAtValue = value['createdAt'];
    if (id is! String || name is! String) {
      throw const FormatException(
        'Um baralho não contém identificadores válidos.',
      );
    }
    if (description != null && description is! String) {
      throw const FormatException('A descrição de um baralho é inválida.');
    }
    return StudyDeck(
      id: id,
      name: name,
      description: description as String?,
      totalCards: _readInt(value, 'totalCartoes'),
      pendingCards: _readInt(value, 'cartoesPendentes'),
      createdAt: createdAtValue is String
          ? DateTime.tryParse(createdAtValue)
          : null,
    );
  }
}

class StudyCard {
  const StudyCard({
    required this.id,
    required this.front,
    required this.back,
    required this.nextReview,
  });

  final String id;
  final String front;
  final String back;
  final DateTime? nextReview;

  bool get isDue => nextReview == null || !nextReview!.isAfter(DateTime.now());

  factory StudyCard.fromJson(Object? value) {
    if (value is! Map<String, dynamic>) {
      throw const FormatException('Um cartão retornado pela API é inválido.');
    }
    final id = value['id'];
    final front = value['frente'];
    final back = value['verso'];
    final nextReviewValue = value['proximaRevisao'];
    if (id is! String || front is! String || back is! String) {
      throw const FormatException('Um cartão não contém dados válidos.');
    }
    return StudyCard(
      id: id,
      front: front,
      back: back,
      nextReview: nextReviewValue is String
          ? DateTime.tryParse(nextReviewValue)
          : null,
    );
  }
}

class DecksRepository {
  DecksRepository({http.Client? client})
    : _client = client ?? http.Client(),
      _ownsClient = client == null;

  final http.Client _client;
  final bool _ownsClient;

  Future<List<StudyDeck>> listDecks(String accessToken) async {
    return _asJsonList(await _request('GET', '/baralhos', accessToken))
        .map(StudyDeck.fromJson)
        .toList();
  }

  Future<StudyDeck> createDeck(
    String accessToken, {
    required String name,
    String? description,
  }) async {
    final result = await _request(
      'POST',
      '/baralhos',
      accessToken,
      body: {
        'nome': name,
        if (description != null && description.trim().isNotEmpty)
          'descricao': description,
      },
    );
    return StudyDeck.fromJson(result);
  }

  Future<StudyDeck> updateDeck(
    String accessToken,
    String id, {
    required String name,
    String? description,
  }) async {
    final result = await _request(
      'PATCH',
      '/baralhos/${Uri.encodeComponent(id)}',
      accessToken,
      body: {'nome': name, 'descricao': description ?? ''},
    );
    return StudyDeck.fromJson(result);
  }

  Future<void> deleteDeck(String accessToken, String id) async {
    await _request(
      'DELETE',
      '/baralhos/${Uri.encodeComponent(id)}',
      accessToken,
      acceptsEmpty: true,
    );
  }

  Future<StudyDeck> getDeck(String accessToken, String id) async {
    return StudyDeck.fromJson(
      await _request(
        'GET',
        '/baralhos/${Uri.encodeComponent(id)}',
        accessToken,
      ),
    );
  }

  Future<List<StudyCard>> listCards(String accessToken, String deckId) async {
    return _asJsonList(
      await _request(
        'GET',
        '/baralhos/${Uri.encodeComponent(deckId)}/cartoes',
        accessToken,
      ),
    ).map(StudyCard.fromJson).toList();
  }

  Future<List<StudyCard>> loadStudyQueue(
    String accessToken, {
    String? deckId,
    String scope = 'pendentes',
  }) async {
    if (scope != 'pendentes' && scope != 'todos') {
      throw ArgumentError.value(scope, 'scope', 'Escopo de estudo inválido.');
    }
    final path = deckId == null
        ? '/baralhos/estudo?escopo=$scope'
        : '/baralhos/${Uri.encodeComponent(deckId)}/estudo?escopo=$scope';
    return _asJsonList(await _request('GET', path, accessToken))
        .map(StudyCard.fromJson)
        .toList();
  }

  Future<void> submitRating(
    String accessToken,
    String cardId,
    String rating,
  ) async {
    const ratings = {'errei', 'dificil', 'bom', 'facil'};
    if (!ratings.contains(rating)) {
      throw ArgumentError.value(rating, 'rating', 'Avaliação inválida.');
    }
    await _request(
      'POST',
      '/cartoes/${Uri.encodeComponent(cardId)}/revisoes',
      accessToken,
      body: {'nota': rating},
    );
  }

  Future<StudyCard> createCard(
    String accessToken,
    String deckId, {
    required String front,
    required String back,
  }) async {
    return StudyCard.fromJson(
      await _request(
        'POST',
        '/baralhos/${Uri.encodeComponent(deckId)}/cartoes',
        accessToken,
        body: {'frente': front, 'verso': back},
      ),
    );
  }

  Future<StudyCard> updateCard(
    String accessToken,
    String cardId, {
    required String front,
    required String back,
  }) async {
    return StudyCard.fromJson(
      await _request(
        'PATCH',
        '/cartoes/${Uri.encodeComponent(cardId)}',
        accessToken,
        body: {'frente': front, 'verso': back},
      ),
    );
  }

  Future<void> deleteCard(String accessToken, String cardId) async {
    await _request(
      'DELETE',
      '/cartoes/${Uri.encodeComponent(cardId)}',
      accessToken,
      acceptsEmpty: true,
    );
  }

  void close() {
    if (_ownsClient) _client.close();
  }

  Future<Object?> _request(
    String method,
    String path,
    String accessToken, {
    Map<String, Object?>? body,
    bool acceptsEmpty = false,
  }) async {
    final uri = Uri.parse('${apiBaseUrl()}$path');
    final headers = <String, String>{
      'Authorization': 'Bearer $accessToken',
      if (body != null) 'Content-Type': 'application/json',
    };
    final request = switch (method) {
      'GET' => _client.get(uri, headers: headers),
      'POST' => _client.post(uri, headers: headers, body: jsonEncode(body)),
      'PATCH' => _client.patch(uri, headers: headers, body: jsonEncode(body)),
      'DELETE' => _client.delete(uri, headers: headers),
      _ => throw ArgumentError.value(method, 'method', 'Método HTTP inválido.'),
    };
    final response = await request.timeout(const Duration(seconds: 15));

    if (response.statusCode == 204 && acceptsEmpty) return null;

    final Object? payload;
    try {
      payload = jsonDecode(response.body);
    } on FormatException {
      throw const FormatException(
        'A API retornou uma resposta inválida ao carregar seus baralhos.',
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

  List<Object?> _asJsonList(Object? value) {
    if (value is List<Object?>) return value;
    throw const FormatException('A API retornou uma lista inválida.');
  }
}

int _readInt(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is int) return value;
  throw FormatException('O campo "$key" retornado pela API é inválido.');
}
