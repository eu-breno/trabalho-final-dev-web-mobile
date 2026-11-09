import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'dashboard_models.dart';

class DashboardFocusCard extends StatelessWidget {
  const DashboardFocusCard({
    super.key,
    required this.pendingCards,
    this.onStartStudy,
  });

  final int? pendingCards;
  final VoidCallback? onStartStudy;

  @override
  Widget build(BuildContext context) {
    final pendingText = pendingCards?.toString() ?? '—';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF27272A),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.sparkles, color: Color(0xFFA1A1AA), size: 14),
                SizedBox(width: 6),
                Text(
                  'Seu momento de foco',
                  style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Hora de manter o ritmo',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Você tem $pendingText cartões esperando pela revisão de hoje. '
            'Revisões curtas ajudam a guardar o conteúdo por mais tempo.',
            style: const TextStyle(
              color: Color(0xFFA1A1AA),
              fontSize: 14,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: onStartStudy,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF4F4F5),
              foregroundColor: const Color(0xFF09090B),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            icon: const Icon(LucideIcons.arrowRight, size: 16),
            label: const Text(
              'Começar revisão',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class DashboardStatsGrid extends StatelessWidget {
  const DashboardStatsGrid({super.key, required this.stats});

  final DashboardStats? stats;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        _InfoCard(
          'Baralhos',
          stats?.totalDecks,
          'Na sua biblioteca',
          LucideIcons.bookOpenCheck,
        ),
        _InfoCard(
          'Cartões',
          stats?.totalCards,
          'Em todos os baralhos',
          LucideIcons.bookOpenCheck,
        ),
        _InfoCard(
          'Revisões',
          stats?.reviews,
          'Desde o início',
          LucideIcons.timer,
        ),
        _InfoCard(
          'Sequência atual',
          stats?.streak,
          'Dias estudando',
          LucideIcons.flame,
        ),
      ],
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard(this.title, this.value, this.subtitle, this.icon);

  final String title;
  final int? value;
  final String subtitle;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 13),
              ),
              Icon(icon, color: const Color(0xFFA1A1AA), size: 18),
            ],
          ),
          Text(
            value?.toString() ?? '—',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(color: Color(0xFF71717A), fontSize: 11),
          ),
        ],
      ),
    );
  }
}

class DashboardWeeklyActivity extends StatelessWidget {
  const DashboardWeeklyActivity({
    super.key,
    required this.activity,
    required this.isLoading,
  });

  final List<DailyActivity>? activity;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final days = activity ?? const <DailyActivity>[];
    final maximum = days.fold<int>(
      1,
      (current, day) => day.total > current ? day.total : current,
    );

    return _DashboardPanel(
      title: 'Seu ritmo de estudos',
      subtitle: 'Cartões revisados nesta semana',
      child: SizedBox(
        height: 116,
        child: days.isEmpty
            ? Center(
                child: Text(
                  isLoading
                      ? 'Carregando atividade...'
                      : 'Atividade indisponível.',
                  style: const TextStyle(color: Color(0xFFA1A1AA)),
                ),
              )
            : Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: days
                    .map((day) => _ActivityBar(day, maximum))
                    .toList(),
              ),
      ),
    );
  }
}

class _ActivityBar extends StatelessWidget {
  const _ActivityBar(this.day, this.maximum);

  final DailyActivity day;
  final int maximum;

  @override
  Widget build(BuildContext context) {
    final barHeight = day.total == 0 ? 4.0 : 72 * day.total / maximum;
    return Expanded(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            day.total.toString(),
            style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 10),
          ),
          const SizedBox(height: 6),
          Container(
            height: barHeight,
            width: 20,
            decoration: BoxDecoration(
              color: day.total > 0
                  ? const Color(0xFFF4F4F5)
                  : const Color(0xFF3F3F46),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(6),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            day.day,
            style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 10),
          ),
        ],
      ),
    );
  }
}

class DashboardDecks extends StatelessWidget {
  const DashboardDecks({
    super.key,
    required this.decks,
    required this.isLoading,
  });

  final List<DashboardDeck>? decks;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final items = decks ?? const <DashboardDeck>[];
    return _DashboardPanel(
      title: 'Continue estudando',
      subtitle: 'Seus baralhos',
      child: decks == null
          ? Text(
              isLoading ? 'Carregando baralhos...' : 'Baralhos indisponíveis.',
              style: const TextStyle(color: Color(0xFFA1A1AA)),
            )
          : items.isEmpty
          ? const Text(
              'Você ainda não tem baralhos.',
              style: TextStyle(color: Color(0xFFA1A1AA)),
            )
          : Column(children: items.take(3).map(_DeckRow.new).toList()),
    );
  }
}

class _DeckRow extends StatelessWidget {
  const _DeckRow(this.deck);

  final DashboardDeck deck;

  @override
  Widget build(BuildContext context) {
    final cardLabel = deck.totalCards == 1 ? 'cartão' : 'cartões';
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFF27272A)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const Icon(LucideIcons.bookOpenCheck, color: Color(0xFFA1A1AA)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    deck.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Color(0xFFF4F4F5),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '${deck.totalCards} $cardLabel · '
                    '${deck.pendingCards} para revisar',
                    style: const TextStyle(
                      color: Color(0xFFA1A1AA),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardPanel extends StatelessWidget {
  const _DashboardPanel({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFFF4F4F5),
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
          ),
          const SizedBox(height: 20),
          child,
        ],
      ),
    );
  }
}
