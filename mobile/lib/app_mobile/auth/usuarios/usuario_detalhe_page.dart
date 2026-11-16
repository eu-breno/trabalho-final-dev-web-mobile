import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../baralhos/baralhos_page.dart';
import '../dashboard/dashboard_drawer.dart';
import '../estatisticas/estatisticas_page.dart';
import '../estudo/estudo_page.dart';
import 'usuarios_page.dart';
import 'usuarios_repository.dart';

class UsuarioDetalhePage extends StatefulWidget {
  const UsuarioDetalhePage({
    super.key,
    required this.accessToken,
    required this.userId,
    required this.userRole,
    required this.currentUserId,
    this.client,
    this.userName,
    this.userEmail,
  });

  final String accessToken;
  final String userId;
  final String? userRole;
  final String? currentUserId;
  final http.Client? client;
  final String? userName;
  final String? userEmail;

  @override
  State<UsuarioDetalhePage> createState() => _UsuarioDetalhePageState();
}

class _UsuarioDetalhePageState extends State<UsuarioDetalhePage> {
  late final AdminUsersRepository _repository = AdminUsersRepository(
    client: widget.client,
  );
  AdminUserDetail? _user;
  AdminUserStatistics? _statistics;
  List<AdminUserActivity> _activity = const [];
  List<AdminUserDeck> _decks = const [];
  String? _error;
  bool _isLoading = true;
  bool _isLoadingActivity = true;
  int _activityDays = 30;

  @override
  void initState() {
    super.initState();
    if (widget.userRole == 'administrador') {
      unawaited(_load());
    } else {
      _isLoading = false;
    }
  }

  @override
  void dispose() {
    _repository.close();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final results = await Future.wait<Object>([
        _repository.getUser(widget.accessToken, widget.userId),
        _repository.getStatistics(widget.accessToken, widget.userId),
        _repository.getDecks(widget.accessToken, widget.userId),
      ]);
      if (!mounted) return;
      setState(() {
        _user = results[0] as AdminUserDetail;
        _statistics = results[1] as AdminUserStatistics;
        _decks = results[2] as List<AdminUserDeck>;
      });
      await _loadActivity(_activityDays);
    } on TimeoutException {
      _setError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setError(
        'Não foi possível conectar à API. Confira o endereço e se o servidor está ativo.',
      );
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadActivity(int days) async {
    setState(() {
      _isLoadingActivity = true;
      _error = null;
    });
    try {
      final activity = await _repository.getActivity(
        widget.accessToken,
        widget.userId,
        days: days,
      );
      if (mounted && days == _activityDays) {
        setState(() => _activity = activity);
      }
    } on TimeoutException {
      _setError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setError(
        'Não foi possível conectar à API. Confira o endereço e se o servidor está ativo.',
      );
    } catch (error) {
      _setError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted && days == _activityDays) {
        setState(() => _isLoadingActivity = false);
      }
    }
  }

  void _setError(String message) {
    if (mounted) setState(() => _error = message);
  }

  void _selectActivityDays(int days) {
    if (days == _activityDays) return;
    setState(() {
      _activityDays = days;
      _activity = const [];
    });
    unawaited(_loadActivity(days));
  }

  void _openUsers() {
    Navigator.pop(context);
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => UsuariosPage(
          accessToken: widget.accessToken,
          userRole: widget.userRole,
          currentUserId: widget.currentUserId,
          client: widget.client,
          userName: widget.userName,
          userEmail: widget.userEmail,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.userRole != 'administrador') {
      return const Scaffold(
        backgroundColor: Color(0xFF09090B),
        body: Center(
          child: Text(
            'Acesso negado.',
            style: TextStyle(color: Color(0xFFF4F4F5)),
          ),
        ),
      );
    }

    final user = _user;
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      drawer: DashboardDrawer(
        accessToken: widget.accessToken,
        client: widget.client,
        userName: widget.userName,
        userEmail: widget.userEmail,
        userRole: widget.userRole,
        selectedSection: 'Usuários',
        onTapUsers: _openUsers,
        onTapHome: () =>
            Navigator.of(context).popUntil((route) => route.isFirst),
        onTapStudy: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => EstudoPage(
                accessToken: widget.accessToken,
                client: widget.client,
              ),
            ),
          );
        },
        onTapDecks: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => BaralhosPage(
                accessToken: widget.accessToken,
                client: widget.client,
                userName: widget.userName,
                userEmail: widget.userEmail,
                userRole: widget.userRole,
                currentUserId: widget.currentUserId,
              ),
            ),
          );
        },
        onTapStatistics: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => EstatisticasPage(
                accessToken: widget.accessToken,
                client: widget.client,
                userName: widget.userName,
                userEmail: widget.userEmail,
                userRole: widget.userRole,
                currentUserId: widget.currentUserId,
              ),
            ),
          );
        },
      ),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        leading: IconButton(
          tooltip: 'Voltar para usuários',
          icon: const Icon(LucideIcons.arrowLeft, color: Color(0xFFF4F4F5)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Detalhes do usuário',
          style: TextStyle(
            color: Color(0xFFF4F4F5),
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        color: const Color(0xFF09090B),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          children: [
            if (_error != null) ...[
              _DetailErrorBanner(message: _error!, onRetry: _load),
              const SizedBox(height: 16),
            ],
            if (_isLoading && user == null)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(
                  child: CircularProgressIndicator(color: Color(0xFFF4F4F5)),
                ),
              )
            else if (user == null)
              const Text(
                'Usuário não encontrado.',
                style: TextStyle(color: Color(0xFFA1A1AA)),
              )
            else ...[
              Text(
                user.name,
                style: const TextStyle(
                  color: Color(0xFFF4F4F5),
                  fontSize: 28,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                user.email,
                style: const TextStyle(color: Color(0xFFA1A1AA)),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  _RoleBadge(role: user.role),
                  Text(
                    user.createdAt == null
                        ? 'Data de cadastro indisponível'
                        : 'Cadastrado em ${_formatDate(user.createdAt!)}',
                    style: const TextStyle(
                      color: Color(0xFFA1A1AA),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              _SectionHeading(title: 'Resumo do usuário'),
              const SizedBox(height: 12),
              _MetricGrid(
                items: [
                  _MetricItem('Baralhos', user.totalDecks, LucideIcons.layers3),
                  _MetricItem(
                    'Cartas',
                    user.totalCards,
                    LucideIcons.bookOpenCheck,
                  ),
                  _MetricItem(
                    'Cartas pendentes',
                    user.pendingCards,
                    LucideIcons.target,
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _SectionHeading(title: 'Progresso do usuário'),
              const SizedBox(height: 12),
              if (_statistics == null)
                const _DetailPanel(
                  child: Text(
                    'As estatísticas ainda não estão disponíveis.',
                    style: TextStyle(color: Color(0xFFA1A1AA)),
                  ),
                )
              else
                _MetricGrid(
                  items: [
                    _MetricItem(
                      'Baralhos',
                      _statistics!.totalDecks,
                      LucideIcons.layers3,
                    ),
                    _MetricItem(
                      'Cartões',
                      _statistics!.totalCards,
                      LucideIcons.target,
                    ),
                    _MetricItem(
                      'Revisões nesta semana',
                      _statistics!.reviews,
                      LucideIcons.bookOpenCheck,
                    ),
                    _MetricItem(
                      'Sequência atual (dias)',
                      _statistics!.streak,
                      LucideIcons.flame,
                    ),
                  ],
                ),
              const SizedBox(height: 16),
              _DetailPanel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Taxa de acerto nesta semana',
                      style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${(_statistics?.accuracyPercentage ?? 0).round()}%',
                      style: const TextStyle(
                        color: Color(0xFFF4F4F5),
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              _ActivityPanel(
                days: _activityDays,
                activity: _activity,
                isLoading: _isLoadingActivity,
                onSelectDays: _selectActivityDays,
              ),
              const SizedBox(height: 24),
              _SectionHeading(title: 'Baralhos'),
              const SizedBox(height: 12),
              if (_decks.isEmpty)
                const _DetailPanel(
                  child: Text(
                    'Este usuário ainda não possui baralhos.',
                    style: TextStyle(color: Color(0xFFA1A1AA)),
                  ),
                )
              else
                for (final deck in _decks.take(5))
                  _DeckProgressTile(deck: deck),
            ],
          ],
        ),
      ),
    );
  }
}

class _RoleBadge extends StatelessWidget {
  const _RoleBadge({required this.role});

  final String role;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(
      color: const Color(0xFF27272A),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(
      role == 'administrador' ? 'Administrador' : 'Usuário',
      style: const TextStyle(color: Color(0xFFD4D4D8), fontSize: 12),
    ),
  );
}

class _SectionHeading extends StatelessWidget {
  const _SectionHeading({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) => Text(
    title,
    style: const TextStyle(
      color: Color(0xFFF4F4F5),
      fontSize: 18,
      fontWeight: FontWeight.w600,
    ),
  );
}

class _MetricItem {
  const _MetricItem(this.label, this.value, this.icon);

  final String label;
  final int value;
  final IconData icon;
}

class _MetricGrid extends StatelessWidget {
  const _MetricGrid({required this.items});

  final List<_MetricItem> items;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final columns = constraints.maxWidth < 390 ? 1 : 2;
      final itemWidth = (constraints.maxWidth - 12 * (columns - 1)) / columns;
      return Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          for (final item in items)
            SizedBox(
              width: itemWidth,
              child: _DetailPanel(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            item.label,
                            style: const TextStyle(
                              color: Color(0xFFA1A1AA),
                              fontSize: 12,
                            ),
                          ),
                        ),
                        Icon(
                          item.icon,
                          color: const Color(0xFFA1A1AA),
                          size: 18,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '${item.value}',
                      style: const TextStyle(
                        color: Color(0xFFF4F4F5),
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      );
    },
  );
}

class _DetailPanel extends StatelessWidget {
  const _DetailPanel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: const Color(0xFF18181B),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: const Color(0xFF27272A)),
    ),
    child: child,
  );
}

class _ActivityPanel extends StatelessWidget {
  const _ActivityPanel({
    required this.days,
    required this.activity,
    required this.isLoading,
    required this.onSelectDays,
  });

  final int days;
  final List<AdminUserActivity> activity;
  final bool isLoading;
  final ValueChanged<int> onSelectDays;

  @override
  Widget build(BuildContext context) {
    final total = activity.fold<int>(0, (sum, day) => sum + day.total);
    final maxValue = activity.fold<int>(
      1,
      (maximum, day) => math.max(maximum, day.total),
    );
    return _DetailPanel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Atividade de revisão',
            style: TextStyle(
              color: Color(0xFFF4F4F5),
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              for (final option in [7, 30, 90])
                ChoiceChip(
                  label: Text('$option dias'),
                  selected: days == option,
                  onSelected: (_) => onSelectDays(option),
                  selectedColor: const Color(0xFF3F3F46),
                  backgroundColor: const Color(0xFF09090B),
                  labelStyle: const TextStyle(
                    color: Color(0xFFF4F4F5),
                    fontSize: 12,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          if (isLoading)
            const SizedBox(
              height: 100,
              child: Center(
                child: CircularProgressIndicator(
                  color: Color(0xFFF4F4F5),
                  strokeWidth: 2,
                ),
              ),
            )
          else if (total == 0)
            SizedBox(
              height: 80,
              child: Center(
                child: Text(
                  'Nenhuma revisão registrada nos últimos $days dias.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFFA1A1AA),
                    fontSize: 13,
                  ),
                ),
              ),
            )
          else ...[
            SizedBox(
              height: 110,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  for (final day in activity)
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 1.5),
                        child: Tooltip(
                          message: '${day.date}: ${day.total} revisões',
                          child: Container(
                            height: math.max(3, 92 * day.total / maxValue),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD4D4D8),
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$total ${total == 1 ? 'revisão' : 'revisões'} nos últimos $days dias',
              style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}

class _DeckProgressTile extends StatelessWidget {
  const _DeckProgressTile({required this.deck});

  final AdminUserDeck deck;

  @override
  Widget build(BuildContext context) {
    final progress = deck.totalCards == 0
        ? 0.0
        : (deck.reviewedCards / deck.totalCards).clamp(0.0, 1.0);
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: _DetailPanel(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    deck.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Color(0xFFF4F4F5)),
                  ),
                ),
                Text(
                  '${deck.reviewedCards}/${deck.totalCards}',
                  style: const TextStyle(
                    color: Color(0xFFA1A1AA),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(5),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 6,
                backgroundColor: const Color(0xFF3F3F46),
                color: const Color(0xFFD4D4D8),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Retenção ${deck.retentionPercentage.round()}%',
              style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailErrorBanner extends StatelessWidget {
  const _DetailErrorBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => _DetailPanel(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(message, style: const TextStyle(color: Color(0xFFFCA5A5))),
        TextButton(onPressed: onRetry, child: const Text('Tentar novamente')),
      ],
    ),
  );
}

String _formatDate(DateTime date) {
  final local = date.toLocal();
  final day = local.day.toString().padLeft(2, '0');
  final month = local.month.toString().padLeft(2, '0');
  return '$day/$month/${local.year}';
}
