import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../api_config.dart';
import '../baralhos/baralhos_page.dart';
import '../dashboard/dashboard_drawer.dart';
import '../estudo/estudo_page.dart';
import '../turmas/turmas_page.dart';
import 'estatisticas_repository.dart';

class EstatisticasPage extends StatefulWidget {
  const EstatisticasPage({
    super.key,
    required this.accessToken,
    this.client,
    this.userName,
    this.userEmail,
  });

  final String accessToken;
  final http.Client? client;
  final String? userName;
  final String? userEmail;

  @override
  State<EstatisticasPage> createState() => _EstatisticasPageState();
}

class _EstatisticasPageState extends State<EstatisticasPage> {
  late final StatisticsRepository _repository = StatisticsRepository(
    client: widget.client,
  );
  StatisticsData? _statistics;
  List<ReviewActivity> _activity = const [];
  String? _overviewError;
  String? _activityError;
  bool _isLoadingOverview = true;
  bool _isLoadingActivity = true;
  int _selectedDays = 30;

  @override
  void initState() {
    super.initState();
    unawaited(_loadOverview());
    unawaited(_loadActivity(_selectedDays));
  }

  @override
  void dispose() {
    _repository.close();
    super.dispose();
  }

  Future<void> _loadOverview() async {
    setState(() {
      _isLoadingOverview = true;
      _overviewError = null;
    });
    try {
      final statistics = await _repository.loadOverview(widget.accessToken);
      if (mounted) setState(() => _statistics = statistics);
    } on TimeoutException {
      _setOverviewError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setOverviewError(
        'Não foi possível conectar à API (${apiBaseUrl()}). Confira o endereço e se o servidor está ativo.',
      );
    } catch (error) {
      _setOverviewError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoadingOverview = false);
    }
  }

  Future<void> _loadActivity(int days) async {
    setState(() {
      _isLoadingActivity = true;
      _activityError = null;
    });
    try {
      final activity = await _repository.loadActivity(widget.accessToken, days);
      if (mounted && days == _selectedDays) {
        setState(() => _activity = activity);
      }
    } on TimeoutException {
      _setActivityError(
        'A API demorou para responder. Verifique sua conexão e tente novamente.',
      );
    } on http.ClientException {
      _setActivityError(
        'Não foi possível conectar à API (${apiBaseUrl()}). Confira o endereço e se o servidor está ativo.',
      );
    } catch (error) {
      _setActivityError(error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted && days == _selectedDays) {
        setState(() => _isLoadingActivity = false);
      }
    }
  }

  void _setOverviewError(String message) {
    if (mounted) setState(() => _overviewError = message);
  }

  void _setActivityError(String message) {
    if (mounted) setState(() => _activityError = message);
  }

  void _selectPeriod(int days) {
    if (days == _selectedDays) return;
    setState(() {
      _selectedDays = days;
      _activity = const [];
    });
    unawaited(_loadActivity(days));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      drawer: DashboardDrawer(
        accessToken: widget.accessToken,
        client: widget.client,
        userName: widget.userName,
        userEmail: widget.userEmail,
        selectedSection: 'Estatísticas',
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
        onTapHome: () =>
            Navigator.of(context).popUntil((route) => route.isFirst),
        onTapDecks: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => BaralhosPage(
                accessToken: widget.accessToken,
                client: widget.client,
                userName: widget.userName,
                userEmail: widget.userEmail,
              ),
            ),
          );
        },
        onTapTurmas: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => TurmasPage(
                accessToken: widget.accessToken,
                client: widget.client,
                userName: widget.userName,
                userEmail: widget.userEmail,
              ),
            ),
          );
        },
      ),
      appBar: AppBar(
        backgroundColor: const Color(0xFF09090B),
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            tooltip: 'Abrir menu',
            icon: const Icon(LucideIcons.menu, color: Color(0xFFF4F4F5)),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Text(
          'Estatísticas',
          style: TextStyle(
            color: Color(0xFFF4F4F5),
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.wait([_loadOverview(), _loadActivity(_selectedDays)]);
        },
        color: const Color(0xFF09090B),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          children: [
            const Text(
              'SEU PROGRESSO',
              style: TextStyle(
                color: Color(0xFFA1A1AA),
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Estatísticas',
              style: TextStyle(
                color: Color(0xFFF4F4F5),
                fontSize: 28,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Acompanhe sua evolução com base nas revisões registradas.',
              style: TextStyle(
                color: Color(0xFFA1A1AA),
                fontSize: 14,
                height: 1.4,
              ),
            ),
            if (_overviewError != null) ...[
              const SizedBox(height: 16),
              _ErrorBanner(message: _overviewError!, onRetry: _loadOverview),
            ],
            const SizedBox(height: 20),
            _buildOverviewCards(),
            const SizedBox(height: 20),
            _buildActivityCard(),
            const SizedBox(height: 20),
            _buildDeckProgressCard(),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildOverviewCards() {
    final stats = _statistics;
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.38,
      children: [
        _OverviewCard(
          label: 'Baralhos',
          value: stats?.totalDecks,
          note: 'Na sua biblioteca',
          icon: LucideIcons.bookOpenCheck,
          loading: _isLoadingOverview,
        ),
        _OverviewCard(
          label: 'Cartões',
          value: stats?.totalCards,
          note: 'Em todos os baralhos',
          icon: LucideIcons.target,
          loading: _isLoadingOverview,
        ),
        _OverviewCard(
          label: 'Revisões',
          value: stats?.reviews,
          note: 'Nesta semana',
          icon: LucideIcons.bookOpenCheck,
          loading: _isLoadingOverview,
        ),
        _OverviewCard(
          label: 'Sequência atual',
          value: stats?.streak,
          note: 'Dias consecutivos',
          icon: LucideIcons.flame,
          loading: _isLoadingOverview,
        ),
      ],
    );
  }

  Widget _buildActivityCard() {
    final total = _activity.fold<int>(0, (sum, day) => sum + day.total);
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            runSpacing: 12,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Atividade de revisão',
                    style: TextStyle(
                      color: Color(0xFFF4F4F5),
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Acertos e erros registrados',
                    style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
                  ),
                ],
              ),
              _PeriodSelector(
                selectedDays: _selectedDays,
                onSelect: _selectPeriod,
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Wrap(
            spacing: 16,
            runSpacing: 8,
            children: [
              _ChartLegend(color: Color(0xFFF4F4F5), label: 'Acertos'),
              _ChartLegend(
                color: Color(0xFFF87171),
                label: 'Erros ou difíceis',
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_isLoadingActivity)
            const SizedBox(
              height: 190,
              child: Center(
                child: CircularProgressIndicator(
                  color: Color(0xFFF4F4F5),
                  strokeWidth: 2,
                ),
              ),
            )
          else if (_activityError != null)
            SizedBox(
              height: 190,
              child: Center(
                child: Text(
                  _activityError!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFFFCA5A5),
                    fontSize: 13,
                  ),
                ),
              ),
            )
          else if (total == 0)
            SizedBox(
              height: 190,
              child: Center(
                child: Text(
                  'Nenhuma revisão registrada nos últimos $_selectedDays dias.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFFA1A1AA),
                    fontSize: 13,
                  ),
                ),
              ),
            )
          else
            _ActivityChart(days: _activity),
          if (!_isLoadingActivity && _activityError == null && total > 0) ...[
            const SizedBox(height: 8),
            Text(
              '$total ${total == 1 ? 'revisão' : 'revisões'} nos últimos $_selectedDays dias',
              style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 11),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDeckProgressCard() {
    final stats = _statistics;
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Taxa de acerto',
                      style: TextStyle(
                        color: Color(0xFFF4F4F5),
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Avaliações desta semana',
                      style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
                    ),
                  ],
                ),
              ),
              if (stats != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF27272A),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        stats.accuracyPercentage >= 70
                            ? LucideIcons.arrowUpRight
                            : LucideIcons.arrowDownRight,
                        color: const Color(0xFFF4F4F5),
                        size: 15,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${stats.accuracyPercentage.round()}%',
                        style: const TextStyle(
                          color: Color(0xFFF4F4F5),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 20),
          if (_isLoadingOverview)
            const LinearProgressIndicator(
              color: Color(0xFFF4F4F5),
              backgroundColor: Color(0xFF3F3F46),
            )
          else if (_overviewError != null)
            Text(
              _overviewError!,
              style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 13),
            )
          else if (stats == null || stats.decks.isEmpty)
            const Text(
              'Crie um baralho para acompanhar seu progresso.',
              style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 13),
            )
          else
            for (final deck in stats.decks.take(5)) ...[
              _DeckProgress(deck: deck),
              if (deck != stats.decks.take(5).last) const SizedBox(height: 18),
            ],
        ],
      ),
    );
  }
}

class _OverviewCard extends StatelessWidget {
  const _OverviewCard({
    required this.label,
    required this.value,
    required this.note,
    required this.icon,
    required this.loading,
  });

  final String label;
  final int? value;
  final String note;
  final IconData icon;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Color(0xFFA1A1AA),
                    fontSize: 12,
                  ),
                ),
              ),
              Icon(icon, color: const Color(0xFFA1A1AA), size: 17),
            ],
          ),
          const Spacer(),
          if (loading)
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                color: Color(0xFFF4F4F5),
                strokeWidth: 2,
              ),
            )
          else
            Text(
              '${value ?? 0}',
              style: const TextStyle(
                color: Color(0xFFF4F4F5),
                fontSize: 23,
                fontWeight: FontWeight.w600,
                letterSpacing: -0.4,
              ),
            ),
          const SizedBox(height: 3),
          Text(
            note,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 10),
          ),
        ],
      ),
    );
  }
}

class _ActivityChart extends StatelessWidget {
  const _ActivityChart({required this.days});

  final List<ReviewActivity> days;

  @override
  Widget build(BuildContext context) {
    final maxReviews = days.fold<int>(
      1,
      (maxValue, day) => day.total > maxValue ? day.total : maxValue,
    );
    return SizedBox(
      height: 190,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final chartWidth = days.length * (days.length > 30 ? 18.0 : 28.0);
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SizedBox(
              width: chartWidth < constraints.maxWidth
                  ? constraints.maxWidth
                  : chartWidth,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (var index = 0; index < days.length; index++)
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 2),
                        child: Column(
                          children: [
                            Expanded(
                              child: LayoutBuilder(
                                builder: (context, barConstraints) {
                                  final correctHeight =
                                      barConstraints.maxHeight *
                                      days[index].correct /
                                      maxReviews;
                                  final errorHeight =
                                      barConstraints.maxHeight *
                                      days[index].errors /
                                      maxReviews;
                                  return Align(
                                    alignment: Alignment.bottomCenter,
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        if (correctHeight > 0)
                                          Container(
                                            width: double.infinity,
                                            height: correctHeight,
                                            decoration: const BoxDecoration(
                                              color: Color(0xFFF4F4F5),
                                              borderRadius:
                                                  BorderRadius.vertical(
                                                    top: Radius.circular(3),
                                                  ),
                                            ),
                                          ),
                                        if (errorHeight > 0)
                                          Container(
                                            width: double.infinity,
                                            height: errorHeight,
                                            color: const Color(0xFFF87171),
                                          ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _dateLabel(days[index].date, index),
                              style: const TextStyle(
                                color: Color(0xFFA1A1AA),
                                fontSize: 9,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  String _dateLabel(String value, int index) {
    if (days.length > 7 && index % (days.length > 30 ? 10 : 5) != 0) {
      return '';
    }
    final parts = value.split('-');
    return parts.length == 3 ? '${parts[2]}/${parts[1]}' : '';
  }
}

class _DeckProgress extends StatelessWidget {
  const _DeckProgress({required this.deck});

  final DeckStatistics deck;

  @override
  Widget build(BuildContext context) {
    final progress = deck.totalCards == 0
        ? 0.0
        : (deck.reviewedCards / deck.totalCards).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                deck.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Color(0xFFF4F4F5), fontSize: 13),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '${deck.reviewedCards}/${deck.totalCards}',
              style: const TextStyle(
                color: Color(0xFFF4F4F5),
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            color: const Color(0xFFF4F4F5),
            backgroundColor: const Color(0xFF3F3F46),
          ),
        ),
      ],
    );
  }
}

class _PeriodSelector extends StatelessWidget {
  const _PeriodSelector({required this.selectedDays, required this.onSelect});

  final int selectedDays;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFF27272A),
        borderRadius: BorderRadius.circular(9),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final days in [7, 30, 90])
            InkWell(
              borderRadius: BorderRadius.circular(7),
              onTap: () => onSelect(days),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                decoration: BoxDecoration(
                  color: days == selectedDays
                      ? const Color(0xFF09090B)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(7),
                ),
                child: Text(
                  '$days d',
                  style: TextStyle(
                    color: days == selectedDays
                        ? const Color(0xFFF4F4F5)
                        : const Color(0xFFA1A1AA),
                    fontSize: 11,
                    fontWeight: days == selectedDays
                        ? FontWeight.w600
                        : FontWeight.normal,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ChartLegend extends StatelessWidget {
  const _ChartLegend({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 9,
          height: 9,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 11),
        ),
      ],
    );
  }
}


class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF450A0A).withValues(alpha: 0.4),
        border: Border.all(color: Colors.red.shade900),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            message,
            style: const TextStyle(color: Color(0xFFFCA5A5), fontSize: 13),
          ),
          TextButton(onPressed: onRetry, child: const Text('Tentar novamente')),
        ],
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child, this.padding = const EdgeInsets.all(18)});

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x12000000),
            blurRadius: 8,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: child,
    );
  }
}
