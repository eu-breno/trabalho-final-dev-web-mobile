import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../api_config.dart';

class StatisticsData {
  const StatisticsData({
    required this.totalDecks,
    required this.totalCards,
    required this.reviews,
    required this.streak,
    required this.accuracyPercentage,
    required this.decks,
  });

  final int totalDecks;
  final int totalCards;
  final int reviews;
  final int streak;
  final double accuracyPercentage;
  final List<DeckStatistics> decks;
}

class DeckStatistics {
  const DeckStatistics({
    required this.id,
    required this.name,
    required this.totalCards,
    required this.reviewedCards,
  });

  final String id;
  final String name;
  final int totalCards;
  final int reviewedCards;

  factory DeckStatistics.fromJson(Object? value) {
    if (value is! Map<String, dynamic>) {
      throw const FormatException('Um baralho retornado pela API é inválido.');
    }
    final id = value['id'];
    final name = value['nome'];
    if (id is! String || name is! String) {
      throw const FormatException(
        'Um baralho não contém identificadores válidos.',
      );
    }
    return DeckStatistics(
      id: id,
      name: name,
      totalCards: _readInt(value, 'totalCartoes'),
      reviewedCards: 0,
    );
  }

  DeckStatistics withReviewCount(int count) => DeckStatistics(
    id: id,
    name: name,
    totalCards: totalCards,
    reviewedCards: count,
  );
}

class ReviewActivity {
  const ReviewActivity({
    required this.date,
    required this.total,
    required this.correct,
    required this.errors,
  });

  final String date;
  final int total;
  final int correct;
  final int errors;

  factory ReviewActivity.fromJson(Object? value) {
    if (value is! Map<String, dynamic>) {
      throw const FormatException('Um dia da atividade de revisão é inválido.');
    }
    final date = value['data'];
    if (date is! String) {
      throw const FormatException('A data de uma atividade é inválida.');
    }
    return ReviewActivity(
      date: date,
      total: _readInt(value, 'total'),
      correct: _readInt(value, 'acertos'),
      errors: _readInt(value, 'erros'),
    );
  }
}

class StatisticsRepository {
  StatisticsRepository({http.Client? client})
    : _client = client ?? http.Client(),
      _ownsClient = client == null;

  final http.Client _client;
  final bool _ownsClient;

  Future<StatisticsData> loadOverview(String accessToken) async {
    final results = await Future.wait([
      _getJson('/estatisticas?periodo=semana', accessToken),
      _getJson('/baralhos', accessToken),
    ]);
    final stats = _asJsonObject(results[0], 'estatísticas');
    final deckValues = _asJsonList(results[1], 'baralhos');
    final decks = deckValues.map(DeckStatistics.fromJson).toList();
    final deckMetrics = await Future.wait(
      decks.map(
        (deck) => _getJson(
          '/estatisticas/baralhos/${Uri.encodeComponent(deck.id)}',
          accessToken,
        ),
      ),
    );
    final deckStatistics = <DeckStatistics>[];
    for (var index = 0; index < decks.length; index++) {
      final metrics = _asJsonObject(
        deckMetrics[index],
        'estatísticas do baralho',
      );
      deckStatistics.add(
        decks[index].withReviewCount(_readInt(metrics, 'cartoesRevisados')),
      );
    }

    return StatisticsData(
      totalDecks: _readInt(stats, 'totalBaralhos'),
      totalCards: _readInt(stats, 'totalCartoes'),
      reviews: _readInt(stats, 'cartoesEstudados'),
      streak: _readInt(stats, 'sequenciaDiasAtual'),
      accuracyPercentage: _readNum(stats, 'taxaAcertoPorcentagem').toDouble(),
      decks: deckStatistics,
    );
  }

  Future<List<ReviewActivity>> loadActivity(
    String accessToken,
    int days,
  ) async {
    if (days != 7 && days != 30 && days != 90) {
      throw ArgumentError.value(days, 'days', 'Use 7, 30 ou 90 dias.');
    }
    final response = await _getJson(
      '/estatisticas/atividade?dias=$days',
      accessToken,
    );
    return _asJsonList(
      response,
      'atividade',
    ).map(ReviewActivity.fromJson).toList();
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
        'A API retornou uma resposta inválida ao carregar suas estatísticas.',
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
          : 'Não foi possível carregar suas estatísticas (HTTP ${response.statusCode}).';
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

int _readInt(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is int) return value;
  throw FormatException('O campo "$key" retornado pela API é inválido.');
}

num _readNum(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is num) return value;
  throw FormatException('O campo "$key" retornado pela API é inválido.');
}
