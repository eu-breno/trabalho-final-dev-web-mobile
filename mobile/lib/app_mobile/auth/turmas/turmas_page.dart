import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../dashboard/dashboard_drawer.dart';
import '../baralhos/baralhos_page.dart';
import '../estudo/estudo_page.dart';
import '../estatisticas/estatisticas_page.dart';

const _classrooms = [
  _Classroom(
    name: 'Biologia — 2º semestre',
    teacher: 'Prof.ª Mariana Costa',
    members: 28,
    decks: 4,
    initials: 'BC',
  ),
  _Classroom(
    name: 'Inglês intermediário',
    teacher: 'Prof. Daniel Martins',
    members: 16,
    decks: 6,
    initials: 'IN',
    hasUpdates: true,
  ),
  _Classroom(
    name: 'Programação Web',
    teacher: 'Prof. Rafael Lima',
    members: 32,
    decks: 3,
    initials: 'PW',
  ),
];

class TurmasPage extends StatelessWidget {
  const TurmasPage({
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
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      drawer: DashboardDrawer(
        accessToken: accessToken,
        client: client,
        userName: userName,
        userEmail: userEmail,
        selectedSection: 'Turmas',
        onTapStudy: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) =>
                  EstudoPage(accessToken: accessToken, client: client),
            ),
          );
        },
        onTapHome: () {
          Navigator.of(context).popUntil((route) => route.isFirst);
        },
        onTapDecks: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => BaralhosPage(
                accessToken: accessToken,
                client: client,
                userName: userName,
                userEmail: userEmail,
              ),
            ),
          );
        },
        onTapStatistics: () {
          Navigator.pop(context);
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => EstatisticasPage(
                accessToken: accessToken,
                client: client,
                userName: userName,
                userEmail: userEmail,
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
          'Turmas',
          style: TextStyle(
            color: Color(0xFFF4F4F5),
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            LayoutBuilder(
              builder: (context, constraints) {
                final compact = constraints.maxWidth < 420;
                final heading = const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'APRENDER EM GRUPO',
                      style: TextStyle(
                        color: Color(0xFFA1A1AA),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.8,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Minhas turmas',
                      style: TextStyle(
                        color: Color(0xFFF4F4F5),
                        fontSize: 28,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -0.5,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Acompanhe conteúdos e estude junto com sua turma.',
                      style: TextStyle(
                        color: Color(0xFFA1A1AA),
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                  ],
                );

                if (compact) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      heading,
                      const SizedBox(height: 16),
                      _JoinClassButton(
                        onPressed: () => _showJoinMessage(context),
                      ),
                    ],
                  );
                }

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(child: heading),
                    const SizedBox(width: 12),
                    _JoinClassButton(
                      onPressed: () => _showJoinMessage(context),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),
            LayoutBuilder(
              builder: (context, constraints) {
                final cardWidth = constraints.maxWidth < 640
                    ? constraints.maxWidth
                    : (constraints.maxWidth - 32) / 3;
                return Wrap(
                  spacing: 16,
                  runSpacing: 12,
                  children: [
                    _ClassStat(
                      width: cardWidth,
                      label: 'Turmas ativas',
                      value: '3',
                      icon: LucideIcons.users,
                    ),
                    _ClassStat(
                      width: cardWidth,
                      label: 'Baralhos compartilhados',
                      value: '13',
                      icon: LucideIcons.bookOpen,
                    ),
                    _ClassStat(
                      width: cardWidth,
                      label: 'Colegas estudando',
                      value: '76',
                      icon: LucideIcons.graduationCap,
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 28),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Turmas que você participa',
                        style: TextStyle(
                          color: Color(0xFFF4F4F5),
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Conteúdos recentes e atividade da turma.',
                        style: TextStyle(
                          color: Color(0xFFA1A1AA),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  '3 turmas',
                  style: TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 16),
            for (var index = 0; index < _classrooms.length; index++) ...[
              _ClassroomCard(classroom: _classrooms[index]),
              if (index < _classrooms.length - 1) const SizedBox(height: 16),
            ],
          ],
        ),
      ),
    );
  }

  void _showJoinMessage(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Entrar com código estará disponível em breve.'),
      ),
    );
  }
}

class _Classroom {
  const _Classroom({
    required this.name,
    required this.teacher,
    required this.members,
    required this.decks,
    required this.initials,
    this.hasUpdates = false,
  });

  final String name;
  final String teacher;
  final int members;
  final int decks;
  final String initials;
  final bool hasUpdates;
}

class _ClassStat extends StatelessWidget {
  const _ClassStat({
    required this.width,
    required this.label,
    required this.value,
    required this.icon,
  });

  final double width;
  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFF27272A),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFFF4F4F5), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    color: Color(0xFFF4F4F5),
                    fontSize: 22,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  label,
                  style: const TextStyle(
                    color: Color(0xFFA1A1AA),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ClassroomCard extends StatelessWidget {
  const _ClassroomCard({required this.classroom});

  final _Classroom classroom;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  classroom.initials,
                  style: const TextStyle(
                    color: Color(0xFFF4F4F5),
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF27272A),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  classroom.hasUpdates ? '2 novidades' : 'Em dia',
                  style: const TextStyle(
                    color: Color(0xFFA1A1AA),
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            classroom.name,
            style: const TextStyle(
              color: Color(0xFFF4F4F5),
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            classroom.teacher,
            style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 14),
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: Color(0xFF3F3F46)),
          const SizedBox(height: 14),
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: [
              _ClassroomDetail(
                icon: LucideIcons.users,
                label: '${classroom.members} participantes',
              ),
              _ClassroomDetail(
                icon: LucideIcons.bookOpen,
                label: '${classroom.decks} baralhos',
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextButton.icon(
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Os materiais da turma estarão disponíveis em breve.',
                ),
              ),
            ),
            style: TextButton.styleFrom(
              foregroundColor: const Color(0xFFF4F4F5),
              padding: EdgeInsets.zero,
              alignment: Alignment.centerLeft,
            ),
            iconAlignment: IconAlignment.end,
            icon: const Icon(LucideIcons.arrowUpRight, size: 16),
            label: const Text(
              'Ver materiais',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _ClassroomDetail extends StatelessWidget {
  const _ClassroomDetail({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: const Color(0xFFA1A1AA), size: 16),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(color: Color(0xFFA1A1AA), fontSize: 12),
        ),
      ],
    );
  }
}

class _JoinClassButton extends StatelessWidget {
  const _JoinClassButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: const Color(0xFFF4F4F5),
        side: const BorderSide(color: Color(0xFF3F3F46)),
        backgroundColor: const Color(0xFF18181B),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      icon: const Icon(Icons.add, size: 18),
      label: const Text(
        'Entrar com código',
        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
      ),
    );
  }
}
