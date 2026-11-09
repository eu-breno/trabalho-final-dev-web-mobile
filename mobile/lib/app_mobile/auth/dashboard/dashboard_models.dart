class DashboardData {
  const DashboardData({
    required this.firstName,
    required this.stats,
    required this.decks,
    this.fullName,
    this.email,
  });

  final String firstName;
  final String? fullName;
  final String? email;
  final DashboardStats stats;
  final List<DashboardDeck> decks;

  int get pendingCards =>
      decks.fold(0, (total, deck) => total + deck.pendingCards);

  factory DashboardData.fromJson({
    required Map<String, dynamic> profile,
    required Map<String, dynamic> stats,
    required List<Object?> decks,
  }) {
    final fullName = profile['nome'];
    if (fullName is! String || fullName.trim().isEmpty) {
      throw const FormatException('O perfil não contém o nome do usuário.');
    }

    return DashboardData(
      firstName: fullName.trim().split(RegExp(r'\s+')).first,
      fullName: fullName.trim(),
      email: profile['email'] is String ? profile['email'] as String : null,
      stats: DashboardStats.fromJson(stats),
      decks: decks.map(DashboardDeck.fromJson).toList(),
    );
  }
}

class DashboardStats {
  const DashboardStats({
    required this.totalDecks,
    required this.totalCards,
    required this.reviews,
    required this.streak,
    required this.weeklyActivity,
  });

  final int totalDecks;
  final int totalCards;
  final int reviews;
  final int streak;
  final List<DailyActivity> weeklyActivity;

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    final activity = json['atividadeSemanal'];
    if (activity is! List<Object?>) {
      throw const FormatException('As estatísticas semanais são inválidas.');
    }

    return DashboardStats(
      totalDecks: _readInt(json, 'totalBaralhos'),
      totalCards: _readInt(json, 'totalCartoes'),
      reviews: _readInt(json, 'cartoesEstudados'),
      streak: _readInt(json, 'sequenciaDiasAtual'),
      weeklyActivity: activity.map(DailyActivity.fromJson).toList(),
    );
  }
}

class DailyActivity {
  const DailyActivity({required this.day, required this.total});

  final String day;
  final int total;

  factory DailyActivity.fromJson(Object? value) {
    if (value is! Map<String, dynamic>) {
      throw const FormatException('Um dia da atividade semanal é inválido.');
    }
    final day = value['dia'];
    if (day is! String) {
      throw const FormatException('O nome de um dia da semana é inválido.');
    }
    return DailyActivity(day: day, total: _readInt(value, 'total'));
  }
}

class DashboardDeck {
  const DashboardDeck({
    required this.name,
    required this.totalCards,
    required this.pendingCards,
  });

  final String name;
  final int totalCards;
  final int pendingCards;

  factory DashboardDeck.fromJson(Object? value) {
    if (value is! Map<String, dynamic>) {
      throw const FormatException('Um baralho retornado pela API é inválido.');
    }
    final name = value['nome'];
    if (name is! String) {
      throw const FormatException('Um baralho não contém nome válido.');
    }
    return DashboardDeck(
      name: name,
      totalCards: _readInt(value, 'totalCartoes'),
      pendingCards: _readInt(value, 'cartoesPendentes'),
    );
  }
}

int _readInt(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is int) return value;
  throw FormatException('O campo "$key" retornado pela API é inválido.');
}
